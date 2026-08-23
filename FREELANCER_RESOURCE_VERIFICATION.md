# Freelancer Resource Section Verification

## Managed-preview check

On 23 August 2026, the **Registration & filing resources** panel was opened in the managed preview. The new **Freelancer registration & return preparation / فری لانسر رجسٹریشن اور ریٹرن تیاری** accordion appeared as its own section, separate from company and sole-proprietor/AOP resources.

Expanding the section displayed four bilingual, educational resource cards: FBR individual registration guidance, FBR IRIS filing help, PSEB freelancer membership information, and the PSEB registration portal. The section expressly states that the resources do not determine a user’s tax treatment, exemption, or eligibility, and that optional PSEB services do not replace FBR registration or an income-tax return.

All displayed links use the selected official FBR or PSEB domains recorded in `OFFICIAL_RESOURCE_HUB_SOURCES.md`.

## Mobile check

At a 375×812 viewport, the **Registration & filing resources** entry remained readable and separated above the checklist-prototype and Tax Year 2026 controls. All three fixed actions remained individually reachable without overlap.

## Final automated verification

After the freelancer-section changes, `pnpm test` passed **5 test files and 18 tests**, including the official-resource-hub test coverage for the new section. `pnpm build` completed successfully. The build produced only its existing advisory about a JavaScript chunk above 500 kB; it did not report a build error.
