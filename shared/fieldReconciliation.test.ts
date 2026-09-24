import { describe, expect, it } from "vitest";
import { reconcileDocumentToReturn, summarizeFieldReconciliation } from "./fieldReconciliation";

describe("reconcileDocumentToReturn", () => {
  it("matches salary withholding against the salary certificate", () => {
    const result = reconcileDocumentToReturn({
      profile: { employerRecords: [{ salaryTaxDeducted: 120000, certificateTaxDeducted: 120000 }] },
    });
    expect(result[0].status).toBe("matched");
  });

  it("flags a salary withholding mismatch", () => {
    const result = reconcileDocumentToReturn({
      profile: { employerRecords: [{ salaryTaxDeducted: 120000, certificateTaxDeducted: 110000 }] },
    });
    expect(result[0].status).toBe("mismatch");
    expect(result[0].difference).toBe(10000);
  });

  it("reconciles Wealth Statement bank balance with the bank statement", () => {
    const result = reconcileDocumentToReturn({
      bankChecks: [{ accountRef: "Bank A", statementClosingBalance: 7446331.7, declaredWealthBalance: 7000000 }],
    });
    expect(result[0].status).toBe("mismatch");
    expect(result[0].difference).toBe(446331.7);
  });

  it("keeps acquisition cost and FBR valuation as a verification distinction", () => {
    const result = reconcileDocumentToReturn({
      properties: [{ label: "Palm IV", acquisitionCost: 14000000, fbrValuation: 2640000, saleProceeds: 0, evidenceRef: "property document" }],
    });
    expect(result[0].status).toBe("requires_verification");
    expect(result[0].difference).toBe(11360000);
  });

  it("matches declared property sale consideration to supporting proceeds", () => {
    const result = reconcileDocumentToReturn({
      properties: [{ label: "Plot A", acquisitionCost: 0, fbrValuation: 0, saleProceeds: 8000000, evidenceRef: "sale document" }],
      profile: { declaredCapitalGains: [{ description: "Plot A", salePrice: 8000000 }] },
    });
    expect(result[0].status).toBe("matched");
  });

  it("summarizes reconciliation statuses", () => {
    const summary = summarizeFieldReconciliation([
      { field: "a", returnValue: 10, evidenceValue: 10, difference: 0, status: "matched", evidenceRef: "doc", detail: "" },
      { field: "b", returnValue: 20, evidenceValue: 10, difference: 10, status: "mismatch", evidenceRef: "doc", detail: "" },
    ]);
    expect(summary.total).toBe(2);
    expect(summary.matched).toBe(1);
    expect(summary.mismatches).toBe(1);
  });
});
