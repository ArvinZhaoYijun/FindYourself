import { randomUUID } from "crypto";

const PIXCHEESE_BASE_URL =
  process.env.PIXCHEESE_BASE_URL ?? "https://preview-api.pixcheese.com";
const PIXCHEESE_APP_ID = process.env.PIXCHEESE_APP_ID ?? "8";
const PIXCHEESE_APP_VERSION = process.env.PIXCHEESE_APP_VERSION ?? "25.11.112";
const PIXCHEESE_LANGUAGE = process.env.PIXCHEESE_LANGUAGE ?? "zh-CN";
const DEFAULT_MAX_PHOTOS = Number(process.env.FINDME_PIXCHEESE_MAX_PHOTOS ?? 700);
const DEFAULT_PAGE_SIZE = Number(process.env.FINDME_PIXCHEESE_PAGE_SIZE ?? 50);
const DEFAULT_DOWNLOAD_CONCURRENCY = Number(
  process.env.FINDME_PIXCHEESE_DOWNLOAD_CONCURRENCY ?? 4
);

const SUPPORTED_HOSTS = new Set(["v.pixcheese.com", "v-pre.pixcheese.com"]);

type PixcheeseResponse<T> = {
  code: number;
  message?: string;
  data: T;
};

type PixcheeseProjectInfo = {
  project_id: number;
  project_name: string;
  private_status: number;
};

type PixcheeseClassListResponse = {
  list: { class_id: number; class_name: string }[];
  total: number;
  display_all: number;
};

type PixcheesePhotoListResponse = {
  total: number;
  display_num: number;
  list: PixcheesePhotoListItem[];
};

type PixcheesePhotoListItem = {
  file_id: string;
  file_name: string;
  file_uri: string;
  thumb_uri?: string;
  preview_uri?: string;
  captured_at?: string;
  updated_at?: string;
  class_id?: number;
  price?: number;
};

export type PixcheeseAlbumFile = {
  id: string;
  filename: string;
  file: File;
  contentType: string;
  fileUrl: string;
  previewUrl: string;
  thumbUrl?: string;
  classId?: number;
  capturedAt?: string;
  updatedAt?: string;
};

export type PixcheeseAlbumFetchResult = {
  shareKey: string;
  projectId: number;
  photos: PixcheeseAlbumFile[];
};

export class PixcheeseError extends Error {
  code?: number;
  status?: number;

  constructor(message: string, code?: number, status?: number) {
    super(message);
    this.name = "PixcheeseError";
    this.code = code;
    this.status = status;
  }
}

function buildHeaders(extra: Record<string, string> = {}) {
  return {
    "Content-Type": "application/json",
    "App-Id": PIXCHEESE_APP_ID,
    "App-Version": PIXCHEESE_APP_VERSION,
    Language: PIXCHEESE_LANGUAGE,
    "X-Request-Id": `${Date.now()}_${randomUUID()}`,
    ...extra,
  };
}

