import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  deleteFeedbackOlderThan: vi.fn(),
  getFeedbackRetentionScheduleByTaskUid: vi.fn(),
}));

const sdkMocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./_core/sdk", () => ({ sdk: sdkMocks }));

import { feedbackRetentionHandler } from "./feedbackRetention";

function createResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

describe("feedback retention scheduled handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rejects requests that were not authenticated as a scheduled callback", async () => {
    sdkMocks.authenticateRequest.mockResolvedValue({ isCron: false });
    const response = createResponse();

    await feedbackRetentionHandler({ path: "/api/scheduled/feedback-retention" } as any, response as any);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: "cron-only" });
    expect(dbMocks.getFeedbackRetentionScheduleByTaskUid).not.toHaveBeenCalled();
    expect(dbMocks.deleteFeedbackOlderThan).not.toHaveBeenCalled();
  });

  it("safely skips an orphaned scheduled task without deleting feedback", async () => {
    sdkMocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "orphaned-task" });
    dbMocks.getFeedbackRetentionScheduleByTaskUid.mockResolvedValue(undefined);
    const response = createResponse();

    await feedbackRetentionHandler({ path: "/api/scheduled/feedback-retention" } as any, response as any);

    expect(response.json).toHaveBeenCalledWith({ ok: true, skipped: "orphaned-schedule", taskUid: "orphaned-task" });
    expect(dbMocks.deleteFeedbackOlderThan).not.toHaveBeenCalled();
  });

  it("uses the configured cron task to delete only feedback older than the 30-day cutoff", async () => {
    sdkMocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "WyMJgToQhruqBwBxcPryWd" });
    dbMocks.getFeedbackRetentionScheduleByTaskUid.mockResolvedValue({ retentionDays: 30 });
    dbMocks.deleteFeedbackOlderThan.mockResolvedValue(2);
    const response = createResponse();

    await feedbackRetentionHandler({ path: "/api/scheduled/feedback-retention" } as any, response as any);

    expect(dbMocks.getFeedbackRetentionScheduleByTaskUid).toHaveBeenCalledWith("WyMJgToQhruqBwBxcPryWd");
    expect(dbMocks.deleteFeedbackOlderThan).toHaveBeenCalledWith(new Date("2026-07-26T12:00:00.000Z"));
    expect(response.json).toHaveBeenCalledWith({
      ok: true,
      taskUid: "WyMJgToQhruqBwBxcPryWd",
      retentionDays: 30,
      cutoff: "2026-07-26T12:00:00.000Z",
      deleted: 2,
    });
  });
});
