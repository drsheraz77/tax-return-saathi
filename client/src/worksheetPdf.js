import { PDFDocument } from "pdf-lib";

const PAGE = { width: 1240, height: 1754, margin: 84 };
const COLORS = { green: "#0B3D2E", green2: "#155E43", gold: "#C9A227", paper: "#F6F4EC", ink: "#1D2321", muted: "#6B706D", pale: "#FBF6E3" };
const URDU_FONT = "Noto Naskh Urdu";
let urduFontsPromise;

const SECTION_LABELS = {
  salary: ["Salary", "تنخواہ"],
  withholding: ["Withholding / tax deducted", "ٹیکس کٹوتی / ودہولڈنگ"],
  otherIncome: ["Other income", "دیگر آمدن"],
  deductions: ["Deductions", "کٹوتیاں"],
  investmentsAndAssets: ["Investments and assets", "سرمایہ کاری اور اثاثے"],
  propertyTransactions: ["Property transactions", "جائیداد کے لین دین"],
  bankBalances: ["Bank balances", "بینک بیلنس"],
};
const AMOUNT_KEYS = { salary: "grossSalary", withholding: "amount", otherIncome: "amount", deductions: "amount", investmentsAndAssets: "statedValue", propertyTransactions: "statedAmount", bankBalances: "closingBalance" };

export async function ensureUrduFonts() {
  if (urduFontsPromise) return urduFontsPromise;
  urduFontsPromise = (async () => {
    if (typeof document === "undefined" || typeof FontFace === "undefined") return false;
    try {
      const regular = new FontFace(URDU_FONT, "url(/fonts/NotoNaskhArabic-Regular.ttf)");
      const bold = new FontFace(`${URDU_FONT} Bold`, "url(/fonts/NotoSansArabic-Bold.ttf)");
      const loaded = await Promise.all([regular.load(), bold.load()]);
      loaded.forEach((font) => document.fonts.add(font));
      return true;
    } catch {
      return false;
    }
  })();
  return urduFontsPromise;
}

function money(value) {
  return Number(value) ? new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(Number(value)) : "—";
}

function valueLabel(item) {
  return item.employerLabel || item.category || item.description || item.accountLabel || "Entry";
}

function worksheetRows(result) {
  const rows = [];
  Object.keys(SECTION_LABELS).forEach((section) => {
    (result?.worksheet?.[section] || []).forEach((item) => rows.push({ section, item, amount: item[AMOUNT_KEYS[section]], label: valueLabel(item) }));
  });
  return rows;
}

