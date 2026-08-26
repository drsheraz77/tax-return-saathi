import { describe, expect, it } from "vitest";
import {
  buildNonSensitiveReadinessSummary,
  getPreFilingTimelineSummary,
  PRE_FILING_TIMELINE_STEPS,
  TIMELINE_STATUS_OPTIONS,
} from "../client/src/preFilingTimelinePlanner.js";

describe("pre-filing timeline planner", () => {
  it("uses only controlled preparation stages and status values", () => {
    expect(PRE_FILING_TIMELINE_STEPS).toHaveLength(5);
    expect(TIMELINE_STATUS_OPTIONS.map((option) => option.id)).toEqual([
      "not_started",
      "in_progress",
      "ready_to_verify",
    ]);
    expect(PRE_FILING_TIMELINE_STEPS.some((step) => /amount|cnic|password|document upload/i.test(step.id))).toBe(false);
  });

  it("summarises only controlled timeline states", () => {
    expect(getPreFilingTimelineSummary({ gather: "ready_to_verify", review: "in_progress" })).toEqual({
      notStarted: 0,
      inProgress: 1,
      readyToVerify: 1,
      unmarked: 3,
    });
  });

  it("builds a non-sensitive text summary without values or identifiers", () => {
    const summary = buildNonSensitiveReadinessSummary({
      timelineStatus: { gather: "ready_to_verify" },
      wealthReadiness: { assets: "ready" },
    });

    expect(summary).toContain("Generated locally in your browser");
    expect(summary).toContain("Gather only the records you need to review: Ready to verify");
    expect(summary).not.toContain("123456");
    expect(summary).not.toContain("CNIC:");
  });
});
