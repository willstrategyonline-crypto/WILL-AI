import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/** アップロード画像の保持期間（72時間） */
export const UPLOAD_RETENTION_MS = 72 * 60 * 60 * 1000;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const UPLOAD_URL_PREFIX = "/uploads/";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

export function getUploadDir() {
  return UPLOAD_DIR;
}

export function getUploadPublicUrl(filename: string) {
  return `${UPLOAD_URL_PREFIX}${filename}`;
}

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function extensionForMime(mimeType: string) {
  return MIME_TO_EXT[mimeType] ?? "bin";
}

function uploadedAtFromFilename(filename: string): number | null {
  const match = filename.match(/^(\d+)-/);
  if (!match) return null;
  const ts = Number.parseInt(match[1], 10);
  return Number.isFinite(ts) ? ts : null;
}

/**
 * 72時間を超えた public/uploads 内の画像を削除する。
 * 頻繁な呼び出しを避けるため、直近の実行から10分以内はスキップする（force=true で強制）。
 */
export async function cleanupOldUploads(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return { deleted: 0, skipped: true };
  }

  await ensureUploadDir();
  const entries = await readdir(UPLOAD_DIR);
  let deleted = 0;

  for (const name of entries) {
    if (name === ".gitkeep") continue;

    const filePath = path.join(UPLOAD_DIR, name);
    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      continue;
    }
    if (!fileStat.isFile()) continue;

    const uploadedAt = uploadedAtFromFilename(name) ?? fileStat.mtimeMs;
    if (now - uploadedAt > UPLOAD_RETENTION_MS) {
      await unlink(filePath);
      deleted += 1;
    }
  }

  lastCleanupAt = now;
  return { deleted, skipped: false };
}

export async function saveUploadedImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; filename: string }> {
  await ensureUploadDir();
  await cleanupOldUploads();

  const uploadedAt = Date.now();
  const ext = extensionForMime(mimeType);
  const filename = `${uploadedAt}-${randomUUID()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await writeFile(filePath, buffer);

  return {
    filename,
    url: getUploadPublicUrl(filename),
  };
}

export function isUploadUrl(imageRef: string) {
  return imageRef.startsWith(UPLOAD_URL_PREFIX);
}

export function uploadFilePathFromUrl(imageRef: string) {
  if (!isUploadUrl(imageRef)) return null;
  const filename = path.basename(imageRef);
  if (filename.includes("..")) return null;
  return path.join(UPLOAD_DIR, filename);
}

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export function mimeTypeFromUploadUrl(imageRef: string) {
  const ext = path.extname(imageRef).slice(1).toLowerCase();
  return EXT_TO_MIME[ext] ?? "application/octet-stream";
}
