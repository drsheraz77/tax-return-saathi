import type { ParsedTransaction } from "./taxReconciliation";
import { classifyTransactions, type TransactionCategory } from "./transactionClassification";

export type FundsFlowEvent = ParsedTransaction & {
  accountRef: string;
  category: TransactionCategory;
};

export type FundsFlowLink = {
  sourceRow: number;
  sourceAccount: string;
  transferRows: number[];
  applicationRow?: number;
  applicationAccount?: string;
  amount: number;
  sourceCategory: TransactionCategory;
  applicationCategory?: TransactionCategory;
  status: "traced" | "partial" | "unexplained";
  reason: string;
};

export type CrossAccountFundsFlow = {
  events: FundsFlowEvent[];
  links: FundsFlowLink[];
  crossAccountTransfers: Array<{ debitRow: number; debitAccount: string; creditRow: number; creditAccount: string; date: string; amount: number }>;
  totals: { sourceCredits: number; tracedToApplications: number; unexplainedSourceCredits: number };
  status: "traceable" | "partial" | "needs_review";
};

const SOURCE_CATEGORIES = new Set<TransactionCategory>(["property_sale", "loan", "gift"]);
const APPLICATION_CATEGORIES = new Set<TransactionCategory>(["property_purchase", "construction", "vehicle", "investment", "tax_payment"]);
const INCOME_SIGNAL = /salary|payroll|income|honorarium|consultancy|consulting|fee received|تنخواہ|آمدن/i;
const DAYS_WINDOW = 30;
const MONEY_TOLERANCE = 1;

function dayValue(date: string): number | null {
  const parsed = Date.parse(date);
  return Number.isFinite(parsed) ? parsed : null;
}

function withinWindow(sourceDate: string, targetDate: string): boolean {
  const source = dayValue(sourceDate);
  const target = dayValue(targetDate);
  if (source === null || target === null) return false;
  const days = (target - source) / 86_400_000;
  return days >= 0 && days <= DAYS_WINDOW;
}

function isInternalTransfer(row: ParsedTransaction, category: TransactionCategory) {
  return category === "internal_transfer";
}

