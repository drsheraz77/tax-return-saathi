import { afterEach, describe, expect, it, vi } from "vitest";
import claudeHandler from "../api/claude.js";

type RecordedResponse = {
  statusCode?: number;
  body?: unknown;
};

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
  return { recorded, response };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("preserved Claude proxy", () => {
  it("rejects a request without messages before contacting Anthropic", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { recorded, response } = createResponseRecorder();

    await claudeHandler({ method: "POST", body: {} }, response);

    expect(recorded).toEqual({ statusCode: 400, body: { error: "Missing messages" } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards allowed fields through the server with the private key and token cap", async () => {
    const upstreamBody = { id: "msg_test", content: [{ type: "text", text: "ok" }] };
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: vi.fn().mockResolvedValue(upstreamBody) });
    vi.stubGlobal("fetch", fetchMock);
    const { recorded, response } = createResponseRecorder();
    const originalKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "test-server-only-key";

    try {
      await claudeHandler(
        {
          method: "POST",
          body: {
            model: "claude-test-model",
            max_tokens: 9000,
            system: "Answer briefly.",
            messages: [{ role: "user", content: "Hello" }],
          },
        },
        response
      );
    } finally {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }

    expect(fetchMock).toHaveBeenCalledWith("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-server-only-key",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-test-model",
        max_tokens: 2000,
        system: "Answer briefly.",
        messages: [{ role: "user", content: "Hello" }],
      }),
    });
    expect(recorded).toEqual({ statusCode: 200, body: upstreamBody });
  });

  it("returns a safe error when the upstream request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));
    const { recorded, response } = createResponseRecorder();

    await claudeHandler({ method: "POST", body: { messages: [] } }, response);

    expect(recorded).toEqual({ statusCode: 500, body: { error: "Upstream request failed" } });
  });
});
