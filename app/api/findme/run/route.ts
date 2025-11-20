import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  findmeSearchAlbum,
  findmeSearchMatch,
  findmeSearchSession,
} from "@/lib/db/schema";
import { FacePPClient, type FacePPDetectResponse } from "@/lib/facepp";
import {
  fetchPixcheeseAlbumFiles,
  PixcheeseError,
  type PixcheeseAlbumFetchResult,
  extractPixcheeseShareKey,
} from "@/lib/pixcheese/server";
import {
  getCachedAlbumEntries,
  getFindmeCacheContext,
  type CachedAlbumEntry,
} from "@/features/findme/server/cache-service";
import {
  prepareFileForFacePP,
  type PreparedImageForFacePP,
} from "@/lib/findme/photo-compression";
import { mapWithConcurrency } from "@/lib/utils/concurrency";
import { SlidingWindowRateLimiter } from "@/lib/utils/rate-limiter";

const ADD_FACE_CHUNK_SIZE = 5;
const SEARCH_RETURN_COUNT = 5;
const FACESET_TOKEN_LIMIT = Math.max(
  50,
  Number(process.env.FINDME_FACESET_TOKEN_LIMIT ?? 4000)
);
const DETECT_CONCURRENCY = Math.max(
  1,
  Number(process.env.FINDME_DETECT_CONCURRENCY ?? 4)
);
const DETECT_RPS = Math.max(
  1,
  Number(process.env.FINDME_DETECT_REQUESTS_PER_SECOND ?? 4)
);
const DETECT_MAX_RETRIES = Math.max(
  1,
  Number(process.env.FINDME_DETECT_MAX_RETRIES ?? 3)
);
const DETECT_RETRY_DELAY_MS = Math.max(
  250,
  Number(process.env.FINDME_DETECT_RETRY_DELAY_MS ?? 1000)
);
const FACEPP_CONCURRENCY_ERROR = "CONCURRENCY_LIMIT_EXCEEDED";

type AlbumSource = {
  id: string;
  file: File;
  filename: string;
  contentType: string;
  previewUrl?: string;
  sourceUrl?: string;
};

type AlbumFileInfo = {
  filename: string;
  contentType: string;
  previewUrl?: string;
  sourceUrl?: string;
};

type FaceSetInfo = {
  outerId: string;
  tokenStartIndex: number;
  tokenCount: number;
};

type SessionCacheMetadata = {
  cache?: {
    facesets?: FaceSetInfo[];
    faceTokenCount?: number;
    preparedAt?: string;
    shareKey?: string;
    version?: number;
  };
  remoteSource?: Record<string, unknown>;
};

type DetectionResult = {
  photoIndex: number;
  original: AlbumSource;
  prepared: PreparedImageForFacePP;
  faceTokens: string[];
  faceCount: number;
};

type MatchSummary = {
  photoIndex: number;
  filename: string;
  confidence: number;
  tokenCount: number;
  previewUrl?: string;
  sourceUrl?: string;
};

