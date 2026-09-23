import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const app = fs.readFileSync(path.join(process.cwd(), "client/src/App.jsx"), "utf8");
const main = fs.readFileSync(path.join(process.cwd(), "client/src/main.jsx"), "utf8");

describe("dedicated Analyze Your Tax Return page", () => {
  it("exposes an explicit bilingual special-feature heading and boundary", () => {
    expect(app).toContain("Analyze Your Tax Return");
    expect(app).toContain("اپنا ٹیکس ریٹرن جانچیں");
    expect(app).toContain("dedicatedAnalysis");
    expect(app).toContain("This is independent educational screening");
  });

  it("routes the special hero control to a dedicated path and sets a focused title", () => {
    expect(app).toContain('window.history.pushState({}, "", "/analyze-tax-return")');
    expect(main).toContain('route === "/analyze-tax-return"');
    expect(main).toContain('Analyze Your Tax Return | Tax Return Saathi');
    expect(main).toContain('<App initialTab="check" dedicatedAnalysis />');
  });

  it("shows privacy-safe file readiness and staged progress indicators", () => {
    expect(app).toContain("uploadStage");
    expect(app).toContain("All files ready for analysis");
    expect(app).toContain('role="progressbar"');
    expect(app).toContain("aria-valuenow={uploadProgress}");
    expect(app).toContain("Preparing files securely");
    expect(app).toContain("Analysis complete");
  });
});
