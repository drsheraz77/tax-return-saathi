import { describe, expect, it } from "vitest";
import { reconcileAssets, summarizeAssetReconciliation } from "./assetReconciliation";

describe("reconcileAssets", () => {
  it("matches an investment statement to the declared value", () => {
    const result = reconcileAssets({ investments: [{ label: "Mutual Fund A", statementValue: 486000, declaredValue: 486000, evidenceRef: "investment statement" }] });
    expect(result[0].status).toBe("matched");
  });

  it("flags an investment value mismatch", () => {
    const result = reconcileAssets({ investments: [{ label: "Mutual Fund A", statementValue: 486000, declaredValue: 450000, evidenceRef: "investment statement" }] });
    expect(result[0].status).toBe("mismatch");
    expect(result[0].difference).toBe(-36000);
  });

  it("handles vehicle statement values independently", () => {
    const result = reconcileAssets({ vehicles: [{ label: "Vehicle A", statementValue: 2400000, declaredValue: 2000000, evidenceRef: "vehicle document" }] });
    expect(result[0].assetType).toBe("vehicle");
    expect(result[0].status).toBe("mismatch");
  });

  it("summarizes asset reconciliation", () => {
    const result = summarizeAssetReconciliation(reconcileAssets({
      investments: [{ label: "A", statementValue: 100, declaredValue: 100, evidenceRef: "doc" }],
      otherAssets: [{ label: "B", statementValue: 200, declaredValue: 150, evidenceRef: "doc" }],
    }));
    expect(result.total).toBe(2);
    expect(result.matched).toBe(1);
    expect(result.mismatches).toBe(1);
  });
});
