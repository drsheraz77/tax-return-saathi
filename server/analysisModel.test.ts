import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEEP_ANALYSIS_MODEL, FAST_ANALYSIS_MODEL, modelForAnalysisMode, normalizeAnalysisMode } from "./analysisModel";

const app = fs.readFileSync(path.join(process.cwd(), "client/src/App.jsx"), "utf8");
const preparation = fs.readFileSync(path.join(process.cwd(), "client/src/DocumentPreparationPage.jsx"), "utf8");
const preferences = fs.readFileSync(path.join(process.cwd(), "client/src/TaxpayerPreparationProfile.jsx"), "utf8");

describe("analysis model preference", () => {
  it("maps only the two supported modes to server-owned model IDs", () => {
    expect(normalizeAnalysisMode("fast")).toBe("fast");
    expect(normalizeAnalysisMode("deep")).toBe("deep");
    expect(normalizeAnalysisMode("arbitrary-model")).toBe("deep");
    expect(modelForAnalysisMode("fast")).toBe(FAST_ANALYSIS_MODEL);
    expect(modelForAnalysisMode("deep")).toBe(DEEP_ANALYSIS_MODEL);
    expect(modelForAnalysisMode("arbitrary-model")).toBe(DEEP_ANALYSIS_MODEL);
  });

  it("wires the local preference into both document-analysis request paths", () => {
    expect(app).toContain("useAnalysisModePreference");
    expect(app).toContain("analysisMode, documents: blocks");
    expect(preparation).toContain("useAnalysisModePreference");
    expect(preparation).toContain("analysisMode, documents");
  });

  it("shows an accessible Fast/Deep choice in existing preferences", () => {
    expect(preferences).toContain("Fast Analysis");
    expect(preferences).toContain("Deep Analysis");
    expect(preferences).toContain('role="radiogroup"');
    expect(preferences).toContain("This setting is not saved to your account");
  });
});
