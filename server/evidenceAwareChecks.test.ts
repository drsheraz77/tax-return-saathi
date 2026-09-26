import { describe, expect, it } from "vitest";
import { buildAssetEvidenceChecks, buildBankEvidenceChecks, buildLiabilityEvidenceChecks, summarizeEvidenceChecks } from "../shared/evidenceAwareChecks";

describe("evidence-aware reconciliation checks", () => {
  it("does not call an unstated zero bank value matched", () => {
    const result = buildBankEvidenceChecks([{ accountRef: "Bank A", statementClosingBalance: 0, declaredWealthBalance: 0 }]);
    expect(result[0]).toMatchObject({ status: "EVIDENCE_NOT_PROVIDED", difference: null });
  });

  it("distinguishes an established asset mismatch from missing evidence", () => {
    const result = buildAssetEvidenceChecks([
      { label: "Investment A", statementValue: 1_000_000, declaredValue: 900_000, evidenceRef: "document 2 / page 1" },
      { label: "Vehicle B", statementValue: 0, declaredValue: 0, evidenceRef: "" },
    ]);
    expect(result[0]).toMatchObject({ status: "MISMATCH", difference: -100_000 });
    expect(result[1]).toMatchObject({ status: "EVIDENCE_NOT_PROVIDED", difference: null });
  });

  it("does not infer a settled liability when prior-year evidence is absent", () => {
    const result = buildLiabilityEvidenceChecks([], [{ label: "Loan A", amount: 500_000, evidenceRef: "document 3" }]);
    expect(result[0]).toMatchObject({ status: "EVIDENCE_NOT_PROVIDED", difference: null });
  });

  it("summarizes parallel evidence checks without changing their detail", () => {
    const summary = summarizeEvidenceChecks([
      ...buildBankEvidenceChecks([{ accountRef: "Bank A", statementClosingBalance: 100, declaredWealthBalance: 100 }]),
      ...buildAssetEvidenceChecks([{ label: "Asset A", statementValue: 100, declaredValue: 120, evidenceRef: "document 1" }]),
    ]);
    expect(summary).toMatchObject({ total: 2, matched: 1, mismatches: 1, evidenceNotProvided: 0 });
  });
});
