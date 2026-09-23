import { describe, expect, it } from "vitest";
import { buildDeterministicFindings } from "../shared/taxReviewFindings";

const base = {
  wealth: {
    status: "reconciled",
    totalSources: 19_000_000,
    totalApplications: 14_000_000,
    expectedClosingWealth: 5_000_000,
    declaredClosingWealth: 5_000_000,
    unexplainedDifference: 0,
  },
  banks: [],
  funds: {
    totalAvailable: 19_000_000,
    totalApplications: 14_000_000,
    remainingFunds: 5_000_000,
    status: "traceable",
  },
  properties: [],
};

describe("deterministic tax review findings", () => {
  it("flags a wealth mismatch without asking the LLM to calculate it", () => {
    const findings = buildDeterministicFindings({
      ...base,
      wealth: { ...base.wealth, status: "needs_review", declaredClosingWealth: 4_000_000, unexplainedDifference: -1_000_000 },
    });
    expect(findings).toContainEqual(expect.objectContaining({
      code: "WEALTH_MISMATCH",
      severity: "high",
      evidenceClass: "POTENTIAL_ISSUE",
      amount: -1_000_000,
    }));
  });

  it("flags bank closing balance differences", () => {
    const findings = buildDeterministicFindings({
      ...base,
      banks: [{ accountRef: "HBL-1", statementClosingBalance: 7_446_331.70, declaredWealthBalance: 7_000_000, difference: 446_331.70, status: "needs_review" }],
    });
    expect(findings).toContainEqual(expect.objectContaining({
      code: "BANK_BALANCE_MISMATCH",
      amount: 446_331.70,
    }));
  });

  it("flags a funds shortfall", () => {
    const findings = buildDeterministicFindings({
      ...base,
      funds: { totalAvailable: 10_000_000, totalApplications: 14_000_000, remainingFunds: -4_000_000, status: "needs_review" },
    });
    expect(findings).toContainEqual(expect.objectContaining({
      code: "FUNDS_SHORTFALL",
      severity: "high",
      amount: -4_000_000,
    }));
  });

  it("does not treat FBR valuation as the acquisition cost", () => {
    const findings = buildDeterministicFindings({
      ...base,
      properties: [{ label: "Palm IV", acquisitionCost: 14_000_000, fbrValuation: 2_640_000, saleProceeds: 0, evidenceRef: "document 1" }],
    });
    expect(findings).toContainEqual(expect.objectContaining({
      code: "PROPERTY_VALUE_DISTINCTION",
      evidenceClass: "REQUIRES_VERIFICATION",
    }));
    expect(findings.find((f) => f.code === "PROPERTY_VALUE_DISTINCTION")?.detail).toContain("Rs 14,000,000");
    expect(findings.find((f) => f.code === "PROPERTY_VALUE_DISTINCTION")?.detail).toContain("Rs 2,640,000");
  });
});
