import { describe, expect, it } from "vitest";
import { TAX_YEAR_2026_SOURCES, TAX_YEAR_2026_UPDATE } from "../client/src/taxYear2026Update.js";

describe("Tax Year 2026 filing update", () => {
  it("uses the verified filing period and published due dates", () => {
    expect(TAX_YEAR_2026_UPDATE.period).toBe("1 July 2025 to 30 June 2026");
    expect(TAX_YEAR_2026_UPDATE.individualAndAopDueDate).toBe("30 September 2026");
    expect(TAX_YEAR_2026_UPDATE.companyDueDate).toBe("31 December 2026");
  });

  it("links visitors to first-party FBR resources and the selected public sources", () => {
    expect(TAX_YEAR_2026_UPDATE.irisUrl).toMatch(/^https:\/\/iris\.fbr\.gov\.pk\//);
    expect(TAX_YEAR_2026_SOURCES.fbrDueDates).toContain("fbr.gov.pk");
    expect(TAX_YEAR_2026_SOURCES.fbrFilingGuidance).toContain("fbr.gov.pk");
    expect(TAX_YEAR_2026_SOURCES.fbrSocialAnnouncement).toContain("facebook.com/Fbrspokesperson");
    expect(TAX_YEAR_2026_SOURCES.newspaperCoverage).toContain("dunyanews.tv");
  });
});
