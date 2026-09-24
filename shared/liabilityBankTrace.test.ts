import { describe, expect, it } from "vitest";
import { traceLiabilityBankMovements, summarizeLiabilityBankMovements } from "./liabilityBankTrace";

describe("liability bank trace", () => {
  it("traces a loan drawdown", () => {
    const r = traceLiabilityBankMovements([{ rowNumber: 1, date: "2026-06-01", description: "J5 Premium loan disbursement", amount: 6500000, direction: "credit", accountRef: "A" }], [{ label: "J5 Premium loan", amount: 6500000 }]);
    expect(r[0].status).toBe("drawdown_traced");
    expect(r[0].drawdownAmount).toBe(6500000);
  });
  it("traces repayment", () => {
    const r = traceLiabilityBankMovements([{ rowNumber: 2, date: "2026-06-20", description: "J5 Premium loan repayment", amount: 500000, direction: "debit", accountRef: "A" }], [{ label: "J5 Premium loan", amount: 6500000 }]);
    expect(r[0].status).toBe("repayment_traced");
  });
  it("does not reuse one repayment across liabilities", () => {
    const rows = [{ rowNumber: 3, date: "2026-06-20", description: "Loan repayment", amount: 500000, direction: "debit" as const, accountRef: "A" }];
    const r = traceLiabilityBankMovements(rows, [{ label: "Loan A", amount: 500000 }, { label: "Loan B", amount: 500000 }]);
    expect(r[0].repaymentAmount).toBe(500000);
    expect(r[1].repaymentAmount).toBe(0);
  });
  it("summarizes", () => {
    const r = summarizeLiabilityBankMovements(traceLiabilityBankMovements([{ rowNumber: 4, date: "2026-06-20", description: "Loan A disbursement", amount: 100, direction: "credit", accountRef: "A" }], [{ label: "Loan A", amount: 100 }]));
    expect(r.drawdownsTraced).toBe(1);
  });
});
