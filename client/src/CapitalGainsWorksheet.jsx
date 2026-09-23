import { useMemo, useState } from "react";
import { calculateCapitalGain, calculatePropertyFundsFlow, capitalGainDocumentChecklist } from "../../shared/capitalGains";

const INITIAL = {
  assetType: "property",
  description: "",
  acquisitionDate: "",
  saleDate: "",
  ownershipPercent: "100",
  purchasePrice: "",
  improvementCost: "",
  purchaseExpenses: "",
  salePrice: "",
  saleExpenses: "",
  declaredValueOrFbrValue: "",
  mortgageDrawdown: "",
  ownFundsUsed: "",
  mortgageOrLoanRepaid: "",
  netFundsReceived: "",
};
const toNumber = (value) => { const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, "")); return Number.isFinite(parsed) ? parsed : 0; };
const money = (value) => new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value || 0);
const assetOptions = [["property", "Property / جائیداد"], ["shares", "Shares / حصص"], ["etf", "ETF / ای ٹی ایف"], ["bonds", "Bonds / بانڈز"], ["other", "Other capital asset / دیگر اثاثہ"]];

function Input({ label, urdu, value, onChange, type = "number" }) {
  return <label className="reconciliation__field"><span>{label}<br /><span lang="ur" dir="rtl">{urdu}</span></span><input aria-label={label} type={type} inputMode={type === "number" ? "decimal" : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={type === "number" ? "0" : ""} /></label>;
}

export default function CapitalGainsWorksheet() {
  const [form, setForm] = useState(INITIAL);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const numeric = (key) => toNumber(form[key]);
  const gain = useMemo(() => calculateCapitalGain({
    assetType: form.assetType,
    description: form.description,
    acquisitionDate: form.acquisitionDate,
    saleDate: form.saleDate,
    ownershipPercent: numeric("ownershipPercent"),
    purchasePrice: numeric("purchasePrice"),
    improvementCost: numeric("improvementCost"),
    purchaseExpenses: numeric("purchaseExpenses"),
    salePrice: numeric("salePrice"),
    saleExpenses: numeric("saleExpenses"),
    declaredValueOrFbrValue: form.declaredValueOrFbrValue === "" ? null : numeric("declaredValueOrFbrValue"),
  }), [form]);
  const flow = useMemo(() => calculatePropertyFundsFlow({
    purchasePrice: numeric("purchasePrice"), purchaseExpenses: numeric("purchaseExpenses"), improvementCost: numeric("improvementCost"),
    mortgageDrawdown: numeric("mortgageDrawdown"), ownFundsUsed: numeric("ownFundsUsed"), salePrice: numeric("salePrice"), saleExpenses: numeric("saleExpenses"),
    mortgageOrLoanRepaid: numeric("mortgageOrLoanRepaid"), netFundsReceived: form.netFundsReceived === "" ? null : numeric("netFundsReceived"),
  }), [form]);
  const reset = () => setForm(INITIAL);
  const isProperty = form.assetType === "property";
  const checklist = capitalGainDocumentChecklist(form.assetType);

  return <div>
    <p className="reconciliation__help">This worksheet calculates arithmetic only: cost basis, net proceeds, ownership share, gain/loss, holding days, and property funds flow. It does not calculate tax due, apply a rate or exemption, decide valuation, or determine filing treatment.</p>
    <div className="reconciliation__grid">
      <label className="reconciliation__field"><span>Asset type<br /><span lang="ur" dir="rtl">اثاثے کی قسم</span></span><select value={form.assetType} onChange={(event) => set("assetType", event.target.value)}>{assetOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <Input label="Short description (no identifiers)" urdu="مختصر تفصیل (شناختی معلومات نہیں)" type="text" value={form.description} onChange={(value) => set("description", value)} />
      <Input label="Acquisition date" urdu="حصول کی تاریخ" type="date" value={form.acquisitionDate} onChange={(value) => set("acquisitionDate", value)} />
      <Input label="Sale date" urdu="فروخت کی تاریخ" type="date" value={form.saleDate} onChange={(value) => set("saleDate", value)} />
      <Input label="Ownership share (%)" urdu="ملکیتی حصہ (فیصد)" value={form.ownershipPercent} onChange={(value) => set("ownershipPercent", value)} />
      <Input label="Purchase/acquisition price" urdu="خرید/حصول کی قیمت" value={form.purchasePrice} onChange={(value) => set("purchasePrice", value)} />
      <Input label="Improvement cost" urdu="بہتری/تعمیر کی لاگت" value={form.improvementCost} onChange={(value) => set("improvementCost", value)} />
      <Input label="Purchase expenses" urdu="خرید کے اخراجات" value={form.purchaseExpenses} onChange={(value) => set("purchaseExpenses", value)} />
      <Input label="Sale consideration" urdu="فروخت کی رقم" value={form.salePrice} onChange={(value) => set("salePrice", value)} />
      <Input label="Sale expenses" urdu="فروخت کے اخراجات" value={form.saleExpenses} onChange={(value) => set("saleExpenses", value)} />
      <Input label="Comparison/official value (optional)" urdu="تقابلی/سرکاری قدر (اختیاری)" value={form.declaredValueOrFbrValue} onChange={(value) => set("declaredValueOrFbrValue", value)} />
    </div>
    <div className="reconciliation__result"><div className="reconciliation__metric"><span>Cost basis<br /><span lang="ur" dir="rtl">لاگت کی بنیاد</span></span><strong dir="ltr">Rs. {money(gain.costBasis)}</strong></div><div className="reconciliation__metric"><span>Net proceeds<br /><span lang="ur" dir="rtl">خالص وصولی</span></span><strong dir="ltr">Rs. {money(gain.netProceeds)}</strong></div><div className={`reconciliation__metric ${gain.result === "loss" ? "reconciliation__metric--alert" : "reconciliation__metric--ok"}`}><span>{gain.result === "gain" ? "Gain" : "Loss"}<br /><span lang="ur" dir="rtl">{gain.result === "gain" ? "منافع" : "نقصان"}</span></span><strong dir="ltr">Rs. {money(Math.abs(gain.gainOrLoss))}</strong></div></div>
    <div className="reconciliation__summary"><strong>Transaction record / لین دین ریکارڈ</strong><ul><li>Whole-asset cost basis: Rs. {money(gain.wholeAssetCostBasis)}</li><li>Whole-asset net proceeds: Rs. {money(gain.wholeAssetNetProceeds)}</li><li>Holding days: {gain.holdingDays === null ? "Add both dates" : gain.holdingDays}</li>{gain.valueDifference !== null && <li>Sale vs comparison value difference: Rs. {money(gain.valueDifference)}</li>}{gain.reviewFlags.map((flag) => <li key={flag}>{flag}</li>)}</ul></div>
    {isProperty && <><p className="reconciliation__help" style={{ marginTop: 12 }}>Property funds flow is a separate cross-check. It helps compare purchase uses with generic funding and sale proceeds after loan settlement; it does not establish ownership, valuation, or tax treatment.</p><div className="reconciliation__grid"><Input label="Mortgage/loan drawdown" urdu="قرض کی رقم" value={form.mortgageDrawdown} onChange={(value) => set("mortgageDrawdown", value)} /><Input label="Own funds used" urdu="اپنے استعمال شدہ فنڈز" value={form.ownFundsUsed} onChange={(value) => set("ownFundsUsed", value)} /><Input label="Loan repaid on sale" urdu="فروخت پر واپس کیا قرض" value={form.mortgageOrLoanRepaid} onChange={(value) => set("mortgageOrLoanRepaid", value)} /><Input label="Net funds received (optional)" urdu="خالص وصولی (اختیاری)" value={form.netFundsReceived} onChange={(value) => set("netFundsReceived", value)} /></div><div className="reconciliation__summary"><strong>Property funds flow / جائیداد فنڈز فلو</strong><ul><li>Purchase uses: Rs. {money(flow.purchaseUses)}; available funding: Rs. {money(flow.availableForPurchase)} — <strong>{flow.purchaseStatus}</strong></li><li>Sale net after loan: Rs. {money(flow.saleNetAfterLoan)}{flow.receiptDifference !== null ? `; declared receipt difference: Rs. ${money(flow.receiptDifference)} — ${flow.saleStatus}` : ""}</li></ul></div></>}
    <div className="reconciliation__summary"><strong>Preparation records / تیاری کے ریکارڈ</strong><ul>{checklist.map((item) => <li key={item}>{item}</li>)}</ul><p>Keep source records privately. Do not paste account numbers, CNIC, NTN, IBAN, names, signatures, or document text into this local tool.</p></div>
    <div className="reconciliation__actions"><button type="button" className="secondary" onClick={reset}>Clear local entries</button></div>
  </div>;
}
