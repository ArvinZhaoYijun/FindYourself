import { NextRequest, NextResponse } from "next/server";
import { FacePPClient } from "@/lib/facepp";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  findmeSearchAlbum,
  findmeSearchMatch,
  findmeSearchSession,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { prepareFileForFacePP } from "@/lib/findme/photo-compression";
import {
  fetchPixcheeseAlbumFiles,
  PixcheeseError,
  type PixcheeseAlbumFetchResult,
} from "@/lib/pixcheese/server";
const ADD_FACE_CHUNK_SIZE = 5;

type MatchSummary = {
  photoIndex: number;
  filename: string;
  confidence: number;
  tokenCount: number;
  previewUrl?: string;
  sourceUrl?: string;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let sessionRecordId: string | null = null;

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

    type AlbumSource = {
      id: string;
      file: File;
      filename: string;
      contentType: string;
      previewUrl?: string;
      sourceUrl?: string;
    };

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
    } else {
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

      albumSources = remoteAlbum.photos.map((photo, index) => ({
        id: photo.id || `remote-${index}`,
        file: photo.file,
        filename: photo.filename || `album-${index + 1}.jpg`,
        contentType: photo.contentType || "image/jpeg",
        previewUrl: photo.previewUrl,
        sourceUrl: photo.fileUrl,
      }));
    }

    if (!albumSources.length) {
      return errorResponse("未获取到任何相册照片");
    }

    const client = new FacePPClient();

    const albumFiles: {
      filename: string;
      contentType: string;
      previewUrl?: string;
      sourceUrl?: string;
    }[] = [];
    const faceToPhotoIndex = new Map<string, number>();
    const allFaceTokens: string[] = [];
    sessionRecordId = randomUUID();

    const preparedSelfie = await prepareFileForFacePP(selfie);
    const preparedAlbums = await Promise.all(
      albumSources.map(async (item) => ({
        original: item,
        prepared: await prepareFileForFacePP(item.file),
      }))
    );

    await db.insert(findmeSearchSession).values({
      id: sessionRecordId,
      userId: userId ?? undefined,
      eventUrl,
      status: "processing",
      albumCount: albumSources.length,
      metadata: JSON.stringify({
        useLocalAlbum,
        clientEventUrl: eventUrl,
        selfieName: selfie.name,
        remoteSource: remoteAlbum
          ? {
              type: "pixcheese",
              shareKey: remoteAlbum.shareKey,
              projectId: remoteAlbum.projectId,
              photoCount: remoteAlbum.photos.length,
            }
          : undefined,
      }),
    });

    for (let i = 0; i < albumSources.length; i++) {
      const { original, prepared } = preparedAlbums[i];
      const filename = original.filename || `album-${i + 1}.jpg`;
      const contentType = prepared.file.type || original.contentType || "image/jpeg";
      const detectResponse = await client.detectByFile(prepared.file);
      const faceTokens = detectResponse.faces.map((face) => face.face_token);

      detectResponse.faces.forEach((face) => {
        faceToPhotoIndex.set(face.face_token, i);
        allFaceTokens.push(face.face_token);
      });

      albumFiles.push({
        filename,
        contentType,
        previewUrl: original.previewUrl,
        sourceUrl: original.sourceUrl,
      });

      await db.insert(findmeSearchAlbum).values({
        id: randomUUID(),
        sessionId: sessionRecordId,
        photoIndex: i,
        filename,
        contentType,
        sizeBytes: Math.round(prepared.sizeCompressedKB * 1024),
        faceCount: detectResponse.faces.length,
        metadata: JSON.stringify({
          faceTokens,
          compression: {
            status: prepared.status,
            usedOriginal: prepared.usedOriginal,
            sizeKB: prepared.sizeCompressedKB,
          },
          source: original.sourceUrl
            ? {
                type: "pixcheese",
                fileUrl: original.sourceUrl,
                previewUrl: original.previewUrl,
              }
            : undefined,
        }),
      });
    }

    if (!allFaceTokens.length) {
      return errorResponse("相册中没有检测到任何人脸，请使用更清晰的照片");
    }

    const selfieDetect = await client.detectByFile(preparedSelfie.file);
    if (!selfieDetect.faces.length) {
      return errorResponse("自拍中未检测到人脸，请重新上传");
    }

    const selfieToken = selfieDetect.faces[0]?.face_token;
    if (!selfieToken) {
      return errorResponse("未能解析自拍的人脸信息");
    }

    const outerId = `findme_${randomUUID()}`;

    await client.createFaceSet(outerId, allFaceTokens[0]!);

    const remainingTokens = allFaceTokens.slice(1);
    for (let i = 0; i < remainingTokens.length; i += ADD_FACE_CHUNK_SIZE) {
      const chunk = remainingTokens.slice(i, i + ADD_FACE_CHUNK_SIZE);
      if (chunk.length) {
        await client.addFaces(outerId, chunk);
      }
    }

    const searchResponse = await client.searchByFaceToken(outerId, selfieToken, 5);
    const photoMatches = new Map<number, MatchSummary>();

    // 使用 Face++ 推荐的万分之一误报率阈值
    const confidenceThreshold = searchResponse.thresholds?.["1e-4"] ?? 70;

    for (const result of searchResponse.results ?? []) {
      // 过滤低置信度结果
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

    await db
      .update(findmeSearchSession)
      .set({
        status: "completed",
        outerId,
        matchCount: matches.length,
        updatedAt: new Date(),
      })
      .where(eq(findmeSearchSession.id, sessionRecordId));

    return NextResponse.json({
      sessionId: sessionRecordId,
      outerId,
      matches,
      eventUrl,
    });
  } catch (error) {
    console.error("[findme][run] error", error);
    if (sessionRecordId) {
      await db
        .update(findmeSearchSession)
        .set({
          status: "failed",
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
