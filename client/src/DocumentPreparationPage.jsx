import { useState } from "react";

const COLORS = {
  green: "#0B3D2E",
  green2: "#155E43",
  gold: "#C9A227",
  paper: "#F6F4EC",
  ink: "#1D2321",
  red: "#A63A28",
};

const COPY = {
  ur: {
    title: "دستاویزات سے ریٹرن کی تیاری",
    subtitle: "تنخواہ، ٹیکس سرٹیفکیٹ، بینک، سرمایہ کاری یا دوسری دستاویزات اپ لوڈ کریں۔ AI ایک قابلِ تصدیق تیاری ورک شیٹ بنائے گا اور باقی دستاویزات/اشیا کی فہرست دے گا۔",
    privacy: "صرف پہلے سے چھپائی ہوئی دستاویزات اپ لوڈ کریں۔ فائلیں اس درخواست کے دوران سرور کے managed AI راستے سے گزرتی ہیں؛ ایپ کے database میں محفوظ نہیں ہوتیں۔ CNIC، NTN، IBAN، اکاؤنٹ نمبر، پاس ورڈ، OTP یا کارڈ کی معلومات شامل نہ کریں۔",
    choose: "دستاویزات منتخب کریں",
    selected: "دستاویزات تیار",
    run: "تیاری ورک شیٹ بنائیں",
    running: "دستاویزات پڑھ کر ورک شیٹ بن رہی ہے…",
    back: "مرکزی صفحہ",
    startOver: "نئی دستاویزات",
    error: "دستاویزات کی تیاری مکمل نہیں ہو سکی۔ فائل کی قسم/حجم چیک کر کے دوبارہ کوشش کریں۔",
    need: "کم از کم ایک PDF یا تصویر منتخب کریں۔",
    redaction: "میں نے تصدیق کی ہے کہ فائلوں سے حساس شناختی/اکاؤنٹ معلومات چھپائی گئی ہیں۔",
    remaining: "باقی تصدیق یا مطلوبہ اشیا",
    worksheet: "تیاری ورک شیٹ",
    salary: "تنخواہ",
    withholding: "ٹیکس کٹوتی/Withholding",
    otherIncome: "دیگر آمدن",
    deductions: "کٹوتیاں",
    assets: "سرمایہ کاری اور اثاثے",
    property: "جائیداد کے لین دین",
    banks: "بینک بیلنس",
    empty: "کوئی واضح اندراج نہیں ملا",
    source: "ماخذ",
    value: "رقم",
    note: "یہ آفیشل FBR/IRIS فارم نہیں ہے۔ ہر رقم اصل ریکارڈ سے ملائیں اور سرکاری ریٹرن میں خود درج کریں۔ یہ ٹول حتمی ٹیکس، شرح، استثنا، filing treatment یا FBR نتیجہ طے نہیں کرتا۔",
    taxYear: "ٹیکس سال",
    returnType: "ریٹرن کی قسم",
  },
  en: {
    title: "Prepare your return from documents",
    subtitle: "Upload salary, tax certificates, bank, investment, property, or other preparation documents. AI creates a verifiable preparation worksheet and lists remaining evidence or items.",
    privacy: "Upload redacted documents only. Files pass through the server-managed AI pathway for this request and are not saved in the app database. Do not include CNIC, NTN, IBAN, account numbers, passwords, OTPs, or card details.",
    choose: "Choose documents",
    selected: "documents ready",
    run: "Build preparation worksheet",
    running: "Reading documents and building the worksheet…",
    back: "Home",
    startOver: "Start over",
    error: "Document preparation could not be completed. Check file type and size, then try again.",
    need: "Select at least one PDF or image.",
    redaction: "I confirm that sensitive identity and account information has been redacted from these files.",
    remaining: "Remaining checks or items",
    worksheet: "Preparation worksheet",
    salary: "Salary",
    withholding: "Withholding / tax deducted",
    otherIncome: "Other income",
    deductions: "Deductions",
    assets: "Investments and assets",
    property: "Property transactions",
    banks: "Bank balances",
    empty: "No clear entries were extracted",
    source: "Source",
    value: "Amount",
    note: "This is not an official FBR/IRIS form. Verify every amount against the original record and enter the official return yourself. This tool does not determine final tax, rates, exemptions, filing treatment, or an FBR outcome.",
    taxYear: "Tax year",
    returnType: "Return type",
  },
};

const SECTIONS = [
  ["salary", "salary", "grossSalary"],
  ["withholding", "withholding", "amount"],
  ["otherIncome", "otherIncome", "amount"],
  ["deductions", "deductions", "amount"],
  ["investmentsAndAssets", "assets", "statedValue"],
  ["propertyTransactions", "property", "statedAmount"],
  ["bankBalances", "banks", "closingBalance"],
];

