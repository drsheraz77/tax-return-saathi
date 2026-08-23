import { describe, expect, it } from "vitest";
import {
  IRIS_FAQ,
  OFFICIAL_RESOURCE_HUB,
  PRE_FILING_CHECKLIST,
  searchIrisFaq,
  validateOfficialResourceHub,
  validateResourceTools,
} from "../client/src/officialResourceHub.js";

describe("official resource hub", () => {
  it("contains complete bilingual resources on official SECP and FBR hosts", () => {
    expect(validateOfficialResourceHub()).toBe(true);
    expect(OFFICIAL_RESOURCE_HUB.sections.map((section) => section.id)).toEqual(["company", "business-forms", "freelancers", "filing"]);
    expect(OFFICIAL_RESOURCE_HUB.sections.flatMap((section) => section.resources)).toHaveLength(13);
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

  it("rejects a resource that does not use an approved official source host", () => {
    const alteredHub = structuredClone(OFFICIAL_RESOURCE_HUB);
    alteredHub.sections[0].resources[0].url = "https://example.com/not-official";
    expect(validateOfficialResourceHub(alteredHub)).toBe(false);
  });

  it("provides searchable official IRIS help and a bilingual printable preparation checklist", () => {
    expect(validateResourceTools()).toBe(true);
    expect(searchIrisFaq("password").map((item) => item.id)).toContain("password-reset");
    expect(searchIrisFaq("mobile").map((item) => item.id)).toContain("account-recovery");
    expect(searchIrisFaq("")).toHaveLength(IRIS_FAQ.length);
    expect(PRE_FILING_CHECKLIST).toHaveLength(7);
  });
});
