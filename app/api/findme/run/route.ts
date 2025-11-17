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

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ADD_FACE_CHUNK_SIZE = 5;

type MatchSummary = {
  photoIndex: number;
  filename: string;
  confidence: number;
  tokenCount: number;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let sessionRecordId: string | null = null;

  try {
    const formData = await req.formData();
    const selfie = formData.get("selfie");
    const albumEntries = formData
      .getAll("album")
      .filter((item): item is File => item instanceof File);
    const useLocalAlbum = formData.get("useLocalAlbum") === "true";
    const eventUrl = formData.get("eventUrl")?.toString() ?? "";
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.session?.userId ?? null;

    if (!(selfie instanceof File)) {
      return errorResponse("请上传自拍照片");
    }

    if (!useLocalAlbum) {
      return errorResponse("URL 爬取模块尚未准备好，目前仅支持本地相册上传");
    }

    if (!albumEntries.length) {
      return errorResponse("请至少上传一张相册照片");
    }

    const oversized = albumEntries.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      return errorResponse(
        `相册照片 ${oversized.name || ""} 超过 2MB，请先压缩后再上传`
      );
    }

    if (selfie.size > MAX_FILE_SIZE_BYTES) {
      return errorResponse("自拍超过 2MB，请先压缩后再上传");
    }

    const client = new FacePPClient();

    const albumFiles: { filename: string; contentType: string }[] = [];
    const faceToPhotoIndex = new Map<string, number>();
    const allFaceTokens: string[] = [];
    sessionRecordId = randomUUID();

    await db.insert(findmeSearchSession).values({
      id: sessionRecordId,
      userId: userId ?? undefined,
      eventUrl,
      status: "processing",
      albumCount: albumEntries.length,
      metadata: JSON.stringify({
        useLocalAlbum,
        clientEventUrl: eventUrl,
        selfieName: selfie.name,
      }),
    });

    for (let i = 0; i < albumEntries.length; i++) {
      const file = albumEntries[i];
      const filename = file.name || `album-${i + 1}.jpg`;
      const contentType = file.type || "image/jpeg";
      const detectResponse = await client.detectByFile(file);
      const faceTokens = detectResponse.faces.map((face) => face.face_token);

      detectResponse.faces.forEach((face) => {
        faceToPhotoIndex.set(face.face_token, i);
        allFaceTokens.push(face.face_token);
      });

      albumFiles.push({ filename, contentType });

      await db.insert(findmeSearchAlbum).values({
        id: randomUUID(),
        sessionId: sessionRecordId,
        photoIndex: i,
        filename,
        contentType,
        sizeBytes: file.size,
        faceCount: detectResponse.faces.length,
        metadata: JSON.stringify({ faceTokens }),
      });
    }

    if (!allFaceTokens.length) {
      return errorResponse("相册中没有检测到任何人脸，请使用更清晰的照片");
    }

    const selfieDetect = await client.detectByFile(selfie);
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

    const searchResponse = await client.searchByFaceToken(outerId, selfieToken);
    const photoMatches = new Map<number, MatchSummary>();

    for (const result of searchResponse.results ?? []) {
      const photoIndex = faceToPhotoIndex.get(result.face_token);
      if (photoIndex === undefined) {
        continue;
      }

      const existing = photoMatches.get(photoIndex);
      if (!existing) {
        photoMatches.set(photoIndex, {
          photoIndex,
          filename: albumFiles[photoIndex]?.filename ?? `match-${photoIndex + 1}.jpg`,
          confidence: result.confidence,
          tokenCount: 1,
        });
      } else {
        existing.confidence = Math.max(existing.confidence, result.confidence);
        existing.tokenCount += 1;
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
