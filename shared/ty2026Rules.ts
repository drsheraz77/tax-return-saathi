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
    taxableIncome?: number;
    declaredTaxChargeable?: number;
    taxDeducted?: number;
    salaryIncome?: number;
    otherTaxableIncome?: number;
    deductionsClaimed?: { zakat?: number; workersWelfareFund?: number; educationalExpenses?: number };
    deductionsSupported?: { zakat?: boolean; workersWelfareFund?: boolean; educationalExpenses?: boolean };
    withholdingCertificatesTotal?: number;
    declaredCapitalGains?: Array<{ description?: string; purchasePrice?: number; improvementCost?: number; purchaseExpenses?: number; salePrice?: number; saleExpenses?: number; declaredGain?: number; ownershipPercent?: number; acquisitionDate?: string; saleDate?: string; declaredNetFundsReceived?: number; mortgageOrLoanRepaid?: number; mortgageDrawdown?: number; ownFundsUsed?: number; declaredValueOrFbrValue?: number }>;
    declaredWithholdingTotal?: number;
  };
  transactionAnalysis?: {
    duplicateTransfers?: Array<unknown>;
    internalTransferCandidates?: Array<unknown>;
    cashWithdrawalRows?: number[];
  };
  assetLiabilities?: { results?: Array<{ assetLabel: string; assetValue: number; matchedLiabilityAmount: number; unmatchedAssetAmount: number; status: string; detail: string }> };\n  liabilityContinuity?: { results?: Array<{ label: string; priorYearAmount: number; currentYearAmount: number; status: string; difference: number; detail: string }> };\n  fundsFlow?: {
    status?: "traceable" | "partial" | "needs_review";
    totals?: { sourceCredits?: number; tracedToApplications?: number; unexplainedSourceCredits?: number };
    crossAccountTransfers?: Array<unknown>;
  };
};

const money = (n: number) => `Rs ${Math.round(n).toLocaleString("en-PK")}`;

