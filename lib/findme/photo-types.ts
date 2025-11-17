export type PhotoStatus = "ok" | "oversize" | "error";

export interface PhotoRecord {
  id: string;
  userId: string;
  originalPath: string;
  compressedPath: string;
  sizeOriginalKB: number;
  sizeCompressedKB: number | null;
  width: number | null;
  height: number | null;
  status: PhotoStatus;
  faceTokens: string[];
  facesetOuterId: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoRecordInsert
  extends Omit<PhotoRecord, "createdAt" | "updatedAt" | "faceTokens"> {
  createdAt?: Date;
  updatedAt?: Date;
  faceTokens?: string[];
}

export interface PhotoCompressionResult {
  width: number;
  height: number;
  sizeCompressedKB: number;
  status: PhotoStatus;
}
