import { db } from "@/lib/db";
import {
  findmeSearchAlbum,
  findmeSearchSession,
} from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export type FindmeSearchSessionRow =
  typeof findmeSearchSession.$inferSelect;

export type FindmeAlbumMetadata = {
  faceTokens: string[];
  compression?: {
    status?: string;
    usedOriginal?: boolean;
    sizeKB?: number;
  };
  source?: {
    type?: string;
    fileUrl?: string;
    previewUrl?: string;
  };
};

export type CachedAlbumEntry = {
  id: string;
  photoIndex: number;
  filename: string;
  contentType: string;
  metadata: FindmeAlbumMetadata;
};

export type FindmeCacheContext = {
  sessionCount: number;
  readySession?: FindmeSearchSessionRow;
};

export async function getFindmeCacheContext(
  shareKey: string
): Promise<FindmeCacheContext> {
  const [countRow] = await db
    .select({ value: sql<number>`count(*)` })
    .from(findmeSearchSession)
    .where(eq(findmeSearchSession.shareKey, shareKey));

  const [readySession] = await db
    .select()
    .from(findmeSearchSession)
    .where(
      and(
        eq(findmeSearchSession.shareKey, shareKey),
        eq(findmeSearchSession.cacheStatus, "ready")
      )
    )
    .orderBy(desc(findmeSearchSession.createdAt))
    .limit(1);

  return {
    sessionCount: countRow?.value ?? 0,
    readySession,
  };
}

export async function getCachedAlbumEntries(
  sessionId: string
): Promise<CachedAlbumEntry[]> {
  const rows = await db
    .select({
      id: findmeSearchAlbum.id,
      photoIndex: findmeSearchAlbum.photoIndex,
      filename: findmeSearchAlbum.filename,
      contentType: findmeSearchAlbum.contentType,
      metadata: findmeSearchAlbum.metadata,
    })
    .from(findmeSearchAlbum)
    .where(eq(findmeSearchAlbum.sessionId, sessionId))
    .orderBy(findmeSearchAlbum.photoIndex);

  return rows.map((row) => ({
    id: row.id,
    photoIndex: row.photoIndex,
    filename: row.filename,
    contentType: row.contentType,
    metadata: parseAlbumMetadata(row.metadata),
  }));
}

export function parseAlbumMetadata(
  rawMetadata: string | null
): FindmeAlbumMetadata {
  if (!rawMetadata) {
    return { faceTokens: [] };
  }

  try {
    const parsed = JSON.parse(rawMetadata);
    if (Array.isArray(parsed?.faceTokens)) {
      return parsed as FindmeAlbumMetadata;
    }
    return { ...parsed, faceTokens: [] };
  } catch {
    return { faceTokens: [] };
  }
}
