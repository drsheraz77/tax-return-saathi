export const TAX_YEAR_2026_UPDATE = {
  reviewedOn: "21 August 2026",
  filingOpened: "27 July 2026",
  period: "1 July 2025 to 30 June 2026",
  individualAndAopDueDate: "30 September 2026",
  companyDueDate: "31 December 2026",
  specialTaxYearCompanyDueDate: "30 September 2026",
  irisUrl: "https://iris.fbr.gov.pk/public/txplogin.xhtml",
};

export const TAX_YEAR_2026_SOURCES = {
  fbrSocialAnnouncement:
    "https://www.facebook.com/Fbrspokesperson/posts/income-tax-return-filing-for-tax-year-2026-will-open-from-monday-27-july-2026-al/1476295791203360/",
  fbrDueDates:
    "https://www.fbr.gov.pk/categ/income-tax-due-dates/51147/40846/81148",
  fbrFilingGuidance:
    "https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158",
  newspaperCoverage:
    "https://dunyanews.tv/en/Business/964849-fbr-begins-receiving-annual-income-tax-returns-for-tax-year-2026",
};

export const OFFICIAL_SOURCE_UPDATE_CENTRE = {
  reviewedOn: "26 August 2026",
  status: "reviewed-not-live",
  title: "Reviewed official-source update centre",
  titleUrdu: "جائزہ شدہ سرکاری ذرائع اپڈیٹ سینٹر",
  limitation: "This is a limited, manually reviewed guide, not a live FBR feed, automatic update checker, complete legal/SRO database, or personal deadline service. Open FBR directly to check current notices and changes.",
  limitationUrdu: "یہ محدود، دستی طور پر جائزہ شدہ گائیڈ ہے، لائیو ایف بی آر فیڈ، خودکار اپڈیٹ چیکر، مکمل قانونی/ایس آر او ڈیٹا بیس یا ذاتی ڈیڈ لائن سروس نہیں۔ موجودہ نوٹس اور تبدیلیاں دیکھنے کے لیے براہِ راست ایف بی آر کھولیں۔",
  currentFbrUpdatesUrl: "https://www.fbr.gov.pk/",
  sources: [
    {
      id: "filing-workflow",
      title: "Filing workflow and IRIS access",
      titleUrdu: "فائلنگ ورک فلو اور آئرس رسائی",
      purpose: "Use FBR’s filing guidance as a current official starting point for IRIS access, return preparation, completion, and record keeping.",
      purposeUrdu: "آئرس رسائی، ریٹرن تیاری، تکمیل اور ریکارڈ رکھنے کے لیے ایف بی آر فائلنگ رہنمائی کو موجودہ سرکاری ابتدائی نقطہ کے طور پر استعمال کریں۔",
      sourceUrl: "https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158",
      sourceLabel: "Open FBR filing guidance",
    },
    {
      id: "due-dates",
      title: "Published income-tax due-date information",
      titleUrdu: "شائع شدہ انکم ٹیکس تاریخوں کی معلومات",
      purpose: "Check FBR’s due-date page directly for its current published categories; it is not an individual deadline calculation or extension confirmation.",
      purposeUrdu: "موجودہ شائع شدہ زمروں کے لیے ایف بی آر کی تاریخوں کا صفحہ براہِ راست دیکھیں؛ یہ انفرادی ڈیڈ لائن کا حساب یا توسیع کی تصدیق نہیں۔",
      sourceUrl: "https://www.fbr.gov.pk/categ/income-tax-due-dates/51147/40846/81148",
      sourceLabel: "Open FBR due dates",
    },
    {
      id: "notices-and-announcements",
      title: "Current notices and announcements",
      titleUrdu: "موجودہ نوٹس اور اعلانات",
      purpose: "Open FBR directly for current official notices and announcements. The dated archive in this app is context only and is not a complete notice service.",
      purposeUrdu: "موجودہ سرکاری نوٹس اور اعلانات کے لیے براہِ راست ایف بی آر کھولیں۔ اس ایپ میں تاریخ وار آرکائیو صرف سیاق و سباق کے لیے ہے، مکمل نوٹس سروس نہیں۔",
      sourceUrl: "https://www.fbr.gov.pk/",
      sourceLabel: "Open FBR current website",
    },
    {
      id: "laws-and-rules-index",
      title: "Acts, rules, and ordinances index",
      titleUrdu: "ایکٹس، رولز اور آرڈیننس انڈیکس",
      purpose: "Use FBR’s index to locate the current official Acts, Rules, and Ordinances materials rather than treating this app as a legal database.",
      purposeUrdu: "اس ایپ کو قانونی ڈیٹا بیس سمجھنے کے بجائے موجودہ سرکاری ایکٹس، رولز اور آرڈیننس مواد تلاش کرنے کے لیے ایف بی آر کا انڈیکس استعمال کریں۔",
      sourceUrl: "https://www.fbr.gov.pk/act-rules-ordinances/131226",
      sourceLabel: "Open FBR laws index",
    },
  ],
};

export function validateOfficialSourceUpdateCentre(centre = OFFICIAL_SOURCE_UPDATE_CENTRE) {
  return centre.reviewedOn &&
    centre.status === "reviewed-not-live" &&
    centre.title &&
    centre.titleUrdu &&
    centre.limitation &&
    centre.limitationUrdu &&
    new URL(centre.currentFbrUpdatesUrl).hostname === "www.fbr.gov.pk" &&
    centre.sources.length === 4 &&
    centre.sources.every((source) => {
      try {
        return source.id && source.title && source.titleUrdu && source.purpose && source.purposeUrdu && source.sourceLabel && new URL(source.sourceUrl).hostname === "www.fbr.gov.pk";
      } catch {
        return false;
      }
    });
}
