# Google AdSense Policy-Readiness Assessment

**Assessment date:** 26 August 2026  
**Scope:** Public site controls and code reviewed in this batch, including the pilot notice, privacy page, consent interface, and visible third-party references. This is **not legal advice, a certification, an account review, or a prediction of Google approval**.

## Bottom line

> **Current readiness: not ready to claim AdSense approval readiness.** The site does not presently load Google Ads, AdSense, or analytics tags, and the new visitor notice is deliberately only a local privacy-preference control. It is not a Google-certified CMP and does not supply the TCF, vendor, or account configuration required before serving relevant ads to people in the EEA, UK, or Switzerland. [1] [2]

The public-facing safeguards are materially clearer after this release: the interface now names its pilot and independent-service status, has a direct `/privacy` page, describes current operational data categories and retention, gives a refusal/revisit control for the local preference, and avoids advertising-like calls to action. These are useful readiness improvements, but they do not resolve account-side, legal-controller, or ad-technology obligations.

| Policy and operational area | Evidence reviewed | Status | Required operator action before monetisation |
| --- | --- | --- | --- |
| Google-certified consent management | No AdSense, Google Privacy & Messaging, or IAB TCF CMP configuration is present. The page itself says its local control is not a Google-certified CMP. | **Blocked** | Select and configure an eligible Google-certified CMP or the applicable Google Privacy & Messaging solution for relevant traffic, including the required TCF and vendor settings. [1] |
| EEA/UK/Switzerland advertising consent | The local notice has equally visible accept and decline actions, starts without an optional choice, and allows changes. It does not send consent signals to an advertising provider because no advertising provider is enabled. | **Partial; not AdSense-ready** | Before ads run, implement the applicable consent signal, disclosure, withdrawal, and tag-blocking behaviour; test it in each relevant jurisdiction. [1] [2] |
| Public privacy information | `/privacy` now describes temporary browser choices, optional account-held drafts/preferences, anonymous feedback, 30-day feedback deletion, AI-request limits, and the absence of current AdSense/analytics tags. | **Partial** | Publish the actual controller identity and a monitored public privacy contact. Obtain advice on lawful basis, rights handling, representative/DPO requirements, and the precise final notice for the places reached. [7] |
| Third-party disclosure | The policy names Google Fonts, the Tailwind CDN resource, and hosting-platform OAuth. The site has no advertising vendor list because ads are not enabled. | **Partial** | Re-check all deployed third parties, cookies, SDKs, and tags at the time of launch; disclose the final set and apply the necessary regional controls. Consider locally served styling assets where appropriate. |
| Content integrity and affiliation | The pilot notice and existing FBR-independent, education-only wording reduce the risk of misleading affiliation or outcome claims. | **Partial** | Conduct a page-by-page editorial review before application, including every calculator, AI response path, source card, link, and future monetised page. Google independently applies its publisher policies. [3] |
| Ad implementation, clicks, and traffic | No AdSense code, ad slots, click encouragement, or incentivised traffic design was found in the reviewed client source. | **Not yet assessable** | Do not add ads, ad-like controls, click prompts, redirects, or paid/incentivised traffic until consent and account requirements are completed; then re-test rendered pages. [4] |
| Account, ownership, and live review | This review has no access to the user’s AdSense account, identity/ownership verification, payment profile, domain verification, traffic quality, ad inventory, or Google’s decision process. | **Outside scope** | Complete Google’s own account and site-review process and treat any Google feedback as authoritative. |

## Verified release safeguards

The release gives every visitor a visible Urdu-first privacy choice rather than using location detection. Its decline action is equally available, no optional choice is preselected, and the stored value only records the displayed notice preference in that browser. The public policy states that this is not a certification or certified CMP. This is aligned with general consent-interface principles for non-essential device storage, but it does **not** establish GDPR compliance on its own. [5] [6]

The product also retains its independent-service boundary. It identifies itself as a pilot educational and preparation service, not an FBR service; it does not present itself as filing a return, reproducing FBR checks, or confirming a personal result. Google’s publisher policies prohibit misleading representations and deceptive practices, so this boundary should continue to be reviewed whenever copy or monetisation changes. [3]

## Required remediation sequence

Before applying to or enabling AdSense, the service owner should first appoint and publish a responsible privacy contact and verify controller information. Next, the owner should select and configure the appropriate certified consent solution for the actual advertising and analytics vendors, block those tags until the applicable choice is honored, and test acceptance, refusal, withdrawal, and consent-signal behaviour. The privacy page must then be updated to match the precise cookies, vendors, transfers, retention, and contact mechanisms that are actually live.

Only after those steps should the owner conduct a complete content, navigation, and advertising-layout review across the live domain, including the `/privacy` route, mobile layouts, AI outputs, external links, and every page that could display ads. A final Google account review remains necessary; this assessment cannot replace it.

## References

[1]: https://support.google.com/adsense/answer/13554116?hl=en "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
[2]: https://www.google.com/intl/en_uk/about/company/user-consent-policy-help/ "Help with the EU user consent policy"
[3]: https://support.google.com/adsense/answer/10502938?hl=en "Google Publisher Policies"
[4]: https://support.google.com/adsense/answer/48182?hl=en "AdSense Program policies"
[5]: https://commission.europa.eu/cookies-policy_en "European Commission cookies policy"
[6]: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ "ICO cookies and similar technologies guidance"
[7]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/ "ICO privacy information guidance"
