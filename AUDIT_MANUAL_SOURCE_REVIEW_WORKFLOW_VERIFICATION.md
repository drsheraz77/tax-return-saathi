# Manual Source-Review Workflow and Escalation Cards Verification

**Batch date:** 26 August 2026  
**Scope:** Low-data, bilingual source governance only.

## Implemented scope

| Capability | Delivered boundary |
| --- | --- |
| Dated manual-review workflow | Shows the next manual review date, a quarterly manual cadence, four review steps, and exactly four fixed FBR destinations. It is an accountability aid, not live monitoring or an automated source-change detector. |
| Quarterly reminder | A repeating Asia/Karachi prompt runs at 04:00 on the 26th day of February, May, August, and November. It asks for a concise manual review report only and cannot edit or publish the website automatically. |
| Urdu-first escalation cards | Five broad, Urdu-first cards route urgent notices, cross-border/residency questions, business changes, property/investment changes, and unclear routes to the approved FBR contact page or qualified assistance. |

## Non-negotiable limits

The feature stores no visitor inputs and makes no personal tax, legal, deadline, filing, eligibility, IRIS-status, notice-response, or FBR-outcome determination. It does not scrape, monitor, or claim to detect changes in the source pages. The review remains limited to the official FBR filing guidance, due-date categories, legal-material index, and contact route.[1][2][3][4]

## Verification checklist

| Check | Result |
| --- | --- |
| Focused workflow and panel tests | Passed: 2 files / 18 tests. |
| Full automated suite | Passed: 18 files / 89 tests. The expected managed-AI mock upstream error remained covered by its test. |
| Production build | Passed. Vite emitted the existing main-chunk size advisory only. |
| Desktop visual check | Passed at 1280 × 720; the Urdu-first home screen remained legible with no visible overlap. |
| Mobile visual check | Passed at 375 × 812; the Urdu-first mobile layout remained readable and the fixed control stayed within the viewport. |
| Current source-governance scope | No database schema, tRPC procedure, profile field, source expansion, or visitor-data persistence added. |

## References

[1]: https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158 "FBR filing guidance"
[2]: https://www.fbr.gov.pk/categ/income-tax-due-dates/51147/40846/81148 "FBR income-tax due dates"
[3]: https://www.fbr.gov.pk/act-rules-ordinances/131226 "FBR Acts, Rules, and Ordinances index"
[4]: https://www.fbr.gov.pk/contact-us/142252/173964 "FBR contact route"
