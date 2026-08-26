export const CHECKLIST_PROTOTYPE_QUESTIONS = [
  {
    id: "taxYearScope",
    kind: "single",
    title: "Which tax-year scope do you need help preparing for?",
    urdu: "آپ کو کس ٹیکس سال کے لیے تیاری میں مدد چاہیے؟",
    hint: "This checklist is designed as a Tax Year 2026 preparation aid. It does not decide rules, rates, deadlines, or filing treatment for another year.",
    options: [
      ["ty_2026", "Tax Year 2026 preparation"],
      ["other_or_unsure", "Another tax year or I am not sure"],
    ],
  },
  {
    id: "filingExperience",
    kind: "single",
    title: "Have you filed an FBR income-tax return before?",
    urdu: "کیا آپ نے پہلے ایف بی آر انکم ٹیکس ریٹرن فائل کی ہے؟",
    hint: "This only tailors preparation steps. It does not decide whether you must file.",
    options: [
      ["first_time", "This is my first return"],
      ["filed_before", "Yes, I have filed before"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "incomeCategories",
    kind: "multiple",
    title: "Which records might apply to you this Tax Year?",
    urdu: "اس ٹیکس سال میں آپ سے کون سے ریکارڈ متعلق ہو سکتے ہیں؟",
    hint: "Select all that may apply. Do not enter amounts, account numbers, CNIC, or passwords.",
    options: [
      ["salary", "Salary or pension"],
      ["business", "Business or shop"],
      ["property", "Property rent or sale"],
      ["bank_profit", "Bank profit or dividends"],
      ["investments", "Fixed-term accounts, stocks, ETFs, or bonds"],
      ["freelancer", "Freelance work or independent client services"],
      ["other", "Other income or I am unsure"],
    ],
  },
  {
    id: "businessRecords",
    kind: "single",
    title: "Are your business records ready to review?",
    urdu: "کیا آپ کے کاروباری ریکارڈ جائزے کے لیے تیار ہیں؟",
    hint: "This question appears only if you selected business or shop.",
    when: (answers) => answers.incomeCategories?.includes("business"),
    options: [
      ["ready", "Yes, they are ready"],
      ["partly", "Partly ready"],
      ["not_ready", "Not ready yet"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "propertyRecords",
    kind: "single",
    title: "Do you have your property-related records ready to review?",
    urdu: "کیا آپ کے جائیداد سے متعلق ریکارڈ جائزے کے لیے تیار ہیں؟",
    hint: "This question appears only if you selected property rent or sale.",
    when: (answers) => answers.incomeCategories?.includes("property"),
    options: [
      ["ready", "Yes, they are ready"],
      ["partly", "Partly ready"],
      ["not_ready", "Not ready yet"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "freelancerRecords",
    kind: "single",
    title: "Are your freelance work and client-payment records ready to review?",
    urdu: "کیا آپ کے فری لانس کام اور کلائنٹ ادائیگی کے ریکارڈ جائزے کے لیے تیار ہیں؟",
    hint: "This preparation-only question appears only if you selected freelance work or independent client services.",
    when: (answers) => answers.incomeCategories?.includes("freelancer"),
    options: [
      ["ready", "Yes, they are ready"],
      ["partly", "Partly ready"],
      ["not_ready", "Not ready yet"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "investmentRecords",
    kind: "single",
    title: "Are your investment account and transaction records ready to review?",
    urdu: "کیا آپ کے سرمایہ کاری اکاؤنٹ اور لین دین کے ریکارڈ جائزے کے لیے تیار ہیں؟",
    hint: "This preparation-only question appears only if you selected fixed-term accounts, stocks, ETFs, or bonds.",
    when: (answers) => answers.incomeCategories?.includes("investments"),
    options: [
      ["ready", "Yes, they are ready"],
      ["partly", "Partly ready"],
      ["not_ready", "Not ready yet"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "withholding",
    kind: "single",
    title: "Was any tax deducted from payments or income you received?",
    urdu: "کیا آپ کو ملنے والی ادائیگی یا آمدن سے کوئی ٹیکس کٹا تھا؟",
    hint: "For example, tax deducted by an employer, bank, client, or other payer.",
    options: [
      ["yes", "Yes"],
      ["no", "No"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "foreignConnection",
    kind: "single",
    title: "Do you have foreign income, overseas assets, or a tax-residence question?",
    urdu: "کیا آپ کی کوئی غیر ملکی آمدن، بیرونِ ملک اثاثہ، یا ٹیکس رہائش سے متعلق سوال ہے؟",
    hint: "This prototype does not assess foreign-tax or tax-residence treatment.",
    options: [
      ["yes", "Yes"],
      ["no", "No"],
      ["not_sure", "I am not sure"],
    ],
  },
  {
    id: "recordsReadiness",
    kind: "single",
    title: "How ready are your supporting records?",
    urdu: "آپ کے معاون ریکارڈ کتنے تیار ہیں؟",
    hint: "Use this to highlight preparation steps, not to assess compliance.",
    options: [
      ["all_ready", "I have them ready"],
      ["some_missing", "Some are missing"],
      ["not_started", "I have not started"],
      ["not_sure", "I am not sure"],
    ],
  },
];

export const PROTOTYPE_DRAFT_STORAGE_KEY = "tax-return-saathi:filing-checklist-draft:v1";
export const PROTOTYPE_DRAFT_VERSION = 1;

export const FBR_CHECKLIST_SOURCES = [
  {
    id: "fbr-iris",
    title: "FBR IRIS",
    titleUrdu: "ایف بی آر آئرس",
    purpose: "Use the official portal for filing only after you have checked your records.",
    purposeUrdu: "ریکارڈ چیک کرنے کے بعد ہی سرکاری پورٹل پر فائلنگ کریں۔",
    url: "https://iris.fbr.gov.pk/",
  },
  {
    id: "fbr-filing-guide",
    title: "FBR filing guidance",
    titleUrdu: "ایف بی آر فائلنگ رہنمائی",
    purpose: "Verify filing steps, record-keeping, revision, and related official guidance.",
    purposeUrdu: "فائلنگ کے مراحل، ریکارڈ رکھنے، نظرِ ثانی اور متعلقہ سرکاری رہنمائی کی تصدیق کریں۔",
    url: "https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158",
  },
  {
    id: "fbr-laws-index",
    title: "FBR Acts, Ordinances and Rules",
    titleUrdu: "ایف بی آر قوانین، آرڈیننس اور قواعد",
    purpose: "Use this official index to verify legal material when a matter is uncertain or complex.",
    purposeUrdu: "غیر واضح یا پیچیدہ معاملے میں قانونی مواد کی تصدیق کے لیے یہ سرکاری فہرست استعمال کریں۔",
    url: "https://www.fbr.gov.pk/act-rules-ordinances/131226",
  },
];

const VALID_ANSWER_VALUES = Object.fromEntries(
  CHECKLIST_PROTOTYPE_QUESTIONS.map((question) => [question.id, new Set(question.options.map(([value]) => value))]),
);
const VALID_ITEM_STATUSES = new Set(["Have it", "Need to find", "Not sure"]);

function sanitiseAnswers(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};
  return Object.fromEntries(Object.entries(candidate).flatMap(([questionId, value]) => {
    const allowed = VALID_ANSWER_VALUES[questionId];
    if (!allowed) return [];
    if (questionId === "incomeCategories") {
      if (!Array.isArray(value)) return [];
      const values = [...new Set(value.filter((item) => typeof item === "string" && allowed.has(item)))];
      return values.length ? [[questionId, values]] : [];
    }
    return typeof value === "string" && allowed.has(value) ? [[questionId, value]] : [];
  }));
}

function sanitiseItemStatus(candidate, answers) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};
  const permittedIds = new Set(getPrototypeChecklist(answers).map((item) => item.id));
  return Object.fromEntries(Object.entries(candidate).filter(([itemId, status]) => permittedIds.has(itemId) && VALID_ITEM_STATUSES.has(status)));
}

export function createPrototypeDraft({ answers, itemStatus, step, showResults }, savedAt = Date.now()) {
  const safeAnswers = sanitiseAnswers(answers);
  return {
    version: PROTOTYPE_DRAFT_VERSION,
    savedAt: Number.isFinite(savedAt) ? savedAt : Date.now(),
    answers: safeAnswers,
    itemStatus: sanitiseItemStatus(itemStatus, safeAnswers),
    step: Number.isInteger(step) && step >= 0 ? step : 0,
    showResults: Boolean(showResults),
  };
}

export function serialisePrototypeDraft(draft, savedAt) {
  return JSON.stringify(createPrototypeDraft(draft, savedAt));
}

export function parsePrototypeDraft(serialised) {
  try {
    const candidate = JSON.parse(serialised);
    if (!candidate || candidate.version !== PROTOTYPE_DRAFT_VERSION || !Number.isFinite(candidate.savedAt)) return null;
    return createPrototypeDraft(candidate, candidate.savedAt);
  } catch {
    return null;
  }
}

export function loadPrototypeDraft(storage) {
  return parsePrototypeDraft(storage?.getItem(PROTOTYPE_DRAFT_STORAGE_KEY));
}

export function savePrototypeDraft(storage, draft, savedAt) {
  const serialised = serialisePrototypeDraft(draft, savedAt);
  storage?.setItem(PROTOTYPE_DRAFT_STORAGE_KEY, serialised);
  return parsePrototypeDraft(serialised);
}

export function removePrototypeDraft(storage) {
  storage?.removeItem(PROTOTYPE_DRAFT_STORAGE_KEY);
}

export function formatPrototypeDraftSavedAt(savedAt, locale, timeZone) {
  const date = new Date(savedAt);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "medium",
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

export function getPrototypeDraftSavedAtIso(savedAt) {
  const date = new Date(savedAt);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

export function getPrototypeQuestions(answers) {
  return CHECKLIST_PROTOTYPE_QUESTIONS.filter((question) => !question.when || question.when(answers));
}

export function getPrototypeSources() {
  return FBR_CHECKLIST_SOURCES;
}

function item(id, section, title, body, type = "gather") {
  return { id, section, title, body, type };
}

export function getPrototypeChecklist(answers) {
  const categories = answers.incomeCategories || [];
  const items = [
    item("iris", "Before IRIS", "Open IRIS only when your information is ready", "Check the official filing guidance and current FBR notices before entering your return.", "review"),
  ];

  if (answers.taxYearScope !== "ty_2026") {
    items.unshift(item("tax-year-scope", "Before IRIS", "Confirm the correct tax-year scope", "This is a Tax Year 2026 preparation checklist. Do not use it to determine rules, rates, deadlines, or filing treatment for another or uncertain year. Verify the applicable year through official FBR guidance.", "seek_advice"));
  }

  if (answers.filingExperience === "first_time" || answers.filingExperience === "not_sure") {
    items.push(item("access", "Before IRIS", "Review your IRIS access", "Confirm that you can use the official IRIS portal before you begin entering information.", "review"));
  }
  if (categories.includes("salary")) {
    items.push(item("salary", "Income records", "Gather salary or pension records", "Keep the relevant salary, pension, and tax-deduction records available for review."));
  }
  if (categories.includes("business")) {
    items.push(item("business", "Income records", "Organise business records", "Prepare a clear review set of sales, expenses, and supporting business records."));
    if (["partly", "not_ready", "not_sure"].includes(answers.businessRecords)) {
      items.push(item("business-ready", "Income records", "Finish your business-record review", "Mark missing records before you rely on the checklist output.", "review"));
    }
  }
  if (categories.includes("property")) {
    items.push(item("property", "Income records", "Gather property-related records", "Prepare the relevant property-rent or sale records and supporting documents for review."));
    if (["partly", "not_ready", "not_sure"].includes(answers.propertyRecords)) {
      items.push(item("property-ready", "Income records", "Finish your property-record review", "Identify any missing property-related records before filing.", "review"));
    }
  }
  if (categories.includes("freelancer")) {
    items.push(item("freelancer", "Income records", "Organise freelance work and client-payment records", "Prepare a review set of client invoices, agreements or work evidence, relevant platform statements, and payment records. This checklist does not determine tax treatment."));
    if (["partly", "not_ready", "not_sure"].includes(answers.freelancerRecords)) {
      items.push(item("freelancer-ready", "Income records", "Finish your freelance-record review", "Identify missing client-work or payment records before you rely on the checklist output.", "review"));
    }
  }
  if (categories.includes("bank_profit")) {
    items.push(item("bank", "Income records", "Review bank profit, investment, or dividend records", "Gather the relevant statements or certificates and review any tax already deducted."));
  }
  if (categories.includes("investments")) {
    items.push(item("investments", "Investment records", "Organise investment-account and transaction records", "Prepare review copies of account or custody statements, purchase or sale confirmations, income or payment records, and any related deduction certificates. Use the Tax & investment resources panel for neutral record-learning links. This checklist does not determine tax treatment."));
    if (["partly", "not_ready", "not_sure"].includes(answers.investmentRecords)) {
      items.push(item("investments-ready", "Investment records", "Finish your investment-record review", "Identify missing investment account or transaction records before you rely on the checklist output.", "review"));
    }
  }
  if (answers.withholding === "yes" || answers.withholding === "not_sure") {
    items.push(item("withholding", "Tax deducted and records", "Reconcile tax deducted at source", "Review the records provided by the payer, employer, bank, or client before filing.", "review"));
  }
  if (answers.foreignConnection === "yes" || answers.foreignConnection === "not_sure") {
    items.push(item("foreign", "Special situations", "Get specialist or official guidance for foreign matters", "Do not rely on this prototype to decide foreign-income, overseas-asset, or tax-residence treatment.", "seek_advice"));
  }
  if (["some_missing", "not_started", "not_sure"].includes(answers.recordsReadiness)) {
    items.push(item("records", "Before you submit", "Resolve missing supporting records", "Pause and identify missing evidence before relying on any return information.", "review"));
  }
  if (categories.includes("other") || Object.values(answers).some((value) => value === "not_sure")) {
    items.push(item("uncertainty", "Before you submit", "Confirm uncertain items", "Use the official FBR guidance or a qualified adviser for facts you cannot confidently classify.", "seek_advice"));
  }
  return items;
}
