import { describe, expect, it } from "vitest";
import { getPrototypeChecklist, getPrototypeQuestions } from "../client/src/personalisedChecklistPrototype.js";

describe("personalised filing checklist prototype", () => {
  it("adds conditional business and property questions only for selected categories", () => {
    expect(getPrototypeQuestions({ incomeCategories: ["salary"] }).map((question) => question.id)).not.toContain("businessRecords");
    expect(getPrototypeQuestions({ incomeCategories: ["business", "property"] }).map((question) => question.id)).toEqual(expect.arrayContaining(["businessRecords", "propertyRecords"]));
  });

  it("builds a deterministic, category-based checklist without tax amounts or identity fields", () => {
    const items = getPrototypeChecklist({
      filingExperience: "first_time",
      incomeCategories: ["salary", "business", "bank_profit"],
      businessRecords: "not_ready",
      withholding: "yes",
      foreignConnection: "no",
      recordsReadiness: "some_missing",
    });
    expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["iris", "access", "salary", "business", "business-ready", "bank", "withholding", "records"]));
    expect(JSON.stringify(items)).not.toMatch(/CNIC|NTN|password|amount|account number/i);
  });

  it("adds a neutral escalation item when a foreign connection or uncertainty is selected", () => {
    const items = getPrototypeChecklist({
      filingExperience: "not_sure",
      incomeCategories: ["other"],
      withholding: "not_sure",
      foreignConnection: "yes",
      recordsReadiness: "not_sure",
    });
    expect(items.find((item) => item.id === "foreign")?.type).toBe("seek_advice");
    expect(items.find((item) => item.id === "uncertainty")?.type).toBe("seek_advice");
  });
});
