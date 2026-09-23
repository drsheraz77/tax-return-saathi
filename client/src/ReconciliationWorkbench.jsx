import { useEffect, useMemo, useState } from "react";
import { calculateWealthReconciliation, compareBankBalances, parseTabularTransactions } from "../../shared/taxReconciliation";

const INITIAL_WEALTH = {
  openingWealth: "",
  income: "",
  capitalReceipts: "",
  assetSaleProceeds: "",
  loans: "",
  gifts: "",
  otherSources: "",
  personalExpenditure: "",
  taxPaid: "",
  assetPurchases: "",
  investments: "",
  loanRepayment: "",
  otherApplications: "",
  declaredClosingWealth: "",
};

const WEALTH_FIELDS = [
  ["openingWealth", "Opening wealth", "ابتدائی دولت"],
  ["income", "Income", "آمدنی"],
  ["capitalReceipts", "Capital receipts", "سرمایہ جاتی وصولیاں"],
  ["assetSaleProceeds", "Asset sale proceeds", "اثاثہ فروخت کی وصولی"],
  ["loans", "Loans received", "حاصل شدہ قرض"],
  ["gifts", "Gifts", "تحائف"],
  ["otherSources", "Other legitimate sources", "دیگر جائز ذرائع"],
  ["personalExpenditure", "Personal expenditure", "ذاتی اخراجات"],
  ["taxPaid", "Tax paid", "ادا شدہ ٹیکس"],
  ["assetPurchases", "Asset purchases", "اثاثہ خریداری"],
  ["investments", "Investments", "سرمایہ کاری"],
  ["loanRepayment", "Loan repayment", "قرض کی واپسی"],
  ["otherApplications", "Other applications", "دیگر استعمال"],
  ["declaredClosingWealth", "Declared closing wealth", "اعلان کردہ اختتامی دولت"],
];

const toNumber = (value) => {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};
const formatMoney = (value) => new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value || 0);

function Field({ id, label, urdu, value, onChange }) {
  return <label className="reconciliation__field"><span>{label}<br /><span lang="ur" dir="rtl">{urdu}</span></span><input inputMode="decimal" aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" /></label>;
}

function ResultMetric({ label, urdu, value, tone = "neutral" }) {
  return <div className={`reconciliation__metric reconciliation__metric--${tone}`}><span>{label}<br /><span lang="ur" dir="rtl">{urdu}</span></span><strong dir="ltr">Rs. {formatMoney(value)}</strong></div>;
}