export function evaluateTy2026Rules(input: Inputs): Ty2026RuleFinding[] {
  const findings: Ty2026RuleFinding[] = [];
  const profile = input.profile;
  const sources = profile?.selectedSources ?? [];

  const calculateSalariedTax = (income: number) => {
    if (income <= 600_000) return 0;
    if (income <= 1_200_000) return (income - 600_000) * 0.01;
    if (income <= 2_200_000) return 6_000 + (income - 1_200_000) * 0.11;
    if (income <= 3_200_000) return 116_000 + (income - 2_200_000) * 0.23;
    if (income <= 4_100_000) return 346_000 + (income - 3_200_000) * 0.30;
    return 616_000 + (income - 4_100_000) * 0.35;
  };

  if (profile?.taxableIncome !== undefined && profile.declaredTaxChargeable !== undefined && profile.returnType === "simplified_salaried") {
    const baseTax = calculateSalariedTax(profile.taxableIncome);
    const surcharge = profile.taxableIncome > 10_000_000 ? baseTax * 0.09 : 0;
    const expectedTax = baseTax + surcharge;
    if (Math.abs(expectedTax - profile.declaredTaxChargeable) > 1) {
      findings.push({ ruleId: "T1", title: "Declared salary tax does not match the TY2026 slab calculation", detail: `For taxable income of ${money(profile.taxableIncome)}, the calculated TY2026 salary tax is ${money(expectedTax)} including the applicable 9% surcharge where relevant; the submitted figure is ${money(profile.declaredTaxChargeable)}.`, question: "Verify taxable income, deductions/allowances, the applicable salary slab and any surcharge before filing.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
    }
    if (profile.taxDeducted !== undefined) {
      const balance = profile.declaredTaxChargeable - profile.taxDeducted;
      findings.push({ ruleId: "T2", title: "Tax payable/refund cross-check", detail: `Declared tax chargeable ${money(profile.declaredTaxChargeable)} minus tax deducted ${money(profile.taxDeducted)} gives a calculated balance of ${money(balance)}.`, question: "Verify withholding credits against certificates and the return's final tax computation.", severity: "low", evidenceClass: "CALCULATED", confidence: "high" });
    }
  }

  for (const asset of profile?.declaredCapitalGains ?? []) {
    const purchase = (asset.purchasePrice ?? 0) + (asset.improvementCost ?? 0) + (asset.purchaseExpenses ?? 0);
    const netSale = (asset.salePrice ?? 0) - (asset.saleExpenses ?? 0);
    const ownership = Math.max(0, Math.min(100, asset.ownershipPercent ?? 100)) / 100;
    const calculatedGain = (netSale - purchase) * ownership;
    if ((asset.salePrice ?? 0) > 0 && (asset.purchasePrice ?? 0) > 0 && asset.declaredGain !== undefined && Math.abs(calculatedGain - asset.declaredGain) > 1) {
      findings.push({ ruleId: "CG26", title: `Capital gain does not reconcile: ${asset.description || "property"}`, detail: `Calculated gain/loss is ${money(calculatedGain)} after documented cost components and sale expenses; declared gain/loss is ${money(asset.declaredGain)}.`, question: "Verify purchase cost, documented improvements/expenses, sale consideration, ownership share and the gain calculation.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
    }
    if ((asset.salePrice ?? 0) > 0 && asset.declaredNetFundsReceived !== undefined) {
      const expectedReceipt = netSale - (asset.mortgageOrLoanRepaid ?? 0);
      if (Math.abs(expectedReceipt - asset.declaredNetFundsReceived) > 1) findings.push({ ruleId: "CG27", title: `Property sale proceeds do not reconcile: ${asset.description || "property"}`, detail: `Net sale proceeds after the supplied loan repayment are ${money(expectedReceipt)}, while declared funds received are ${money(asset.declaredNetFundsReceived)}.`, question: "Trace the actual receipt through bank, cheque or cash evidence and document any loan settlement or selling expenses.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
    }
    if ((asset.purchasePrice ?? 0) > 0 && (asset.ownFundsUsed ?? 0) + (asset.mortgageDrawdown ?? 0) > 0) {
      const purchaseUses = (asset.purchasePrice ?? 0) + (asset.improvementCost ?? 0) + (asset.purchaseExpenses ?? 0);
      const funding = (asset.ownFundsUsed ?? 0) + (asset.mortgageDrawdown ?? 0);
      if (Math.abs(funding - purchaseUses) > 1) findings.push({ ruleId: "CG28", title: `Property purchase funding does not reconcile: ${asset.description || "property"}`, detail: `Documented purchase uses are ${money(purchaseUses)}, while identified own funds plus loan funding are ${money(funding)}.`, question: "Identify the missing documented funding source or correct the purchase-cost components.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
    }
    if (asset.declaredValueOrFbrValue !== undefined && (asset.salePrice ?? 0) > 0 && Math.abs((asset.salePrice ?? 0) - asset.declaredValueOrFbrValue) > 1) {
      findings.push({ ruleId: "CG29", title: `Sale consideration differs from comparison valuation: ${asset.description || "property"}`, detail: `Sale consideration is ${money(asset.salePrice ?? 0)} versus comparison value ${money(asset.declaredValueOrFbrValue)}.`, question: "Keep consideration and valuation distinct and verify which figure is required for the applicable return field.", severity: "medium", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
    }
  }

  const deductions = profile?.deductionsClaimed;
  const deductionSupport = profile?.deductionsSupported;
  if (deductions && deductionSupport) {
    for (const [key, label] of [["zakat", "Zakat"], ["workersWelfareFund", "Workers' Welfare Fund"], ["educationalExpenses", "Educational Expenses"]] as const) {
      const amount = deductions[key] ?? 0;
      if (amount > 0 && deductionSupport[key] === false) {
        findings.push({ ruleId: "D20", title: `${label} deduction lacks established supporting basis`, detail: `${label} of ${money(amount)} is claimed, but supporting evidence/basis was not established.`, question: `Verify the supporting document and applicable eligibility before claiming the ${label} deduction.`, severity: "medium", evidenceClass: "REQUIRES_VERIFICATION", confidence: "high" });
      }
    }
  }

  if (profile?.withholdingCertificatesTotal !== undefined && profile.declaredWithholdingTotal !== undefined && Math.abs(profile.withholdingCertificatesTotal - profile.declaredWithholdingTotal) > 1) {
    findings.push({ ruleId: "W1", title: "Withholding tax total differs from submitted certificates", detail: `Certificates support ${money(profile.withholdingCertificatesTotal)}, while the declared withholding total is ${money(profile.declaredWithholdingTotal)}.`, question: "Reconcile each withholding certificate with the corresponding IRIS withholding entry before claiming the credit.", severity: "high", evidenceClass: "CALCULATED", confidence: "high" });
  }

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

  const cashWithdrawalCount = input.transactionAnalysis?.cashWithdrawalRows?.length ?? 0;
  if (cashWithdrawalCount > 0) {
    findings.push({
      ruleId: "E34",
      title: "Cash withdrawals require separate source-of-funds tracing",
      detail: cashWithdrawalCount + " cash withdrawal transaction(s) were identified. A cash withdrawal is an application of funds, but the later use of that cash was not established by the bank trail alone.",
      question: "Match significant cash withdrawals to receipts, asset payments, construction expenses or other supporting evidence rather than assuming the cash funded a particular asset.",
      severity: "medium",
      evidenceClass: "REQUIRES_VERIFICATION",
      confidence: "high",
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


  for (const item of input.assetLiabilities?.results ?? []) {
    if (item.status === "partial" || item.status === "requires_verification") {
      findings.push({
        ruleId: "E35",
        title: `Asset/liability consistency requires verification: ${item.assetLabel}`,
        detail: `${money(item.assetValue)} asset value has ${money(item.matchedLiabilityAmount)} matched to a related documented liability; ${money(item.unmatchedAssetAmount)} remains outside that liability match. ${item.detail}`,
        question: "Verify the acquisition/booking documents, actual liability at the reporting date, payments made, and the amount entered in the Wealth Statement. Do not create a liability solely because a future payment was expected.",
        severity: item.status === "partial" ? "medium" : "medium",
        evidenceClass: "REQUIRES_VERIFICATION",
        confidence: "medium",
      });
    }
  }

  for (const item of input.liabilityContinuity?.results ?? []) {
    if (["new", "settled", "increased", "decreased"].includes(item.status)) {
      findings.push({
        ruleId: "E36",
        title: `Year-to-year liability change requires verification: ${item.label}`,
        detail: `Prior-year amount ${money(item.priorYearAmount)}; current-year amount ${money(item.currentYearAmount)}; calculated change ${money(item.difference)}. ${item.detail}`,
        question: "Verify the prior/current liability statements, settlement or drawdown evidence, reporting date, and corresponding asset or funds movement.",
        severity: "medium",
        evidenceClass: "REQUIRES_VERIFICATION",
        confidence: "medium",
      });
    }
  }

  const fundsFlow = input.fundsFlow;
  const unexplainedSourceCredits = fundsFlow?.totals?.unexplainedSourceCredits ?? 0;
  const crossAccountTransferCount = fundsFlow?.crossAccountTransfers?.length ?? 0;
  if (crossAccountTransferCount > 0) {
    findings.push({
      ruleId: "E32",
      title: "Cross-account source-of-funds transfer traced",
      detail: crossAccountTransferCount + " cross-account transfer(s) were matched conservatively by account, amount and date." +
        (unexplainedSourceCredits > 1 ? " Some source receipts remain unmatched: " + money(unexplainedSourceCredits) + "." : " The identified qualifying source receipts were linked to subsequent applications within the matching window."),
      question: "Verify the transfer entries and supporting source/application documents before relying on the automated linkage.",
      severity: unexplainedSourceCredits > 1 ? "medium" : "low",
      evidenceClass: "REQUIRES_VERIFICATION",
      confidence: "medium",
    });
  }
  if (fundsFlow?.status === "needs_review" && unexplainedSourceCredits > 1) {
    findings.push({
      ruleId: "E33",
      title: "Qualifying source receipts remain unexplained across bank accounts",
      detail: "The cross-account engine identified " + money(unexplainedSourceCredits) + " of qualifying source receipts without a conservative downstream application match.",
      question: "Trace the remaining receipts to documented expenditure, investment, asset acquisition, transfer, or closing funds.",
      severity: "high",
      evidenceClass: "CALCULATED",
      confidence: "medium",
    });
  }
  return findings;
}
