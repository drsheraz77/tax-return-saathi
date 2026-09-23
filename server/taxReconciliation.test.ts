import { describe, expect, it } from "vitest";
import { calculateWealthReconciliation, compareBankBalances, traceFunds } from "./taxReconciliation";

describe("deterministic tax reconciliation", () => {
  it("shows the exact wealth difference instead of asking the model to do arithmetic", () => {
    const result = calculateWealthReconciliation({
      openingWealth: 50_000_000,
      income: 10_000_000,
      assetSaleProceeds: 11_000_000,
      otherSources: 2_000_000,
      assetPurchases: 14_000_000,
      investments: 1_000_000,
      personalExpenditure: 4_000_000,
      declaredClosingWealth: 54_000_000,
    });

    expect(result.totalSources).toBe(73_000_000);
    expect(result.totalApplications).toBe(19_000_000);
    expect(result.expectedClosingWealth).toBe(54_000_000);
    expect(result.unexplainedDifference).toBe(0);
    expect(result.status).toBe("reconciled");
  });

  it("makes the unexplained difference explicit", () => {
    const result = calculateWealthReconciliation({
      openingWealth: 50_000_000,
      income: 10_000_000,
      assetPurchases: 14_000_000,
      personalExpenditure: 4_000_000,
      declaredClosingWealth: 40_000_000,
    });

    expect(result.expectedClosingWealth).toBe(42_000_000);
    expect(result.unexplainedDifference).toBe(-2_000_000);
    expect(result.status).toBe("needs_review");
  });

  it("cross-checks bank closing balances without exposing account identifiers", () => {
    const result = compareBankBalances([
      { accountRef: "HBL account 1", statementClosingBalance: 7_446_331.7, declaredWealthBalance: 5_000_000 },
    ]);

    expect(result[0]).toMatchObject({ difference: 2_446_331.7, status: "needs_review" });
    expect(result[0].accountRef).toBe("HBL account 1");
  });

  it("traces prior-year funds into current-year applications", () => {
    const result = traceFunds({
      openingFunds: 11_000_000,
      saleProceeds: 8_000_000,
      assetPurchases: 14_000_000,
      construction: 2_000_000,
      vehicleBookings: 1_500_000,
    });

    expect(result.totalAvailable).toBe(19_000_000);
    expect(result.totalApplications).toBe(17_500_000);
    expect(result.remainingFunds).toBe(1_500_000);
    expect(result.status).toBe("traceable");
  });
});
