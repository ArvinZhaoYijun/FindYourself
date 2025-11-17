"use server";

import { db } from "@/lib/db";
import { photoRecord } from "@/lib/db/schema";
import type { PhotoRecord, PhotoRecordInsert } from "@/lib/findme/photo-types";

function toDbRecord(record: PhotoRecordInsert) {
  const now = new Date();
  return {
    id: record.id,
    userId: record.userId,
    originalPath: record.originalPath,
    compressedPath: record.compressedPath,
    sizeOriginalKB: record.sizeOriginalKB,
    sizeCompressedKB: record.sizeCompressedKB ?? null,
    width: record.width ?? null,
    height: record.height ?? null,
    status: record.status,
    facesetOuterId: record.facesetOuterId ?? null,
    faceTokens: record.faceTokens ?? [],
    errorMessage: record.errorMessage ?? null,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}

function toPhotoRecord(row: typeof photoRecord.$inferSelect): PhotoRecord {
  return {
    id: row.id,
    userId: row.userId,
    originalPath: row.originalPath,
    compressedPath: row.compressedPath,
    sizeOriginalKB: row.sizeOriginalKB,
    sizeCompressedKB: row.sizeCompressedKB,
    width: row.width,
    height: row.height,
    status: row.status as PhotoRecord["status"],
    faceTokens: row.faceTokens,
    facesetOuterId: row.facesetOuterId,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function savePhotoRecord(record: PhotoRecordInsert): Promise<PhotoRecord> {
  const [inserted] = await db.insert(photoRecord).values(toDbRecord(record)).returning();
  return toPhotoRecord(inserted);
}
