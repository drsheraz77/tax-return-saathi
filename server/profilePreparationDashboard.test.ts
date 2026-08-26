import { describe, expect, it } from "vitest";
import { buildProfilePreparationDashboard, FIRST_TIME_PREPARATION_ROUTE } from "../client/src/profilePreparationDashboard";

describe("profile preparation dashboard model", () => {
  it("offers a public first-time route with official reviewed source cards and no data request", () => {
    expect(FIRST_TIME_PREPARATION_ROUTE.cards).toHaveLength(3);
    expect(FIRST_TIME_PREPARATION_ROUTE.cards.every((card) => card.sourceUrl.startsWith("https://www.fbr.gov.pk/"))).toBe(true);
    expect(FIRST_TIME_PREPARATION_ROUTE.boundary).toContain("does not collect data");
    expect(FIRST_TIME_PREPARATION_ROUTE.boundary).toContain("calculate tax");
  });

  it("uses only approved profile preferences to organise educational cards", () => {
    const route = buildProfilePreparationDashboard({ preparationPaths: ["investor"], filingFamiliarity: "first_time", resourceOrder: "guided", taxYearContext: "ty_2026" });
    expect(route.cards.map((card) => card.id)).toEqual(["iris-access", "return-completion-records", "due-dates", "laws-index"]);
    expect(route.boundary).toContain("do not determine tax");
    expect(route.why.join(" ")).not.toContain("CNIC");
  });

  it("adds an official laws starting point for an unknown tax-year context without deciding another year’s rules", () => {
    const route = buildProfilePreparationDashboard({ preparationPaths: [], filingFamiliarity: "filed_before", resourceOrder: "source_first", taxYearContext: "other_or_unsure" });
    expect(route.cards[0].id).toBe("due-dates");
    expect(route.cards.at(-1).id).toBe("laws-index");
    expect(route.why.some((reason) => reason.text.includes("does not determine another year's rules"))).toBe(true);
  });
});
