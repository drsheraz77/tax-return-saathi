import { describe, expect, it } from "vitest";
import { FBR_NOTICE_ARCHIVE } from "../client/src/fbrNoticeArchive.js";
import { OFFICIAL_SOURCE_UPDATE_CENTRE, TAX_YEAR_2026_SOURCES, TAX_YEAR_2026_UPDATE, validateOfficialSourceUpdateCentre } from "../client/src/taxYear2026Update.js";

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

  it("keeps the official-source update centre limited, bilingual, and clearly reviewed rather than live", () => {
    expect(validateOfficialSourceUpdateCentre()).toBe(true);
    expect(OFFICIAL_SOURCE_UPDATE_CENTRE.status).toBe("reviewed-not-live");
    expect(OFFICIAL_SOURCE_UPDATE_CENTRE.reviewedOn).toBe("26 August 2026");
    expect(OFFICIAL_SOURCE_UPDATE_CENTRE.sources.map((source) => source.id)).toEqual(["filing-workflow", "due-dates", "notices-and-announcements", "laws-and-rules-index"]);
    expect(OFFICIAL_SOURCE_UPDATE_CENTRE.limitation).toMatch(/not a live FBR feed/i);
    expect(OFFICIAL_SOURCE_UPDATE_CENTRE.sources.every((source) => source.titleUrdu && source.purposeUrdu && source.sourceUrl.includes("fbr.gov.pk"))).toBe(true);
  });

  it("keeps the dated FBR notice archive ordered and clearly separates current from historical notices", () => {
    expect(FBR_NOTICE_ARCHIVE).toHaveLength(3);
    expect(FBR_NOTICE_ARCHIVE.map((notice) => notice.dateIso)).toEqual(["2026-07-24", "2025-10-15", "2025-09-30"]);
    expect(FBR_NOTICE_ARCHIVE[0].scope).toBe("Current Tax Year 2026");
    expect(FBR_NOTICE_ARCHIVE.slice(1).every((notice) => notice.scope.startsWith("Historical Tax Year 2025"))).toBe(true);
    expect(FBR_NOTICE_ARCHIVE.every((notice) => notice.sourceUrl.startsWith("https://"))).toBe(true);
  });
});
