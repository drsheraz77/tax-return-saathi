import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getChecklistDraftForUser: vi.fn(),
  saveChecklistDraftForUser: vi.fn(),
  deleteChecklistDraftForUser: vi.fn(),
  createFeedbackSubmission: vi.fn(),
  getTaxpayerProfileForUser: vi.fn(),
  createTaxpayerProfileForUser: vi.fn(),
  updateTaxpayerProfileForUser: vi.fn(),
  deleteTaxpayerProfileForUser: vi.fn(),
  recordAggregateVisitorPageView: vi.fn(),
  getAggregateVisitorDays: vi.fn(),
}));

const notificationMocks = vi.hoisted(() => ({
  notifyOwner: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/notification", () => notificationMocks);

import { appRouter } from "./routers";

const context = { user: null, req: {} as any, res: { clearCookie: vi.fn() } as any };
const safeFeedback = {
  category: "technical" as const,
  message: "The resource link did not open in my browser.",
};

describe("feedback owner notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.createFeedbackSubmission.mockResolvedValue(undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it("notifies the owner only after saving, with an operational payload that excludes submitted feedback data", async () => {
    notificationMocks.notifyOwner.mockResolvedValue(true);
    const caller = appRouter.createCaller(context as any);

    await expect(caller.feedback.submit(safeFeedback)).resolves.toEqual({
      success: true,
      acknowledgement: "Thank you. Your feedback was received without account or contact information.",
    });
    expect(dbMocks.createFeedbackSubmission).toHaveBeenCalledWith(safeFeedback);
    expect(notificationMocks.notifyOwner).toHaveBeenCalledWith({
      title: "New anonymous pilot feedback",
      content: "A new anonymous feedback entry was received. This operational alert includes no feedback content or visitor details.",
    });
    expect(notificationMocks.notifyOwner.mock.calls[0][0]).not.toContain(safeFeedback.message);
    expect(notificationMocks.notifyOwner.mock.calls[0][0]).not.toContain(safeFeedback.category);
  });

  it("preserves the visitor acknowledgement when the owner notification service is unavailable", async () => {
    notificationMocks.notifyOwner.mockRejectedValue(new Error("notification service unavailable"));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const caller = appRouter.createCaller(context as any);

    await expect(caller.feedback.submit(safeFeedback)).resolves.toMatchObject({ success: true });
    expect(dbMocks.createFeedbackSubmission).toHaveBeenCalledWith(safeFeedback);
    expect(notificationMocks.notifyOwner).toHaveBeenCalledTimes(1);
  });
});