export function traceFundsAcrossAccounts(rows: Array<ParsedTransaction & { accountRef?: string | null }>): CrossAccountFundsFlow {
  const normalized = rows.map((row) => ({ ...row, accountRef: String(row.accountRef || "unidentified account").slice(0, 80) }));
  const classifications = classifyTransactions(normalized);
  const events: FundsFlowEvent[] = normalized.map((row, index) => ({ ...row, accountRef: row.accountRef, category: classifications[index].category }));

  const transfers = events.filter((row) => isInternalTransfer(row, row.category));
  const crossAccountTransfers: CrossAccountFundsFlow["crossAccountTransfers"] = [];
  const usedTransferCredits = new Set<number>();

  for (const debit of transfers.filter((row) => row.direction === "debit")) {
    const credit = transfers.find((candidate) =>
      candidate.direction === "credit" &&
      !usedTransferCredits.has(candidate.rowNumber) &&
      candidate.accountRef !== debit.accountRef &&
      Math.abs(Math.abs(candidate.amount) - Math.abs(debit.amount)) <= MONEY_TOLERANCE &&
      withinWindow(debit.date, candidate.date),
    );
    if (credit) {
      usedTransferCredits.add(credit.rowNumber);
      crossAccountTransfers.push({
        debitRow: debit.rowNumber,
        debitAccount: debit.accountRef,
        creditRow: credit.rowNumber,
        creditAccount: credit.accountRef,
        date: debit.date,
        amount: Math.abs(debit.amount),
      });
    }
  }

  const sourceCredits = events.filter((row) =>
    row.direction === "credit" &&
    (SOURCE_CATEGORIES.has(row.category) || (row.category === "unknown" && INCOME_SIGNAL.test(row.description))),
  );

  const links: FundsFlowLink[] = [];
  const usedApplicationRows = new Set<number>();
  let tracedToApplications = 0;

  for (const source of sourceCredits) {
    const sourceAmount = Math.abs(source.amount);
    let available = sourceAmount;
    const transferPath: number[] = [];

    const outgoingTransfers = crossAccountTransfers.filter((transfer) =>
      transfer.debitAccount === source.accountRef &&
      transfer.creditAccount !== source.accountRef &&
      withinWindow(source.date, transfer.date) &&
      !transferPath.includes(transfer.debitRow) &&
      !transferPath.includes(transfer.creditRow),
    );

    const routedAmounts = new Map<string, number>();
    for (const transfer of outgoingTransfers) {
      transferPath.push(transfer.debitRow, transfer.creditRow);
      routedAmounts.set(transfer.creditAccount, (routedAmounts.get(transfer.creditAccount) || 0) + transfer.amount);
    }

    const destinations = outgoingTransfers.length
      ? Array.from(routedAmounts.entries()).map(([account, amount]) => ({
          account,
          amount,
          startDate: events.find((row) => row.rowNumber === outgoingTransfers.find((item) => item.creditAccount === account)?.creditRow)?.date || source.date,
        }))
      : [{ account: source.accountRef, amount: sourceAmount, startDate: source.date }];

    const routeRemaining = new Map<string, number>(destinations.map((destination) => [destination.account + "|" + destination.startDate, destination.amount]));
    const applications = destinations.flatMap((destination) =>
      events
        .filter((row) =>
          row.direction === "debit" &&
          !usedApplicationRows.has(row.rowNumber) &&
          row.accountRef === destination.account &&
          APPLICATION_CATEGORIES.has(row.category) &&
          withinWindow(destination.startDate, row.date),
        )
        .map((row) => ({ row, routeKey: destination.account + "|" + destination.startDate })),
    ).sort((a, b) => Math.abs(b.row.amount) - Math.abs(a.row.amount));

    for (const candidate of applications) {
      if (available <= MONEY_TOLERANCE) break;
      const application = candidate.row;
      const routeAvailable = routeRemaining.get(candidate.routeKey) || 0;
      const applied = Math.min(available, Math.abs(application.amount), routeAvailable);
      if (applied <= MONEY_TOLERANCE) continue;
      const status = applied + MONEY_TOLERANCE >= sourceAmount ? "traced" : "partial";
      links.push({
        sourceRow: source.rowNumber,
        sourceAccount: source.accountRef,
        transferRows: transferPath,
        applicationRow: application.rowNumber,
        applicationAccount: application.accountRef,
        amount: applied,
        sourceCategory: source.category,
        applicationCategory: application.category,
        status,
        reason: transferPath.length
          ? "Source receipt was followed through a matched cross-account transfer to a subsequent application."
          : "Source receipt and subsequent application were matched within the same account and date window.",
      });
      usedApplicationRows.add(application.rowNumber);
      routeRemaining.set(candidate.routeKey, Math.max(0, routeAvailable - applied));
      available = Math.max(0, available - applied);
      tracedToApplications += applied;
    }

    if (links.filter((link) => link.sourceRow === source.rowNumber).length === 0) {
      links.push({
        sourceRow: source.rowNumber,
        sourceAccount: source.accountRef,
        transferRows: transferPath,
        amount: 0,
        sourceCategory: source.category,
        status: "unexplained",
        reason: "A qualifying source receipt was identified but no subsequent documented application could be linked within the conservative matching window.",
      });
    }
  }

  const sourceTotal = sourceCredits.reduce((total, row) => total + Math.abs(row.amount), 0);
  const unexplained = Math.max(0, sourceTotal - tracedToApplications);
  const status = unexplained <= MONEY_TOLERANCE ? "traceable" : tracedToApplications > 0 ? "partial" : "needs_review";

  return {
    events,
    links,
    crossAccountTransfers,
    totals: {
      sourceCredits: Math.round(sourceTotal * 100) / 100,
      tracedToApplications: Math.round(tracedToApplications * 100) / 100,
      unexplainedSourceCredits: Math.round(unexplained * 100) / 100,
    },
    status,
  };
}
