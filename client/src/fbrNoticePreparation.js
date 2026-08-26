export const FBR_NOTICE_PREPARATION_TYPES = [
  { value: "unsure", label: "I am not sure of the notice type", labelUrdu: "نوٹس کی قسم معلوم نہیں" },
  { value: "return-or-records", label: "Return, record, or information request", labelUrdu: "ریٹرن، ریکارڈ یا معلومات کی درخواست" },
  { value: "registration-or-iris", label: "Registration or IRIS access issue", labelUrdu: "رجسٹریشن یا آئرس رسائی کا مسئلہ" },
  { value: "wealth-or-reconciliation", label: "Wealth, reconciliation, or supporting-record question", labelUrdu: "ویلتھ، مصالحت یا معاون ریکارڈ کا سوال" },
  { value: "other", label: "Other notice or communication", labelUrdu: "دوسرا نوٹس یا پیغام" },
];

const BASE_NOTICE_STEPS = [
  {
    id: "read-official-copy",
    label: "Read your own official notice carefully and identify its reference, channel, and document request. Do not enter those details here.",
    labelUrdu: "اپنا سرکاری نوٹس غور سے پڑھیں اور اس کا حوالہ، چینل اور دستاویز کی درخواست شناخت کریں۔ یہ تفصیلات یہاں درج نہ کریں۔",
  },
  {
    id: "verify-current-route",
    label: "Verify the current response route and any deadline directly on the notice, IRIS, or official FBR support—not through this guide.",
    labelUrdu: "جواب کا موجودہ راستہ اور کوئی بھی ڈیڈ لائن براہِ راست نوٹس، آئرس یا ایف بی آر سپورٹ سے تصدیق کریں—اس گائیڈ سے نہیں۔",
  },
  {
    id: "prepare-support",
    label: "Prepare only the supporting records requested or relevant to the issue; retain originals and use secure official channels.",
    labelUrdu: "صرف مطلوبہ یا مسئلے سے متعلق معاون ریکارڈ تیار کریں؛ اصل ریکارڈ محفوظ رکھیں اور محفوظ سرکاری چینلز استعمال کریں۔",
  },
  {
    id: "escalate-uncertainty",
    label: "If the meaning, response, or deadline is unclear, use FBR support or a qualified tax professional before replying.",
    labelUrdu: "اگر مطلب، جواب یا ڈیڈ لائن واضح نہیں تو جواب دینے سے پہلے ایف بی آر سپورٹ یا اہل ٹیکس پروفیشنل سے رجوع کریں۔",
  },
];

const TYPE_PROMPTS = {
  "return-or-records": {
    id: "records-boundary",
    label: "Use the notice wording to focus your preparation; this tool does not decide which entries are correct or complete.",
    labelUrdu: "تیاری کو نوٹس کے الفاظ تک محدود رکھیں؛ یہ ٹول طے نہیں کرتا کہ کون سی انٹری درست یا مکمل ہے۔",
  },
  "registration-or-iris": {
    id: "iris-boundary",
    label: "Use the official IRIS help route for access issues. Never share passwords, OTPs, or account credentials with this tool.",
    labelUrdu: "رسائی کے مسائل کے لیے سرکاری آئرس مدد کا راستہ استعمال کریں۔ اس ٹول کے ساتھ پاس ورڈ، او ٹی پی یا اکاؤنٹ کی اسناد کبھی شیئر نہ کریں۔",
  },
  "wealth-or-reconciliation": {
    id: "reconciliation-boundary",
    label: "Gather categories of support privately. This tool does not calculate, reconcile, or validate any wealth statement.",
    labelUrdu: "ثبوت کی اقسام نجی طور پر جمع کریں۔ یہ ٹول کسی ویلتھ اسٹیٹمنٹ کا حساب، مصالحت یا توثیق نہیں کرتا۔",
  },
  other: {
    id: "other-boundary",
    label: "Keep the preparation general and confirm the applicable official route before acting on an unfamiliar communication.",
    labelUrdu: "تیاری عمومی رکھیں اور نامانوس پیغام پر عمل سے پہلے قابلِ اطلاق سرکاری راستے کی تصدیق کریں۔",
  },
  unsure: {
    id: "unsure-boundary",
    label: "Do not guess the notice type. Use official FBR support or a qualified adviser to identify the correct route.",
    labelUrdu: "نوٹس کی قسم کا اندازہ نہ لگائیں۔ درست راستے کی شناخت کے لیے ایف بی آر سپورٹ یا اہل مشیر استعمال کریں۔",
  },
};

export function getNoticePreparationSteps(type = "unsure") {
  return [...BASE_NOTICE_STEPS, TYPE_PROMPTS[type] || TYPE_PROMPTS.unsure];
}

export const FBR_NOTICE_SUPPORT_URL = "https://www.fbr.gov.pk/contact-us/142252/173964";
