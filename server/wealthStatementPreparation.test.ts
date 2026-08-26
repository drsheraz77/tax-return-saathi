import { describe, expect, it } from "vitest";
import { getWealthStatementReadinessSummary, WEALTH_READINESS_OPTIONS, WEALTH_STATEMENT_PREPARATION_STEPS } from "../client/src/wealthStatementPreparation.js";

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
});
