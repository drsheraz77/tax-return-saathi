# Audit Low-Data Discovery Batch Verification

## Delivered capability

This release builds the next layer of the safe educational content architecture. The Tax Year panel now includes a temporary **local knowledge-topic finder**, four broad-goal learning paths, and reusable bilingual educational cards that bind every result to a reviewed source, review date, scope limitation, and related preparation action.

The finder searches only the four reviewed starter catalogue records already loaded into the page. The guided learning paths let a visitor select a broad educational aim—IRIS orientation, return and private-record preparation, published date categories, or a complex question—and then show the linked official source and existing preparation action.

## Privacy and decision boundaries

No search term, selected path, account status, document, identity, amount, bank detail, or tax information is sent to a server, saved to browser storage, or retained by the application. The learning paths do not create an IRIS account, operate IRIS, calculate a deadline or tax, verify records, interpret law, decide a filing route, determine treatment, or replace qualified advice.

## Validation record

| Check | Result |
| --- | --- |
| Focused coverage | Passed: 2 files, 9 tests. Coverage confirms in-memory filtering, source-bound learning paths, and static UI privacy wording. |
| Full automated suite | Passed: 15 files, 67 tests. The managed-AI failure-path test intentionally logs a mocked upstream error and passes. |
| Production build | Passed. Vite emitted only the existing large-chunk advisory. |
| Desktop check | Completed at 1280×720; the Urdu-first review journey rendered without a visible layout error. |
| Mobile check | Completed at 375×812; the Urdu-first review journey remained readable and vertically responsive. |

Full-page captures omit non-top fixed panels by design. The focused UI-wiring tests verify the topic finder, its local-only boundary, learning-path container, and non-sensitive input limit.
