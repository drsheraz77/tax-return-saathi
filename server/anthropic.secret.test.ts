import { describe, expect, it } from "vitest";

describe("Anthropic server credential", () => {
  it("authenticates successfully against the Models API", async () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://api.anthropic.com/v1/models?limit=1", {
      headers: {
        "x-api-key": apiKey!,
        "anthropic-version": "2023-06-01",
      },
    });

    expect(response.ok).toBe(true);
  }, 30_000);
});
