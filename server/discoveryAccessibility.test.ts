import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const entry = readFileSync(resolve(projectRoot, "client/src/main.jsx"), "utf8");
const resourceHub = readFileSync(resolve(projectRoot, "client/src/OfficialResourceHub.jsx"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");

describe("public discovery and supplemental guidance accessibility", () => {
  it("defers supplemental panels with an accessible loading fallback while preserving the primary authored app", () => {
    expect(entry).toContain('import React, { Suspense } from "react"');
    expect(entry).toContain('React.lazy(() => import("./OfficialResourceHub.jsx"))');
    expect(entry).toContain('React.lazy(() => import("./PersonalisedChecklistPrototype.jsx"))');
    expect(entry).toContain('React.lazy(() => import("./TaxYear2026Update.jsx"))');
    expect(entry).toContain("<App />");
    expect(entry).toContain('role="status"');
    expect(entry).toContain("Loading preparation tools…");
    expect(entry).toContain("SupplementalMotionPreferences");
  });

  it("offers keyboard-reachable quick links and honours reduced motion in the resource hub", () => {
    expect(resourceHub).toContain('aria-label="Resource hub quick navigation"');
    expect(resourceHub).toContain('href="#official-resource-filing"');
    expect(resourceHub).toContain('href="#pre-submission-error-prevention-title"');
    expect(resourceHub).toContain('href="#source-aware-question-planner-title"');
    expect(resourceHub).toContain('href="#support-title"');
    expect(resourceHub).toContain("prefers-reduced-motion: reduce");
    expect(resourceHub).toContain(".official-resource-hub__link:focus-visible");
    expect(entry).toContain(".tax-year-update *");
    expect(entry).toContain(".filing-prototype *");
  });

  it("uses accurate public metadata that preserves the independent educational boundary", () => {
    expect(indexHtml).toContain("Independent Urdu and English Pakistan tax education");
    expect(indexHtml).toContain("Not FBR; it does not file returns or determine tax outcomes");
    expect(indexHtml).toContain('name="application-name" content="Tax Return Saathi"');
    expect(indexHtml).toContain('name="robots" content="index,follow"');
  });
});
