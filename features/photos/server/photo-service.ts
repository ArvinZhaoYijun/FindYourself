import fs from "node:fs/promises";
import path from "node:path";

import { compressPhoto } from "@/lib/findme/photo-compression";
import type { PhotoRecord, PhotoStatus } from "@/lib/findme/photo-types";
import { buildUploadPaths, ensureUploadDirs } from "@/lib/findme/uploads";
import { savePhotoRecord } from "./photo-repository";

interface ProcessPhotoParams {
  file: File;
  userId: string;
  facesetOuterId?: string | null;
}

export async function processPhotoUpload({ file, userId, facesetOuterId }: ProcessPhotoParams): Promise<PhotoRecord> {
  await ensureUploadDirs();

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = resolveExtension(file);
  const uploadPaths = buildUploadPaths(extension);

  await fs.writeFile(uploadPaths.originalAbsolutePath, buffer);

  const sizeOriginalKB = Math.round(buffer.byteLength / 1024);
  let sizeCompressedKB: number | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let status: PhotoStatus = "ok";
  let errorMessage: string | null = null;

  try {
    const compression = await compressPhoto({
      buffer,
      outputPath: uploadPaths.compressedAbsolutePath,
    });
    sizeCompressedKB = compression.sizeCompressedKB;
    width = compression.width;
    height = compression.height;
    status = compression.status;
  } catch (error) {
    status = "error";
    errorMessage = error instanceof Error ? error.message : "Failed to compress image";
    await fs.writeFile(uploadPaths.compressedAbsolutePath, buffer);
  }

  return savePhotoRecord({
    id: uploadPaths.id,
    userId,
    originalPath: uploadPaths.originalRelativePath,
    compressedPath: uploadPaths.compressedRelativePath,
    sizeOriginalKB,
    sizeCompressedKB,
    width,
    height,
    status,
    facesetOuterId: facesetOuterId ?? null,
    faceTokens: [],
    errorMessage,
  });
}

function resolveExtension(file: File) {
  if (file.name) {
    const extFromName = path.extname(file.name);
    if (extFromName) {
      return extFromName;
    }
  }

  if (file.type?.includes("/")) {
    return file.type.split("/")[1];
  }

  return undefined;
}
