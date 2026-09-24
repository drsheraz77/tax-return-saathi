import { describe, expect, it } from "vitest";
import { traceAssetFunding, summarizeAssetFundingTrace } from "./assetFundingTrace";

const rows = [
  { rowNumber: 1, date: "2026-06-01", description: "Property sale proceeds", amount: 8000000, direction: "credit" as const, accountRef: "A" },
  { rowNumber: 2, date: "2026-06-10", description: "Palm IV plot purchase", amount: 5000000, direction: "debit" as const, accountRef: "A" },
  { rowNumber: 3, date: "2026-06-15", description: "Palm IV plot purchase", amount: 3000000, direction: "debit" as const, accountRef: "A" },
];

describe("traceAssetFunding", () => {
  it("traces an asset application to a preceding source receipt", () => {
    const result = traceAssetFunding(rows, [{ label: "Palm IV", assetType: "property", declaredValue: 8000000 }]);
    expect(result[0].status).toBe("traced");
    expect(result[0].tracedSourceAmount).toBe(8000000);
  });

  it("reports a partial trace when only part of the asset value has a source", () => {
    const result = traceAssetFunding(rows.slice(0, 2), [{ label: "Palm IV", assetType: "property", declaredValue: 8000000 }]);
    expect(result[0].status).toBe("partial");
    expect(result[0].unexplainedAmount).toBe(3000000);
  });

  it("does not invent a source when no preceding receipt exists", () => {
    const result = traceAssetFunding([
      { rowNumber: 4, date: "2026-06-10", description: "Palm IV plot purchase", amount: 8000000, direction: "debit" as const, accountRef: "A" },
    ], [{ label: "Palm IV", assetType: "property", declaredValue: 8000000 }]);
    expect(result[0].status).toBe("needs_review");
    expect(result[0].tracedSourceAmount).toBe(0);
  });

  it("summarizes asset funding results", () => {
    const result = summarizeAssetFundingTrace(traceAssetFunding(rows, [{ label: "Palm IV", assetType: "property", declaredValue: 8000000 }]));
    expect(result.totalAssets).toBe(1);
    expect(result.traced).toBe(1);
  });
});
