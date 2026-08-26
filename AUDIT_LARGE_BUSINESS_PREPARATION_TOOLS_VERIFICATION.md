# Large Business Preparation Tools — Verification Record

**Reviewed:** 26 August 2026  
**Scope:** The Large Business / Industry education section only.

## Delivered Controls

| Control | Implemented boundary |
| --- | --- |
| Internal-role checklist | Six broad, temporary on-screen prompts. Marks are React-only, disappear on refresh, and do not request, store, or send names, company information, records, figures, documents, or filing data. |
| Card filter | A local select control limits the five static cards to registration, filing, or record readiness. It neither persists a choice nor decides whether a business must register or file. |
| Source-review badge | Each industry card shows the existing `26 August 2026` manual review date and explicitly says that the review is manual, not live. |

## Validation Evidence

| Check | Result |
| --- | --- |
| Focused model and UI tests | Passed: 2 files / 30 tests. The tests cover filter categories and outputs, checklist bilingualness and limits, card metadata, and visible boundary copy. |
| Full automated suite | Passed: 20 files / 99 tests. The expected mocked managed-AI upstream error remains covered by its test. |
| Production build | Passed. Vite emitted only its existing main-chunk size advisory. |
| Desktop review | Passed at 1280 × 720. The Urdu-first home screen showed no layout overlap. |
| Mobile review | Passed at 375 × 812. The Urdu-first interface remained readable and touch controls stayed inside the viewport. |

## Retained Limits

The controls are independent education and preparation aids. They do not assign legal responsibility, decide tax treatment, confirm a registration or filing requirement, calculate a deadline, accept records, connect to FBR, or predict an FBR outcome.
