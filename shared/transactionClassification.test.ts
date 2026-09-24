import { describe, expect, it } from "vitest";
import { parseTabularTransactions } from "./taxReconciliation";
import { summarizeTransactionClassification } from "./transactionClassification";

describe("transaction classification", () => {
  it("recognizes likely internal transfers and property/vehicle transactions without treating labels as proof", () => {
    const analysis = parseTabularTransactions([
      "Date,Description,Amount",
      "2026-03-01,Own Account Transfer,1500000",
      "2026-03-02,Palm IV plot purchase,14000000",
      "2026-03-03,Jaecoo J5 booking,1500000",
    ].join("\n"));

    const result = summarizeTransactionClassification(analysis);
    expect(result.classifications).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: "internal_transfer", confidence: "high" }),
      expect.objectContaining({ category: "property_purchase", confidence: "medium" }),
      expect.objectContaining({ category: "vehicle", confidence: "medium" }),
    ]));
  });

  it("retains duplicate and same-date debit/credit transfer signals", () => {
    const analysis = parseTabularTransactions([
      "Date,Description,Debit,Credit",
      "2026-03-05,Own Account Transfer,100000,",
      "2026-03-05,Internal Transfer,,100000",
    ].join("\n"));

    const result = summarizeTransactionClassification(analysis);
    expect(result.internalTransferCandidates).toHaveLength(1);
    expect(result.internalTransferCandidates[0]).toMatchObject({ amount: 100000 });
  });
});
