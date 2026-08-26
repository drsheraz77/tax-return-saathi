import { describe, expect, it } from "vitest";
import {
  IRIS_FAQ,
  FREELANCER_FAQ,
  FREELANCER_PRE_FILING_CHECKLIST,
  FILING_READINESS_STEPS,
  getFilingReadinessSummary,
  OFFICIAL_RESOURCE_HUB,
  PRE_FILING_CHECKLIST,
  searchFreelancerFaq,
  searchIrisFaq,
  validateOfficialResourceHub,
  validateResourceTools,
} from "../client/src/officialResourceHub.js";

describe("official resource hub", () => {
  it("contains complete bilingual resources on approved official hosts", () => {
    expect(validateOfficialResourceHub()).toBe(true);
    expect(OFFICIAL_RESOURCE_HUB.sections.map((section) => section.id)).toEqual(["company", "business-forms", "freelancers", "investments", "filing"]);
    expect(OFFICIAL_RESOURCE_HUB.sections.flatMap((section) => section.resources)).toHaveLength(17);
  });

  it("keeps freelancer guidance in a distinct official-source section", () => {
    const freelancerSection = OFFICIAL_RESOURCE_HUB.sections.find((section) => section.id === "freelancers");
    expect(freelancerSection).toBeDefined();
    expect(freelancerSection?.resources.map((resource) => resource.id)).toEqual([
      "fbr-freelancer-individual-registration",
      "fbr-freelancer-return-help",
      "pseb-freelancer-membership",
      "pseb-freelancer-registration-portal",
    ]);
    expect(freelancerSection?.resources.every((resource) => resource.titleUrdu && resource.descriptionUrdu)).toBe(true);
  });

  it("keeps fixed-term accounts, stocks, ETFs, and bonds in a distinct neutral education section", () => {
    const investmentsSection = OFFICIAL_RESOURCE_HUB.sections.find((section) => section.id === "investments");
    expect(investmentsSection).toBeDefined();
    expect(investmentsSection?.resources.map((resource) => resource.id)).toEqual([
      "national-savings-fixed-term-products",
      "psx-stock-market-learning",
      "psx-etf-learning",
      "sbp-government-bonds",
    ]);
    expect(investmentsSection?.introduction).toMatch(/does not recommend an investment/i);
    expect(investmentsSection?.resources.every((resource) => resource.titleUrdu && resource.descriptionUrdu)).toBe(true);
  });

  it("rejects a resource that does not use an approved official source host", () => {
    const alteredHub = structuredClone(OFFICIAL_RESOURCE_HUB);
    alteredHub.sections[0].resources[0].url = "https://example.com/not-official";
    expect(validateOfficialResourceHub(alteredHub)).toBe(false);
  });

  it("provides searchable official IRIS and freelancer help plus bilingual printable preparation checklists", () => {
    expect(validateResourceTools()).toBe(true);
    expect(searchIrisFaq("password").map((item) => item.id)).toContain("password-reset");
    expect(searchIrisFaq("mobile").map((item) => item.id)).toContain("account-recovery");
    expect(searchIrisFaq("")).toHaveLength(IRIS_FAQ.length);
    expect(PRE_FILING_CHECKLIST).toHaveLength(7);
    expect(searchFreelancerFaq("foreign client").map((item) => item.id)).toContain("foreign-client-records");
    expect(searchFreelancerFaq("record").map((item) => item.id)).toContain("freelancer-record-keeping");
    expect(FREELANCER_FAQ).toHaveLength(3);
    expect(FREELANCER_PRE_FILING_CHECKLIST).toHaveLength(7);
  });

  it("keeps source freshness visible in the model and provides a local-only, non-determinative filing-readiness summary", () => {
    expect(OFFICIAL_RESOURCE_HUB.reviewedOn).toMatch(/2026/);
    expect(FILING_READINESS_STEPS).toHaveLength(4);
    expect(FILING_READINESS_STEPS.every((item) => item.label && item.labelUrdu)).toBe(true);
    expect(getFilingReadinessSummary()).toMatchObject({ completed: 0, total: 4, status: "not-started", label: "Not started" });
    expect(getFilingReadinessSummary({ "year-and-route": true, "records-in-hand": true })).toMatchObject({ completed: 2, status: "in-progress" });
    expect(getFilingReadinessSummary(Object.fromEntries(FILING_READINESS_STEPS.map((item) => [item.id, true])))).toMatchObject({ completed: 4, status: "steps-marked", label: "Preparation steps marked" });
  });
});