function formatMoney(value, lang) {
  return new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-PK", { maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function Section({ title, rows, amountKey, copy, lang }) {
  return (
    <section className="rounded-xl border p-4 mb-3" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
      <h3 className="font-bold mb-2" style={{ color: COLORS.green }}>{title}</h3>
      {rows.length === 0 ? <p className="text-sm opacity-60">{copy.empty}</p> : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="rounded-lg border p-3" style={{ borderColor: "#EDE7D6", background: "#FFFDF6" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold">{row.employerLabel || row.category || row.description || row.accountLabel || "Entry"}</div>
                <div className="text-sm font-bold whitespace-nowrap" dir="ltr">Rs. {formatMoney(row[amountKey], lang)}</div>
              </div>
              {(row.sourceRef || row.transactionDate || row.supportStatus) && <div className="text-xs opacity-65 mt-1">{row.sourceRef && `${copy.source}: ${row.sourceRef}`}{row.transactionDate ? ` · ${row.transactionDate}` : ""}{row.supportStatus ? ` · ${row.supportStatus}` : ""}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DocumentPreparationPage() {
  const [lang, setLang] = useState("ur");
  const [files, setFiles] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const copy = COPY[lang];

  const onFiles = (event) => {
    setError("");
    const picked = Array.from(event.target.files || []).slice(0, 6);
    for (const file of picked) {
      if (file.size > 4 * 1024 * 1024) {
        setError(`${file.name} ${lang === "ur" ? "زیادہ بڑا ہے (زیادہ سے زیادہ 4 MB)۔" : "is too large (maximum 4 MB)."}`);
        return;
      }
      if (!(file.type === "application/pdf" || file.type.startsWith("image/"))) {
        setError(`${file.name} ${lang === "ur" ? "PDF یا تصویر نہیں ہے۔" : "is not a PDF or image."}`);
        return;
      }
    }
    setFiles(picked);
  };

  const readB64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });

  const prepare = async () => {
    setError("");
    if (!confirmed) return setError(copy.redaction);
    if (!files.length) return setError(copy.need);
    setBusy(true);
    setResult(null);
    try {
      const documents = [];
      for (const file of files) {
        const data = await readB64(file);
        documents.push({ type: file.type === "application/pdf" ? "document" : "image", source: { type: "base64", media_type: file.type, data } });
      }
      const response = await fetch("/api/document-preparation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, documents }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "preparation failed");
      setResult(data);
    } catch {
      setError(copy.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: COLORS.paper, color: COLORS.ink }} dir={lang === "ur" ? "rtl" : "ltr"}>
      <header className="max-w-3xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="text-sm font-semibold" style={{ color: COLORS.green }}>{copy.back}</a>
          <button onClick={() => setLang(lang === "ur" ? "en" : "ur")} className="rounded-full border px-3 py-1 text-sm font-semibold" style={{ borderColor: COLORS.green, color: COLORS.green, background: "#fff" }}>{lang === "ur" ? "English" : "اردو"}</button>
        </div>
        <div className="mt-5 rounded-2xl p-5" style={{ background: COLORS.green, color: COLORS.paper }}>
          <div className="text-xs font-bold mb-1" style={{ color: COLORS.gold }}>{lang === "ur" ? "خصوصی تیاری فیچر" : "Special preparation feature"}</div>
          <h1 className="text-2xl font-bold mb-2">{copy.title}</h1>
          <p className="text-sm leading-relaxed opacity-90">{copy.subtitle}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        {!result ? (
          <>
            <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#E3D7AE", background: "#FBF6E3" }}>
              <p className="text-sm leading-relaxed">{copy.privacy}</p>
            </div>
            <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
              <label className="block rounded-lg border-2 border-dashed p-5 text-center cursor-pointer" style={{ borderColor: COLORS.gold }}>
                <input type="file" accept="application/pdf,image/*" multiple onChange={onFiles} className="sr-only" />
                <span className="font-bold" style={{ color: COLORS.green }}>{copy.choose}</span>
                <span className="block text-xs mt-1 opacity-65">PDF یا تصویر · زیادہ سے زیادہ 6 فائلیں · ہر فائل 4 MB</span>
              </label>
              <div className="text-sm mt-3" role="status">{files.length ? `${files.length} ${copy.selected}` : ""}</div>
              <label className="flex items-start gap-2 text-sm mt-4 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
                <span>{copy.redaction}</span>
              </label>
              {error && <p className="text-sm mt-3" role="alert" style={{ color: COLORS.red }}>{error}</p>}
              <button onClick={prepare} disabled={busy} className="rounded-lg px-5 py-3 text-sm font-bold mt-4 w-full disabled:opacity-50" style={{ background: COLORS.green, color: "#fff" }}>{busy ? copy.running : copy.run}</button>
            </div>
            <p className="text-xs opacity-65 leading-relaxed">{copy.note}</p>
          </>
        ) : (
          <>
            <div className="rounded-xl p-4 mb-4" style={{ background: COLORS.green, color: COLORS.paper }}>
              <h2 className="text-xl font-bold mb-2">{copy.worksheet}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"><span>{copy.taxYear}: <b>{result.worksheet.taxYear || "—"}</b></span><span>{copy.returnType}: <b>{result.worksheet.returnType}</b></span></div>
            </div>
            {result.remainingItems?.length > 0 && <section className="rounded-xl border p-4 mb-4" style={{ borderColor: "#E3D7AE", background: "#FBF6E3" }}><h2 className="font-bold mb-2" style={{ color: "#7A6210" }}>{copy.remaining}</h2><ul className="text-sm space-y-1 list-disc ps-5">{result.remainingItems.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
            {SECTIONS.map(([key, label, amountKey]) => <Section key={key} title={copy[label]} rows={result.worksheet[key] || []} amountKey={amountKey} copy={copy} lang={lang} />)}
            {result.observations?.length > 0 && <section className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}><h2 className="font-bold mb-2" style={{ color: COLORS.green }}>{lang === "ur" ? "مشاہدات" : "Observations"}</h2><ul className="text-sm space-y-1 list-disc ps-5">{result.observations.map((item, index) => <li key={index}>{item}</li>)}</ul></section>}
            <p className="text-xs opacity-65 leading-relaxed mb-4">{copy.note}</p>
            <button onClick={() => { setResult(null); setFiles([]); setConfirmed(false); }} className="rounded-lg px-5 py-3 text-sm font-bold" style={{ background: COLORS.green, color: "#fff" }}>{copy.startOver}</button>
          </>
        )}
      </main>
    </div>
  );
}
