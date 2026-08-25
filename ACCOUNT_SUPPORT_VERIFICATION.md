# Account drafts, privacy, feedback, and contact verification

**Checked:** 24 August 2026

## Authenticated draft boundaries

The checklist now exposes a distinct **Optional account save** area beside the existing browser-local save. A signed-out preview displayed the **Sign in to save to your account** action and explained that account saving contains only fixed high-level checklist choices and progress marks. The visible boundary excludes amounts, CNIC, NTN, bank or account details, documents, and passwords. The server schema admits only the fixed answer and status vocabulary, and the authenticated route always uses the server session’s user ID rather than a client-provided owner ID. Draft deletion is available to the signed-in owner.

## Feedback, privacy, and contact

The Tax & investment resources panel exposes **Feedback, privacy & contact** with English and Urdu headings. Its feedback form contains only a topic selector and a 1,000-character feedback text field; it has no email, account, document, or file-upload field. The client warning and server validator reject common CNIC, NTN, password, bank, and account-detail language. Feedback is public, voluntary, unlinked to an account, and presented as product feedback—not tax advice, personal records, or a reply channel.

The privacy copy distinguishes browser-local storage from optional account storage, describes deletion, and states the excluded sensitive categories. The official contact card labels FBR support separately and links to the official FBR Contact Us page: <https://www.fbr.gov.pk/contact-us/142252/173964>. It lists the official FBR Helpline `051 111 772 772`, international `+92 51 111 772 772`, and `helpline@fbr.gov.pk` as published by FBR.[1]

## Responsive and automated evidence

The 375 × 812 responsive capture retained the authored mobile layout. Fresh preview interaction opened the checklist and resource hub: the account sign-in control, feedback select/textarea, feedback submit control, FBR contact email link, and official contact-page link were all discoverable. The local checklist and tax/investment resource launch controls remained separate. `pnpm test` passed **6 test files and 26 tests**; `pnpm build` completed successfully. The only build output was the established client-chunk-size advisory. Recent preview console output contained only historical August 18–19 Vite entries; the fresh 24 August session surfaced no new browser error.

## Authentication handoff status

The production sign-in action correctly opens the configured Manus OAuth page. The temporary browser session was returned to the preview without a session cookie, so it remains signed out. Completing the live save, resume, and delete journey requires an account sign-in by the user in the browser; no credentials were requested or entered during verification.

## Authenticated account-draft journey

After the user completed the browser sign-in, the checklist correctly changed from **Sign in to save to your account** to **Save to my account**. A non-sensitive **first return** selection was saved. The interface confirmed **“Account draft saved. Only your high-level choices and progress marks were stored,”** showed a local timestamp, and exposed **Resume account draft** and **Delete account draft**. No amounts, identity numbers, account details, documents, or credentials were entered or displayed.

After a full managed-preview reload, the authenticated session was retained and the draft’s saved timestamp plus **Resume account draft** and **Delete account draft** controls remained visible. This confirms the high-level draft is retrieved from the account rather than only held in current component state.

Selecting **Resume account draft** after reload showed **“Account draft resumed.”** Selecting **Delete account draft** then showed **“Account draft deleted.”** The saved-time display and resume/delete controls were removed afterwards. The test draft was deliberately limited to the single non-sensitive filing-history choice and no personal financial, identity, account, or document content was created or retained.

## Distinguishable restoration test in progress

For the stricter restoration check, the authenticated checklist was restarted after deletion. **This is my first return** was selected and the flow advanced to the distinct **Which records might apply to you this Tax Year?** multi-select step. The next saved state will include the visible investment-record category so restoration can be confirmed from both the later question and the selected category, without entering any sensitive information.

The **Fixed-term accounts, stocks, ETFs, or bonds** category was visibly selected at that second step. Saving returned the confirmation **“Account draft saved. Only your high-level choices and progress marks were stored,”** with an account timestamp. The following reload and resume test will confirm the second step and selected category reappear.

