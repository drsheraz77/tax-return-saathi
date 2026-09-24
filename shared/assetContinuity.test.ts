import { describe, expect, it } from "vitest";
import { compareYearToYearAssets } from "./assetContinuity";

describe("year-to-year asset continuity", () => {
  it("flags a prior-year asset that disappears without a supplied disposal", () => {
    const result = compareYearToYearAssets(
      [{ key: "plot-200", label: "200 sq yd plot", priorYearValue: 7000000, currentYearValue: 0, priorYearStatus: "present" }],
      [],
    );
    expect(result).toContainEqual(expect.objectContaining({
      key: "plot-200",
      status: "requires_verification",
    }));
  });

  it("matches equivalent labels despite minor wording differences", () => {
    const result = compareYearToYearAssets(
      [{ key: "palm-iv", label: "Palm IV Plot", priorYearValue: 14000000, currentYearValue: 0, priorYearStatus: "present" }],
      [{ key: "palm-iv-current", label: "Palm IV Property", priorYearValue: 0, currentYearValue: 14000000, currentYearStatus: "present" }],
    );
    expect(result).toContainEqual(expect.objectContaining({ status: "continued" }));
  });

  it("identifies a documented new asset", () => {
    const result = compareYearToYearAssets(
      [],
      [{ key: "palm-iv", label: "Palm IV", priorYearValue: 0, currentYearValue: 14000000, currentYearStatus: "present" }],
    );
    expect(result).toContainEqual(expect.objectContaining({
      key: "palm-iv",
      status: "new_asset",
    }));
  });
});
