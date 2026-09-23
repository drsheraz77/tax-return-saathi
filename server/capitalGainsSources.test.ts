import { describe, expect, it } from "vitest";
import { TAX_YEAR_CAPITAL_GAINS, TAX_YEAR_CAPITAL_GAINS_BOUNDARY, TAX_YEAR_CAPITAL_GAINS_REVIEWED_ON, TAX_YEAR_CAPITAL_GAINS_SOURCES } from "../client/src/capitalGainsSources.js";

describe("Tax Year 2026 capital-gains source notes", () => {
  it("keeps the source set dated and official", () => {
    expect(TAX_YEAR_CAPITAL_GAINS).toBe("Tax Year 2026");
    expect(TAX_YEAR_CAPITAL_GAINS_REVIEWED_ON).toBe("23 September 2026");
    expect(TAX_YEAR_CAPITAL_GAINS_SOURCES).toHaveLength(4);
    for (const source of TAX_YEAR_CAPITAL_GAINS_SOURCES) {
      expect(new URL(source.url).hostname).toMatch(/fbr\.gov\.pk$/);
      expect(source.title).toBeTruthy();
      expect(source.titleUrdu).toBeTruthy();
      expect(source.note).toBeTruthy();
      expect(source.noteUrdu).toBeTruthy();
      expect(source.worksheetUse).toBeTruthy();
      expect(source.worksheetUseUrdu).toBeTruthy();
    }
  });

  it("maps the official return, law, explanatory, and reconciliation references", () => {
    expect(TAX_YEAR_CAPITAL_GAINS_SOURCES.map((source) => source.id)).toEqual([
      "return-form-2026",
      "ordinance-2026",
      "finance-act-explanation-2026",
      "wealth-statement-guidance",
    ]);
    expect(TAX_YEAR_CAPITAL_GAINS_SOURCES.find((source) => source.id === "ordinance-2026")?.note).toMatch(/37A/);
    expect(TAX_YEAR_CAPITAL_GAINS_SOURCES.find((source) => source.id === "return-form-2026")?.note).toMatch(/Tax Year 2026/);
    expect(TAX_YEAR_CAPITAL_GAINS_BOUNDARY.english).toMatch(/not live monitoring/);
    expect(TAX_YEAR_CAPITAL_GAINS_BOUNDARY.urdu).toBeTruthy();
  });
});
