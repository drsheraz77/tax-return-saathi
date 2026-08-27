# Pilot Feedback Email Contact Verification

**Batch date:** 27 August 2026  
**Scope:** Optional public pilot-feedback contact link, aligned feedback acknowledgement, and public privacy disclosure.

## Implemented contact boundary

The public pilot-feedback route is `mailto:driris@gmail.com?subject=Tax%20Return%20Saathi%20pilot%20feedback`. It is optional and distinct from the existing anonymous in-app feedback form. The relevant feedback form, acknowledgement, official-help copy, and public privacy page all state that email is not anonymous and must not contain tax, identity, financial, credential, notice, or document details.

The existing anonymous in-app feedback path, its fields, retention policy, and deletion schedule were not changed. No email sending, inbox integration, analytics, advertising tag, or new data collection was added.

## Validation evidence

| Check | Result |
| --- | --- |
| Focused privacy-policy contact test | Passed: 1 file / 5 tests, including `mailto` destination and non-anonymous/sensitive-data boundary assertions. |
| Full automated suite | Passed: 20 files / 104 tests. The expected mocked managed-AI upstream error remained covered by its test. |
| Production build | Passed. Vite emitted the known main-chunk size advisory only. |
| Desktop visual check | Passed at 1280 × 720. The compact privacy choice and Quick Tools dock remained separate; no layout overlap occurred. |
| Mobile visual check | Passed at 375 × 812. The compact privacy choice remained legible above the dock, with the dock controls visible and separately tappable. |

## Boundaries

This is a pilot contact convenience, not a secure submission channel, tax-advice service, FBR channel, or personal data intake. The route should be monitored by its owner before it is advertised more widely.
