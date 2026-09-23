import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const appSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../client/src/App.jsx"),
  "utf8"
);
const pipelineSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "./taxAnalysisPipeline.ts"),
  "utf8"
);

describe("return-review structured output request", () => {
  it("requests a strict JSON schema and a budget suitable for multimodal analysis", () => {
    expect(appSource).toContain('fetch("/api/return-review"');
    expect(pipelineSource).toContain('name: "return_review"');
    expect(pipelineSource).toContain("strict: true");
    expect(pipelineSource).toContain("MAX_REVIEW_TOKENS = 4096");
    expect(pipelineSource).toContain("additionalProperties: false");
  });

  it("checks the managed response status before parsing the review result", () => {
    expect(appSource).toContain('if (!res.ok) throw new Error("return review request failed")');
  });
});
