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
    expect(taxYearPanel).toContain("getNoticeDocumentChecklist(noticeType)");
    expect(taxYearPanel).toContain("Temporary document-preparation categories");
  });

  it("renders the temporary wealth board with a clear local-only storage boundary", () => {
    expect(resourceHub).toContain("wealth-preparation-board");
    expect(resourceHub).toContain("WEALTH_STATEMENT_PREPARATION_STEPS");
    expect(resourceHub).toContain("setWealthReadinessItems({})");
    expect(resourceHub).toContain("Nothing from this board is written to browser storage, your account, or the app database");
    expect(resourceHub).toContain("getWealthReadinessPrintRows(wealthReadinessItems)");
    expect(resourceHub).toContain("Print temporary summary");
    expect(resourceHub).toContain("Category source review");
  });

  it("renders the temporary pre-filing timeline and private readiness download without a storage claim", () => {
    expect(resourceHub).toContain("PRE_FILING_TIMELINE_STEPS");
    expect(resourceHub).toContain("pre-filing-timeline-title");
    expect(resourceHub).toContain("downloadNonSensitiveReadinessSummary");
    expect(resourceHub).toContain("tax-return-saathi-readiness-summary.txt");
    expect(resourceHub).toContain("contains no figures, names, CNICs, account details, documents, or credentials");
  });

  it("renders preparation-only IRIS orientation, temporary error prevention, and a reviewed-not-live source update centre", () => {
    expect(resourceHub).toContain("iris-navigation-walkthrough");
    expect(resourceHub).toContain("IRIS_NAVIGATION_WALKTHROUGH");
    expect(resourceHub).toContain("cannot log in, navigate inside IRIS, enter information, e-sign, submit a return");
    expect(resourceHub).toContain("pre-submission-error-prevention");
    expect(resourceHub).toContain("PRE_SUBMISSION_ERROR_PREVENTION_STEPS");
    expect(resourceHub).toContain("do not run FBR checks, assess legal completeness, calculate tax, or confirm acceptance");
    expect(resourceHub).toContain("not written to browser storage, your account, or the app database");
    expect(taxYearPanel).toContain("official-source-update-centre");
    expect(taxYearPanel).toContain("OFFICIAL_SOURCE_UPDATE_CENTRE");
    expect(taxYearPanel).toContain("reviewed guidance, not a live FBR feed");
  });
});
