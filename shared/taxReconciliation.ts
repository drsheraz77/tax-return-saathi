export type WealthInputs = {
  openingWealth?: number | null;
  income?: number | null;
  capitalReceipts?: number | null;
  assetSaleProceeds?: number | null;
  loans?: number | null;
  gifts?: number | null;
  otherSources?: number | null;
  personalExpenditure?: number | null;
  taxPaid?: number | null;
  assetPurchases?: number | null;
  investments?: number | null;
  loanRepayment?: number | null;
  otherApplications?: number | null;
  declaredClosingWealth?: number | null;
};

export type BankBalanceCheck = {
  accountRef: string;
  statementClosingBalance: number;
  declaredWealthBalance: number;
};

export type FundsTraceInputs = {
  openingFunds?: number | null;
  saleProceeds?: number | null;
  income?: number | null;
  loans?: number | null;
  gifts?: number | null;
  otherReceipts?: number | null;
  assetPurchases?: number | null;
  construction?: number | null;
  vehicleBookings?: number | null;
  otherApplications?: number | null;
};

const MONEY_TOLERANCE = 1;

export function money(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

const sum = (values: unknown[]) => money(values.reduce((total: number, value: unknown) => total + money(value), 0));

export function calculateWealthReconciliation(input: WealthInputs) {
  const sources = {
    openingWealth: money(input.openingWealth),
    income: money(input.income),
    capitalReceipts: money(input.capitalReceipts),
    assetSaleProceeds: money(input.assetSaleProceeds),
    loans: money(input.loans),
    gifts: money(input.gifts),
    otherSources: money(input.otherSources),
  };
  const applications = {
    personalExpenditure: money(input.personalExpenditure),
    taxPaid: money(input.taxPaid),
    assetPurchases: money(input.assetPurchases),
    investments: money(input.investments),
    loanRepayment: money(input.loanRepayment),
    otherApplications: money(input.otherApplications),
  };
  const totalSources = sum(Object.values(sources));
  const totalApplications = sum(Object.values(applications));
  const expectedClosingWealth = money(totalSources - totalApplications);
  const declaredClosingWealth = money(input.declaredClosingWealth);
  const unexplainedDifference = money(declaredClosingWealth - expectedClosingWealth);

  return {
    status: Math.abs(unexplainedDifference) <= MONEY_TOLERANCE ? "reconciled" : "needs_review",
    sources,
    totalSources,
    applications,
    totalApplications,
    expectedClosingWealth,
    declaredClosingWealth,
    unexplainedDifference,
    tolerance: MONEY_TOLERANCE,
  } as const;
}

export function compareBankBalances(checks: BankBalanceCheck[]) {
  return checks.map((check) => {
    const statementClosingBalance = money(check.statementClosingBalance);
    const declaredWealthBalance = money(check.declaredWealthBalance);
    const difference = money(statementClosingBalance - declaredWealthBalance);
    return {
      accountRef: String(check.accountRef || "unidentified account").slice(0, 80),
      statementClosingBalance,
      declaredWealthBalance,
      difference,
      status: Math.abs(difference) <= MONEY_TOLERANCE ? "matched" : "needs_review",
    } as const;
  });
}

export function traceFunds(input: FundsTraceInputs) {
  const openingFunds = money(input.openingFunds);
  const receipts = {
    saleProceeds: money(input.saleProceeds),
    income: money(input.income),
    loans: money(input.loans),
    gifts: money(input.gifts),
    otherReceipts: money(input.otherReceipts),
  };
  const applications = {
    assetPurchases: money(input.assetPurchases),
    construction: money(input.construction),
    vehicleBookings: money(input.vehicleBookings),
    otherApplications: money(input.otherApplications),
  };
  const totalAvailable = money(openingFunds + sum(Object.values(receipts)));
  const totalApplications = sum(Object.values(applications));
  const remainingFunds = money(totalAvailable - totalApplications);

  return {
    openingFunds,
    receipts,
    totalAvailable,
    applications,
    totalApplications,
    remainingFunds,
    status: remainingFunds < -MONEY_TOLERANCE ? "needs_review" : "traceable",
  } as const;
}

export type ParsedTransaction = {
  rowNumber: number;
  date: string;
  description: string;
  amount: number;
  direction: "credit" | "debit" | "unknown";
};

export type TransactionAnalysis = {
  rows: ParsedTransaction[];
  totalCredits: number;
  totalDebits: number;
  duplicateTransfers: Array<{ key: string; rowNumbers: number[]; amount: number; description: string }>;
  internalTransferCandidates: Array<{ debitRow: number; creditRow: number; date: string; amount: number }>;
  warnings: string[];
};

const TRANSFER_WORDS = /transfer|ibft|intra|own account|internal|funds? moved|a\/c to a\/c|بینک|منتقلی/i;

function splitDelimitedLine(line: string, separator: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === separator && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function parseAmount(value: unknown): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const negative = /^\(.*\)$/.test(raw) || /-$/.test(raw);
  const numeric = Number(raw.replace(/rs\.?/gi, "").replace(/[(),\s₨]/g, "").replace(/-$/, ""));
  if (!Number.isFinite(numeric)) return null;
  return money(negative ? -Math.abs(numeric) : numeric);
}

function headerIndex(headers: string[], names: string[]) {
  return headers.findIndex((header) => names.some((name) => header.includes(name)));
}

function normalizeHeader(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function parseTabularTransactions(input: string, maxRows = 1000): TransactionAnalysis {
  const lines = String(input || "").replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], totalCredits: 0, totalDebits: 0, duplicateTransfers: [], internalTransferCandidates: [], warnings: ["Add a header row and at least one transaction row."] };
  const headerLine = lines[0];
  const separators = ["\t", ",", ";"];
  const separator = separators.sort((a, b) => splitDelimitedLine(headerLine, b).length - splitDelimitedLine(headerLine, a).length)[0];
  const headers = splitDelimitedLine(headerLine, separator).map(normalizeHeader);
  const dateColumn = headerIndex(headers, ["date", "transaction date", "value date"]);
  const descriptionColumn = headerIndex(headers, ["description", "details", "narration", "particular", "remarks"]);
  const amountColumn = headerIndex(headers, ["amount", "transaction amount"]);
  const creditColumn = headerIndex(headers, ["credit", "deposit", "cr"]);
  const debitColumn = headerIndex(headers, ["debit", "withdrawal", "dr"]);
  const warnings: string[] = [];
  if (dateColumn < 0) warnings.push("No date column was identified; rows are kept with a blank date.");
  if (descriptionColumn < 0) warnings.push("No description column was identified; transfer matching may be limited.");
  if (amountColumn < 0 && creditColumn < 0 && debitColumn < 0) warnings.push("No amount, credit, or debit column was identified.");

  const rows: ParsedTransaction[] = [];
  const dataLines = lines.slice(1, maxRows + 1);
  for (let offset = 0; offset < dataLines.length; offset += 1) {
    const line = dataLines[offset];
    const cells = splitDelimitedLine(line, separator);
    const credit = creditColumn >= 0 ? parseAmount(cells[creditColumn]) : null;
    const debit = debitColumn >= 0 ? parseAmount(cells[debitColumn]) : null;
    let amount = amountColumn >= 0 ? parseAmount(cells[amountColumn]) : null;
    if (amount === null && (credit !== null || debit !== null)) amount = money((credit || 0) - Math.abs(debit || 0));
    if (amount === null || amount === 0) continue;
    const description = descriptionColumn >= 0 ? String(cells[descriptionColumn] || "").trim() : "";
    const date = dateColumn >= 0 ? String(cells[dateColumn] || "").trim() : "";
    const direction = amount > 0 ? "credit" : amount < 0 ? "debit" : "unknown";
    rows.push({ rowNumber: offset + 2, date, description, amount, direction });
  }
  if (lines.length - 1 > maxRows) warnings.push(`Only the first ${maxRows} data rows were read locally.`);

  const transferRows = rows.filter((row) => TRANSFER_WORDS.test(row.description));
  const duplicateMap = new Map<string, ParsedTransaction[]>();
  for (const row of transferRows) {
    const key = `${row.date}|${Math.abs(row.amount).toFixed(2)}|${row.description.toLocaleLowerCase().replace(/\s+/g, " ").trim()}`;
    duplicateMap.set(key, [...(duplicateMap.get(key) || []), row]);
  }
  const duplicateTransfers = Array.from(duplicateMap.entries())
    .filter((entry: [string, ParsedTransaction[]]) => entry[1].length > 1)
    .map(([key, grouped]: [string, ParsedTransaction[]]) => ({ key, rowNumbers: grouped.map((row: ParsedTransaction) => row.rowNumber), amount: Math.abs(grouped[0].amount), description: grouped[0].description }));

  const internalTransferCandidates: TransactionAnalysis["internalTransferCandidates"] = [];
  const byDateAndAmount = new Map<string, ParsedTransaction[]>();
  for (const row of rows) {
    const key = `${row.date}|${Math.abs(row.amount).toFixed(2)}`;
    byDateAndAmount.set(key, [...(byDateAndAmount.get(key) || []), row]);
  }
  for (const [key, grouped] of Array.from(byDateAndAmount.entries())) {
    const debitRow = grouped.find((row: ParsedTransaction) => row.direction === "debit");
    const creditRow = grouped.find((row: ParsedTransaction) => row.direction === "credit");
    if (debitRow && creditRow && (TRANSFER_WORDS.test(debitRow.description) || TRANSFER_WORDS.test(creditRow.description))) {
      const [date, amount] = key.split("|");
      internalTransferCandidates.push({ debitRow: debitRow.rowNumber, creditRow: creditRow.rowNumber, date, amount: Number(amount) });
    }
  }

  return {
    rows,
    totalCredits: money(rows.filter((row) => row.amount > 0).reduce((sumValue, row) => sumValue + row.amount, 0)),
    totalDebits: money(Math.abs(rows.filter((row) => row.amount < 0).reduce((sumValue, row) => sumValue + row.amount, 0))),
    duplicateTransfers,
    internalTransferCandidates,
    warnings,
  };
}

