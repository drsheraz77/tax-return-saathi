import type { Request, Response } from "express";
import { deleteFeedbackOlderThan, getFeedbackRetentionScheduleByTaskUid } from "./db";
import { getFeedbackRetentionCutoff } from "./feedbackRetentionPolicy";
import { sdk } from "./_core/sdk";

/** Platform-only Heartbeat callback. It is safe to retry because expiry deletion is idempotent. */
export async function feedbackRetentionHandler(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req as unknown as Request);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }
    taskUid = user.taskUid;
    const schedule = await getFeedbackRetentionScheduleByTaskUid(taskUid);
    if (!schedule) {
      return res.json({ ok: true, skipped: "orphaned-schedule", taskUid });
    }

    const cutoff = getFeedbackRetentionCutoff();
    const deleted = await deleteFeedbackOlderThan(cutoff);
    return res.json({
      ok: true,
      taskUid,
      retentionDays: schedule.retentionDays,
      cutoff: cutoff.toISOString(),
      deleted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[FeedbackRetention] Scheduled cleanup failed", { taskUid, message });
    return res.status(500).json({
      error: message,
      context: { path: req.path, taskUid: taskUid ?? null },
      timestamp: new Date().toISOString(),
    });
  }
}