function entryDateValue(item, fallbackTaxYear) {
  const candidate = item?.transactionDate || item?.date || item?.paymentDate || item?.periodEnd || item?.periodStart || item?.taxYear || fallbackTaxYear;
  if (!candidate) return null;
  const yearMatch = String(candidate).match(/(?:^|[^0-9])(20\d{2})(?:$|[^0-9])/);
  if (yearMatch && !String(candidate).includes("-")) return `${yearMatch[1]}-01-01`;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function filterWorksheetByDateRange(result, fromDate = "", toDate = "") {
  if (!fromDate && !toDate) return result;
  const worksheet = result?.worksheet || {};
  const filtered = { ...result, worksheet: { ...worksheet } };
  Object.keys(SECTION_LABELS).forEach((section) => {
    filtered.worksheet[section] = (worksheet[section] || []).filter((item) => {
      const value = entryDateValue(item, worksheet.taxYear);
      if (!value) return true;
      return (!fromDate || value >= fromDate) && (!toDate || value <= toDate);
    });
  });
  return filtered;
}

export function countWorksheetEntries(result) {
  return Object.keys(SECTION_LABELS).reduce((count, section) => count + (result?.worksheet?.[section] || []).length, 0);
}

export function categoryTotals(result) {
  return Object.keys(SECTION_LABELS).reduce((totals, section) => {
    totals[section] = (result?.worksheet?.[section] || []).reduce((sum, item) => sum + (Number(item[AMOUNT_KEYS[section]]) || 0), 0);
    return totals;
  }, {});
}

function wrap(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.font = options.font || "24px Arial, sans-serif";
  ctx.fillStyle = options.color || COLORS.ink;
  ctx.textAlign = options.align || "left";
  ctx.direction = options.direction || "ltr";
  ctx.fillText(String(text || ""), x, y);
}

function urduFont(size, bold = false) {
  return `${bold ? "bold " : ""}${size}px '${bold ? `${URDU_FONT} Bold` : URDU_FONT}', 'Noto Sans Arabic', Arial`;
}

function drawTotals(ctx, result, y) {
  const totals = categoryTotals(result);
  const cards = [
    ["Salary / تنخواہ", totals.salary],
    ["Withholding / کٹوتی", totals.withholding],
    ["Other income / دیگر آمدن", totals.otherIncome],
    ["Property / جائیداد", totals.propertyTransactions],
  ];
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 142);
  drawText(ctx, "Optional summary totals / اختیاری خلاصہ مجموعہ", PAGE.margin + 20, y + 30, { font: "bold 20px Arial", color: COLORS.green });
  const cardWidth = (PAGE.width - 2 * PAGE.margin - 44) / 4;
  cards.forEach(([label, amount], index) => {
    const x = PAGE.margin + 12 + index * (cardWidth + 7);
    ctx.fillStyle = COLORS.pale;
    ctx.fillRect(x, y + 48, cardWidth, 72);
    drawText(ctx, label, x + cardWidth / 2, y + 73, { font: "15px Arial", color: COLORS.ink, align: "center" });
    drawText(ctx, `Rs. ${money(amount)}`, x + cardWidth / 2, y + 103, { font: "bold 19px Arial", color: COLORS.green, align: "center" });
  });
  return y + 170;
}

function drawChart(ctx, result, y) {
  const totals = categoryTotals(result);
  const chart = [
    ["Salary", "تنخواہ", totals.salary],
    ["Withholding", "کٹوتی", totals.withholding],
    ["Other income", "دیگر آمدن", totals.otherIncome],
    ["Property", "جائیداد", totals.propertyTransactions],
    ["Assets", "اثاثے", totals.investmentsAndAssets],
  ];
  const max = Math.max(...chart.map(([, , value]) => value), 1);
  const chartWidth = PAGE.width - 2 * PAGE.margin;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(PAGE.margin, y, chartWidth, 292);
  drawText(ctx, "Category overview / زمرہ وار جائزہ", PAGE.margin + 20, y + 32, { font: "bold 20px Arial", color: COLORS.green });
  const baseY = y + 238;
  const left = PAGE.margin + 45;
  const barWidth = 110;
  const gap = 100;
  ctx.strokeStyle = "#D7D0BC";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(left - 10, baseY); ctx.lineTo(PAGE.width - PAGE.margin - 25, baseY); ctx.stroke();
  chart.forEach(([english, urdu, value], index) => {
    const x = left + index * (barWidth + gap);
    const height = Math.round((value / max) * 150);
    ctx.fillStyle = index % 2 ? COLORS.gold : COLORS.green2;
    ctx.fillRect(x, baseY - height, barWidth, height);
    drawText(ctx, `Rs. ${money(value)}`, x + barWidth / 2, baseY - height - 10, { font: "15px Arial", color: COLORS.ink, align: "center" });
    drawText(ctx, english, x + barWidth / 2, baseY + 28, { font: "14px Arial", color: COLORS.ink, align: "center" });
    drawText(ctx, urdu, x + barWidth / 2, baseY + 53, { font: urduFont(16), color: COLORS.ink, align: "center", direction: "rtl" });
  });
  return y + 320;
}

