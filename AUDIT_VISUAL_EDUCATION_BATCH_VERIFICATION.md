# Audit Visual Education Batch Verification

## Delivered capability

This batch adds three bilingual educational features to the deferred Tax Year panel. All use the existing reviewed starter catalogue and do not alter the authored calculator, tax rules, profile schema, server data, or account controls.

| Capability | Behaviour | Boundary |
| --- | --- | --- |
| Source-linked topic briefs | Four brief cards explain the limited use of IRIS orientation, private-record preparation, published due-date categories, and the official laws index. Each card links to the corresponding reviewed FBR source and shows the source review label. | The cards are not an exhaustive legal database, source interpretation, or personalised advice. |
| Visual preparation journey | A five-step visual map moves from choosing a broad topic to using official/qualified escalation. | It is not an IRIS workflow, tax calculation, filing route, eligibility decision, or FBR result. |
| General planning reflection | A temporary local selector shows one of three broad questions and the related official source. | The selection is not sent or saved; it does not accept records, figures, identity, documents, or generate personalised planning advice. |

## Source, privacy, and decision boundary

Every topic brief and planning reflection references an existing item in the reviewed FBR starter catalogue. No new FBR factual rule, rate, deadline, or legal interpretation is created. The only new local state is the currently selected broad planning reflection; it disappears when the page closes and is never sent to a server, browser storage, account, analytics system, AI system, or database.

The content directs unclear, urgent, foreign, notice, audit, demand, or court matters toward official FBR routes or qualified help. It does not determine a personal filing route, tax treatment, extension, notice response, or outcome.

## Validation record

| Check | Result |
| --- | --- |
| Focused coverage | Passed: 2 files, 15 tests covering source links, bounded briefs, visual-map escalation, local non-personal reflections, and panel wiring. |
| Full automated suite | Passed: 18 files, 84 tests. The managed-AI failure-path test intentionally logs a mocked upstream error and passes. |
| Production build | Passed. The Tax Year panel remains deferred; Vite reported only the existing main-chunk-size advisory. |
| Desktop check | Completed at 1280×720 with the Urdu-first review journey rendered without a visible layout error. |
| Mobile check | Completed at 375×812 with the Urdu-first review journey readable and vertically responsive. |

Full-page screenshots intentionally omit non-top fixed supplemental panels. Focused source-level UI wiring and model coverage verify the new brief, visual-journey, and planning-reflection containers plus their stated boundaries.
