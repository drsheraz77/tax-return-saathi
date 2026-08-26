# Large Business Qualified Escalation Card — Verification

**Batch date:** 26 August 2026  
**Scope:** A bilingual, preparation-only escalation card for complex Large Business / Industry questions.

## Implemented Boundary

The card uses the already-reviewed official FBR contact destination: <https://www.fbr.gov.pk/contact-us/142252/173964>. It directs users with complex, unclear, urgent, audit, demand, court, cross-border, registration, record, or filing questions to the official support route and, where appropriate, a suitably qualified tax or legal professional.

It does **not** collect case details, records, figures, documents, notices, credentials, or identity information. It does **not** interpret law, classify an entity, determine tax treatment or a deadline, draft a response, recommend a named professional, or predict an FBR outcome.

## Validation Record

| Check | Result |
| --- | --- |
| Focused model and UI tests | Passed: 2 files / 32 tests. |
| Full automated suite | Passed: 20 files / 101 tests. The expected mocked managed-AI upstream error remains covered by its existing test. |
| Production build | Passed. The existing main-chunk advisory was emitted, with no build failure. |
| Desktop review | Passed at 1280 × 720; the Urdu-first main interface remained stable. |
| Mobile review | Passed at 375 × 812; the Urdu-first layout remained readable without overlap. |

## Result

This is a narrowly bounded independent education and preparation feature. It does not add a tax-advice service, legal-advice service, professional directory, personal case intake, automated escalation, database record, or external tracking.
