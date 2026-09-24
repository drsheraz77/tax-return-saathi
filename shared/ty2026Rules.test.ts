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

  it("flags an incorrect salaried tax calculation", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { returnType: "simplified_salaried", taxableIncome: 5_000_000, declaredTaxChargeable: 500_000 } });
    expect(findings.map((x) => x.ruleId)).toContain("T1");
  });

  it("applies the TY2026 9% surcharge above Rs 10 million", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { returnType: "simplified_salaried", taxableIncome: 11_000_000, declaredTaxChargeable: 3_025_000 } });
    expect(findings.map((x) => x.ruleId)).toContain("T1");
    const clean = evaluateTy2026Rules({ ...base, profile: { returnType: "simplified_salaried", taxableIncome: 11_000_000, declaredTaxChargeable: 2_772_500 } });
    expect(clean.map((x) => x.ruleId)).not.toContain("T1");
  });

  it("flags capital gain arithmetic mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { declaredCapitalGains: [{ description: "Plot", purchasePrice: 15000000, salePrice: 19000000, declaredGain: 10000000 }] } });
    expect(findings.map((x) => x.ruleId)).toContain("CG26");
  });

  it("flags property sale receipt mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { declaredCapitalGains: [{ description: "Plot", purchasePrice: 15000000, salePrice: 19000000, declaredNetFundsReceived: 15000000 }] } });
    expect(findings.map((x) => x.ruleId)).toContain("CG27");
  });

  it("flags property purchase funding mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { declaredCapitalGains: [{ description: "Palm IV", purchasePrice: 14000000, ownFundsUsed: 10000000 }] } });
    expect(findings.map((x) => x.ruleId)).toContain("CG28");
  });

  it("flags unsupported deductions", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { deductionsClaimed: { zakat: 10000 }, deductionsSupported: { zakat: false } } });
    expect(findings.map((x) => x.ruleId)).toContain("D20");
  });

  it("flags withholding certificate mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { withholdingCertificatesTotal: 100000, declaredWithholdingTotal: 90000 } });
    expect(findings.map((x) => x.ruleId)).toContain("W1");
  });

  it("flags salary certificate mismatch", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { employerRecords: [{ salaryTaxDeducted: 120000, certificateTaxDeducted: 110000 }] } });
    expect(findings.map((x) => x.ruleId)).toContain("B6");
  });

  it("flags missing chassis number only when a vehicle record is established", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { motorVehicles: [{ registrationNo: "ABC-123" }] } });
    expect(findings.map((x) => x.ruleId)).toContain("E18");
  });

  it("flags rental source without a property record", () => {
    const findings = evaluateTy2026Rules({ ...base, profile: { selectedSources: ["Property Rental"], rentalPropertiesDeclared: 0 } });
    expect(findings.map((x) => x.ruleId)).toContain("C8");
  });

  it("fires E38 for a liability balance mismatch", () => {
    const findings = evaluateTy2026Rules({
      ...base,
      liabilityBalance: {
        results: [{
          label: "J5 Premium loan",
          priorYearAmount: 2000000,
          drawdownAmount: 6500000,
          repaymentAmount: 500000,
          expectedClosingAmount: 8000000,
          currentYearAmount: 9000000,
          difference: 1000000,
          status: "mismatch",
          detail: "Mismatch.",
        }],
      },
    });
    expect(findings.map((x) => x.ruleId)).toContain("E38");
  });

  it("does not flag profile rules when evidence is absent", () => {
    expect(evaluateTy2026Rules(base)).toEqual([]);
  });
});
