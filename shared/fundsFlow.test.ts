import { describe, expect, it } from "vitest";
import { traceFundsAcrossAccounts } from "./fundsFlow";

describe("traceFundsAcrossAccounts", () => {
  it("traces a property sale through an own-account transfer to a later property payment", () => {
    const result = traceFundsAcrossAccounts([
      { rowNumber: 2, date: "2026-06-01", description: "Property sale proceeds", amount: 8_000_000, direction: "credit", accountRef: "A" },
      { rowNumber: 3, date: "2026-06-03", description: "Own account transfer", amount: -8_000_000, direction: "debit", accountRef: "A" },
      { rowNumber: 4, date: "2026-06-03", description: "Own account transfer", amount: 8_000_000, direction: "credit", accountRef: "B" },
      { rowNumber: 5, date: "2026-06-10", description: "Property purchase payment", amount: -7_000_000, direction: "debit", accountRef: "B" },
    ]);
    expect(result.crossAccountTransfers).toHaveLength(1);
    expect(result.links.some((link) => link.sourceRow === 2 && link.applicationRow === 5 && link.status === "partial")).toBe(true);
    expect(result.totals.tracedToApplications).toBe(7_000_000);
  });

  it("does not treat an unrelated same-amount debit as a source-of-funds link", () => {
    const result = traceFundsAcrossAccounts([
      { rowNumber: 2, date: "2026-06-01", description: "Property sale proceeds", amount: 8_000_000, direction: "credit", accountRef: "A" },
      { rowNumber: 3, date: "2026-06-03", description: "Contractor payment", amount: -8_000_000, direction: "debit", accountRef: "B" },
    ]);
    expect(result.links.some((link) => link.applicationRow === 3)).toBe(false);
    expect(result.totals.tracedToApplications).toBe(0);
  });

  it("does not count an own-account transfer as a new source", () => {
    const result = traceFundsAcrossAccounts([
      { rowNumber: 2, date: "2026-06-01", description: "Own account transfer", amount: 5_000_000, direction: "credit", accountRef: "B" },
      { rowNumber: 3, date: "2026-06-01", description: "Own account transfer", amount: -5_000_000, direction: "debit", accountRef: "A" },
    ]);
    expect(result.totals.sourceCredits).toBe(0);
  });
  it("supports a source split across two own-account transfers and multiple applications", () => {
    const result = traceFundsAcrossAccounts([
      { rowNumber: 10, date: "2026-06-01", description: "Property sale proceeds", amount: 10_000_000, direction: "credit", accountRef: "A" },
      { rowNumber: 11, date: "2026-06-02", description: "Own account transfer", amount: -6_000_000, direction: "debit", accountRef: "A" },
      { rowNumber: 12, date: "2026-06-02", description: "Own account transfer", amount: 6_000_000, direction: "credit", accountRef: "B" },
      { rowNumber: 13, date: "2026-06-03", description: "Own account transfer", amount: -4_000_000, direction: "debit", accountRef: "A" },
      { rowNumber: 14, date: "2026-06-03", description: "Own account transfer", amount: 4_000_000, direction: "credit", accountRef: "C" },
      { rowNumber: 15, date: "2026-06-05", description: "Property purchase payment", amount: -3_000_000, direction: "debit", accountRef: "B" },
      { rowNumber: 16, date: "2026-06-06", description: "Construction payment", amount: -2_000_000, direction: "debit", accountRef: "B" },
      { rowNumber: 17, date: "2026-06-07", description: "Property purchase payment", amount: -4_000_000, direction: "debit", accountRef: "C" },
    ]);
    expect(result.crossAccountTransfers).toHaveLength(2);
    expect(result.totals.tracedToApplications).toBe(9_000_000);
    expect(result.totals.unexplainedSourceCredits).toBe(1_000_000);
    expect(result.status).toBe("partial");
  });

  it("does not trace a source into an unrelated account without a matched transfer", () => {
    const result = traceFundsAcrossAccounts([
      { rowNumber: 20, date: "2026-06-01", description: "Property sale proceeds", amount: 5_000_000, direction: "credit", accountRef: "A" },
      { rowNumber: 21, date: "2026-06-02", description: "Property purchase payment", amount: -5_000_000, direction: "debit", accountRef: "B" },
    ]);
    expect(result.totals.tracedToApplications).toBe(0);
    expect(result.status).toBe("needs_review");
  });

});
