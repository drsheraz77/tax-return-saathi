export type CapitalGainTransaction = {
  assetType: "property" | "shares" | "etf" | "bonds" | "other";
  description?: string;
  acquisitionDate?: string;
  saleDate?: string;
  ownershipPercent?: number | null;
  purchasePrice?: number | null;
  improvementCost?: number | null;
  purchaseExpenses?: number | null;
  salePrice?: number | null;
  saleExpenses?: number | null;
  mortgageOrLoanRepaid?: number | null;
  declaredValueOrFbrValue?: number | null;
};

export type PropertyFundsFlow = {
  purchasePrice?: number | null;
  purchaseExpenses?: number | null;
  improvementCost?: number | null;
  mortgageDrawdown?: number | null;
  ownFundsUsed?: number | null;
  salePrice?: number | null;
  saleExpenses?: number | null;
  mortgageOrLoanRepaid?: number | null;
  netFundsReceived?: number | null;
};

export const CAPITAL_GAIN_TOLERANCE = 1;

export function amount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function sum(values: unknown[]) {
  return amount(values.reduce((total: number, value: unknown) => total + amount(value), 0));
}

function dateValue(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateCapitalGain(input: CapitalGainTransaction) {
  const ownershipPercent = Math.min(100, Math.max(0, amount(input.ownershipPercent || 100)));
  const ownershipFactor = ownershipPercent / 100;
  const wholeAssetCostBasis = sum([input.purchasePrice, input.improvementCost, input.purchaseExpenses]);
  const wholeAssetNetProceeds = amount(amount(input.salePrice) - amount(input.saleExpenses));
  const wholeAssetGainOrLoss = amount(wholeAssetNetProceeds - wholeAssetCostBasis);
  const costBasis = amount(wholeAssetCostBasis * ownershipFactor);
  const netProceeds = amount(wholeAssetNetProceeds * ownershipFactor);
  const gainOrLoss = amount(wholeAssetGainOrLoss * ownershipFactor);
  const acquisitionDate = dateValue(input.acquisitionDate);
  const saleDate = dateValue(input.saleDate);
  const holdingDays = acquisitionDate && saleDate ? Math.max(0, Math.round((saleDate.getTime() - acquisitionDate.getTime()) / 86_400_000)) : null;
  const valueDifference = input.declaredValueOrFbrValue === undefined || input.declaredValueOrFbrValue === null
    ? null
    : amount(input.salePrice) - amount(input.declaredValueOrFbrValue);

  return {
    assetType: input.assetType,
    description: String(input.description || "").slice(0, 120),
    ownershipPercent,
    wholeAssetCostBasis,
    wholeAssetNetProceeds,
    wholeAssetGainOrLoss,
    costBasis,
    netProceeds,
    gainOrLoss,
    result: gainOrLoss >= 0 ? "gain" : "loss",
    acquisitionDate: input.acquisitionDate || "",
    saleDate: input.saleDate || "",
    holdingDays,
    declaredValueOrFbrValue: input.declaredValueOrFbrValue == null ? null : amount(input.declaredValueOrFbrValue),
    valueDifference,
    reviewFlags: [
      !input.acquisitionDate || !input.saleDate ? "Add both acquisition and sale dates for a holding-period record." : null,
      amount(input.purchasePrice) <= 0 ? "Purchase/acquisition amount is blank or zero." : null,
      amount(input.salePrice) <= 0 ? "Sale consideration is blank or zero." : null,
      ownershipPercent <= 0 ? "Ownership share is zero; confirm the ownership entry." : null,
      valueDifference !== null && Math.abs(valueDifference) > CAPITAL_GAIN_TOLERANCE ? "Sale consideration differs from the comparison value entered; verify the applicable official valuation/document." : null,
    ].filter(Boolean),
  } as const;
}

export function calculatePropertyFundsFlow(input: PropertyFundsFlow) {
  const purchaseUses = sum([input.purchasePrice, input.purchaseExpenses, input.improvementCost]);
  const availableForPurchase = sum([input.mortgageDrawdown, input.ownFundsUsed]);
  const purchaseFundingDifference = amount(availableForPurchase - purchaseUses);
  const saleNetBeforeLoan = amount(amount(input.salePrice) - amount(input.saleExpenses));
  const saleNetAfterLoan = amount(saleNetBeforeLoan - amount(input.mortgageOrLoanRepaid));
  const declaredNetFundsReceived = input.netFundsReceived == null ? null : amount(input.netFundsReceived);
  const receiptDifference = declaredNetFundsReceived == null ? null : amount(declaredNetFundsReceived - saleNetAfterLoan);

  return {
    purchaseUses,
    availableForPurchase,
    purchaseFundingDifference,
    saleNetBeforeLoan,
    saleNetAfterLoan,
    declaredNetFundsReceived,
    receiptDifference,
    purchaseStatus: Math.abs(purchaseFundingDifference) <= CAPITAL_GAIN_TOLERANCE ? "matched" : "needs_review",
    saleStatus: receiptDifference === null || Math.abs(receiptDifference) <= CAPITAL_GAIN_TOLERANCE ? "matched" : "needs_review",
  } as const;
}

export function capitalGainDocumentChecklist(assetType: CapitalGainTransaction["assetType"]) {
  const common = [
    "Acquisition/purchase agreement or broker contract",
    "Proof of payment and transaction ledger entry",
    "Sale agreement/contract note and proof of receipt",
    "Ownership-share evidence, if jointly held",
  ];
  if (assetType === "property") return [...common, "Registry/transfer deed and recorded purchase/sale expenses", "Improvement invoices and payment evidence", "Loan/mortgage drawdown and settlement record", "Official valuation/comparison record where applicable"];
  return [...common, "Broker statement or contract note", "Dividend/interest and withholding records where applicable", "Corporate action or bonus/right issue record where applicable"];
}
