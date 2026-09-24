import { describe, expect, it } from "vitest";
import { reconcileLiabilityBalances, summarizeLiabilityBalances } from "./liabilityBalanceReconciliation";

describe("liability balance reconciliation", () => {
  it("reconciles opening liability plus drawdown less repayment", () => {
    const r = reconcileLiabilityBalances(
      [{ label: "J5 Premium loan", amount: 2_000_000 }],
      [{ label: "J5 Premium loan", amount: 8_000_000 }],
      [{ liabilityLabel: "J5 Premium loan", drawdownAmount: 6_500_000, repaymentAmount: 500_000, status: "partial" }],
    );
    expect(r[0].expectedClosingAmount).toBe(8_000_000);
    expect(r[0].difference).toBe(0);
    expect(r[0].status).toBe("reconciled");
  });

  it("flags a closing balance mismatch", () => {
    const r = reconcileLiabilityBalances(
      [{ label: "Loan A", amount: 2_000_000 }],
      [{ label: "Loan A", amount: 9_000_000 }],
      [{ liabilityLabel: "Loan A", drawdownAmount: 6_500_000, repaymentAmount: 500_000, status: "partial" }],
    );
    expect(r[0].expectedClosingAmount).toBe(8_000_000);
    expect(r[0].status).toBe("mismatch");
  });

  it("requires verification when a new liability has no traced bank movement", () => {
    const r = reconcileLiabilityBalances(
      [],
      [{ label: "Payable A", amount: 6_500_000 }],
      [],
    );
    expect(r[0].status).toBe("requires_verification");
  });

  it("does not reuse one bank trace across liabilities", () => {
    const r = reconcileLiabilityBalances(
      [],
      [{ label: "Loan A", amount: 500_000 }, { label: "Loan B", amount: 500_000 }],
      [{ liabilityLabel: "Loan A", drawdownAmount: 500_000, repaymentAmount: 0, status: "drawdown_traced" }],
    );
    expect(r[0].status).toBe("reconciled");
    expect(r[1].status).toBe("requires_verification");
  });

  it("summarizes statuses", () => {
    const r = summarizeLiabilityBalances([
      { label: "A", priorYearAmount: 1, drawdownAmount: 1, repaymentAmount: 0, expectedClosingAmount: 2, currentYearAmount: 2, difference: 0, status: "reconciled", detail: "" },
      { label: "B", priorYearAmount: 1, drawdownAmount: 0, repaymentAmount: 0, expectedClosingAmount: 1, currentYearAmount: 2, difference: 1, status: "mismatch", detail: "" },
    ]);
    expect(r.reconciled).toBe(1);
    expect(r.mismatches).toBe(1);
  });
});
