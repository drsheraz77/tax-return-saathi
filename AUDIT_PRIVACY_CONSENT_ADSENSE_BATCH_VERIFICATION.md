# Privacy, Consent, Pilot Notice, and AdSense-Readiness Batch Verification

**Completed:** 26 August 2026  
**Batch classification:** Public transparency and low-data visitor-control work.  
**Boundary:** This record confirms implemented technical safeguards and documented readiness gaps. It does not certify GDPR compliance, determine a visitor’s legal rights, or predict Google AdSense approval.

| Verification area | Evidence and result |
| --- | --- |
| Pilot transparency | The Urdu-first home page now includes `#pilot-testing-notice`, stating that the independent education/preparation service is under pilot testing, is not FBR, does not submit returns, and does not confirm personal outcomes. |
| Public privacy page | `/privacy` is a standalone direct URL with Urdu as its default language, an English switch, a dated operational review label, account/draft/feedback/AI/retention disclosures, and a return link. |
| Visitor choice | Every public route, including a direct `/privacy` visit, presents the same privacy notice until a visitor chooses. Accept and decline are separate equally available controls. The local browser value only remembers the notice choice; no advertising, analytics, AdSense, vendor, or location data is enabled by either option. |
| Withdrawal | Visitors can reopen or reset the local privacy choice. The browser-only control is explicitly separate from authenticated self-service deletion for a minimal profile or checklist draft. |
| Current third-party disclosure | The policy names Google Fonts, the Tailwind CDN resource, and hosting-platform OAuth. It says no Google Ads, AdSense, or analytics tags are currently run. |
| AdSense assessment | `GOOGLE_ADSENSE_POLICY_READINESS_ASSESSMENT.md` marks the site **not ready to claim AdSense approval readiness**. It identifies a certified CMP/TCF/vendor configuration, controller/contact details, live tag tests, and Google’s own review as unresolved preconditions. |
| Focused tests | Passed: 3 files / 17 tests for the initial public policy, local consent, and panel wiring; then 2 files / 5 tests after ensuring the same notice also mounts on the direct `/privacy` route. |
| Full validation | Passed: 20 test files / 95 tests and production build. The expected mocked managed-AI upstream error remains covered by its existing test. Vite emitted the existing main-chunk-size advisory only. |
| Desktop visual check | Passed: home and direct `/privacy` views rendered at 1280 × 720. |
| Mobile visual check | Passed: 375 × 812 home and direct `/privacy` views; the Urdu-first notice, accept/decline controls, policy title, and policy cards remained readable. |
| Development log review | Current server health and TypeScript are clean. The console history still contains older August 18–19 HMR connection entries and the previously resolved Zod record; neither was reproduced in this batch. |

## Important follow-up before any advertising launch

The global privacy notice was intentionally implemented as a small local preference control because the site is not currently loading advertising or analytics. Google’s current publisher requirements for relevant EEA, UK, and Swiss ad traffic require more than this interface. Before adding any advertising tag, the service owner must complete the remediation sequence in the readiness assessment and obtain appropriate legal and platform guidance. [1] [2]

## References

[1]: https://support.google.com/adsense/answer/13554116?hl=en "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
[2]: https://www.google.com/intl/en_uk/about/company/user-consent-policy-help/ "Help with the EU user consent policy"