export function analyzeParsedTransactions(rows: ParsedTransaction[]): TransactionAnalysis {
  const normalizedRows = rows.map((row) => ({
    ...row,
    amount: money(row.amount),
    description: String(row.description || ""),
    date: String(row.date || ""),
  }));
  const transferRows = normalizedRows.filter((row) => TRANSFER_WORDS.test(row.description));
  const duplicateMap = new Map<string, ParsedTransaction[]>();
  for (const row of transferRows) {
    const key = `${row.date}|${Math.abs(row.amount).toFixed(2)}|${row.description.toLocaleLowerCase().replace(/\\s+/g, " ").trim()}`;
    duplicateMap.set(key, [...(duplicateMap.get(key) || []), row]);
  }
  const duplicateTransfers = Array.from(duplicateMap.entries())
    .filter(([, grouped]) => grouped.length > 1)
    .map(([key, grouped]) => ({ key, rowNumbers: grouped.map((row) => row.rowNumber), amount: Math.abs(grouped[0].amount), description: grouped[0].description }));
  const byDateAndAmount = new Map<string, ParsedTransaction[]>();
  for (const row of normalizedRows) {
    const key = `${row.date}|${Math.abs(row.amount).toFixed(2)}`;
    byDateAndAmount.set(key, [...(byDateAndAmount.get(key) || []), row]);
  }
  const internalTransferCandidates: TransactionAnalysis["internalTransferCandidates"] = [];
  for (const [key, grouped] of Array.from(byDateAndAmount.entries())) {
    const debitRow = grouped.find((row: ParsedTransaction) => row.direction === "debit");
    const creditRow = grouped.find((row: ParsedTransaction) => row.direction === "credit");
    if (debitRow && creditRow && (TRANSFER_WORDS.test(debitRow.description) || TRANSFER_WORDS.test(creditRow.description))) {
      const [date, amount] = key.split("|");
      internalTransferCandidates.push({ debitRow: debitRow.rowNumber, creditRow: creditRow.rowNumber, date, amount: Number(amount) });
    }
  }
  return {
    rows: normalizedRows,
    totalCredits: money(normalizedRows.filter((row) => row.amount > 0).reduce((sumValue, row) => sumValue + row.amount, 0)),
    totalDebits: money(Math.abs(normalizedRows.filter((row) => row.amount < 0).reduce((sumValue, row) => sumValue + row.amount, 0))),
    duplicateTransfers,
    internalTransferCandidates,
    warnings: [],
  };
}
