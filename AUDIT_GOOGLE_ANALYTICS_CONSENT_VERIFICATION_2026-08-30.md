# Google Analytics Consent Verification — 30 August 2026

## Scope and privacy boundary

The supplied GA4 measurement ID, `G-VJWBMPJSHW`, is implemented through `OptionalGoogleAnalytics.jsx`. The Google tag is not present in the initial page response or inserted by the client until a visitor explicitly chooses the Urdu-first **Visitor measurement** approval control. The integration sends only Google Analytics’ ordinary configuration after opt-in; it adds no custom events, user IDs, account IDs, tax or form content, uploaded material, feedback text, browser/page capture, advertising signals, or new app-side storage.

The analytics choice uses a new `v2` local-storage key. A historic generic optional-use choice is deliberately not treated as approval for Google Analytics, so visitors must make an informed fresh choice. On decline or reset, the app updates consent to denied when available, removes its optional Google tag element, clears available `_ga` cookies, and retains no app-side analytics record. The public privacy policy was updated in Urdu and English and continues to say that the notice is not a Google-certified CMP or legal certification.

## Verification

| Check | Result |
|---|---|
| Focused consent and public-policy tests | Passed: 2 files, 9 tests |
| Full regression suite | Passed: 20 files, 107 tests |
| Production build | Passed |
| Before consent | Preview displayed Urdu-first choice; recent network records contained no Google tag request |
| After approval | Browser recorded the dynamically inserted `https://www.googletagmanager.com/gtag/js?id=G-VJWBMPJSHW` script and `consent`, `js`, and `config` queue entries; no GA cookie was visible in this preview environment |
| After reset | Browser confirmed the optional script was absent, both local choice keys were empty, and no `_ga` cookie was visible |
| Responsive presentation | Checked at 1280 × 720 and 375 × 812; the privacy panel was legible and did not overlap the existing quick-tools dock |

## Weekly aggregate summary status

The weekly recipient requested by the owner is `driris@gmail.com`. This site does **not** yet retrieve or email Google Analytics statistics because a GA4 **Property ID** and authorised Analytics Data API access have not been supplied. The public measurement ID does not grant reporting access. No scheduled process, API credential, email, or data retrieval has been created.

## References

1. [Google Consent Mode documentation](https://developers.google.com/tag-platform/security/guides/consent)
2. [Google Analytics Data API overview](https://developers.google.com/analytics/devguides/reporting/data/v1)
