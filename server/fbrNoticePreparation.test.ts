import { describe, expect, it } from "vitest";
import { FBR_NOTICE_PREPARATION_TYPES, FBR_NOTICE_SUPPORT_URL, getNoticeDocumentChecklist, getNoticePreparationSteps } from "../client/src/fbrNoticePreparation.js";

describe("structured FBR-notice preparation guidance", () => {
  it("keeps a bounded set of broad notice categories", () => {
    expect(FBR_NOTICE_PREPARATION_TYPES.map((type) => type.value)).toEqual([
      "unsure",
      "return-or-records",
      "registration-or-iris",
      "wealth-or-reconciliation",
      "other",
    ]);
    expect(new URL(FBR_NOTICE_SUPPORT_URL).hostname).toBe("www.fbr.gov.pk");
  });

  it("uses official verification and escalation rather than deadline or outcome determinations", () => {
    const steps = getNoticePreparationSteps("wealth-or-reconciliation");
    expect(steps.map((step) => step.id)).toContain("verify-current-route");
    expect(steps.map((step) => step.id)).toContain("escalate-uncertainty");
    expect(steps.at(-1)?.label).toMatch(/does not calculate, reconcile, or validate/i);
    expect(getNoticePreparationSteps("unknown").at(-1)?.id).toBe("unsure-boundary");
  });

  it("offers only temporary, broad document-preparation categories", () => {
    const checklist = getNoticeDocumentChecklist("return-or-records");
    expect(checklist).toHaveLength(4);
    expect(checklist.map((item) => item.id)).toContain("notice-copy");
    expect(checklist.at(-1)?.id).toBe("return-records");
    expect(checklist[0]?.label).toMatch(/do not upload it here/i);
    expect(getNoticeDocumentChecklist("unknown").at(-1)?.id).toBe("clarification");
  });
});
