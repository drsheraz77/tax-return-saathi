import type { Request, Response } from "express";
import {
  invokeLLM,
  type FileContent,
  type ImageContent,
  type Message,
  type MessageContent,
  type TextContent,
} from "./_core/llm";

export const BUILT_IN_MODEL = "gemini-3-flash-preview";
const MAX_TOKENS = 2000;

type Base64Source = {
  type: "base64";
  media_type: string;
  data: string;
};

type ClientMessage = {
  role: unknown;
  content: unknown;
};

type ClientPayload = {
  max_tokens?: unknown;
  system?: unknown;
  messages?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBase64Source(value: unknown): value is Base64Source {
  return (
    isRecord(value) &&
    value.type === "base64" &&
    typeof value.media_type === "string" &&
    typeof value.data === "string"
  );
}

function isSupportedRole(value: unknown): value is Message["role"] {
  return ["system", "user", "assistant", "tool", "function"].includes(String(value));
}

function dataUrl(source: Base64Source) {
  return `data:${source.media_type};base64,${source.data}`;
}

function convertContentPart(value: unknown): MessageContent {
  if (!isRecord(value) || typeof value.type !== "string") {
    throw new Error("Unsupported message content");
  }

  if (value.type === "text" && typeof value.text === "string") {
    return { type: "text", text: value.text };
  }

  if (value.type === "image" && isBase64Source(value.source)) {
    return {
      type: "image_url",
      image_url: { url: dataUrl(value.source) },
    };
  }

  if (value.type === "document" && isBase64Source(value.source)) {
    return {
      type: "file_url",
      file_url: {
        url: dataUrl(value.source),
        mime_type: value.source.media_type === "application/pdf" ? "application/pdf" : undefined,
      },
    };
  }

  throw new Error("Unsupported message content");
}

function convertMessage(value: unknown): Message {
  if (!isRecord(value) || !isSupportedRole(value.role)) {
    throw new Error("Unsupported message role");
  }

  if (typeof value.content === "string") {
    return { role: value.role, content: value.content };
  }

  if (!Array.isArray(value.content)) {
    throw new Error("Unsupported message content");
  }

  return {
    role: value.role,
    content: value.content.map(convertContentPart),
  };
}

function toAnthropicTextContent(
  content: string | Array<TextContent | ImageContent | FileContent> | undefined
): TextContent[] {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  return (content || []).filter(
    (part): part is TextContent => part.type === "text"
  );
}

function parsePayload(body: unknown): ClientPayload {
  if (typeof body === "string") {
    return JSON.parse(body) as ClientPayload;
  }
  if (isRecord(body)) {
    return body as ClientPayload;
  }
  return {};
}

function boundedMaxTokens(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(Math.floor(value), 1), MAX_TOKENS)
    : 1000;
}

/**
 * Keeps the uploaded browser's Anthropic Messages-shaped request and response
 * contract while dispatching only through the project-managed server AI proxy.
 */
export async function manusLlmProxy(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let payload: ClientPayload;
  try {
    payload = parsePayload(req.body);
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!Array.isArray(payload.messages)) {
    return res.status(400).json({ error: "Missing messages" });
  }

  try {
    const messages: Message[] = [
      ...(typeof payload.system === "string" ? [{ role: "system" as const, content: payload.system }] : []),
      ...payload.messages.map(convertMessage),
    ];
    const completion = await invokeLLM({
      model: BUILT_IN_MODEL,
      max_tokens: boundedMaxTokens(payload.max_tokens),
      messages,
    });
    const choice = completion.choices[0];

    return res.status(200).json({
      id: completion.id,
      type: "message",
      role: "assistant",
      model: completion.model,
      content: toAnthropicTextContent(choice?.message.content),
      stop_reason: choice?.finish_reason ?? null,
      usage: {
        input_tokens: completion.usage?.prompt_tokens ?? 0,
        output_tokens: completion.usage?.completion_tokens ?? 0,
      },
    });
  } catch (error) {
    console.error("[Built-in AI] Request failed:", error);
    return res.status(500).json({ error: "Upstream request failed" });
  }
}
