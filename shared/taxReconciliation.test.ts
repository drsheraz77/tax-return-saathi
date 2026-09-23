import { describe, expect, it } from "vitest";
import { analyzeParsedTransactions } from "./taxReconciliation";

describe("analyzeParsedTransactions", () => {
  it("detects same-day debit and credit transfer candidates", () => {
    const result = analyzeParsedTransactions([
      { rowNumber: 2, date: "2026-06-10", description: "IBFT own account", amount: -500000, direction: "debit" },
      { rowNumber: 3, date: "2026-06-10", description: "Funds transfer", amount: 500000, direction: "credit" },
    ]);
    expect(result.internalTransferCandidates).toHaveLength(1);
    expect(result.internalTransferCandidates[0]).toMatchObject({ debitRow: 2, creditRow: 3, amount: 500000 });
  });

  it("detects repeated transfer descriptions as possible duplicates", () => {
    const result = analyzeParsedTransactions([
      { rowNumber: 2, date: "2026-06-10", description: "IBFT own account", amount: 500000, direction: "credit" },
      { rowNumber: 3, date: "2026-06-10", description: "IBFT own account", amount: 500000, direction: "credit" },
    ]);
    expect(result.duplicateTransfers).toHaveLength(1);
  });
});
