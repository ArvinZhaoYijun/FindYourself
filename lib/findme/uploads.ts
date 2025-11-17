import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const ORIGINAL_DIR = path.join(UPLOAD_ROOT, "original");
const COMPRESSED_DIR = path.join(UPLOAD_ROOT, "compressed");

const ORIGINAL_PREFIX = path.posix.join("/", "uploads", "original");
const COMPRESSED_PREFIX = path.posix.join("/", "uploads", "compressed");

export interface UploadPathConfig {
  id: string;
  originalAbsolutePath: string;
  originalRelativePath: string;
  compressedAbsolutePath: string;
  compressedRelativePath: string;
}

export async function ensureUploadDirs() {
  await Promise.all([
    fs.mkdir(ORIGINAL_DIR, { recursive: true }),
    fs.mkdir(COMPRESSED_DIR, { recursive: true }),
  ]);
}

export function buildUploadPaths(extension?: string): UploadPathConfig {
  const id = randomUUID();
  const normalized = normalizeExtension(extension);

  const originalFilename = normalized ? `${id}.${normalized}` : `${id}.jpg`;
  const compressedFilename = `${id}.jpg`;

  return {
    id,
    originalAbsolutePath: path.join(ORIGINAL_DIR, originalFilename),
    originalRelativePath: path.posix.join(ORIGINAL_PREFIX, originalFilename),
    compressedAbsolutePath: path.join(COMPRESSED_DIR, compressedFilename),
    compressedRelativePath: path.posix.join(COMPRESSED_PREFIX, compressedFilename),
  };
}

function normalizeExtension(value?: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/^\./, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleaned) return null;
  if (cleaned === "jpeg") return "jpg";
  return cleaned;
}

export const uploadDirectories = {
  root: UPLOAD_ROOT,
  original: ORIGINAL_DIR,
  compressed: COMPRESSED_DIR,
};
