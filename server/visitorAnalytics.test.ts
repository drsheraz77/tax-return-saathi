import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const user = {
  id: 7,
  openId: "aggregate-test-user",
  email: null,
  name: null,
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const admin = { ...user, id: 1, openId: "aggregate-test-owner", role: "admin" as const };
const context = (currentUser: typeof user | typeof admin | null) => ({ user: currentUser, req: {} as any, res: { clearCookie: vi.fn() } as any });

describe("consent-gated first-party aggregate visitor analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T11:45:00.000Z"));
  });

  it("records only a server-generated UTC day with no browser-supplied analytics payload", async () => {
    dbMocks.recordAggregateVisitorPageView.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(context(null) as any);

    await expect(caller.visitorAnalytics.recordConsentedVisit()).resolves.toEqual({ recorded: true });
    expect(dbMocks.recordAggregateVisitorPageView).toHaveBeenCalledWith("2026-08-30");
  });

  it("returns a seven-day aggregate only to an authenticated administrator and pads empty days", async () => {
    dbMocks.getAggregateVisitorDays.mockResolvedValue([
      { day: "2026-08-24", pageViews: 4 },
      { day: "2026-08-27", pageViews: 2 },
    ]);
    const caller = appRouter.createCaller(context(admin) as any);

    await expect(caller.visitorAnalytics.weeklySummary()).resolves.toEqual({
      fromDay: "2026-08-24",
      throughDay: "2026-08-30",
      totalPageViews: 6,
      days: [
        { day: "2026-08-24", pageViews: 4 },
        { day: "2026-08-25", pageViews: 0 },
        { day: "2026-08-26", pageViews: 0 },
        { day: "2026-08-27", pageViews: 2 },
        { day: "2026-08-28", pageViews: 0 },
        { day: "2026-08-29", pageViews: 0 },
        { day: "2026-08-30", pageViews: 0 },
      ],
    });
    expect(dbMocks.getAggregateVisitorDays).toHaveBeenCalledWith("2026-08-24", "2026-08-30");

    const nonAdminCaller = appRouter.createCaller(context(user) as any);
    await expect(nonAdminCaller.visitorAnalytics.weeklySummary()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps the browser recorder consent-gated, session-deduplicated, and free of request metadata", async () => {
    const source = await import("../client/src/FirstPartyVisitorAggregate.jsx?raw");
    expect(source.default).toContain('choice !== PRIVACY_CONSENT_CHOICES.accepted');
    expect(source.default).toContain("VISIT_RECORDED_SESSION_KEY");
    expect(source.default).toContain("recordConsentedVisit.useMutation");
    expect(source.default).not.toMatch(/fetch\(|window\.location|document\.location|navigator\./);
    expect(source.default).not.toMatch(/ipAddress|userId|pageUrl|feedbackMessage|taxAmount/);
  });
});
