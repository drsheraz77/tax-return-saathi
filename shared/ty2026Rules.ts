export type RuleSeverity = "high" | "medium" | "low";
export type RuleEvidence = "CALCULATED" | "REQUIRES_VERIFICATION" | "POTENTIAL_ISSUE";

export type Ty2026RuleFinding = {
  ruleId: string;
  title: string;
  detail: string;
  question?: string;
  severity: RuleSeverity;
  evidenceClass: RuleEvidence;
  confidence: "high" | "medium" | "low";
};

type Inputs = {
  wealth: { status: string; unexplainedDifference: number };
  banks: Array<{ accountRef: string; difference: number; status: string }>;
  funds: { remainingFunds: number };
  properties: Array<{ label: string; acquisitionCost: number; fbrValuation: number }>;
  assetContinuity: Array<{ key: string; label: string; status: string; detail: string }>;
  profile?: {
    returnType?: "simplified_salaried" | "normal_individual" | "unknown";
    selectedSources?: string[];
    resident?: boolean;
    employerRecords?: Array<{ employerRegistrationNo?: string; salaryTaxDeducted?: number; certificateTaxDeducted?: number; terminationBenefits?: number; salaryArrears?: number; averageTaxElectionMade?: boolean }>;
    rentalPropertiesDeclared?: number;
    foreignAssets?: number;
    foreignIncome?: number;
    foreignStatementPresent?: boolean;
    motorVehicles?: Array<{ registrationNo?: string; chassisNo?: string; value?: number; cc?: number }>;
    filingDate?: string;
    atlSurchargePaid?: boolean;
    verificationComplete?: boolean;
  };
  transactionAnalysis?: {
    duplicateTransfers?: Array<unknown>;
    internalTransferCandidates?: Array<unknown>;
  };
};

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

