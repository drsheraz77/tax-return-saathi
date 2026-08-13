# TY2026 Return — Mistake-Detection Algorithm & Query Generator
Based on direct review of the gazetted draft: **S.R.O. 835(I)/2026**, Federal Board of Revenue,
"Electronic Return for Individuals for Tax Year 2026" (Second Schedule, Part-II-ZE to ZH),
notified 7 May 2026. 147 pages, English + Urdu, covering Individual, AOP, and Company variants.

---

## 1. Confirmed form structure (from the actual gazette text)

| # | Section | Key fields observed |
|---|---------|---------------------|
| 1 | Withholding Summary (landing page) | Checkboxes: Salary / Property Rental / Other Sources / Business / Capital Gain / Foreign Sources & Assets / Agriculture / No Income. Residency question: **"Have you stayed more than 183 days in Pakistan during the tax year?"** (Yes/No). Pre-filled "Summary of Economic Transactions" (withholding as withholdee, withholding as agent, sales tax record) for period **1 July 2025 – 30 June 2026**. |
| 2 | Employment -> Salary -> Tax Deductions | **Employer Registration No. AND Employer Name** both required per employer. Salary broken into coded lines (Pay/Wages, Allowances, Pension/Annuity u/s 12(2)(f), Expenditure Reimbursement, Perquisites incl. transport monetization, Profit in lieu of/termination benefits). Tax Deductions split into **Adjustable Tax** (s.149), **Final Tax**, and **Average Tax** (termination benefits u/s 12(6), salary arrears u/s 12(7)) as separate tables. |
| 3 | Property -> Receipts/Deductions, Tax Deductions | Per-property entry via "Select Property" (must pick from properties declared last year, or add new). Receipts: Rent Received/Receivable, 1/10th of unadjustable advance, forfeited deposit, unpaid liabilities >3 years. Deductions: insurance premium, local rate/tax/cess, ground rent, profit on capital borrowed for the property, share paid to HBFC/banks, rent collection expenditure, legal service charges, irrecoverable rent, 1/5th repairs. Tax Deductions cite s.236C (seller advance tax) and s.236K (buyer advance tax) by name. |
| 4 | Business -> Manufacturing/Trading, Mgmt/Admin/Selling & Financial Expenses, Inadmissible/Admissible Deductions, Adjustments, **7F Tax on Builders & Developers**, **Income from Social Media Content**, Tax Deductions, Balance Sheet | Full trading-account structure (Opening/Closing Stock, Net Purchases, Gross Profit). Admissible deductions explicitly include Tax Depreciation/Initial Allowance, Tax Amortization, unabsorbed prior-year amortization/depreciation. **"Income from Social Media Content" is its own line item**, separate from other business revenue. |
| 5 | Capital Gain | Per-asset entry (property/securities), holding-period aware, cites s.37A rates by acquisition-date band (pre/post 1 July 2022, pre/post 1 July 2013). |
| 6-7 | Other Sources / Foreign Source / Agriculture | Foreign Tax Identification Number field; Property/Capital Gain/Other Sources split by category; Agriculture linked to specific declared property parcels. |
| 8 | Tax Chargeable/Payments -> Allowances/Reductions/Credits, Tax on Deemed Income (Capital Assets), Withholding Taxes, Computations | Deductible allowances: **Zakat u/s 60, Workers' Welfare Fund u/s 60A, Educational Expenses u/s 60D**. Tax Reductions include the **women-owned startup reduction**, and **Behbood Certificate/Pensioner's Benefit Account** excess-rate reduction, ex-servicemen capital-gain reductions. Exclusion workflow requires **selecting a specific legal reason** for exclusion (not free text) and can require an uploaded exclusion PDF. |
| 9 | **Wealth Statement** — 9.1 Foreign Assets/Liabilities, 9.2 Personal Assets/Liabilities, 9.3 Reconciliation of Net Assets | Foreign section: immovable property, moveable assets, bank accounts (**IBAN + Country**), foreign business capital, payables/borrowings — all separate from local wealth. Personal section: **"Select Property — Please fill all mandatory fields in Yellow highlighted Properties"**, split into "Properties declared for previous Tax Year" vs "Properties purchased during the Tax Year" — i.e. **prior-year property records carry forward and must be completed/confirmed, not re-entered from scratch**. Financial Assets & Investments (Non-Business): bank accounts, cash in hand, investments/stocks/bonds, advances/prepayments. Motor Vehicle sub-form: Registration No. AND Chassis No. both required. Reconciliation of Net Assets is a distinct computed sub-section. |
| 10-14 | Amortization, Payment, Business Details, Attachment | "Unclaimed Payments / Claimed Payments / Payment Summary" panel. Business Details asks Ownership Details (Pakistani/Foreigner toggle) for shareholders/directors/partners. |

