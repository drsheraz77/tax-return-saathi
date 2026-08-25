import { describe, expect, it } from "vitest";
import {
  FEEDBACK_RETENTION_CALLBACK_PATH,
  FEEDBACK_RETENTION_CRON,
  FEEDBACK_RETENTION_DAYS,
  FEEDBACK_RETENTION_JOB_NAME,
  getFeedbackRetentionCutoff,
} from "./feedbackRetentionPolicy";

describe("feedback retention policy", () => {
  it("uses a 30-day cutoff without an in-process timer", () => {
    const now = new Date("2026-08-25T12:00:00.000Z");
    expect(FEEDBACK_RETENTION_DAYS).toBe(30);
    expect(getFeedbackRetentionCutoff(now).toISOString()).toBe("2026-07-26T12:00:00.000Z");
  });

  it("defines a project-level daily UTC Heartbeat callback", () => {
    expect(FEEDBACK_RETENTION_JOB_NAME).toBe("tax-return-saathi-feedback-retention");
    expect(FEEDBACK_RETENTION_CALLBACK_PATH).toBe("/api/scheduled/feedback-retention");
    expect(FEEDBACK_RETENTION_CRON).toBe("0 0 3 * * *");
  });
});
