# Tax Return Saathi feedback implementation assessment

**Scope.** This assessment reviews the supplied feedback while deliberately excluding the comment about a law firm. It is a product and implementation assessment, not legal advice. It preserves the constraint that `client/src/App.jsx` and its authored tax logic remain unchanged unless the owner separately approves a narrow exception.

## What is practical now

| Priority | Improvement | Practical implementation | Important boundary |
|---|---|---|---|
| High | Independently reachable **About & Privacy** information | Add supplemental `/about` and `/privacy` views, with clear navigation from the existing resource hub and mobile entry controls. Include last-updated dates and a plain-language data inventory. | Publishing a named operator or data-controller statement requires the owner to provide the public legal name and contact email to display. |
| High | Clear privacy and data-use notice | Explain the two existing draft choices: browser-local draft storage and signed-in account draft storage. State that account drafts contain only controlled high-level checklist choices and can be deleted in the app. | Do not claim legal compliance, geographical processing location, or provider retention terms that have not been verified. |
| High | Notice-upload and AI-use transparency | Add a factual **“Before you upload a notice”** disclosure: the application sends image/PDF content through its server-side managed AI pathway to generate educational guidance; it does not submit a return or make a binding tax decision. | Current code has no application-level persistence for uploaded image/PDF content, but it does not establish the managed-provider retention or cross-border processing terms. A complete disclosure needs those terms verified first. |
| Medium | Upload-specific acknowledgement | Put a concise acknowledgement beside the notice-upload action and link it to the detailed AI/data-use notice. | This needs a narrow edit to the authored `App.jsx` upload UI. A general panel outside `App.jsx` can inform users, but cannot reliably capture consent immediately before each upload. |
| Medium | Feedback retention clarity | State that feedback is anonymous, not linked to an account, and cannot currently be retrieved or individually deleted by a user. Add a published retention window only after an actual scheduled deletion process exists. | A retention promise must be implemented operationally; it should not be published as copy alone. |
| Medium | Scope and limitations page | Make the existing preparation-only boundaries easier to find: no return submission, no tax treatment result, no tax rate/exemption/eligibility determination, and official FBR verification required. | This should describe the product accurately and avoid implying professional tax advice. |

## Existing foundations

The current application already provides useful implementation foundations: browser-local drafts remain in the browser; signed-in account drafts are constrained to fixed high-level checklist choices; account-held drafts can be deleted through an explicit confirmation flow; feedback is voluntary, anonymous, and screened for common sensitive identifiers; and official FBR contact information is present. These capabilities should be linked from a dedicated privacy page rather than remaining only inside the resource panel.

The server-side AI adapter accepts image and PDF content for the notice-guidance flow, converts it to managed AI message content, and does not itself write that content to the application database. That supports a narrow statement about the application code, but does **not** prove provider retention, location, logging, or transfer practices. Those points must remain qualified until verified from the relevant managed-service documentation.

## Recommended implementation order

| Phase | Deliverable | Dependencies |
|---|---|---|
| 1 | Accessible About & Privacy pages; navigation; data inventory; scope and limitations; policy last-updated date | Owner’s public operator name and contact email for the identity section; no `App.jsx` change required. |
| 2 | Factual AI/upload disclosure page and resource-hub link | Confirmation of the managed AI provider’s applicable retention and transfer terms before making provider-specific claims. |
| 3 | Upload-adjacent acknowledgement and link to the disclosure | Owner approval for a narrowly scoped `App.jsx` modification. |
| 4 | Feedback retention/deletion design | A chosen retention period and a scheduled backend deletion process; individual feedback deletion would require a privacy-preserving receipt/token design. |

## Items that should not be claimed or implemented without more input

| Item | Why it needs input or a separate decision |
|---|---|
| Named operator/data-controller identity | The correct public legal name and contact information must come from the owner. |
| Exact AI-provider retention, cross-border transfer, and residency claims | The current application code does not establish these facts. They need confirmation from the provider/platform documentation. |
| A fixed feedback-retention period | It requires an actual deletion workflow, not only policy wording. |
| Individual deletion of anonymous feedback | The current design intentionally has no account link; adding a receipt/token changes the privacy model and needs a deliberate design decision. |
| Upload-specific consent | This needs a precise UI change next to the upload action, which currently sits in the protected authored component. |

## Recommended next decision

Start with **Phase 1** and provide the public operator name plus a contact email. In parallel, confirm whether a narrowly scoped edit to the notice-upload UI in `App.jsx` is permitted. That allows the most important transparency improvements without altering any tax logic, rates, rules, or filing determinations.
