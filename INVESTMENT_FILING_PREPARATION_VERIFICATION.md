# Investment-record filing preparation verification

**Checked:** 24 August 2026

The adaptive filing checklist now includes an optional **“Fixed-term accounts, stocks, ETFs, or bonds”** category. It is an educational record-gathering branch; it does not calculate a tax result or ask for any amount, account number, CNIC, NTN, password, document, or upload.

| Journey evidence | Verified result |
|---|---|
| First return → investment category | The bilingual conditional question **“Are your investment account and transaction records ready to review?”** appeared, with an Urdu equivalent and a preparation-only hint. |
| Partly ready → withholding: no → foreign connection: no → records partly incomplete | The local preview included **“Organise investment-account and transaction records”** and **“Finish your investment-record review.”** |
| Safety boundary | The result directs users to the **Tax & investment resources** panel for neutral record-learning links and states that the checklist **does not determine tax treatment**. |
| Privacy and runtime | The completed preview contained no form inputs for sensitive data and the interaction check found no relevant console errors. |

Unit coverage verifies the conditional question, both investment-record results, the tax-treatment boundary, and the absence of sensitive identifiers or tax-rate, exemption, and eligibility language. The full suite passed **5 test files and 21 tests** before the final production build.

## Mobile path verification

At **375 × 812**, the same completed journey was exercised: first return → fixed-term accounts, stocks, ETFs, or bonds → partly ready investment records → no withholding → no foreign connection → some records missing. The bilingual conditional question appeared, and the result displayed both investment-record preparation prompts, the Tax & investment resources bridge, and the explicit non-tax-treatment boundary. The rendered result contained **no data-entry inputs**, and the mobile interaction reported no relevant console errors.

## Final automated validation

On 24 August 2026, `pnpm test` passed **5 test files and 21 tests**. `pnpm build` completed successfully. The only build output was the established advisory that a minified client chunk exceeds 500 kB; no build error occurred.
