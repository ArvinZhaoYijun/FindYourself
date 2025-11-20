import fs from "node:fs/promises";
import sharp from "sharp";
import type { PhotoCompressionResult, PhotoStatus } from "./photo-types";

export const MAX_COMPRESSED_BYTES = 1 * 1024 * 1024; // 1MB
export const MAX_COMPRESSED_DIMENSION = 1000;
const DEFAULT_QUALITY = Number(process.env.FINDME_COMPRESSION_QUALITY ?? 75);

interface CompressPhotoOptions {
  buffer: Buffer;
  outputPath: string;
  maxDimension?: number;
  quality?: number;
}

interface CompressBufferOptions {
  buffer: Buffer;
  maxDimension?: number;
  quality?: number;
}

export interface PreparedImageForFacePP {
  file: File;
  width: number | null;
  height: number | null;
  sizeCompressedKB: number;
  status: PhotoStatus;
  usedOriginal: boolean;
}

export async function compressPhoto({
  buffer,
  outputPath,
  maxDimension = MAX_COMPRESSED_DIMENSION,
  quality = DEFAULT_QUALITY,
}: CompressPhotoOptions): Promise<PhotoCompressionResult> {
  const compression = await compressBuffer({ buffer, maxDimension, quality });
  await fs.writeFile(outputPath, compression.buffer);

  return {
    width: compression.width ?? maxDimension,
    height: compression.height ?? maxDimension,
    sizeCompressedKB: compression.sizeCompressedKB,
    status: compression.status,
  };
}

export async function prepareFileForFacePP(file: File): Promise<PreparedImageForFacePP> {
  const sourceBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const compression = await compressBuffer({ buffer: sourceBuffer });
    const filename = ensureJpegFilename(file.name);
    const compressedFile = new File([compression.buffer as unknown as BlobPart], filename, { type: "image/jpeg" });

    return {
      file: compressedFile,
      width: compression.width,
      height: compression.height,
      sizeCompressedKB: compression.sizeCompressedKB,
      status: compression.status,
      usedOriginal: false,
    };
  } catch (error) {
    return {
      file,
      width: null,
      height: null,
      sizeCompressedKB: Math.round(sourceBuffer.byteLength / 1024),
      status: "error",
      usedOriginal: true,
    };
  }
}

async function compressBuffer({
  buffer,
  maxDimension = MAX_COMPRESSED_DIMENSION,
  quality = DEFAULT_QUALITY,
}: CompressBufferOptions) {
  const pipeline = sharp(buffer)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality,
      chromaSubsampling: "4:4:4",
      mozjpeg: true,
    });

  const output = await pipeline.toBuffer();
  const metadata = await sharp(output).metadata();
  const sizeCompressedKB = Math.round(output.byteLength / 1024);

  return {
    buffer: output,
    width: metadata.width ?? maxDimension,
    height: metadata.height ?? maxDimension,
    sizeCompressedKB,
    status: (output.byteLength >= MAX_COMPRESSED_BYTES ? "oversize" : "ok") as PhotoStatus,
  };
}

function ensureJpegFilename(name?: string) {
  if (!name) return "image.jpg";
  return name.replace(/\.[^./]+$/, "") + ".jpg";
}
