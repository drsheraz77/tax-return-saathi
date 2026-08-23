import { describe, expect, it } from "vitest";
import { formatPrototypeDraftSavedAt, getPrototypeChecklist, getPrototypeDraftSavedAtIso, getPrototypeQuestions, loadPrototypeDraft, parsePrototypeDraft, PROTOTYPE_DRAFT_STORAGE_KEY, removePrototypeDraft, savePrototypeDraft, serialisePrototypeDraft } from "../client/src/personalisedChecklistPrototype.js";

describe("personalised filing checklist prototype", () => {
  it("adds conditional business, property, and freelancer questions only for selected categories", () => {
    expect(getPrototypeQuestions({ incomeCategories: ["salary"] }).map((question) => question.id)).not.toContain("businessRecords");
    expect(getPrototypeQuestions({ incomeCategories: ["salary"] }).map((question) => question.id)).not.toContain("freelancerRecords");
    expect(getPrototypeQuestions({ incomeCategories: ["business", "property"] }).map((question) => question.id)).toEqual(expect.arrayContaining(["businessRecords", "propertyRecords"]));
    expect(getPrototypeQuestions({ incomeCategories: ["freelancer"] }).map((question) => question.id)).toContain("freelancerRecords");
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

  it("adds preparation-only freelancer prompts without determining foreign-client tax treatment", () => {
    const items = getPrototypeChecklist({
      filingExperience: "filed_before",
      incomeCategories: ["freelancer"],
      freelancerRecords: "partly",
      withholding: "no",
      foreignConnection: "no",
      recordsReadiness: "all_ready",
    });
    expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["freelancer", "freelancer-ready"]));
    expect(JSON.stringify(items)).not.toMatch(/CNIC|NTN|password|amount|account number|tax rate/i);
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

  it("serialises only allowed high-level answers and valid checklist progress marks", () => {
    const serialised = serialisePrototypeDraft({
      answers: { filingExperience: "first_time", incomeCategories: ["business", "invalid"], cnic: "12345-0000000-0" },
      itemStatus: { business: "Have it", iris: "completed", invented: "Need to find" },
      step: 2,
      showResults: false,
    }, 123456789);
    const draft = parsePrototypeDraft(serialised);
    expect(draft).toMatchObject({
      version: 1,
      savedAt: 123456789,
      answers: { filingExperience: "first_time", incomeCategories: ["business"] },
      itemStatus: { business: "Have it" },
      step: 2,
      showResults: false,
    });
    expect(serialised).not.toContain("cnic");
    expect(serialised).not.toContain("invalid");
  });

  it("rejects malformed or incompatible saved drafts", () => {
    expect(parsePrototypeDraft("not json")).toBeNull();
    expect(parsePrototypeDraft(JSON.stringify({ version: 99, savedAt: 123456789 }))).toBeNull();
  });

  it("formats the saved time from the stored browser-local timestamp", () => {
    expect(formatPrototypeDraftSavedAt(0, "en-GB", "UTC")).toBe("1 Jan 1970, 00:00:00");
    expect(getPrototypeDraftSavedAtIso(0)).toBe("1970-01-01T00:00:00.000Z");
    expect(formatPrototypeDraftSavedAt("not a date")).toBeNull();
    expect(getPrototypeDraftSavedAtIso("not a date")).toBeNull();
  });

  it("saves, restores, and removes drafts solely through a supplied browser storage adapter", () => {
    const values = new Map();
    const calls: Array<[string, string]> = [];
    const storage = {
      getItem: (key: string) => {
        calls.push(["getItem", key]);
        return values.get(key) ?? null;
      },
      setItem: (key: string, value: string) => {
        calls.push(["setItem", key]);
        values.set(key, value);
      },
      removeItem: (key: string) => {
        calls.push(["removeItem", key]);
        values.delete(key);
      },
    };

    savePrototypeDraft(storage, { answers: { filingExperience: "first_time" }, itemStatus: {}, step: 0, showResults: false }, 123456789);
    expect(loadPrototypeDraft(storage)?.answers.filingExperience).toBe("first_time");
    removePrototypeDraft(storage);
    expect(loadPrototypeDraft(storage)).toBeNull();
    expect(calls).toEqual([
      ["setItem", PROTOTYPE_DRAFT_STORAGE_KEY],
      ["getItem", PROTOTYPE_DRAFT_STORAGE_KEY],
      ["removeItem", PROTOTYPE_DRAFT_STORAGE_KEY],
      ["getItem", PROTOTYPE_DRAFT_STORAGE_KEY],
    ]);
  });
});
