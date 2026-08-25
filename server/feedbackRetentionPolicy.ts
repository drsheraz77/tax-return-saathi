/** Project-level anonymous feedback retention settings. All cron expressions are UTC. */
export const FEEDBACK_RETENTION_DAYS = 30;
export const FEEDBACK_RETENTION_JOB_NAME = "tax-return-saathi-feedback-retention";
export const FEEDBACK_RETENTION_CALLBACK_PATH = "/api/scheduled/feedback-retention";
export const FEEDBACK_RETENTION_CRON = "0 0 3 * * *";

export function getFeedbackRetentionCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - FEEDBACK_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}
