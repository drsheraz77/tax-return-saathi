import type { ParsedTransaction } from "./taxReconciliation";
import { classifyTransactions, type TransactionCategory } from "./transactionClassification";

export type AssetFundingTrace = {
  label: string;
  assetType: "investment" | "vehicle" | "other" | "property";
  declaredValue: number;
  matchedApplicationAmount: number;
  tracedSourceAmount: number;
  unexplainedAmount: number;
  status: "traced" | "partial" | "needs_review";
  applicationRows: number[];
  sourceRows: number[];
  reason: string;
};

const TOLERANCE = 1;
const WINDOW_DAYS = 30;
const SOURCE_CATEGORIES = new Set<TransactionCategory>(["property_sale", "loan", "gift"]);
const APPLICATION_CATEGORIES = new Set<TransactionCategory>(["property_purchase", "construction", "vehicle", "investment"]);

function dateValue(value: string) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function withinWindow(source: string, application: string) {
  const a = dateValue(source);
  const b = dateValue(application);
  if (a === null || b === null) return false;
  const days = (b - a) / 86_400_000;
  return days >= 0 && days <= WINDOW_DAYS;
}

function labelMatches(description: string, label: string) {
  const terms = label.toLocaleLowerCase().split(/[^a-z0-9]+/).filter(x => x.length >= 3);
  const text = description.toLocaleLowerCase();
  return terms.length > 0 && terms.some(term => text.includes(term));
}

export type AssetFundingInput = {
  label: string;
  assetType: "investment" | "vehicle" | "other" | "property";
  declaredValue: number;
};

export function traceAssetFunding(rows: Array<ParsedTransaction & { accountRef?: string | null }>, assets: AssetFundingInput[]): AssetFundingTrace[] {
  const normalized = rows.map(row => ({ ...row, accountRef: String(row.accountRef || "unidentified account") }));
  const classifications = classifyTransactions(normalized);
  const events = normalized.map((row, i) => ({ ...row, category: classifications[i].category }));
  const sourceRows = events.filter(row =>
    row.direction === "credit" &&
    (SOURCE_CATEGORIES.has(row.category) || (row.category === "unknown" && /salary|payroll|income|honorarium|consultancy|fee received|تنخواہ|آمدن/i.test(row.description)))
  );
  const applications = events.filter(row =>
    row.direction === "debit" && APPLICATION_CATEGORIES.has(row.category)
  );
  const usedSources = new Set<number>();
  const usedApplications = new Set<number>();

  return assets.map(asset => {
    const target = Math.max(0, Number.isFinite(asset.declaredValue) ? asset.declaredValue : 0);
    const candidates = applications
      .filter(row => !usedApplications.has(row.rowNumber) && labelMatches(row.description, asset.label))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    let matched = 0;
    let traced = 0;
    const applicationRows: number[] = [];
    const sourceRowsForAsset: number[] = [];

    for (const application of candidates) {
      if (matched >= target - TOLERANCE) break;
      const applied = Math.min(Math.abs(application.amount), target - matched);
      if (applied <= TOLERANCE) continue;
      matched += applied;
      applicationRows.push(application.rowNumber);
      usedApplications.add(application.rowNumber);

      let remaining = applied;
      const sourceCandidates = sourceRows
        .filter(source => !usedSources.has(source.rowNumber) && source.accountRef === application.accountRef && withinWindow(source.date, application.date))
        .sort((a, b) => dateValue(b.date)! - dateValue(a.date)!);

      for (const source of sourceCandidates) {
        if (remaining <= TOLERANCE) break;
        const sourceAmount = Math.abs(source.amount);
        const link = Math.min(remaining, sourceAmount);
        if (link <= TOLERANCE) continue;
        remaining -= link;
        traced += link;
        sourceRowsForAsset.push(source.rowNumber);
        usedSources.add(source.rowNumber);
      }
    }

    const unexplained = Math.max(0, target - traced);
    return {
      label: asset.label,
      assetType: asset.assetType,
      declaredValue: target,
      matchedApplicationAmount: Math.round(matched * 100) / 100,
      tracedSourceAmount: Math.round(traced * 100) / 100,
      unexplainedAmount: Math.round(unexplained * 100) / 100,
      status: unexplained <= TOLERANCE ? "traced" : traced > 0 ? "partial" : "needs_review",
      applicationRows,
      sourceRows: sourceRowsForAsset,
      reason: traced > 0
        ? "A qualifying asset application was matched to preceding source receipts in the same account within the conservative date window."
        : "No qualifying preceding source receipt could be linked to the identified asset application within the conservative matching window.",
    };
  });
}

export function summarizeAssetFundingTrace(results: AssetFundingTrace[]) {
  return {
    totalAssets: results.length,
    traced: results.filter(x => x.status === "traced").length,
    partial: results.filter(x => x.status === "partial").length,
    needsReview: results.filter(x => x.status === "needs_review").length,
    totalDeclaredValue: results.reduce((s, x) => s + x.declaredValue, 0),
    totalTracedSourceAmount: results.reduce((s, x) => s + x.tracedSourceAmount, 0),
    totalUnexplainedAmount: results.reduce((s, x) => s + x.unexplainedAmount, 0),
    results,
  };
}
