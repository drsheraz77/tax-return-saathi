export type FindingSeverity = "high" | "medium" | "low";
export type EvidenceClass = "CONFIRMED" | "CALCULATED" | "INFERRED" | "REQUIRES_VERIFICATION" | "POTENTIAL_ISSUE";

export type DeterministicFinding = {
  code: string;
  title: string;
  detail: string;
  severity: FindingSeverity;
  evidenceClass: EvidenceClass;
  confidence: "high" | "medium" | "low";
  amount?: number;
};

const TOLERANCE = 1;

function money(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
}

function formatRs(value: number) {
  return `Rs ${money(value).toLocaleString("en-PK")}`;
}

export function buildDeterministicFindings(calculations: {
  wealth: {
    status: string;
    totalSources: number;
    totalApplications: number;
    expectedClosingWealth: number;
    declaredClosingWealth: number;
    unexplainedDifference: number;
  };
  banks: Array<{
    accountRef: string;
    statementClosingBalance: number;
    declaredWealthBalance: number;
    difference: number;
    status: string;
  }>;
  funds: {
    totalAvailable: number;
    totalApplications: number;
    remainingFunds: number;
    status: string;
  };
  properties: Array<{
    label: string;
    acquisitionCost: number;
    fbrValuation: number;
    saleProceeds: number;
    evidenceRef: string;
  }>;
}) {
  const findings: DeterministicFinding[] = [];
  const wealth = calculations.wealth;

  if (wealth.status === "reconciled") {
    findings.push({
      code: "WEALTH_RECONCILED",
      title: "Wealth statement arithmetic reconciles",
      detail: `Sources ${formatRs(wealth.totalSources)} minus applications ${formatRs(wealth.totalApplications)} equals closing wealth ${formatRs(wealth.expectedClosingWealth)}.`,
      severity: "low",
      evidenceClass: "CALCULATED",
      confidence: "high",
      amount: wealth.expectedClosingWealth,
    });
  } else {
    findings.push({
      code: "WEALTH_MISMATCH",
      title: "Closing wealth does not reconcile",
      detail: `Calculated closing wealth is ${formatRs(wealth.expectedClosingWealth)}, while declared closing wealth is ${formatRs(wealth.declaredClosingWealth)}; difference is ${formatRs(wealth.unexplainedDifference)}.`,
      severity: Math.abs(wealth.unexplainedDifference) >= 1_000_000 ? "high" : "medium",
      evidenceClass: "POTENTIAL_ISSUE",
      confidence: "high",
      amount: wealth.unexplainedDifference,
    });
  }

  for (const bank of calculations.banks) {
    if (bank.status !== "matched") {
      findings.push({
        code: "BANK_BALANCE_MISMATCH",
        title: `Bank balance needs verification: ${bank.accountRef}`,
        detail: `Statement closing balance is ${formatRs(bank.statementClosingBalance)} versus declared wealth balance ${formatRs(bank.declaredWealthBalance)}; difference is ${formatRs(bank.difference)}.`,
        severity: Math.abs(bank.difference) >= 500_000 ? "high" : "medium",
        evidenceClass: "POTENTIAL_ISSUE",
        confidence: "high",
        amount: bank.difference,
      });
    }
  }

  if (calculations.funds.remainingFunds < -TOLERANCE) {
    findings.push({
      code: "FUNDS_SHORTFALL",
      title: "Funds trace shows a shortfall",
      detail: `Traceable funds available are ${formatRs(calculations.funds.totalAvailable)}, while applications total ${formatRs(calculations.funds.totalApplications)}, leaving ${formatRs(calculations.funds.remainingFunds)}.`,
      severity: "high",
      evidenceClass: "POTENTIAL_ISSUE",
      confidence: "high",
      amount: calculations.funds.remainingFunds,
    });
  } else {
    findings.push({
      code: "FUNDS_TRACE",
      title: "Funds trace is arithmetically covered",
      detail: `Available funds of ${formatRs(calculations.funds.totalAvailable)} cover recorded applications of ${formatRs(calculations.funds.totalApplications)}, leaving ${formatRs(calculations.funds.remainingFunds)}.`,
      severity: "low",
      evidenceClass: "CALCULATED",
      confidence: "high",
      amount: calculations.funds.remainingFunds,
    });
  }

  for (const property of calculations.properties) {
    if (property.acquisitionCost > 0 && property.fbrValuation > 0 && Math.abs(property.acquisitionCost - property.fbrValuation) > TOLERANCE) {
      findings.push({
        code: "PROPERTY_VALUE_DISTINCTION",
        title: `Property values differ: ${property.label}`,
        detail: `Recorded acquisition cost is ${formatRs(property.acquisitionCost)} while the supplied FBR valuation is ${formatRs(property.fbrValuation)}. These are different data points and should not be substituted without verifying the applicable return field and supporting documents.`,
        severity: "medium",
        evidenceClass: "REQUIRES_VERIFICATION",
        confidence: "high",
      });
    }
  }

  return findings;
}
