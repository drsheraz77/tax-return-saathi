# Secure Taxpayer-Profile Option Assessment

## Decision under review

The proposed capability is an account-bound **taxpayer preparation profile**. Its only intended benefit is to help a signed-in visitor return to relevant educational resources and preparation tools without re-answering broad, non-financial context questions. It must not identify the visitor to FBR, represent an IRIS account, determine tax treatment, calculate a liability or deadline, classify a notice, submit a return, or imply approval/acceptance.

## Lower-data alternative

The existing authenticated checklist draft already stores a controlled, high-level preparation context: tax-year scope, broad taxpayer paths, filing experience, broad income categories, record-readiness marks, and high-level path statuses. It excludes amounts, identifiers, documents, credentials, account details, and notice information. This existing draft is therefore the preferred **lower-data alternative** for initial personalisation.

| Option | Data added | User benefit | Risk and recommendation |
| --- | --- | --- |
| Reuse authenticated checklist draft | None. Use only existing allow-listed answers after a visitor explicitly chooses to save that draft. | Restore relevant preparation actions and resource links. | Lowest additional risk. This should remain available even if a profile is later approved. |
| Minimal preparation profile | Account-bound, voluntary controlled preferences only. | Show a stable education dashboard without requiring checklist re-entry. | May be considered only if the lower-data draft does not meet the product goal. |
| Full taxpayer profile | Identity, tax registration, financial, document, or filing fields. | Potentially richer personalisation. | Not proposed. It requires a separate Tier C/D review and must not be bundled into this capability. |

## Narrow benefit test

The minimal profile proceeds to design only if all of the following are true:

1. A visitor needs stable, account-level resource organisation that cannot reasonably be restored from the saved checklist draft.
2. Every proposed field is a controlled enum or boolean whose direct purpose is visible to the visitor.
3. The same dashboard still works when every optional profile field is blank.
4. No output uses profile data to decide tax status, eligibility, tax treatment, return correctness, a deadline, or an FBR outcome.

## Candidate minimum profile scope

The candidate scope is intentionally limited to controlled, voluntary preparation preferences. It is a proposal for approval, not an implemented field list.

| Candidate field | Allowed values | Intended use | Excluded expansion |
| --- | --- | --- | --- |
| Preferred interface language | `ur` or `en` | Render the profile hub in the chosen language. | Free-text language preference, location inference. |
| Preparation tax-year context | `ty_2026`, `other_or_unsure` | Link to a reviewed source scope. | Personal filing year, personal deadline, extension status. |
| Broad preparation paths | Existing allow-listed paths, maximum seven. | Select existing educational tools. | Employment details, employer, client, property, account, asset, or investment details. |
| Filing familiarity | `first_time`, `filed_before`, `not_sure` | Adjust explanatory wording only. | Return history, filing status, acknowledgement number, or FBR status. |
| Resource organisation preference | `guided`, `review_first`, `source_first` | Choose the order of existing app content. | Behavioural profiling, advertising, or sharing. |

## Non-negotiable exclusions

The profile must never request, infer, store, or derive CNIC, NTN, passport, date of birth, address, telephone, bank/account/card/IBAN details, income, tax, withholding, asset, liability, deduction, client, employer, property, investment, document, return, acknowledgement, notice, credential, password, OTP, IRIS session, or filing outcome data. It must not introduce a free-text field.

## Provisional recommendation

Do **not** create a separate taxpayer-profile table yet. First, assess whether a clearly labelled “saved preparation preferences” view can safely reuse the existing authenticated checklist-draft allowlist. If a separate profile is later approved, it should use only the candidate controlled fields above, be completely optional, be editable and deletable by the signed-in user, and remain functionally non-determinative.

> **Status:** Design assessment only. No profile schema, procedure, storage, UI, data collection, or migration is authorised by this document.
