# Feedback Email Subject and Broken-Link Shortcut Verification

**Scope reviewed:** Pilot-feedback navigation enhancement, 30 August 2026 (Asia/Karachi).

## Implemented interaction

| Item | Verification |
|---|---|
| Direct pilot email | All direct pilot email links reuse `PILOT_FEEDBACK_EMAIL_HREF`, which opens `driris@gmail.com` with the neutral subject `Tax Return Saathi pilot feedback — [category]`. No email body is pre-filled. |
| Broken-link route | The inline Urdu-first `ٹوٹا ہوا لنک رپورٹ کریں / Report a broken link` control selects the existing `technical` category, clears a prior acknowledgement state, and focuses the existing anonymous message field. It does not submit a report. |
| Browser check | In the managed preview, activating the shortcut resulted in `{ category: "technical", activeElement: "feedback-message", messageValue: "", formVisible: true }`. |

## Privacy and scope boundaries

The shortcut reuses the existing anonymous feedback form and its existing 30-day deletion schedule. It does not add backend routes, schema fields, URL capture, current-page capture, browser data, tracking, analytics, account linkage, or automatic submission. The user-facing copy says that no link, page, or browser information is collected automatically.

Direct email remains optional and **not anonymous**. The UI continues to warn visitors not to send tax, identity, financial, credential, notice, or document details by email. The subject template contains only a neutral category placeholder and no user data.

## Automated validation

| Check | Result |
|---|---|
| Focused UI regression tests | Passed: 2 files, 22 tests (`privacyPolicyUi.test.ts`, `priorityPreparationUi.test.ts`). |
| Full automated suite | Passed: 20 files, 105 tests. The expected managed-AI error-path test prints its deliberately simulated upstream failure to stderr. |
| Production build | Passed. Vite reported the pre-existing large-chunk advisory only; no build error occurred. |

## Responsive visual review

The 1280 × 720 and 375 × 812 rendered-page checks passed. The established quick-tools dock remained the only fixed launcher area, and the page content remained readable without overlap. A managed-preview interaction check showed the expanded resource hub with the inline shortcut adjacent to the feedback form; it remained visually contained within the hub and did not create a competing floating control.

Keyboard access is retained through a native `button` control with a visible `:focus-visible` outline. Activation moves focus to the existing feedback message field, as recorded above.
