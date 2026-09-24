import { PDFDocument, rgb } from "pdf-lib";

const PAGE = { width: 1240, height: 1754, margin: 84 };
const COLORS = { green: "#0B3D2E", green2: "#155E43", gold: "#C9A227", paper: "#F6F4EC", ink: "#1D2321", muted: "#6B706D" };

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

function drawPage(result, pageRows, pageNumber, totalPages) {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE.width;
  canvas.height = PAGE.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, PAGE.width, PAGE.height);

  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, 0, PAGE.width, 210);
  drawText(ctx, "TAX RETURN SAATHI", PAGE.margin, 78, { font: "bold 30px Arial", color: "#FFFFFF" });
  drawText(ctx, "ٹیکس ریٹرن ساتھی", PAGE.width - PAGE.margin, 88, { font: "bold 38px Noto Sans Arabic, Arial", color: "#FFFFFF", align: "right", direction: "rtl" });
  drawText(ctx, "Document preparation worksheet · دستاویزی تیاری ورک شیٹ", PAGE.margin, 142, { font: "22px Arial", color: "#E9E2C7" });
  drawText(ctx, `Tax year: ${result?.worksheet?.taxYear || "—"}`, PAGE.width - PAGE.margin, 145, { font: "22px Arial", color: "#E9E2C7", align: "right" });

  let y = 275;
  if (pageNumber === 1) {
    drawText(ctx, "Prepared worksheet summary", PAGE.margin, y, { font: "bold 34px Arial", color: COLORS.green });
    drawText(ctx, "خلاصہ ورک شیٹ", PAGE.width - PAGE.margin, y + 2, { font: "bold 32px Noto Sans Arabic, Arial", color: COLORS.green, align: "right", direction: "rtl" });
    y += 55;
    drawText(ctx, "This is a preparation aid, not an official FBR/IRIS return.", PAGE.margin, y, { font: "20px Arial", color: COLORS.muted });
    drawText(ctx, "یہ آفیشل FBR/IRIS ریٹرن نہیں ہے۔", PAGE.width - PAGE.margin, y + 2, { font: "20px Noto Sans Arabic, Arial", color: COLORS.muted, align: "right", direction: "rtl" });
    y += 52;
    ctx.fillStyle = "#FBF6E3";
    ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 90);
    drawText(ctx, `Return type: ${result?.worksheet?.returnType || "—"}`, PAGE.margin + 24, y + 37, { font: "22px Arial", color: COLORS.ink });
    drawText(ctx, "ریٹرن کی قسم", PAGE.width - PAGE.margin - 24, y + 42, { font: "22px Noto Sans Arabic, Arial", color: COLORS.ink, align: "right", direction: "rtl" });
    y += 135;
  }

  let currentSection = "";
  pageRows.forEach(({ section, item, amount, label }) => {
    if (section !== currentSection) {
      currentSection = section;
      ctx.fillStyle = COLORS.green2;
      ctx.fillRect(PAGE.margin, y, PAGE.width - 2 * PAGE.margin, 54);
      drawText(ctx, SECTION_LABELS[section][0], PAGE.margin + 20, y + 36, { font: "bold 22px Arial", color: "#FFFFFF" });
      drawText(ctx, SECTION_LABELS[section][1], PAGE.width - PAGE.margin - 20, y + 38, { font: "bold 22px Noto Sans Arabic, Arial", color: "#FFFFFF", align: "right", direction: "rtl" });
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
      ctx.fillStyle = "#FBF6E3";
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

export async function generateBilingualWorksheetPdf(result) {
  const rows = worksheetRows(result);
  const rowsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const pdf = await PDFDocument.create();
  for (let index = 0; index < totalPages; index += 1) {
    const canvas = drawPage(result, rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage), index + 1, totalPages);
    const image = await pdf.embedPng(canvas.toDataURL("image/png"));
    const page = pdf.addPage([595, 842]);
    page.drawImage(image, { x: 0, y: 0, width: 595, height: 842 });
  }
  return pdf.save();
}

export function worksheetSummaryText(result) {
  const lines = [
    "TAX RETURN SAATHI / ٹیکس ریٹرن ساتھی",
    "Prepared worksheet summary / خلاصہ ورک شیٹ",
    `Tax year / ٹیکس سال: ${result?.worksheet?.taxYear || "—"}`,
    `Return type / ریٹرن کی قسم: ${result?.worksheet?.returnType || "—"}`,
    "",
  ];
  worksheetRows(result).forEach(({ section, label, amount, item }) => lines.push(`${SECTION_LABELS[section][0]} / ${SECTION_LABELS[section][1]}: ${label} — Rs. ${money(amount)}${item.sourceRef ? ` [${item.sourceRef}]` : ""}`));
  if (result?.remainingItems?.length) lines.push("", "Remaining checks / باقی تصدیق:", ...result.remainingItems.map((item) => `- ${item}`));
  if (result?.observations?.length) lines.push("", "Observations / مشاہدات:", ...result.observations.map((item) => `- ${item}`));
  lines.push("", "Not an official FBR/IRIS return. Verify every amount before manual entry.", "یہ آفیشل FBR/IRIS ریٹرن نہیں ہے۔ ہر رقم درج کرنے سے پہلے تصدیق کریں۔");
  return lines.join("\n");
}