The entire packet repeats in Urdu, and repeats again with adapted schedules for AOP/Firm and Company filers.

---

## 2. Mistake-detection algorithm

Deterministic, field-driven — not generic AI guessing. Each rule below is `IF <condition on submitted data> THEN <flag>`. This is the ruleset now used to drive the app's document-upload gap-check, and can equally be read as a manual pre-submission checklist.

### A. Structural / eligibility checks
1. `IF` income sources selected include Business, Foreign Sources, or Capital Gain `AND` return type = simplified salaried -> **flag: wrong return type**.
2. `IF` residency answer = "No" (<=183 days) `AND` foreign employment income declared as normal income (not restricted to Pakistan-source) -> **flag: possible worldwide-income over-declaration for a non-resident**.
3. `IF` residency answer = "Yes" `AND` large foreign income claimed exempt with no supporting foreign employment contract/tax certificate attached -> **flag: unsubstantiated residency-based exemption**.

### B. Salary schedule checks
4. `IF` salary income source selected `AND` Employer Registration No. (NTN) field is blank -> **flag: missing employer NTN — will fail auto-match against employer's withholding statement**.
5. `IF` multiple employers implied (arrears/termination benefits present) `AND` only one employer record entered -> **flag: possible missing second employer**.
6. `IF` declared "Tax Deducted" under Adjustable Tax (salary) != figure on the uploaded salary certificate -> **flag: mismatch with certificate — auto-filled IRIS data may be wrong or certificate wasn't checked**.
7. `IF` "Employment Termination Benefits" or "Salary Arrears" amounts entered `BUT` no corresponding average-tax-rate election made -> **flag: incomplete average-tax computation**.

### C. Property schedule checks
8. `IF` property/rental income source selected `AND` no property records under section 3 -> **flag: rental income claimed but no property declared**.
9. `IF` a property exists in the prior year's wealth statement (carried forward) `AND` it is absent from the current Personal Assets/Liabilities list `AND` no disposal (Sold/Gifted) record exists for it -> **flag: property disappeared without a disposal record — highest-severity wealth-statement gap**.
10. `IF` a property is marked disposed `AND` role = Seller `AND` no s.236C advance tax entry appears in Tax Deductions -> **flag: missing seller advance-tax credit — refund/adjustment being left unclaimed**.
11. `IF` a property is newly acquired during the year `AND` no s.236K buyer advance-tax entry appears -> **flag: missing buyer advance-tax credit**.

### D. Business schedule checks
12. `IF` business/freelance income selected `AND` any of Payoneer/Wise/foreign-client receipts implied by screening answers `AND` no entry exists under "Income from Social Media Content" or export income lines -> **flag: possible platform/export income omitted from its dedicated line**.
13. `IF` Opening Stock this year != Closing Stock declared last year (when prior return available for comparison) -> **flag: stock figure discontinuity**.
14. `IF` "Inadmissible Deductions" total = 0 `AND` Admissible Deductions include large discretionary categories (entertainment, donations inside business accounts) -> **flag: possible failure to add back inadmissible items**.

### E. Wealth statement & reconciliation checks
15. `IF` (Closing Net Assets − Opening Net Assets) != (Declared Income − Declared Personal Expenses ± other reconciling items) -> **flag: reconciliation does not balance — IRIS will block submission**.
16. `IF` an asset type is implied by screening answers (vehicle, gold, multiple bank accounts, foreign assets) `AND` that category is absent from the wealth statement -> **flag: likely omitted asset**.
17. `IF` foreign assets >= USD 100,000 or foreign income >= USD 10,000 (from screening or document) `AND` no Foreign Assets/Liabilities (section 9.1) entries exist -> **flag: missing mandatory Foreign Income & Assets Statement (s.116A)**.
18. `IF` Motor Vehicle entered `AND` Chassis No. blank -> **flag: incomplete asset record (mandatory sub-field missing)**.
19. `IF` Personal Expenses total looks implausibly low relative to declared income and asset base (e.g. household of a car + property with expenses near zero) -> **flag: understated personal expenditure — common self-inflicted audit trigger**.