function drawPage(result, pageRows, pageNumber, totalPages, options) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE.width;
  canvas.height = PAGE.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, PAGE.width, PAGE.height);

  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, 0, PAGE.width, 210);
  drawText(ctx, "TAX RETURN SAATHI", PAGE.margin, 78, { font: "bold 30px Arial", color: "#FFFFFF" });
  drawText(ctx, "ٹیکس ریٹرن ساتھی", PAGE.width - PAGE.margin, 88, { font: urduFont(38, true), color: "#FFFFFF", align: "right", direction: "rtl" });
  drawText(ctx, "Document preparation worksheet · دستاویزی تیاری ورک شیٹ", PAGE.margin, 142, { font: "22px Arial", color: "#E9E2C7" });
    drawText(ctx, `Tax year: ${result?.worksheet?.taxYear || "—"}`, PAGE.width - PAGE.margin, 145, { font: "22px Arial", color: "#E9E2C7", align: "right" });
    if (options.dateRange?.from || options.dateRange?.to) drawText(ctx, `Selected range: ${options.dateRange.from || "—"} to ${options.dateRange.to || "—"}`, PAGE.width - PAGE.margin, 178, { font: "16px Arial", color: "#E9E2C7", align: "right" });

  let y = 275;
  if (pageNumber === 1) {
    drawText(ctx, "Prepared worksheet summary", PAGE.margin, y, { font: "bold 34px Arial", color: COLORS.green });
    drawText(ctx, "خلاصہ ورک شیٹ", PAGE.width - PAGE.margin, y + 2, { font: urduFont(32, true), color: COLORS.green, align: "right", direction: "rtl" });
    y += 55;
    drawText(ctx, "This is a preparation aid, not an official FBR/IRIS return.", PAGE.margin, y, { font: "20px Arial", color: COLORS.muted });
    drawText(ctx, "یہ آفیشل FBR/IRIS ریٹرن نہیں ہے۔", PAGE.width - PAGE.margin, y + 2, { font: urduFont(20), color: COLORS.muted, align: "right", direction: "rtl" });
    y += 52;
    ctx.fillStyle = COLORS.pale;
    ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 90);
    drawText(ctx, `Return type: ${result?.worksheet?.returnType || "—"}`, PAGE.margin + 24, y + 37, { font: "22px Arial", color: COLORS.ink });
    drawText(ctx, "ریٹرن کی قسم", PAGE.width - PAGE.margin - 24, y + 42, { font: urduFont(22), color: COLORS.ink, align: "right", direction: "rtl" });
    y += 135;
    if (options.includeTotals) y = drawTotals(ctx, result, y);
    if (options.includeCharts) y = drawChart(ctx, result, y);
  }

  let currentSection = "";
  pageRows.forEach(({ section, item, amount, label }) => {
    if (section !== currentSection) {
      currentSection = section;
      ctx.fillStyle = COLORS.green2;
      ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 54);
      drawText(ctx, SECTION_LABELS[section][0], PAGE.margin + 20, y + 36, { font: "bold 22px Arial", color: "#FFFFFF" });
      drawText(ctx, SECTION_LABELS[section][1], PAGE.width - PAGE.margin - 20, y + 38, { font: urduFont(22, true), color: "#FFFFFF", align: "right", direction: "rtl" });
      y += 72;
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(PAGE.margin, y - 12, PAGE.width - 2 * PAGE.margin, 74);
    const labelLines = wrap(ctx, label, 610).slice(0, 2);
    labelLines.forEach((line, index) => drawText(ctx, line, PAGE.margin + 18, y + 18 + index * 25, { font: "20px Arial", color: COLORS.ink }));
    drawText(ctx, `Rs. ${money(amount)}`, PAGE.width - PAGE.margin - 18, y + 23, { font: "bold 22px Arial", color: COLORS.green, align: "right" });
    if (item.sourceRef) drawText(ctx, `Source: ${item.sourceRef}`, PAGE.margin + 18, y + 57, { font: "15px Arial", color: COLORS.muted });
    y += 88;
  });

  if (pageNumber === totalPages) {
    y += 12;
    const remaining = result?.remainingItems || [];
    const observations = result?.observations || [];
    if (remaining.length) {
      ctx.fillStyle = COLORS.pale;
      ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 55 + remaining.length * 34);
      drawText(ctx, "Remaining checks / باقی تصدیق", PAGE.margin + 20, y + 37, { font: "bold 22px Arial", color: COLORS.green });
      remaining.slice(0, 8).forEach((item, index) => drawText(ctx, `• ${item}`, PAGE.margin + 24, y + 76 + index * 30, { font: "18px Arial", color: COLORS.ink }));
      y += 80 + remaining.length * 30;
    }
    if (observations.length) {
      drawText(ctx, "Observations / مشاہدات", PAGE.margin, y + 24, { font: "bold 22px Arial", color: COLORS.green });
      observations.slice(0, 6).forEach((item, index) => drawText(ctx, `• ${item}`, PAGE.margin + 20, y + 60 + index * 28, { font: "18px Arial", color: COLORS.ink }));
    }
  }

  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(PAGE.margin, PAGE.height - 90, PAGE.width - 2 * PAGE.margin, 1);
  drawText(ctx, "Verify every amount against the original record before manual entry in IRIS.", PAGE.margin, PAGE.height - 48, { font: "16px Arial", color: COLORS.muted });
  drawText(ctx, `Page ${pageNumber} / ${totalPages}`, PAGE.width - PAGE.margin, PAGE.height - 48, { font: "16px Arial", color: COLORS.muted, align: "right" });
  return canvas;
}

