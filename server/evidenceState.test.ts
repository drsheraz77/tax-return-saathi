import { describe, expect, it } from "vitest";
import { buildLegacyEvidenceSummary, normalizeLegacyNumericEvidence } from "../shared/evidenceState";

describe("evidence-state compatibility layer", () => {
  it("keeps established nonzero legacy values as known", () => {
    expect(normalizeLegacyNumericEvidence(125000)).toMatchObject({ value: 125000, status: "KNOWN" });
  });

  it("does not interpret an implicit zero as a known zero", () => {
    expect(normalizeLegacyNumericEvidence(0)).toMatchObject({ value: 0, status: "UNKNOWN" });
    expect(normalizeLegacyNumericEvidence(0, { explicitlyKnownZero: true })).toMatchObject({ value: 0, status: "KNOWN_ZERO" });
    expect(normalizeLegacyNumericEvidence(undefined)).toMatchObject({ value: null, status: "UNKNOWN" });
  });

  it("summarizes only numeric legacy fields and leaves other facts untouched", () => {
    const summary = buildLegacyEvidenceSummary({ income: 500000, taxPaid: 0, declaredClosingWealth: null, label: "document 1" });
    expect(summary.knownFields).toEqual(["income"]);
    expect(summary.unknownFields).toEqual(["taxPaid", "declaredClosingWealth"]);
    expect(summary.fields.label).toBeUndefined();
    expect(summary.boundary).toMatch(/legacy numeric extraction fields/i);
  });
});
