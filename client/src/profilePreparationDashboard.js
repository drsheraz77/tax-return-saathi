import { TAX_KNOWLEDGE_FOUNDATION } from "./taxKnowledgeFoundation";

const TOPICS_BY_ID = Object.fromEntries(TAX_KNOWLEDGE_FOUNDATION.topics.map((topic) => [topic.id, topic]));

const ROUTE_TOPIC_IDS = ["iris-access", "return-completion-records", "due-dates"];
const COMPLEX_PATHS = new Set(["business_owner", "property_owner", "investor", "overseas_connection"]);

function cardFromTopic(topicId, reason, reasonUrdu) {
  const topic = TOPICS_BY_ID[topicId];
  return {
    id: topic.id,
    title: topic.title,
    titleUrdu: topic.titleUrdu,
    sourceLabel: topic.sourceLabel,
    sourceUrl: topic.sourceUrl,
    reviewedOn: topic.reviewedOn,
    scope: topic.scope,
    scopeUrdu: topic.scopeUrdu,
    reason,
    reasonUrdu,
  };
}

export const FIRST_TIME_PREPARATION_ROUTE = {
  title: "First-time preparation route",
  titleUrdu: "پہلی بار تیاری کا راستہ",
  boundary: "This public route only organises reviewed education. It does not collect data, open IRIS, create an account, decide a filing route, calculate tax, or confirm an FBR result.",
  boundaryUrdu: "یہ عوامی راستہ صرف جائزہ شدہ تعلیمی مواد ترتیب دیتا ہے۔ یہ ڈیٹا نہیں لیتا، آئرس نہیں کھولتا، اکاؤنٹ نہیں بناتا، فائلنگ کا راستہ یا ٹیکس طے نہیں کرتا اور ایف بی آر کے نتیجے کی تصدیق نہیں کرتا۔",
  cards: [
    cardFromTopic("iris-access", "First, orient yourself using the official IRIS access and first-time filing source.", "پہلے سرکاری آئرس رسائی اور پہلی بار فائلنگ کے ذریعے سے ابتدائی رہنمائی لیں۔"),
    cardFromTopic("return-completion-records", "Then organise a private preparation and record-keeping review.", "پھر نجی تیاری اور ریکارڈ رکھنے کا جائزہ ترتیب دیں۔"),
    cardFromTopic("due-dates", "Finally, check the current published date category directly with FBR.", "آخر میں موجودہ شائع شدہ تاریخ کی قسم براہ راست ایف بی آر سے دیکھیں۔"),
  ],
};

export function buildProfilePreparationDashboard(profile) {
  const paths = Array.isArray(profile?.preparationPaths) ? profile.preparationPaths : [];
  const familiarity = profile?.filingFamiliarity || "not_sure";
  const resourceOrder = profile?.resourceOrder || "guided";
  const taxYearContext = profile?.taxYearContext || "other_or_unsure";
  let topicIds = [...ROUTE_TOPIC_IDS];

  if (resourceOrder === "review_first") topicIds = ["return-completion-records", "due-dates", "iris-access"];
  if (resourceOrder === "source_first") topicIds = ["due-dates", "iris-access", "return-completion-records"];
  if (familiarity === "first_time") topicIds = ["iris-access", "return-completion-records", "due-dates"];
  if (paths.some((path) => COMPLEX_PATHS.has(path)) || taxYearContext === "other_or_unsure") topicIds.push("laws-index");

  const why = [];
  if (familiarity === "first_time") why.push({ text: "Your first-time familiarity setting places IRIS orientation first.", urdu: "آپ کی پہلی بار واقفیت کی ترتیب میں آئرس رہنمائی پہلے رکھی گئی ہے۔" });
  if (resourceOrder === "review_first") why.push({ text: "Your review-first preference places private preparation before official date checking.", urdu: "آپ کی پہلے جائزہ ترجیح نجی تیاری کو سرکاری تاریخ دیکھنے سے پہلے رکھتی ہے۔" });
  if (resourceOrder === "source_first") why.push({ text: "Your official-sources-first preference places the published-date source first.", urdu: "آپ کی پہلے سرکاری ذرائع ترجیح شائع شدہ تاریخ کے ذریعے کو پہلے رکھتی ہے۔" });
  if (paths.some((path) => COMPLEX_PATHS.has(path))) why.push({ text: "A broad complex preparation path adds the official laws index as an escalation starting point.", urdu: "ایک عمومی پیچیدہ تیاری کا راستہ سرکاری قوانین کے انڈیکس کو ابتدائی اضافہ کے طور پر شامل کرتا ہے۔" });
  if (taxYearContext === "other_or_unsure") why.push({ text: "An other-or-unsure tax-year context adds the official laws index; the reviewed catalogue does not determine another year's rules.", urdu: "دوسرے یا غیر واضح ٹیکس سال کے سیاق سے سرکاری قوانین کا انڈیکس شامل ہوتا ہے؛ جائزہ شدہ کیٹلاگ دوسرے سال کے قواعد طے نہیں کرتا۔" });
  if (!why.length) why.push({ text: "Your saved resource-order preference organises existing educational cards only.", urdu: "آپ کی محفوظ شدہ ذریعہ ترتیب کی ترجیح صرف موجودہ تعلیمی کارڈز کو ترتیب دیتی ہے۔" });

  return {
    title: "My preparation route",
    titleUrdu: "میرا تیاری کا راستہ",
    boundary: "These are reviewed educational links organised from your optional preferences. They do not determine tax, filing, a deadline, legal treatment, or an FBR outcome.",
    boundaryUrdu: "یہ آپ کی اختیاری ترجیحات سے ترتیب دیے گئے جائزہ شدہ تعلیمی لنکس ہیں۔ یہ ٹیکس، فائلنگ، ڈیڈ لائن، قانونی ٹریٹمنٹ یا ایف بی آر کا نتیجہ طے نہیں کرتے۔",
    cards: topicIds.map((topicId) => cardFromTopic(topicId, "Shown from your optional preparation preferences; it is not a personal tax recommendation.", "آپ کی اختیاری تیاری ترجیحات سے دکھایا گیا؛ یہ ذاتی ٹیکس سفارش نہیں۔")),
    why,
  };
}
