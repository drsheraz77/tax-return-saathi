# Return-Review Failure Repair Verification — 16 September 2026

## Investigation boundary

The reported upload was **not** opened, downloaded, retained, or used for testing. Investigation used source review, non-sensitive production diagnostics, unit tests, and a synthetic text-only managed-AI request. Recent production logs did not expose a recoverable request-level error record and were not used to retrieve document content or visitor details.

The review UI parses an AI result as JSON. The managed proxy previously capped all responses at 2,000 tokens while the configured multimodal model can consume part of that budget before emitting the JSON response. This could make a complex PDF/photo review more likely to return incomplete JSON and fall into the generic “Analysis failed” state. The exact submitted file was not examined, so this is a **request-hardening diagnosis**, not an assertion about its contents.

## Repair

The return-review request now asks for a strict `return_review` JSON schema and increases the bounded proxy response limit to 4,096 tokens. The server validates and forwards only recognized response-format fields; it does not alter document conversion, storage, retention, or logging. The client also checks the HTTP status before parsing the result. The established redaction warning, no-persistence boundary, safe tax-education framing, and user-visible generic error remain intact.

## Verification

| Check | Result |
|---|---|
| Synthetic endpoint probe | Local managed-AI proxy returned the complete schema-valid JSON structure with `stop_reason: "stop"` and HTTP 200. No user file or personal content was included. |
| Focused regression tests | Passed: 4 files / 12 tests covering proxy forwarding, strict schema request, redaction guidance, and existing review-first boundaries. |
| Full test suite | Passed: 23 files / 116 tests. The controlled managed-AI failure-path test emitted its expected log only. |
| Production build | Passed. The existing Vite large-chunk advisory is not a build failure. |
| Responsive UI check | The unchanged review interface remained readable at 1280 × 720 and 375 × 812. |
| Production diagnostics | Latest privacy-safe filtered records contained no new server error signature after the repair; no uploaded file was inspected. |

## User follow-up

The repair is designed to prevent the common incomplete-structured-response path. After publication, the visitor may retry only their already-redacted document. If it still fails, they should not share the document or tax details in chat; the generic error can be investigated from server diagnostics only.