### F. Credits, deductions, and exclusions
20. `IF` Zakat, Workers' Welfare Fund, or Educational Expenses claimed `AND` no supporting deduction basis is selected from the fixed list (not free text in the real form) -> **flag: unsupported deductible allowance claim**.
21. `IF` an "Exclusion" (e.g. from s.7E-style deemed-income tax) is claimed `AND` no legal reason is selected and no exclusion file is attached -> **flag: exclusion likely to be rejected — the real form requires both**.
22. `IF` teacher/researcher rebate claimed for Tax Year 2026 -> **flag: rebate not available this year (only reinstated for TY2023-2025)**.

### G. Late/procedural
23. `IF` filing date is after 30 September 2026 `AND` no ATL late-surcharge (Rs 25,000) payment entry exists -> **flag: ATL restoration payment missing**.

### H. Taxpayer-profile & reconciliation hygiene (added from righttaxadvisor.pk cross-check, 14 July 2026)
24. `IF` CNIC/NTN pattern looks malformed, or profile fields (mobile/email/address) look stale/placeholder -> **flag: outdated taxpayer profile — causes IRIS validation rejection independent of correct income figures**.
25. `IF` business/AOP structure is implied `AND` the document appears to be an individual taxpayer profile -> **flag: possible wrong taxpayer category after a structure change**.
26. `IF` a property sale shows only sale proceeds or only purchase price, with no computed gain -> **flag: capital gain miscalculated (must be sale price − cost, not raw proceeds)**.
27. `IF` a large asset purchase appears in the wealth statement with no matching bank withdrawal/loan/transfer in supporting documents -> **flag: source of funds not traceable, even if income and asset are both otherwise correctly declared**.
28. `IF` source-of-funds field says only "savings"/"personal income" with no identifiable supporting document type -> **flag: vague source of funds, a leading cause of FBR document requests**.
29. `IF` the document shows unresolved IRIS validation warnings, or no verification/e-sign confirmation -> **flag: return may be incomplete despite appearing filled — filing is not the same as verifying**.

### I. IRIS workflow & e-commerce mechanics (added from pfoc.com.pk cross-check, 14 July 2026)
30. `IF` a first-time NTN holder's document/context implies filing was attempted immediately after registration `AND` no registration order confirmation is evident -> **flag: registration (Form 181) may not be processed yet — causes "Task Not Enabled"**.
31. `IF` a profile-correction is described as attempted purely through IRIS self-service `AND` it concerns CNIC number or registered email -> **flag: these fields require an in-person RTO visit, not self-service (only mobile/address/bank details are self-service)**.
32. `IF` business/freelance income includes e-commerce/online-marketplace selling `AND` declared income looks lower than what payment-gateway/courier receipts imply from bank documents -> **flag: possible under-declaration versus third-party-reported WHT data — a confirmed real-world audit trigger under ss.177/214C**.
33. `IF` a refund is calculated in the return `BUT` no separate refund-application step or IBAN-match confirmation is evident -> **flag: refund not automatically payable — requires its own application and an exact IBAN match to the profile**.

