# Expanded Resource Hub Verification

**Verified:** 23 August 2026  
**Environment:** Managed development preview, desktop browser session  
**Scope:** Sole-proprietor and AOP registration resources, searchable IRIS troubleshooting, and printable pre-filing checklist.

## Initial interface verification

The **Registration & filing resources / رجسٹریشن اور فائلنگ وسائل** control opened successfully from the main Tax Return Saathi page. The panel visibly displayed the educational boundary in English and Urdu, stating that it links to official services and does not register a business, submit a return, or determine a tax position.

The panel showed the three expected resource groups: **Company registration**, **Sole proprietor & AOP registration**, and **Income-tax return preparation**. The filing group exposed links to FBR registration guidance, FBR IRIS, and FBR filing help. The integrated **IRIS help & troubleshooting** section also displayed the search input and official-link FAQ entries, while the **Open printable checklist** control was available beneath it.

The visible resource links use the official SECP, FBR, and IRIS destinations recorded in `OFFICIAL_RESOURCE_HUB_SOURCES.md`.

## Registration cards and FAQ search

Expanding **Sole proprietor & AOP registration / واحد مالک اور اے او پی رجسٹریشن** displayed three source-linked FBR cards: individual/sole-proprietor registration, AOP/partnership tax registration, and FBR registration basics. The bilingual cards explain that users should review the official requirements before starting and direct them to the official route rather than attempting registration inside the app.

Entering `password` into the IRIS troubleshooting search field narrowed the visible FAQ to password-related help and the connected account-recovery entry. The search remained entirely in the browser and retained the linked official FBR password-help and IRIS-account-recovery routes.

## Printable pre-filing checklist

Selecting **Open printable checklist** revealed a local, bilingual pre-filing document checklist with seven selectable preparation items. It requested no answers, identifiers, documents, or financial figures, and its disclosure states that the checklist does not submit a return or collect financial data.

Selecting **Print checklist** invoked the browser’s native print workflow. The managed-browser automation then timed out because the native print dialog takes control of the browser session, which is expected for a `window.print()` action and is not an application error. The control therefore hands printing to the user’s browser without a server request or download service.

## Mobile entry control

At a 375×812 mobile viewport, the **Registration & filing resources** entry control remained readable and vertically separated from the checklist prototype and Tax Year 2026 controls. All three actions stayed visible and individually reachable without overlap.

## Final automated verification

After all expanded resource-hub changes, `pnpm test` passed **5 test files and 17 tests**, including the official-resource hub coverage. `pnpm build` completed successfully, producing the Vite client output and bundled server entry. The build emitted only its existing advisory about a JavaScript chunk above 500 kB; it did not report a build error.
