export type AssetContinuityItem = {
  key: string;
  label: string;
  priorYearValue: number;
  currentYearValue: number;
  priorYearStatus?: "present" | "sold" | "transferred" | "unknown";
  currentYearStatus?: "present" | "sold" | "transferred" | "unknown";
};

export type AssetContinuityFinding = {
  key: string;
  label: string;
  status: "continued" | "disposed" | "new_asset" | "value_changed" | "requires_verification";
  detail: string;
};

function money(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
}

export function compareYearToYearAssets(prior: AssetContinuityItem[], current: AssetContinuityItem[]) {
  const priorMap = new Map(prior.map((asset) => [asset.key, asset]));
  const currentMap = new Map(current.map((asset) => [asset.key, asset]));
  const findings: AssetContinuityFinding[] = [];

  for (const asset of current) {
    const previous = priorMap.get(asset.key);
    if (!previous) {
      findings.push({
        key: asset.key,
        label: asset.label,
        status: "new_asset",
        detail: `${asset.label} appears in the current-year asset set but was not present in the supplied prior-year asset set. Verify acquisition date, cost, and funding source.`,
      });
      continue;
    }

    const priorValue = money(previous.priorYearValue);
    const currentValue = money(asset.currentYearValue);
    if (asset.currentYearStatus === "present" && previous.priorYearStatus === "present" && Math.abs(priorValue - currentValue) === 0) {
      findings.push({ key: asset.key, label: asset.label, status: "continued", detail: `${asset.label} is present in both supplied years with the same recorded value.` });
    } else if (asset.currentYearStatus === "sold" || asset.currentYearStatus === "transferred") {
      findings.push({ key: asset.key, label: asset.label, status: "disposed", detail: `${asset.label} is marked as disposed/transferred in the current year. Verify sale/transfer proceeds and the corresponding wealth-statement treatment.` });
    } else if (priorValue !== currentValue) {
      findings.push({ key: asset.key, label: asset.label, status: "value_changed", detail: `${asset.label} changed from Rs ${priorValue.toLocaleString("en-PK")} to Rs ${currentValue.toLocaleString("en-PK")}. Verify whether this reflects a permitted valuation change, acquisition, improvement, disposal, or data correction.` });
    } else {
      findings.push({ key: asset.key, label: asset.label, status: "requires_verification", detail: `${asset.label} exists in both supplied years but its status requires verification.` });
    }
  }

  for (const asset of prior) {
    if (!currentMap.has(asset.key) && asset.priorYearStatus === "present") {
      findings.push({
        key: asset.key,
        label: asset.label,
        status: "requires_verification",
        detail: `${asset.label} was present in the supplied prior-year assets but is absent from the current-year asset set. Verify whether it was sold, transferred, gifted, or accidentally omitted.`,
      });
    }
  }

  return findings;
}