export default function ReconciliationWorkbench() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("wealth");
  const [wealth, setWealth] = useState(INITIAL_WEALTH);
  const [bankRows, setBankRows] = useState([{ accountRef: "Account 1", statementClosingBalance: "", declaredWealthBalance: "" }]);
  const [transactionText, setTransactionText] = useState("");
  const [transactionFileName, setTransactionFileName] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const open = () => { setIsOpen(true); setNotice(""); };
    const close = () => setIsOpen(false);
    window.addEventListener("tax-return-saathi:open-reconciliation", open);
    window.addEventListener("tax-return-saathi:close-supplemental-panels", close);
    return () => {
      window.removeEventListener("tax-return-saathi:open-reconciliation", open);
      window.removeEventListener("tax-return-saathi:close-supplemental-panels", close);
    };
  }, []);

  const wealthResult = useMemo(() => calculateWealthReconciliation(Object.fromEntries(Object.entries(wealth).map(([key, value]) => [key, toNumber(value)]))), [wealth]);
  const bankResult = useMemo(() => compareBankBalances(bankRows.map((row) => ({ accountRef: row.accountRef, statementClosingBalance: toNumber(row.statementClosingBalance), declaredWealthBalance: toNumber(row.declaredWealthBalance) }))), [bankRows]);
  const transactionResult = useMemo(() => parseTabularTransactions(transactionText), [transactionText]);

  const setField = (key, value) => setWealth((current) => ({ ...current, [key]: value }));
  const reset = () => { setWealth(INITIAL_WEALTH); setBankRows([{ accountRef: "Account 1", statementClosingBalance: "", declaredWealthBalance: "" }]); setTransactionText(""); setTransactionFileName(""); setNotice("Local entries cleared. Nothing was sent to the server."); };
  const readFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setNotice("For privacy, choose a local CSV/TSV file up to 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setTransactionText(String(reader.result || "")); setTransactionFileName(file.name); setNotice("File read locally. It was not uploaded."); };
    reader.onerror = () => setNotice("This file could not be read locally.");
    reader.readAsText(file);
  };

  if (!isOpen) return null;
  return <aside className="reconciliation" aria-label="Local reconciliation workbench">
    <style>{`
      .reconciliation { position:fixed; z-index:75; right:16px; bottom:84px; width:min(650px,calc(100vw - 32px)); max-height:calc(100vh - 125px); overflow:auto; border:1px solid #d6bd67; border-radius:15px; background:#fffdf7; color:#173b31; box-shadow:0 18px 48px rgba(10,43,33,.28); font-family:Georgia,'Times New Roman',serif; }
      .reconciliation__header { display:flex; justify-content:space-between; gap:10px; padding:15px 16px; background:#0B3D2E; color:#fffdf2; }.reconciliation__header h2 { margin:0; font-size:19px; line-height:1.2; }.reconciliation__urdu { display:block; color:#f3e79e; font-size:14px; margin-top:3px; }.reconciliation__close { border:0; background:transparent; color:#fff; font-size:22px; cursor:pointer; min-width:32px; min-height:32px; }
      .reconciliation__body { padding:15px 16px 18px; }.reconciliation__privacy { margin:0 0 13px; padding:9px 10px; border-left:3px solid #caa518; background:#faf5df; color:#4d513c; font:12px/1.45 Arial,sans-serif; }.reconciliation__tabs { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:13px; }.reconciliation__tab { border:1px solid #b7ab79; border-radius:999px; background:#fffef9; color:#0B3D2E; cursor:pointer; padding:7px 9px; font:700 12px/1.2 inherit; }.reconciliation__tab[aria-pressed=true] { background:#0B3D2E; color:#fffdf2; border-color:#0B3D2E; }
      .reconciliation__grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }.reconciliation__field { display:flex; flex-direction:column; gap:4px; border:1px solid #e0d6aa; border-radius:9px; background:#fffefb; padding:8px; color:#355245; font-size:11px; line-height:1.25; }.reconciliation__field input { width:100%; box-sizing:border-box; border:1px solid #cfc59a; border-radius:6px; padding:7px; color:#173b31; background:#fff; font:13px Arial,sans-serif; }.reconciliation__help { margin:0 0 10px; color:#5b5b46; font:12px/1.4 Arial,sans-serif; }.reconciliation__result { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; margin-top:13px; }.reconciliation__metric { border:1px solid #ded5b4; border-radius:9px; padding:8px; background:#fffef9; color:#4d513c; font:11px/1.3 Arial,sans-serif; }.reconciliation__metric strong { display:block; margin-top:4px; color:#0B3D2E; font-size:14px; }.reconciliation__metric--alert { border-color:#d39a87; background:#fff1ed; }.reconciliation__metric--alert strong { color:#8b2e26; }.reconciliation__metric--ok { border-color:#afcdb7; background:#edf7ef; }.reconciliation__status { margin-top:10px; font-weight:700; color:#0B3D2E; }.reconciliation__status--alert { color:#8b2e26; }
      .reconciliation__row { display:grid; grid-template-columns:1.2fr 1fr 1fr auto; gap:6px; align-items:end; margin-bottom:8px; }.reconciliation__row button, .reconciliation__actions button { border:1px solid #0B3D2E; border-radius:7px; background:#0B3D2E; color:#fff; cursor:pointer; padding:8px 9px; font:700 11px/1.2 inherit; }.reconciliation__row button { background:#fff; color:#8b2e26; border-color:#8b2e26; }.reconciliation__textarea { width:100%; min-height:150px; box-sizing:border-box; border:1px solid #b7ab79; border-radius:8px; padding:9px; background:#fffef9; color:#173b31; font:12px/1.4 monospace; }.reconciliation__file { display:block; margin:9px 0; color:#075c48; font:700 12px Arial,sans-serif; }.reconciliation__summary { margin-top:12px; border:1px solid #ded5b4; border-radius:9px; padding:10px; background:#fffef9; font:12px/1.45 Arial,sans-serif; }.reconciliation__summary ul { margin:6px 0 0; padding-left:18px; }.reconciliation__actions { display:flex; flex-wrap:wrap; gap:7px; margin-top:14px; }.reconciliation__actions button.secondary { background:#fff; color:#0B3D2E; }.reconciliation__notice { margin-top:10px; color:#5b5b46; font:12px/1.4 Arial,sans-serif; }
      @media(max-width:640px) { .reconciliation { right:10px; bottom:74px; width:calc(100vw - 20px); max-height:calc(100vh - 96px); }.reconciliation__grid,.reconciliation__result { grid-template-columns:1fr; }.reconciliation__row { grid-template-columns:1fr 1fr; }.reconciliation__row label:first-child { grid-column:1 / -1; } }
    `}</style>
    <header className="reconciliation__header"><div><h2>Reconciliation workbench <span className="reconciliation__urdu" lang="ur" dir="rtl">ویلتھ اور بینک حساب ورک بینچ</span></h2></div><button className="reconciliation__close" type="button" onClick={() => setIsOpen(false)} aria-label="Close reconciliation workbench">×</button></header>
    <div className="reconciliation__body">
      <p className="reconciliation__privacy"><strong>Local-only tool:</strong> figures and pasted transactions stay in this browser tab and are not sent to the server or saved. Do not enter account numbers, CNIC, NTN, IBAN, names, or document text.<br /><span lang="ur" dir="rtl"><strong>صرف مقامی ٹول:</strong> اعداد اسی براؤزر میں رہتے ہیں؛ اکاؤنٹ نمبر، شناختی نمبر، NTN، IBAN، نام یا دستاویز کا متن درج نہ کریں۔</span></p>
      <div className="reconciliation__tabs" role="tablist" aria-label="Reconciliation tools"><button className="reconciliation__tab" aria-pressed={mode === "wealth"} onClick={() => setMode("wealth")}>Wealth / دولت</button><button className="reconciliation__tab" aria-pressed={mode === "bank"} onClick={() => setMode("bank")}>Bank cross-check / بینک</button><button className="reconciliation__tab" aria-pressed={mode === "transactions"} onClick={() => setMode("transactions")}>Transactions / لین دین</button></div>
      {mode === "wealth" && <><p className="reconciliation__help">Enter only amounts you have already reviewed. The formula is: opening wealth + sources − applications = expected closing wealth. Blank amounts are treated as zero, so confirm every relevant category before relying on the result.</p><div className="reconciliation__grid">{WEALTH_FIELDS.map(([id, label, urdu]) => <Field key={id} id={id} label={label} urdu={urdu} value={wealth[id]} onChange={(value) => setField(id, value)} />)}</div><div className="reconciliation__result"><ResultMetric label="Expected closing wealth" urdu="متوقع اختتامی دولت" value={wealthResult.expectedClosingWealth} /><ResultMetric label="Declared closing wealth" urdu="اعلان کردہ اختتامی دولت" value={wealthResult.declaredClosingWealth} /><ResultMetric label="Unexplained difference" urdu="غیر واضح فرق" value={wealthResult.unexplainedDifference} tone={wealthResult.status === "reconciled" ? "ok" : "alert"} /></div><p className={`reconciliation__status ${wealthResult.status === "reconciled" ? "" : "reconciliation__status--alert"}`}>{wealthResult.status === "reconciled" ? "Calculated figures reconcile within a Rs. 1 tolerance. Verify source records before filing." : "Calculated figures need review. This is a mathematical flag, not a tax or FBR determination."}</p></>}
      {mode === "bank" && <><p className="reconciliation__help">Use generic labels only. Compare each statement closing balance with the corresponding Wealth Statement bank balance. A difference is a review prompt, not proof of an error.</p>{bankRows.map((row, index) => <div className="reconciliation__row" key={index}><label className="reconciliation__field"><span>Generic account label</span><input value={row.accountRef} onChange={(event) => setBankRows((current) => current.map((item, i) => i === index ? { ...item, accountRef: event.target.value } : item))} /></label><label className="reconciliation__field"><span>Statement closing</span><input inputMode="decimal" value={row.statementClosingBalance} onChange={(event) => setBankRows((current) => current.map((item, i) => i === index ? { ...item, statementClosingBalance: event.target.value } : item))} /></label><label className="reconciliation__field"><span>Wealth balance</span><input inputMode="decimal" value={row.declaredWealthBalance} onChange={(event) => setBankRows((current) => current.map((item, i) => i === index ? { ...item, declaredWealthBalance: event.target.value } : item))} /></label><button type="button" onClick={() => setBankRows((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))}>Remove</button></div>)}<button className="reconciliation__tab" type="button" onClick={() => setBankRows((current) => [...current, { accountRef: `Account ${current.length + 1}`, statementClosingBalance: "", declaredWealthBalance: "" }])}>+ Add generic account</button><div className="reconciliation__summary"><strong>Cross-check results / کراس چیک</strong><ul>{bankResult.map((row) => <li key={row.accountRef}>{row.accountRef}: statement Rs. {formatMoney(row.statementClosingBalance)} vs Wealth Rs. {formatMoney(row.declaredWealthBalance)} — <strong>{row.status === "matched" ? "matched" : `difference Rs. ${formatMoney(row.difference)}`}</strong></li>)}</ul></div></>}
      {mode === "transactions" && <><p className="reconciliation__help">Paste CSV, TSV, or Excel-copied tabular rows with a header such as Date, Description, Amount—or separate Credit and Debit columns. Parsing runs locally. Transfers are candidates for review only and are not automatically removed from income.</p><label className="reconciliation__file">Read a CSV/TSV file locally <input type="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" onChange={readFile} /></label>{transactionFileName && <p className="reconciliation__notice">Local file: {transactionFileName}</p>}<textarea className="reconciliation__textarea" aria-label="Paste transaction table" value={transactionText} onChange={(event) => { setTransactionText(event.target.value); setTransactionFileName(""); }} placeholder={'Date,Description,Amount\n2026-06-30,Internal transfer to own account,-500000\n2026-06-30,Internal transfer from own account,500000'} /><div className="reconciliation__result"><ResultMetric label="Credits" urdu="کریڈٹس" value={transactionResult.totalCredits} /><ResultMetric label="Debits" urdu="ڈیبٹس" value={transactionResult.totalDebits} /><ResultMetric label="Rows read" urdu="پڑھی گئی قطاریں" value={transactionResult.rows.length} /></div><div className="reconciliation__summary"><strong>Review prompts / جائزہ</strong><ul><li>Internal-transfer candidates: {transactionResult.internalTransferCandidates.length}</li><li>Possible duplicate transfers: {transactionResult.duplicateTransfers.length}</li>{transactionResult.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>{transactionResult.duplicateTransfers.length > 0 && <p>Possible duplicates are rows {transactionResult.duplicateTransfers.flatMap((item) => item.rowNumbers).join(", ")}. Confirm against the statement before excluding anything.</p>}</div></>}
      <div className="reconciliation__actions"><button type="button" className="secondary" onClick={reset}>Clear local entries</button><button type="button" className="secondary" onClick={() => setIsOpen(false)}>Close</button></div>{notice && <p className="reconciliation__notice" role="status">{notice}</p>}
    </div>
  </aside>;
}
