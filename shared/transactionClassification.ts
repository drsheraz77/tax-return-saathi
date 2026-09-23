import type { ParsedTransaction, TransactionAnalysis } from "./taxReconciliation";

export type TransactionCategory =
  | "internal_transfer"
  | "property_sale"
  | "property_purchase"
  | "vehicle"
  | "construction"
  | "investment"
  | "cash_withdrawal"
  | "tax_payment"
  | "loan"
  | "gift"
  | "unknown";

export type TransactionClassification = {
  rowNumber: number;
  category: TransactionCategory;
  confidence: "high" | "medium";
  reason: string;
};

const patterns: Array<{ category: TransactionCategory; pattern: RegExp; confidence: "high" | "medium"; reason: string }> = [
  { category: "internal_transfer", pattern: /own account|internal transfer|a\/c to a\/c|intra|ibft|funds? moved|منتقلی|اپنا اکاؤنٹ/i, confidence: "high", reason: "Description indicates an account-to-account transfer." },
  { category: "property_sale", pattern: /sale proceeds|property sale|sold|sale of|فروخت|بیع/i, confidence: "medium", reason: "Description contains an explicit property-sale signal; supporting sale documents should confirm the classification." },
  { category: "property_purchase", pattern: /property purchase|purchase|booking|allotment|registry|transfer fee|خرید|الاٹمنٹ|رجسٹری/i, confidence: "medium", reason: "Description contains an explicit property-acquisition signal; supporting purchase documents should confirm the classification." },
  { category: "vehicle", pattern: /car|vehicle|auto|booking|toyota|suzuki|honda|kia|jaecoo|jacoo|j5|گاڑی/i, confidence: "medium", reason: "Description contains vehicle terminology; ownership/payment evidence should confirm the classification." },
  { category: "construction", pattern: /construction|contractor|cement|steel|marble|tile|brick|plumber|electric|builder|مزدور|تعمیر/i, confidence: "medium", reason: "Description contains construction-related terminology; invoices or contracts should confirm the classification." },
  { category: "investment", pattern: /mutual fund|fund|securities|stock|shares|broker|al meezan|meezan|investment/i, confidence: "medium", reason: "Description contains investment terminology; the investment statement should confirm the classification." },
  { category: "cash_withdrawal", pattern: /cash withdrawal|cash withdraw|atm|cash/i, confidence: "high", reason: "Description indicates cash withdrawal." },
  { category: "tax_payment", pattern: /income tax|fbr|tax payment|withholding tax|govt tax/i, confidence: "medium", reason: "Description appears to identify a tax payment; the tax receipt should confirm it." },
  { category: "loan", pattern: /loan|financ|borrow|borrowing|lending/i, confidence: "medium", reason: "Description contains loan/financing terminology; loan documentation should confirm whether it is a source or repayment." },
  { category: "gift", pattern: /gift|hadiya|تحفہ|گفٹ/i, confidence: "medium", reason: "Description contains gift terminology; donor/recipient evidence should confirm the nature of the receipt." },
];

function classify(row: ParsedTransaction): TransactionClassification {
  const match = patterns.find((item) => item.pattern.test(row.description));
  if (match) return { rowNumber: row.rowNumber, category: match.category, confidence: match.confidence, reason: match.reason };
  return { rowNumber: row.rowNumber, category: "unknown", confidence: "medium", reason: "No reliable transaction category was established from the description alone." };
}

export function classifyTransactions(rows: ParsedTransaction[]): TransactionClassification[] {
  return rows.map(classify);
}

export function summarizeTransactionClassification(analysis: TransactionAnalysis) {
  const classifications = classifyTransactions(analysis.rows);
  const counts = classifications.reduce<Record<TransactionCategory, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<TransactionCategory, number>);

  return {
    classifications,
    counts,
    internalTransferCandidates: analysis.internalTransferCandidates,
    duplicateTransfers: analysis.duplicateTransfers,
    warnings: analysis.warnings,
  };
}
