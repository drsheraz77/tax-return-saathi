# Privacy, Consent, and AdSense Research Record

**Research date:** 26 August 2026  
**Use:** Implementation and readiness assessment only; not legal advice or a guarantee of regulatory or Google approval.

## Official findings to apply

| Topic | Recorded official finding | Product implication |
| --- | --- | --- |
| Google publisher consent | Google states that AdSense publishers serving personalised ads to people in the EEA and UK must use a Google-certified CMP integrated with IAB TCF; the same requirement applies to Switzerland. [1] | A custom local accept/decline banner alone cannot be represented as an AdSense-ready CMP. Do not install AdSense tags until a certified CMP or Google Privacy & Messaging implementation is chosen and configured. |
| Google EU User Consent Policy | Google says the policy applies to end users in the EEA, UK, and Switzerland. Its checklist includes clear data-use and third-party disclosures, affirmative action, a visible Google data-use link, consent signals, consent for cookies when required, and equally easy withdrawal. [2] | The site can provide a clear local consent preference and a withdrawal route, but account-side CMP, TCF, vendor, and tag configuration remain a prerequisite for advertising. |
| AdSense policy baseline | Google Publisher Policies cover content, behaviour, privacy, and other requirements. They prohibit misleading representations, deceptive practices, and content that falsely implies affiliation or endorsement. [3] | Keep the independent-service and pilot notices prominent; retain existing FBR non-affiliation, educational, and no-outcome boundaries. |
| AdSense site and traffic behaviour | Google’s AdSense Program policies prohibit invalid clicks, encouraging clicks, and deceptive navigation; sites showing ads should be easy to navigate and must not use unwanted redirects, downloads, malware, or obstructive pop-ups. [4] | No AdSense code, click encouragement, incentivised traffic, or ad-like navigation may be added in this batch. The current consent notice must not be designed to disguise advertising or interfere with navigation. |
| Visitor consent and device storage | The European Commission describes presenting visitors with accept or refuse choices for cookies, while the ICO says consent for non-essential cookies or similar device storage must be active, clear, informed, and not pre-set before consent. [5] [6] | The site will not set an optional advertising or analytics preference by default. A locally stored choice will be limited to remembering the visitor’s privacy-notice choice and must remain easy to change. |
| Privacy information and withdrawal | The ICO’s privacy-information guidance includes contact details, processing purposes, recipients, retention, rights, complaint route, and an equally easy consent-withdrawal route where consent applies. [7] | The public privacy page will identify current data categories and retention, explain optional preference withdrawal, separate account-data deletion from browser-only controls, and name the contact route; it will not invent a DPO, EU representative, or advertising vendor that is not in use. |

## Fixed implementation boundaries

The website currently does not load Google advertising or analytics tags. The proposed interface will be a **privacy preference notice**, not a claim of GDPR certification or a substitute for a Google-certified CMP. It will store only the local consent choice necessary to avoid showing the notice repeatedly, will offer an equally prominent decline action, and will include a clear means to revisit that choice.

The completed readiness assessment must state that Google and regulators make independent determinations. Before any AdSense deployment, the operator needs to configure an eligible consent-management solution for relevant locations, update third-party/cookie disclosures to match the actual technology used, ensure tags honor user choices, verify advertising account and site ownership requirements, and re-review every monetised page.

## Sources

[1]: https://support.google.com/adsense/answer/13554116?hl=en "Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)"
[2]: https://www.google.com/intl/en_uk/about/company/user-consent-policy-help/ "Help with the EU user consent policy"
[3]: https://support.google.com/adsense/answer/10502938?hl=en "Google Publisher Policies"
[4]: https://support.google.com/adsense/answer/48182?hl=en "AdSense Program policies"
[5]: https://commission.europa.eu/cookies-policy_en "European Commission cookies policy"
[6]: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/ "ICO cookies and similar technologies guidance"
[7]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/ "ICO privacy information guidance"