**Note on rate verification:** this cross-check surfaced a conflicting cash-withdrawal rate claim (0.9% vs the app's 0.8%). I verified against the official TY2026 withholding rate card and the Ordinance's s.231AB text directly: **0.8% is correct**; the third-party site's 0.9% figure was not adopted. This is a reminder to verify numeric claims against a primary or rate-card source before changing anything the calculators output.

---

## 6. Round 3 research (14 July 2026) — targeted search, no new site nominated

A broader search for "FBR tax year 2026 common mistakes" mostly returned US-IRS content (not applicable to Pakistan) and one Pakistani source, paktaxcalculator.pk, which was reviewed directly.

**Result: mostly duplicate, one rate conflict rejected, one genuine addition kept.**

- Its "common mistakes" list (wrong tax year, undeclared freelance income, missing wealth statement, missed credits, wrong refund bank details, no acknowledgment, late filing) all already existed in this ruleset under different rule IDs — no new rules added for these.
- Its cited withholding rates (cash withdrawal 0.15% filer / 0.6% non-filer; property 236C 3% filer / 6% non-filer) **conflict with the official TY2026 rate card already verified** in Round 2 (0.8% cash withdrawal; 4.5–5.5% seller property bands). These were **not adopted** — treat that site's rate figures as unreliable pending its own correction.
- One genuinely useful addition: **concrete mandatory-filing thresholds** independent of tax payable — annual salary above Rs 600,000, a motor vehicle 1000cc+, property/assets worth Rs 5 million+, or a commercial/industrial utility connection. This is now folded into the existing "not filing below threshold" mistake (rule E9-adjacent) rather than added as a new duplicate tile, and captured as **rule J34** in the ruleset below.

### J. Mandatory-filing thresholds (added Round 3)
34. `IF` screening/documents imply annual salary > Rs 600,000, a motor vehicle 1000cc+, property/assets ≥ Rs 5 million, or a commercial/industrial utility connection `AND` the person's framing suggests they believe filing is optional due to low tax -> **flag: filing is mandatory on these criteria alone, regardless of tax payable**.

---

## 7. Round 4 — statutory-obligation layer (from Income Tax Ordinance 2001)

**Honesty note on the source:** the site nominated (tax-sahulat.com/sections) renders its section database with JavaScript, so its text could not be scraped directly — web_fetch returns only the empty page shell, and the sandbox host allowlist blocks it. Rather than fabricate a scrape, I built this layer from **primary-sourced Ordinance content** (the same statute that site indexes), verified across multiple independent references. So the *robustness* the request asked for is delivered, sourced honestly, even though the extraction method differs from a direct scrape. For the authoritative current text, tax-sahulat.com/sections and FBR's official pages remain the references.

This layer shifts the algorithm from "what looks wrong" to "what the law actually penalizes, and by how much."

### K. Statutory obligations & penalties
35. `IF` a return is filed without the s.116 wealth statement where required -> **flag: legally incomplete; s.182 penalty 0.1% of taxable income per week or Rs 20,000, whichever is higher**.
36. `IF` a resident individual meets the foreign income/asset threshold but no s.116A foreign income & assets statement is present -> **flag: separate statutory statement missing, own s.182 penalty**.
37. `IF` salary tax deducted doesn't reconcile with the employer's deposited figure (s.149) -> **flag: employer under-deduction -> 12% p.a. default surcharge + penalty of 10% of tax not deducted (ss.161/205); employee return may also be flagged**.
38. `IF` a post-filing error is found and the person intends to ignore rather than revise -> **flag: s.114(6A) — voluntary revision before a s.177 audit or s.122(9) notice carries no penalty; during/after audit +25%; after show-cause +50%. Revise early**.
39. `IF` filing is late -> **flag: s.182 minimum Rs 1,000/day, floor Rs 10,000 (salaried) / Rs 40,000 (non-salaried), cap 25% of tax payable; plus ATL loss until the late-filer surcharge is paid**.

### Penalty quick-reference table (Income Tax Ordinance 2001)

| Failure | Section | Consequence |
|---|---|---|
| Late/non-filing of return | 182(1) | Rs 1,000/day; floor Rs 10,000 salaried / Rs 40,000 non-salaried; cap 25% of tax payable |
| No wealth statement / reconciliation | 182 (ref. 114/115/116) | 0.1% of taxable income per week, or Rs 20,000, whichever is higher |
| No foreign income & assets statement | 182 (ref. 116A) | Separate penalty for the missing statement |
| Kept off ATL for late filing | 182A | ATL excluded until late-filer surcharge paid |
| Employer salary under-deduction | 149 / 161 / 205 | 12% p.a. default surcharge + 10% of tax not deducted |
| Voluntary revision before audit/notice | 114(6A) | No penalty; +25% during/after audit; +50% after show-cause |
| False statement in verification; ignoring notices | 191 / 192 | Prosecutable — fine and/or imprisonment |

These K-rules and the table are wired into the app's chatbot knowledge base and GapCheck ruleset so the assistant can answer "what's the penalty for X" with a specific section and figure, and flag incomplete filings against the statutory requirement, not just against form structure.

---

## 8. Round 5 — verification against the primary statutes (uploaded PDFs)

The user supplied the two governing statutes as PDFs: the **Income Tax Ordinance 2001 amended up to 30 June 2026** (839 pp) and the **Sales Tax Act 1990 amended up to 30 June 2025 with Finance Act 2025 changes** (208 pp). These are the authoritative primary sources, so this round *verified and corrected* figures the app previously carried from secondary sources rather than adding new rules.

**Confirmed correct (no change needed):**
- Salaried slabs for TY2026: 0% / 1% / (6,000+11%) / (116,000+23%) / (346,000+30%) / (616,000+35%) at breakpoints 600k / 1.2M / 2.2M / 3.2M / 4.1M — matches the First Schedule exactly.
- Business/AOP slabs: 0% up to 600k, then 15% / 20% / 30% / 40% / 45% — matches.
- Sales Tax Act standard rate 18%; sales-tax default surcharge 12% p.a. or KIBOR+3% whichever is higher — matches.
- s.236C / s.236K property advance tax named in the property schedule — matches.

**Corrected against the statute:**
- **s.182 late-filing penalty** — was stated as "Rs 1,000/day, floor Rs 10,000 salaried / Rs 40,000 non-salaried, cap 25%." The actual statute: higher of 0.1% of tax payable/day OR Rs 1,000/day; minimum **Rs 10,000 (salaried 75%+ income) / Rs 50,000 all other cases** (not Rs 40,000); **maximum 200% of tax payable** (not 25%); plus a **75%/50%/25% reduction** if filed within 1/2/3 months of the due date (this reduction was previously missing). Rules K39 and the penalty table updated.
- **s.182 wealth-statement penalty** — was "0.1% of taxable income per week or Rs 20,000 whichever is higher"; the current s.182(1) reads 0.1% of tax payable **per day**, minimum **Rs 500**, maximum **25%** of tax payable. Rule K35 and the table updated.

**Clarified (subtle but important — surcharge):**
- The uploaded Ordinance (amended to 30 June 2026) shows the s.4AB surcharge as **10% with a proviso exempting salaried individuals**, because it already incorporates the **Finance Act 2026** text, which governs **Tax Year 2027**. For the **TY2026 return being filed now**, the correct figure is **9%, applying to salaried individuals** (Finance Act 2025). The app's calculator (9%) is correct for TY2026; the AI knowledge base now carries the TY2026-vs-TY2027 distinction explicitly so forward-looking questions get the right answer without breaking the current-year calculation. A redundant surcharge ternary in the calculator code was also simplified (both branches were an identical 9%).

**Method note:** both PDFs have clean text layers, so figures were read directly from the statutory tables and s.182 text, then the surcharge timing was cross-checked against Finance Act 2025/2026 commentary to resolve which year each version applies to. This is the strongest provenance tier in the whole project — primary legislation rather than practitioner summaries — and it caught two real numeric errors that had propagated from secondary sources in earlier rounds.

### Updated penalty quick-reference table (corrected against ITO 2001, amended to 30 June 2026)

| Failure | Section | Consequence |
|---|---|---|
| Late/non-filing of return | 182(1) Table | Higher of 0.1% of tax payable/day or Rs 1,000/day; min Rs 10,000 (salaried 75%+) / Rs 50,000 (others); max 200% of tax payable; reduced 75/50/25% if filed within 1/2/3 months of due date |
| No wealth statement / s.115(4) statement | 182(1) | 0.1% of tax payable per day; min Rs 500; max 25% of tax payable |
| No foreign income & assets statement | 182 (ref. 116A) | Separate penalty for the missing statement |
| Kept off ATL for late filing | 182A | ATL excluded until late-filer surcharge paid (current Finance Act figure) |
| Employer salary under-deduction | 149 / 161 / 205 | 12% p.a. default surcharge + 10% of tax not deducted |
| Voluntary revision before audit/notice | 114(6A) | No penalty; +25% during/after audit; +50% after show-cause |
| High-income surcharge (TY2026) | 4AB | 9% of income tax where taxable income > Rs 10M; applies to salaried in TY2026; withdrawn for salaried / abolished from TY2027 |
| Sales tax (for reference) | STA 1990 s.3 / s.34 | Standard rate 18%; default surcharge 12% p.a. or KIBOR+3%, whichever higher |

---

## 10. Round 7 — Fixed Tax Scheme for small shopkeepers (feature + knowledge)

The app was salaried-heavy, so a dedicated shopkeeper feature was added around the government's new **Special Procedure for Small Shopkeepers (Fixed Tax Scheme), Tax Year 2026**, which FBR formally notified on **28 July 2026** (announced 5 June 2026; enacted via the Finance Act 2026 framework). Verified across Dawn, Express Tribune, Business Recorder, PwC's Finance Bill 2026 memo, and ProPakistani's 28 July notification report.

**Confirmed scheme facts built into the app (eligibility checker + 1% calculator + AI knowledge):**
- Optional; 1% of annual turnover (total sales), not profit-based; withholding tax already suffered is adjustable against it.
- Minimum Rs 25,000 at filing via a one-page return (Urdu/Sindhi/Pashto/Balochi); tax paid must be at least the prior year's.
- Eligibility: turnover ≤ Rs 200 million, income mainly from retail shopkeeping, only ONE shop.
- Excluded: turnover over Rs 200M in any of the last 3 years, multiple shops, Tier-1 retailers, jewellers, wholesalers/distributors/manufacturers/importers, and professionals (doctors/engineers/lawyers).
- Benefits: no POS machine, generally no audits (risk-based only), FBR QR-code shop plate, no field-officer raids on plated shops, ATL status, lower withholding.
- Register via IRIS, the FBR Shopkeepers' Mobile App, or a tax office.

**Honest framing coded into the feature:** the eligibility check is presented as guidance, not a formal ruling (it points users to FBR/IRIS to confirm), and the AI knowledge explicitly tells users to compare — 1% of turnover can be more OR less than tax on actual profit depending on margins — and that it is NOT an amnesty. This keeps the app from pushing people into a scheme that might not suit them.

**Provenance note:** unlike the primary-statute rounds, the fine detail here comes from the FBR press notification and budget commentary plus reputable news reporting, because the scheme is brand new (notified the day before this build) and the full SRO text wasn't available to read directly. The feature and AI both flag this recency and tell users to verify current specifics on IRIS — appropriate calibration for a just-launched scheme.

---

## 9. Round 6 — FBR master law index review (fbr.gov.pk/act-rules-ordinances/131226)

Reviewed FBR's official index of all tax legislation (~50 Acts, Ordinances, and Rules). This confirmed the app already covers the two core statutes and let me map the full statutory context and add recent amending instruments the app's knowledge predated.

**Confirmed the app's coverage is complete on the primary laws:** Income Tax Ordinance 2001, Income Tax Rules 2002, Sales Tax Act 1990, Sales Tax Rules 2006, Federal Excise Act 2005, Customs Act 1969, ICT (Tax on Services) Ordinance 2001, Benami Transactions (Prohibition) Act 2017 — all now cited in the knowledge base's governing-statutes block with their FBR index as the authoritative source.

**Added — recent amending instruments (verified via search of the gazette text):**
- **Tax Laws (Amendment) Ordinance, 2025** (promulgated 2 May 2025): inserted **s.138(3A)** and **s.140(6A)** — tax becomes *immediately recoverable* once a High Court or Supreme Court decides the underlying issue, **even if a demand was stayed** by any court/forum. Also added **s.175C** empowering FBR to post Inland Revenue officers at business premises to monitor production and stock. This is a material enforcement shift, now captured as **rule L40** (flag + route to a practitioner when someone assumes a court stay protects them from recovery) and in the knowledge base.
- **Tax Laws (Amendment) Act, 2024** and **Finance Act 2025** enforcement/policy changes: e-commerce tax regime, pension income taxation, 3-year audit-reselection immunity (s.177/214C), the move toward "eligible/ineligible person" framing alongside the ATL, and the IT/ITeS export 0.25% rate extended (widely reported through 2029, some sources to 2036 — flagged as needing verification against the final statute before quoting a specific end date).

**Context-only (did not add as active rules):** the historic amnesty/declaration laws (Foreign Assets Declaration and Repatriation Act 2018, Voluntary Declaration of Domestic Assets Act 2018, Assets Declaration Ordinance 2019) are noted in the knowledge base as closed schemes so the assistant won't mistakenly advise relying on them.

**Honesty note:** the FBR index page links to each statute's own sub-page and downloadable PDF; it doesn't itself contain section text. The primary Income Tax Ordinance and Sales Tax Act were already reviewed directly from the user-supplied PDFs in Round 5, so this round is a *completeness and currency* pass — confirming nothing core is missing and folding in the amendment instruments — rather than a re-verification of figures. For any specific downstream Act (Customs, Federal Excise, provincial services), the app correctly points users to the FBR index rather than pretending to statutory depth it doesn't have.

---


## 3. Query-generator logic (dynamic, per submission)

Rather than a fixed FAQ, the assistant generates questions **only for the rules that actually fired** above, phrased for the taxpayer, in the interface language.

```
FOR each fired flag:
  question = TEMPLATES[flag.code].format(specifics_from_document)
  ORDER by severity (structural > wealth-statement > credits > procedural)
  LIMIT to what's answerable before re-analysis (avoid overwhelming the user)
```

Example generated queries (English; would render in Urdu when `lang=ur`):
- Rule 4 fires -> *"We couldn't find your employer's NTN in the salary section — do you have your employer's registration number so we can add it?"*
- Rule 9 fires -> *"Your [address] property from last year's wealth statement doesn't appear this year, and there's no disposal record — did you sell, gift, or transfer it? If not, it may just need re-confirming."*
- Rule 15 fires -> *"Your assets grew by Rs [X] more than your declared income and expenses explain — is there an inflow we're missing, like a gift, inheritance, or loan?"*
- Rule 17 fires -> *"You mentioned foreign assets — since the threshold is USD 100,000, do you have the value in USD so we can check if the separate Foreign Assets Statement is required?"*

This logic is now implemented as the operating instructions for the app's "Check my return" AI analysis (see Section 5), so results are traceable to a specific rule rather than free-form impressions.

---

## 4. Old vs New form — what could be verified

**Honesty note:** I have the actual TY2026 draft gazette (SRO 835) but not a byte-for-byte copy of the prior year's (TY2025) notified form PDF to diff against directly. The comparison below combines (a) structural features *confirmed present* in the TY2026 gazette text itself, against (b) the previously-filed IRIS return structure as documented in FBR's own prior-year form and widely-reported practitioner commentary. Treat column B as "best available record of the old process," not a verified document diff. If you can supply the TY2025 SRO/notification PDF, I can re-run this as an actual page-by-page comparison.

| Feature | Old process (TY2025 and earlier) | TY2026 (confirmed in SRO 835 text) |
|---|---|---|
| Employer identification | Salary entered as a lump figure; employer NTN not a mandatory linked field | **Employer Registration No. is a required, searchable field** tied to the salary schedule |
| Property income | Often entered as a single rental figure | **Per-property selection required**, with prior-year properties carried forward for confirmation |
| Wealth statement carry-forward | Assets re-typed each year | **System pre-lists "properties declared for previous Tax Year"** — must be confirmed/updated, not silently dropped |
| Social media / platform income | No dedicated line; folded into "other business income" | **Explicit "Income from Social Media Content" line** under Business |
| Foreign assets | Reported within the general wealth statement | **Separate Foreign Assets/Liabilities section (9.1)** with IBAN + Country fields, distinct from local wealth (9.2) |
| Exclusions (e.g. deemed-income tax) | Often free-text justification | **Structured reason selector + mandatory file upload** for the exclusion to be accepted |
| Motor vehicle records | Registration number typically sufficient | **Registration No. AND Chassis No.** both required fields |
| Advance tax on property (236C/236K) | Referenced generically | **Named explicitly by section number** within the property tax-deduction schedule, reinforcing it's a distinct adjustable credit, not a final cost |

---

## 5. How this is wired into the app

The "Check my return" (GapCheck) feature's AI instructions have been updated to run this exact ruleset against uploaded documents and screening answers — rather than open-ended review — and its generated `missing[]` / `askUser[]` output now traces back to a rule ID (A1-G23) so results are consistent and explainable across different uploads. See `SYSTEM_PROMPT` in `pakistan-tax-assistant.jsx` for the wired version.
