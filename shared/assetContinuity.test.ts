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
