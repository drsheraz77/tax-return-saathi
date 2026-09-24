import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWorksheetCsv } from "../client/src/DocumentPreparationPage.jsx";
import { categoryTotals, countWorksheetEntries, filterWorksheetByDateRange, worksheetSummaryText } from "../client/src/worksheetPdf.js";

const app = fs.readFileSync(path.join(process.cwd(), "client/src/App.jsx"), "utf8");
const main = fs.readFileSync(path.join(process.cwd(), "client/src/main.jsx"), "utf8");
const page = fs.readFileSync(path.join(process.cwd(), "client/src/DocumentPreparationPage.jsx"), "utf8");
const pdf = fs.readFileSync(path.join(process.cwd(), "client/src/worksheetPdf.js"), "utf8");
const index = fs.readFileSync(path.join(process.cwd(), "server/_core/index.ts"), "utf8");

describe("document-assisted return preparation page", () => {
  it("keeps the current filled-return analysis route and adds a separate preparation route", () => {
    expect(main).toContain('route === "/analyze-tax-return"');
    expect(main).toContain('route === "/prepare-tax-return"');
    expect(main).toContain("DocumentPreparationPage");
    expect(index).toContain('app.all("/api/return-review"');
    expect(index).toContain('app.all("/api/document-preparation"');
  });

  it("links the existing checklist to the new preparation workflow", () => {
    expect(app).toContain('href="/prepare-tax-return"');
    expect(app).toContain("Upload documents to build a return worksheet");
    expect(app).toContain("Analyze a filled return and confirm its values");
  });

  it("renders a bilingual worksheet and explicit non-filing boundary", () => {
    expect(page).toContain("دستاویزات سے ریٹرن کی تیاری ورک شیٹ");
    expect(page).toContain("Prepare a return worksheet from documents");
    expect(page).toContain('const [lang, setLang] = useState("en")');
    expect(page).toContain("It does not produce an official FBR form or file your return.");
    expect(page).toContain("/api/document-preparation");
    expect(page).toContain("This is not an official FBR/IRIS form");
    expect(page).toContain("remainingItems");
    expect(page).toContain("CNIC, NTN, IBAN");
  });

  it("offers opt-in local drafts and worksheet exports without document persistence", () => {
    expect(page).toContain("localStorage");
    expect(page).toContain("document-preparation-draft");
    expect(page).toContain("Download CSV");
    expect(page).toContain("Download branded PDF");
    expect(page).toContain("Download bilingual summary");
    expect(page).toContain("Include summary totals");
    expect(page).toContain("Include category chart");
    expect(page).toContain("generateBilingualWorksheetPdf");
    expect(pdf).toContain("export async function generateBilingualWorksheetPdf");
    expect(pdf).toContain("NotoNaskhArabic-Regular.ttf");
    expect(pdf).toContain("NotoSansArabic-Bold.ttf");
    expect(pdf).toContain("Optional summary totals");
    expect(pdf).toContain("Category overview");
    expect(pdf).toContain("ٹیکس ریٹرن ساتھی");
    expect(page).not.toContain("FileSystemHandle");
  });

  it("creates an escaped CSV containing worksheet rows and remaining items", () => {
    const csv = buildWorksheetCsv({
      worksheet: { taxYear: "TY2026", salary: [{ employerLabel: "Employer, A", grossSalary: 1000, sourceRef: "document 1" }], withholding: [], otherIncome: [], deductions: [], investmentsAndAssets: [], propertyTransactions: [], bankBalances: [] },
      remainingItems: ["Verify \"official\" field"],
      observations: [],
    });
    expect(csv).toContain("\ufeff\"Section\",\"Description\"");
    expect(csv).toContain("\"Employer, A\"");
    expect(csv).toContain("\"Verify \"\"official\"\" field\"");
  });

  it("calculates category totals without applying tax rates or determinations", () => {
    const totals = categoryTotals({ worksheet: { salary: [{ grossSalary: 1000 }], withholding: [{ amount: 100 }], otherIncome: [], deductions: [], investmentsAndAssets: [], propertyTransactions: [{ statedAmount: 8000 }], bankBalances: [] } });
    expect(totals.salary).toBe(1000);
    expect(totals.withholding).toBe(100);
    expect(totals.propertyTransactions).toBe(8000);
    expect(Object.keys(totals)).toHaveLength(7);
  });

  it("filters multi-year worksheet entries by inclusive date range while retaining undated evidence", () => {
    const result = { worksheet: { taxYear: "TY2026", salary: [{ employerLabel: "Prior year", taxYear: "TY2025", grossSalary: 100 }, { employerLabel: "Current year", taxYear: "TY2026", grossSalary: 200 }, { employerLabel: "Undated", grossSalary: 300 }], withholding: [], otherIncome: [], deductions: [], investmentsAndAssets: [], propertyTransactions: [], bankBalances: [] } };
    const filtered = filterWorksheetByDateRange(result, "2026-01-01", "2026-12-31");
    expect(filtered.worksheet.salary.map((item) => item.employerLabel)).toEqual(["Current year", "Undated"]);
    expect(countWorksheetEntries(filtered)).toBe(2);
    expect(countWorksheetEntries(result)).toBe(3);
    expect(worksheetSummaryText(filtered, { dateRange: { from: "2026-01-01", to: "2026-12-31" } })).toContain("Selected date range / منتخب تاریخ کی حد: 2026-01-01 to 2026-12-31");
  });
});