function drawEvidenceReviewPage(reviewItems) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE.width;
  canvas.height = PAGE.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, PAGE.width, PAGE.height);
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, 0, PAGE.width, 210);
  drawText(ctx, "TAX RETURN SAATHI", PAGE.margin, 78, { font: "bold 30px Arial", color: "#FFFFFF" });
  drawText(ctx, "ٹیکس ریٹرن ساتھی", PAGE.width - PAGE.margin, 88, { font: urduFont(38, true), color: "#FFFFFF", align: "right", direction: "rtl" });
  drawText(ctx, "Manual evidence review · دستی ثبوتی جائزہ", PAGE.margin, 142, { font: "22px Arial", color: "#E9E2C7" });

  let y = 275;
  drawText(ctx, "Evidence review notes", PAGE.margin, y, { font: "bold 34px Arial", color: COLORS.green });
  drawText(ctx, "ثبوتی جائزے کے نوٹس", PAGE.width - PAGE.margin, y + 2, { font: urduFont(32, true), color: COLORS.green, align: "right", direction: "rtl" });
  y += 55;
  drawText(ctx, "User-selected labels and optional notes. These are not tax advice or filing decisions.", PAGE.margin, y, { font: "20px Arial", color: COLORS.muted });
  y += 58;

  reviewItems.forEach((item, index) => {
    const labelLines = wrap(ctx, `${index + 1}. ${item.label}`, 690).slice(0, 2);
    const noteLines = wrap(ctx, `Note: ${item.note || "—"}`, 690).slice(0, 3);
    const blockHeight = 112 + (labelLines.length - 1) * 24 + (noteLines.length - 1) * 24;
    if (y + blockHeight > PAGE.height - 130) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, blockHeight - 12);
    labelLines.forEach((line, lineIndex) => drawText(ctx, line, PAGE.margin + 20, y + 28 + lineIndex * 24, { font: "bold 20px Arial", color: COLORS.ink }));
    drawText(ctx, `Category: ${item.category} · Machine status: ${item.machineStatus} · Review: ${item.reviewLabel || "Pending"}`, PAGE.margin + 20, y + 28 + labelLines.length * 24, { font: "16px Arial", color: COLORS.green2 });
    noteLines.forEach((line, lineIndex) => drawText(ctx, line, PAGE.margin + 20, y + 58 + labelLines.length * 24 + lineIndex * 24, { font: "17px Arial", color: COLORS.muted }));
    y += blockHeight;
  });

  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(PAGE.margin, PAGE.height - 90, PAGE.width - 2 * PAGE.margin, 1);
  drawText(ctx, "Keep this summary local and verify every item against the original record.", PAGE.margin, PAGE.height - 48, { font: "16px Arial", color: COLORS.muted });
  return canvas;
}

