# Google Analytics Consent and Weekly Aggregate Reporting Research

**Research date:** 30 August 2026 (Asia/Karachi)

| Official source | Relevant finding | Design implication |
|---|---|---|
| [Google: Set up consent mode on websites](https://developers.google.com/tag-platform/security/guides/consent) | For `gtag.js`, Google says the consent default must be set before a `config` or `event` measurement command, and consent should be updated when the visitor changes their choice. | A direct unconditional snippet in `index.html` would conflict with the current local choice. The implementation needs a consent-aware client bootstrap and must update or avoid the tag when consent is withdrawn. |
| [Google Analytics Data API overview](https://developers.google.com/analytics/devguides/reporting/data/v1) | The Data API can programmatically access Analytics reports; `runReport` is the preferred simple-report method and can support automated reports. | Weekly aggregate visitor summaries require separate authorised Data API access and a GA4 property ID; the public measurement ID alone is insufficient. |
| [Google: properties.runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport) | `runReport` queries a specified Analytics property using an authorised POST request and selected metrics/date ranges. | If enabled, the weekly digest can request only aggregate metrics (for example, active users and views) for the prior seven complete days. It should not request individual-level data. |
| [Google Analytics: Data retention](https://support.google.com/analytics/answer/7667196?hl=en) | GA4 data-retention settings apply to user/event-level data; standard aggregate reports are not governed by the same retention control. | The owner needs to configure GA4 property data settings directly. This site should not represent those provider settings as its own retention policy. |

## Scope note

No Google tag, reporting credential, Google Analytics connector, or weekly schedule has been enabled during research. The available integration configuration did not show a Google Analytics reporting connection. Any weekly delivery needs the owner to choose a delivery destination and grant appropriate reporting access separately.
