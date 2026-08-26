# Governed Taxpayer Preparation Profile: Implementation Verification

## Approved implementation delivered

The optional **My preparation preferences** panel is now available as a deferred supplemental account feature. It creates a single account-owned, versioned preparation-preferences payload only after a signed-in visitor explicitly opts in. The implementation matches the approved scope exactly:

| Field | Allowed values | Use |
| --- | --- | --- |
| Preferred language | Urdu or English | Preference panel language. |
| Tax-year context | Tax Year 2026 or other/unsure | Link to reviewed educational source scope only. |
| Broad preparation paths | Existing allow-listed paths; maximum seven | Organise existing learning and preparation tools. |
| Filing familiarity | First time, filed before, or unsure | Adjust educational ordering only. |
| Resource order | Guided, review-first, or source-first | Choose the order of existing resources. |

The profile is optional. Visitors may continue without one, and the public educational interface remains usable without sign-in. The profile does not create an FBR/IRIS account, file a return, calculate tax or a deadline, check a return, identify a notice, determine treatment, or predict an outcome.

## Privacy and ownership controls

The database migration creates the non-destructive, account-owned `taxpayer_profiles` table with cascade deletion on the existing user relation. Strict server-side schemas accept only the approved enum-only payload and reject unknown keys, identifiers, tax amounts, financial details, documents, credentials, free text, and other unapproved fields. The browser never supplies an owner ID; protected procedures derive ownership from the authenticated user context for every read, create, update, and delete.

The panel contains explicit Urdu/English opt-in wording, a no-profile continuation route, a view/edit flow, and permanent self-service profile deletion that requires the exact confirmation phrase. It explains that the separate checklist draft is not deleted with the profile. No browser-storage key, file upload, client secret, notification, analytics event, or AI request was introduced.

## Migration and test evidence

| Check | Result |
| --- | --- |
| Database migration | Generated as `drizzle/0003_careless_moonstone.sql`, reviewed, and applied as a non-destructive table creation with account ownership and cascade deletion. |
| Focused profile coverage | Passed: 3 files, 16 tests covering profile payload/consent rejection, forbidden fields, authenticated ownership, cross-user boundary, deletion confirmation, and UI boundary copy. |
| Full suite | Passed: 17 files, 77 tests. The managed-AI failure-path test intentionally logs a mocked upstream error and passes. |
| Production build | Passed. The profile panel is emitted as its own deferred 29 kB JavaScript asset. Vite still reports the existing main-chunk advisory. |
| Desktop visual check | Completed at 1280×720; Urdu-first review interface and **My preferences** launch control were visible. |
| Mobile visual check | Completed at 375×812. The profile launch control was raised above the other fixed guidance controls and remained visible and legible. |

## Remaining operational control

The approved 180-day inactivity review/deletion concept has **not** been implemented. It remains subject to the separate platform-managed scheduling, deletion verification, backup alignment, user notice, and failure-handling design required in the governed profile document. Until that additional work is approved, the current supported retention mechanism is user-initiated permanent profile deletion.