export async function generateBilingualWorksheetPdf(result, options = {}) {
  const settings = { includeTotals: true, includeCharts: true, ...options };
  await ensureUrduFonts();
  const rows = worksheetRows(result);
  const rowsPerPage = settings.includeTotals || settings.includeCharts ? 8 : 12;
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const pdf = await PDFDocument.create();
  for (let index = 0; index < totalPages; index += 1) {
    const canvas = drawPage(result, rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage), index + 1, totalPages, settings);
    const image = await pdf.embedPng(canvas.toDataURL("image/png"));
    const page = pdf.addPage([595, 842]);
    page.drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
  }
  if (settings.evidenceReviewItems?.length) {
    const canvas = drawEvidenceReviewPage(settings.evidenceReviewItems);
    const image = await pdf.embedPng(canvas.toDataURL("image/png"));
    const page = pdf.addPage([595, 842]);
    page.drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
  }
  return pdf.save();
}

export function evidenceReviewSummaryText(items = []) {
  return [
    "TAX RETURN SAATHI / ٹیکس ریٹرن ساتھی",
    "Manual evidence review / دستی ثبوتی جائزہ",
    ...items.map((item, index) => `${index + 1}. ${item.label} — ${item.reviewLabel || "Pending"} — ${item.note || "—"}`),
    "",
    "These are user-organized review notes, not tax advice or filing decisions.",
  ].join("\n");
}

export function worksheetSummaryText(result, options = {}) {
  const totals = categoryTotals(result);
  const lines = [
    "TAX RETURN SAATHI / ٹیکس ریٹرن ساتھی",
    "Prepared worksheet summary / خلاصہ ورک شیٹ",
    `Tax year / ٹیکس سال: ${result?.worksheet?.taxYear || "—"}`,
    `Return type / ریٹرن کی قسم: ${result?.worksheet?.returnType || "—"}`,
    ...(options.dateRange?.from || options.dateRange?.to ? [`Selected date range / منتخب تاریخ کی حد: ${options.dateRange.from || "—"} to ${options.dateRange.to || "—"}`] : []),
    "",
    `Totals / مجموعہ — Salary / تنخواہ: Rs. ${money(totals.salary)} · Withholding / کٹوتی: Rs. ${money(totals.withholding)} · Other income / دیگر آمدن: Rs. ${money(totals.otherIncome)} · Property / جائیداد: Rs. ${money(totals.propertyTransactions)}`,
  ];
  worksheetRows(result).forEach(({ section, label, amount, item }) => lines.push(`${SECTION_LABELS[section][0]} / ${SECTION_LABELS[section][1]}: ${label} — Rs. ${money(amount)}${item.sourceRef ? ` [${item.sourceRef}]` : ""}`));
  if (result?.remainingItems?.length) lines.push("", "Remaining checks / باقی تصدیق:", ...result.remainingItems.map((item) => `- ${item}`));
  if (result?.observations?.length) lines.push("", "Observations / مشاہدات:", ...result.observations.map((item) => `- ${item}`));
  lines.push("", "Not an official FBR/IRIS return. Verify every amount before manual entry.", "یہ آفیشل FBR/IRIS ریٹرن نہیں ہے۔ ہر رقم درج کرنے سے پہلے تصدیق کریں۔");
  return lines.join("\n");
}