After reloading and reopening the checklist, the new timestamp plus **Resume account draft** and **Delete account draft** controls were present while the default first-return question was shown. This established that the test will now exercise restoration rather than only persistence of a control.

Selecting **Resume account draft** restored the later **Which records might apply to you this Tax Year?** question and visibly restored the selected **Fixed-term accounts, stocks, ETFs, or bonds** category. The UI reported **“Account draft resumed.”** This confirms recovery of both checklist step and non-sensitive answer, not merely the presence of a saved-draft control. With the user’s explicit confirmation, the test draft was then deleted. The UI reported **“Account draft deleted.”** and removed the timestamp plus resume/delete controls, leaving only the account-save option.

## Responsive verification boundary

The managed 375 × 812 screenshot confirmed the account-save, resource-hub, checklist, and Tax Year controls were visible without overlap. An independent headless Chrome interaction runner was also attempted to focus the mobile account, feedback, and contact controls; it failed before operating the preview because the browser runtime returned a generic uncaught evaluation error. It was not used as evidence of successful mobile clicks. The completed signed-in save → reload → visibly distinct resume → user-confirmed deletion lifecycle was verified in the managed desktop preview, while the mobile evidence is limited to rendered layout and control visibility.

## Final automated validation

The final `pnpm test` run passed **6 test files and 26 tests**. The reviewed draft-validation suite confirms controlled high-level values only, rejects common sensitive identifiers in feedback, retrieves drafts with the authenticated server-side owner ID, requires authentication for account drafts, and keeps feedback unlinked to an account. `pnpm build` completed successfully. Its only advisory was the existing client-chunk-size warning; no build error occurred.

## Privacy-management and acknowledgement interface

In the managed preview, **Delete my account-held data** opened a confirmation card that stated it permanently removes only the signed-in user’s high-level checklist draft and does not include anonymous feedback or browser-local drafts. The card offered **Cancel** and **Permanently delete checklist data**. Selecting **Cancel** closed the card without a deletion request. The feedback panel visibly retained its sensitive-data warning and dedicated **Send feedback** action. The acknowledgement result is covered by the server contract test, which returns the explicit received-without-account-or-contact-information message after an accepted feedback submission; no test feedback was posted to production during visual verification.

The final validation run passed **6 test files and 27 tests**, including the expanded deletion-confirmation, owner-scoped deletion, feedback acknowledgement, and sensitive-data screening assertions. `pnpm build` completed successfully. It emitted only the established client-chunk-size advisory and no build error.

## Feedback acknowledgement browser verification

With the user’s approval, the preview submitted the non-sensitive message **“Test feedback: acknowledgement screen verification.”** The panel replaced the form with the bilingual **Feedback received** acknowledgement. It stated that the message was received without an account or contact detail, warned that replies are not direct, and exposed **Send another feedback message**. No sensitive information was entered, requested, or displayed.

## Disposable account-data deletion setup

With the user’s approval, a new disposable account draft containing only **This is my first return** was saved at 11:34 local preview time. The account-save confirmation appeared, with the saved timestamp and the resume/delete controls. No identity, tax amount, financial account, document, or password data was entered. The next step is the already-approved privacy-management deletion confirmation.

## Confirmed self-service account-data deletion

With the user’s explicit confirmation, the resource hub opened the **Delete your account-held Tax Return Saathi data?** confirmation. It stated that deletion is limited to the signed-in user’s high-level checklist draft, does not delete browser-local drafts, and does not include anonymous feedback. Selecting **Permanently delete checklist data** showed **Deleting…**, then the success message **“Your account-held checklist draft data was deleted.”** The panel returned to the no-draft state. The completed feedback acknowledgement remained visible, demonstrating that anonymous feedback is intentionally outside this account-draft deletion scope.

## Source

[1] Federal Board of Revenue, [Contact Us](https://www.fbr.gov.pk/contact-us/142252/173964), accessed 24 August 2026.
