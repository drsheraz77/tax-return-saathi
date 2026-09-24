export type LiabilityItem = {
  label: string;
  amount: number;
  liabilityType: "loan" | "payable" | "credit" | "other";
  priorYearAmount?: number;
  evidenceRef: string;
};

export type AssetLiabilityResult = {
  assetLabel: string;
  assetValue: number;
  matchedLiabilityAmount: number;
  unmatchedAssetAmount: number;
  liabilityLabels: string[];
  status: "consistent" | "partial" | "requires_verification";
  detail: string;
};

const TOLERANCE = 1;

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function related(assetLabel: string, liabilityLabel: string) {
  const a = normalize(assetLabel).split(" ").filter(x => x.length >= 3);
  const b = normalize(liabilityLabel).split(" ").filter(x => x.length >= 3);
  if (!a.length || !b.length) return false;
  return a.some(term => b.includes(term));
}

export function reconcileAssetLiabilities(
  assets: Array<{ label: string; value: number }>,
  liabilities: LiabilityItem[],
): AssetLiabilityResult[] {
  const used = new Set<number>();

  return assets.map(asset => {
    const value = Math.max(0, Number.isFinite(asset.value) ? asset.value : 0);
    const matches = liabilities
      .map((liability, index) => ({ liability, index }))
      .filter(x => !used.has(x.index) && related(asset.label, x.liability.label))
      .sort((a, b) => b.liability.amount - a.liability.amount);

    let matched = 0;
    const labels: string[] = [];
    for (const candidate of matches) {
      if (matched >= value - TOLERANCE) break;
      const available = Math.max(0, candidate.liability.amount);
      const applied = Math.min(available, value - matched);
      if (applied <= TOLERANCE) continue;
      matched += applied;
      labels.push(candidate.liability.label);
      used.add(candidate.index);
    }

    const unmatched = money(Math.max(0, value - matched));
    let status: AssetLiabilityResult["status"] = "requires_verification";
    if (matched <= TOLERANCE) status = "requires_verification";
    else if (unmatched <= TOLERANCE) status = "consistent";
    else status = "partial";

    return {
      assetLabel: asset.label,
      assetValue: money(value),
      matchedLiabilityAmount: money(matched),
      unmatchedAssetAmount: unmatched,
      liabilityLabels: labels,
      status,
      detail: labels.length
        ? "A liability with a related asset label was identified. Confirm the legal/documented liability, reporting date and amount; a booking or future payment obligation is not automatically treated as a liability."
        : "No related liability was established from the supplied evidence. This does not prove that the asset was purchased without financing.",
    };
  });
}

export function summarizeAssetLiabilities(results: AssetLiabilityResult[]) {
  return {
    totalAssets: results.length,
    consistent: results.filter(x => x.status === "consistent").length,
    partial: results.filter(x => x.status === "partial").length,
    requiresVerification: results.filter(x => x.status === "requires_verification").length,
    results,
  };
}
