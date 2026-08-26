# Governance Gate for Deferred Sensitive Capabilities

## Purpose

This document defines the minimum approval gate before Tax Return Saathi considers capabilities that would receive, store, infer from, or act on sensitive personal, tax, financial, document, or account data. It is a product and engineering control document, not a legal-compliance opinion and not permission to implement the listed capabilities.

The current product remains an independent, preparation-only educational service. It does not accept CNICs, NTNs, tax amounts, bank details, documents, notices, passwords, OTPs, or IRIS credentials in its draft, feedback, learning, or guidance features.

## Capability classification

| Tier | Examples | Current state | Required decision |
| --- | --- | --- | --- |
| A: Low-data education | Reviewed source cards, local-only checklists, broad-category guidance, temporary answer evaluation. | Permitted and delivered. | Maintain existing data-minimisation and source-review controls. |
| B: Sensitive taxpayer context | Taxpayer profile, residence/family/business context, CNIC/NTN, identity verification, personalised status tracking. | Deferred. | Obtain governance approval before any field, schema, API, local storage key, or UI is created. |
| C: Financial and document intelligence | Tax figures, asset/liability values, bank/account information, receipts, return files, notice text, document extraction, reconciliation. | Deferred. | Require formal security architecture, retention design, threat modelling, and a human-review operating model before prototyping. |
| D: Personalised decision or action support | Personalised planning, eligibility/tax treatment, legal deadline calculation, notice classification, response drafting, filing/submission. | Deferred. | Require tax/legal review, model-risk controls, human escalation, and explicit non-automation boundaries before any build decision. |

## Mandatory approval gates

| Gate | Minimum evidence required before development | Accountable review |
| --- | --- | --- |
| Purpose limitation | A written feature objective, clear user benefit, a strict field list, and evidence that lower-data alternatives are insufficient. | Product owner and privacy lead. |
| Data inventory | Field-by-field map covering source, destination, purpose, sensitivity, storage location, access roles, processor, deletion method, and whether data leaves the service. | Engineering and security lead. |
| Legal and regulatory assessment | A qualified Pakistan-focused legal/privacy review of the intended collection, processing, notices, consent, retention, cross-border use, and user rights. | Qualified legal adviser. |
| Consent and user control | Plain-language purpose notice, genuinely optional consent where appropriate, alternative low-data path, access/correction/deletion route, and withdrawal consequences. | Product and privacy lead. |
| Security architecture | Authenticated access design, least privilege, encryption in transit and at rest, managed secrets, key rotation, audit logging, rate limits, dependency review, and incident response. | Security lead. |
| Retention and deletion | Approved minimum retention period, deletion workflow, backups/deletion alignment, deletion verification, legal-hold procedure, and owner for review dates. | Privacy lead and operations owner. |
| Model and decision safety | Input restrictions, source/version controls, uncertainty and escalation behaviour, prohibited output list, evaluation set, red-team plan, and human-review handoff. | AI safety lead and qualified tax adviser. |
| Launch readiness | Threat model, abuse cases, accessibility review, penetration/security testing as appropriate, test evidence, incident contact, rollback plan, and documented user support route. | Product, engineering, security, and operations owners. |

## Capability-specific prerequisites

### Taxpayer profile or dashboard

Before any profile field is created, the team must define the exact audience, whether the feature can work with controlled broad categories instead, and how a user can view and delete every stored profile attribute. CNIC/NTN collection is prohibited unless a separately approved, documented purpose makes it necessary. Profile-driven content must not be described as a tax determination.

### Document upload, extraction, or return review expansion

Before accepting any file or document text, the team must approve file-type limits, malware handling, redaction guidance, data minimisation, storage location, encryption, access logging, provider/subprocessor data flow, retention, deletion, human escalation, and a tested failure mode. No design may request passwords, OTPs, bank credentials, or IRIS credentials. Extracted information must not silently become a permanent profile or training dataset.

### Wealth reconciliation or financial calculation expansion

Before accepting values for assets, liabilities, income, deductions, or accounts, the team must define calculation ownership, tax-year/rule versioning, source citations, rounding and error rules, test cases, uncertainty handling, and clear messages that distinguish educational calculation from FBR acceptance or legal determination. Any reconciliation mismatch must be phrased as an item to verify, not an error, omission, or outcome prediction.

### Personalised planning, notice analysis, or response assistance

Before generating personal recommendations or analysing a notice, the team must define the allowable scenario categories, forbid unverified legal/tax conclusions, use a current authoritative source base, require a qualified human escalation route for deadlines, audits, demands, foreign/residency matters, and unclear notices, and test refusal/escalation behaviour. It must never submit, respond, file, or communicate with FBR on the user’s behalf unless separately authorised and technically secured.

## Build-authorisation checklist

Development on a Tier B, C, or D capability may start only after every item below is marked approved by named owners:

- [ ] Feature purpose and lower-data alternative assessment.
- [ ] Data inventory and flow diagram.
- [ ] Legal/privacy assessment.
- [ ] Consent, user controls, retention, and deletion design.
- [ ] Security architecture and threat model.
- [ ] Source/version strategy and model-risk evaluation plan.
- [ ] Human escalation and support ownership.
- [ ] Test, monitoring, incident response, rollback, and launch sign-off plan.

> **No engineering shortcut:** creating a database column, local-storage key, prompt field, upload control, or analytics event for sensitive information is implementation. It is not permitted before this gate is approved.

## Next decision

If the owner wants to pursue a sensitive capability, the next task should be a **single capability design review**, beginning with a low-data alternative and the completed authorisation checklist above. It should not combine profile, documents, reconciliation, planning, and filing into one release.
