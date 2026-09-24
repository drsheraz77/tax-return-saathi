export type LiabilityContinuityStatus = "continued" | "new" | "settled" | "increased" | "decreased" | "requires_verification";

export type LiabilityContinuityItem = {
  label: string;
  priorYearAmount: number;
  currentYearAmount: number;
  status: LiabilityContinuityStatus;
  difference: number;
  evidenceRef: string;
  detail: string;
};

function money(n: number) { return Math.round(n * 100) / 100; }
function norm(s: string) { return s.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

function similarity(a: string, b: string) {
  const aa = new Set(norm(a).split(" ").filter(x => x.length >= 3));
  const bb = new Set(norm(b).split(" ").filter(x => x.length >= 3));
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  for (const x of aa) if (bb.has(x)) common++;
  return common / Math.max(aa.size, bb.size);
}

export function compareYearToYearLiabilities(
  prior: Array<{ label: string; amount: number }>,
  current: Array<{ label: string; amount: number; evidenceRef: string }>,
): LiabilityContinuityItem[] {
  const usedPrior = new Set<number>();
  const results: LiabilityContinuityItem[] = [];

  current.forEach(item => {
    let best = -1, score = 0;
    prior.forEach((p, i) => {
      if (usedPrior.has(i)) return;
      const s = similarity(p.label, item.label);
      if (s > score) { score = s; best = i; }
    });
    const currentAmount = money(Math.max(0, item.amount));
    if (best < 0 || score < 0.5) {
      results.push({ label: item.label, priorYearAmount: 0, currentYearAmount: currentAmount, status: "new", difference: currentAmount, evidenceRef: item.evidenceRef, detail: "A current-year liability has no sufficiently similar prior-year liability record." });
      return;
    }
    usedPrior.add(best);
    const priorAmount = money(Math.max(0, prior[best].amount));
    const difference = money(currentAmount - priorAmount);
    let status: LiabilityContinuityStatus = "continued";
    if (currentAmount <= 1 && priorAmount > 1) status = "settled";
    else if (difference > 1) status = "increased";
    else if (difference < -1) status = "decreased";
    results.push({ label: item.label, priorYearAmount: priorAmount, currentYearAmount: currentAmount, status, difference, evidenceRef: item.evidenceRef, detail: "The current liability was matched conservatively to the closest prior-year label. Verify the underlying loan/payable statement and reporting date." });
  });

  prior.forEach((item, i) => {
    if (!usedPrior.has(i) && Math.abs(item.amount) > 1) {
      results.push({ label: item.label, priorYearAmount: money(item.amount), currentYearAmount: 0, status: "settled", difference: money(-item.amount), evidenceRef: "", detail: "A prior-year liability was not found in the current-year liability list; verify whether it was settled, transferred, refinanced, or omitted." });
    }
  });
  return results;
}

export function summarizeLiabilityContinuity(results: LiabilityContinuityItem[]) {
  return {
    total: results.length,
    continued: results.filter(x => x.status === "continued").length,
    new: results.filter(x => x.status === "new").length,
    settled: results.filter(x => x.status === "settled").length,
    increased: results.filter(x => x.status === "increased").length,
    decreased: results.filter(x => x.status === "decreased").length,
    requiresVerification: results.filter(x => x.status === "requires_verification").length,
    results,
  };
}