async function pixcheeseRequest<T>(
  path: string,
  body: Record<string, unknown>,
  { headers }: { headers?: Record<string, string> } = {}
): Promise<T> {
  const response = await fetch(`${PIXCHEESE_BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: buildHeaders(headers),
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | PixcheeseResponse<T>
    | null;

  if (!response.ok) {
    throw new PixcheeseError(
      payload?.message ?? "Pixcheese request failed",
      payload?.code ?? response.status,
      response.status
    );
  }

  if (!payload || payload.code !== 0) {
    throw new PixcheeseError(
      payload?.message ?? "Pixcheese request failed",
      payload?.code,
      response.status
    );
  }

  return payload.data;
}

export function extractPixcheeseShareKey(input: string): string | null {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    if (!SUPPORTED_HOSTS.has(url.hostname)) {
      return null;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    if (!segments.length) {
      return null;
    }

    const shareIndex = segments.findIndex((segment) => segment === "s");
    if (shareIndex >= 0 && segments[shareIndex + 1]) {
      return segments[shareIndex + 1]!;
    }
    return segments[segments.length - 1] ?? null;
  } catch {
    return null;
  }
}

export async function fetchPixcheeseAlbumFiles({
  shareUrl,
  shareKey: providedShareKey,
  maxPhotos = DEFAULT_MAX_PHOTOS,
  pageSize = DEFAULT_PAGE_SIZE,
  concurrency = DEFAULT_DOWNLOAD_CONCURRENCY,
}: {
  shareUrl?: string;
  shareKey?: string;
  maxPhotos?: number;
  pageSize?: number;
  concurrency?: number;
}): Promise<PixcheeseAlbumFetchResult> {
  const shareKey =
    providedShareKey ??
    (shareUrl ? extractPixcheeseShareKey(shareUrl) : null);

  if (!shareKey) {
    throw new PixcheeseError("请输入有效的 Pixcheese 分享链接");
  }

  const safeMaxPhotos = Math.max(1, maxPhotos);
  const safePageSize = Math.max(1, pageSize);
  const safeConcurrency = Math.max(1, concurrency);

  const projectInfo = await pixcheeseRequest<PixcheeseProjectInfo>(
    "/v1/share/project/info",
    { share_key: shareKey }
  );

  const projectId = projectInfo.project_id;

  const classList = await pixcheeseRequest<PixcheeseClassListResponse>(
    "/v1/share/img_class/list",
    {
      project_id: projectId,
      share_password: "",
    }
  );

  const classIds = classList.list?.map((item) => item.class_id) ?? [];
  if (!classIds.length) {
    classIds.push(0);
  }

  const photoItems = await collectPixcheesePhotos({
    shareKey,
    projectId,
    classIds,
    maxPhotos: safeMaxPhotos,
    pageSize: safePageSize,
  });

  const photos = await downloadPixcheesePhotos(photoItems, safeConcurrency);

  if (!photos.length) {
    throw new PixcheeseError("未能获取到 Pixcheese 相册照片，请稍后再试");
  }

  return {
    shareKey,
    projectId,
    photos,
  };
}

async function collectPixcheesePhotos({
  shareKey,
  projectId,
  classIds,
  maxPhotos,
  pageSize,
}: {
  shareKey: string;
  projectId: number;
  classIds: number[];
  maxPhotos: number;
  pageSize: number;
}): Promise<PixcheesePhotoListItem[]> {
  const collected: PixcheesePhotoListItem[] = [];
  const seen = new Set<string>();

  for (const classId of classIds) {
    let page = 1;
    while (collected.length < maxPhotos) {
      const currentPageSize = Math.min(
        pageSize,
        Math.max(maxPhotos - collected.length, 1)
      );
      const data = await pixcheeseRequest<PixcheesePhotoListResponse>(
        "/v1/share/new_list",
        {
          project_id: projectId,
          class_id: classId,
          page,
          page_size: currentPageSize,
          share_password: "",
        },
        {
          headers: {
            "Share-Key": shareKey,
            "N-WMK": "0",
          },
        }
      );

      const list = data.list ?? [];
      if (!list.length) {
        break;
      }

      for (const item of list) {
        if (seen.has(item.file_id)) {
          continue;
        }

        seen.add(item.file_id);
        collected.push(item);

        if (collected.length >= maxPhotos) {
          break;
        }
      }

      if (list.length < currentPageSize) {
        break;
      }

      page += 1;
    }

    if (collected.length >= maxPhotos) {
      break;
    }
  }

  return collected;
}

async function downloadPixcheesePhotos(
  items: PixcheesePhotoListItem[],
  concurrency: number
): Promise<PixcheeseAlbumFile[]> {
  const results: PixcheeseAlbumFile[] = [];
  const chunkSize = Math.max(1, concurrency);

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        try {
          const response = await fetch(item.file_uri, { cache: "no-store" });
          if (!response.ok) {
            throw new Error(
              `下载 ${item.file_id} 失败：${response.statusText || response.status}`
            );
          }
          const arrayBuffer = await response.arrayBuffer();
          const mimeType = response.headers.get("content-type") ?? "image/jpeg";
          const filename = item.file_name || `${item.file_id}.jpg`;
          const file = new File([arrayBuffer], filename, { type: mimeType });

          return {
            id: item.file_id,
            filename,
            file,
            contentType: mimeType,
            fileUrl: item.file_uri,
            previewUrl:
              item.preview_uri ??
              item.thumb_uri ??
              item.file_uri,
            thumbUrl: item.thumb_uri,
            classId: item.class_id,
            capturedAt: item.captured_at,
            updatedAt: item.updated_at,
          } satisfies PixcheeseAlbumFile;
        } catch (error) {
          console.warn(
            "[pixcheese] download failed",
            item.file_id,
            error instanceof Error ? error.message : error
          );
          return null;
        }
      })
    );

    chunkResults.forEach((result) => {
      if (result) {
        results.push(result);
      }
    });
  }

  return results;
}
