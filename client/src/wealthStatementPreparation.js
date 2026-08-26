export const WEALTH_STATEMENT_PREPARATION_STEPS = [
  {
    id: "opening-position",
    label: "Locate the prior-year reference or other opening-position support you may need to review.",
    labelUrdu: "گزشتہ سال کے حوالہ یا ابتدائی پوزیشن کے ایسے ثبوت تلاش کریں جن کا جائزہ درکار ہو سکتا ہے۔",
  },
  {
    id: "movement-records",
    label: "Group supporting records for changes during the year, without entering figures into this tool.",
    labelUrdu: "سال کے دوران تبدیلیوں کے معاون ریکارڈ گروپ کریں، مگر اس ٹول میں اعداد درج نہ کریں۔",
  },
  {
    id: "assets-liabilities-support",
    label: "Check whether you can locate support for relevant asset, liability, account, investment, or property categories.",
    labelUrdu: "دیکھیں کہ متعلقہ اثاثہ، ذمہ داری، اکاؤنٹ، سرمایہ کاری یا جائیداد کی اقسام کے ثبوت دستیاب ہیں یا نہیں۔",
  },
  {
    id: "unexplained-changes",
    label: "Flag changes or classifications you cannot explain from your records for official verification or qualified advice.",
    labelUrdu: "ایسی تبدیلیوں یا درجہ بندیوں کو نشان زد کریں جن کی وضاحت ریکارڈ سے نہ ہو سکے، تاکہ سرکاری تصدیق یا اہل مشورہ لیا جا سکے۔",
  },
];

export const WEALTH_READINESS_OPTIONS = [
  { value: "", label: "Choose a temporary status", labelUrdu: "عارضی اسٹیٹس منتخب کریں" },
  { value: "ready", label: "I can locate support", labelUrdu: "ثبوت دستیاب ہے" },
  { value: "needs-review", label: "I need to review records", labelUrdu: "ریکارڈ دیکھنا ہے" },
  { value: "not-sure", label: "I am not sure", labelUrdu: "مجھے یقین نہیں" },
];

export function getWealthStatementReadinessSummary(choices = {}) {
  const selected = Object.values(choices).filter(Boolean);
  const ready = selected.filter((choice) => choice === "ready").length;
  const needsReview = selected.filter((choice) => choice === "needs-review").length;
  const notSure = selected.filter((choice) => choice === "not-sure").length;
  return {
    total: WEALTH_STATEMENT_PREPARATION_STEPS.length,
    selected: selected.length,
    ready,
    needsReview,
    notSure,
  };
}

export function getWealthReadinessPrintRows(choices = {}) {
  const labels = Object.fromEntries(WEALTH_READINESS_OPTIONS.map((option) => [option.value, option]));
  return WEALTH_STATEMENT_PREPARATION_STEPS.map((step) => {
    const option = labels[choices[step.id]] || labels[""];
    return {
      id: step.id,
      label: step.label,
      labelUrdu: step.labelUrdu,
      status: option.label,
      statusUrdu: option.labelUrdu,
    };
  });
}
