import { NextResponse } from "next/server";
import { cleanupOldUploads, saveUploadedImage } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  try {
    await cleanupOldUploads({ force: true });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "画像ファイルが必要です。" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "対応していない画像形式です。（JPEG, PNG, GIF, WebP）" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "画像サイズは 10MB 以下にしてください。" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, filename } = await saveUploadedImage(buffer, file.type);

    return NextResponse.json({
      url,
      filename,
      expiresInHours: 72,
    });
  } catch (error) {
    console.error("[api/uploads]", error);
    return NextResponse.json(
      { error: "画像のアップロードに失敗しました。" },
      { status: 500 }
    );
  }
}
