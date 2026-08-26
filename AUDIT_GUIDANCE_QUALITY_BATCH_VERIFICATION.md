# Audit Guidance-Quality Batch Verification

## Delivered capability

This batch adds three bilingual, local-only education controls to the supplemental resource hub:

| Capability | Purpose | Explicit boundary |
| --- | --- | --- |
| Source-aware question planner | Converts one selected broad learning goal into a question a visitor can use when checking an official FBR source. | It does not send a prompt to AI, save a selection, open IRIS, access an account, decide a filing route, calculate a deadline, or determine treatment. |
| Educational calculation-explanation map | Shows a five-step visual review sequence from tax-year awareness through source checking and escalation. | It does not modify the authored calculator, collect amounts, validate categories, calculate a legal result, or confirm FBR acceptance. |
| AI-answer evaluation checklist | Gives visitors temporary checks for tax-year awareness, source distinction, uncertainty, privacy, and escalation. | It does not grade an answer, verify sources, decide whether an answer fits a visitor, or make an answer correct, complete, current, or legally suitable. |

## Privacy and quality alignment

All selection and checkbox state exists only while the page is open. The controls introduce no server request, browser storage, account persistence, upload, identifier, financial input, document, notice text, password, OTP, bank detail, or personal tax data.

The evaluation criteria align with the server-side educational-answer protocol: tax year must be explicit or treated as unknown; uncertainty and source checks are required; rates, deadlines, portal steps, citations, and outcomes must not be fabricated; sensitive identifiers must not be repeated. The UI is an educational cross-check, not a model-quality guarantee.

## Validation record

| Check | Result |
| --- | --- |
| Focused coverage | Passed: 2 files, 20 tests. |
| Full automated suite | Passed: 15 files, 70 tests. The managed-AI failure-path test intentionally emits a mocked upstream error and passes. |
| Production build | Passed. Vite issued only the existing large-chunk advisory. |
| Desktop check | Completed at 1280×720 with the Urdu-first review journey rendered without a visible layout error. |
| Mobile check | Completed at 375×812 with the Urdu-first review journey legible and vertically responsive. |

Full-page captures omit non-top fixed panels by design. Focused source-level tests verify the panel IDs, source-aware model bindings, non-AI boundary, authored-calculator boundary, answer-evaluation boundary, and temporary-state wording.
