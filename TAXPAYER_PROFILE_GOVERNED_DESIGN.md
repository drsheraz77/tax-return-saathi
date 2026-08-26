# Governed Design: Minimal Taxpayer Preparation Profile

## Status and decision boundary

This document proposes a **minimal account-bound preparation-preferences profile** for approval. It does not authorise implementation. The feature remains optional, independent of FBR, educational, and non-determinative. It must not be presented as an IRIS profile, taxpayer registration, filing record, tax calculation, deadline service, or FBR outcome indicator.

The proposal follows data-minimisation and risk-management principles informed by the voluntary NIST Privacy Framework, and treats OWASP ASVS as a verification reference for technical security controls rather than a claim of certification.[1] [2]

## User benefit and lower-data decision

The only user benefit is a signed-in **“My preparation preferences”** view that keeps educational resources and existing preparation tools in the visitor’s preferred order. A visitor can continue using every public feature, temporary tool, and authenticated checklist draft without creating this profile.

The existing authenticated checklist draft is the lower-data alternative. The profile may be implemented only if the product owner accepts that persistent ordering preferences offer a distinct benefit that the checklist draft cannot reasonably provide. It must never become a hidden copy of the checklist draft or a general tax-record store.

## Proposed data inventory

| Field | Required? | Allowed values | Purpose | Storage and retention proposal |
| --- | --- | --- | --- | --- |
| Account owner reference | System-only | Existing internal `userId` relation | Authorise ownership; never shown as a tax identifier. | Relational key; removed on account deletion/cascade. |
| Profile version | System-only | Fixed schema version, initially `1` | Safe payload migration and validation. | Stored with profile; no user-facing meaning. |
| Preferred interface language | Optional | `ur`, `en` | Render the preference view in the chosen language. | One controlled value. |
| Preparation tax-year context | Optional | `ty_2026`, `other_or_unsure` | Link to a reviewed source scope only. | One controlled value; no individual deadline use. |
| Broad preparation paths | Optional | Existing allow-listed paths; maximum seven | Organise educational resource links. | Controlled enum array only. |
| Filing familiarity | Optional | `first_time`, `filed_before`, `not_sure` | Adjust explanatory sequence only. | One controlled value. |
| Resource organisation preference | Optional | `guided`, `review_first`, `source_first` | Choose the order of current tools. | One controlled value. |
| Creation/update timestamps | System-only | UTC timestamps | Accountability and retention operation. | No behavioural analytics use. |

No optional field may be required for an account, checklist, source guide, calculator, AI education feature, or public resource. All values must be pre-defined; free text is prohibited.

## Prohibited data and outcomes

The design explicitly prohibits CNIC, NTN, identity-document data, date of birth, address, telephone number, email beyond the existing authentication record, bank/card/IBAN information, income, tax, withholding, asset/liability, deduction, employer/client, property, investment, document, return, acknowledgement, notice, password, OTP, IRIS credential, session token, filing status, filing outcome, deadline, legal conclusion, or tax recommendation fields.

The profile must not infer sensitive data from selections, use selections for advertising, share selections with third parties, train an AI model, make eligibility/treatment decisions, or change any authored tax calculation. Educational outputs must continue to state their source scope, uncertainty, and escalation boundaries.

## Consent and user controls

Profile creation must be a separate, clear opt-in after authentication. Before creation, the interface must explain in Urdu and English that the profile is optional, list every field, state that no tax figures or identifiers are requested, provide a “continue without profile” route, and link to the privacy information. A pre-ticked consent control is not acceptable.

A signed-in user must be able to view, change, and permanently delete the profile through a self-service interface. Deletion must remove the profile payload rather than merely hide it. The existing checklist-draft deletion remains separate and must clearly state that it does not delete the profile; conversely, profile deletion must not delete a checklist draft unless the visitor makes a separate request.

