export type WealthInputs = {
  openingWealth?: number | null;
  income?: number | null;
  capitalReceipts?: number | null;
  assetSaleProceeds?: number | null;
  loans?: number | null;
  gifts?: number | null;
  otherSources?: number | null;
  personalExpenditure?: number | null;
  taxPaid?: number | null;
  assetPurchases?: number | null;
  investments?: number | null;
  loanRepayment?: number | null;
  otherApplications?: number | null;
  declaredClosingWealth?: number | null;
};

export type BankBalanceCheck = {
  accountRef: string;
  statementClosingBalance: number;
  declaredWealthBalance: number;
};

export type FundsTraceInputs = {
  openingFunds?: number | null;
  saleProceeds?: number | null;
  income?: number | null;
  loans?: number | null;
  gifts?: number | null;
  otherReceipts?: number | null;
  assetPurchases?: number | null;
  construction?: number | null;
  vehicleBookings?: number | null;
  otherApplications?: number | null;
};

const MONEY_TOLERANCE = 1;

export function money(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

const sum = (values: unknown[]) => money(values.reduce((total: number, value: unknown) => total + money(value), 0));

export function calculateWealthReconciliation(input: WealthInputs) {
  const sources = {
    openingWealth: money(input.openingWealth),
    income: money(input.income),
    capitalReceipts: money(input.capitalReceipts),
    assetSaleProceeds: money(input.assetSaleProceeds),
    loans: money(input.loans),
    gifts: money(input.gifts),
    otherSources: money(input.otherSources),
  };
  const applications = {
    personalExpenditure: money(input.personalExpenditure),
    taxPaid: money(input.taxPaid),
    assetPurchases: money(input.assetPurchases),
    investments: money(input.investments),
    loanRepayment: money(input.loanRepayment),
    otherApplications: money(input.otherApplications),
  };
  const totalSources = sum(Object.values(sources));
  const totalApplications = sum(Object.values(applications));
  const expectedClosingWealth = money(totalSources - totalApplications);
  const declaredClosingWealth = money(input.declaredClosingWealth);
  const unexplainedDifference = money(declaredClosingWealth - expectedClosingWealth);

  return {
    status: Math.abs(unexplainedDifference) <= MONEY_TOLERANCE ? "reconciled" : "needs_review",
    sources,
    totalSources,
    applications,
    totalApplications,
    expectedClosingWealth,
    declaredClosingWealth,
    unexplainedDifference,
    tolerance: MONEY_TOLERANCE,
  } as const;
}

export function compareBankBalances(checks: BankBalanceCheck[]) {
  return checks.map((check) => {
    const statementClosingBalance = money(check.statementClosingBalance);
    const declaredWealthBalance = money(check.declaredWealthBalance);
    const difference = money(statementClosingBalance - declaredWealthBalance);
    return {
      accountRef: String(check.accountRef || "unidentified account").slice(0, 80),
      statementClosingBalance,
      declaredWealthBalance,
      difference,
      status: Math.abs(difference) <= MONEY_TOLERANCE ? "matched" : "needs_review",
    } as const;
  });
}

export function traceFunds(input: FundsTraceInputs) {
  const openingFunds = money(input.openingFunds);
  const receipts = {
    saleProceeds: money(input.saleProceeds),
    income: money(input.income),
    loans: money(input.loans),
    gifts: money(input.gifts),
    otherReceipts: money(input.otherReceipts),
  };
  const applications = {
    assetPurchases: money(input.assetPurchases),
    construction: money(input.construction),
    vehicleBookings: money(input.vehicleBookings),
    otherApplications: money(input.otherApplications),
  };
  const totalAvailable = money(openingFunds + sum(Object.values(receipts)));
  const totalApplications = sum(Object.values(applications));
  const remainingFunds = money(totalAvailable - totalApplications);

  return {
    openingFunds,
    receipts,
    totalAvailable,
    applications,
    totalApplications,
    remainingFunds,
    status: remainingFunds < -MONEY_TOLERANCE ? "needs_review" : "traceable",
  } as const;
}

export const TAX_ANALYSIS_EVIDENCE = [
  "CONFIRMED: directly visible or explicitly stated in supplied material.",
  "CALCULATED: derived by deterministic arithmetic from confirmed values.",
  "INFERRED: plausible interpretation that is not directly documented.",
  "REQUIRES_VERIFICATION: cannot be established from available material.",
  "POTENTIAL_ISSUE: merits qualified tax or legal review; it is not a determination.",
] as const;
