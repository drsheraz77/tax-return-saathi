# Freelancer tools verification

## Initial managed-preview check

On 23 August 2026, the **Registration & filing resources** panel opened in a fresh managed-preview browser session. The panel rendered the dedicated **Freelancer registration & return preparation** accordion alongside the existing company, sole-proprietor/AOP, and general return-preparation sections.

The panel also displayed the new **Freelancer foreign-client & records help** searchable FAQ and an **Open freelancer printable checklist** control. The visible educational boundary states that the resource hub does not register a business, submit a return, or determine a tax position.

## Resources and FAQ search

The dedicated freelancer accordion rendered its bilingual FBR individual-registration and return-filing-help cards, together with PSEB freelancer information and registration-portal cards. The visible links used only the official FBR and PSEB destinations recorded in the project source log.

Searching the new FAQ for **“invoice”** filtered the guidance to the foreign-client payment and record-keeping entry. Its educational content prompts users to organise invoices, agreements or work evidence, payment statements, and bank-payment records; it links to FBR filing help and explicitly tells users to confirm current FBR guidance before filing. It does not calculate foreign income, determine tax treatment, or request personal information.

## Printable checklist and adaptive-path verification

Opening the freelancer checklist displayed a local, bilingual checklist with browser-only checkboxes for IRIS access, registration details, client invoices or work evidence, payment records, withholding records, submitted-return copies, and current FBR filing help. The print action is implemented exclusively as `window.print()` and the print stylesheet exposes only the selected checklist sheet; it neither serializes checklist state nor sends any request. Browser automation did not return after activating the native print action because the print dialog blocks page automation, which is expected for the native browser workflow.

The deterministic checklist module is covered by the final test suite for the optional freelancer category and its preparation branch. Selecting the freelancer path produces preparation prompts for freelancer work records and foreign-client payment evidence, while the foreign-income safety gate remains a preparation-only prompt rather than a tax-treatment decision.

## Final adaptive-path and release verification

On 23 August 2026, a fresh managed-preview session completed the optional freelancer journey: **first return** → **Freelance work or independent client services** → **Partly ready** for freelance work and client-payment records → **No** withholding selected for this test path → **No** foreign-income/overseas-assets/tax-residence question → **Some are missing** for supporting records. Selecting freelance work displayed the conditional bilingual question **“Are your freelance work and client-payment records ready to review?”** and explicitly labelled it as preparation-only.

The resulting local preview displayed **“Organise freelance work and client-payment records”** with the action **Gather**, and **“Finish your freelance-record review”** with the action **Review**. The accompanying copy asks users to assemble invoices, agreements or work evidence, relevant platform statements, and payment records, while stating that the checklist does not determine tax treatment. No tax rate, exemption, eligibility, reporting obligation, or foreign-client tax consequence was asserted. The browser console was empty after the completed flow.

Final automated verification on 23 August 2026 completed successfully. `pnpm test` passed **5 test files and 19 tests**. `pnpm build` completed successfully, producing the client and server bundles. The build emitted only the existing advisory that a minified client chunk exceeds 500 kB; it did not report a build error.
