# First-Party Aggregate Visitor Counter Verification — 30 August 2026

## Intended boundary

The feature records a single **aggregate browser-session signal** for a UTC day only after a visitor expressly accepts visitor measurement. The application database table has only a UTC day and a non-negative total. It stores no IP address, cookie value, account ID, page URL, tax/form information, documents, feedback, free text, or individual visitor record. The protected owner screen describes the result as approximate; it is not a unique-visitor count.

## Initial preview observations

At the public landing page, the Urdu-first visitor-measurement notice appeared before any choice. The notice stated that optional Google Analytics and the aggregate first-party count require explicit approval, and the public page did not expose owner summary content. Recent preview-network records contained no matching aggregate-recorder or Google tag request before approval.

After the explicit Urdu approval action, the notice closed and the ordinary public interface remained available. Additional recorder and database checks are recorded below when validation is complete.

The browser then confirmed the consent value `accepted_optional`, the local session-only duplicate guard `true`, and exactly one resource request to the aggregate recorder. This confirms the recorder was reached after approval without sending a payload containing visitor metadata.

The managed preview’s authenticated owner session opened `/owner-visitor-summary` and displayed a seven-day UTC table with the single consented test signal. The page labels the value as an approximate aggregate rather than a unique-person count. A request to the correct `visitorAnalytics.weeklySummary` procedure with `credentials: "omit"` returned HTTP 403 (`FORBIDDEN`), confirming that the aggregate query is not publicly readable.

## Automated and layout verification

| Check | Result |
|---|---|
| Database migration | Reviewed additive `daily_visitor_aggregates` table applied successfully; it contains only `day` and `pageViews` plus timestamps. |
| Focused coverage | Passed: `visitorAnalytics`, `privacyConsent`, and `privacyPolicyUi` — 3 files / 13 tests. |
| Full test suite | Passed: 21 files / 111 tests. The expected managed-AI failure-path test emitted its controlled log message only. |
| Production build | Passed. Vite reported its existing large-chunk advisory, not a build failure. |
| Desktop layout | Checked at 1280 × 720. The Urdu-first consent panel remained readable above, not within, the existing quick-tools dock. |
| Mobile layout | Checked at 375 × 812. The consent panel remained readable and did not cover the quick-tools dock. |

## Delivery decision

At the owner’s direction, this release contains **no automated email**, scheduled job, email provider integration, or background worker. The owner can view the dashboard at `/owner-visitor-summary` while authenticated as the project owner and may manually email any aggregate result. The page exposes only the last seven UTC-day total and seven daily aggregate values.
