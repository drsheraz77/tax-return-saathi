export type LiabilityBalanceStatus = "reconciled" | "mismatch" | "requires_verification";

export type LiabilityBalanceItem = {
  label: string;
  priorYearAmount: number;
  drawdownAmount: number;
  repaymentAmount: number;
  expectedClosingAmount: number;
  currentYearAmount: number;
  difference: number;
  status: LiabilityBalanceStatus;
  detail: string;
};

const TOLERANCE = 1;
const money = (n: number) => Math.round(n * 100) / 100;

export function reconcileLiabilityBalances(
  prior: Array<{ label: string; amount: number }>,
  current: Array<{ label: string; amount: number }>,
  bankTrace: Array<{ liabilityLabel: string; drawdownAmount: number; repaymentAmount: number; status: string }>,
): LiabilityBalanceItem[] {
  const usedPrior = new Set<number>();
  const usedTrace = new Set<number>();

  return current.map(item => {
    let bestPrior = -1;
    let bestScore = 0;
    const words = (s: string) => s.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter(x => x.length >= 3);
    const similarity = (a: string, b: string) => {
      const aa = new Set(words(a));
      const bb = new Set(words(b));
      if (!aa.size || !bb.size) return 0;
      let common = 0;
      for (const word of aa) if (bb.has(word)) common++;
      return common / Math.max(aa.size, bb.size);
    };

    prior.forEach((p, i) => {
      if (usedPrior.has(i)) return;
      const score = similarity(p.label, item.label);
      if (score > bestScore) {
        bestScore = score;
        bestPrior = i;
      }
    });

    if (bestPrior >= 0 && bestScore >= 0.5) usedPrior.add(bestPrior);
    const priorAmount = bestPrior >= 0 && bestScore >= 0.5 ? money(Math.max(0, prior[bestPrior].amount)) : 0;

    let bestTrace = -1;
    let traceScore = 0;
    bankTrace.forEach((trace, i) => {
      if (usedTrace.has(i)) return;
      const score = similarity(trace.liabilityLabel, item.label);
      if (score > traceScore) {
        traceScore = score;
        bestTrace = i;
      }
    });

    let drawdown = 0;
    let repayment = 0;
    let traceStatus = "requires_verification";
    if (bestTrace >= 0 && traceScore >= 0.5) {
      usedTrace.add(bestTrace);
      drawdown = money(Math.max(0, bankTrace[bestTrace].drawdownAmount));
      repayment = money(Math.max(0, bankTrace[bestTrace].repaymentAmount));
      traceStatus = bankTrace[bestTrace].status;
    }

    const currentAmount = money(Math.max(0, item.amount));
    const expectedClosing = money(priorAmount + drawdown - repayment);
    const difference = money(currentAmount - expectedClosing);
    let status: LiabilityBalanceStatus = "requires_verification";

    if (Math.abs(difference) <= TOLERANCE) {
      status = traceStatus === "requires_verification" && currentAmount !== priorAmount
        ? "requires_verification"
        : "reconciled";
    } else if (bestTrace >= 0 && traceScore >= 0.5) {
      status = "mismatch";
    }

    const detail = status === "reconciled"
      ? "Opening liability plus traced drawdowns less traced repayments reconciles to the current liability amount."
      : status === "mismatch"
        ? "The calculated closing liability does not match the amount reported for the current year."
        : "The liability balance cannot be fully established from the supplied prior-year liability and bank evidence. Verify the lender/payable statement and reporting date.";

    return {
      label: item.label,
      priorYearAmount: priorAmount,
      drawdownAmount: drawdown,
      repaymentAmount: repayment,
      expectedClosingAmount: expectedClosing,
      currentYearAmount: currentAmount,
      difference,
      status,
      detail,
    };
  });
}

export function summarizeLiabilityBalances(results: LiabilityBalanceItem[]) {
  return {
    total: results.length,
    reconciled: results.filter(x => x.status === "reconciled").length,
    mismatches: results.filter(x => x.status === "mismatch").length,
    requiresVerification: results.filter(x => x.status === "requires_verification").length,
    results,
  };
}
