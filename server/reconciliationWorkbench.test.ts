import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const component = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/ReconciliationWorkbench.jsx"), "utf8");
const main = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/main.jsx"), "utf8");
const dock = fs.readFileSync(path.resolve(import.meta.dirname, "../client/src/QuickToolsDock.jsx"), "utf8");

describe("local reconciliation workbench", () => {
  it("is mounted through the existing supplemental layer and quick-tools dock", () => {
    expect(main).toContain("ReconciliationWorkbench");
    expect(main).toContain("<ReconciliationWorkbench />");
    expect(dock).toContain("tax-return-saathi:open-reconciliation");
  });

  it("keeps figures and transaction files local", () => {
    expect(component).toContain("Local-only tool");
    expect(component).toContain("not sent to the server or saved");
    expect(component).toContain("parseTabularTransactions");
    expect(component).not.toContain("fetch(");
    expect(component).not.toContain("trpc.");
  });

  it("does not ask for account identifiers in the bank cross-check", () => {
    expect(component).toContain("Generic account label");
    expect(component).toContain("Do not enter account numbers, CNIC, NTN, IBAN");
  });
});
