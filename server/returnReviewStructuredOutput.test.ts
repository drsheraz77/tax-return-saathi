import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../client/src/App.jsx"),
  "utf8"
);

describe("return-review structured output request", () => {
  it("requests a strict JSON schema and a budget suitable for multimodal analysis", () => {
    expect(appSource).toContain('name: "return_review"');
    expect(appSource).toContain("strict: true");
    expect(appSource).toContain("max_tokens: 4096");
    expect(appSource).toContain("additionalProperties: false");
  });

  it("checks the managed response status before parsing the review result", () => {
    expect(appSource).toContain('if (!res.ok) throw new Error("return review request failed")');
  });
});