type CacheStatus = "none" | "building" | "ready" | "reuse";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let sessionRecordId: string | null = null;
  let sessionCacheStatus: CacheStatus = "none";

  try {
    const formData = await req.formData();
    const selfie = formData.get("selfie");
    const useLocalAlbum = formData.get("useLocalAlbum") === "true";
    const eventUrl = formData.get("eventUrl")?.toString() ?? "";
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.session?.userId ?? null;
    const uploadedAlbumEntries = formData
      .getAll("album")
      .filter((item): item is File => item instanceof File);

    if (!(selfie instanceof File)) {
      return errorResponse("请上传自拍照片");
    }

    let shareKey =
      !useLocalAlbum && eventUrl
        ? extractPixcheeseShareKey(eventUrl)
        : null;

    let cachedAlbums: CachedAlbumEntry[] = [];
    let cacheContext = shareKey ? await getFindmeCacheContext(shareKey) : null;
    const readyCacheSession = cacheContext?.readySession;
    const readySessionMetadata =
      readyCacheSession?.metadata
        ? parseSessionMetadata(readyCacheSession.metadata)
        : null;

    if (!useLocalAlbum && readyCacheSession) {
      cachedAlbums = await getCachedAlbumEntries(readyCacheSession.id);
      if (!cachedAlbums.length) {
        cachedAlbums = [];
      }
    }

    let shouldUseCache =
      !useLocalAlbum &&
      !!readyCacheSession &&
      cachedAlbums.length > 0;
    let shouldBuildCache =
      !useLocalAlbum &&
      !shouldUseCache &&
      (cacheContext?.sessionCount ?? 0) >= 1;

    let remoteAlbum: PixcheeseAlbumFetchResult | null = null;
    let albumSources: AlbumSource[] = [];

    if (useLocalAlbum) {
      albumSources = uploadedAlbumEntries.map((file, index) => ({
        id: `local-${index}`,
        file,
        filename: file.name || `album-${index + 1}.jpg`,
        contentType: file.type || "image/jpeg",
      }));

      if (!albumSources.length) {
        return errorResponse("请至少上传一张相册照片");
      }
    } else if (!shouldUseCache) {
      if (!eventUrl) {
        return errorResponse("请输入 Pixcheese 相册链接");
      }

      try {
        remoteAlbum = await fetchPixcheeseAlbumFiles({
          shareUrl: eventUrl,
        });
      } catch (error) {
        const message =
          error instanceof PixcheeseError ? error.message : "相册链接解析失败";
        return errorResponse(message);
      }

      shareKey = remoteAlbum.shareKey;
      if (shareKey) {
        cacheContext = await getFindmeCacheContext(shareKey);
        shouldBuildCache =
          !shouldUseCache &&
          (cacheContext?.sessionCount ?? 0) >= 1;
      }

      albumSources = remoteAlbum.photos.map((photo, index) => ({
        id: photo.id || `remote-${index}`,
        file: photo.file,
        filename: photo.filename || `album-${index + 1}.jpg`,
        contentType: photo.contentType || "image/jpeg",
        previewUrl: photo.previewUrl,
        sourceUrl: photo.fileUrl,
      }));
    }

    const albumCount = shouldUseCache
      ? cachedAlbums.length
      : albumSources.length;

    if (!albumCount) {
      return errorResponse("未获取到任何相册照片");
    }

    sessionCacheStatus = shouldUseCache
      ? "reuse"
      : shouldBuildCache
        ? "building"
        : "none";

    const sessionMetadata: Record<string, unknown> = {
      useLocalAlbum,
      clientEventUrl: eventUrl,
      selfieName: selfie.name,
    };

    if (remoteAlbum) {
      sessionMetadata.remoteSource = {
        type: "pixcheese",
        shareKey: remoteAlbum.shareKey,
        projectId: remoteAlbum.projectId,
        photoCount: remoteAlbum.photos.length,
      };
    } else if (shouldUseCache && readySessionMetadata?.remoteSource) {
      sessionMetadata.remoteSource = readySessionMetadata.remoteSource;
    }

    sessionRecordId = randomUUID();
    await db.insert(findmeSearchSession).values({
      id: sessionRecordId,
      userId: userId ?? undefined,
      eventUrl,
      shareKey: shareKey ?? undefined,
      status: "processing",
      cacheStatus: sessionCacheStatus,
      albumCount,
      metadata: JSON.stringify(sessionMetadata),
    });

    const client = new FacePPClient();
    const albumFiles: AlbumFileInfo[] = Array.from({ length: albumCount });
    const faceToPhotoIndex = new Map<string, number>();
    const allFaceTokens: string[] = [];
    const preparedSelfie = await prepareFileForFacePP(selfie);

    const detectRateLimiter = new SlidingWindowRateLimiter(DETECT_RPS, 1000);

    if (shouldUseCache && cachedAlbums.length) {
      cachedAlbums.forEach((album) => {
        const metadata = album.metadata;
        const faceTokens = metadata.faceTokens ?? [];

        faceTokens.forEach((token) => {
          faceToPhotoIndex.set(token, album.photoIndex);
        });
        allFaceTokens.push(...faceTokens);

        albumFiles[album.photoIndex] = {
          filename: album.filename,
          contentType: album.contentType,
          previewUrl: metadata.source?.previewUrl,
          sourceUrl: metadata.source?.fileUrl,
        };
      });
    } else {
      const preparedAlbums = await Promise.all(
        albumSources.map(async (item) => ({
          original: item,
          prepared: await prepareFileForFacePP(item.file),
        }))
      );

      const detectionResults = await mapWithConcurrency(
        preparedAlbums,
        DETECT_CONCURRENCY,
        async (entry, index) => {
          const detectResponse = await detectWithRateLimit(
            client,
            entry.prepared.file,
            detectRateLimiter
          );
          const faceTokens = detectResponse.faces.map(
            (face) => face.face_token
          );
          return {
            photoIndex: index,
            original: entry.original,
            prepared: entry.prepared,
            faceTokens,
            faceCount: detectResponse.faces.length,
          } satisfies DetectionResult;
        }
      );

      for (const result of detectionResults) {
        result.faceTokens.forEach((token) => {
          faceToPhotoIndex.set(token, result.photoIndex);
        });
        allFaceTokens.push(...result.faceTokens);

        albumFiles[result.photoIndex] = {
          filename:
            result.original.filename || `album-${result.photoIndex + 1}.jpg`,
          contentType:
            result.prepared.file.type || result.original.contentType || "image/jpeg",
          previewUrl: result.original.previewUrl,
          sourceUrl: result.original.sourceUrl,
        };

        await db.insert(findmeSearchAlbum).values({
          id: randomUUID(),
          sessionId: sessionRecordId,
          photoIndex: result.photoIndex,
          filename: albumFiles[result.photoIndex]!.filename,
          contentType: albumFiles[result.photoIndex]!.contentType,
          sizeBytes: Math.round(result.prepared.sizeCompressedKB * 1024),
          faceCount: result.faceCount,
          metadata: JSON.stringify({
            faceTokens: result.faceTokens,
            compression: {
              status: result.prepared.status,
              usedOriginal: result.prepared.usedOriginal,
              sizeKB: result.prepared.sizeCompressedKB,
            },
            source: result.original.sourceUrl
              ? {
                  type: "pixcheese",
                  fileUrl: result.original.sourceUrl,
                  previewUrl: result.original.previewUrl,
                }
              : undefined,
          }),
        });
      }
    }

    if (!allFaceTokens.length) {
      return errorResponse("相册中没有检测到任何人脸，请使用更清晰的照片");
    }

    let faceSets: FaceSetInfo[] = [];

    if (shouldUseCache && readyCacheSession) {
      const readyMetadata = readySessionMetadata ?? {};
      faceSets = readyMetadata.cache?.facesets ?? [];
      if (!faceSets.length) {
        faceSets = await createFaceSets(client, allFaceTokens);
        if (faceSets.length) {
          const updatedMetadata = {
            ...readyMetadata,
            cache: {
              ...(readyMetadata.cache ?? {}),
              facesets: faceSets,
              faceTokenCount:
                readyMetadata.cache?.faceTokenCount ?? allFaceTokens.length,
              preparedAt: new Date().toISOString(),
              shareKey: shareKey ?? readyMetadata.cache?.shareKey,
            },
          };

          await db
            .update(findmeSearchSession)
            .set({
              cacheStatus: "ready",
              outerId: faceSets[0]?.outerId,
              metadata: JSON.stringify(updatedMetadata),
            })
            .where(eq(findmeSearchSession.id, readyCacheSession.id));
        }
      }
      sessionMetadata.cacheReuse = {
        sourceSessionId: readyCacheSession.id,
        shareKey,
      };
    } else {
      faceSets = await createFaceSets(client, allFaceTokens);
    }

    if (!faceSets.length) {
      return errorResponse("未能创建人脸集合，请稍后再试");
    }

    const selfieDetect = await client.detectByFile(preparedSelfie.file);
    if (!selfieDetect.faces.length) {
      return errorResponse("自拍中未检测到人脸，请重新上传");
    }

    const selfieToken = selfieDetect.faces[0]?.face_token;
    if (!selfieToken) {
      return errorResponse("未能解析自拍的人脸信息");
    }

    const searchResponses = await Promise.all(
      faceSets.map((set) =>
        client.searchByFaceToken(set.outerId, selfieToken, SEARCH_RETURN_COUNT)
      )
    );

    const referenceThresholds = searchResponses[0]?.thresholds;
    const confidenceThreshold = referenceThresholds?.["1e-4"] ?? 70;
    const photoMatches = new Map<number, MatchSummary>();

    for (const response of searchResponses) {
      for (const result of response.results ?? []) {
        if (result.confidence < confidenceThreshold) {
          continue;
        }

        const photoIndex = faceToPhotoIndex.get(result.face_token);
        if (photoIndex === undefined) {
          continue;
        }

        const albumMeta = albumFiles[photoIndex];
        const existing = photoMatches.get(photoIndex);
        if (!existing) {
          photoMatches.set(photoIndex, {
            photoIndex,
            filename: albumMeta?.filename ?? `match-${photoIndex + 1}.jpg`,
            confidence: result.confidence,
            tokenCount: 1,
            previewUrl: albumMeta?.previewUrl,
            sourceUrl: albumMeta?.sourceUrl,
          });
        } else {
          existing.confidence = Math.max(existing.confidence, result.confidence);
          existing.tokenCount += 1;
          if (!existing.previewUrl && albumMeta?.previewUrl) {
            existing.previewUrl = albumMeta.previewUrl;
          }
          if (!existing.sourceUrl && albumMeta?.sourceUrl) {
            existing.sourceUrl = albumMeta.sourceUrl;
          }
        }
      }
    }

    const matches = Array.from(photoMatches.values()).sort(
      (a, b) => b.confidence - a.confidence
    );

    const matchRecords = matches.map((match, index) => ({
      id: randomUUID(),
      sessionId: sessionRecordId!,
      albumPhotoIndex: match.photoIndex,
      filename: match.filename,
      confidence: match.confidence,
      tokenCount: match.tokenCount,
      rank: index + 1,
    }));

    if (matchRecords.length) {
      await db.insert(findmeSearchMatch).values(matchRecords);
    }

    if (shouldBuildCache) {
      sessionCacheStatus = "ready";
      sessionMetadata.cache = {
        shareKey,
        version: 1,
        faceTokenCount: allFaceTokens.length,
        preparedAt: new Date().toISOString(),
        facesets: faceSets,
      };
    }

    await db
      .update(findmeSearchSession)
      .set({
        status: "completed",
        outerId: faceSets[0]?.outerId,
        matchCount: matches.length,
        cacheStatus: sessionCacheStatus,
        metadata: JSON.stringify(sessionMetadata),
        updatedAt: new Date(),
      })
      .where(eq(findmeSearchSession.id, sessionRecordId));

    return NextResponse.json({
      sessionId: sessionRecordId,
      outerId: faceSets[0]?.outerId,
      matches,
      eventUrl,
      cacheStatus: sessionCacheStatus,
    });
  } catch (error) {
    console.error("[findme][run] error", error);
    if (sessionRecordId) {
      await db
        .update(findmeSearchSession)
        .set({
          status: "failed",
          cacheStatus: sessionCacheStatus === "building" ? "none" : sessionCacheStatus,
          error: error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        })
        .where(eq(findmeSearchSession.id, sessionRecordId));
    }
    return errorResponse(
      error instanceof Error ? error.message : "处理失败，请稍后再试",
      500
    );
  }
}

