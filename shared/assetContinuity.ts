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

function normalizeAssetLabel(value: string) {
  return String(value || "").toLocaleLowerCase()
    .replace(/\b(plot|property|house|vehicle|car|residential|commercial|phase|block|sector)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function assetMatchScore(a: AssetContinuityItem, b: AssetContinuityItem) {
  if (a.key && b.key && a.key === b.key) return 1;
  const left = normalizeAssetLabel(a.label || a.key), right = normalizeAssetLabel(b.label || b.key);
  if (!left || !right) return 0;
  if (left === right) return 0.95;
  if (left.includes(right) || right.includes(left)) return 0.85;
  const lt = new Set(left.split(" ")), rt = new Set(right.split(" "));
  const intersection = Array.from(lt).filter((token) => rt.has(token)).length;
  const union = new Set(Array.from(lt).concat(Array.from(rt))).size;
  return union ? intersection / union : 0;
}

export function compareYearToYearAssets(prior: AssetContinuityItem[], current: AssetContinuityItem[]) {
  const findings: AssetContinuityFinding[] = [];
  const unmatchedPrior = new Set(prior.map((_, index) => index));
  const matchedCurrent = new Set<number>();
  for (let currentIndex = 0; currentIndex < current.length; currentIndex += 1) {
    const asset = current[currentIndex]; let bestIndex = -1; let bestScore = 0;
    for (const priorIndex of Array.from(unmatchedPrior)) { const score = assetMatchScore(prior[priorIndex], asset); if (score > bestScore) { bestScore = score; bestIndex = priorIndex; } }
    if (bestIndex >= 0 && bestScore >= 0.85) {
      const previous = prior[bestIndex]; unmatchedPrior.delete(bestIndex); matchedCurrent.add(currentIndex);
      const priorValue = money(previous.priorYearValue), currentValue = money(asset.currentYearValue);
      if (asset.currentYearStatus === "sold" || asset.currentYearStatus === "transferred") findings.push({ key: asset.key, label: asset.label, status: "disposed", detail: asset.label + " matches prior-year asset " + previous.label + ". Verify sale/transfer proceeds and wealth-statement treatment." });
      else if (previous.priorYearStatus === "present" && asset.currentYearStatus === "present" && priorValue === currentValue) findings.push({ key: asset.key, label: asset.label, status: "continued", detail: asset.label + " matches the prior-year asset and the recorded value is unchanged." });
      else if (priorValue !== currentValue) findings.push({ key: asset.key, label: asset.label, status: "value_changed", detail: asset.label + " matches the prior-year asset but changed from Rs " + priorValue.toLocaleString("en-PK") + " to Rs " + currentValue.toLocaleString("en-PK") + ". Verify the reason." });
      else findings.push({ key: asset.key, label: asset.label, status: "requires_verification", detail: asset.label + " appears to match the prior-year asset, but its continuity status requires verification." });
    }
  }
  for (let currentIndex = 0; currentIndex < current.length; currentIndex += 1) if (!matchedCurrent.has(currentIndex)) { const asset = current[currentIndex]; findings.push({ key: asset.key, label: asset.label, status: "new_asset", detail: asset.label + " was not confidently matched to the supplied prior-year asset set. Verify acquisition date, cost, and funding source." }); }
  for (const priorIndex of Array.from(unmatchedPrior)) { const asset = prior[priorIndex]; if (asset.priorYearStatus === "present") findings.push({ key: asset.key, label: asset.label, status: "requires_verification", detail: asset.label + " was present in the prior-year assets but was not confidently matched to a current-year asset. Verify whether it was sold, transferred, gifted, or omitted." }); }
  return findings;
}
