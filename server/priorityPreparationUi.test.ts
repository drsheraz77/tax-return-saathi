import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const taxYearPanel = readFileSync(resolve(projectRoot, "client/src/TaxYear2026Update.jsx"), "utf8");
const resourceHub = readFileSync(resolve(projectRoot, "client/src/OfficialResourceHub.jsx"), "utf8");

describe("priority preparation workflow wiring", () => {
  it("renders the limited source foundation and structured FBR-notice preparation guide", () => {
    expect(taxYearPanel).toContain("TAX_KNOWLEDGE_FOUNDATION");
    expect(taxYearPanel).toContain("fbr-notice-preparation-guide");
    expect(taxYearPanel).toContain("FBR_NOTICE_PREPARATION_TYPES");
    expect(taxYearPanel).toContain("does not identify a notice, calculate a deadline");
  });

  it("renders the temporary wealth board with a clear local-only storage boundary", () => {
    expect(resourceHub).toContain("wealth-preparation-board");
    expect(resourceHub).toContain("WEALTH_STATEMENT_PREPARATION_STEPS");
    expect(resourceHub).toContain("setWealthReadinessItems({})");
    expect(resourceHub).toContain("Nothing from this board is written to browser storage, your account, or the app database");
  });
});
