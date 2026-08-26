import { describe, expect, it } from "vitest";
import { getWealthReadinessPrintRows, getWealthStatementReadinessSummary, WEALTH_READINESS_OPTIONS, WEALTH_STATEMENT_PREPARATION_STEPS } from "../client/src/wealthStatementPreparation.js";

describe("local wealth-statement preparation model", () => {
  it("offers only controlled readiness choices rather than financial-input fields", () => {
    expect(WEALTH_STATEMENT_PREPARATION_STEPS.map((step) => step.id)).toEqual([
      "opening-position",
      "movement-records",
      "assets-liabilities-support",
      "unexplained-changes",
    ]);
    expect(WEALTH_READINESS_OPTIONS.map((option) => option.value)).toEqual(["", "ready", "needs-review", "not-sure"]);
  });

  it("summarises temporary readiness choices without calculating a statement", () => {
    expect(getWealthStatementReadinessSummary({
      "opening-position": "ready",
      "movement-records": "needs-review",
      "assets-liabilities-support": "not-sure",
    })).toEqual({ total: 4, selected: 3, ready: 1, needsReview: 1, notSure: 1 });
  });

  it("creates a printable summary from controlled states only", () => {
    const rows = getWealthReadinessPrintRows({ "opening-position": "ready", "movement-records": "not-sure" });
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ id: "opening-position", status: "I can locate support" });
    expect(rows[1]).toMatchObject({ id: "movement-records", status: "I am not sure" });
    expect(Object.keys(rows[0])).toEqual(["id", "label", "labelUrdu", "status", "statusUrdu"]);
  });
});
