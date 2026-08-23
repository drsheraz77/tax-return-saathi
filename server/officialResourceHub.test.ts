import { describe, expect, it } from "vitest";
import { OFFICIAL_RESOURCE_HUB, validateOfficialResourceHub } from "../client/src/officialResourceHub.js";

describe("official resource hub", () => {
  it("contains complete bilingual resources on official SECP and FBR hosts", () => {
    expect(validateOfficialResourceHub()).toBe(true);
    expect(OFFICIAL_RESOURCE_HUB.sections.map((section) => section.id)).toEqual(["company", "filing"]);
    expect(OFFICIAL_RESOURCE_HUB.sections.flatMap((section) => section.resources)).toHaveLength(6);
  });

  it("rejects a resource that does not use an approved official source host", () => {
    const alteredHub = structuredClone(OFFICIAL_RESOURCE_HUB);
    alteredHub.sections[0].resources[0].url = "https://example.com/not-official";
    expect(validateOfficialResourceHub(alteredHub)).toBe(false);
  });
});