async function detectWithRateLimit(
  client: FacePPClient,
  file: File,
  rateLimiter: SlidingWindowRateLimiter,
  attempt = 0
): Promise<FacePPDetectResponse> {
  await rateLimiter.acquire();
  try {
    return await client.detectByFile(file);
  } catch (error) {
    if (isConcurrencyLimitError(error) && attempt + 1 < DETECT_MAX_RETRIES) {
      const backoffMs = DETECT_RETRY_DELAY_MS * (attempt + 1);
      await sleep(backoffMs);
      return detectWithRateLimit(client, file, rateLimiter, attempt + 1);
    }
    throw error;
  }
}

function isConcurrencyLimitError(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : null;

  if (!message) {
    return false;
  }

  if (message.includes(FACEPP_CONCURRENCY_ERROR)) {
    return true;
  }

  try {
    const parsed = JSON.parse(message) as { error_message?: string };
    return parsed?.error_message === FACEPP_CONCURRENCY_ERROR;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function parseSessionMetadata(raw: string | null): SessionCacheMetadata {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as SessionCacheMetadata;
  } catch {
    return {};
  }
}

function chunkFaceTokens(tokens: string[]): Array<{
  tokenStartIndex: number;
  tokens: string[];
}> {
  const chunks: Array<{ tokenStartIndex: number; tokens: string[] }> = [];

  for (let start = 0; start < tokens.length; start += FACESET_TOKEN_LIMIT) {
    chunks.push({
      tokenStartIndex: start,
      tokens: tokens.slice(start, start + FACESET_TOKEN_LIMIT),
    });
  }

  return chunks;
}

async function createFaceSets(
  client: FacePPClient,
  tokens: string[]
): Promise<FaceSetInfo[]> {
  if (!tokens.length) {
    return [];
  }

  const chunks = chunkFaceTokens(tokens);
  const faceSets = await Promise.all(
    chunks.map(async ({ tokenStartIndex, tokens: chunkTokens }) => {
      const outerId = `findme_${randomUUID()}`;
      await client.createFaceSet(outerId, chunkTokens[0]!);

      const remaining = chunkTokens.slice(1);
      for (let i = 0; i < remaining.length; i += ADD_FACE_CHUNK_SIZE) {
        const slice = remaining.slice(i, i + ADD_FACE_CHUNK_SIZE);
        if (slice.length) {
          await client.addFaces(outerId, slice);
        }
      }

      return {
        outerId,
        tokenStartIndex,
        tokenCount: chunkTokens.length,
      } satisfies FaceSetInfo;
    })
  );

  return faceSets;
}
