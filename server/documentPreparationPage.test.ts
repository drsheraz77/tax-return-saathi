import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const app = fs.readFileSync(path.join(process.cwd(), "client/src/App.jsx"), "utf8");
const main = fs.readFileSync(path.join(process.cwd(), "client/src/main.jsx"), "utf8");
const page = fs.readFileSync(path.join(process.cwd(), "client/src/DocumentPreparationPage.jsx"), "utf8");
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
    expect(app).toContain("Upload documents to build a preparation worksheet");
  });

  it("renders a bilingual worksheet and explicit non-filing boundary", () => {
    expect(page).toContain("دستاویزات سے ریٹرن کی تیاری");
    expect(page).toContain("Prepare your return from documents");
    expect(page).toContain("/api/document-preparation");
    expect(page).toContain("This is not an official FBR/IRIS form");
    expect(page).toContain("remainingItems");
    expect(page).toContain("CNIC, NTN, IBAN");
  });
});
