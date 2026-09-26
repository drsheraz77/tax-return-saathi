import { normalizeLegacyNumericEvidence, type EvidenceValue } from "./evidenceState";

export type EvidenceCheckStatus = "MATCHED" | "MISMATCH" | "REQUIRES_VERIFICATION" | "EVIDENCE_NOT_PROVIDED";

export type EvidenceCheck = {
  category: "bank" | "asset" | "liability";
  label: string;
  declared: EvidenceValue;
  supporting: EvidenceValue;
  difference: number | null;
  status: EvidenceCheckStatus;
  detail: string;
};

export type EvidenceCheckSummary = {
  total: number;
  matched: number;
  mismatches: number;
  requiresVerification: number;
  evidenceNotProvided: number;
  results: EvidenceCheck[];
};

const TOLERANCE = 1;

function money(value: number | null) {
  return value === null ? null : Math.round(value * 100) / 100;
}

function label(value: unknown, fallback: string) {
  return String(value || fallback).slice(0, 100);
}

function compare(
  category: EvidenceCheck["category"],
  itemLabel: string,
  declaredValue: unknown,
  supportingValue: unknown,
  sourceRef: string,
): EvidenceCheck {
  const declared = normalizeLegacyNumericEvidence(declaredValue);
  const supporting = normalizeLegacyNumericEvidence(supportingValue, { sourceRef: sourceRef || undefined });
  const hasUnknown = declared.status === "UNKNOWN" || declared.status === "NOT_FOUND" || supporting.status === "UNKNOWN" || supporting.status === "NOT_FOUND";

  if (hasUnknown) {
    return {
      category,
      label: itemLabel,
      declared,
      supporting,
      difference: null,
      status: "EVIDENCE_NOT_PROVIDED",
      detail: "One or both comparison values were not established. This is not evidence of a zero balance or a settled item.",
    };
  }

  const difference = money((declared.value ?? 0) - (supporting.value ?? 0));
  const matched = Math.abs(difference ?? 0) <= TOLERANCE;
  return {
    category,
    label: itemLabel,
    declared,
    supporting,
    difference,
    status: matched ? "MATCHED" : "MISMATCH",
    detail: matched
      ? "The established values match within the arithmetic tolerance; verify the reporting date and valuation basis."
      : "The established values differ; verify the source record, reporting date, and applicable reporting field.",
  };
}

export function buildBankEvidenceChecks(checks: Array<{ accountRef: string; statementClosingBalance: number; declaredWealthBalance: number }>): EvidenceCheck[] {
  return checks.map((item) => compare("bank", label(item.accountRef, "Bank balance"), item.declaredWealthBalance, item.statementClosingBalance, item.accountRef));
}

export function buildAssetEvidenceChecks(items: Array<{ label: string; statementValue: number; declaredValue: number; evidenceRef: string }>): EvidenceCheck[] {
  return items.map((item) => compare("asset", label(item.label, "Asset"), item.declaredValue, item.statementValue, item.evidenceRef));
}

function normalized(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function buildLiabilityEvidenceChecks(
  prior: Array<{ label: string; amount: number }>,
  current: Array<{ label: string; amount: number; evidenceRef: string }>,
): EvidenceCheck[] {
  return current.map((item) => {
    const priorItem = prior.find((candidate) => normalized(candidate.label) === normalized(item.label));
    return compare("liability", label(item.label, "Liability"), item.amount, priorItem?.amount, item.evidenceRef);
  });
}

export function summarizeEvidenceChecks(results: EvidenceCheck[]): EvidenceCheckSummary {
  return {
    total: results.length,
    matched: results.filter((item) => item.status === "MATCHED").length,
    mismatches: results.filter((item) => item.status === "MISMATCH").length,
    requiresVerification: results.filter((item) => item.status === "REQUIRES_VERIFICATION").length,
    evidenceNotProvided: results.filter((item) => item.status === "EVIDENCE_NOT_PROVIDED").length,
    results,
  };
}
