import { describe, expect, it } from "vitest";
import { reconcileAssetLiabilities, summarizeAssetLiabilities } from "./assetLiabilityReconciliation";

describe("asset liability reconciliation", () => {
  it("matches a documented vehicle liability to the vehicle", () => {
    const r = reconcileAssetLiabilities([{ label: "J5 Premium", value: 8000000 }], [
      { label: "J5 Premium payable", amount: 6500000, liabilityType: "payable", evidenceRef: "doc-1" },
    ]);
    expect(r[0].status).toBe("partial");
    expect(r[0].matchedLiabilityAmount).toBe(6500000);
    expect(r[0].unmatchedAssetAmount).toBe(1500000);
  });
  it("does not treat an unrelated liability as funding", () => {
    const r = reconcileAssetLiabilities([{ label: "J5 Premium", value: 8000000 }], [
      { label: "Personal loan", amount: 6500000, liabilityType: "loan", evidenceRef: "doc-2" },
    ]);
    expect(r[0].status).toBe("requires_verification");
    expect(r[0].matchedLiabilityAmount).toBe(0);
  });
  it("prevents one liability being allocated to two assets", () => {
    const r = reconcileAssetLiabilities(
      [{ label: "Vehicle A", value: 5000000 }, { label: "Vehicle B", value: 5000000 }],
      [{ label: "Vehicle loan", amount: 5000000, liabilityType: "loan", evidenceRef: "doc-3" }],
    );
    expect(r[0].matchedLiabilityAmount).toBe(5000000);
    expect(r[1].matchedLiabilityAmount).toBe(0);
  });
  it("summarizes results", () => {
    const r = summarizeAssetLiabilities(reconcileAssetLiabilities(
      [{ label: "Vehicle A", value: 5000000 }],
      [{ label: "Vehicle A loan", amount: 5000000, liabilityType: "loan", evidenceRef: "doc-4" }],
    ));
    expect(r.consistent).toBe(1);
  });
});
