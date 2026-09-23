import { describe, expect, it } from "vitest";
import { calculateCapitalGain, calculatePropertyFundsFlow, capitalGainDocumentChecklist } from "../shared/capitalGains";

describe("deterministic capital-gains and property worksheet", () => {
  it("calculates property cost basis, net proceeds, gain, holding days, and ownership share", () => {
    const result = calculateCapitalGain({
      assetType: "property",
      acquisitionDate: "2022-01-01",
      saleDate: "2026-06-30",
      ownershipPercent: 50,
      purchasePrice: 14_000_000,
      improvementCost: 1_000_000,
      purchaseExpenses: 200_000,
      salePrice: 22_000_000,
      saleExpenses: 300_000,
    });

    expect(result.wholeAssetCostBasis).toBe(15_200_000);
    expect(result.wholeAssetNetProceeds).toBe(21_700_000);
    expect(result.wholeAssetGainOrLoss).toBe(6_500_000);
    expect(result.costBasis).toBe(7_600_000);
    expect(result.netProceeds).toBe(10_850_000);
    expect(result.gainOrLoss).toBe(3_250_000);
    expect(result.result).toBe("gain");
    expect(result.holdingDays).toBe(1641);
  });

  it("keeps a comparison value as a review flag and does not calculate tax", () => {
    const result = calculateCapitalGain({
      assetType: "shares",
      purchasePrice: 1_000_000,
      salePrice: 1_200_000,
      declaredValueOrFbrValue: 1_100_000,
      ownershipPercent: 100,
    });

    expect(result.gainOrLoss).toBe(200_000);
    expect(result.valueDifference).toBe(100_000);
    expect(result.reviewFlags.some((flag) => flag.includes("comparison value"))).toBe(true);
    expect(result).not.toHaveProperty("taxDue");
    expect(result).not.toHaveProperty("taxRate");
  });

  it("reconciles property purchase funding and sale proceeds after loan settlement", () => {
    const result = calculatePropertyFundsFlow({
      purchasePrice: 14_000_000,
      purchaseExpenses: 200_000,
      improvementCost: 800_000,
      mortgageDrawdown: 10_000_000,
      ownFundsUsed: 5_000_000,
      salePrice: 22_000_000,
      saleExpenses: 300_000,
      mortgageOrLoanRepaid: 8_000_000,
      netFundsReceived: 13_700_000,
    });

    expect(result.purchaseUses).toBe(15_000_000);
    expect(result.purchaseFundingDifference).toBe(0);
    expect(result.purchaseStatus).toBe("matched");
    expect(result.saleNetAfterLoan).toBe(13_700_000);
    expect(result.receiptDifference).toBe(0);
    expect(result.saleStatus).toBe("matched");
  });

  it("provides a property-specific preparation checklist", () => {
    const checklist = capitalGainDocumentChecklist("property");
    expect(checklist).toContain("Improvement invoices and payment evidence");
    expect(checklist).toContain("Loan/mortgage drawdown and settlement record");
  });
});
