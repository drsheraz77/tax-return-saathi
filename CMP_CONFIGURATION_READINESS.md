# Google-Certified CMP Configuration Readiness

**Reviewed:** 26 August 2026  
**Recommended route:** **Google’s Privacy & messaging European regulations message** in the site owner’s AdSense account.  
**Scope:** Preparation only; no CMP, Google tag, AdSense tag, vendor, or advertisement has been enabled by this review.

> **Important:** This implementation note is not legal certification or a guarantee of AdSense approval. A Google-certified CMP is assessed for Google’s certification criteria, not for complete compliance with every applicable privacy law.[1]

## Why this route is recommended

Google states that the European regulations message available in the **Privacy & messaging** tab for AdSense is certified for the relevant TCF requirement.[1] This is the lowest-integration path for the current site because it is configured inside the owner’s AdSense account rather than requiring a new third-party CMP vendor, SDK, or browser script from this application.

For personalized ads served to people in the EEA and UK, Google requires a Google-certified CMP that integrates with the IAB Transparency and Consent Framework; it applies the same requirement for Switzerland.[1] Google describes its own CMP as a consent and opt-out tool that can present consent, decline, and settings options based on a visitor’s location and prior decision.[3]

## Configuration prerequisites

| Item | Current status | Required before enabling the Google CMP |
| --- | --- | --- |
| AdSense owner account | Not connected to this workspace | Owner must sign in to the intended AdSense account. |
| Website/domain record | Public site exists at `www.taxinformation.org` | Owner must ensure the site is correctly represented and eligible in AdSense. |
| Public privacy page | Available at `/privacy` | Review it against the selected message, actual vendors, cookies/local storage, and current contact details before publishing. |
| Data controller/privacy contact | Not publicly confirmed | Provide a monitored contact route and controller/business details where applicable. |
| Ad technology providers (ATPs) | Not selected | Choose the commonly used or a custom set in AdSense, then make the chosen providers and their activities transparent to users.[2] |
| Google advertising tags | Not present in the current app | Keep absent until the CMP is published, the consent journey is tested, and the owner explicitly authorizes AdSense activation. |

## Proposed owner-side steps

1. Sign in to the intended AdSense account and open **Privacy & messaging**.
2. Open the **European regulations** settings/message flow for the site.
3. Review the ad technology provider option. Google notes that the common set is the default unless it is changed; a custom set lets the publisher choose providers.[2]
4. Create the European regulations message for `www.taxinformation.org`, link the public privacy policy, and carefully review the languages, purposes, vendors, accept/decline/settings journeys, and whether the message covers the intended regions.
5. Publish the message only after confirming the disclosure and provider choices. Then test consent, decline, settings, withdrawal/re-consent, and the consent audit in a suitable browser environment.
6. Only after that testing and an explicit separate decision should AdSense code be added to the site. Verify that no advertising or related technology runs before the selected CMP and consent path are active.

## What this application can do after approval

After the owner confirms the Google Privacy & messaging route and grants permission to make the account-side change, the next action will be limited to opening the existing AdSense privacy settings, selecting the site, and reviewing the message settings with the owner. Publishing a message, choosing vendors, or enabling any ads remains an account-side action that requires the owner’s explicit confirmation at that moment.

## References

[1] [Google AdSense — Consent-management requirements for publishers](https://support.google.com/adsense/answer/13554116?hl=en)  
[2] [Google AdSense — Set up and manage your CMP](https://support.google.com/adsense/answer/7670013?hl=en)  
[3] [Google AdSense — How the Google CMP works](https://support.google.com/adsense/answer/16918505?hl=en)  
[4] [Google AdSense — Publisher EU consent journeys](https://support.google.com/adsense/answer/9031649?hl=en)
