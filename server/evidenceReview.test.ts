import { describe, expect, it } from "vitest";
import { buildAssetEvidenceChecks } from "../shared/evidenceAwareChecks";
import { evidenceReviewKey, getUnresolvedEvidenceItems, isUncertainEvidenceStatus, summarizeManualEvidenceReviews } from "../shared/evidenceReview";

describe("local evidence review controls", () => {
  const checks = buildAssetEvidenceChecks([
    { label: "Investment A", statementValue: 0, declaredValue: 0, evidenceRef: "" },
    { label: "Investment B", statementValue: 100, declaredValue: 150, evidenceRef: "doc 1" },
  ]).map((check, index) => ({ check, index }));

  it("only offers manual review for uncertain machine states", () => {
    expect(isUncertainEvidenceStatus(checks[0].check.status)).toBe(true);
    expect(isUncertainEvidenceStatus("MATCHED")).toBe(false);
  });

  it("counts pending and selected local decisions without changing source status", () => {
    const key = evidenceReviewKey(checks[0].check, checks[0].index);
    const summary = summarizeManualEvidenceReviews(checks, { [key]: "not_applicable" });
    expect(summary).toMatchObject({ uncertain: 2, pending: 1, notApplicable: 1, confirmed: 0, needsFollowUp: 0 });
    expect(checks[0].check.status).toBe("EVIDENCE_NOT_PROVIDED");
  });

  it("supports a reset by treating an empty review map as pending", () => {
    expect(summarizeManualEvidenceReviews(checks, {})).toMatchObject({ uncertain: 2, pending: 2, notApplicable: 0 });
  });

  it("returns only pending and follow-up items for the unresolved summary", () => {
    const first = evidenceReviewKey(checks[0].check, checks[0].index);
    const second = evidenceReviewKey(checks[1].check, checks[1].index);
    expect(getUnresolvedEvidenceItems(checks, { [first]: "confirmed", [second]: "needs_follow_up" }).map(({ check }) => check.label)).toEqual(["Investment B"]);
    expect(getUnresolvedEvidenceItems(checks, { [first]: "not_applicable", [second]: "confirmed" })).toHaveLength(0);
  });
});
