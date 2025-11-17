import { NextRequest, NextResponse } from "next/server";

import { processPhotoUpload } from "@/features/photos/server/photo-service";
import type { PhotoRecord } from "@/lib/findme/photo-types";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = extractFiles(formData);

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const records = await Promise.all(
      files.map(file => processPhotoUpload({ file, userId: session.session!.userId })),
    );

    return NextResponse.json({
      records,
      summary: summarize(records),
    });
  } catch (error) {
    console.error("Photo compression error:", error);
    return NextResponse.json({ error: "Failed to compress photos" }, { status: 500 });
  }
}

function extractFiles(formData: FormData) {
  const files: File[] = [];

  formData.getAll("files").forEach(entry => {
    if (entry instanceof File) {
      files.push(entry);
    }
  });

  const fallback = formData.get("file");
  if (!files.length && fallback instanceof File) {
    files.push(fallback);
  }

  return files;
}

function summarize(records: PhotoRecord[]) {
  const summary = {
    total: records.length,
    ok: 0,
    oversize: 0,
    failed: 0,
  };

  records.forEach(record => {
    if (record.status === "ok") {
      summary.ok += 1;
    } else if (record.status === "oversize") {
      summary.oversize += 1;
    } else if (record.status === "error") {
      summary.failed += 1;
    }
  });

  return summary;
}
