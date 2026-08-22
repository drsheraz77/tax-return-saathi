export const CHECKLIST_PROTOTYPE_QUESTIONS = [
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
      ["bank_profit", "Bank profit, investments, or dividends"],
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

export function getPrototypeQuestions(answers) {
  return CHECKLIST_PROTOTYPE_QUESTIONS.filter((question) => !question.when || question.when(answers));
}

function item(id, section, title, body, type = "gather") {
  return { id, section, title, body, type };
}

export function getPrototypeChecklist(answers) {
  const categories = answers.incomeCategories || [];
  const items = [
    item("iris", "Before IRIS", "Open IRIS only when your information is ready", "Check the official filing guidance and current FBR notices before entering your return.", "review"),
  ];

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
  if (categories.includes("bank_profit")) {
    items.push(item("bank", "Income records", "Review bank profit, investment, or dividend records", "Gather the relevant statements or certificates and review any tax already deducted."));
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
