export const OFFICIAL_RESOURCE_HUB = {
  reviewedOn: "22 August 2026",
  sections: [
    {
      id: "company",
      title: "Company registration",
      titleUrdu: "کمپنی رجسٹریشن",
      introduction: "Use SECP’s official incorporation resources before relying on private guides or paid intermediaries.",
      introductionUrdu: "نجی گائیڈز یا ادائیگی والے ذرائع پر انحصار کرنے سے پہلے ایس ای سی پی کے سرکاری انکارپوریشن وسائل دیکھیں۔",
      resources: [
        {
          id: "secp-incorporation",
          title: "SECP company incorporation",
          titleUrdu: "ایس ای سی پی کمپنی انکارپوریشن",
          description: "Read the official name-reservation and incorporation guidance, including eZfile resources and the promoters’ guide.",
          descriptionUrdu: "نام محفوظ کرنے اور انکارپوریشن کی سرکاری رہنمائی، ای زیڈ فائل وسائل اور پروموٹرز گائیڈ دیکھیں۔",
          url: "https://www.secp.gov.pk/company-formation/registration-of-company/",
          sourceLabel: "Open SECP incorporation guidance",
        },
        {
          id: "secp-name-search",
          title: "Company name search",
          titleUrdu: "کمپنی نام تلاش",
          description: "Check a proposed company name through SECP’s official online name-search service.",
          descriptionUrdu: "تجویز کردہ کمپنی کا نام ایس ای سی پی کی سرکاری آن لائن نام تلاش سروس کے ذریعے چیک کریں۔",
          url: "https://eservices.secp.gov.pk/eServices/NameSearch.jsp",
          sourceLabel: "Open SECP name search",
        },
        {
          id: "secp-guides",
          title: "SECP guide books",
          titleUrdu: "ایس ای سی پی گائیڈ بکس",
          description: "Use SECP’s official guide-book library for available incorporation and company-formation material.",
          descriptionUrdu: "انکارپوریشن اور کمپنی تشکیل سے متعلق دستیاب مواد کے لیے ایس ای سی پی کی سرکاری گائیڈ بک لائبریری استعمال کریں۔",
          url: "https://www.secp.gov.pk/media-center/guide-books/general-guide-books/",
          sourceLabel: "Open SECP guide books",
        },
      ],
    },
    {
      id: "filing",
      title: "Income-tax return preparation",
      titleUrdu: "انکم ٹیکس ریٹرن کی تیاری",
      introduction: "This preparation support does not complete a return for you. Use the official FBR service for registration, IRIS access, and submission.",
      introductionUrdu: "یہ تیاری معاونت آپ کی طرف سے ریٹرن مکمل نہیں کرتی۔ رجسٹریشن، آئرس رسائی اور جمع کرانے کے لیے ایف بی آر کی سرکاری سروس استعمال کریں۔",
      resources: [
        {
          id: "fbr-registration",
          title: "Register for income tax",
          titleUrdu: "انکم ٹیکس کے لیے رجسٹریشن",
          description: "Review FBR’s official registration requirements before starting e-enrollment, including the separate information listed for companies and AOPs.",
          descriptionUrdu: "ای انرولمنٹ شروع کرنے سے پہلے ایف بی آر کی سرکاری رجسٹریشن ضروریات دیکھیں، جن میں کمپنیوں اور اے او پیز کے لیے الگ درج معلومات شامل ہیں۔",
          url: "https://www.fbr.gov.pk/categ/register-income-tax/51147/30846/%2071149",
          sourceLabel: "Open FBR registration guidance",
        },
        {
          id: "fbr-iris",
          title: "FBR IRIS portal",
          titleUrdu: "ایف بی آر آئرس پورٹل",
          description: "Open FBR’s official IRIS service to access the online income-tax return workflow.",
          descriptionUrdu: "آن لائن انکم ٹیکس ریٹرن ورک فلو تک رسائی کے لیے ایف بی آر کی سرکاری آئرس سروس کھولیں۔",
          url: "https://iris.fbr.gov.pk/",
          sourceLabel: "Open FBR IRIS",
        },
        {
          id: "fbr-filing-help",
          title: "FBR filing help",
          titleUrdu: "ایف بی آر فائلنگ مدد",
          description: "Use FBR’s filing-help topics for IRIS login, password recovery, return completion, late filing, record keeping, and privacy information.",
          descriptionUrdu: "آئرس لاگ اِن، پاس ورڈ بازیافت، ریٹرن مکمل کرنے، دیر سے فائلنگ، ریکارڈ رکھنے اور رازداری کی معلومات کے لیے ایف بی آر کے فائلنگ مدد موضوعات استعمال کریں۔",
          url: "https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71159",
          sourceLabel: "Open FBR filing help",
        },
      ],
    },
  ],
};

const OFFICIAL_HOSTS = new Set([
  "www.secp.gov.pk",
  "eservices.secp.gov.pk",
  "www.fbr.gov.pk",
  "iris.fbr.gov.pk",
]);

export function validateOfficialResourceHub(hub = OFFICIAL_RESOURCE_HUB) {
  return hub.sections.every((section) =>
    section.id &&
    section.title &&
    section.titleUrdu &&
    section.resources.length > 0 &&
    section.resources.every((resource) => {
      try {
        return resource.id &&
          resource.title &&
          resource.titleUrdu &&
          resource.description &&
          resource.descriptionUrdu &&
          resource.sourceLabel &&
          OFFICIAL_HOSTS.has(new URL(resource.url).hostname);
      } catch {
        return false;
      }
    }),
  );
}
