import { getWealthReadinessPrintRows } from "./wealthStatementPreparation.js";

export const PRE_FILING_TIMELINE_STEPS = [
  {
    id: "gather",
    label: "Gather only the records you need to review",
    urdu: "صرف وہ ریکارڈ جمع کریں جنہیں آپ نے جانچنا ہے",
    boundary: "Do not add amounts, account numbers, CNICs, passwords, or documents here.",
  },
  {
    id: "reconcile",
    label: "Reconcile your own records before opening IRIS",
    urdu: "IRIS کھولنے سے پہلے اپنے ریکارڈ کا باہمی جائزہ لیں",
    boundary: "This is a preparation reminder, not a reconciliation calculation or filing decision.",
  },
  {
    id: "review",
    label: "Review a safely redacted completed return",
    urdu: "محفوظ طور پر چھپائے گئے مکمل ریٹرن کا جائزہ لیں",
    boundary: "The review can flag visible questions only; it cannot reproduce FBR checks.",
  },
  {
    id: "verify",
    label: "Verify current requirements and figures on IRIS or official FBR sources",
    urdu: "IRIS یا سرکاری ایف بی آر ذرائع پر موجودہ تقاضوں اور اعداد کی تصدیق کریں",
    boundary: "Confirm dates, eligibility, figures, and any notice requirement directly with FBR or a qualified adviser.",
  },
  {
    id: "submit",
    label: "Submit only through the official IRIS portal when you are ready",
    urdu: "تیار ہونے پر صرف سرکاری IRIS پورٹل کے ذریعے جمع کریں",
    boundary: "Tax Return Saathi cannot submit a return or confirm it is ready to file.",
  },
];

export const TIMELINE_STATUS_OPTIONS = [
  { id: "not_started", label: "Not started", urdu: "شروع نہیں کیا" },
  { id: "in_progress", label: "In progress", urdu: "جاری ہے" },
  { id: "ready_to_verify", label: "Ready to verify", urdu: "تصدیق کے لیے تیار" },
];

export function getPreFilingTimelineSummary(statusByStep = {}) {
  const counts = { notStarted: 0, inProgress: 0, readyToVerify: 0, unmarked: 0 };
  PRE_FILING_TIMELINE_STEPS.forEach(({ id }) => {
    if (statusByStep[id] === "not_started") counts.notStarted += 1;
    else if (statusByStep[id] === "in_progress") counts.inProgress += 1;
    else if (statusByStep[id] === "ready_to_verify") counts.readyToVerify += 1;
    else counts.unmarked += 1;
  });
  return counts;
}

export function buildNonSensitiveReadinessSummary({ timelineStatus = {}, wealthReadiness = {} } = {}) {
  const timelineRows = PRE_FILING_TIMELINE_STEPS.map((step) => {
    const status = TIMELINE_STATUS_OPTIONS.find((option) => option.id === timelineStatus[step.id]);
    return `${step.label}: ${status?.label || "Not marked"}`;
  });
  const wealthRows = getWealthReadinessPrintRows(wealthReadiness).map((row) => `${row.label}: ${row.status}`);

  return [
    "Tax Return Saathi — preparation-only readiness summary",
    "Generated locally in your browser. This summary contains no tax amounts, identity details, document contents, account details, or credentials.",
    "It is not a tax return, wealth statement, filing confirmation, or FBR decision.",
    "",
    "Pre-filing timeline",
    ...timelineRows,
    "",
    "Wealth-statement preparation readiness",
    ...wealthRows,
    "",
    "Before acting, verify current requirements, figures, dates, and eligibility on IRIS or official FBR sources. Use a qualified adviser for unresolved matters.",
  ].join("\n");
}
