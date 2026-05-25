import { readFile } from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import {
  mimeTypeFromUploadUrl,
  uploadFilePathFromUrl,
} from "@/lib/uploads";

/**
 * Normal / PRO の論理モデル名（バージョン番号なしの公式エイリアス）。
 * generateContent API では `gemini-flash-latest` / `gemini-pro-latest` に解決して呼び出す。
 */
export const NORMAL_GEMINI_MODEL = "gemini-flash";
export const PRO_GEMINI_MODEL = "gemini-pro";

/** Google API が受け付ける「常に最新」エイリアス（ホットスワップ型） */
const LATEST_MODEL_ALIASES: Record<string, string> = {
  "gemini-flash": "gemini-flash-latest",
  "gemini-pro": "gemini-pro-latest",
};

export function resolveGeminiModelId(model: string) {
  return LATEST_MODEL_ALIASES[model] ?? model;
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

/** UI の Normal / PRO 切り替えに応じて、API 用モデル ID を返す */
export function getGeminiModelForMode(isPro: boolean) {
  const logical = isPro ? PRO_GEMINI_MODEL : NORMAL_GEMINI_MODEL;
  return resolveGeminiModelId(logical);
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  images?: string[];
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

async function imageToInlinePart(
  imageRef: string
): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  const parsed = parseDataUrl(imageRef);
  if (parsed) {
    return { inlineData: parsed };
  }

  const filePath = uploadFilePathFromUrl(imageRef);
  if (!filePath) return null;

  try {
    const buffer = await readFile(filePath);
    return {
      inlineData: {
        mimeType: mimeTypeFromUploadUrl(imageRef),
        data: buffer.toString("base64"),
      },
    };
  } catch {
    return null;
  }
}

export async function buildGeminiContents(messages: ChatMessage[]) {
  const contents = [];

  for (const msg of messages) {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (msg.content.trim()) {
      parts.push({ text: msg.content });
    }

    for (const image of msg.images ?? []) {
      const part = await imageToInlinePart(image);
      if (part) parts.push(part);
    }

    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts,
    });
  }

  return contents;
}

const NORMAL_SYSTEM_INSTRUCTION = `あなたは「WILL AI」という学習支援AIです。日本の中高生・大学生向けに、質問に簡潔で分かりやすく答えてください。要点を先に述べ、必要最小限の説明にとどめてください。日本語で回答してください。`;

const PRO_SYSTEM_INSTRUCTION = `あなたは「WILL AI」という学習支援AIのPROモードです。日本の中高生・大学生向けに、質問に丁寧かつ詳しく答えてください。考え方の流れ、重要なポイント、具体例、よくある間違いを含めて段階的に解説してください。日本語で回答してください。`;

export function getSystemInstruction(isPro: boolean) {
  return isPro ? PRO_SYSTEM_INSTRUCTION : NORMAL_SYSTEM_INSTRUCTION;
}
