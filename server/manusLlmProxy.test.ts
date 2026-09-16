import type { Request, Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));

import { invokeLLM } from "./_core/llm";
import { BUILT_IN_MODEL, manusLlmProxy, TAX_REVIEW_QUALITY_PROTOCOL } from "./manusLlmProxy";

type RecordedResponse = { statusCode?: number; body?: unknown };

function createResponseRecorder() {
  const recorded: RecordedResponse = {};
  const response = {
    status: vi.fn((statusCode: number) => {
      recorded.statusCode = statusCode;
      return response;
    }),
    json: vi.fn((body: unknown) => {
      recorded.body = body;
      return recorded;
    }),
  };
  return { recorded, response: response as unknown as Response };
}

const mockedInvokeLLM = vi.mocked(invokeLLM);

afterEach(() => {
  vi.clearAllMocks();
});

describe("built-in AI adapter", () => {
  it("rejects requests without messages before calling the model", async () => {
    const { recorded, response } = createResponseRecorder();

    await manusLlmProxy({ method: "POST", body: {} } as Request, response);

    expect(recorded).toEqual({ statusCode: 400, body: { error: "Missing messages" } });
    expect(mockedInvokeLLM).not.toHaveBeenCalled();
  });

  it("converts text, image, and PDF blocks while keeping the browser response contract", async () => {
    mockedInvokeLLM.mockResolvedValue({
      id: "chatcmpl_test",
      created: 1,
      model: BUILT_IN_MODEL,
      choices: [{ index: 0, message: { role: "assistant", content: "Reviewed." }, finish_reason: "stop" }],
      usage: { prompt_tokens: 12, completion_tokens: 4, total_tokens: 16 },
    });
    const { recorded, response } = createResponseRecorder();

    await manusLlmProxy(
      {
        method: "POST",
        body: {
          model: "claude-sonnet-4-6",
          max_tokens: 9000,
          response_format: { type: "json_object" },
          system: "Be concise.",
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data: "image-data" } },
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: "pdf-data" } },
              { type: "text", text: "Review these." },
            ],
          }],
        },
      } as Request,
      response
    );

    expect(mockedInvokeLLM).toHaveBeenCalledWith({
      model: BUILT_IN_MODEL,
      max_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Be concise." },
        { role: "system", content: TAX_REVIEW_QUALITY_PROTOCOL },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: "data:image/png;base64,image-data" } },
            { type: "file_url", file_url: { url: "data:application/pdf;base64,pdf-data", mime_type: "application/pdf" } },
            { type: "text", text: "Review these." },
          ],
        },
      ],
    });
    expect(recorded).toEqual({
      statusCode: 200,
      body: {
        id: "chatcmpl_test",
        type: "message",
        role: "assistant",
        model: BUILT_IN_MODEL,
        content: [{ type: "text", text: "Reviewed." }],
        stop_reason: "stop",
        usage: { input_tokens: 12, output_tokens: 4 },
      },
    });
  });

  it("returns a safe error if the managed AI service fails", async () => {
    mockedInvokeLLM.mockRejectedValue(new Error("upstream unavailable"));
    const { recorded, response } = createResponseRecorder();

    await manusLlmProxy(
      { method: "POST", body: { messages: [{ role: "user", content: "Hello" }] } } as Request,
      response
    );

    expect(recorded).toEqual({ statusCode: 500, body: { error: "Upstream request failed" } });
  });

  it("forwards a strict JSON schema for the client-side return-review parser", async () => {
    mockedInvokeLLM.mockResolvedValue({
      id: "chatcmpl_schema",
      created: 1,
      model: BUILT_IN_MODEL,
      choices: [{ index: 0, message: { role: "assistant", content: "{}" }, finish_reason: "stop" }],
      usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
    });
    const { response } = createResponseRecorder();
    const responseFormat = {
      type: "json_schema" as const,
      json_schema: {
        name: "return_review",
        strict: true,
        schema: { type: "object", properties: {}, additionalProperties: false },
      },
    };

    await manusLlmProxy(
      { method: "POST", body: { messages: [{ role: "user", content: "Review." }], response_format: responseFormat } } as Request,
      response
    );

    expect(mockedInvokeLLM).toHaveBeenCalledWith(expect.objectContaining({
      response_format: responseFormat,
    }));
  });

  it("enforces tax-year awareness, uncertainty, official verification, and no-fabrication boundaries for every request", () => {
    expect(TAX_REVIEW_QUALITY_PROTOCOL).toMatch(/tax year as unknown unless/i);
    expect(TAX_REVIEW_QUALITY_PROTOCOL).toMatch(/official FBR guidance/i);
    expect(TAX_REVIEW_QUALITY_PROTOCOL).toMatch(/Do not invent rates, thresholds, deadlines, legal sections/i);
    expect(TAX_REVIEW_QUALITY_PROTOCOL).toMatch(/Do not state or imply that FBR will accept, reject, flag, or agree/i);
  });
});
