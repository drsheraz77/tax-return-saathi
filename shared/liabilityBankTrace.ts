import type { ParsedTransaction } from "./taxReconciliation";
import { classifyTransactions } from "./transactionClassification";

export type LiabilityBankLink = {
  liabilityLabel: string;
  liabilityAmount: number;
  drawdownAmount: number;
  repaymentAmount: number;
  drawdownRows: number[];
  repaymentRows: number[];
  status: "drawdown_traced" | "repayment_traced" | "partial" | "requires_verification";
  detail: string;
};

const TOLERANCE = 1;
const WINDOW_DAYS = 60;

function norm(s: string) { return s.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function related(label: string, description: string, lender?: string, reference?: string) {
  const text = norm(description);
  const labelWords = norm(label).split(" ").filter(x => x.length >= 3 && !["loan", "payable", "credit", "premium", "vehicle"].includes(x));
  const labelMatches = labelWords.filter(x => text.includes(x));
  const normalizedLabel = norm(label);
  const exactLabelMatch = normalizedLabel.length >= 3 && text.includes(normalizedLabel);
  const labelMatch = exactLabelMatch || (labelWords.length >= 2 && labelMatches.length >= 2);
  const lenderMatch = !!lender && norm(lender).length >= 3 && text.includes(norm(lender));
  const referenceMatch = !!reference && norm(reference).length >= 3 && text.includes(norm(reference));
  return referenceMatch || (lenderMatch && (labelMatch || /loan|repayment|installment|emi|قسط|قرض/i.test(description))) || labelMatch;
}
function withinWindow(date: string, start?: string, end?: string) {
  const x = Date.parse(date);
  if (!Number.isFinite(x)) return false;
  if (start) {
    const s = Date.parse(start);
    if (Number.isFinite(s) && x < s) return false;
  }
  if (end) {
    const e = Date.parse(end);
    if (Number.isFinite(e) && x > e) return false;
  }
  return true;
}

export function traceLiabilityBankMovements(
  rows: Array<ParsedTransaction & { accountRef?: string | null }>,
  liabilities: Array<{ label: string; amount: number; lender?: string; reference?: string }>,
  period?: { startDate?: string; endDate?: string },
): LiabilityBankLink[] {
  const normalized = rows.map(r => ({ ...r, accountRef: String(r.accountRef || "unidentified account") }));
  const classified = classifyTransactions(normalized);
  const events = normalized.map((r, i) => ({ ...r, category: classified[i].category }));
  const usedDrawdowns = new Set<number>();
  const usedRepayments = new Set<number>();

  return liabilities.map(liability => {
    const amount = Math.max(0, liability.amount);
    const drawdowns = events.filter(e =>
      !usedDrawdowns.has(e.rowNumber) &&
      e.direction === "credit" &&
      e.category === "loan" &&
      related(liability.label, e.description, liability.lender, liability.reference) &&
      withinWindow(e.date, period?.startDate, period?.endDate),
    ).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    const repayments = events.filter(e =>
      !usedRepayments.has(e.rowNumber) &&
      e.direction === "debit" &&
      (e.category === "loan" || /loan repayment|loan payment|installment|emi|قسط|قرض/i.test(e.description)) &&
      related(liability.label, e.description) &&
      withinWindow(e.date, period?.startDate, period?.endDate),
    ).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

    let drawdown = 0;
    const drawRows: number[] = [];
    for (const row of drawdowns) {
      if (drawdown >= amount - TOLERANCE) break;
      const applied = Math.min(Math.abs(row.amount), amount - drawdown);
      if (applied <= TOLERANCE) continue;
      drawdown += applied;
      drawRows.push(row.rowNumber);
      usedDrawdowns.add(row.rowNumber);
    }

    let repayment = 0;
    const repaymentRows: number[] = [];
    for (const row of repayments) {
      if (repayment >= amount - TOLERANCE) break;
      const applied = Math.min(Math.abs(row.amount), amount - repayment);
      if (applied <= TOLERANCE) continue;
      repayment += applied;
      repaymentRows.push(row.rowNumber);
      usedRepayments.add(row.rowNumber);
    }

    const hasDraw = drawdown > TOLERANCE;
    const hasRepayment = repayment > TOLERANCE;
    let status: LiabilityBankLink["status"] = "requires_verification";
    if (hasDraw && hasRepayment) status = "partial";
    else if (hasDraw) status = "drawdown_traced";
    else if (hasRepayment) status = "repayment_traced";

    return {
      liabilityLabel: liability.label,
      liabilityAmount: amount,
      drawdownAmount: Math.round(drawdown * 100) / 100,
      repaymentAmount: Math.round(repayment * 100) / 100,
      drawdownRows: drawRows,
      repaymentRows,
      status,
      detail: hasDraw || hasRepayment
        ? "Bank movements with loan-related descriptions were matched to the liability label. Confirm the lender statement, legal liability and reporting date; bank wording alone is not proof of the liability."
        : "No matching loan drawdown or repayment was established from the supplied bank transactions.",
    };
  });
}

export function summarizeLiabilityBankMovements(results: LiabilityBankLink[]) {
  return {
    total: results.length,
    drawdownsTraced: results.filter(x => x.status === "drawdown_traced" || x.status === "partial").length,
    repaymentsTraced: results.filter(x => x.status === "repayment_traced" || x.status === "partial").length,
    requiresVerification: results.filter(x => x.status === "requires_verification").length,
    results,
  };
}
