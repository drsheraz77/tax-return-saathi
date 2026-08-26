# Pilot Feedback Button — Batch Verification

**Reviewed:** 26 August 2026  
**Scope:** A small Urdu-first main-interface entry point for the existing anonymous feedback form.

## Implemented boundary

The main interface now exposes **آزمائشی رائے دیں · Pilot Feedback** below the pilot-testing notice. It sends a browser event only to open and focus the existing Resource Hub feedback card. It does not create another feedback form, introduce analytics, change retention, add account linkage, or add fields.

The existing feedback form remains the sole submission route. It asks visitors not to provide CNIC, NTN, passwords, bank details, tax records, or other sensitive information; it does not request an email or account identity; accepted anonymous feedback remains scheduled for deletion after 30 days.

## Validation record

| Check | Result |
| --- | --- |
| Focused UI wiring | Passed: `server/priorityPreparationUi.test.ts`, 13 tests. The contract checks the Urdu-first button, browser event, existing form focus target, no-account wording, and 30-day retention wording. |
| Full automated suite | Passed: 20 test files / 96 tests. The expected mocked managed-AI upstream error remained covered by its test. |
| Production build | Passed. Vite issued the existing main-chunk size advisory only. |
| Desktop visual review | Passed at 1280 × 720. The compact Pilot Feedback button was visible in the pilot notice strip and did not overlap primary navigation. |
| Mobile visual review | Passed at 375 × 812. The Urdu-first button remained visible and readable above the mobile navigation and privacy notice. |

## Scope limit

This is a product-feedback entry point, not a tax-help channel, account-support inbox, or FBR contact service. It does not provide individual tax advice or a reply channel.
