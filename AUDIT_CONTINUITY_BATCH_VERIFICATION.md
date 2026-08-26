# Audit Continuity Batch Verification

## Completed scope

This batch adds three bilingual preparation-only tools in the supplemental Tax & Investment Resources panel. The original authored tax rules and calculations in `client/src/App.jsx` were not changed.

| Capability | Purpose | Explicit limit |
| --- | --- | --- |
| Complex-situation preparation navigator | Lets a visitor mark only broad situations, such as overseas connections, self-employment, property or investment changes, uncertainty, or an urgent official matter, then directs them to an official FBR channel or qualified help. | It does not determine tax treatment, residence, filing route, eligibility, a deadline, a notice response, or an outcome. |
| Return and wealth-statement relationship guide | Offers four temporary orientation steps for organising private preparation before checking an official workflow. | It is not a wealth statement, reconciliation, calculator, validator, or legal-completeness check. It receives no figures, assets, liabilities, identifiers, records, or documents. |
| Post-submission continuity checklist | Provides temporary reminders to use official IRIS for any acknowledgement or saved-copy route, keep private records, and use official channels for follow-up. | It does not track a return, send reminders, retain copies, inspect portal messages, confirm acceptance, or predict any later outcome. |

## Source and privacy boundary

Each external route used by the complex-situation and post-submission features links to an approved official FBR or IRIS hostname. The related FBR filing-guidance, filing-help, contact, and official IRIS destinations were previously included in the reviewed source set. The release does not describe the FBR workflow as static, real-time, exhaustive, or personally determinative.

All three interfaces use temporary checkbox marks held only while the page remains open. No new local-storage key, account draft field, database field, upload path, scheduled job, tracker, notification, or external data request was added. The controls do not collect or retain tax amounts, CNICs, NTNs, passwords, OTPs, bank or account details, documents, notice text, dates, asset values, or liability values.

## Validation record

| Check | Result |
| --- | --- |
| Focused model and UI wiring coverage | Passed: 2 files, 17 tests. |
| Full automated suite | Passed: 15 files, 65 tests. The managed-AI failure-path test intentionally logs its mocked upstream error and passes. |
| Production build | Passed. Vite reported only the existing large-chunk advisory. |
| Desktop verification | Completed at 1280×720 with the Urdu-first review journey rendered without a layout error. |
| Mobile verification | Completed at 375×812 with the Urdu-first review journey readable and vertically responsive. |

The full-page capture intentionally omits non-top fixed panels. Focused UI-wiring coverage verifies the new expandable panel IDs, data models, privacy limitations, and bilingual text bindings.
