import type { EvidenceCheck, EvidenceCheckStatus } from "./evidenceAwareChecks";

export type ManualEvidenceReviewStatus = "confirmed" | "not_applicable" | "needs_follow_up";
export type EvidenceReviewMap = Record<string, ManualEvidenceReviewStatus>;

export function evidenceReviewKey(check: Pick<EvidenceCheck, "category" | "label">, index: number) {
  return `${check.category}:${check.label}:${index}`;
}

export function isUncertainEvidenceStatus(status: EvidenceCheckStatus) {
  return status === "MISMATCH" || status === "REQUIRES_VERIFICATION" || status === "EVIDENCE_NOT_PROVIDED";
}

export function summarizeManualEvidenceReviews(
  checks: Array<{ check: EvidenceCheck; index: number }>,
  reviews: EvidenceReviewMap,
) {
  const uncertain = checks.filter(({ check }) => isUncertainEvidenceStatus(check.status));
  return {
    uncertain: uncertain.length,
    confirmed: uncertain.filter(({ check, index }) => reviews[evidenceReviewKey(check, index)] === "confirmed").length,
    notApplicable: uncertain.filter(({ check, index }) => reviews[evidenceReviewKey(check, index)] === "not_applicable").length,
    needsFollowUp: uncertain.filter(({ check, index }) => reviews[evidenceReviewKey(check, index)] === "needs_follow_up").length,
    pending: uncertain.filter(({ check, index }) => !reviews[evidenceReviewKey(check, index)]).length,
  };
}

export function getUnresolvedEvidenceItems(
  checks: Array<{ check: EvidenceCheck; index: number }>,
  reviews: EvidenceReviewMap,
) {
  return checks.filter(({ check, index }) => {
    if (!isUncertainEvidenceStatus(check.status)) return false;
    const review = reviews[evidenceReviewKey(check, index)];
    return !review || review === "needs_follow_up";
  });
}
