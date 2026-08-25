# Feedback Retention and Upload-Disclosure Verification

## Scope

This record covers the approved **30-day anonymous-feedback deletion process** and the narrow bilingual disclosure beside the notice-upload control. It does not change, interpret, or verify the authored FBR tax rules, calculations, or filing algorithm.

## Retention implementation

| Item | Verified implementation |
| --- | --- |
| Retention period | Anonymous feedback older than **30 days** is eligible for deletion. |
| Cleanup predicate | The database helper uses a strict `createdAt < cutoff` comparison, so feedback exactly at the cutoff is not deleted in that run. |
| Scheduler | A project-level Heartbeat job calls the deployed endpoint daily at **03:10 UTC** using the six-field UTC cron expression `0 10 3 * * *`. |
| Callback | `POST /api/scheduled/feedback-retention` is cron-only, identifies its durable configuration by task UID, and returns an orphaned task as a successful no-op. |
| Task identifier | `WyMJgToQhruqBwBxcPryWd` (job name: `tax-return-saathi-feedback-retention`). |
| Retry behaviour | Expiry deletion is idempotent: repeating the callback can safely attempt the same strict, age-based deletion. |

The schedule configuration is stored in the `feedbackRetentionSchedules` table, while the deletion process operates on the existing anonymous-feedback timestamps. It neither creates nor links feedback to a user account.

The project-level scheduler was listed on 25 August 2026 with exactly one active job: `tax-return-saathi-feedback-retention`, `POST /api/scheduled/feedback-retention`, cron `0 10 3 * * *`, and task UID `WyMJgToQhruqBwBxcPryWd`. No duplicate task was created.

## Validation evidence — 25 August 2026

| Check | Result |
| --- | --- |
| Automated tests | `pnpm test` passed: **8 files, 32 tests**. This includes cron-only rejection, orphan safety, trusted task configuration, and the fixed 30-day cutoff. |
| Production build | `pnpm build` completed successfully. The only output was the existing client-chunk size advisory. |
| English upload disclosure | Managed preview showed the disclosure directly beneath the notice file input. It names the server-side managed AI pathway, the app-database non-persistence boundary, educational/non-binding scope, and prohibited sensitive data. |
| English privacy view | Managed preview showed the revised upload/data-use section with the same managed-pathway, non-binding, and sensitive-data warnings. |
| Urdu privacy view | Managed preview showed the corresponding Urdu safety and non-binding disclosure. |
| Urdu upload disclosure | Managed preview showed the same disclosure directly beneath the Urdu notice file input. |
| Resource hub retention notice | The open resource hub showed its anonymous-feedback privacy wording, including that accepted anonymous feedback is scheduled for deletion after 30 days. |

No claim is made here about an AI provider's own retention, data residency, cross-border transfers, encryption, or legal compliance. The wording is limited to application behaviour that this project controls and verifies.

## Deployment follow-up

The next checkpoint should publish the final inline upload wording and this verification record. The existing job should be observed through its scheduled execution history after the published callback next runs; no duplicate job should be created.