export function evaluateTy2026Rules(input: Inputs): Ty2026RuleFinding[] {
  const findings: Ty2026RuleFinding[] = [];
  const profile = input.profile;
  const sources = profile?.selectedSources ?? [];

  if (profile?.returnType === "simplified_salaried" && sources.some((source) => ["Business", "Foreign Sources", "Capital Gain"].includes(source))) {
    findings.push({ ruleId: "A1", title: "Return type may not match selected income sources", detail: "Business, foreign-source, or capital-gain income is indicated while the return is marked simplified salaried.", question: "Confirm the taxpayer's return type and selected income sources before filing.", severity: "high", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
  }

  for (const employer of profile?.employerRecords ?? []) {
    if (employer.salaryTaxDeducted !== undefined && employer.certificateTaxDeducted !== undefined && Math.abs(employer.salaryTaxDeducted - employer.certificateTaxDeducted) > 1) {
      findings.push({ ruleId: "B6", title: "Salary tax deduction differs from the salary certificate", detail: `Recorded salary tax deducted is ${money(employer.salaryTaxDeducted)} versus certificate tax deducted of ${money(employer.certificateTaxDeducted)}.`, question: "Verify the employer certificate and the pre-filled withholding figure before submission.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
    }
    if ((employer.terminationBenefits ?? 0) > 0 || (employer.salaryArrears ?? 0) > 0) {
      if (employer.averageTaxElectionMade === false) findings.push({ ruleId: "B7", title: "Average-tax election may be missing", detail: "Termination benefits or salary arrears are reported without a corresponding average-tax election.", question: "Verify whether the applicable average-tax treatment has been completed.", severity: "medium", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
    }
    if (!employer.employerRegistrationNo) findings.push({ ruleId: "B4", title: "Employer registration number is missing", detail: "Salary is reported but the employer registration number was not established from the submitted evidence.", question: "Verify the employer NTN/registration number from the salary certificate or employer record.", severity: "medium", evidenceClass: "REQUIRES_VERIFICATION", confidence: "medium" });
  }

  if (sources.includes("Property Rental") && (profile?.rentalPropertiesDeclared ?? 0) === 0) {
    findings.push({ ruleId: "C8", title: "Rental income is selected but no rental property is declared", detail: "The extracted profile indicates property/rental income but no property record was established.", question: "Add or verify the property record associated with the rental income.", severity: "high", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
  }

  if (profile?.foreignStatementPresent === false && ((profile.foreignAssets ?? 0) >= 100000 || (profile.foreignIncome ?? 0) >= 10000)) {
    findings.push({ ruleId: "E17", title: "Foreign income/assets statement may be required", detail: "The supplied profile crosses the configured foreign-asset or foreign-income screening threshold while no foreign statement was established.", question: "Verify the foreign asset/income amounts and whether the separate statement is required.", severity: "high", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
  }

  for (const vehicle of profile?.motorVehicles ?? []) {
    if (vehicle.registrationNo && !vehicle.chassisNo) findings.push({ ruleId: "E18", title: "Motor vehicle chassis number is missing", detail: `Vehicle ${vehicle.registrationNo} has a registration number but no chassis number was established.`, question: "Verify and enter the chassis number from the vehicle registration record.", severity: "medium", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
  }

  if (profile?.verificationComplete === false) findings.push({ ruleId: "I29", title: "IRIS verification/e-sign confirmation is not established", detail: "The submitted evidence does not establish that the completed return was finally verified.", question: "Confirm the IRIS verification/e-sign step and retain the filing acknowledgement.", severity: "high", evidenceClass: "REQUIRES_VERIFICATION", confidence: "medium" });


  if (Math.abs(input.wealth.unexplainedDifference) > 1) {
    findings.push({
      ruleId: "E15",
      title: "Wealth reconciliation does not balance",
      detail: `The calculated closing wealth differs from the declared closing wealth by ${money(Math.abs(input.wealth.unexplainedDifference))}.`,
      question: "Check whether an income, asset sale, gift, loan, expense, investment, tax payment or other application is missing or entered incorrectly.",
      severity: Math.abs(input.wealth.unexplainedDifference) >= 1_000_000 ? "high" : "medium",
      evidenceClass: "CALCULATED",
      confidence: "high",
    });
  }

  for (const bank of input.banks) {
    if (bank.status !== "matched" && Math.abs(bank.difference) > 1) {
      findings.push({
        ruleId: "E27",
        title: "Bank balance differs from the declared Wealth Statement balance",
        detail: `${bank.accountRef}: difference ${money(Math.abs(bank.difference))}.`,
        question: "Verify the 30 June closing balance and confirm whether the same account balance was entered in the Wealth Statement.",
        severity: Math.abs(bank.difference) >= 500_000 ? "high" : "medium",
        evidenceClass: "CALCULATED",
        confidence: "high",
      });
    }
  }

  if (input.funds.remainingFunds < -1) {
    findings.push({
      ruleId: "J27",
      title: "Source-of-funds trace has a shortfall",
      detail: `Recorded funds are short by ${money(Math.abs(input.funds.remainingFunds))} after the listed applications.`,
      question: "Identify the missing documented source before treating the asset purchase or construction payment as fully explained.",
      severity: "high",
      evidenceClass: "CALCULATED",
      confidence: "high",
    });
  }

  for (const asset of input.assetContinuity) {
    if (asset.status === "requires_verification" || asset.status === "disposed") {
      findings.push({
        ruleId: "C9",
        title: `Prior-year asset needs continuity verification: ${asset.label}`,
        detail: asset.detail,
        question: "If the asset was sold, gifted or transferred, verify that the disposal and resulting funds are reflected in the current-year records.",
        severity: "high",
        evidenceClass: "REQUIRES_VERIFICATION",
        confidence: "high",
      });
    }
  }

  for (const property of input.properties) {
    if (property.acquisitionCost > 0 && property.fbrValuation > 0 && Math.abs(property.acquisitionCost - property.fbrValuation) > 1) {
      findings.push({
        ruleId: "J26",
        title: `Property acquisition cost and FBR valuation differ: ${property.label}`,
        detail: `Acquisition cost is ${money(property.acquisitionCost)} while the supplied FBR valuation is ${money(property.fbrValuation)}.`,
        question: "Keep the two figures distinct and verify which figure the applicable Wealth Statement field requires.",
        severity: "medium",
        evidenceClass: "REQUIRES_VERIFICATION",
        confidence: "high",
      });
    }
  }

  const transferCount = input.transactionAnalysis?.internalTransferCandidates?.length ?? 0;
  if (transferCount > 0) {
    findings.push({
      ruleId: "E30",
      title: "Internal bank transfers detected",
      detail: `${transferCount} transaction(s) look like transfers between the taxpayer's own accounts based on their descriptions or matching debit/credit patterns.`,
      question: "Do not count an own-account transfer as new income merely because it appears as a bank credit; verify both sides of the transfer.",
      severity: "low",
      evidenceClass: "REQUIRES_VERIFICATION",
      confidence: "medium",
    });
  }

  const duplicateCount = input.transactionAnalysis?.duplicateTransfers?.length ?? 0;
  if (duplicateCount > 0) {
    findings.push({
      ruleId: "E31",
      title: "Possible duplicate transfer entries detected",
      detail: `${duplicateCount} possible duplicate transfer pattern(s) were detected.`,
      question: "Check the original bank statement before treating both sides or repeated entries as separate sources of funds.",
      severity: "medium",
      evidenceClass: "POTENTIAL_ISSUE",
      confidence: "medium",
    });
  }

  return findings;
}
