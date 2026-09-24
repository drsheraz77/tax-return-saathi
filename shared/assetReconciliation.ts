export type AssetReconciliationStatus = "matched" | "mismatch" | "requires_verification" | "missing_from_return";

export type AssetReconciliation = {
  assetType: "investment" | "vehicle" | "other";
  label: string;
  statementValue: number;
  declaredValue: number;
  difference: number;
  status: AssetReconciliationStatus;
  evidenceRef: string;
  detail: string;
};

const TOLERANCE = 1;
const money = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;

export type AssetReconciliationInput = {
  investments?: Array<{ label: string; statementValue: number; declaredValue: number; evidenceRef: string }>;
  vehicles?: Array<{ label: string; statementValue: number; declaredValue: number; evidenceRef: string }>;
  otherAssets?: Array<{ label: string; statementValue: number; declaredValue: number; evidenceRef: string }>;
};

function reconcile(assetType: AssetReconciliation["assetType"], item: { label: string; statementValue: number; declaredValue: number; evidenceRef: string }): AssetReconciliation {
  const statementValue = money(item.statementValue);
  const declaredValue = money(item.declaredValue);
  const difference = money(declaredValue - statementValue);
  return {
    assetType,
    label: item.label,
    statementValue,
    declaredValue,
    difference,
    status: Math.abs(difference) <= TOLERANCE ? "matched" : "mismatch",
    evidenceRef: item.evidenceRef,
    detail: "The supporting statement value is compared with the corresponding Wealth Statement value. Confirm the applicable valuation basis and reporting date before changing the return.",
  };
}

export function reconcileAssets(inputs: AssetReconciliationInput): AssetReconciliation[] {
  return [
    ...(inputs.investments ?? []).map(item => reconcile("investment", item)),
    ...(inputs.vehicles ?? []).map(item => reconcile("vehicle", item)),
    ...(inputs.otherAssets ?? []).map(item => reconcile("other", item)),
  ];
}

export function summarizeAssetReconciliation(results: AssetReconciliation[]) {
  return {
    total: results.length,
    matched: results.filter(x => x.status === "matched").length,
    mismatches: results.filter(x => x.status === "mismatch").length,
    requiresVerification: results.filter(x => x.status === "requires_verification").length,
    missingFromReturn: results.filter(x => x.status === "missing_from_return").length,
    results,
  };
}
