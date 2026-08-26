# Last Manual Review Badge Verification

**Batch date:** 26 August 2026  
**Scope:** Compact source-governance clarity enhancement only.

## Delivered behaviour

The Tax Year panel now contains a compact Urdu-first badge labelled **“آخری دستی سورس جائزہ / Last manual source review.”** Its displayed date and semantic `time` value are derived from the newest entry in the existing, descending manually maintained source-change log. The badge also states that it is a manual catalogue review, **not live updates**.

This is a display-only change. It does not add sources, fetch data, monitor FBR, collect user data, determine a deadline or tax position, or alter the approved account-preference profile.

| Check | Result |
| --- | --- |
| Focused source-governance panel check | Passed: 1 file / 12 tests. |
| Full automated suite | Passed: 18 files / 90 tests. The expected managed-AI mock upstream error remained covered by its test. |
| Production build | Passed. Vite emitted the existing main-chunk size advisory only. |
| Desktop visual check | Passed at 1280 × 720; the Urdu-first desktop layout remained legible with no visible overlap. |
| Mobile visual check | Passed at 375 × 812; the Urdu-first layout remained readable and the fixed controls stayed within the viewport. |