The proposed retention policy is **deletion on demand plus review for deletion after 180 days of account inactivity**. The inactivity mechanism cannot be built until its platform-managed scheduling, deletion verification, backup alignment, user notice, and failure handling are approved. Until that decision, an implementation must either avoid persistent profile storage or disclose a temporary, explicitly approved retention basis.

## Access control and technical architecture

The application may use only the existing authenticated server-side context. Every read, write, and delete must be a protected server procedure that derives ownership from `ctx.user.id`; the client must never submit or choose a `userId`. Database helpers must scope every query by the authenticated user relation. Cross-user reads, administrative browsing, bulk export, and analytics extraction are prohibited by default.

Input must be a strict allow-list schema equivalent to the proposed inventory, reject unknown keys, reject free text, and reject sensitive terms or numeric financial fields. Server logs, error messages, analytics events, and notifications must never include profile payload values. Any production deployment must confirm transport protection and the storage platform’s relevant safeguards rather than assuming or claiming encryption properties not independently verified.

| Threat | Required control | Test evidence before launch |
| --- | --- | --- |
| Cross-account access or insecure direct object reference | Derive ownership from the authenticated context; never expose a profile identifier as an access authority. | A second user cannot read, modify, or delete another user’s profile. |
| Excess collection or schema drift | Strict enum-only validation, database review, and no free-text columns. | Unknown, identity, financial, document, and credential fields are rejected. |
| Accidental disclosure in logs or interfaces | Redacted error handling and payload-free events. | Automated source checks and deliberate failure tests reveal no values. |
| Account compromise | Reuse the existing authentication controls; no password or credential handling is added. | Session/auth regression coverage and a documented account-support route. |
| Retention failure | Explicit deletion procedure, deletion test, and approved inactivity process before it is enabled. | User deletion removes the record; scheduled-deletion evidence is required if adopted. |
| Misleading personalisation | Fixed educational copy and visible “not FBR/not a determination” limits. | UI tests confirm no legal/filing/acceptance claim. |

## Quality, source, and escalation controls

Profile preferences may select the order of reviewed resource cards only. They must not change a source’s review date, create a citation, choose a tax rate, or change server-side AI safeguards. Any broad overseas connection, business, property, investment, unclear notice, demand, audit, court matter, or urgent deadline context must remain an escalation prompt to official FBR information or a qualified professional—not a personalised answer.

## Required implementation artefacts after approval

If approved, implementation must add a schema migration, a strict validation schema, database helpers, protected tRPC procedures, a self-service create/edit/delete UI, Urdu/English consent and deletion copy, direct automated tests for ownership and validation, a privacy-policy update, and release/rollback documentation. The profile table should contain only the versioned allow-listed payload, owner relation, and timestamps—not an expandable set of profile columns.

## Approvals required before implementation

| Approval | Decision required | Status |
| --- | --- | --- |
| Product owner | Confirms the narrow benefit and accepts the lower-data alternative as the default path. | Approved by the project owner in this conversation on 26 August 2026. |
| Privacy / qualified legal reviewer | Confirms purpose, consent, retention, deletion, user rights, and applicable Pakistan-specific obligations. | Confirmed by the project owner in this conversation on 26 August 2026. |
| Security reviewer | Approves ownership controls, data flow, logging restrictions, deletion design, and pre-launch verification. | Confirmed by the project owner in this conversation on 26 August 2026. |
| Tax-content reviewer | Confirms that preferences cannot produce personal tax, deadline, or FBR-outcome determinations. | Pending. |
| User | Explicitly approves the exact proposed field list, retention proposal, and non-determinative boundary. | Approved in this conversation on 26 August 2026. |

> **Implementation gate:** No profile database table, migration, API route/procedure, local-storage key, UI field, analytics event, or backfill may be created until every approval above is positively recorded. A request to “implement the profile” is not equivalent to approval of unlisted data fields or a change in these boundaries.

## References

[1] [NIST Privacy Framework](https://www.nist.gov/privacy-framework) — voluntary framework for identifying and managing privacy risk.

[2] [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/) — an application-security verification reference.
