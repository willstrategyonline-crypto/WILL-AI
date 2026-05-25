import { NextResponse } from "next/server";
import {
  buildGeminiContents,
  getGeminiClient,
  getGeminiModelForMode,
  getSystemInstruction,
  type ChatMessage,
} from "@/lib/gemini";
import { cleanupOldUploads } from "@/lib/uploads";

export const runtime = "nodejs";

interface ChatRequestBody {
  message: string;
  images?: string[];
  isPro?: boolean;
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  let model = "";

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY が設定されていません。.env.local に API キーを追加し、開発サーバーを再起動してください。",
        },
        { status: 500 }
      );
    }

    await cleanupOldUploads();

    const body = (await request.json()) as ChatRequestBody;
    const { message, images, isPro = false, history = [] } = body;

    if (!message?.trim() && (!images || images.length === 0)) {
      return NextResponse.json(
        { error: "メッセージまたは画像が必要です。" },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      ...history,
      {
        role: "user",
        content: message.trim(),
        images,
      },
    ];

    model = getGeminiModelForMode(isPro);
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model,
      contents: await buildGeminiContents(messages),
      config: {
        systemInstruction: getSystemInstruction(isPro),
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "AI からの応答を取得できませんでした。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error("[api/chat]", error);
    const raw =
      error instanceof Error ? error.message : "チャットの処理中にエラーが発生しました。";

    if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
      return NextResponse.json(
        {
          error:
            "Gemini API の利用上限に達しました。Google AI Studio のクォータを確認してください。",
        },
        { status: 429 }
      );
    }

    if (raw.includes("404") || raw.includes("not found")) {
      return NextResponse.json(
        {
          error: `指定のモデルが見つかりません（${model}）。しばらくしてから再試行してください。`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: raw }, { status: 500 });
  }
}
