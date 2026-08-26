# Audit Next-Batch Verification

## Scope completed

This release adds three tightly bounded preparation features outside the authored tax-rule engine in `client/src/App.jsx`. The features are a guided official-IRIS navigation walkthrough, a local-only pre-submission error-prevention checklist, and a reviewed official-source update centre.

| Feature | User-facing location | Scope and boundary |
| --- | --- | --- |
| Guided IRIS navigation walkthrough | Tax & investment resources panel | Provides five bilingual, official-link orientation steps. It does not open, control, reproduce, or log into IRIS; it does not collect credentials, CNICs, OTPs, account information, figures, or documents. |
| Pre-submission error-prevention checklist | Tax & investment resources panel | Provides six temporary “pause and recheck” marks. It does not run FBR checks, calculate tax, assess legal completeness, submit a return, or confirm acceptance. Marks are not written to browser storage, an account, or the app database. |
| Official-source update centre | Tax Year 2026 update panel | Provides four bilingual source categories, each linked to FBR. It is explicitly a limited, manually reviewed guide—not a live FBR feed, automatic update checker, complete legal/SRO database, or personal deadline service. |

## Source check

The official FBR filing-guidance, published due-date, and Acts/Rules/Ordinances index destinations were checked on **26 August 2026**. FBR’s filing page describes IRIS as the online portal for filing and presents official filing-help topics; FBR’s due-date page presents general published categories. The application links users to those sources and does not calculate a personal deadline or infer an extension. The update centre directs users to FBR directly for current notices and changes.

## Privacy and decision boundaries

The new client-side controls retain only temporary in-memory boolean marks while the page remains open. They do not add a database field, account-draft field, local-storage key, upload workflow, profile, tax value, identifier, document, notice detail, password, OTP, bank detail, or filing submission pathway. The walkthrough and checklist state explicitly that only official FBR IRIS can show its own current portal validation, e-signing, submission, acknowledgement, and status information.

## Validation record

| Check | Result |
| --- | --- |
| Focused Vitest coverage | Passed: 3 files, 17 tests (`officialResourceHub`, `taxYear2026Update`, and preparation UI wiring). |
| Full automated suite | Passed: 15 files, 61 tests. The managed-AI failure-path test intentionally writes a mocked upstream error to stderr and passes. |
| Production build | Passed. Vite reported only the existing large-chunk advisory. |
| Desktop visual check | Completed at 1280×720. The Urdu-first review journey rendered without a layout error. |
| Mobile visual check | Completed at 375×812. The Urdu-first review journey remained legible and vertically responsive. |

The full-page visual captures intentionally omit non-top fixed controls; focused source-level UI wiring coverage verifies the new panel IDs, bilingual headings, official-source bindings, and stated limitations.
