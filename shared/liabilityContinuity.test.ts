import { describe, expect, it } from "vitest";
import { compareYearToYearLiabilities, summarizeLiabilityContinuity } from "./liabilityContinuity";

describe("liability continuity", () => {
  it("detects a new liability", () => {
    const r = compareYearToYearLiabilities([], [{ label: "J5 Premium payable", amount: 6500000, evidenceRef: "doc-1" }]);
    expect(r[0].status).toBe("new");
  });
  it("detects an increased liability", () => {
    const r = compareYearToYearLiabilities([{ label: "Car loan", amount: 2000000 }], [{ label: "Car loan payable", amount: 3000000, evidenceRef: "doc-2" }]);
    expect(r[0].status).toBe("increased");
    expect(r[0].difference).toBe(1000000);
  });
  it("detects a settled liability when it disappears", () => {
    const r = compareYearToYearLiabilities([{ label: "Old loan", amount: 1000000 }], []);
    expect(r[0].status).toBe("settled");
  });
  it("does not match unrelated liabilities", () => {
    const r = compareYearToYearLiabilities([{ label: "Personal loan", amount: 1000000 }], [{ label: "Vehicle payable", amount: 1000000, evidenceRef: "doc-3" }]);
    expect(r[0].status).toBe("new");
  });
  it("summarizes continuity", () => {
    const r = summarizeLiabilityContinuity(compareYearToYearLiabilities([], [{ label: "Loan", amount: 100, evidenceRef: "x" }]));
    expect(r.new).toBe(1);
  });
});
