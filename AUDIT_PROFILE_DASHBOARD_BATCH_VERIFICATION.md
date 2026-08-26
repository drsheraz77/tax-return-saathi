# Audit Profile Dashboard Batch Verification

## Delivered capability

This release expands the approved taxpayer-preferences profile without adding a field, data store, server procedure, or tracking mechanism. It adds three bilingual user-facing improvements:

| Capability | Behaviour | Boundary |
| --- | --- | --- |
| My preparation route | A signed-in profile holder sees existing reviewed FBR learning cards ordered only from the five approved preference values. | It does not determine tax, filing, a personal deadline, legal treatment, or an FBR outcome. |
| First-time preparation route | Any visitor—including a visitor with no account or profile—can see a three-step public route to IRIS orientation, private preparation, and published date categories. | It does not collect data, create an account, open IRIS, calculate tax, or choose a filing route. |
| Why these resources? | Profile holders can see the limited preference-to-card explanation and retain the existing edit/delete controls. | The explanation does not profile behaviour, infer financial/identity information, or share preferences. |

## Data and source boundary

The dashboard reads only the existing approved enum-only profile payload: language, tax-year context, broad preparation paths, filing familiarity, and resource order. It uses reviewed starter-catalogue source cards and direct official FBR links. It adds no client storage, database field, analytics event, source request, AI request, tax value, identity value, document, credential, notice, or financial information.

Complex preparation paths or an other/unsure year context can add an official laws-index card as an educational escalation starting point; this does not infer a tax position or determine rules for another year.

## Validation record

| Check | Result |
| --- | --- |
| Focused coverage | Passed: 2 files, 11 tests covering first-time route, approved-preference ordering, laws-index escalation, and static UI boundaries. |
| Full automated suite | Passed: 18 files, 81 tests. The managed-AI failure-path test intentionally logs a mocked upstream error and passes. |
| Production build | Passed. The deferred profile panel is 42.09 kB before gzip; the known main-chunk advisory remains. |
| Desktop check | Completed at 1280×720; Urdu-first review interface and the **My preferences** launch control were visible. |
| Mobile check | Completed at 375×812; the **My preferences** launch control remained visible above the other fixed guidance controls. |

Full-page panel content was not opened in the anonymous screenshot; focused source-level UI wiring and model tests verify the dashboard, public fallback route, and preference-use explanatory controls.
