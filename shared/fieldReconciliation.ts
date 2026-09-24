export type ReconciliationStatus = "matched" | "mismatch" | "requires_verification";

export type FieldReconciliation = {
  field: string;
  returnValue: number;
  evidenceValue: number;
  difference: number;
  status: ReconciliationStatus;
  evidenceRef: string;
  detail: string;
};

const TOLERANCE = 1;
const money = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? Math.round(value * 100) / 100 : 0);

function compare(field: string, returnValue: number, evidenceValue: number, evidenceRef: string, detail: string): FieldReconciliation {
  const rv = money(returnValue);
  const ev = money(evidenceValue);
  const difference = money(rv - ev);
  return {
    field,
    returnValue: rv,
    evidenceValue: ev,
    difference,
    status: Math.abs(difference) <= TOLERANCE ? "matched" : "mismatch",
    evidenceRef,
    detail,
  };
}

export type DocumentReturnInputs = {
  profile?: {
    salaryIncome?: number;
    taxDeducted?: number;
    withholdingCertificatesTotal?: number;
    declaredWithholdingTotal?: number;
    taxableIncome?: number;
    employerRecords?: Array<{
      salaryTaxDeducted?: number;
      certificateTaxDeducted?: number;
    }>;
    declaredCapitalGains?: Array<{
      description?: string;
      declaredGain?: number;
      purchasePrice?: number;
      salePrice?: number;
      declaredNetFundsReceived?: number;
    }>;
  };
  bankChecks?: Array<{
    accountRef: string;
    statementClosingBalance: number;
    declaredWealthBalance: number;
  }>;
  properties?: Array<{
    label: string;
    acquisitionCost: number;
    fbrValuation: number;
    saleProceeds: number;
    evidenceRef: string;
  }>;
  declaredAssetPurchases?: number;
  declaredAssetSaleProceeds?: number;
};

export function reconcileDocumentToReturn(inputs: DocumentReturnInputs): FieldReconciliation[] {
  const results: FieldReconciliation[] = [];
  const profile = inputs.profile;

  for (const employer of profile?.employerRecords ?? []) {
    if (employer.salaryTaxDeducted !== undefined && employer.certificateTaxDeducted !== undefined) {
      results.push(compare(
        "Salary withholding tax",
        employer.salaryTaxDeducted,
        employer.certificateTaxDeducted,
        "salary certificate",
        "Employer/payroll withholding is compared with the tax amount shown on the supporting salary certificate.",
      ));
    }
  }

  if (profile?.taxDeducted !== undefined && profile.withholdingCertificatesTotal !== undefined) {
    results.push(compare(
      "Return tax deducted vs withholding certificates",
      profile.taxDeducted,
      profile.withholdingCertificatesTotal,
      "withholding certificate set",
      "The return-level tax deducted figure is compared with the total established from withholding certificates.",
    ));
  }

  if (profile?.declaredWithholdingTotal !== undefined && profile.withholdingCertificatesTotal !== undefined) {
    results.push(compare(
      "Declared withholding total vs certificates",
      profile.declaredWithholdingTotal,
      profile.withholdingCertificatesTotal,
      "withholding certificate set",
      "The declared withholding total is compared with the supporting certificate total.",
    ));
  }

  for (const bank of inputs.bankChecks ?? []) {
    results.push(compare(
      `Wealth Statement bank balance — ${bank.accountRef}`,
      bank.declaredWealthBalance,
      bank.statementClosingBalance,
      "bank statement",
      "The Wealth Statement bank balance is compared with the statement closing balance.",
    ));
  }

  for (const property of inputs.properties ?? []) {
    if (property.saleProceeds > 0) {
      const capitalGain = (profile?.declaredCapitalGains ?? []).find((item) =>
        String(item.description || "").toLocaleLowerCase().trim() === String(property.label || "").toLocaleLowerCase().trim()
      );
      if (capitalGain?.salePrice !== undefined) {
        results.push(compare(
          `Property sale consideration — ${property.label}`,
          capitalGain.salePrice,
          property.saleProceeds,
          property.evidenceRef || "property document",
          "The capital-gain sale consideration is compared with the property sale proceeds established from supporting evidence.",
        ));
      }
    }

    if (property.acquisitionCost > 0 && property.fbrValuation > 0) {
      results.push({
        field: `Property valuation distinction — ${property.label}`,
        returnValue: money(property.acquisitionCost),
        evidenceValue: money(property.fbrValuation),
        difference: money(property.acquisitionCost - property.fbrValuation),
        status: "requires_verification",
        evidenceRef: property.evidenceRef || "property document",
        detail: "Actual acquisition cost and FBR/DC valuation are different concepts; this is a verification item, not an arithmetic error.",
      });
    }
  }

  return results;
}

export function summarizeFieldReconciliation(results: FieldReconciliation[]) {
  return {
    total: results.length,
    matched: results.filter((item) => item.status === "matched").length,
    mismatches: results.filter((item) => item.status === "mismatch").length,
    requiresVerification: results.filter((item) => item.status === "requires_verification").length,
    results,
  };
}
