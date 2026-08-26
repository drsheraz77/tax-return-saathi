import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const taxYearPanel = readFileSync(resolve(projectRoot, "client/src/TaxYear2026Update.jsx"), "utf8");
const resourceHub = readFileSync(resolve(projectRoot, "client/src/OfficialResourceHub.jsx"), "utf8");
const taxpayerProfile = readFileSync(resolve(projectRoot, "client/src/TaxpayerPreparationProfile.jsx"), "utf8");
const appEntry = readFileSync(resolve(projectRoot, "client/src/main.jsx"), "utf8");

describe("priority preparation workflow wiring", () => {
  it("renders the limited source foundation and structured FBR-notice preparation guide", () => {
    expect(taxYearPanel).toContain("TAX_KNOWLEDGE_FOUNDATION");
    expect(taxYearPanel).toContain("reviewed-tax-knowledge-catalogue");
    expect(taxYearPanel).toContain("TAX_KNOWLEDGE_FOUNDATION.citationLabel");
    expect(taxYearPanel).toContain("Use alongside existing preparation tools");
    expect(taxYearPanel).toContain("reviewed-knowledge-topic-finder");
    expect(taxYearPanel).toContain("Your search is not sent to a server or saved");
    expect(taxYearPanel).toContain("low-data-learning-path");
    expect(taxYearPanel).toContain("does not ask for figures, identity, documents, or an account status");
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

  it("renders the next bounded complex, return-wealth, and post-submission preparation guidance", () => {
    expect(resourceHub).toContain("complex-situation-preparation-navigator");
    expect(resourceHub).toContain("COMPLEX_SITUATION_PREPARATION_PATHS");
    expect(resourceHub).toContain("These temporary marks are not saved and do not determine a tax treatment, filing route, eligibility, deadline, notice response, or outcome");
    expect(resourceHub).toContain("return-wealth-relationship-guide");
    expect(resourceHub).toContain("RETURN_WEALTH_RELATIONSHIP_STEPS");
    expect(resourceHub).toContain("is not a wealth statement, reconciliation, calculator, validation, or legal-completeness check");
    expect(resourceHub).toContain("post-submission-continuity-checklist");
    expect(resourceHub).toContain("POST_SUBMISSION_CONTINUITY_STEPS");
    expect(resourceHub).toContain("does not track a return, send alerts, keep copies, or say that FBR has accepted anything");
    expect(resourceHub).toContain("not written to browser storage, your account, or the app database");
  });

  it("renders source-aware questions, a visual calculation explanation, and temporary AI-answer evaluation safeguards", () => {
    expect(resourceHub).toContain("source-aware-question-planner");
    expect(resourceHub).toContain("SOURCE_AWARE_QUESTION_PLANS");
    expect(resourceHub).toContain("does not send a question to AI, save a selection, determine treatment, or give a filing decision");
    expect(resourceHub).toContain("calculation-explanation-map");
    expect(resourceHub).toContain("CALCULATION_EXPLANATION_MAP");
    expect(resourceHub).toContain("does not change the authored calculator, request amounts, or produce an official tax result");
    expect(resourceHub).toContain("ai-answer-evaluation-checklist");
    expect(resourceHub).toContain("AI_ANSWER_EVALUATION_STEPS");
    expect(resourceHub).toContain("does not grade an answer, verify sources, or replace an official check");
    expect(resourceHub).toContain("not saved to browser storage, your account, or the app database");
  });

  it("renders an optional governed taxpayer-preferences panel with consent, separate deletion, and no tax outcome claim", () => {
    expect(appEntry).toContain('React.lazy(() => import("./TaxpayerPreparationProfile.jsx"))');
    expect(taxpayerProfile).toContain("Optional account preference · not an FBR profile");
    expect(taxpayerProfile).toContain("only five controlled preparation preferences");
    expect(taxpayerProfile).toContain("does not ask for CNIC, NTN, amounts, bank details, documents, passwords, OTPs, IRIS access, filing status, notices, or outcomes");
    expect(taxpayerProfile).toContain("I choose to save only these optional preparation preferences to my account");
    expect(taxpayerProfile).toContain("DELETE_MY_PREPARATION_PROFILE");
    expect(taxpayerProfile).toContain("Your separate checklist draft was not deleted");
    expect(taxpayerProfile).toContain("cannot determine your tax, deadline, filing, or result");
  });
});
