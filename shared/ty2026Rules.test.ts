import { describe, expect, it } from "vitest";
import { evaluateTy2026Rules } from "./ty2026Rules";

const base = {
  wealth: { status: "reconciled", unexplainedDifference: 0 },
  banks: [],
  funds: { remainingFunds: 0 },
  properties: [],
  assetContinuity: [],
};

describe("evaluateTy2026Rules", () => {
  it("fires E15 for a wealth mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, wealth: { status: "needs_review", unexplainedDifference: 250000 } });
    expect(findings.map((x) => x.ruleId)).toContain("E15");
  });

  it("fires J27 for a funds shortfall", () => {
    const findings = evaluateTy2026Rules({ ...base, funds: { remainingFunds: -500000 } });
    expect(findings.map((x) => x.ruleId)).toContain("J27");
  });

  it("fires C9 for a prior-year asset requiring verification", () => {
    const findings = evaluateTy2026Rules({
      ...base,
      assetContinuity: [{ key: "plot-a", label: "Plot A", status: "requires_verification", detail: "Missing from current year." }],
    });
    expect(findings.map((x) => x.ruleId)).toContain("C9");
  });

  it("fires J26 for different property cost and FBR valuation", () => {
    const findings = evaluateTy2026Rules({
      ...base,
      properties: [{ label: "Palm IV", acquisitionCost: 14000000, fbrValuation: 2640000 }],
    });
    expect(findings.map((x) => x.ruleId)).toContain("J26");
  });

  it("does not flag a clean case", () => {
    expect(evaluateTy2026Rules(base)).toEqual([]);
  });
});
