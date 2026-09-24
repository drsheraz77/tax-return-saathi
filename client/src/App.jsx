import React, { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// FBR Tax Return Assistant — English / اردو
// Guidance tool for the NEW FBR return form (SRO 835(I)/2026)
// Tax Year 2026 (income: July 2025 – June 2026). Filing on IRIS.
// This is a guidance tool only — not affiliated with FBR.
// ─────────────────────────────────────────────────────────────

const COLORS = {
  green: "#0B3D2E",
  green2: "#155E43",
  gold: "#C9A227",
  paper: "#F6F4EC",
  ink: "#1D2321",
  red: "#A63A28",
};

// Tax Year 2026 slabs (Finance Act 2025) — income Jul 2025–Jun 2026
const SALARIED_SLABS = [
  { upTo: 600000, fixed: 0, rate: 0, base: 0 },
  { upTo: 1200000, fixed: 0, rate: 0.01, base: 600000 },
  { upTo: 2200000, fixed: 6000, rate: 0.11, base: 1200000 },
  { upTo: 3200000, fixed: 116000, rate: 0.23, base: 2200000 },
  { upTo: 4100000, fixed: 346000, rate: 0.3, base: 3200000 },
  { upTo: Infinity, fixed: 616000, rate: 0.35, base: 4100000 },
];

const BUSINESS_SLABS = [
  { upTo: 600000, fixed: 0, rate: 0, base: 0 },
  { upTo: 1200000, fixed: 0, rate: 0.15, base: 600000 },
  { upTo: 1600000, fixed: 90000, rate: 0.2, base: 1200000 },
  { upTo: 3200000, fixed: 170000, rate: 0.3, base: 1600000 },
  { upTo: 5600000, fixed: 650000, rate: 0.4, base: 3200000 },
  { upTo: Infinity, fixed: 1610000, rate: 0.45, base: 5600000 },
];

function computeTax(income, slabs, salaried) {
  if (!income || income <= 0) return { tax: 0, surcharge: 0, total: 0 };
  const slab = slabs.find((s) => income <= s.upTo) || slabs[slabs.length - 1];
  const tax = slab.fixed + (income - slab.base) * slab.rate;
  const surcharge = income > 10000000 ? tax * 0.09 : 0;
  return { tax, surcharge, total: tax + surcharge };
}

const fmt = (n) =>
  "Rs " + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ── Bilingual copy ───────────────────────────────────────────
const T = {
  en: {
    dir: "ltr",
    appTitle: "Tax Return Saathi",
    appSub: "Review your return before filing on IRIS · Tax Year 2026",
    langBtn: "اردو",
    disclaimer:
      "Education-only review — this AI cannot access or reproduce FBR checks, confirm figures, or predict notices. File your official return on IRIS (iris.fbr.gov.pk) and verify figures with a tax advisor.",
    tabs: { check: "Analyze Your Tax Return", checklist: "Prepare my documents", guide: "Filing guide", mistakes: "Common errors", scenarios: "Examples", notice: "FBR notice guidance", shop: "For shopkeepers", calc: "Tax estimator", chat: "Ask a guide" },
    noticeHeroTitle: "Got a letter or notice from FBR? Don't panic.",
    noticeHeroSub: "Upload a photo of it, or type what it says. We'll explain it in simple words — what it means, what you must do, and by when. Free, private, and in your language.",
    noticeHeroCalm: "A notice is not a punishment. Most are routine and can be sorted out by replying on time. We'll walk you through it.",
    noticeUploadBtn: "📷 Upload a photo of the notice",
    noticeUploadPrivacy: "Before uploading: this file is sent through the app’s server-side managed AI pathway only to provide an educational explanation. It is not stored in this app’s database, does not submit a return or make a binding tax decision, and should not include passwords, OTPs, bank-account details, or an unmasked CNIC number.",
    noticeTypeBtn: "⌨️ Or type what it says",
    noticeTypePlaceholder: "Type or paste the notice text here — even a few lines helps",
    noticeExplainBtn: "Explain this to me",
    noticeReading: "Reading your notice carefully…",
    noticeListenBtn: "🔊 Listen to this explanation",
    noticeResultTitle: "Here's what your notice means",
    noticeWhatItIs: "What this is",
    noticeWhatToDo: "What you need to do",
    noticeDeadline: "Your deadline",
    noticeSeverity: "How serious is this?",
    noticeSevLow: "Routine — usually easy to handle",
    noticeSevMed: "Needs your attention soon",
    noticeSevHigh: "Serious — consider getting help",
    noticeGetHelp: "When to get a professional",
    noticeAskFollowup: "Ask a question about this notice",
    noticeStartOver: "Explain a different notice",
    noticeDisclaimer: "This is a plain-language explanation to help you understand, not legal advice. For anything serious — a demand for money, an audit, or a court matter — please talk to a tax lawyer or the FBR helpline (051-111-772-772).",
    noticeErr: "I couldn't read that clearly. Try a clearer photo, or type the main lines of the notice instead.",
    noticeNeedInput: "Please upload a photo or type the notice text first.",
    checklistTab: "My documents checklist",
    checklistTitle: "What papers do YOU need? Let's find out.",
    checklistSub: "Answer a few quick questions. We'll build a checklist made just for your situation — not the long generic list everyone else shows. Tick items off as you gather them.",
    clNext: "Next",
    clBack: "Back",
    clSeeList: "Show my checklist",
    clQ1: "How do you earn? (tap all that apply)",
    clQ1opts: [
      { id: "salary", label: "A job / salary" },
      { id: "business", label: "A shop or business" },
      { id: "freelance", label: "Freelancing / online work" },
      { id: "rent", label: "Rent from property" },
      { id: "foreign", label: "Money from abroad" },
      { id: "pension", label: "Pension" },
      { id: "agri", label: "Farming / agriculture" },
    ],
    clQ2: "What do you own? (tap all that apply)",
    clQ2opts: [
      { id: "property", label: "House / plot / shop" },
      { id: "vehicle", label: "Car / motorcycle" },
      { id: "bank", label: "Bank account(s)" },
      { id: "savings", label: "Savings certificates / prize bonds" },
      { id: "gold", label: "Gold / investments" },
      { id: "foreignAsset", label: "Anything abroad" },
    ],
    clQ3: "Is this your first time filing?",
    clYes: "Yes, first time",
    clNo: "No, I've filed before",
    clResultTitle: "Your personal document checklist",
    clResultSub: "Gather these before you start on IRIS. Tap each one as you find it.",
    clProgress: "gathered",
    clAlways: "Everyone needs these",
    clPrint: "🖨️ Print / Save as PDF",
    clShare: "📲 Share on WhatsApp",
    clRestart: "Start over",
    clShareText: "My FBR tax return document checklist (Tax Year 2026):",
    clDone: "You've got everything! You're ready to file. 🎉",
    shopTab: "For shopkeepers",
    shopTitle: "Are you a shopkeeper? There's a simpler way to file.",
    shopIntro: "The government's new Fixed Tax Scheme (Special Procedure for Small Shopkeepers, Tax Year 2026) lets small retailers pay a simple 1% of their yearly sales instead of the complicated full return — with no POS machine and generally no audits. Let's check if it fits you.",
    shopWhatTitle: "What is this scheme?",
    shopWhat: [
      "You pay 1% of your total yearly sales (turnover) — not a complicated profit calculation.",
      "A minimum of Rs 25,000 is due when you file. Any withholding tax already deducted from you is adjusted against what you owe.",
      "It's optional — you can join it, or keep filing the normal return.",
      "You file a simple one-page form, available in Urdu, Sindhi, Pashto and Balochi.",
      "No POS machine required, and generally no tax audits or shop visits.",
      "You get an FBR plate with a QR code for your shop, ATL (active filer) status, and lower withholding taxes.",
    ],
    shopEligTitle: "Can you join? Quick check",
    shopQ_turnover: "Are your shop's total yearly sales under Rs 200 million (20 crore)?",
    shopQ_oneShop: "Do you own just ONE shop (not multiple outlets)?",
    shopQ_retail: "Is your income mainly from retail shopkeeping (not wholesale, import, or manufacturing)?",
    shopQ_notExcluded: "Are you NOT a jeweller, and NOT a doctor / engineer / lawyer / other professional?",
    shopYes: "Yes",
    shopNo: "No",
    shopCheckBtn: "Check my eligibility",
    shopEligibleTitle: "Good news — you look eligible! ✅",
    shopEligibleBody: "Based on your answers, you appear to qualify for the Fixed Tax Scheme. You can register through the IRIS portal, the FBR Shopkeepers' Mobile App, or your nearest tax office.",
    shopNotEligibleTitle: "This scheme may not fit you",
    shopNotEligibleBody: "Based on your answers, you likely don't qualify — but that's okay. You can still file the normal return, and the rest of this app (guide, calculator, document checklist) is here to help you do it simply.",
    shopCalcTitle: "Estimate your fixed tax",
    shopCalcLabel: "Your total yearly sales (turnover) in Rs",
    shopCalcPlaceholder: "e.g. 5000000",
    shopCalcResult: "Your 1% fixed tax would be about",
    shopCalcMin: "Since the minimum is Rs 25,000, you would pay at least that amount (withholding tax already deducted is then adjusted against it).",
    shopCalcNote: "This is an estimate to help you understand the scheme. Your actual tax must also be at least what you paid last year. Confirm details on IRIS or with FBR before filing.",
    shopAskAI: "Ask a question about this scheme",
    shopEligNote: "This is a simple guide, not a formal eligibility ruling. Confirm with FBR (helpline 051-111-772-772) or on the IRIS portal before deciding.",
    privacyLink: "Privacy & Disclaimer",
    privacyBack: "← Back to the app",
    privacyTitle: "Privacy & Disclaimer",
    privacyUpdated: "Last updated: July 2026",
    privacySections: [
      { h: "This is a guidance tool, not official FBR service", b: "Tax Return Saathi is an independent, free educational tool. It is NOT affiliated with, endorsed by, or connected to the Federal Board of Revenue (FBR) or the Government of Pakistan. Your official tax return must always be filed on FBR's own IRIS portal at iris.fbr.gov.pk." },
      { h: "This is not legal or tax advice", b: "The explanations, calculators, checklists, and AI answers here are to help you understand your taxes in simple language. They are general information, not professional advice for your specific situation. Tax figures and rules can change and can be interpreted differently. For any important decision — especially a demand for money, an audit, a court matter, or a large or unusual transaction — please consult a qualified tax advisor or lawyer, or call the FBR helpline on 051-111-772-772." },
      { h: "What happens to documents and notices you upload", b: "When you use the pre-filing return review or notice explainer, the file or text you provide is sent through this app's server-side managed AI pathway to generate an educational explanation, and the response is shown back to you. Your uploads are used only to answer that request. This app does not persist your uploaded content in its own database, build a profile of you, or sell your data. The review cannot access or reproduce FBR checks, submit a return, make a binding tax decision, or predict whether FBR will raise a notice; please avoid uploading passwords, OTPs, bank-account details, or unmasked CNIC numbers." },
      { h: "What we store on your device", b: "The app runs in your browser. Your answers to the checklist and calculators stay on your device during your visit and are not sent anywhere except when an AI feature needs them. We do not require you to create an account or give your CNIC, password, or bank details to use the tool — and you should never enter your IRIS password anywhere except the real IRIS site." },
      { h: "Accuracy and your responsibility", b: "We work hard to keep information correct and verified against the Income Tax Ordinance 2001 and FBR's forms, but we cannot guarantee it is complete or current for your case. You remain responsible for what you file. Always confirm figures on IRIS before submitting your return." },
      { h: "Security reminder", b: "Never share your IRIS password, CNIC PIN, or banking OTP with anyone — including anyone claiming to be from FBR or from this app. FBR will not ask for your password. This app will never ask for it either." },
    ],
    privacyContact: "Questions? This tool is provided as a free public service. For official matters, contact FBR directly at iris.fbr.gov.pk or 051-111-772-772.",
    checkTitle: "Review your completed income tax return before filing",
    checkSub: "Upload a redacted completed return and selected supporting pages. AI will highlight visible gaps or possible discrepancies for you to verify before you submit on IRIS.",
    checkPrivacy: "This is an education-only review. It cannot access or reproduce FBR checks, confirm your figures, predict notices, submit a return, or make a binding tax decision. Your redacted file is sent through the app's server-side managed AI pathway for this analysis and is not persisted in this app's database. Do not upload passwords, OTPs, bank-account details, or an unmasked CNIC number.",
    redactionConfirm: "I confirm that I removed or masked passwords, OTPs, full CNIC numbers, and bank, account, card, or IBAN details before selecting files.",
    redactionHint: "This check is for your safety; it does not verify file contents. Upload only pages needed for this educational review.",
    redactionGuideTitle: "Show a safe redaction example",
    redactionGuide: "Before selecting a file, mask passwords, OTPs, complete CNIC numbers, signatures, bank or card numbers, IBANs, account details, barcodes, QR codes, and unrelated personal details. Keep only the return fields or notice text needed for your question. The app cannot confirm whether a document is safely redacted, so re-check every selected page yourself.",
    redactionRequired: "Confirm that you removed or masked restricted data before selecting documents.",
    reviewTrustBoundary: "Independent preparation support, not an FBR service. For a demand, audit, court matter, or unresolved complex issue, use official FBR guidance or a qualified tax adviser before acting.",
    qIncome: "Which income sources did you have this year (Jul 2025 – Jun 2026)?",
    incomeOpts: [
      { id: "salary", label: "Salary" },
      { id: "business", label: "Business / Freelancing" },
      { id: "rent", label: "Rental income" },
      { id: "profit", label: "Bank profit / Dividends / Savings" },
      { id: "foreign", label: "Foreign income / Remittances" },
      { id: "pension", label: "Pension" },
      { id: "agri", label: "Agricultural income" },
      { id: "gains", label: "Sold property or shares (capital gains)" },
    ],
    qAssets: "Which of these do you own?",
    assetOpts: [
      { id: "property", label: "House / Plot / Shop" },
      { id: "vehicle", label: "Car / Motorcycle" },
      { id: "banks", label: "More than one bank account" },
      { id: "gold", label: "Gold / Investments / Prize bonds" },
      { id: "foreignAssets", label: "Foreign assets (USD 100,000+)" },
    ],
    qFirst: "Is this your first time filing?",
    yes: "Yes",
    no: "No",
    uploadLabel: "Upload a redacted completed return (PDF or photo, up to 3 files, max 4 MB each)",
    uploadHint: "Completed return printout and, if needed, redacted salary/tax certificate or wealth-statement pages",
    analyzeBtn: "Review my return",
    analyzing: "Reviewing visible entries and possible gaps…",
    tooBig: "is too large (max 4 MB). Please compress or re-scan it.",
    badType: "isn't a PDF or image. Please upload PDF, JPG, or PNG.",
    needFile: "Please upload at least one document first.",
    resFound: "✓ Visible in your submitted pages",
    resMissing: "✗ Potential gaps to verify",
    resWarnings: "⚠ Possible discrepancies to check",
    resAsk: "Questions to resolve before submitting",
    checkAgain: "Review another redacted return",
    analyzeError: "Analysis failed. Please try again — if the file is a scanned photo, make sure it's clear and readable.",
    mistakesTitle: "12 mistakes that trigger notices, penalties, or lost refunds",
    mistakesSub: "The errors tax practitioners and educators see most often on IRIS — check your return against this list before you press submit.",
    fixLabel: "The fix",
    mistakes: [
      { t: "Choosing the wrong return type", d: "Filing the simplified salaried form 114(I) while also having freelance, business, or rental income creates a mismatch that commonly leads to audit notices.", f: "114(I) is only for those whose salary dominates their income. Any business, freelance, or rental income means the normal return." },
      { t: "Selecting the wrong tax year", d: "Filing this September you're reporting Tax Year 2026 — income from 1 July 2025 to 30 June 2026. Picking the wrong year files a return for the wrong period entirely.", f: "Confirm the year and period shown at the top of the form before entering anything." },
      { t: "Trusting auto-filled data blindly", d: "IRIS pre-populates salary and withholding figures from employer filings. If the employer under-reported or made errors, submitting without checking makes their mistake your declaration.", f: "Verify every auto-filled figure against your salary certificate and payslips before submitting." },
      { t: "Missing adjustable taxes you already paid", d: "Tax withheld on mobile top-ups, bank transactions, vehicle token, electricity bills, and property deals is adjustable — skipping these entries means paying tax twice or shrinking your refund.", f: "Collect certificates from your mobile operator, banks, and excise office; enter every withholding in the adjustable tax tab." },
      { t: "Leaving small assets out of the wealth statement", d: "Omitting a motorcycle, a dormant savings account, or prize bonds triggers red flags when FBR's data-matching finds them — large undeclared bank deposits are a classic notice generator.", f: "Declare everything: all bank accounts, vehicles, gold, cash in hand, investments. Completeness is protection." },
      { t: "Submitting income return without the wealth statement", d: "For most individuals the return is legally incomplete without the wealth statement — incomplete filing means penalties and no ATL status despite 'filing'.", f: "Treat the wealth statement as part of the return, not an optional extra." },
      { t: "Forcing the reconciliation to zero", d: "Plugging fake expense or gift figures to make the wealth reconciliation balance creates declarations you can't defend when a notice asks for evidence.", f: "If it doesn't reconcile, find the real cause — an undeclared inflow, a forgotten asset, understated expenses — before submitting." },
      { t: "Claiming credits and deductions without documents", d: "Donation deductions need receipts from FBR-approved organizations with valid NTNs; Zakat and education claims need proper proof. Undocumented claims invite rejection and scrutiny.", f: "Only claim what you can evidence, and file the receipts where you can find them for six years." },
      { t: "Not filing because income is below the threshold", d: "If tax was withheld on your salary, bank profit, or phone despite low income, not filing means abandoning your own money — refunds are only claimable through a return. Filing is also mandatory on its own terms in several cases regardless of tax owed: annual salary above Rs 600,000, owning a motor vehicle of 1000cc or above, owning property or other assets worth Rs 5 million or more, or holding a commercial/industrial electricity or gas connection.", f: "File to claim the refund and gain ATL benefits, even with zero tax payable — and check the mandatory-filing criteria above, since some of them apply even to people who assume they're too small to need to file." },
      { t: "Ignoring platform and foreign income", d: "Money received via Payoneer, Wise, or JazzCash from Upwork, Fiverr, or YouTube is taxable and increasingly tracked; leaving it out contradicts your own bank record.", f: "Declare it — with proper banking channels, IT export income is taxed at just 1% (0.25% for PSEB-registered)." },
      { t: "Filing in the last week of September", d: "The portal slows to a crawl near the deadline, and rushed returns carry errors that take months to fix; missing the date now costs Rs 25,000 for ATL restoration.", f: "File in August or early September. If you spot an error after submitting, a revision is possible — act promptly rather than hoping it goes unnoticed." },
      { t: "Stopping after submission", d: "Not downloading the acknowledgement and CPR, or never checking ATL status, leaves you without proof of filing when a bank, embassy, or property deal demands it.", f: "Save the acknowledgement slip and payment receipts, then verify your name on the ATL after it updates." },
      { t: "Outdated taxpayer profile (CNIC, mobile, email, address)", d: "A CNIC digit typo, an old mobile number, or an inactive email in your IRIS profile causes validation errors and return rejection — separate from your actual income figures being correct.", f: "Open your Taxpayer Profile in IRIS and verify CNIC, date of birth, mobile, and email before you start the return itself." },
      { t: "Filing under the wrong taxpayer category after a structure change", d: "If you changed from sole proprietor to AOP, or your business registration changed, but you keep filing in your old individual profile, IRIS flags a mismatch that stalls processing.", f: "Update your taxpayer registration category first if your business structure changed, then file under the correct profile." },
      { t: "Reporting property sale proceeds as income instead of computing the gain", d: "Some filers enter the full sale amount as income, or only the purchase price, instead of calculating capital gain = sale price minus cost. Both produce a wrong tax figure.", f: "Keep the purchase deed, sale agreement, and valuation record, and let the gain — not the raw sale proceeds — flow into Capital Gains." },
      { t: "Buying an asset with no matching bank withdrawal", d: "Even when the asset and the income are both declared correctly, if the cash used to buy a car or property doesn't trace to a bank withdrawal or documented source, the wealth statement still triggers a source-of-funds query.", f: "When you buy something significant, make sure the payment trail (bank withdrawal, transfer, loan) is visible and consistent with the purchase in the same return." },
      { t: "Writing \"savings\" as the source of funds with nothing behind it", d: "A vague label without supporting salary slips, business profit records, gift deeds, or inheritance papers is one of the most common reasons FBR requests documentary evidence after filing.", f: "Match every large source-of-funds entry to a real document you can produce if asked — salary, business profit, gift, inheritance, remittance, or loan agreement." },
      { t: "Ignoring IRIS validation messages or skipping final verification", d: "IRIS often flags incomplete or inconsistent entries before submission; clicking through these — or filling the return but never completing the verification/e-sign step — leaves the return legally incomplete even though it looks finished on screen.", f: "Read every validation message and resolve it rather than dismissing it, and confirm the return shows as verified and submitted, not just saved." },
      { t: "Filing before Form 181 registration is actually processed", d: "A first-time NTN holder often tries to file immediately after registering and hits a \"Task Not Enabled\" error — IRIS won't allow a return until the registration order (Form 181) has finished processing in the background, which can take time.", f: "After registering, check your \"Completed Tasks\" folder for the registration order before attempting to file. If it's not there yet, wait rather than assuming the system is broken." },
      { t: "Trying to self-service a CNIC or email change", d: "Mobile number, address, and bank account details can be updated yourself in IRIS via Form 181. CNIC number and registered email cannot — those require an in-person visit to your Regional Tax Office, and skipping this means the change silently fails.", f: "For CNIC or email corrections, don't keep retrying online — book an RTO visit with your documents; for mobile/address/bank details, use IRIS self-service directly." },
      { t: "Online sellers: declared income lower than what payment gateways/couriers report", d: "For e-commerce sellers, banks, payment gateways, and courier companies report your receipts directly to FBR. If your declared business income is lower than what they've reported for you, it's flagged as a high-risk mismatch — this is a leading real-world audit trigger for online sellers, not a theoretical risk.", f: "Before filing, reconcile your declared sales against your own payment gateway and courier statements — don't rely on memory or bank balance alone. Cash-on-delivery and digital-payment receipts may be withheld at different rates, so total them separately." },
      { t: "Assuming a refund is automatic once shown in the return", d: "A calculated refund appearing in your return isn't enough — claiming it requires a separate refund application within IRIS, and the payout IBAN must exactly match the bank account already on your profile, or payment stalls.", f: "After filing, submit the specific refund application, and double-check your registered IBAN matches the account you want paid into." },
      { t: "One bad row breaking a bulk Excel data import", d: "Business filers importing sales or purchase data via Excel find that a single incorrect or incomplete row causes IRIS to roll back the entire file — nothing gets imported, not just the bad row.", f: "Validate every row before uploading, and if an import fails, check for the one flagged record rather than assuming the whole file format is wrong." },
      { t: "Ignoring digital invoicing integration if your business is required to have it", d: "Businesses required to integrate point-of-sale or invoicing systems with FBR face a flat penalty (Rs 50,000 or 2% of the related tax) for not transmitting digital invoices, and a running daily charge for unresolved data objections on submitted invoices.", f: "If digital invoicing integration applies to your business type, treat it as urgent — the daily-charge structure means delay compounds quickly, unlike a one-time fine." },
    ],
    scenariosTitle: "Learn from real cases",
    scenariosSub:
      "Practical lessons from real cases and the most common taxpayer situations covered by Pakistani tax educators — including public commentary of tax expert Amer Sharif (@AmerSharifOFCL).",
    scenariosCredit: "Drawn from public commentary, FBR guidance, and popular tax education content · paraphrased, not legal advice",
    lessonLabel: "The lesson",
    scenarios: [
      {
        title: "You receive an FBR notice — never ignore it",
        story:
          "A citizen received notices under Section 122(9) asking for evidence to support claims in his return. He didn't furnish evidence. FBR amended his assessment, raised a demand of Rs 30 million, and — after formal demand notices under Sections 137/138 — recovered Rs 3 crore directly from his bank account under Section 140. FBR is legally empowered to do this once the notice-demand-recovery chain completes.",
        lesson:
          "Respond to every notice within the deadline, with documents. The sequence is: 122(9) notice → your chance to explain → amended assessment → demand (137/138) → direct bank recovery (140). Your reply window is the only stage where you control the outcome. And never, ever submit fake or forged documents — in this case forged appeal orders were sent to the bank, which is a criminal matter.",
      },
      {
        title: "Resident or non-resident? Your return must match reality",
        story:
          "A well-known overseas Pakistani publicly described himself as a non-resident expat, but in his own filed returns he had declared himself a resident individual — a status carrying full tax liability on worldwide income. He claimed over Rs 23 million of foreign income as exempt each year but couldn't substantiate the exemption when asked.",
        lesson:
          "Residency status is roughly determined by days spent in Pakistan (183+ days in the tax year generally makes you resident). Declare it correctly and consistently, and keep proof (passport entry/exit stamps, employment contracts abroad) for any foreign-income exemption you claim. An exemption you can't document is a liability waiting to surface.",
      },
      {
        title: "The new Rs 25,000 late-filer surcharge",
        story:
          "The ATL surcharge for late filers jumped from Rs 1,000 to Rs 25,000 — a 2,400% increase. Example: you plan a property or vehicle transaction in October 2026 but miss the 30 September deadline. To appear on the Active Taxpayer List and avoid punishing non-filer withholding rates, you'd now pay Rs 25,000 — regardless of whether you're resident or non-resident.",
        lesson:
          "File within the due date (30 September 2026) and ATL inclusion is free. If you've never filed and need filer rates for a transaction right now, filing the previous year's return late costs far less than facing non-filer rates — but from this year, lateness itself is expensive. The deadline is now a Rs 25,000 question.",
      },
      {
        title: "Careless filing is riskier than not knowing",
        story:
          "After a high-profile dispute between a taxpayer and FBR played out publicly, the takeaway offered was blunt: file your return yourself only if you genuinely understand tax law. Seasonal consultants who appear every September, and YouTube tutorials, produce returns with errors that the taxpayer — not the consultant — answers for years later.",
        lesson:
          "There is very little room for a common taxpayer when it comes to mistakes or incorrect declarations. Every figure you submit is your legal declaration. Use the AI assistant here to understand your return, but for complex affairs (foreign income, business losses, notices) engage a proper tax practitioner — and keep copies of everything you file.",
      },
      {
        title: "Your salary claim must exist in your employer's records",
        story:
          "Under the new form, salary is entered by searching your employer's name or NTN, and FBR auto-matches your declaration against that employer's payroll withholding statements. If you claim salary from an employer whose submissions don't recognize you — a common trick previously used to convert undocumented income into 'salary' — the system can flag your return automatically, opening inquiries into unexplained income and wealth.",
        lesson:
          "Tax being deducted from your payslip does not automatically mean you're compliant. Confirm your employer actually files withholding statements with your CNIC, get your annual tax certificate, and enter figures exactly as certified. If you have salary arrears, termination benefits, or a second employer during the year, the form asks about each — declare them; don't merge them into one number.",
      },
      {
        title: "The wealth statement is a locked gate, not a formality",
        story:
          "IRIS will not let you submit your return unless your wealth statement reconciles: this year's wealth minus last year's wealth must equal your income minus your expenses. Many first-time filers discover at the final step that their declared assets grew more than their declared income can explain — and the submit button simply won't work.",
        lesson:
          "Prepare the reconciliation before you start: list assets at 30 June 2026 at purchase cost (not market value), gather last year's closing figures, and account for every inflow (salary, rent, profit, remittances, gifts) and outflow. If you're resident with foreign income of $10,000+ or foreign assets of $100,000+, a separate foreign income and assets statement is also mandatory — missing it carries its own penalties.",
      },
      {
        title: "Freelancer on Upwork/Fiverr — your rate depends on your banking channel",
        story:
          "A freelancer earning $1,500 a month assumed online income was invisible. But FBR now digitally tracks foreign remittances landing in Pakistani banks — Payoneer, Wise, and direct wires all leave a footprint. The rules actually favor compliant freelancers: qualifying IT/ITeS export income is taxed at just 1% of receipts as final tax, and PSEB-registered freelancers get 0.25%. But at least 80% of foreign earnings must arrive through official banking channels — income kept offshore or received informally is taxed at the steep business slabs, up to 45%.",
        lesson:
          "Route your earnings through a Pakistani bank account (or Payoneer/Wise linked to one), collect a PRC (proceeds realization certificate) for each remittance, and consider PSEB registration for the 0.25% rate. Report gross platform earnings and claim the platform's commission as an expense. One misconception to drop: filing a W-8BEN on Upwork only concerns US tax — it does nothing for your Pakistani obligations.",
      },
      {
        title: "Overseas Pakistani — remittances are not income, but residency is everything",
        story:
          "Many overseas Pakistanis make opposite mistakes. Some declare their foreign remittances as taxable income — unnecessary, since remittances through official channels are not taxed as income. Others keep a 'resident' status on file from years ago while living abroad; FBR now cross-matches travel records, banking data, and property ownership, and a wrongly-recorded resident status makes worldwide income (that Dubai salary, that UK business) taxable in Pakistan, triggering automated notices.",
        lesson:
          "Establish your residency status correctly each year — generally under 183 days in Pakistan makes you non-resident, taxed only on Pakistan-source income (rent, bank profit, capital gains here). Don't over-declare remittances as income; do declare Pakistan-source income properly. If you pay tax abroad, Pakistan's Double Taxation Agreements with 65+ countries protect you — but only if your status is correctly established with FBR.",
      },
      {
        title: "Earning below Rs 600,000? Filing still pays for itself",
        story:
          "A shopkeeper earning under the taxable threshold thought filing was pointless — zero tax means zero benefit, right? Then he noticed he was paying double withholding on cash withdrawals, faced higher rates registering a motorcycle, and risked a SIM block as enforcement tightened. When he filed a nil-tax return, his bank updated his withholding category within days; one filer saved over Rs 60,000 in excess withholding in a year.",
        lesson:
          "Filing when you owe no tax costs a couple of hours and puts you on the ATL — halving withholding rates on banking, property, and vehicles. But a nil return still needs a credible wealth statement: declaring Rs 180,000 annual income while showing a car and property invites the question of how you live. Declare income honestly and make the reconciliation add up, even in a simple return.",
      },
      {
        title: "Hiring a professional? Know the fair price and the right process",
        story:
          "Many taxpayers either overpay seasonal consultants or hand over documents blindly. Established online filing services publish flat rates that make a useful benchmark: roughly Rs 4,000/year for a simple salaried return, Rs 6,000 for salary plus other income (rent, dividends, capital gains), Rs 7,000 for non-resident Pakistanis, Rs 7,500 for freelancers, and case-based quotes for business income. First-time filers also pay a one-time FBR registration cost (around Rs 1,500) on top of any service fee. Typical requirements: CNIC (front and back), salary slip or certificate, bank statements of all accounts, tax deduction certificates, and an assets/liabilities/expenses summary.",
        lesson:
          "Whatever service you use, insist on two things: a preview of the completed return for your approval before anything is submitted to FBR, and the official acknowledgement afterwards. Never share your IRIS password casually, and remember every figure filed is your declaration, not the consultant's. If you've missed several years, back-year returns can be filed — each tax year is treated and priced separately.",
      },
      {
        title: "Teachers: the 25% rebate ended with Tax Year 2025 — don't claim it this year",
        story:
          "The 25% tax rebate for full-time teachers and researchers in HEC-recognized non-profit institutions was withdrawn in 2022, kept being claimed by mistake, triggered FBR recovery notices in 2024, and was then reinstated retroactively — but only for tax years 2023, 2024 and 2025. It is not available for Tax Year 2026 onwards. A teacher who claims it in this year's return is making an incorrect declaration; one who never claimed it for the covered back years is leaving money on the table.",
        lesson:
          "For the return you file this September (TY2026), calculate tax at full slab rates without the rebate. But if you paid full tax for 2023–2025, you can pursue the retroactive rebate for those years through revision/refund. Note the exclusion: medical teachers earning from private practice don't qualify. Keep your employment letter from the recognized institution as evidence.",
      },
      {
        title: "Selling property? The advance tax is not your final tax",
        story:
          "A seller paid advance tax under Section 236C at transfer and assumed the matter was closed. In fact 236C is adjustable: your real liability is capital gains tax, and the advance tax is credited against it in your return — one seller who paid Rs 300,000 advance against a Rs 250,000 CGT liability claimed the Rs 50,000 difference as a refund. CGT itself depends on when you bought: property acquired on or after 1 July 2024 carries a flat 15% for filers regardless of holding period, while older acquisitions use holding-period slabs that can fall to 0% after six years. Meanwhile the notorious Section 7E 'deemed income' tax on property has been struck down by the Federal Constitutional Court and deleted by the Finance Act 2026 — the 7E certificate hurdle at transfer is gone.",
        lesson:
          "File your return to claim the credit for every advance tax paid on property deals — non-filers can't. Record acquisition dates and costs carefully since they determine your CGT slab, and note that one personal-use residence (15 years of use, declared in your wealth statement) can qualify for exemption from seller advance tax under the Finance Act 2025 conditions. From July 2026, advance rates also drop to a flat 2.75% for sellers and 1.25% for buyers on ATL.",
      },
    ],
    whoTitle: "Who are you filing as?",
    who: [
      { id: "salaried", label: "Salaried person", note: "Employer deducts tax from your salary" },
      { id: "business", label: "Business / Freelancer", note: "Shop, practice, freelancing, online income" },
      { id: "property", label: "Property owner", note: "Rental income from house, shop or plaza" },
      { id: "pension", label: "Pensioner / Other", note: "Pension, bank profit, savings certificates" },
    ],
    newBadge: "New in the 2026 form",
    stepsTitle: "What the new form asks you for",
    beforeTitle: "Before you start — documents to gather",
    startOver: "Change taxpayer type",
    calcTitle: "Estimate your tax (Tax Year 2026)",
    calcPick: "What do you want to calculate?",
    calcTypes: {
      income: "Income tax",
      rent: "Rental income",
      elec: "Electricity bill",
      mobile: "Mobile & internet",
      bank: "Bank profit",
      prop: "Property deal",
      cash: "Cash withdrawal",
    },
    atlQ: "Are you on the Active Taxpayer List (filer)?",
    filer: "Filer (ATL)",
    nonFiler: "Non-filer",
    annualRent: "Annual rent received (Rs)",
    rentNote: "Individual/AOP rental slabs under Section 155 / Division VIA. Non-filers face higher withholding under the Tenth Schedule.",
    monthlyBill: "Monthly electricity bill (Rs)",
    consumerType: "Consumer type",
    domestic: "Domestic",
    commercial: "Commercial",
    industrial: "Industrial",
    elecNote: "Section 235. Domestic consumers on the ATL pay no withholding; non-filers pay 7.5% on bills of Rs 25,000+ per month. Commercial/industrial withholding is adjustable in your return.",
    monthlySpend: "Monthly mobile/internet spend (Rs)",
    mobileNote: "Section 236: 15% advance tax is withheld on mobile top-ups, phone and internet bills. It is fully adjustable — file a return to claim it back.",
    profitAmt: "Bank profit received in the year (Rs)",
    bankNote: "Section 151. For most individuals this is a final tax; profit above Rs 5 million falls under normal rates. Non-filers face double withholding.",
    propValue: "Property value (FBR valuation) (Rs)",
    propRole: "Are you buying or selling?",
    buying: "Buying (236K)",
    selling: "Selling (236C)",
    propNote: "TY2026 filer rates by value band. This advance tax is adjustable against your actual liability. One personal-use residence (15 years use, declared) may be exempt from 236C. From 1 July 2026 rates become flat: seller 2.75%, buyer 1.25% (ATL).",
    withdrawAmt: "Cash withdrawal in one day (Rs)",
    cashNote: "Section 231AB: non-filers pay 0.8% advance tax when daily withdrawals exceed Rs 50,000. Filers on the ATL pay nothing — the strongest everyday reason to file.",
    perMonth: "Per month",
    perYear: "Per year",
    taxWithheld: "Tax withheld",
    adjustable: "✓ Adjustable — claim it in your return",
    noTax: "No tax applies in this case.",
    calcNote:
      "Rates per Finance Act 2025, for income earned 1 July 2025 – 30 June 2026. A 9% surcharge applies above Rs 10 million. Estimates only.",
    incomeLabel: "Annual taxable income (Rs)",
    typeSalaried: "Salaried (salary ≥ 75% of income)",
    typeBusiness: "Business / Non-salaried",
    taxDue: "Income tax",
    surcharge: "Surcharge (9%)",
    totalTax: "Total estimated tax",
    monthly: "≈ per month",
    effective: "Effective rate",
    chatTitle: "Ask anything about your return",
    chatHint:
      'e.g. "My employer never gave me a tax certificate — what do I do?" or "How do I declare my YouTube income?"',
    chatPlaceholder: "Type your question in English or Urdu…",
    send: "Send",
    thinking: "Thinking…",
    chatError: "Something went wrong. Please try again.",
    listening: "Listening… speak now",
    micStart: "Speak",
    micStop: "Stop",
    voiceOn: "🔊 Voice replies: On",
    voiceOff: "🔇 Voice replies: Off",
    voiceUnsupported:
      "Voice input isn't supported in this browser. Please try Chrome or Edge.",
    steps: {
      common: [
        {
          t: "Register / log in to IRIS",
          d: "You need an NTN (your CNIC number acts as it for individuals). Log in at iris.fbr.gov.pk. First-time filers register with CNIC, mobile SIM in their own name, and email.",
          isNew: false,
        },
        {
          t: "Link your bank account (IBAN)",
          d: "The new form asks you to link your primary bank account to your FBR profile. Refunds are now paid automatically into this account — no separate application.",
          isNew: true,
        },
        {
          t: "Declare income source-by-source",
          d: "The 2026 form no longer accepts lump-sum entries. Every income source is declared separately with the payer's details — the system cross-checks these against bank, employer and withholding records.",
          isNew: true,
        },
        {
          t: "Profit on bank accounts, dividends & savings",
          d: "Enter each institution separately: bank name, profit received, tax deducted. Same for dividends, National Savings, Sukuk and family pension. Get profit/withholding certificates from every bank.",
          isNew: true,
        },
        {
          t: "Wealth statement (reconciliation)",
          d: "Declare all assets (property, vehicles, bank balances, gold, cash) and liabilities at 30 June 2026, and reconcile the change from last year against your income and expenses.",
          isNew: false,
        },
        {
          t: "Review, submit, and stay on the ATL",
          d: "Verify the auto-calculated tax, pay any balance via PSID, and submit before 30 September 2026. Filing on time keeps you on the Active Taxpayer List — halving many withholding taxes.",
          isNew: false,
        },
      ],
      salaried: [
        {
          t: "Salary with employer's NTN",
          d: "You must now enter your employer's NTN or CNIC alongside your salary. The system automatically matches your declaration with the employer's withholding statements — mismatches trigger notices (Section 161).",
          isNew: true,
        },
        {
          t: "Salary tax certificate",
          d: "Get your annual salary & tax deduction certificate from your employer's HR/finance for July 2025 – June 2026. Enter gross salary, taxable salary and total tax deducted exactly as certified.",
          isNew: false,
        },
      ],
      business: [
        {
          t: "Business income with expense detail",
          d: "Declare turnover/receipts and claim actual expenses. Keep records — the new system cross-verifies against digital invoicing and bank data.",
          isNew: false,
        },
        {
          t: "Social media & content income",
          d: "The 2026 form has a dedicated section for income from social media — posts, views, channel monetization. Freelance/IT export income may qualify for reduced rates; keep remittance proof (PRCs).",
          isNew: true,
        },
      ],
      property: [
        {
          t: "Property-by-property rental declaration",
          d: "Lump-sum rental entries are gone. Each property must be declared individually: full address, sub-type, rent received, and the deductible expenses for that specific property.",
          isNew: true,
        },
        {
          t: "Agricultural land (if any)",
          d: "Agricultural income now needs parcel-level detail: khasra/field number, location, and income per parcel. Keep provincial agricultural tax receipts.",
          isNew: true,
        },
      ],
      pension: [
        {
          t: "Pension section",
          d: "The new form has a dedicated 'Your Pension' page. Declare pension separately from other income; most government pensions remain exempt but must still be declared.",
          isNew: true,
        },
      ],
    },
    docs: {
      salaried: [
        "CNIC + IRIS login",
        "Employer's NTN number",
        "Salary & tax deduction certificate (Jul 2025 – Jun 2026)",
        "Bank profit / withholding certificates from every bank",
        "Mobile operator tax certificate (Jazz, Zong, Telenor, Ufone)",
        "Utility bills if tax was withheld (electricity)",
        "Details of assets: property, car, bank balances at 30 Jun 2026",
        "IBAN of your primary bank account",
      ],
      business: [
        "CNIC + IRIS login",
        "Summary of receipts / sales for the year",
        "Expense records (rent, salaries, utilities, purchases)",
        "Bank statements for all business accounts",
        "PRCs / remittance proof for foreign or freelance income",
        "Withholding certificates (bank, mobile, imports)",
        "Assets & liabilities at 30 Jun 2026",
        "IBAN of your primary bank account",
      ],
      property: [
        "CNIC + IRIS login",
        "Complete address & type of each rented property",
        "Rent received per property (agreements help)",
        "Property tax / insurance / repair receipts per property",
        "Tenant withholding certificates if tax was deducted",
        "Khasra / parcel details for agricultural land",
        "Assets & liabilities at 30 Jun 2026",
        "IBAN of your primary bank account",
      ],
      pension: [
        "CNIC + IRIS login",
        "Pension book / annual pension statement",
        "Bank profit certificates from every bank",
        "National Savings / Behbood certificate statements",
        "Assets & liabilities at 30 Jun 2026",
        "IBAN of your primary bank account",
      ],
    },
  },

  ur: {
    dir: "rtl",
    appTitle: "ٹیکس ریٹرن ساتھی",
    appSub: "IRIS پر جمع کرانے سے پہلے اپنا ریٹرن چیک کریں · ٹیکس سال ۲۰۲۶",
    langBtn: "English",
    disclaimer:
      "یہ صرف تعلیمی جانچ ہے — یہ اے آئی ایف بی آر کی جانچ تک رسائی نہیں رکھتا، اسے نقل نہیں کر سکتا، اعداد کی تصدیق یا نوٹس کی پیش گوئی نہیں کر سکتا۔ سرکاری ریٹرن IRIS (iris.fbr.gov.pk) پر جمع کریں اور اعداد کی ٹیکس مشیر سے تصدیق کروائیں۔",
    tabs: { check: "اپنا ٹیکس ریٹرن جانچیں · Analyze Your Tax Return", checklist: "دستاویزات تیار کریں", guide: "فائلنگ رہنمائی", mistakes: "عام غلطیاں", scenarios: "مثالیں", notice: "ایف بی آر نوٹس رہنمائی", shop: "دکانداروں کے لیے", calc: "ٹیکس اندازہ", chat: "رہنمائی پوچھیں" },
    noticeHeroTitle: "ایف بی آر سے خط یا نوٹس آیا ہے؟ گھبرائیں نہیں۔",
    noticeHeroSub: "اس کی تصویر اپ لوڈ کریں، یا جو لکھا ہے وہ ٹائپ کریں۔ ہم آسان الفاظ میں سمجھائیں گے — اس کا مطلب کیا ہے، آپ کو کیا کرنا ہے، اور کب تک۔ مفت، نجی، اور آپ کی زبان میں۔",
    noticeHeroCalm: "نوٹس کوئی سزا نہیں۔ زیادہ تر معمولی ہوتے ہیں اور وقت پر جواب دے کر حل ہو جاتے ہیں۔ ہم آپ کے ساتھ ہیں۔",
    noticeUploadBtn: "📷 نوٹس کی تصویر اپ لوڈ کریں",
    noticeUploadPrivacy: "اپ لوڈ کرنے سے پہلے: یہ فائل صرف تعلیمی وضاحت دینے کے لیے ایپ کے سرور سائیڈ مینیجڈ اے آئی راستے سے گزرتی ہے۔ یہ اس ایپ کے ڈیٹابیس میں محفوظ نہیں کی جاتی، ریٹرن جمع نہیں کرتی اور نہ ہی حتمی ٹیکس فیصلہ کرتی ہے۔ پاس ورڈ، OTP، بینک اکاؤنٹ کی تفصیلات یا بغیر چھپایا ہوا شناختی کارڈ نمبر شامل نہ کریں۔",
    noticeTypeBtn: "⌨️ یا جو لکھا ہے وہ ٹائپ کریں",
    noticeTypePlaceholder: "نوٹس کا متن یہاں ٹائپ یا پیسٹ کریں — چند سطریں بھی مددگار ہیں",
    noticeExplainBtn: "مجھے یہ سمجھائیں",
    noticeReading: "آپ کا نوٹس غور سے پڑھا جا رہا ہے…",
    noticeListenBtn: "🔊 یہ وضاحت سنیں",
    noticeResultTitle: "آپ کے نوٹس کا مطلب یہ ہے",
    noticeWhatItIs: "یہ کیا ہے",
    noticeWhatToDo: "آپ کو کیا کرنا ہے",
    noticeDeadline: "آپ کی آخری تاریخ",
    noticeSeverity: "یہ کتنا سنگین ہے؟",
    noticeSevLow: "معمولی — عموماً آسانی سے حل ہو جاتا ہے",
    noticeSevMed: "جلد توجہ درکار ہے",
    noticeSevHigh: "سنگین — مدد لینے پر غور کریں",
    noticeGetHelp: "پیشہ ور مدد کب لیں",
    noticeAskFollowup: "اس نوٹس کے بارے میں سوال پوچھیں",
    noticeStartOver: "کوئی اور نوٹس سمجھیں",
    noticeDisclaimer: "یہ سمجھنے میں مدد کے لیے آسان زبان میں وضاحت ہے، قانونی مشورہ نہیں۔ کسی سنگین معاملے — رقم کے مطالبے، آڈٹ، یا عدالتی معاملے — کے لیے کسی ٹیکس وکیل یا ایف بی آر ہیلپ لائن (051-111-772-772) سے رابطہ کریں۔",
    noticeErr: "میں اسے واضح طور پر نہیں پڑھ سکا۔ صاف تصویر لیں، یا نوٹس کی اہم سطریں ٹائپ کریں۔",
    noticeNeedInput: "پہلے تصویر اپ لوڈ کریں یا نوٹس کا متن ٹائپ کریں۔",
    checklistTab: "میری دستاویزات کی فہرست",
    checklistTitle: "آپ کو کون سے کاغذات چاہئیں؟ آئیے معلوم کریں۔",
    checklistSub: "چند آسان سوالوں کے جواب دیں۔ ہم صرف آپ کی صورتحال کے مطابق فہرست بنائیں گے — وہ لمبی عام فہرست نہیں جو باقی سب دکھاتے ہیں۔ جیسے جیسے کاغذات جمع کریں، نشان لگاتے جائیں۔",
    clNext: "آگے",
    clBack: "پیچھے",
    clSeeList: "میری فہرست دکھائیں",
    clQ1: "آپ کی آمدنی کیسے ہوتی ہے؟ (سب پر ٹیپ کریں جو لاگو ہوں)",
    clQ1opts: [
      { id: "salary", label: "نوکری / تنخواہ" },
      { id: "business", label: "دکان یا کاروبار" },
      { id: "freelance", label: "فری لانسنگ / آن لائن کام" },
      { id: "rent", label: "جائیداد کا کرایہ" },
      { id: "foreign", label: "بیرونِ ملک سے رقم" },
      { id: "pension", label: "پنشن" },
      { id: "agri", label: "کھیتی باڑی / زراعت" },
    ],
    clQ2: "آپ کے پاس کیا کچھ ہے؟ (سب پر ٹیپ کریں جو لاگو ہوں)",
    clQ2opts: [
      { id: "property", label: "مکان / پلاٹ / دکان" },
      { id: "vehicle", label: "گاڑی / موٹر سائیکل" },
      { id: "bank", label: "بینک اکاؤنٹ" },
      { id: "savings", label: "بچت سرٹیفکیٹ / پرائز بانڈ" },
      { id: "gold", label: "سونا / سرمایہ کاری" },
      { id: "foreignAsset", label: "بیرونِ ملک کوئی چیز" },
    ],
    clQ3: "کیا آپ پہلی بار فائل کر رہے ہیں؟",
    clYes: "جی ہاں، پہلی بار",
    clNo: "نہیں، پہلے فائل کیا ہے",
    clResultTitle: "آپ کی ذاتی دستاویزات کی فہرست",
    clResultSub: "IRIS پر شروع کرنے سے پہلے یہ جمع کریں۔ ہر ایک ملنے پر اس پر ٹیپ کریں۔",
    clProgress: "جمع ہو گئے",
    clAlways: "یہ سب کو درکار ہیں",
    clPrint: "🖨️ پرنٹ / PDF محفوظ کریں",
    clShare: "📲 واٹس ایپ پر شیئر کریں",
    clRestart: "دوبارہ شروع کریں",
    clShareText: "میری ایف بی آر ٹیکس ریٹرن دستاویزات کی فہرست (ٹیکس سال ۲۰۲۶):",
    clDone: "آپ کے پاس سب کچھ ہے! آپ فائل کرنے کے لیے تیار ہیں۔ 🎉",
    shopTab: "دکانداروں کے لیے",
    shopTitle: "کیا آپ دکاندار ہیں؟ فائل کرنے کا ایک آسان طریقہ ہے۔",
    shopIntro: "حکومت کی نئی فکسڈ ٹیکس اسکیم (چھوٹے دکانداروں کے لیے خصوصی طریقہ کار، ٹیکس سال ۲۰۲۶) چھوٹے دکانداروں کو پیچیدہ مکمل ریٹرن کے بجائے اپنی سالانہ فروخت کا صرف ۱٪ ادا کرنے دیتی ہے — نہ POS مشین، نہ عام طور پر آڈٹ۔ آئیے دیکھیں کہ یہ آپ کے لیے موزوں ہے یا نہیں۔",
    shopWhatTitle: "یہ اسکیم کیا ہے؟",
    shopWhat: [
      "آپ اپنی کل سالانہ فروخت (ٹرن اوور) کا ۱٪ ادا کرتے ہیں — کوئی پیچیدہ منافع کا حساب نہیں۔",
      "فائل کرتے وقت کم از کم ۲۵٬۰۰۰ روپے واجب ہیں۔ آپ سے پہلے کاٹا گیا ودہولڈنگ ٹیکس اس میں ایڈجسٹ ہو جاتا ہے۔",
      "یہ اختیاری ہے — آپ اس میں شامل ہو سکتے ہیں، یا عام ریٹرن فائل کرتے رہ سکتے ہیں۔",
      "آپ ایک آسان ایک صفحے کا فارم بھرتے ہیں، جو اردو، سندھی، پشتو اور بلوچی میں دستیاب ہے۔",
      "کوئی POS مشین ضروری نہیں، اور عام طور پر کوئی آڈٹ یا دکان کا دورہ نہیں۔",
      "آپ کو اپنی دکان کے لیے QR کوڈ والی ایف بی آر پلیٹ، ATL (ایکٹو فائلر) اسٹیٹس، اور کم ودہولڈنگ ٹیکس ملتا ہے۔",
    ],
    shopEligTitle: "کیا آپ شامل ہو سکتے ہیں؟ فوری جانچ",
    shopQ_turnover: "کیا آپ کی دکان کی کل سالانہ فروخت ۲۰ کروڑ (۲۰۰ ملین) روپے سے کم ہے؟",
    shopQ_oneShop: "کیا آپ کی صرف ایک دکان ہے (کئی نہیں)؟",
    shopQ_retail: "کیا آپ کی آمدنی بنیادی طور پر پرچون دکانداری سے ہے (تھوک، درآمد یا مینوفیکچرنگ نہیں)؟",
    shopQ_notExcluded: "کیا آپ جیولر نہیں، اور ڈاکٹر / انجینئر / وکیل / کوئی اور پیشہ ور نہیں ہیں؟",
    shopYes: "جی ہاں",
    shopNo: "نہیں",
    shopCheckBtn: "میری اہلیت جانچیں",
    shopEligibleTitle: "خوشخبری — آپ اہل لگتے ہیں! ✅",
    shopEligibleBody: "آپ کے جوابات کے مطابق، آپ فکسڈ ٹیکس اسکیم کے لیے اہل معلوم ہوتے ہیں۔ آپ IRIS پورٹل، ایف بی آر شاپ کیپرز موبائل ایپ، یا اپنے قریبی ٹیکس آفس کے ذریعے رجسٹر ہو سکتے ہیں۔",
    shopNotEligibleTitle: "یہ اسکیم شاید آپ کے لیے موزوں نہ ہو",
    shopNotEligibleBody: "آپ کے جوابات کے مطابق، آپ غالباً اہل نہیں — لیکن کوئی بات نہیں۔ آپ پھر بھی عام ریٹرن فائل کر سکتے ہیں، اور اس ایپ کا باقی حصہ (رہنمائی، کیلکولیٹر، دستاویزات کی فہرست) آسانی سے کرنے میں آپ کی مدد کے لیے موجود ہے۔",
    shopCalcTitle: "اپنے فکسڈ ٹیکس کا اندازہ لگائیں",
    shopCalcLabel: "آپ کی کل سالانہ فروخت (ٹرن اوور) روپے میں",
    shopCalcPlaceholder: "مثلاً 5000000",
    shopCalcResult: "آپ کا ۱٪ فکسڈ ٹیکس تقریباً ہوگا",
    shopCalcMin: "چونکہ کم از کم ۲۵٬۰۰۰ روپے ہے، آپ کم از کم اتنی رقم ادا کریں گے (پہلے کاٹا گیا ودہولڈنگ ٹیکس پھر اس میں ایڈجسٹ ہوتا ہے)۔",
    shopCalcNote: "یہ اسکیم سمجھنے میں مدد کے لیے ایک اندازہ ہے۔ آپ کا اصل ٹیکس کم از کم اتنا بھی ہونا چاہیے جتنا آپ نے پچھلے سال ادا کیا۔ فائل کرنے سے پہلے IRIS پر یا ایف بی آر سے تصدیق کریں۔",
    shopAskAI: "اس اسکیم کے بارے میں سوال پوچھیں",
    shopEligNote: "یہ ایک آسان رہنمائی ہے، کوئی رسمی اہلیت کا فیصلہ نہیں۔ فیصلہ کرنے سے پہلے ایف بی آر (ہیلپ لائن 051-111-772-772) یا IRIS پورٹل سے تصدیق کریں۔",
    privacyLink: "پرائیویسی اور دستبرداری",
    privacyBack: "← ایپ پر واپس جائیں",
    privacyTitle: "پرائیویسی اور دستبرداری",
    privacyUpdated: "آخری تازہ کاری: جولائی ۲۰۲۶",
    privacySections: [
      { h: "یہ ایک رہنمائی کا آلہ ہے، سرکاری ایف بی آر سروس نہیں", b: "ٹیکس ریٹرن ساتھی ایک آزاد، مفت تعلیمی آلہ ہے۔ اس کا فیڈرل بورڈ آف ریونیو (ایف بی آر) یا حکومتِ پاکستان سے کوئی تعلق، الحاق یا توثیق نہیں۔ آپ کا سرکاری ٹیکس ریٹرن ہمیشہ ایف بی آر کے اپنے IRIS پورٹل iris.fbr.gov.pk پر ہی جمع ہونا چاہیے۔" },
      { h: "یہ قانونی یا ٹیکس مشورہ نہیں", b: "یہاں دی گئی وضاحتیں، کیلکولیٹر، فہرستیں اور اے آئی جوابات آپ کو آسان زبان میں اپنا ٹیکس سمجھنے میں مدد کے لیے ہیں۔ یہ عام معلومات ہیں، آپ کی مخصوص صورتحال کے لیے پیشہ ورانہ مشورہ نہیں۔ ٹیکس کے اعداد اور قوانین بدل سکتے ہیں اور مختلف تشریح ہو سکتی ہے۔ کسی اہم فیصلے — خاص طور پر رقم کے مطالبے، آڈٹ، عدالتی معاملے، یا بڑے یا غیر معمولی لین دین — کے لیے کسی مستند ٹیکس مشیر یا وکیل سے رجوع کریں، یا ایف بی آر ہیلپ لائن 051-111-772-772 پر کال کریں۔" },
      { h: "آپ کے اپ لوڈ کردہ دستاویزات اور نوٹسز کا کیا ہوتا ہے", b: "جب آپ فائلنگ سے پہلے ریٹرن جانچ یا نوٹس ایکسپلینر استعمال کرتے ہیں، تو آپ کی فراہم کردہ فائل یا متن تعلیمی وضاحت بنانے کے لیے اس ایپ کے سرور سائیڈ مینیجڈ اے آئی راستے سے گزرتا ہے، اور جواب آپ کو دکھایا جاتا ہے۔ آپ کے اپ لوڈ صرف اسی درخواست کا جواب دینے کے لیے استعمال ہوتے ہیں۔ یہ ایپ آپ کے اپ لوڈ کردہ مواد کو اپنے ڈیٹابیس میں محفوظ نہیں کرتی، آپ کی پروفائل نہیں بناتی، اور آپ کا ڈیٹا فروخت نہیں کرتی۔ یہ جانچ ایف بی آر کی جانچ تک رسائی نہیں رکھتی، اسے نقل نہیں کر سکتی، ریٹرن جمع نہیں کرتی، حتمی ٹیکس فیصلہ نہیں کرتی، اور نوٹس کی پیش گوئی نہیں کر سکتی؛ پاس ورڈ، OTP، بینک اکاؤنٹ کی تفصیلات، یا بغیر چھپایا ہوا شناختی کارڈ نمبر اپ لوڈ نہ کریں۔" },
      { h: "آپ کے آلے پر ہم کیا محفوظ کرتے ہیں", b: "ایپ آپ کے براؤزر میں چلتی ہے۔ فہرست اور کیلکولیٹر کے آپ کے جوابات آپ کے دورے کے دوران آپ ہی کے آلے پر رہتے ہیں اور کہیں نہیں بھیجے جاتے سوائے اس کے کہ کسی اے آئی فیچر کو ان کی ضرورت ہو۔ ٹول استعمال کرنے کے لیے آپ کو اکاؤنٹ بنانے یا اپنا شناختی کارڈ، پاس ورڈ یا بینک تفصیلات دینے کی ضرورت نہیں — اور آپ کو اپنا IRIS پاس ورڈ اصل IRIS سائٹ کے علاوہ کہیں درج نہیں کرنا چاہیے۔" },
      { h: "درستگی اور آپ کی ذمہ داری", b: "ہم معلومات کو انکم ٹیکس آرڈیننس ۲۰۰۱ اور ایف بی آر کے فارمز کے مطابق درست اور تصدیق شدہ رکھنے کی پوری کوشش کرتے ہیں، لیکن ہم آپ کے معاملے کے لیے اس کے مکمل یا موجودہ ہونے کی ضمانت نہیں دے سکتے۔ آپ جو فائل کرتے ہیں اس کی ذمہ داری آپ پر ہے۔ ریٹرن جمع کرانے سے پہلے ہمیشہ IRIS پر اعداد کی تصدیق کریں۔" },
      { h: "سیکیورٹی یاد دہانی", b: "اپنا IRIS پاس ورڈ، شناختی کارڈ پن، یا بینکنگ OTP کبھی کسی کے ساتھ شیئر نہ کریں — بشمول کوئی جو ایف بی آر یا اس ایپ سے ہونے کا دعویٰ کرے۔ ایف بی آر آپ سے پاس ورڈ نہیں مانگے گا۔ یہ ایپ بھی کبھی نہیں مانگے گی۔" },
    ],
    privacyContact: "سوالات؟ یہ آلہ ایک مفت عوامی خدمت کے طور پر فراہم کیا گیا ہے۔ سرکاری معاملات کے لیے ایف بی آر سے براہِ راست iris.fbr.gov.pk یا 051-111-772-772 پر رابطہ کریں۔",
    checkTitle: "جمع کرانے سے پہلے اپنا مکمل انکم ٹیکس ریٹرن جانچیں",
    checkSub: "اپنا چھپایا ہوا مکمل ریٹرن اور منتخب معاون صفحات اپ لوڈ کریں۔ اے آئی IRIS پر جمع کرانے سے پہلے نظر آنے والی کمی یا ممکنہ تضاد کی نشان دہی کرے گا تاکہ آپ اسے تصدیق کر سکیں۔",
    checkPrivacy: "یہ صرف تعلیمی جانچ ہے۔ یہ ایف بی آر کی جانچ تک رسائی نہیں رکھتا، اسے نقل نہیں کر سکتا، آپ کے اعداد کی تصدیق، نوٹس کی پیش گوئی، ریٹرن جمع، یا حتمی ٹیکس فیصلہ نہیں کر سکتا۔ آپ کی چھپائی ہوئی فائل اسی تجزیے کے لیے ایپ کے سرور سائیڈ مینیجڈ اے آئی راستے سے گزرتی ہے اور ایپ کے ڈیٹابیس میں محفوظ نہیں کی جاتی۔ پاس ورڈ، OTP، بینک اکاؤنٹ کی تفصیلات، یا بغیر چھپایا ہوا شناختی کارڈ نمبر اپ لوڈ نہ کریں۔",
    redactionConfirm: "میں تصدیق کرتا/کرتی ہوں کہ فائل منتخب کرنے سے پہلے میں نے پاس ورڈ، OTP، مکمل شناختی کارڈ نمبر، اور بینک، اکاؤنٹ، کارڈ یا IBAN کی تفصیلات ہٹا یا چھپا دی ہیں۔",
    redactionHint: "یہ جانچ صرف آپ کی حفاظت کے لیے ہے؛ یہ فائل کا مواد نہیں جانچتی۔ صرف وہ صفحات اپ لوڈ کریں جو اس تعلیمی جانچ کے لیے درکار ہوں۔",
    redactionGuideTitle: "محفوظ ریڈیکشن کی مثال دیکھیں",
    redactionGuide: "فائل منتخب کرنے سے پہلے پاس ورڈ، OTP، مکمل شناختی کارڈ نمبر، دستخط، بینک یا کارڈ نمبر، IBAN، اکاؤنٹ کی تفصیلات، بارکوڈ، QR کوڈ اور غیر متعلقہ ذاتی تفصیلات چھپا دیں۔ صرف وہ ریٹرن فیلڈز یا نوٹس متن رکھیں جو آپ کے سوال کے لیے درکار ہوں۔ اس ایپ کو یہ تصدیق کرنے کی صلاحیت نہیں کہ دستاویز محفوظ طور پر چھپائی گئی ہے، اس لیے ہر منتخب صفحہ خود دوبارہ دیکھیں۔",
    redactionRequired: "دستاویز منتخب کرنے سے پہلے تصدیق کریں کہ آپ نے محدود معلومات ہٹا یا چھپا دی ہیں۔",
    reviewTrustBoundary: "یہ آزاد تیاری کی مدد ہے، ایف بی آر سروس نہیں۔ رقم کے مطالبے، آڈٹ، عدالتی معاملے، یا کسی غیر حل شدہ پیچیدہ مسئلے میں کارروائی سے پہلے سرکاری ایف بی آر رہنمائی یا مستند ٹیکس مشیر سے رجوع کریں۔",
    qIncome: "اس سال (جولائی ۲۰۲۵ – جون ۲۰۲۶) آپ کی آمدنی کے ذرائع کون سے تھے؟",
    incomeOpts: [
      { id: "salary", label: "تنخواہ" },
      { id: "business", label: "کاروبار / فری لانسنگ" },
      { id: "rent", label: "کرائے کی آمدنی" },
      { id: "profit", label: "بینک منافع / ڈیویڈنڈ / بچت" },
      { id: "foreign", label: "غیر ملکی آمدنی / ترسیلات" },
      { id: "pension", label: "پنشن" },
      { id: "agri", label: "زرعی آمدنی" },
      { id: "gains", label: "جائیداد یا شیئر فروخت کیے (کیپٹل گین)" },
    ],
    qAssets: "ان میں سے کیا کچھ آپ کی ملکیت ہے؟",
    assetOpts: [
      { id: "property", label: "مکان / پلاٹ / دکان" },
      { id: "vehicle", label: "گاڑی / موٹر سائیکل" },
      { id: "banks", label: "ایک سے زیادہ بینک اکاؤنٹ" },
      { id: "gold", label: "سونا / سرمایہ کاری / پرائز بانڈ" },
      { id: "foreignAssets", label: "غیر ملکی اثاثے (۱ لاکھ ڈالر سے زائد)" },
    ],
    qFirst: "کیا آپ پہلی بار فائل کر رہے ہیں؟",
    yes: "جی ہاں",
    no: "نہیں",
    uploadLabel: "اپنا چھپایا ہوا مکمل ریٹرن اپ لوڈ کریں (PDF یا تصویر، زیادہ سے زیادہ ۳ فائلیں، ہر ایک ۴ ایم بی تک)",
    uploadHint: "مکمل ریٹرن پرنٹ اور، ضرورت ہو تو، چھپائے ہوئے تنخواہ/ٹیکس سرٹیفکیٹ یا ویلتھ اسٹیٹمنٹ کے صفحات",
    analyzeBtn: "میرا ریٹرن جانچیں",
    analyzing: "نظر آنے والے اندراجات اور ممکنہ کمی کا جائزہ لیا جا رہا ہے…",
    tooBig: "بہت بڑی ہے (زیادہ سے زیادہ ۴ ایم بی)۔ کمپریس کر کے دوبارہ کوشش کریں۔",
    badType: "PDF یا تصویر نہیں ہے۔ PDF، JPG یا PNG اپ لوڈ کریں۔",
    needFile: "پہلے کم از کم ایک دستاویز اپ لوڈ کریں۔",
    resFound: "✓ جمع کرائے گئے صفحات میں نظر آیا",
    resMissing: "✗ تصدیق کے لیے ممکنہ کمی",
    resWarnings: "⚠ جانچنے کے لیے ممکنہ تضاد",
    resAsk: "جمع کرانے سے پہلے حل طلب سوالات",
    checkAgain: "کوئی اور چھپایا ہوا ریٹرن جانچیں",
    analyzeError: "تجزیہ ناکام ہوا۔ دوبارہ کوشش کریں — اگر فائل اسکین شدہ تصویر ہے تو یقینی بنائیں کہ صاف اور پڑھنے کے قابل ہو۔",
    mistakesTitle: "۱۲ غلطیاں جو نوٹس، جرمانے یا ریفنڈ کے نقصان کا سبب بنتی ہیں",
    mistakesSub: "وہ غلطیاں جو ٹیکس ماہرین IRIS پر سب سے زیادہ دیکھتے ہیں — جمع کرانے سے پہلے اپنا ریٹرن اس فہرست سے ملا لیں۔",
    fixLabel: "حل",
    mistakes: [
      { t: "غلط قسم کا ریٹرن منتخب کرنا", d: "فری لانس، کاروباری یا کرائے کی آمدنی ہوتے ہوئے سادہ تنخواہ دار فارم 114(I) فائل کرنا ایسا تضاد پیدا کرتا ہے جو اکثر آڈٹ نوٹس کا سبب بنتا ہے۔", f: "114(I) صرف ان کے لیے ہے جن کی آمدنی کا بڑا حصہ تنخواہ ہو۔ کاروبار، فری لانس یا کرایہ ہو تو نارمل ریٹرن لازم ہے۔" },
      { t: "غلط ٹیکس سال کا انتخاب", d: "اس ستمبر آپ ٹیکس سال ۲۰۲۶ رپورٹ کر رہے ہیں — یکم جولائی ۲۰۲۵ تا ۳۰ جون ۲۰۲۶ کی آمدنی۔ غلط سال چننے سے پورا ریٹرن غلط مدت کا فائل ہو جاتا ہے۔", f: "کچھ بھی درج کرنے سے پہلے فارم کے اوپر دکھایا گیا سال اور مدت تصدیق کریں۔" },
      { t: "خودکار بھرے ڈیٹا پر آنکھ بند اعتماد", d: "IRIS آجر کے گوشواروں سے تنخواہ اور ودہولڈنگ خود بھر دیتا ہے۔ اگر آجر نے کم رپورٹ کیا یا غلطی کی تو بغیر جانچے جمع کرانا اس کی غلطی کو آپ کا اقرار بنا دیتا ہے۔", f: "ہر خودکار ہندسہ اپنے تنخواہ سرٹیفکیٹ اور سلپس سے ملا کر جمع کرائیں۔" },
      { t: "ادا شدہ ایڈجسٹ ہونے والے ٹیکس چھوڑ دینا", d: "موبائل لوڈ، بینک لین دین، گاڑی ٹوکن، بجلی کے بل اور جائیداد کے سودوں پر کٹا ٹیکس ایڈجسٹ ہوتا ہے — یہ اندراج چھوڑنے کا مطلب دوہرا ٹیکس یا چھوٹا ریفنڈ۔", f: "موبائل کمپنی، بینکوں اور ایکسائز سے سرٹیفکیٹ لیں؛ ہر ودہولڈنگ ایڈجسٹ ایبل ٹیکس ٹیب میں درج کریں۔" },
      { t: "ویلتھ اسٹیٹمنٹ سے چھوٹے اثاثے چھوڑنا", d: "موٹر سائیکل، غیر فعال بچت اکاؤنٹ یا پرائز بانڈ چھوڑنا ایف بی آر کی ڈیٹا میچنگ میں پکڑا جاتا ہے — بڑی غیر ظاہر شدہ بینک رقوم نوٹس کی کلاسک وجہ ہیں۔", f: "سب کچھ ظاہر کریں: تمام بینک اکاؤنٹس، گاڑیاں، سونا، نقدی، سرمایہ کاری۔ مکمل اظہار ہی تحفظ ہے۔" },
      { t: "ویلتھ اسٹیٹمنٹ کے بغیر ریٹرن جمع کرانا", d: "اکثر افراد کے لیے ویلتھ اسٹیٹمنٹ کے بغیر ریٹرن قانونی طور پر نامکمل ہے — نامکمل فائلنگ کا مطلب جرمانے اور 'فائل' کرنے کے باوجود ATL سے محرومی۔", f: "ویلتھ اسٹیٹمنٹ کو ریٹرن کا حصہ سمجھیں، اضافی چیز نہیں۔" },
      { t: "حساب ملانے کے لیے زبردستی اعداد ڈالنا", d: "ریکنسیلیئشن برابر کرنے کے لیے فرضی اخراجات یا تحائف ڈالنا ایسے اقرار بناتا ہے جن کا ثبوت نوٹس آنے پر آپ نہیں دے سکتے۔", f: "حساب نہ ملے تو اصل وجہ ڈھونڈیں — کوئی چھوٹی آمد، بھولا ہوا اثاثہ یا کم ظاہر اخراجات — پھر جمع کرائیں۔" },
      { t: "بغیر دستاویز کریڈٹ اور کٹوتیاں کلیم کرنا", d: "عطیات کی کٹوتی کے لیے ایف بی آر سے منظور شدہ اداروں کی درست NTN والی رسیدیں چاہئیں؛ زکوٰۃ اور تعلیمی کلیمز کے لیے ثبوت لازم ہے۔ بلا دستاویز کلیم مسترد ہوتے ہیں اور جانچ بلاتے ہیں۔", f: "صرف وہی کلیم کریں جس کا ثبوت ہو، اور رسیدیں چھ سال تک محفوظ رکھیں۔" },
      { t: "کم آمدنی پر فائل ہی نہ کرنا", d: "کم آمدنی کے باوجود اگر تنخواہ، بینک منافع یا فون پر ٹیکس کٹا ہے تو فائل نہ کرنا اپنی ہی رقم چھوڑ دینا ہے — ریفنڈ صرف ریٹرن سے ملتا ہے۔ کئی صورتوں میں فائل کرنا ٹیکس واجب ہونے سے قطع نظر لازمی ہے: سالانہ تنخواہ ۶ لاکھ روپے سے زائد، ۱۰۰۰ سی سی یا زائد کی گاڑی کی ملکیت، ۵۰ لاکھ روپے یا زائد مالیت کی جائیداد/اثاثے، یا کمرشل/صنعتی بجلی یا گیس کنکشن۔", f: "ریفنڈ لینے اور ATL فوائد کے لیے فائل کریں، چاہے واجب ٹیکس صفر ہو — اور اوپر دیے گئے لازمی فائلنگ کے معیار بھی چیک کریں، کیونکہ ان میں سے کچھ ان لوگوں پر بھی لاگو ہوتے ہیں جو سمجھتے ہیں کہ وہ فائل کرنے کے لیے بہت چھوٹے ہیں۔" },
      { t: "پلیٹ فارم اور غیر ملکی آمدنی نظرانداز کرنا", d: "اپ ورک، فائیور یا یوٹیوب سے پے اونیئر، وائز یا جاز کیش میں آنے والی رقم قابلِ ٹیکس ہے اور اب ٹریک ہوتی ہے؛ چھوڑنا آپ کے اپنے بینک ریکارڈ سے تضاد ہے۔", f: "ظاہر کریں — درست بینکنگ چینل کے ساتھ آئی ٹی برآمدی آمدنی پر صرف ۱٪ (PSEB رجسٹرڈ کے لیے ۰.۲۵٪) ٹیکس ہے۔" },
      { t: "ستمبر کے آخری ہفتے میں فائل کرنا", d: "ڈیڈ لائن کے قریب پورٹل سست پڑ جاتا ہے اور جلد بازی کی غلطیاں مہینوں میں ٹھیک ہوتی ہیں؛ اب تاریخ نکلنے پر ATL بحالی کے ۲۵ ہزار روپے لگتے ہیں۔", f: "اگست یا ستمبر کے شروع میں فائل کریں۔ جمع کرانے کے بعد غلطی نظر آئے تو نظرثانی ممکن ہے — چھپنے کی امید کے بجائے فوراً درست کریں۔" },
      { t: "جمع کرانے کے بعد رک جانا", d: "اکنالجمنٹ اور CPR ڈاؤن لوڈ نہ کرنا یا ATL اسٹیٹس کبھی نہ دیکھنا آپ کو اس وقت بے ثبوت چھوڑ دیتا ہے جب بینک، سفارت خانہ یا جائیداد کا سودا ثبوت مانگے۔", f: "اکنالجمنٹ سلپ اور ادائیگی کی رسیدیں محفوظ کریں، پھر فہرست اپڈیٹ ہونے پر ATL میں اپنا نام تصدیق کریں۔" },
      { t: "پرانا ٹیکس دہندہ پروفائل (CNIC، موبائل، ای میل، پتہ)", d: "IRIS پروفائل میں شناختی کارڈ کی ایک غلط رقم، پرانا موبائل نمبر یا غیر فعال ای میل ویلیڈیشن کی غلطی اور ریٹرن مسترد ہونے کا سبب بنتا ہے — یہ آپ کی آمدنی کے درست اعداد سے الگ مسئلہ ہے۔", f: "ریٹرن شروع کرنے سے پہلے IRIS میں اپنا ٹیکس دہندہ پروفائل کھول کر CNIC، تاریخ پیدائش، موبائل اور ای میل تصدیق کریں۔" },
      { t: "کاروباری ڈھانچہ بدلنے کے بعد غلط کیٹیگری میں فائل کرنا", d: "اگر آپ سول پرائٹرشپ سے AOP میں تبدیل ہوئے یا کاروبار کی رجسٹریشن بدلی، مگر پرانے انفرادی پروفائل میں فائل کرتے رہے، تو IRIS ایسا تضاد پکڑتا ہے جو کارروائی روک دیتا ہے۔", f: "اگر کاروباری ڈھانچہ بدلا ہے تو پہلے رجسٹریشن کیٹیگری اپڈیٹ کریں، پھر درست پروفائل سے فائل کریں۔" },
      { t: "جائیداد کی فروخت کی رقم کو براہِ راست آمدنی ظاہر کرنا", d: "کچھ فائلرز پوری فروخت کی رقم آمدنی میں ڈال دیتے ہیں، یا صرف خریداری کی قیمت درج کرتے ہیں، بجائے اس کے کہ گین (فروخت مائنس لاگت) نکالیں۔ دونوں طریقے غلط ٹیکس بناتے ہیں۔", f: "خریداری کا معاہدہ، فروخت کا معاہدہ اور ویلیوایشن ریکارڈ محفوظ رکھیں، اور خام فروخت رقم نہیں بلکہ گین کیپٹل گین میں درج کریں۔" },
      { t: "اثاثہ خریدنا مگر متعلقہ بینک نکلوائی نہ دکھانا", d: "اثاثہ اور آمدنی دونوں درست ظاہر ہونے کے باوجود، اگر گاڑی یا جائیداد کی رقم کسی بینک نکلوائی یا دستاویزی ذریعے سے نہیں ملتی، تو ویلتھ اسٹیٹمنٹ پھر بھی ذریعہ آمدن کا سوال کھڑا کرتی ہے۔", f: "بڑی خریداری کرتے وقت یقینی بنائیں کہ ادائیگی کا ریکارڈ (بینک نکلوائی، ٹرانسفر، قرض) اسی ریٹرن میں خریداری سے میل کھاتا نظر آئے۔" },
      { t: "ذریعہ آمدن کی جگہ صرف \"بچت\" لکھ دینا", d: "بغیر تنخواہ سلپ، کاروباری منافع ریکارڈ، تحفے کے کاغذات یا وراثت کی دستاویز کے صرف ایک مبہم لفظ لکھنا ایف بی آر کے دستاویزی ثبوت مانگنے کی سب سے عام وجہ ہے۔", f: "ہر بڑی ذریعہ آمدن کی انٹری کو اصل دستاویز سے ملائیں جو مانگے جانے پر پیش کی جا سکے — تنخواہ، کاروباری منافع، تحفہ، وراثت، ترسیل یا قرض کا معاہدہ۔" },
      { t: "IRIS کی ویلیڈیشن وارننگز نظرانداز کرنا یا حتمی تصدیق چھوڑ دینا", d: "IRIS اکثر جمع کرانے سے پہلے نامکمل یا متضاد اندراجات کی نشاندہی کرتا ہے؛ انہیں نظرانداز کرنا — یا ریٹرن بھر کر ویریفیکیشن/ای-سائن مرحلہ مکمل نہ کرنا — ریٹرن کو قانونی طور پر نامکمل چھوڑ دیتا ہے چاہے اسکرین پر مکمل نظر آئے۔", f: "ہر ویلیڈیشن پیغام پڑھ کر حل کریں، اور تصدیق کریں کہ ریٹرن 'تصدیق شدہ اور جمع شدہ' دکھا رہا ہے، صرف 'محفوظ شدہ' نہیں۔" },
      { t: "فارم 181 کی رجسٹریشن مکمل پروسیس ہونے سے پہلے فائل کرنے کی کوشش", d: "پہلی بار NTN لینے والا اکثر رجسٹریشن کے فوراً بعد فائل کرنے کی کوشش کرتا ہے اور 'Task Not Enabled' کی خرابی کا سامنا کرتا ہے — IRIS اس وقت تک ریٹرن کی اجازت نہیں دیتا جب تک رجسٹریشن آرڈر (فارم 181) پس منظر میں مکمل پروسیس نہ ہو جائے، جس میں وقت لگ سکتا ہے۔", f: "رجسٹریشن کے بعد فائل کرنے کی کوشش سے پہلے اپنے 'Completed Tasks' فولڈر میں رجسٹریشن آرڈر چیک کریں۔ اگر ابھی نہیں آیا تو انتظار کریں، یہ نہ سمجھیں کہ سسٹم خراب ہے۔" },
      { t: "CNIC یا ای میل خود تبدیل کرنے کی کوشش", d: "موبائل نمبر، پتہ اور بینک اکاؤنٹ کی تفصیلات آپ خود IRIS میں فارم 181 سے تبدیل کر سکتے ہیں۔ CNIC نمبر اور رجسٹرڈ ای میل نہیں — ان کے لیے اپنے ریجنل ٹیکس آفس جانا لازم ہے، اور اسے چھوڑنا خاموشی سے تبدیلی ناکام کر دیتا ہے۔", f: "CNIC یا ای میل کی درستگی کے لیے آن لائن بار بار کوشش کرنے کے بجائے اپنے دستاویزات کے ساتھ RTO وزٹ بک کریں؛ موبائل/پتہ/بینک تفصیلات کے لیے براہِ راست IRIS سیلف سروس استعمال کریں۔" },
      { t: "آن لائن سیلرز: ظاہر کردہ آمدنی پیمنٹ گیٹ ویز/کوریئرز کی رپورٹ سے کم ہونا", d: "ای کامرس سیلرز کے لیے بینک، پیمنٹ گیٹ ویز اور کوریئر کمپنیاں آپ کی وصولیاں براہِ راست ایف بی آر کو رپورٹ کرتی ہیں۔ اگر آپ کی ظاہر کردہ کاروباری آمدنی ان کی رپورٹ سے کم ہو تو یہ ہائی رسک تضاد کے طور پر فلیگ ہوتا ہے — یہ آن لائن سیلرز کے لیے ایک حقیقی اور عام آڈٹ ٹرگر ہے، محض نظریاتی خطرہ نہیں۔", f: "فائل کرنے سے پہلے اپنی ظاہر کردہ فروخت کا اپنے پیمنٹ گیٹ وے اور کوریئر اسٹیٹمنٹس سے موازنہ کریں — صرف یادداشت یا بینک بیلنس پر انحصار نہ کریں۔ کیش آن ڈیلیوری اور ڈیجیٹل ادائیگی کی رسیدوں پر مختلف شرح سے ٹیکس کٹ سکتا ہے، انہیں الگ الگ جمع کریں۔" },
      { t: "یہ سمجھنا کہ ریٹرن میں ریفنڈ دکھنے پر وہ خودکار مل جائے گا", d: "ریٹرن میں حساب شدہ ریفنڈ دکھنا کافی نہیں — اسے کلیم کرنے کے لیے IRIS میں الگ ریفنڈ درخواست درکار ہے، اور ادائیگی کا IBAN آپ کے پروفائل پر موجود بینک اکاؤنٹ سے بالکل میل کھانا چاہیے، ورنہ ادائیگی رک جاتی ہے۔", f: "فائل کرنے کے بعد مخصوص ریفنڈ درخواست جمع کروائیں، اور دوبار تصدیق کریں کہ رجسٹرڈ IBAN اسی اکاؤنٹ کا ہے جس میں ادائیگی چاہیے۔" },
      { t: "ایک غلط قطار پورا ایکسل ڈیٹا امپورٹ خراب کر دیتی ہے", d: "ایکسل کے ذریعے فروخت یا خریداری کا ڈیٹا امپورٹ کرنے والے کاروباری فائلرز دیکھتے ہیں کہ ایک غلط یا نامکمل قطار پوری فائل کو IRIS میں رول بیک کر دیتی ہے — صرف وہ غلط قطار نہیں، کچھ بھی امپورٹ نہیں ہوتا۔", f: "اپ لوڈ سے پہلے ہر قطار کی جانچ کریں، اور امپورٹ ناکام ہو تو فلیگ شدہ ایک ریکارڈ چیک کریں، یہ نہ سمجھیں کہ پوری فائل کا فارمیٹ غلط ہے۔" },
      { t: "اگر کاروبار کے لیے ڈیجیٹل انوائسنگ لازم ہے تو اسے نظرانداز کرنا", d: "جن کاروباروں کے لیے پوائنٹ آف سیل یا انوائسنگ سسٹم ایف بی آر سے مربوط کرنا لازم ہے، وہ ڈیجیٹل انوائس نہ بھیجنے پر یکمشت جرمانہ (۵۰ ہزار روپے یا متعلقہ ٹیکس کا ۲٪) اور جمع شدہ انوائسز پر حل طلب اعتراضات کے لیے روزانہ چارج کا سامنا کرتے ہیں۔", f: "اگر آپ کے کاروبار پر ڈیجیٹل انوائسنگ انضمام لاگو ہوتا ہے تو اسے فوری سمجھیں — روزانہ چارج کا ڈھانچہ یکمشت جرمانے کے برعکس تاخیر کو تیزی سے مہنگا بنا دیتا ہے۔" },
    ],
    scenariosTitle: "حقیقی کیسز سے سیکھیں",
    scenariosSub:
      "حقیقی کیسز اور پاکستانی ٹیکس معلمین کے زیرِ بحث عام صورتحال سے عملی اسباق — بشمول ٹیکس ماہر عامر شریف (@AmerSharifOFCL) کے عوامی تبصرے۔",
    scenariosCredit: "عوامی تبصروں، ایف بی آر رہنمائی اور مقبول ٹیکس تعلیمی مواد سے ماخوذ · اپنے الفاظ میں، قانونی مشورہ نہیں",
    lessonLabel: "سبق",
    scenarios: [
      {
        title: "ایف بی آر کا نوٹس آئے تو کبھی نظرانداز نہ کریں",
        story:
          "ایک شہری کو دفعہ ۱۲۲(۹) کے تحت نوٹس ملے جن میں ریٹرن کے دعووں کا ثبوت مانگا گیا۔ اس نے ثبوت جمع نہ کرائے۔ ایف بی آر نے اسیسمنٹ میں ترمیم کر کے ۳ کروڑ روپے کا مطالبہ کیا اور دفعات ۱۳۷/۱۳۸ کے تحت باقاعدہ ڈیمانڈ نوٹس کے بعد دفعہ ۱۴۰ کے تحت رقم براہِ راست اس کے بینک اکاؤنٹ سے وصول کر لی۔ نوٹس، مطالبہ اور وصولی کا قانونی مرحلہ مکمل ہونے کے بعد ایف بی آر کو یہ اختیار حاصل ہے۔",
        lesson:
          "ہر نوٹس کا مقررہ مدت میں دستاویزات کے ساتھ جواب دیں۔ ترتیب یہ ہے: ۱۲۲(۹) نوٹس ← وضاحت کا موقع ← ترمیم شدہ اسیسمنٹ ← ڈیمانڈ (۱۳۷/۱۳۸) ← براہِ راست بینک وصولی (۱۴۰)۔ جواب دینے کا مرحلہ ہی وہ واحد موقع ہے جہاں معاملہ آپ کے ہاتھ میں ہوتا ہے۔ اور جعلی دستاویزات ہرگز جمع نہ کریں — اس کیس میں بینک کو جعلی اپیل آرڈر بھیجے گئے، جو فوجداری معاملہ ہے۔",
      },
      {
        title: "ریزیڈنٹ یا نان ریزیڈنٹ؟ ریٹرن حقیقت کے مطابق ہو",
        story:
          "ایک معروف اوورسیز پاکستانی خود کو عوامی طور پر نان ریزیڈنٹ کہتے تھے، مگر اپنے ہی جمع کردہ ریٹرنز میں انہوں نے خود کو ریزیڈنٹ ظاہر کیا — جس پر عالمی آمدنی پر مکمل ٹیکس واجب ہوتا ہے۔ انہوں نے ہر سال ۲ کروڑ ۳۵ لاکھ سے زائد غیر ملکی آمدنی مستثنیٰ قرار دی مگر پوچھنے پر ثبوت پیش نہ کر سکے۔",
        lesson:
          "ریزیڈنسی کا تعین بنیادی طور پر پاکستان میں قیام کے دنوں سے ہوتا ہے (عموماً ٹیکس سال میں ۱۸۳ دن یا زیادہ قیام آپ کو ریزیڈنٹ بناتا ہے)۔ اسے درست اور مستقل طور پر ظاہر کریں اور ہر مستثنیٰ غیر ملکی آمدنی کا ثبوت (پاسپورٹ کی مہریں، بیرونِ ملک ملازمت کے معاہدے) سنبھال کر رکھیں۔ جس استثنیٰ کا ثبوت نہ ہو وہ کل کی دیندہی ہے۔",
      },
      {
        title: "دیر سے فائل کرنے پر نیا ۲۵ ہزار روپے سرچارج",
        story:
          "ATL میں دیر سے شامل ہونے کا سرچارج ۱ ہزار سے بڑھ کر ۲۵ ہزار روپے ہو گیا ہے — ۲۴۰۰ فیصد اضافہ۔ مثال: آپ اکتوبر ۲۰۲۶ میں جائیداد یا گاڑی کا لین دین کرنا چاہتے ہیں مگر ۳۰ ستمبر کی تاریخ نکل گئی۔ اب فعال ٹیکس دہندگان کی فہرست میں آنے اور نان فائلر کی بھاری شرحوں سے بچنے کے لیے ۲۵ ہزار روپے دینا ہوں گے — چاہے آپ ریزیڈنٹ ہوں یا نان ریزیڈنٹ۔",
        lesson:
          "مقررہ تاریخ (۳۰ ستمبر ۲۰۲۶) تک فائل کریں تو ATL میں شمولیت مفت ہے۔ اگر آپ نے کبھی فائل نہیں کیا اور فوری فائلر شرح چاہیے تو گزشتہ سال کا ریٹرن دیر سے جمع کرانا نان فائلر شرحوں سے کہیں سستا ہے — مگر اس سال سے تاخیر خود مہنگی ہو گئی ہے۔ اب ڈیڈ لائن ۲۵ ہزار روپے کا سوال ہے۔",
      },
      {
        title: "لاپروائی سے فائل کرنا لاعلمی سے زیادہ خطرناک ہے",
        story:
          "ایک ٹیکس دہندہ اور ایف بی آر کے درمیان مشہور تنازع کے بعد صاف پیغام یہ تھا: اپنا ریٹرن خود صرف اس وقت فائل کریں جب آپ ٹیکس قانون واقعی سمجھتے ہوں۔ ہر ستمبر نمودار ہونے والے موسمی کنسلٹنٹس اور یوٹیوب ویڈیوز سے بنے ریٹرنز کی غلطیوں کا جواب برسوں بعد کنسلٹنٹ نہیں، ٹیکس دہندہ خود دیتا ہے۔",
        lesson:
          "عام ٹیکس دہندہ کے لیے غلطی یا غلط اندراج کی گنجائش بہت کم ہے۔ آپ کا جمع کردہ ہر ہندسہ آپ کا قانونی اقرار ہے۔ اپنا ریٹرن سمجھنے کے لیے یہاں اے آئی معاون استعمال کریں، مگر پیچیدہ معاملات (غیر ملکی آمدنی، کاروباری خسارہ، نوٹس) کے لیے مستند ٹیکس پریکٹیشنر سے رجوع کریں — اور جو کچھ فائل کریں اس کی نقول محفوظ رکھیں۔",
      },
      {
        title: "آپ کی تنخواہ کا اندراج آجر کے ریکارڈ میں بھی ہونا چاہیے",
        story:
          "نئے فارم میں تنخواہ آجر کا نام یا NTN تلاش کر کے درج ہوتی ہے اور ایف بی آر آپ کے اندراج کو اسی آجر کے ودہولڈنگ گوشواروں سے خودکار طور پر ملاتا ہے۔ اگر آپ ایسے آجر کی تنخواہ ظاہر کریں جس کے ریکارڈ میں آپ موجود نہیں — جو پہلے غیر دستاویزی آمدنی کو 'تنخواہ' بنانے کا عام حربہ تھا — تو نظام آپ کا ریٹرن خودکار طور پر فلیگ کر سکتا ہے اور غیر واضح آمدنی و اثاثوں پر انکوائری کھل سکتی ہے۔",
        lesson:
          "تنخواہ سے ٹیکس کٹنے کا مطلب خودبخود قانونی تعمیل نہیں۔ تصدیق کریں کہ آجر واقعی آپ کے شناختی کارڈ کے ساتھ ودہولڈنگ گوشوارے جمع کراتا ہے، سالانہ ٹیکس سرٹیفکیٹ لیں اور اعداد بالکل سرٹیفکیٹ کے مطابق درج کریں۔ اگر سال میں بقایاجات، ملازمت ختم ہونے کے فوائد یا دوسرا آجر رہا ہو تو فارم ہر ایک کے بارے میں الگ پوچھتا ہے — سب کو ایک رقم میں ضم نہ کریں۔",
      },
      {
        title: "ویلتھ اسٹیٹمنٹ محض رسم نہیں، بند دروازہ ہے",
        story:
          "IRIS آپ کا ریٹرن اس وقت تک جمع نہیں ہونے دیتا جب تک ویلتھ اسٹیٹمنٹ کا حساب نہ ملے: اس سال کے اثاثے منفی گزشتہ سال کے اثاثے، آپ کی آمدنی منفی اخراجات کے برابر ہونا چاہیے۔ بہت سے نئے فائلرز آخری مرحلے پر جا کر جانتے ہیں کہ ان کے ظاہر کردہ اثاثے ان کی ظاہر کردہ آمدنی سے زیادہ بڑھ گئے ہیں — اور جمع کرانے کا بٹن کام ہی نہیں کرتا۔",
        lesson:
          "شروع کرنے سے پہلے حساب تیار کریں: ۳۰ جون ۲۰۲۶ کے اثاثے خرید قیمت پر درج کریں (مارکیٹ قیمت پر نہیں)، گزشتہ سال کے اختتامی اعداد نکالیں اور ہر آمد (تنخواہ، کرایہ، منافع، ترسیلات، تحائف) اور خرچ کا حساب رکھیں۔ اگر آپ ریزیڈنٹ ہیں اور غیر ملکی آمدنی ۱۰ ہزار ڈالر یا غیر ملکی اثاثے ۱ لاکھ ڈالر سے زائد ہیں تو الگ فارن انکم و ایسٹس اسٹیٹمنٹ بھی لازمی ہے — اس کے بغیر الگ جرمانہ ہے۔",
      },
      {
        title: "اپ ورک/فائیور فری لانسر — شرح کا انحصار بینکنگ چینل پر ہے",
        story:
          "ماہانہ ۱۵۰۰ ڈالر کمانے والے ایک فری لانسر کا خیال تھا کہ آن لائن آمدنی نظر نہیں آتی۔ مگر ایف بی آر اب پاکستانی بینکوں میں آنے والی غیر ملکی ترسیلات کو ڈیجیٹل طور پر ٹریک کرتا ہے — پے اونیئر، وائز اور براہِ راست وائر سب کا نشان رہتا ہے۔ قوانین دراصل قانون پر چلنے والے فری لانسرز کے حق میں ہیں: اہل آئی ٹی برآمدی آمدنی پر وصولیوں کا صرف ۱٪ حتمی ٹیکس ہے اور PSEB رجسٹرڈ فری لانسرز کے لیے ۰.۲۵٪۔ مگر کم از کم ۸۰٪ غیر ملکی آمدنی سرکاری بینکنگ چینلز سے آنی چاہیے — باہر رکھی یا غیر رسمی طریقے سے لی گئی رقم پر کاروباری سلیب لگتے ہیں جو ۴۵٪ تک جاتے ہیں۔",
        lesson:
          "اپنی کمائی پاکستانی بینک اکاؤنٹ (یا اس سے منسلک پے اونیئر/وائز) کے ذریعے منگوائیں، ہر ترسیل کی PRC (رسید) لیں اور ۰.۲۵٪ شرح کے لیے PSEB رجسٹریشن پر غور کریں۔ پلیٹ فارم کی مجموعی آمدنی ظاہر کریں اور پلیٹ فارم کا کمیشن بطور خرچ کلیم کریں۔ ایک غلط فہمی دور کریں: اپ ورک پر W-8BEN فارم صرف امریکی ٹیکس سے متعلق ہے — پاکستانی ذمہ داریوں پر اس کا کوئی اثر نہیں۔",
      },
      {
        title: "اوورسیز پاکستانی — ترسیلات آمدنی نہیں، مگر ریزیڈنسی سب کچھ ہے",
        story:
          "بہت سے اوورسیز پاکستانی دو مخالف غلطیاں کرتے ہیں۔ کچھ اپنی غیر ملکی ترسیلات کو قابلِ ٹیکس آمدنی ظاہر کر دیتے ہیں — جو غیر ضروری ہے، کیونکہ سرکاری چینلز سے آنے والی ترسیلات پر انکم ٹیکس نہیں۔ کچھ برسوں پرانا 'ریزیڈنٹ' اسٹیٹس برقرار رکھتے ہیں حالانکہ بیرونِ ملک رہتے ہیں؛ ایف بی آر اب سفری ریکارڈ، بینک ڈیٹا اور جائیداد کی ملکیت آپس میں ملاتا ہے، اور غلط درج شدہ ریزیڈنٹ اسٹیٹس پر عالمی آمدنی (دبئی کی تنخواہ، برطانیہ کا کاروبار) پاکستان میں قابلِ ٹیکس ہو جاتی ہے اور خودکار نوٹس آتے ہیں۔",
        lesson:
          "ہر سال اپنی ریزیڈنسی درست طے کریں — عموماً پاکستان میں ۱۸۳ دن سے کم قیام آپ کو نان ریزیڈنٹ بناتا ہے، جس پر صرف پاکستان سے حاصل آمدنی (کرایہ، بینک منافع، یہاں کے کیپٹل گین) پر ٹیکس ہے۔ ترسیلات کو آمدنی ظاہر نہ کریں؛ پاکستان کی آمدنی درست ظاہر کریں۔ اگر بیرونِ ملک ٹیکس دیتے ہیں تو ۶۵ سے زائد ممالک سے پاکستان کے دہرے ٹیکس سے بچاؤ کے معاہدے (DTA) آپ کا تحفظ کرتے ہیں — بشرطیکہ ایف بی آر کے پاس آپ کا اسٹیٹس درست ہو۔",
      },
      {
        title: "آمدنی ۶ لاکھ سے کم؟ فائل کرنا پھر بھی فائدے کا سودا ہے",
        story:
          "قابلِ ٹیکس حد سے کم کمانے والے ایک دکاندار نے سوچا کہ فائل کرنا بے کار ہے — ٹیکس صفر تو فائدہ بھی صفر؟ پھر اس نے دیکھا کہ نقد نکلوانے پر اس سے دگنا ودہولڈنگ کٹ رہا ہے، موٹر سائیکل رجسٹریشن پر زیادہ شرح لگی اور سختی بڑھنے پر سم بلاک ہونے کا خطرہ بھی۔ جب اس نے صفر ٹیکس والا ریٹرن فائل کیا تو چند دنوں میں بینک نے اس کی ودہولڈنگ کیٹیگری بدل دی؛ ایک فائلر نے سال بھر میں ۶۰ ہزار روپے سے زائد اضافی ودہولڈنگ بچائی۔",
        lesson:
          "ٹیکس واجب نہ ہونے پر بھی فائل کرنا چند گھنٹوں کا کام ہے اور آپ کو ATL پر لے آتا ہے — جس سے بینکنگ، جائیداد اور گاڑیوں پر ودہولڈنگ شرحیں آدھی ہو جاتی ہیں۔ مگر صفر ریٹرن کے ساتھ بھی قابلِ یقین ویلتھ اسٹیٹمنٹ چاہیے: سالانہ ۱ لاکھ ۸۰ ہزار آمدنی ظاہر کر کے گاڑی اور جائیداد دکھانا یہ سوال کھڑا کرتا ہے کہ گزارہ کیسے ہوتا ہے۔ سادہ ریٹرن میں بھی آمدنی ایمانداری سے ظاہر کریں اور حساب پورا رکھیں۔",
      },
      {
        title: "پروفیشنل سے فائل کروا رہے ہیں؟ مناسب قیمت اور درست طریقہ جانیں",
        story:
          "بہت سے ٹیکس دہندہ یا تو موسمی کنسلٹنٹس کو زیادہ پیسے دے دیتے ہیں یا آنکھ بند کر کے دستاویزات حوالے کر دیتے ہیں۔ معروف آن لائن فائلنگ سروسز کے شائع شدہ فلیٹ ریٹ اچھا معیار ہیں: سادہ تنخواہ دار ریٹرن تقریباً ۴ ہزار روپے سالانہ، تنخواہ مع دیگر آمدنی (کرایہ، ڈیویڈنڈ، کیپٹل گین) تقریباً ۶ ہزار، نان ریزیڈنٹ پاکستانی ۷ ہزار، فری لانسر ۷,۵۰۰ اور کاروباری آمدنی کے لیے کیس کے مطابق۔ پہلی بار فائل کرنے والوں کے لیے سروس فیس کے علاوہ ایک بار کی ایف بی آر رجسٹریشن لاگت (تقریباً ۱,۵۰۰ روپے) بھی ہوتی ہے۔ عام درکار دستاویزات: شناختی کارڈ (دونوں اطراف)، تنخواہ سلپ/سرٹیفکیٹ، تمام اکاؤنٹس کی بینک اسٹیٹمنٹس، ٹیکس کٹوتی سرٹیفکیٹ اور اثاثوں/واجبات/اخراجات کا خلاصہ۔",
        lesson:
          "جو بھی سروس استعمال کریں، دو باتوں پر اصرار کریں: ایف بی آر کو جمع کرانے سے پہلے مکمل ریٹرن کا جائزہ آپ کی منظوری کے لیے، اور بعد میں سرکاری رسید (اکنالجمنٹ)۔ اپنا IRIS پاس ورڈ بلا احتیاط شیئر نہ کریں اور یاد رکھیں کہ فائل شدہ ہر ہندسہ کنسلٹنٹ کا نہیں، آپ کا اقرار ہے۔ اگر کئی سال چھوٹ گئے ہیں تو پچھلے سالوں کے ریٹرن بھی فائل ہو سکتے ہیں — ہر ٹیکس سال الگ شمار ہوتا ہے۔",
      },
      {
        title: "اساتذہ: ۲۵٪ رعایت ٹیکس سال ۲۰۲۵ پر ختم — اس سال کلیم نہ کریں",
        story:
          "HEC سے تسلیم شدہ غیر منافع بخش اداروں کے کل وقتی اساتذہ اور محققین کی ۲۵٪ ٹیکس رعایت ۲۰۲۲ میں واپس لے لی گئی، غلط فہمی میں کلیم ہوتی رہی، ۲۰۲۴ میں ایف بی آر کے ریکوری نوٹس آئے، اور پھر اسے ماضی سے بحال کیا گیا — مگر صرف ٹیکس سال ۲۰۲۳، ۲۰۲۴ اور ۲۰۲۵ کے لیے۔ ٹیکس سال ۲۰۲۶ سے یہ دستیاب نہیں۔ جو استاد اس سال کے ریٹرن میں یہ کلیم کرے گا وہ غلط اقرار کرے گا؛ اور جس نے بحال شدہ پچھلے سالوں کے لیے کبھی کلیم نہیں کیا وہ اپنا حق چھوڑ رہا ہے۔",
        lesson:
          "اس ستمبر کے ریٹرن (ٹیکس سال ۲۰۲۶) میں مکمل سلیب شرحوں پر بغیر رعایت ٹیکس نکالیں۔ مگر اگر آپ نے ۲۰۲۳–۲۰۲۵ کا پورا ٹیکس دیا ہے تو ان سالوں کی ماضی سے بحال رعایت نظرثانی/ریفنڈ کے ذریعے لے سکتے ہیں۔ استثنا نوٹ کریں: پرائیویٹ پریکٹس سے کمانے والے میڈیکل اساتذہ اہل نہیں۔ تسلیم شدہ ادارے کا تقرر نامہ بطور ثبوت محفوظ رکھیں۔",
      },
      {
        title: "جائیداد بیچ رہے ہیں؟ ایڈوانس ٹیکس آپ کا حتمی ٹیکس نہیں",
        story:
          "ایک بیچنے والے نے منتقلی پر دفعہ 236C کے تحت ایڈوانس ٹیکس دیا اور سمجھا معاملہ ختم۔ حقیقت میں 236C ایڈجسٹ ہونے والا ہے: اصل واجب کیپٹل گین ٹیکس ہے اور ایڈوانس ٹیکس ریٹرن میں اس کے مقابل جمع ہوتا ہے — ایک بیچنے والے نے ۳ لاکھ ایڈوانس دیا جبکہ CGT صرف ۲ لاکھ ۵۰ ہزار بنا، تو ۵۰ ہزار ریفنڈ کلیم کیا۔ CGT خود خریداری کی تاریخ پر منحصر ہے: یکم جولائی ۲۰۲۴ یا بعد میں خریدی جائیداد پر فائلرز کے لیے مدتِ ملکیت سے قطع نظر یکساں ۱۵٪، جبکہ پرانی خریداری پر مدت کے سلیب لاگو ہیں جو چھ سال بعد ۰٪ تک جا سکتے ہیں۔ اور جائیداد پر بدنامِ زمانہ دفعہ 7E کا 'فرضی آمدنی' ٹیکس وفاقی آئینی عدالت نے کالعدم قرار دے دیا اور فنانس ایکٹ ۲۰۲۶ نے حذف کر دیا — منتقلی پر 7E سرٹیفکیٹ کی رکاوٹ ختم۔",
        lesson:
          "جائیداد کے ہر سودے پر دیے گئے ایڈوانس ٹیکس کا کریڈٹ لینے کے لیے ریٹرن فائل کریں — نان فائلر یہ نہیں لے سکتے۔ خریداری کی تاریخیں اور لاگت احتیاط سے ریکارڈ رکھیں کیونکہ یہی CGT سلیب طے کرتی ہیں، اور نوٹ کریں کہ ذاتی استعمال کی ایک رہائش گاہ (۱۵ سال استعمال، ویلتھ اسٹیٹمنٹ میں ظاہر) فنانس ایکٹ ۲۰۲۵ کی شرائط پر بیچنے والے کے ایڈوانس ٹیکس سے مستثنیٰ ہو سکتی ہے۔ جولائی ۲۰۲۶ سے ATL پر بیچنے والے کے لیے شرح یکساں ۲.۷۵٪ اور خریدار کے لیے ۱.۲۵٪ ہو گئی ہے۔",
      },
    ],
    whoTitle: "آپ کس حیثیت سے ریٹرن جمع کر رہے ہیں؟",
    who: [
      { id: "salaried", label: "تنخواہ دار", note: "آجر تنخواہ سے ٹیکس کاٹتا ہے" },
      { id: "business", label: "کاروبار / فری لانسر", note: "دکان، پریکٹس، فری لانسنگ، آن لائن آمدنی" },
      { id: "property", label: "جائیداد کے مالک", note: "مکان، دکان یا پلازہ کا کرایہ" },
      { id: "pension", label: "پنشنر / دیگر", note: "پنشن، بینک منافع، بچت سرٹیفکیٹ" },
    ],
    newBadge: "۲۰۲۶ کے فارم میں نیا",
    stepsTitle: "نیا فارم آپ سے کیا مانگتا ہے",
    beforeTitle: "شروع کرنے سے پہلے — یہ دستاویزات جمع کریں",
    startOver: "ٹیکس دہندہ کی قسم تبدیل کریں",
    calcTitle: "اپنے ٹیکس کا تخمینہ لگائیں (ٹیکس سال ۲۰۲۶)",
    calcPick: "کس چیز کا حساب کرنا ہے؟",
    calcTypes: {
      income: "انکم ٹیکس",
      rent: "کرائے کی آمدنی",
      elec: "بجلی کا بل",
      mobile: "موبائل و انٹرنیٹ",
      bank: "بینک منافع",
      prop: "جائیداد کا سودا",
      cash: "نقد رقم نکلوانا",
    },
    atlQ: "کیا آپ فعال ٹیکس دہندگان کی فہرست (ATL) میں ہیں؟",
    filer: "فائلر (ATL)",
    nonFiler: "نان فائلر",
    annualRent: "سالانہ وصول شدہ کرایہ (روپے)",
    rentNote: "انفرادی/AOP کرائے کے سلیب دفعہ ۱۵۵ کے تحت۔ نان فائلرز پر دسویں شیڈول کے تحت زیادہ ودہولڈنگ لاگو ہے۔",
    monthlyBill: "ماہانہ بجلی کا بل (روپے)",
    consumerType: "صارف کی قسم",
    domestic: "گھریلو",
    commercial: "کمرشل",
    industrial: "صنعتی",
    elecNote: "دفعہ ۲۳۵۔ ATL پر موجود گھریلو صارفین پر کوئی ودہولڈنگ نہیں؛ نان فائلرز ماہانہ ۲۵ ہزار یا زائد کے بل پر ۷.۵٪ دیتے ہیں۔ کمرشل/صنعتی ودہولڈنگ ریٹرن میں ایڈجسٹ ہوتی ہے۔",
    monthlySpend: "ماہانہ موبائل/انٹرنیٹ خرچ (روپے)",
    mobileNote: "دفعہ ۲۳۶: موبائل لوڈ، فون اور انٹرنیٹ بلوں پر ۱۵٪ ایڈوانس ٹیکس کٹتا ہے۔ یہ مکمل ایڈجسٹ ہوتا ہے — ریٹرن فائل کر کے واپس لیں۔",
    profitAmt: "سال میں ملنے والا بینک منافع (روپے)",
    bankNote: "دفعہ ۱۵۱۔ اکثر افراد کے لیے یہ حتمی ٹیکس ہے؛ ۵۰ لاکھ سے زائد منافع نارمل شرحوں پر آتا ہے۔ نان فائلرز پر دگنی کٹوتی ہے۔",
    propValue: "جائیداد کی قیمت (ایف بی آر ویلیوایشن) (روپے)",
    propRole: "خرید رہے ہیں یا بیچ رہے ہیں؟",
    buying: "خریداری (236K)",
    selling: "فروخت (236C)",
    propNote: "ٹیکس سال ۲۰۲۶ کی فائلر شرحیں قیمت کے حساب سے۔ یہ ایڈوانس ٹیکس اصل واجب کے مقابل ایڈجسٹ ہوتا ہے۔ ذاتی استعمال کی ایک رہائش گاہ (۱۵ سال استعمال، ظاہر شدہ) 236C سے مستثنیٰ ہو سکتی ہے۔ یکم جولائی ۲۰۲۶ سے یکساں شرح: بیچنے والا ۲.۷۵٪، خریدار ۱.۲۵٪ (ATL)۔",
    withdrawAmt: "ایک دن میں نقد نکلوائی گئی رقم (روپے)",
    cashNote: "دفعہ 231AB: نان فائلرز روزانہ ۵۰ ہزار سے زائد نکلوانے پر ۰.۸٪ ایڈوانس ٹیکس دیتے ہیں۔ ATL پر فائلرز کچھ نہیں دیتے — فائل کرنے کی سب سے بڑی روزمرہ وجہ۔",
    perMonth: "ماہانہ",
    perYear: "سالانہ",
    taxWithheld: "کٹنے والا ٹیکس",
    adjustable: "✓ ایڈجسٹ ہونے والا — ریٹرن میں کلیم کریں",
    noTax: "اس صورت میں کوئی ٹیکس لاگو نہیں۔",
    calcNote:
      "شرحیں فنانس ایکٹ ۲۰۲۵ کے مطابق، یکم جولائی ۲۰۲۵ تا ۳۰ جون ۲۰۲۶ کی آمدنی کے لیے۔ ایک کروڑ روپے سے زائد آمدنی پر ۹٪ سرچارج لاگو ہے۔ یہ صرف تخمینہ ہے۔",
    incomeLabel: "سالانہ قابلِ ٹیکس آمدنی (روپے)",
    typeSalaried: "تنخواہ دار (تنخواہ آمدنی کا ۷۵٪ یا زیادہ)",
    typeBusiness: "کاروباری / غیر تنخواہ دار",
    taxDue: "انکم ٹیکس",
    surcharge: "سرچارج (۹٪)",
    totalTax: "کل تخمینی ٹیکس",
    monthly: "≈ ماہانہ",
    effective: "مؤثر شرح",
    chatTitle: "اپنے ریٹرن کے بارے میں کچھ بھی پوچھیں",
    chatHint:
      'مثلاً: "میرے آجر نے ٹیکس سرٹیفکیٹ نہیں دیا — میں کیا کروں؟" یا "یوٹیوب کی آمدنی کیسے ظاہر کروں؟"',
    chatPlaceholder: "اردو یا انگریزی میں اپنا سوال لکھیں…",
    send: "بھیجیں",
    thinking: "سوچ رہا ہے…",
    chatError: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔",
    listening: "سن رہا ہے… اب بولیں",
    micStart: "بولیں",
    micStop: "روکیں",
    voiceOn: "🔊 آواز میں جواب: آن",
    voiceOff: "🔇 آواز میں جواب: آف",
    voiceUnsupported:
      "اس براؤزر میں آواز سے اِن پٹ دستیاب نہیں۔ کروم یا ایج استعمال کریں۔",
    steps: {
      common: [
        {
          t: "IRIS پر رجسٹریشن / لاگ اِن",
          d: "آپ کو NTN چاہیے (انفرادی افراد کے لیے شناختی کارڈ نمبر ہی NTN ہے)۔ iris.fbr.gov.pk پر لاگ اِن کریں۔ پہلی بار فائل کرنے والے اپنے شناختی کارڈ، اپنے نام کی سم اور ای میل سے رجسٹر ہوں۔",
          isNew: false,
        },
        {
          t: "اپنا بینک اکاؤنٹ (IBAN) منسلک کریں",
          d: "نیا فارم آپ سے بنیادی بینک اکاؤنٹ ایف بی آر پروفائل سے منسلک کرنے کو کہتا ہے۔ اب ریفنڈ خودکار طریقے سے اسی اکاؤنٹ میں آئے گا — الگ درخواست کی ضرورت نہیں۔",
          isNew: true,
        },
        {
          t: "ہر ذریعۂ آمدن الگ الگ ظاہر کریں",
          d: "۲۰۲۶ کا فارم اکٹھی رقم قبول نہیں کرتا۔ ہر آمدنی ادا کرنے والے کی تفصیل کے ساتھ الگ درج ہوگی — نظام یہ اندراجات بینک، آجر اور ودہولڈنگ ریکارڈ سے خود ملاتا ہے۔",
          isNew: true,
        },
        {
          t: "بینک منافع، ڈیویڈنڈ اور بچت اسکیمیں",
          d: "ہر ادارہ الگ درج کریں: بینک کا نام، ملنے والا منافع اور کٹا ہوا ٹیکس۔ ڈیویڈنڈ، قومی بچت، صکوک اور فیملی پنشن کے لیے بھی یہی اصول ہے۔ ہر بینک سے سرٹیفکیٹ لیں۔",
          isNew: true,
        },
        {
          t: "ویلتھ اسٹیٹمنٹ (گوشوارۂ اثاثہ جات)",
          d: "۳۰ جون ۲۰۲۶ تک کے تمام اثاثے (جائیداد، گاڑیاں، بینک بیلنس، سونا، نقدی) اور واجبات ظاہر کریں، اور گزشتہ سال سے فرق کو اپنی آمدنی اور اخراجات سے ہم آہنگ کریں۔",
          isNew: false,
        },
        {
          t: "جائزہ لیں، جمع کریں، ATL پر رہیں",
          d: "خودکار حساب شدہ ٹیکس چیک کریں، بقایا رقم PSID کے ذریعے ادا کریں اور ۳۰ ستمبر ۲۰۲۶ سے پہلے جمع کریں۔ وقت پر فائل کرنے سے آپ فعال ٹیکس دہندگان کی فہرست (ATL) پر رہتے ہیں — جس سے کئی ودہولڈنگ ٹیکس آدھے ہو جاتے ہیں۔",
          isNew: false,
        },
      ],
      salaried: [
        {
          t: "تنخواہ کے ساتھ آجر کا NTN",
          d: "اب آپ کو تنخواہ کے ساتھ اپنے آجر کا NTN یا شناختی کارڈ نمبر بھی درج کرنا ہوگا۔ نظام آپ کے اندراج کو آجر کے ودہولڈنگ گوشواروں سے خود ملاتا ہے — فرق کی صورت میں نوٹس آ سکتا ہے (دفعہ ۱۶۱)۔",
          isNew: true,
        },
        {
          t: "تنخواہ کا ٹیکس سرٹیفکیٹ",
          d: "اپنے ادارے کے HR/فنانس سے جولائی ۲۰۲۵ تا جون ۲۰۲۶ کا سالانہ تنخواہ و ٹیکس کٹوتی سرٹیفکیٹ لیں۔ مجموعی تنخواہ، قابلِ ٹیکس تنخواہ اور کٹا ہوا ٹیکس بالکل سرٹیفکیٹ کے مطابق درج کریں۔",
          isNew: false,
        },
      ],
      business: [
        {
          t: "کاروباری آمدنی مع اخراجات کی تفصیل",
          d: "کل وصولیاں ظاہر کریں اور اصل اخراجات کلیم کریں۔ ریکارڈ محفوظ رکھیں — نیا نظام ڈیجیٹل انوائسنگ اور بینک ڈیٹا سے تصدیق کرتا ہے۔",
          isNew: false,
        },
        {
          t: "سوشل میڈیا اور کانٹینٹ کی آمدنی",
          d: "۲۰۲۶ کے فارم میں سوشل میڈیا آمدنی کے لیے الگ حصہ ہے — پوسٹس، ویوز، چینل مونیٹائزیشن۔ فری لانس/آئی ٹی برآمدی آمدنی پر رعایتی شرح مل سکتی ہے؛ ترسیلات کا ثبوت (PRC) سنبھال کر رکھیں۔",
          isNew: true,
        },
      ],
      property: [
        {
          t: "ہر جائیداد کا الگ الگ اندراج",
          d: "اب کرائے کی اکٹھی رقم درج نہیں ہو سکتی۔ ہر جائیداد الگ ظاہر ہوگی: مکمل پتہ، قسم، وصول شدہ کرایہ اور اسی جائیداد کے قابلِ کٹوتی اخراجات۔",
          isNew: true,
        },
        {
          t: "زرعی زمین (اگر ہو)",
          d: "زرعی آمدنی کے لیے اب قطعہ وار تفصیل درکار ہے: کھیت/خسرہ نمبر، محلِ وقوع اور فی قطعہ آمدنی۔ صوبائی زرعی ٹیکس کی رسیدیں محفوظ رکھیں۔",
          isNew: true,
        },
      ],
      pension: [
        {
          t: "پنشن کا حصہ",
          d: "نئے فارم میں 'آپ کی پنشن' کا الگ صفحہ ہے۔ پنشن دیگر آمدنی سے الگ ظاہر کریں؛ زیادہ تر سرکاری پنشن مستثنیٰ ہے مگر ظاہر کرنا پھر بھی لازم ہے۔",
          isNew: true,
        },
      ],
    },
    docs: {
      salaried: [
        "شناختی کارڈ + IRIS لاگ اِن",
        "آجر کا NTN نمبر",
        "تنخواہ و ٹیکس کٹوتی سرٹیفکیٹ (جولائی ۲۰۲۵ – جون ۲۰۲۶)",
        "ہر بینک سے منافع/ودہولڈنگ سرٹیفکیٹ",
        "موبائل کمپنی کا ٹیکس سرٹیفکیٹ (جاز، زونگ، ٹیلی نار، یوفون)",
        "بجلی کے بل اگر ٹیکس کٹا ہو",
        "اثاثوں کی تفصیل: جائیداد، گاڑی، بینک بیلنس (۳۰ جون ۲۰۲۶)",
        "بنیادی بینک اکاؤنٹ کا IBAN",
      ],
      business: [
        "شناختی کارڈ + IRIS لاگ اِن",
        "سال بھر کی وصولیوں/فروخت کا خلاصہ",
        "اخراجات کا ریکارڈ (کرایہ، تنخواہیں، بل، خریداری)",
        "تمام کاروباری اکاؤنٹس کی بینک اسٹیٹمنٹس",
        "غیر ملکی/فری لانس آمدنی کے لیے PRC/ترسیلات کا ثبوت",
        "ودہولڈنگ سرٹیفکیٹ (بینک، موبائل، درآمدات)",
        "اثاثے اور واجبات (۳۰ جون ۲۰۲۶)",
        "بنیادی بینک اکاؤنٹ کا IBAN",
      ],
      property: [
        "شناختی کارڈ + IRIS لاگ اِن",
        "ہر کرائے کی جائیداد کا مکمل پتہ اور قسم",
        "فی جائیداد وصول شدہ کرایہ (معاہدے مددگار ہیں)",
        "فی جائیداد پراپرٹی ٹیکس/انشورنس/مرمت کی رسیدیں",
        "کرایہ دار کے ودہولڈنگ سرٹیفکیٹ اگر ٹیکس کٹا ہو",
        "زرعی زمین کے خسرہ/قطعہ کی تفصیل",
        "اثاثے اور واجبات (۳۰ جون ۲۰۲۶)",
        "بنیادی بینک اکاؤنٹ کا IBAN",
      ],
      pension: [
        "شناختی کارڈ + IRIS لاگ اِن",
        "پنشن بک / سالانہ پنشن اسٹیٹمنٹ",
        "ہر بینک سے منافع کے سرٹیفکیٹ",
        "قومی بچت / بہبود سرٹیفکیٹ کی اسٹیٹمنٹس",
        "اثاثے اور واجبات (۳۰ جون ۲۰۲۶)",
        "بنیادی بینک اکاؤنٹ کا IBAN",
      ],
    },
  },
};

// ── AI system prompt (shared knowledge base) ─────────────────
const SYSTEM_PROMPT = `You are "Tax Return Saathi", a friendly bilingual (English + Urdu) assistant helping ordinary people in Pakistan prepare their FBR income tax return for Tax Year 2026 (income earned 1 July 2025 – 30 June 2026), filed on the IRIS portal (iris.fbr.gov.pk), deadline 30 September 2026.

KEY KNOWLEDGE — the NEW return form (draft SRO 835(I)/2026, evolving from the "Simplified Electronic Return" of SRO 1212(I)/2025):
- Source-wise disclosure replaces lump sums. The form has separate pages like "Your Income", "Your Pension", "Your Rent from Property", "Your Profit on Bank Accounts", "Your Dividends".
- Salaried individuals must enter their EMPLOYER'S NTN or CNIC with their salary; FBR auto-matches this against employer withholding statements. Mismatches can trigger Section 161 action against the employer.
- Rental income: each property declared individually (address, sub-type, rent, property-specific deductible expenses).
- Other income (bank profit, dividends, National Savings, Sukuk, family pension): institution-wise entries with payer names.
- Agricultural income: parcel-level detail (khasra number, location, income per parcel).
- New dedicated section for social media / content-creator income.
- Bank account (IBAN) linked to FBR profile; refunds paid automatically after withholding proofs are uploaded.
- Wealth statement still required: assets/liabilities at 30 June 2026 with reconciliation.

TAX YEAR 2026 SLABS (Finance Act 2025):
Salaried (salary ≥75% of income): up to 600,000 = 0; 600,001–1,200,000 = 1% of excess over 600k; 1,200,001–2,200,000 = 6,000 + 11%; 2,200,001–3,200,000 = 116,000 + 23%; 3,200,001–4,100,000 = 346,000 + 30%; above 4,100,000 = 616,000 + 35%. 9% surcharge if taxable income > Rs 10 million.

SURCHARGE — TY2026 vs TY2027 (verified against the Income Tax Ordinance 2001 amended to 30 June 2026): For Tax Year 2026 (the return filed now, income Jul 2025–Jun 2026), the s.4AB surcharge is 9% of income tax where taxable income exceeds Rs 10 million, and it DOES apply to salaried individuals (Finance Act 2025 reduced it from 10% to 9%). The Finance Act 2026 (Budget 2026-27) later withdrew this surcharge for salaried individuals and moves to abolish s.4AB from Tax Year 2027 — but that takes effect from 1 July 2026 onward and does NOT change the TY2026 return. So: use 9% for anyone filing the TY2026 return; only mention the salaried withdrawal/abolition when the person is asking about TY2027 or future planning. The statute PDF shows 10% with a salaried exemption because it already incorporates the Finance Act 2026 (TY2027) text.
Non-salaried individuals/AOP: up to 600,000 = 0; then 15%, 20% (90k fixed), 30% (170k), 40% (650k), 45% (1,610,000) with thresholds 1.2M / 1.6M / 3.2M / 5.6M.
ATL (Active Taxpayer List) benefits: much lower withholding rates for filers vs non-filers.

ENFORCEMENT & COMPLIANCE KNOWLEDGE (drawn from recent real cases discussed publicly by tax practitioners):
- FBR notice chain: Section 122(9) notice proposes amending an assessment and gives the taxpayer a chance to explain/submit evidence. If ignored, FBR finalizes an amended assessment and raises a tax demand. Section 137 sets when tax is payable; Section 138 is the formal demand/recovery notice; Section 140 then empowers FBR to recover unpaid tax DIRECTLY from the taxpayer's bank account. Advise users: never ignore a notice; respond within the deadline with documentary evidence; the 122(9) reply stage is the taxpayer's best opportunity. Submitting fake/forged documents is a criminal matter.
- Residency: generally 183+ days in Pakistan in a tax year makes an individual resident (taxed on worldwide income). Declaring resident status while claiming to be non-resident, or claiming foreign-income exemptions without proof (passport stamps, foreign employment contracts), creates serious exposure.
- ATL late surcharge: raised from Rs 1,000 to Rs 25,000. Filing by the due date (30 Sep 2026) gets you on the ATL free; filing late means paying Rs 25,000 surcharge for ATL inclusion, regardless of resident/non-resident status. Someone who never filed and urgently needs filer rates can file the previous tax year's return (with the smaller late-filing penalty applicable to that year) — but from TY2026, lateness is expensive.
- General caution: file with reasonable care; a common taxpayer has very little room for mistakes or incorrect declarations. Avoid seasonal consultants and blindly following YouTube tutorials; for complex matters engage a qualified tax practitioner.

NEW FORM MECHANICS (practical filing details):
- Salary entry: the electronic return lets you search your employer by name or NTN (or select "I can't find my employer"). Fields include gross salary, tax deducted, exempt allowances, transport monetisation, and separate questions for salary arrears, employment termination benefits, and additional salary from a second employer. FBR auto-matches salary declarations against the employer's payroll withholding submissions; claiming salary from an employer whose records don't include you can auto-flag the return and trigger unexplained-income inquiries. Tax deducted from a payslip does NOT by itself guarantee compliance — the employer must actually deposit it and file statements.
- Wealth statement is a hard gate: IRIS will not accept the return unless (current year wealth − last year wealth) = (income − expenses). Assets are declared at purchase cost, not market value. Advise users to prepare last year's closing figures and all inflows (salary, rent, profit, remittances, gifts) before starting.
- Foreign income/assets: a resident individual with foreign income ≥ USD 10,000 or foreign assets ≥ USD 100,000 must file a separate foreign income and assets statement, with its own penalty for non-filing.
- ATL timing: the ATL is expected to be updated from 1 July 2026 based on Tax Year 2026 returns; filing by 30 September 2026 gets ATL inclusion free, later filing costs the Rs 25,000 surcharge. FBR often extends deadlines, but never advise relying on an extension.

FIXED TAX SCHEME FOR SMALL SHOPKEEPERS (Special Procedure for Small Shopkeepers, Tax Year 2026 — FBR notified this on 28 July 2026; verify current details on IRIS as implementation evolves):
- What it is: an OPTIONAL simplified regime. Eligible small retailers pay a fixed 1% of annual turnover (total sales), instead of the normal profit-based return. Withholding tax already suffered in the supply chain is adjustable against this liability.
- Minimum payment: at least Rs 25,000 due at the time of filing a simplified one-page return (available in Urdu, Sindhi, Pashto, Balochi). The tax paid must also be at least what the person paid the previous year.
- Eligibility: annual turnover up to Rs 200 million; income mainly/exclusively from retail shopkeeping; only ONE shop. It replaced the failed Tajir Dost Scheme. Applies from fiscal year 2026.
- EXCLUDED: anyone whose turnover exceeded Rs 200M in any of the last three tax years; owners of more than one shop; Tier-1 retailers; jewellers; wholesalers, distributors, manufacturers, importers; and professionals like doctors, engineers, lawyers.
- Benefits: no POS machine requirement; generally no tax audits (only risk-based, on credible information about big undeclared assets/transactions, and in consultation with trade associations); an FBR-issued QR-code plate for the shop; FBR field officials cannot raid/enter a shop displaying the plate; ATL (active filer) status and lower withholding rates.
- How to register: via the IRIS web portal, the FBR Shopkeepers' Mobile App, or the nearest tax office / a tax practitioner.
- Honest framing to give users: it is optional and can be genuinely simpler and cheaper for a small shopkeeper, but they should compare — 1% of turnover can be more or less than tax on actual profit depending on their margins. It is NOT an amnesty. Encourage them to confirm current specifics on IRIS or with FBR, since the scheme is new and rules may be refined.

CONFIRMED FROM THE ACTUAL GAZETTE (S.R.O. 835(I)/2026, reviewed directly, notified 7 May 2026):
- Landing page asks income-source checkboxes (Salary/Property Rental/Other Sources/Business/Capital Gain/Foreign Sources & Assets/Agriculture/No Income) plus a direct residency question: "Have you stayed more than 183 days in Pakistan during the tax year?"
- Salary schedule requires BOTH Employer Registration No. (NTN) and Employer Name; tax deductions are split into three distinct tables — Adjustable Tax (s.149), Final Tax, and Average Tax (covering termination benefits u/s 12(6) and salary arrears u/s 12(7)) — each computed differently, so these are not interchangeable entries.
- Property schedule requires selecting from properties already declared in the prior year (they carry forward) or adding new ones; disposing of a property requires explicitly marking it Sold/Exchanged or Gifted. Advance tax lines are labelled explicitly as s.236C (seller) and s.236K (buyer).
- Business schedule has a dedicated "Income from Social Media Content" line item, separate from general business/export revenue — platform/content income should go here specifically, not folded into generic receipts.
- Wealth statement is split into 9.1 Foreign Assets/Liabilities (immovable property, moveable assets, bank accounts with IBAN+Country, foreign business capital, payables — kept separate from local wealth) and 9.2 Personal Assets/Liabilities (local property, motor vehicles requiring BOTH registration number and chassis number, bank accounts, cash, investments), then 9.3 Reconciliation of Net Assets as its own computed section.
- Deductible allowances (Zakat s.60, Workers' Welfare Fund s.60A, Educational Expenses s.60D) and any exclusion claim (e.g. from deemed-income tax) require selecting a specific legal reason from a fixed list — free-text justification is not accepted in the actual form.
- The full 147-page notification covers Individual, AOP/Firm, and Company return variants, each in English and Urdu.

FREELANCER / IT EXPORT KNOWLEDGE:
- Qualifying IT/ITeS export income (Upwork, Fiverr, direct foreign clients) is taxed at 1% of receipts as final tax; PSEB-registered exporters qualify for 0.25% (extended through Tax Year 2029). Requirement: at least 80% of foreign earnings must arrive through official banking channels (Pakistani bank, or Payoneer/Wise linked to a Pakistani account); keep a PRC (proceeds realization certificate) for each remittance plus contracts/invoices. Income received informally or kept offshore does not qualify and falls under steep non-salaried business slabs (up to 45%).
- Report gross platform earnings; platform commission (e.g., Fiverr's 20%) is a deductible business expense. Filing a W-8BEN on Upwork only concerns US withholding — it has no effect on Pakistani tax obligations.
- Freelancers with annual tax liability over Rs 50,000 may owe quarterly advance tax (Sep/Dec/Mar/Jun instalments).
- FBR digitally tracks foreign remittances into Pakistani banks; non-filing freelancers are increasingly detected.

OVERSEAS PAKISTANI KNOWLEDGE:
- Foreign remittances through official channels are NOT taxable income — advise users never to declare remittances as income (a common over-declaration mistake). They appear in the wealth reconciliation as an inflow, not as taxable income.
- Non-resident status (generally under 183 days in Pakistan in the tax year) means only Pakistan-source income is taxable (rent, bank profit, capital gains in Pakistan). An outdated/wrong 'resident' status on file exposes worldwide income to Pakistani tax; FBR now cross-matches travel records, banking, and property data, generating automated notices.
- Pakistan has Double Taxation Agreements with 65+ countries (UAE, UK, USA, Saudi Arabia, Canada, etc.) — relief requires correctly established residency status with FBR.

LOW-INCOME / NIL RETURN KNOWLEDGE:
- People below the Rs 600,000 threshold benefit from filing a nil-tax return: ATL status halves many withholding rates (bank cash withdrawal, vehicle, property), avoids SIM-block and other non-filer enforcement, and enables refunds of withheld tax. A nil return still requires a wealth statement that reconciles — declared income must plausibly support declared assets and living expenses.

PROFESSIONAL FILING HELP (market benchmarks, e.g. tax-sahulat.com):
- Typical flat rates from established online filing services: simple salaried return ~Rs 4,000/year; salaried + other income (rent, dividends, capital gains, profit on debt) ~Rs 6,000; non-resident Pakistani ~Rs 7,000; freelancer/digital earner ~Rs 7,500; business income priced case-by-case. First-time filers pay a one-time FBR registration cost of ~Rs 1,500 in addition to service fees.
- Standard document checklist services request: CNIC front & back, salary slip/certificate, bank statements of ALL accounts, tax deduction certificates, and details of assets, liabilities & expenses.
- Good-practice markers of a trustworthy service: you receive a preview of the completed return and approve it BEFORE submission to FBR, and you receive the official acknowledgement after filing. Advise users never to share their IRIS password casually, and to keep the acknowledgement.
- Missed years: returns for multiple past years can be filed; each tax year is treated (and priced) separately.
- Non-resident filing practice: only Pakistan-source income (rent, dividends, bank profit) is reported; foreign income and assets earned abroad by a non-resident are not reported in the Pakistani return.

TEACHER/RESEARCHER REBATE:
- The 25% tax rebate for full-time teachers and researchers in HEC-recognized non-profit education/research institutions was reinstated retroactively for tax years 2023, 2024 and 2025 ONLY, and is NOT available for Tax Year 2026 onwards. Do not let users claim it in the TY2026 return; for 2023–2025, those who paid full tax can pursue revision/refund. Exclusion: medical teachers deriving income from private practice or patient-fee shares do not qualify.

PROPERTY TAX KNOWLEDGE:
- Section 7E (deemed income, 1% of FMV on properties over Rs 25M) was declared ultra vires by the Federal Constitutional Court and deleted by the Finance Act 2026 — the 7E declaration/certificate requirement at property transfer no longer applies, and pending 7E notices are ineffective.
- CGT on immovable property: acquired on/after 1 July 2024 → flat 15% for filers (ATL) regardless of holding period; acquired before 1 July 2024 → holding-period-based slabs falling to 0% after roughly six years. Non-filers face higher rates.
- Advance taxes on transactions are ADJUSTABLE against actual liability in the return: seller 236C, buyer 236K. During Tax Year 2026 the old graduated rates applied (seller 4.5–5.5%, buyer 1.5–2.5% for filers by value band); from 1 July 2026 (TY2027) they became flat 2.75% (seller) and 1.25% (buyer) for ATL persons. If advance tax exceeds actual CGT, the excess is refundable via the return.
- Finance Act 2025 exemption: sale of one personal-use residence can be exempt from 236C if used personally and declared in the wealth statement for the last 15 years and shown as residence in tax records.
- Finance Act 2026: cost of inherited property = fair market value at the date of transfer to the beneficiary; family settlements treated as inheritance, not sale.

COMMON FILING MISTAKES (warn users about these when relevant):
1. Wrong return type — 114(I) simplified form is only for those whose income is dominated by salary; freelance/business/rental income requires the normal return. Wrong form choice commonly triggers audit notices.
2. Wrong tax year selected in IRIS.
3. Blindly accepting auto-populated salary/withholding data without verifying against the salary certificate — the employer's error becomes the taxpayer's declaration.
4. Missing adjustable taxes already paid: mobile top-up withholding, bank transaction tax, vehicle token, electricity bill withholding, property advance tax — all creditable in the adjustable tax tab; omitting them means overpaying or losing refund.
5. Omitting small assets (motorcycle, dormant accounts, prize bonds) from the wealth statement — data matching flags undeclared bank deposits.
6. Filing the income return without the wealth statement — legally incomplete.
7. Forcing reconciliation with fake expense/gift figures — indefensible if a notice demands evidence.
8. Claiming donation/Zakat/education deductions without receipts from FBR-approved organizations.
9. Not filing when income is below threshold despite tax withheld — refunds require a return. Filing is also mandatory in its own right regardless of tax owed if: annual salary exceeds Rs 600,000, a motor vehicle 1000cc or above is owned, property/assets worth Rs 5 million or more are held, or a commercial/industrial utility connection exists.
10. Ignoring platform income (Payoneer/Wise/JazzCash receipts from Upwork/Fiverr/YouTube) — tracked and taxable.
11. Filing in the last week of September — portal slowdowns and rushed errors; revision is possible after filing but act promptly. A return can be revised (wealth statement revisable before a 122(9) notice arrives).
12. Not saving the acknowledgement slip and CPR, and not verifying ATL status after filing.
13. Outdated taxpayer profile — CNIC typo, old mobile/email/address in IRIS — causes validation rejection independent of correct income figures.
14. Filing under the wrong taxpayer category after a business structure change (e.g. sole proprietor became AOP) but still filing the old individual profile.
15. Reporting property sale proceeds as raw income, or only the purchase price, instead of computing capital gain = sale price − cost.
16. Buying a significant asset with no traceable bank withdrawal/loan behind it — even correctly declared income and assets can still trigger a source-of-funds query if the payment trail is missing.
17. Writing a vague source of funds like "savings" with no salary slip, business profit record, gift deed, or inheritance paper behind it.
18. Ignoring IRIS's own validation warnings, or completing the return but skipping the final verification/e-sign step — the return remains legally incomplete even though it looks finished on screen.
19. Trying to file immediately after NTN registration before the Form 181 registration order has processed — causes a "Task Not Enabled" error; check the "Completed Tasks" folder for the order first.
20. Attempting to self-correct a CNIC number or registered email in IRIS — these require an in-person RTO visit; only mobile number, address, and bank account details are self-service via Form 181.
21. E-commerce/online sellers declaring business income lower than what payment gateways and couriers have reported to FBR on their behalf — a major real-world audit trigger under ss.177/214C, since third-party WHT data is cross-checked against declared income.
22. Assuming a calculated refund shown in the return pays out automatically — it requires filing a separate refund application in IRIS, and the payout IBAN must exactly match the bank account on the taxpayer's profile.
23. Bulk Excel data imports (for business filers) — a single bad or incomplete row rolls back the entire import, not just that row.
24. Businesses required to integrate digital invoicing with FBR ignoring that obligation — flat penalty of Rs 50,000 or 2% of the related tax for non-transmission, plus a running daily charge for unresolved invoice-data objections.

LEGAL FRAMEWORK (cite these precisely when explaining rights/obligations; for authoritative full text direct users to FBR's official law pages: https://www.fbr.gov.pk/act-rules-ordinances/131226 and https://fbr.gov.pk/laws):

Governing statutes (per FBR's official Acts/Ordinances/Rules index at fbr.gov.pk/act-rules-ordinances/131226):
- Income Tax Ordinance, 2001 (the primary income tax law) + Income Tax Rules, 2002 (return forms, procedures) + annual Finance Acts amending both. The version in force for TY2026 is the ITO 2001 as amended up to 30 June 2026.
- Sales Tax Act, 1990 (goods; registration relevant to businesses/retailers) + Sales Tax Rules 2006 + Sales Tax Special Procedure (Withholding) Rules 2007. Standard sales tax rate 18%; default surcharge 12% p.a. or KIBOR+3%, whichever higher.
- Federal Excise Act, 2005 + Federal Excise Rules 2005; Customs Act, 1969 + Customs Rules 2001; Islamabad Capital Territory (Tax on Services) Ordinance, 2001; provincial services taxes via PRA (Punjab)/SRB (Sindh)/KPRA (KP)/BRA (Balochistan).
- Recent amending instruments that changed enforcement mechanics: the Tax Laws (Amendment) Ordinance, 2025 (promulgated 2 May 2025) — inserted s.138(3A) and s.140(6A) making tax immediately recoverable once a High Court or Supreme Court decides the issue, even if a demand is stayed, and added s.175C empowering FBR to post officers at business premises to monitor production/stock. Also the Tax Laws (Amendment) Act, 2024 and Finance Act 2025 (e-commerce regime, pension taxation, revised salaried slabs, higher non-filer rates, the shift from "filer/non-filer" toward "eligible/ineligible person" concepts).
- Benami Transactions (Prohibition) Act, 2017 + Rules 2019 — holding property in another's name to hide ownership is punishable; relevant when users ask about "parking" assets with relatives.
- Asset/foreign-declaration laws (context only, mostly historic): Foreign Assets (Declaration and Repatriation) Act 2018, Voluntary Declaration of Domestic Assets Act 2018, Assets Declaration Ordinance 2019 — these were one-time amnesty schemes, now closed; don't advise relying on them.

Key Income Tax Ordinance sections for individuals (cite by number):
- s.114 obligation to file a return & who must file; s.114(6)/(6A) revision of a return (voluntary revision before audit/notice avoids penalty); s.116 wealth statement; s.116A foreign income & assets statement; s.118 due date for filing (30 September for individuals).
- s.120 assessment on filed return; s.122(5A)/(9) amendment of assessment & the notice giving the taxpayer a hearing; s.129–131 appeals (Commissioner Appeals → Appellate Tribunal); s.137 payment due at filing; s.138 recovery of tax demanded (with new s.138(3A): immediate recovery after a High/Supreme Court decision); s.140 recovery from persons holding taxpayer money (direct bank recovery, with new s.140(6A) for immediate recovery post-court-decision even if stayed).
- s.147 advance quarterly tax; s.149 salary withholding by employer; s.151 profit on debt withholding; s.153 goods/services/contract withholding; s.154/154A exports & IT/ITeS export final tax; s.154B social-media platform income withholding; s.155 rent withholding; s.161 employer/withholding agent's liability for failure to deduct; s.175C FBR officers posted at business premises to monitor stock/production.
- s.177 & s.214C audit selection (Finance Act 2025 clarified a 3-year immunity from re-selection after being audited); s.182 penalties (incl. late filing); s.182A ATL consequences & late-inclusion surcharge; s.191+ prosecution provisions; s.216 confidentiality of taxpayer information.
- s.231AB advance tax on cash withdrawal by non-ATL persons; s.236C seller and s.236K buyer advance tax on property; s.236Y foreign card transactions.
- Second Schedule: exemptions & tax reductions (e.g., teacher/researcher rebate clause, pension provisions); Tenth Schedule: elevated rates for persons not on the ATL.

STATUTORY PENALTY & OBLIGATION REFERENCE (Income Tax Ordinance 2001, for precise answers on consequences — cite the section and amount):
- s.114 obligation to file: also mandatory (regardless of tax) for owning a vehicle 1000cc+, immovable property/assets of Rs 5M+, a commercial/industrial electricity connection, or business income above the small threshold. A return is legally incomplete unless accompanied by the s.116 wealth statement (and s.116A foreign income & assets statement where required).
- s.182 late filing of return: penalty is the higher of 0.1% of tax payable per day of default OR Rs 1,000 per day; minimum Rs 10,000 for an individual with 75%+ salary income, or Rs 50,000 in all other cases; maximum 200% of tax payable for the year. The penalty is reduced by 75%, 50%, or 25% if the return is filed within one, two, or three months after the due date respectively — so filing even a bit late beats filing much later.
- s.182 failure to file wealth statement / statement under s.115(4): penalty of 0.1% of tax payable for each day of default, minimum Rs 500, maximum 25% of tax payable for the year.
- s.182A: a late filer is kept off the ATL until they pay the late-filer surcharge (per the current Finance Act — the individual figure has been revised upward; verify the exact amount for the year).
- s.114(6A) revised return: if a taxpayer voluntarily revises and deposits the short-paid/evaded tax plus default surcharge BEFORE a s.177 audit or s.122(9) notice, no penalty is recovered. If revised during/after audit but before a show-cause notice, add 25% of leviable penalties; after a s.122(9) show-cause notice, add 50%. Lesson to convey: revise early, it is materially cheaper.
- s.149 salary withholding: employer must deduct at the average rate, deposit by the 7th of the following month, and issue a certificate/CPR. Under-deduction exposes the employer (withholding agent) to a 12% per annum default surcharge plus a penalty equal to 10% of the tax not deducted (ss.161/205).
- s.191/s.192: failure to comply with return/wealth-statement notices, or making a false statement in a return's verification, are prosecutable offences (fine and/or imprisonment) — this is why never filing false/forged figures matters.
- Note: this app indexes these from the Income Tax Ordinance 2001; for the authoritative current text and any Finance Act amendments, direct users to FBR's official pages or a section-wise reference like tax-sahulat.com/sections.

Rules for citing: give the section number and a plain-language summary; never quote long statutory text verbatim; note that Finance Acts amend these annually so the current year's Act controls; for disputes or notices, advise reading the cited section on FBR's official site or consulting a tax practitioner. If asked about a section not listed here, answer from general knowledge cautiously and point to the official source rather than guessing.

TY2026 WITHHOLDING QUICK RATES (individuals, filer/ATL unless stated):
- Rent (s.155, individual/AOP): annual rent up to 300,000 = 0; 300,001–600,000 = 5% of excess; 600,001–2,000,000 = 15,000 + 10%; above 2,000,000 = 155,000 + 25%. Adjustable. Non-ATL higher per Tenth Schedule.
- Electricity (s.235): domestic on ATL = nil; domestic non-filer = 7.5% if monthly bill ≥ Rs 25,000. Commercial: bill ≤ 500 nil; ≤ 20,000 = 10%; above = Rs 1,950 + 12% of excess. Industrial above 20,000 = Rs 1,950 + 5% of excess. Commercial/industrial amounts adjustable.
- Mobile/phone/internet (s.236): 15% advance tax on usage/top-ups — fully adjustable via the return.
- Bank profit (s.151): 15% for individuals on ATL (final for most; profit above Rs 5M under normal rates); non-filers 30%.
- Property advance tax TY2026 (adjustable): seller s.236C 4.5% (≤50M) / 5% (50–100M) / 5.5% (>100M); buyer s.236K 1.5% / 2% / 2.5% for ATL. From 1 July 2026: flat 2.75% seller, 1.25% buyer.
- Cash withdrawal (s.231AB): non-ATL 0.8% on the amount exceeding Rs 50,000 per day; ATL persons exempt.

RULES:
1. Reply in the SAME language the user writes in. If the interface language is Urdu, prefer Urdu (natural, simple Urdu — not literal translation). Keep answers short, practical, and step-by-step.
2. You give general guidance, not legal or professional tax advice. For complex cases (foreign assets, audits, notices, large refunds), advise consulting a tax practitioner or FBR helpline (051-111-772-772).
3. Never invent slab rates or legal provisions beyond the knowledge above; if unsure, say so and point to fbr.gov.pk.
4. Be warm and reassuring — many users are first-time filers who find the process intimidating.`;

// ── Chat component (text + voice) ────────────────────────────
function Chat({ lang, t }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(true);
  const [voiceNote, setVoiceNote] = useState("");
  const bottomRef = useRef(null);
  const recRef = useRef(null);
  const speakOnRef = useRef(true);
  const langRef = useRef(lang);

  useEffect(() => {
    speakOnRef.current = speakOn;
    if (!speakOn && window.speechSynthesis) window.speechSynthesis.cancel();
  }, [speakOn]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  // Stop mic + speech when leaving the tab
  useEffect(() => {
    return () => {
      try {
        recRef.current?.stop();
      } catch (e) {}
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text) => {
    if (!speakOnRef.current || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    // Strip markdown symbols so they aren't read aloud
    const clean = text.replace(/[*#_`>]/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    const wantUr = langRef.current === "ur";
    u.lang = wantUr ? "ur-PK" : "en-US";
    const voices = window.speechSynthesis.getVoices() || [];
    const match =
      voices.find((v) =>
        v.lang.toLowerCase().startsWith(wantUr ? "ur" : "en")
      ) ||
      // Hindi voice is an intelligible fallback for spoken Urdu on many devices
      (wantUr ? voices.find((v) => v.lang.toLowerCase().startsWith("hi")) : null);
    if (match) u.voice = match;
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  const sendText = async (raw) => {
    const text = (raw || "").trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/tax-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("tax chatbot request failed");
      const reply = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      setMessages([
        ...next,
        { role: "assistant", content: reply || t.chatError },
      ]);
      speak(reply || t.chatError);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: t.chatError }]);
    } finally {
      setBusy(false);
    }
  };

  const send = () => sendText(input);

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceNote(t.voiceUnsupported);
      return;
    }
    setVoiceNote("");
    if (listening) {
      try {
        recRef.current?.stop();
      } catch (e) {}
      setListening(false);
      return;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const rec = new SR();
    rec.lang = lang === "ur" ? "ur-PK" : "en-PK";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput(finalText + interim);
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) sendText(finalText);
    };
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      setListening(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
        <h2 className="text-xl font-bold" style={{ color: COLORS.green }}>
          {t.chatTitle}
        </h2>
        <button
          onClick={() => setSpeakOn(!speakOn)}
          className="text-xs rounded-full border px-3 py-1 font-semibold"
          style={{
            borderColor: speakOn ? COLORS.gold : "#B9C9BF",
            background: speakOn ? "#FBF6E3" : "transparent",
            color: speakOn ? "#7A6210" : COLORS.green,
          }}
        >
          {speakOn ? t.voiceOn : t.voiceOff}
        </button>
      </div>
      <p className="text-sm mb-4 opacity-70">{t.chatHint}</p>

      <div
        className="rounded-xl border p-4 mb-3 overflow-y-auto"
        style={{
          borderColor: "#DDD6C4",
          background: "#FFFFFF",
          minHeight: "260px",
          maxHeight: "420px",
        }}
      >
        {messages.length === 0 && (
          <p className="text-sm opacity-50 text-center mt-16">
            {lang === "ur"
              ? "السلام علیکم! میں آپ کے ٹیکس ریٹرن میں مدد کے لیے حاضر ہوں۔"
              : "Assalam-o-alaikum! Ask me anything about filing your return."}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className="rounded-lg px-3 py-2 text-sm whitespace-pre-wrap max-w-[85%]"
              style={
                m.role === "user"
                  ? { background: COLORS.green, color: "#F6F4EC" }
                  : { background: "#F1EDE0", color: COLORS.ink }
              }
            >
              {m.content}
              {m.role === "assistant" && (
                <button
                  onClick={() => {
                    speakOnRef.current = true;
                    speak(m.content);
                    speakOnRef.current = speakOn;
                  }}
                  className="block mt-1 text-xs opacity-60 underline"
                  title="Play"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-sm italic opacity-60">{t.thinking}</p>
        )}
        {listening && (
          <p
            className="text-sm font-semibold animate-pulse"
            style={{ color: COLORS.red }}
          >
            ● {t.listening}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {voiceNote && (
        <p className="text-xs mb-2" style={{ color: COLORS.red }}>
          {voiceNote}
        </p>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t.chatPlaceholder}
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }}
        />
        <button
          onClick={toggleMic}
          disabled={busy}
          className="rounded-lg px-4 py-2 text-sm font-semibold border"
          title={listening ? t.micStop : t.micStart}
          style={
            listening
              ? { background: COLORS.red, color: "#FFF", borderColor: COLORS.red }
              : { background: "#FFFDF6", color: COLORS.green, borderColor: "#CBBF9C" }
          }
        >
          {listening ? "■" : "🎤"} {listening ? t.micStop : t.micStart}
        </button>
        <button
          onClick={send}
          disabled={busy}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{
            background: busy ? "#8AA79A" : COLORS.green,
            color: "#F6F4EC",
          }}
        >
          {t.send}
        </button>
      </div>
    </div>
  );
}

// ── Calculators ──────────────────────────────────────────────
const RENT_SLABS = [
  { upTo: 300000, fixed: 0, rate: 0, base: 0 },
  { upTo: 600000, fixed: 0, rate: 0.05, base: 300000 },
  { upTo: 2000000, fixed: 15000, rate: 0.1, base: 600000 },
  { upTo: Infinity, fixed: 155000, rate: 0.25, base: 2000000 },
];

function ResultBox({ rows, note }) {
  return (
    <div className="rounded-xl p-5" style={{ background: COLORS.green, color: "#F6F4EC" }}>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`flex justify-between ${r.big ? "text-lg font-bold border-t pt-2 mt-2" : "text-sm mb-1"}`}
          style={r.big ? { borderColor: "#2E6B54" } : {}}
        >
          <span>{r.label}</span>
          <span style={{ direction: "ltr" }}>{r.value}</span>
        </div>
      ))}
      {note && <div className="text-xs mt-3" style={{ color: COLORS.gold }}>{note}</div>}
    </div>
  );
}

function NumInput({ label, value, onChange, placeholder }) {
  return (
    <>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2 mb-4 outline-none"
        style={{ borderColor: "#CBBF9C", background: "#FFFDF6", direction: "ltr" }}
      />
    </>
  );
}

function Toggle({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium"
          style={
            value === o.id
              ? { background: COLORS.green, color: "#F6F4EC", borderColor: COLORS.green }
              : { borderColor: "#CBBF9C", color: COLORS.ink }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Calculator({ t, lang }) {
  const [calc, setCalc] = useState("income");
  const [income, setIncome] = useState("");
  const [type, setType] = useState("salaried");
  const [rentAmt, setRentAmt] = useState("");
  const [bill, setBill] = useState("");
  const [consumer, setConsumer] = useState("domestic");
  const [atl, setAtl] = useState("filer");
  const [spend, setSpend] = useState("");
  const [profit, setProfit] = useState("");
  const [propVal, setPropVal] = useState("");
  const [role, setRole] = useState("selling");
  const [cash, setCash] = useState("");

  const num = (v) => parseFloat(String(v).replace(/,/g, "")) || 0;
  const isFiler = atl === "filer";

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.green }}>
        {t.calcTitle}
      </h2>
      <p className="text-sm mb-3 opacity-70">{t.calcPick}</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(t.calcTypes).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setCalc(k)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={
              calc === k
                ? { background: COLORS.gold, color: "#2B2205", borderColor: COLORS.gold }
                : { borderColor: "#B9C9BF", color: COLORS.green }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {calc === "income" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.calcNote}</p>
          <Toggle
            options={[
              { id: "salaried", label: t.typeSalaried },
              { id: "business", label: t.typeBusiness },
            ]}
            value={type}
            onChange={setType}
          />
          <NumInput label={t.incomeLabel} value={income} onChange={setIncome} placeholder="e.g. 1800000" />
          {num(income) > 0 && (() => {
            const r = computeTax(num(income), type === "salaried" ? SALARIED_SLABS : BUSINESS_SLABS, type === "salaried");
            return (
              <ResultBox
                rows={[
                  { label: t.taxDue, value: fmt(r.tax) },
                  ...(r.surcharge > 0 ? [{ label: t.surcharge, value: fmt(r.surcharge) }] : []),
                  { label: t.totalTax, value: fmt(r.total), big: true },
                  { label: t.monthly, value: fmt(r.total / 12) },
                  { label: t.effective, value: ((r.total / num(income)) * 100).toFixed(1) + "%" },
                ]}
              />
            );
          })()}
        </div>
      )}

      {calc === "rent" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.rentNote}</p>
          <NumInput label={t.annualRent} value={rentAmt} onChange={setRentAmt} placeholder="e.g. 900000" />
          {num(rentAmt) > 0 && (() => {
            const n = num(rentAmt);
            const s = RENT_SLABS.find((x) => n <= x.upTo);
            const tax = s.fixed + (n - s.base) * s.rate;
            return (
              <ResultBox
                rows={[
                  { label: t.taxWithheld, value: fmt(tax), big: true },
                  { label: t.perMonth, value: fmt(tax / 12) },
                  { label: t.effective, value: ((tax / n) * 100).toFixed(1) + "%" },
                ]}
                note={t.adjustable}
              />
            );
          })()}
        </div>
      )}

      {calc === "elec" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.elecNote}</p>
          <div className="font-semibold text-sm mb-2">{t.consumerType}</div>
          <Toggle
            options={[
              { id: "domestic", label: t.domestic },
              { id: "commercial", label: t.commercial },
              { id: "industrial", label: t.industrial },
            ]}
            value={consumer}
            onChange={setConsumer}
          />
          {consumer === "domestic" && (
            <>
              <div className="font-semibold text-sm mb-2">{t.atlQ}</div>
              <Toggle
                options={[
                  { id: "filer", label: t.filer },
                  { id: "nonfiler", label: t.nonFiler },
                ]}
                value={atl}
                onChange={setAtl}
              />
            </>
          )}
          <NumInput label={t.monthlyBill} value={bill} onChange={setBill} placeholder="e.g. 30000" />
          {num(bill) > 0 && (() => {
            const b = num(bill);
            let m = 0;
            if (consumer === "domestic") {
              m = !isFiler && b >= 25000 ? b * 0.075 : 0;
            } else if (b > 500) {
              m = b <= 20000 ? b * 0.1 : 1950 + (b - 20000) * (consumer === "commercial" ? 0.12 : 0.05);
            }
            return m > 0 ? (
              <ResultBox
                rows={[
                  { label: t.perMonth, value: fmt(m), big: true },
                  { label: t.perYear, value: fmt(m * 12) },
                ]}
                note={consumer !== "domestic" ? t.adjustable : undefined}
              />
            ) : (
              <p className="text-sm font-semibold" style={{ color: COLORS.green2 }}>{t.noTax}</p>
            );
          })()}
        </div>
      )}

      {calc === "mobile" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.mobileNote}</p>
          <NumInput label={t.monthlySpend} value={spend} onChange={setSpend} placeholder="e.g. 2000" />
          {num(spend) > 0 && (
            <ResultBox
              rows={[
                { label: t.perMonth, value: fmt(num(spend) * 0.15), big: true },
                { label: t.perYear, value: fmt(num(spend) * 0.15 * 12) },
              ]}
              note={t.adjustable}
            />
          )}
        </div>
      )}

      {calc === "bank" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.bankNote}</p>
          <div className="font-semibold text-sm mb-2">{t.atlQ}</div>
          <Toggle
            options={[
              { id: "filer", label: t.filer },
              { id: "nonfiler", label: t.nonFiler },
            ]}
            value={atl}
            onChange={setAtl}
          />
          <NumInput label={t.profitAmt} value={profit} onChange={setProfit} placeholder="e.g. 200000" />
          {num(profit) > 0 && (
            <ResultBox
              rows={[
                { label: t.taxWithheld + ` (${isFiler ? "15%" : "30%"})`, value: fmt(num(profit) * (isFiler ? 0.15 : 0.3)), big: true },
              ]}
            />
          )}
        </div>
      )}

      {calc === "prop" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.propNote}</p>
          <div className="font-semibold text-sm mb-2">{t.propRole}</div>
          <Toggle
            options={[
              { id: "selling", label: t.selling },
              { id: "buying", label: t.buying },
            ]}
            value={role}
            onChange={setRole}
          />
          <NumInput label={t.propValue} value={propVal} onChange={setPropVal} placeholder="e.g. 25000000" />
          {num(propVal) > 0 && (() => {
            const v = num(propVal);
            const band = v <= 50000000 ? 0 : v <= 100000000 ? 1 : 2;
            const rate = role === "selling" ? [0.045, 0.05, 0.055][band] : [0.015, 0.02, 0.025][band];
            return (
              <ResultBox
                rows={[
                  { label: t.taxWithheld + ` (${(rate * 100).toFixed(2)}%)`, value: fmt(v * rate), big: true },
                ]}
                note={t.adjustable}
              />
            );
          })()}
        </div>
      )}

      {calc === "cash" && (
        <div>
          <p className="text-xs mb-4 opacity-70">{t.cashNote}</p>
          <NumInput label={t.withdrawAmt} value={cash} onChange={setCash} placeholder="e.g. 100000" />
          {num(cash) > 0 && (() => {
            const c = num(cash);
            const tax = c > 50000 ? (c - 50000) * 0.008 : 0;
            return tax > 0 ? (
              <ResultBox
                rows={[
                  { label: t.nonFiler + " (0.8%)", value: fmt(tax), big: true },
                  { label: t.filer, value: fmt(0) },
                ]}
              />
            ) : (
              <p className="text-sm font-semibold" style={{ color: COLORS.green2 }}>{t.noTax}</p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ── Guide ────────────────────────────────────────────────────
function Guide({ t, lang }) {
  const [who, setWho] = useState(null);
  const [done, setDone] = useState({});

  if (!who) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: COLORS.green }}>
          {t.whoTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.who.map((w) => (
            <button
              key={w.id}
              onClick={() => setWho(w.id)}
              className="text-start rounded-xl border p-4 hover:shadow transition-shadow"
              style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }}
            >
              <div className="font-bold" style={{ color: COLORS.green }}>
                {w.label}
              </div>
              <div className="text-xs mt-1 opacity-70">{w.note}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const specific = t.steps[who] || [];
  const common = t.steps.common;
  const steps = [common[0], common[1], ...specific, common[2], common[3], common[4], common[5]];
  const docs = t.docs[who];
  const whoLabel = t.who.find((w) => w.id === who)?.label;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h2 className="text-xl font-bold" style={{ color: COLORS.green }}>
          {whoLabel} — {t.stepsTitle}
        </h2>
        <button
          onClick={() => setWho(null)}
          className="text-xs underline opacity-70"
        >
          {t.startOver}
        </button>
      </div>

      <div
        className="rounded-xl border p-4 mb-6"
        style={{ borderColor: COLORS.gold, background: "#FBF6E3" }}
      >
        <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>
          {t.beforeTitle}
        </div>
        <ul className="text-sm space-y-1">
          {docs.map((d, i) => (
            <li key={i} className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={!!done[i]}
                onChange={() => setDone({ ...done, [i]: !done[i] })}
                className="mt-1"
              />
              <span style={done[i] ? { textDecoration: "line-through", opacity: 0.5 } : {}}>
                {d}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{ borderColor: "#DDD6C4", background: "#FFFFFF" }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  width: 24,
                  height: 24,
                  background: COLORS.green,
                  color: "#F6F4EC",
                }}
              >
                {i + 1}
              </span>
              <span className="font-bold" style={{ color: COLORS.ink }}>
                {s.t}
              </span>
              {s.isNew && (
                <span
                  className="text-[10px] font-bold rounded px-2 py-0.5"
                  style={{ background: COLORS.gold, color: "#3A2E05" }}
                >
                  {t.newBadge}
                </span>
              )}
            </div>
            <p className="text-sm mt-2 opacity-80 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Real-life scenarios ──────────────────────────────────────
function Scenarios({ t }) {
  const [open, setOpen] = useState(0);

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.green }}>
        {t.scenariosTitle}
      </h2>
      <p className="text-sm mb-5 opacity-70">{t.scenariosSub}</p>

      <div className="space-y-3">
        {t.scenarios.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: open === i ? COLORS.green : "#DDD6C4", background: "#FFFFFF" }}
          >
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-start px-4 py-3 flex items-center justify-between gap-3"
            >
              <span className="font-bold text-sm" style={{ color: COLORS.green }}>
                {s.title}
              </span>
              <span
                className="text-lg leading-none flex-shrink-0"
                style={{ color: COLORS.gold, transform: open === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}
              >
                +
              </span>
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm opacity-80 leading-relaxed mb-3">{s.story}</p>
                <div
                  className="rounded-lg p-3 text-sm leading-relaxed"
                  style={{ background: "#FBF6E3", borderInlineStart: `4px solid ${COLORS.gold}` }}
                >
                  <span className="font-bold" style={{ color: "#7A6210" }}>
                    {t.lessonLabel}:{" "}
                  </span>
                  {s.lesson}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs mt-5 opacity-50 text-center">{t.scenariosCredit}</p>
    </div>
  );
}

// ── Common mistakes ──────────────────────────────────────────
function Mistakes({ t }) {
  const [checked, setChecked] = useState({});

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: COLORS.green }}>
        {t.mistakesTitle}
      </h2>
      <p className="text-sm mb-5 opacity-70">{t.mistakesSub}</p>

      <div className="space-y-3">
        {t.mistakes.map((m, i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{
              borderColor: checked[i] ? COLORS.green : "#DDD6C4",
              background: checked[i] ? "#F0F5F1" : "#FFFFFF",
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={() => setChecked({ ...checked, [i]: !checked[i] })}
                className="mt-1.5"
              />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                    style={{ width: 22, height: 22, background: COLORS.red, color: "#FFF" }}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-sm" style={{ color: COLORS.ink }}>
                    {m.t}
                  </span>
                </div>
                <p className="text-sm mt-2 opacity-80 leading-relaxed">{m.d}</p>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: COLORS.green2 }}>
                  <span className="font-bold">{t.fixLabel}: </span>
                  {m.f}
                </p>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Return gap check (upload + screening + AI analysis) ─────
function GapCheck({ lang, t, dedicated = false }) {
  const [income, setIncome] = useState({});
  const [assets, setAssets] = useState({});
  const [firstTime, setFirstTime] = useState(null);
  const [files, setFiles] = useState([]);
  const [redactionConfirmed, setRedactionConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [uploadStage, setUploadStage] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [encodedCount, setEncodedCount] = useState(0);

  const toggle = (state, setState, id) =>
    setState({ ...state, [id]: !state[id] });

  const onFiles = (e) => {
    setErr("");
    setUploadStage("validating");
    setUploadProgress(20);
    if (!redactionConfirmed) {
      setErr(t.redactionRequired);
      setUploadStage("error");
      setUploadProgress(0);
      e.target.value = "";
      return;
    }
    const picked = Array.from(e.target.files || []).slice(0, 3);
    for (const f of picked) {
      if (f.size > 4 * 1024 * 1024) {
        setErr(`"${f.name}" ${t.tooBig}`);
        setUploadStage("error");
        setUploadProgress(0);
        return;
      }
      const ok =
        f.type === "application/pdf" || f.type.startsWith("image/");
      if (!ok) {
        setErr(`"${f.name}" ${t.badType}`);
        setUploadStage("error");
        setUploadProgress(0);
        return;
      }
    }
    setFiles(picked);
    setEncodedCount(0);
    setUploadProgress(picked.length > 0 ? 100 : 0);
    setUploadStage(picked.length > 0 ? "ready" : "idle");
  };

  const readB64 = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = () => rej(new Error("read failed"));
      r.readAsDataURL(file);
    });

  const analyze = async () => {
    setErr("");
    if (!redactionConfirmed) {
      setErr(t.redactionRequired);
      return;
    }
    if (files.length === 0) {
      setErr(t.needFile);
      return;
    }
    setBusy(true);
    setResult(null);
    setUploadStage("encoding");
    setUploadProgress(0);
    setEncodedCount(0);
    try {
      const blocks = [];
      for (const [index, f] of files.entries()) {
        const data = await readB64(f);
        setEncodedCount(index + 1);
        setUploadProgress(Math.round(((index + 1) / files.length) * 65));
        if (f.type === "application/pdf") {
          blocks.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data },
          });
        } else {
          blocks.push({
            type: "image",
            source: { type: "base64", media_type: f.type, data },
          });
        }
      }
      const incomeList = t.incomeOpts
        .filter((o) => income[o.id])
        .map((o) => o.id)
        .join(", ") || "none selected";
      const assetList = t.assetOpts
        .filter((o) => assets[o.id])
        .map((o) => o.id)
        .join(", ") || "none selected";
      blocks.push({
        type: "text",
        text: `Screening answers (context only; do not treat as document evidence): income sources=${incomeList}; assets=${assetList}; first-time filer=${firstTime === true ? "yes" : firstTime === false ? "no" : "not answered"}.`,
      });
      setUploadStage("analyzing");
      setUploadProgress(85);

      const res = await fetch("/api/return-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang, documents: blocks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("return review request failed");
      setUploadProgress(100);
      setUploadStage("complete");
      setResult({ ...(data.review || data), calculations: data.calculations });
    } catch (e) {
      setErr(t.analyzeError);
      setUploadStage("error");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-3" style={{ color: COLORS.green }}>
          {t.checkTitle}
        </h2>
        {result.status && (
          <div className="inline-flex rounded-full px-3 py-1 text-xs font-bold mb-3" style={{ background: result.status === "reconciled" ? "#DCEFE2" : result.status === "major_issues" ? "#F7D9D0" : "#FBF6E3", color: result.status === "reconciled" ? COLORS.green2 : result.status === "major_issues" ? COLORS.red : "#7A6210" }}>
            {result.status === "reconciled" ? (lang === "ur" ? "حساب مل گیا" : "Reconciled") : result.status === "major_issues" ? (lang === "ur" ? "اہم مسائل" : "Major issues") : (lang === "ur" ? "مزید جانچ ضروری" : "Needs review")}
          </div>
        )}
        <div
          className="rounded-xl p-4 mb-4 text-sm leading-relaxed"
          style={{ background: COLORS.green, color: "#F6F4EC" }}
        >
          {result.summary}
        </div>

        {result.calculations?.wealth && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: result.calculations.wealth.status === "reconciled" ? "#B5CDBD" : "#E0B4A8", background: result.calculations.wealth.status === "reconciled" ? "#F0F5F1" : "#FBF1EE" }}>
            <div className="font-bold text-sm mb-2" style={{ color: result.calculations.wealth.status === "reconciled" ? COLORS.green2 : COLORS.red }}>
              {lang === "ur" ? "ویلتھ اسٹیٹمنٹ کا حساب" : "Wealth Statement calculation"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div><span className="opacity-70">{lang === "ur" ? "متوقع اختتامی دولت" : "Expected closing wealth"}</span><div className="font-semibold" dir="ltr">Rs. {new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-PK", { maximumFractionDigits: 2 }).format(result.calculations.wealth.expectedClosingWealth || 0)}</div></div>
              <div><span className="opacity-70">{lang === "ur" ? "اعلان کردہ اختتامی دولت" : "Declared closing wealth"}</span><div className="font-semibold" dir="ltr">Rs. {new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-PK", { maximumFractionDigits: 2 }).format(result.calculations.wealth.declaredClosingWealth || 0)}</div></div>
              <div><span className="opacity-70">{lang === "ur" ? "غیر واضح فرق" : "Unexplained difference"}</span><div className="font-semibold" dir="ltr">Rs. {new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-PK", { maximumFractionDigits: 2 }).format(result.calculations.wealth.unexplainedDifference || 0)}</div></div>
            </div>
            <p className="text-xs mt-3 opacity-75">{lang === "ur" ? "یہ حساب فراہم کردہ اعداد سے خودکار طور پر نکالا گیا ہے؛ حتمی درجہ بندی کے لیے اصل ریکارڈ کی تصدیق کریں۔" : "This arithmetic is calculated from the extracted figures; verify source records before making a filing decision."}</p>
          </div>
        )}

        {result.calculations?.banks?.some((bank) => bank.status === "needs_review") && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: COLORS.gold, background: "#FBF6E3" }}>
            <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>{lang === "ur" ? "بینک بیلنس کا کراس چیک" : "Bank balance cross-check"}</div>
            <ul className="text-sm space-y-1 opacity-85">
              {result.calculations.banks.filter((bank) => bank.status === "needs_review").map((bank, i) => <li key={i}>• {bank.accountRef}: {lang === "ur" ? "اعلان کردہ ویلتھ بیلنس اور اسٹیٹمنٹ کلوزنگ بیلنس میں فرق" : "the declared Wealth Statement balance differs from the statement closing balance"} ({bank.difference})</li>)}
            </ul>
          </div>
        )}

        {result.calculations?.fieldReconciliation?.total > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#B9C9BF", background: "#F7FAF7" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{lang === "ur" ? "دستاویز اور ریٹرن کا موازنہ" : "Document-to-return reconciliation"}</div>
            <div className="text-xs opacity-75 mb-3">
              {lang === "ur"
                ? "دستاویز سے حاصل شدہ اعداد اور ریٹرن میں موجود اعداد کا خودکار موازنہ۔ اختلاف صرف تصدیق کی ضرورت دکھاتا ہے۔"
                : "Deterministic comparison of figures established from supporting documents against return values. A mismatch is a verification signal, not a compliance determination."}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "کل" : "Total"}</div><div className="font-bold">{result.calculations.fieldReconciliation.total}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "مطابقت" : "Matched"}</div><div className="font-bold">{result.calculations.fieldReconciliation.matched}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "اختلاف/جانچ" : "Mismatch / verify"}</div><div className="font-bold">{result.calculations.fieldReconciliation.mismatches + result.calculations.fieldReconciliation.requiresVerification}</div></div>
            </div>
            <div className="space-y-2">
              {result.calculations.fieldReconciliation.results.map((item, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ background: "#fff", borderColor: item.status === "matched" ? "#B9C9BF" : "#E3D7AE" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{item.field}</div>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ background: item.status === "matched" ? "#DCEFE2" : "#FBF6E3", color: item.status === "matched" ? COLORS.green2 : "#7A6210" }}>
                      {item.status === "matched" ? (lang === "ur" ? "مطابق" : "matched") : item.status === "mismatch" ? (lang === "ur" ? "فرق" : "mismatch") : (lang === "ur" ? "تصدیق" : "verify")}
                    </span>
                  </div>
                  <div className="text-xs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span>Return: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.returnValue || 0)}</b></span>
                    <span>Evidence: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.evidenceValue || 0)}</b></span>
                    <span>Difference: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.difference || 0)}</b></span>
                  </div>
                  <div className="text-xs mt-1 opacity-65">{item.detail} · {item.evidenceRef}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.assetReconciliation?.total > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#B9C9BF", background: "#F7FAF7" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{lang === "ur" ? "سرمایہ کاری اور دیگر اثاثوں کی جانچ" : "Investment & asset reconciliation"}</div>
            <div className="text-xs opacity-75 mb-3">
              {lang === "ur"
                ? "سرمایہ کاری، گاڑی یا دوسرے اثاثے کے بیان میں موجود رقم کو ریٹرن کی رقم سے ملایا گیا ہے۔"
                : "Investment, vehicle, and other asset statement values are compared with the corresponding return values."}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "کل" : "Total"}</div><div className="font-bold">{result.calculations.assetReconciliation.total}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "مطابق" : "Matched"}</div><div className="font-bold">{result.calculations.assetReconciliation.matched}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "فرق" : "Mismatches"}</div><div className="font-bold">{result.calculations.assetReconciliation.mismatches}</div></div>
            </div>
            <div className="space-y-2">
              {result.calculations.assetReconciliation.results.map((item, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ background: "#fff", borderColor: item.status === "matched" ? "#B9C9BF" : "#E3D7AE" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ background: item.status === "matched" ? "#DCEFE2" : "#FBF6E3", color: item.status === "matched" ? COLORS.green2 : "#7A6210" }}>
                      {item.status === "matched" ? (lang === "ur" ? "مطابق" : "matched") : (lang === "ur" ? "جانچ ضروری" : "verify")}
                    </span>
                  </div>
                  <div className="text-xs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span>Statement: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.statementValue || 0)}</b></span>
                    <span>Return: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.declaredValue || 0)}</b></span>
                    <span>Difference: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.difference || 0)}</b></span>
                  </div>
                  <div className="text-xs mt-1 opacity-65">{item.detail} · {item.evidenceRef}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.liabilityContinuity?.total > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#D7DDE6", background: "#F7F9FC" }}>
            <div className="font-bold text-sm mb-2">Liability continuity</div>
            <div className="text-xs opacity-75 mb-3">Prior-year and current-year liabilities are compared conservatively. A missing prior/current record is a verification signal, not proof that a liability was created or settled.</div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="rounded-lg border p-2"><div className="opacity-60">Liabilities</div><div className="font-bold">{result.calculations.liabilityContinuity.total}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">New / changed</div><div className="font-bold">{result.calculations.liabilityContinuity.new + result.calculations.liabilityContinuity.increased + result.calculations.liabilityContinuity.decreased}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">Settled</div><div className="font-bold">{result.calculations.liabilityContinuity.settled}</div></div>
            </div>
            <div className="space-y-2">
              {result.calculations.liabilityContinuity.results.map((item, i) => (
                <div key={i} className="rounded-lg border p-3 bg-white">
                  <div className="flex items-center justify-between gap-2"><div className="font-semibold text-sm">{item.label}</div><span className="text-xs rounded-full px-2 py-0.5" style={{ background: item.status === "continued" ? "#DCEFE2" : "#FBF6E3" }}>{item.status}</span></div>
                  <div className="text-xs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span>Prior: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.priorYearAmount || 0)}</b></span>
                    <span>Current: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.currentYearAmount || 0)}</b></span>
                    <span>Change: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.difference || 0)}</b></span>
                  </div>
                  <div className="text-xs mt-1 opacity-65">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.assetLiabilities?.totalAssets > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#D7DDE6", background: "#F7F9FC" }}>
            <div className="font-bold text-sm mb-2">Asset & liability consistency</div>
            <div className="text-xs opacity-75 mb-3">
              A related loan/payable can explain part of an asset acquisition, but the system does not treat a booking or future payment obligation as a liability without supporting evidence.
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="rounded-lg border p-2"><div className="opacity-60">Assets checked</div><div className="font-bold">{result.calculations.assetLiabilities.totalAssets}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">Consistent</div><div className="font-bold">{result.calculations.assetLiabilities.consistent}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">Verification</div><div className="font-bold">{result.calculations.assetLiabilities.partial + result.calculations.assetLiabilities.requiresVerification}</div></div>
            </div>
            <div className="space-y-2">
              {result.calculations.assetLiabilities.results.map((item, i) => (
                <div key={i} className="rounded-lg border p-3 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{item.assetLabel}</div>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ background: item.status === "consistent" ? "#DCEFE2" : "#FBF6E3" }}>{item.status}</span>
                  </div>
                  <div className="text-xs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span>Asset: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.assetValue || 0)}</b></span>
                    <span>Liability matched: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.matchedLiabilityAmount || 0)}</b></span>
                    <span>Unmatched: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK").format(item.unmatchedAssetAmount || 0)}</b></span>
                  </div>
                  <div className="text-xs mt-1 opacity-65">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.assetFundingTrace?.totalAssets > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#E3D7AE", background: "#FFF9E8" }}>
            <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>{lang === "ur" ? "اثاثوں کے ذرائعِ فنڈز کی جانچ" : "Asset source-of-funds tracing"}</div>
            <div className="text-xs opacity-75 mb-3">
              {lang === "ur"
                ? "ہر شناخت شدہ اثاثے کی ادائیگی کو دستیاب بینک رسیدوں سے محتاط طریقے سے ملایا گیا ہے۔"
                : "Identified asset applications are conservatively matched to preceding documented bank receipts; an unmatched amount is a verification signal, not proof of an undisclosed source."}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "اثاثے" : "Assets"}</div><div className="font-bold">{result.calculations.assetFundingTrace.totalAssets}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "مکمل ٹریس" : "Traced"}</div><div className="font-bold">{result.calculations.assetFundingTrace.traced}</div></div>
              <div className="rounded-lg border p-2"><div className="opacity-60">{lang === "ur" ? "جانچ ضروری" : "Needs review"}</div><div className="font-bold">{result.calculations.assetFundingTrace.needsReview + result.calculations.assetFundingTrace.partial}</div></div>
            </div>
            <div className="space-y-2">
              {result.calculations.assetFundingTrace.results.map((item, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ background: "#fff", borderColor: item.status === "traced" ? "#B9C9BF" : "#E3D7AE" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{item.label}</div>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ background: item.status === "traced" ? "#DCEFE2" : "#FBF6E3", color: item.status === "traced" ? COLORS.green2 : "#7A6210" }}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1">
                    <span>Declared: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.declaredValue || 0)}</b></span>
                    <span>Traced: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.tracedSourceAmount || 0)}</b></span>
                    <span>Unexplained: <b dir="ltr">Rs. {new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(item.unexplainedAmount || 0)}</b></span>
                  </div>
                  <div className="text-xs mt-1 opacity-65">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.ty2026Rules?.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: COLORS.gold, background: "#FFF9E8" }}>
            <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>{lang === "ur" ? "TY2026 قواعد پر مبنی جانچ" : "TY2026 rule-based checks"}</div>
            <div className="text-xs opacity-75 mb-3">{lang === "ur" ? "یہ نتائج صرف ان قواعد کو دکھاتے ہیں جن کے لیے فراہم کردہ ریکارڈ میں قابلِ جانچ اشارہ موجود ہے۔" : "Only rules supported by the submitted evidence are shown; the AI does not invent additional findings."}</div>
            <div className="space-y-3">
              {result.calculations.ty2026Rules.map((rule, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ borderColor: "#E3D7AE", background: "#fff" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm">{rule.ruleId}: {rule.title}</div>
                    <span className="text-xs rounded-full px-2 py-0.5" style={{ background: rule.severity === "high" ? "#F7D9D0" : "#FBF6E3", color: rule.severity === "high" ? COLORS.red : "#7A6210" }}>{rule.severity}</span>
                  </div>
                  <div className="text-sm mt-1">{rule.detail}</div>
                  {rule.question && <div className="text-xs mt-2 opacity-75">{rule.question}</div>}
                  <div className="text-xs mt-1 opacity-55">{rule.evidenceClass} · {rule.confidence} confidence</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.deterministicFindings?.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: COLORS.gold, background: "#FBF6E3" }}>
            <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>{lang === "ur" ? "خودکار عملی جانچ" : "Deterministic practical checks"}</div>
            <div className="space-y-2">
              {result.calculations.deterministicFindings.map((finding, i) => (
                <div key={i} className="text-sm">
                  <div className="font-semibold">{finding.title}</div>
                  <div className="opacity-80">{finding.detail}</div>
                  <div className="text-xs mt-1 opacity-65">{finding.evidenceClass} · {finding.confidence} confidence · {finding.severity} priority</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.transactionAnalysis?.classifications?.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#B9C9BF", background: "#F7FAF7" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{lang === "ur" ? "بینک لین دین کی درجہ بندی" : "Bank transaction classification"}</div>
            <div className="text-xs opacity-75 mb-2">{lang === "ur" ? "یہ درجہ بندیاں صرف لین دین کی تفصیل سے حاصل ہونے والے اشارے ہیں؛ اصل دستاویز سے تصدیق ضروری ہے۔" : "These are description-based signals only; confirm each material classification against the underlying record."}</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(result.calculations.transactionAnalysis.counts || {}).map(([category, count]) => (
                <span key={category} className="rounded-full border px-2 py-1 text-xs" style={{ borderColor: "#B9C9BF" }}>{category}: {count}</span>
              ))}
            </div>
          </div>
        )}

        {result.calculations?.assetContinuity?.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#B9C9BF", background: "#F7FAF7" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{lang === "ur" ? "پچھلے سال کے اثاثوں کا تسلسل" : "Year-to-year asset continuity"}</div>
            <ul className="text-sm space-y-2">
              {result.calculations.assetContinuity.map((item, i) => <li key={i}>• <span className="font-semibold">{item.label}</span>: {item.detail}</li>)}
            </ul>
          </div>
        )}

        {result.found?.length > 0 && (
          <div className="rounded-xl border p-4 mb-3" style={{ borderColor: "#B5CDBD", background: "#F0F5F1" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{t.resFound}</div>
            <ul className="text-sm space-y-1 opacity-85">
              {result.found.map((x, i) => <li key={i}>• {x}</li>)}
            </ul>
          </div>
        )}

        {result.missing?.length > 0 && (
          <div className="rounded-xl border p-4 mb-3" style={{ borderColor: "#E0B4A8", background: "#FBF1EE" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.red }}>{t.resMissing}</div>
            <div className="space-y-3">
              {result.missing.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="font-bold">{m.item}</span>
                  {(m.evidenceClass || m.confidence) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.evidenceClass && <span className="text-[10px] rounded px-1.5 py-0.5 font-semibold" style={{ background: "#EDE7D6", color: COLORS.ink }}>{m.evidenceClass}</span>}
                      {m.confidence && <span className="text-[10px] rounded px-1.5 py-0.5 font-semibold" style={{ background: "#F1EDE0", color: COLORS.ink }}>{lang === "ur" ? `اعتماد: ${m.confidence}` : `confidence: ${m.confidence}`}</span>}
                    </div>
                  )}
                  {m.severity === "high" && (
                    <span className="ms-2 text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: COLORS.red, color: "#FFF" }}>!</span>
                  )}
                  <p className="opacity-75 mt-0.5">{m.why}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.warnings?.length > 0 && (
          <div className="rounded-xl border p-4 mb-3" style={{ borderColor: COLORS.gold, background: "#FBF6E3" }}>
            <div className="font-bold text-sm mb-2" style={{ color: "#7A6210" }}>{t.resWarnings}</div>
            <ul className="text-sm space-y-1 opacity-85">
              {result.warnings.map((x, i) => <li key={i}>• {x}</li>)}
            </ul>
          </div>
        )}

        {result.askUser?.length > 0 && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#FFFFFF" }}>
            <div className="font-bold text-sm mb-2" style={{ color: COLORS.ink }}>{t.resAsk}</div>
            <ul className="text-sm space-y-1 opacity-85">
              {result.askUser.map((x, i) => <li key={i}>• {x}</li>)}
            </ul>
          </div>
        )}

        <button
          onClick={() => { setResult(null); setFiles([]); setRedactionConfirmed(false); setUploadStage("idle"); setUploadProgress(0); setEncodedCount(0); }}
          className="rounded-lg px-5 py-2 text-sm font-semibold"
          style={{ background: COLORS.green, color: "#F6F4EC" }}
        >
          {t.checkAgain}
        </button>
      </div>
    );
  }

  return (
    <div>
      {!dedicated && <><h2 className="text-xl font-bold mb-1" style={{ color: COLORS.green }}>
        {t.checkTitle}
      </h2>
      <p className="text-sm mb-2 opacity-70">{t.checkSub}</p></>}
      {dedicated && <p className="text-sm mb-2 opacity-70">{t.checkSub}</p>}
      <p className="text-xs mb-5" style={{ color: "#6B5A17" }}>🔒 {t.checkPrivacy}</p>
      <div className="rounded-xl border p-3 mb-4 text-xs leading-relaxed" style={{ borderColor: "#B5CDBD", background: "#F0F5F1", color: COLORS.green2 }}>
        <strong>{lang === "ur" ? "حد اور اگلا قدم:" : "Scope and next step:"}</strong> {t.reviewTrustBoundary}
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#FFFFFF" }}>
        <div className="font-bold text-sm mb-2">{t.qIncome}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {t.incomeOpts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
              <input type="checkbox" checked={!!income[o.id]} onChange={() => toggle(income, setIncome, o.id)} />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#FFFFFF" }}>
        <div className="font-bold text-sm mb-2">{t.qAssets}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {t.assetOpts.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
              <input type="checkbox" checked={!!assets[o.id]} onChange={() => toggle(assets, setAssets, o.id)} />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#FFFFFF" }}>
        <div className="font-bold text-sm mb-2">{t.qFirst}</div>
        <div className="flex gap-2">
          {[true, false].map((v) => (
            <button
              key={String(v)}
              onClick={() => setFirstTime(v)}
              className="rounded-lg border px-4 py-1.5 text-sm font-medium"
              style={
                firstTime === v
                  ? { background: COLORS.green, color: "#F6F4EC", borderColor: COLORS.green }
                  : { borderColor: "#CBBF9C", color: COLORS.ink }
              }
            >
              {v ? t.yes : t.no}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-dashed p-4 mb-4 text-center" style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }}>
        <div className="font-bold text-sm mb-1">{t.uploadLabel}</div>
        <p className="text-xs opacity-60 mb-3">{t.uploadHint}</p>
        <div className="rounded-lg border p-3 mb-3 text-start" style={{ borderColor: "#D9CFAF", background: "#FFFFFF" }}>
          <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: COLORS.ink }}>
            <input
              type="checkbox"
              className="mt-0.5"
              checked={redactionConfirmed}
              onChange={(event) => {
                const confirmed = event.target.checked;
                setRedactionConfirmed(confirmed);
                if (!confirmed) {
                  setFiles([]);
                  setUploadStage("idle");
                  setUploadProgress(0);
                  setEncodedCount(0);
                }
              }}
            />
            <span>{t.redactionConfirm}</span>
          </label>
          <p className="text-[11px] mt-2 opacity-70">{t.redactionHint}</p>
          <details className="mt-2 text-start rounded border px-2 py-1" style={{ borderColor: "#E5DAB9", background: "#FFFDF6" }}>
            <summary className="cursor-pointer text-[11px] font-semibold" style={{ color: COLORS.green }}>{t.redactionGuideTitle}</summary>
            <p className="text-[11px] mt-2 opacity-75">{t.redactionGuide}</p>
          </details>
        </div>
        <input
          type="file"
          accept="application/pdf,image/*"
          multiple
          onChange={onFiles}
          disabled={!redactionConfirmed}
          className="text-sm mx-auto"
          style={{ direction: "ltr" }}
        />
        {files.length > 0 && (
          <ul className="text-xs mt-3 opacity-70" style={{ direction: "ltr" }}>
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2"><span>📄 {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)</span><span className="font-semibold" style={{ color: COLORS.green2 }}>✓ {lang === "ur" ? "تیار" : "Ready"}</span></li>
            ))}
          </ul>
        )}
        {files.length > 0 && <div className="mt-3 text-start" aria-live="polite">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1"><span>{lang === "ur" ? (uploadStage === "ready" ? "تمام فائلیں جانچ کے لیے تیار ہیں" : uploadStage === "encoding" ? `فائلیں محفوظ انداز میں تیار کی جا رہی ہیں (${encodedCount}/${files.length})` : uploadStage === "analyzing" ? "اے آئی جانچ جاری ہے…" : uploadStage === "complete" ? "جانچ مکمل" : "فائل کی حالت") : (uploadStage === "ready" ? "All files ready for analysis" : uploadStage === "encoding" ? `Preparing files securely (${encodedCount}/${files.length})` : uploadStage === "analyzing" ? "AI analysis in progress…" : uploadStage === "complete" ? "Analysis complete" : "File status")}</span><span dir="ltr">{uploadProgress}%</span></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E8E1CC" }}><div role="progressbar" aria-label={lang === "ur" ? "فائل تجزیہ پیش رفت" : "File analysis progress"} aria-valuemin="0" aria-valuemax="100" aria-valuenow={uploadProgress} className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: uploadStage === "error" ? COLORS.red : COLORS.green }} /></div>
          <div className="flex flex-wrap gap-2 mt-2 text-[10px] opacity-75"><span style={{ color: uploadStage !== "idle" && uploadStage !== "error" ? COLORS.green2 : undefined }}>1. {lang === "ur" ? "فائل منتخب" : "Selected"}</span><span style={{ color: ["encoding", "analyzing", "complete"].includes(uploadStage) ? COLORS.green2 : undefined }}>2. {lang === "ur" ? "تیار" : "Prepared"}</span><span style={{ color: ["analyzing", "complete"].includes(uploadStage) ? COLORS.green2 : undefined }}>3. {lang === "ur" ? "جانچ" : "Analysis"}</span></div>
        </div>}
      </div>

      {err && <p className="text-sm mb-3" style={{ color: COLORS.red }}>{err}</p>}
      {busy && <p className="text-sm mb-3 italic opacity-70 animate-pulse">{t.analyzing}</p>}

      <button
        onClick={analyze}
        disabled={busy}
        className="rounded-lg px-6 py-2.5 text-sm font-bold"
        style={{ background: busy ? "#8AA79A" : COLORS.green, color: "#F6F4EC" }}
      >
        {t.analyzeBtn}
      </button>
    </div>
  );
}

// ── FBR Notice Explainer ─────────────────────────────────────
function NoticeExplainer({ lang, t }) {
  const [mode, setMode] = useState(null); // 'upload' | 'type'
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [followup, setFollowup] = useState("");
  const [followups, setFollowups] = useState([]);
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const speak = (txt) => {
    if (!window.speechSynthesis || !txt) return;
    window.speechSynthesis.cancel();
    const clean = txt.replace(/[*#_`>]/g, "");
    const u = new SpeechSynthesisUtterance(clean);
    const wantUr = langRef.current === "ur";
    u.lang = wantUr ? "ur-PK" : "en-US";
    const voices = window.speechSynthesis.getVoices() || [];
    const m = voices.find((v) => v.lang.toLowerCase().startsWith(wantUr ? "ur" : "en"))
      || (wantUr ? voices.find((v) => v.lang.toLowerCase().startsWith("hi")) : null);
    if (m) u.voice = m;
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  };

  const readB64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(f);
  });

  const onFile = (e) => {
    setErr("");
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { setErr(`"${f.name}" ${t.tooBig || "is too large (max 4 MB)."}`); return; }
    if (!(f.type === "application/pdf" || f.type.startsWith("image/"))) { setErr(t.badType || "Please upload a PDF or image."); return; }
    setFile(f);
  };

  const explain = async () => {
    setErr("");
    if (!file && !text.trim()) { setErr(t.noticeNeedInput); return; }
    setBusy(true); setResult(null); setFollowups([]);
    try {
      const content = [];
      if (file) {
        const data = await readB64(file);
        content.push(file.type === "application/pdf"
          ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
          : { type: "image", source: { type: "base64", media_type: file.type, data } });
      }
      content.push({
        type: "text",
        text: `A worried person in Pakistan — possibly a first-time filer, possibly not comfortable in English — has received a letter or notice from FBR (the tax authority) and is scared. ${text.trim() ? `They typed out what it says: "${text.trim()}"` : "They uploaded a photo/scan of it."}

Read the notice and explain it to them like a kind, calm relative who happens to know tax law. Identify the FBR notice type and section if you can (e.g. 114(4) return not filed, 122(9) amendment of assessment, 137/138 demand, 176 information call, 182 penalty, audit under 177/214C). Be reassuring where honest, but never downplay a genuine demand for money or an audit.

CRITICAL SAFETY: if this involves a demand for money, an audit, a court/appeal matter, forged documents, or possible prosecution, you MUST tell them clearly this needs a real tax lawyer or the FBR helpline — do not imply the app can resolve it.

Respond ONLY with JSON, no markdown fences, in ${lang === "ur" ? "simple everyday Urdu (not formal/literary)" : "simple plain English"}:
{"whatItIs":"1-2 short sentences: what this notice actually is, in the simplest words","whatToDo":["short concrete step 1","step 2","..."],"deadline":"the deadline or timeframe if any is stated or implied, else 'No specific deadline stated — but don't delay'","severity":"low or medium or high","getHelp":"1-2 sentences: whether they can handle this themselves or should get a professional, and if serious, say so plainly"}`,
      });

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, messages: [{ role: "user", content }] }),
      });
      const data = await res.json();
      const raw = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(raw);
      setResult(parsed);
      // auto-read the core explanation for low-literacy users
      speak(`${parsed.whatItIs}. ${parsed.getHelp || ""}`);
    } catch (e) {
      setErr(t.noticeErr);
    } finally {
      setBusy(false);
    }
  };

  const askFollowup = async () => {
    const q = followup.trim();
    if (!q || busy) return;
    setFollowup(""); setBusy(true);
    const thread = [...followups, { role: "user", content: q }];
    setFollowups(thread);
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 800,
          system: SYSTEM_PROMPT + `\n\nContext: the user received an FBR notice you already explained as: ${JSON.stringify(result)}. Answer their follow-up simply, in ${lang === "ur" ? "simple Urdu" : "simple English"}. If it's serious, tell them to see a tax lawyer.`,
          messages: thread.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      setFollowups([...thread, { role: "assistant", content: reply || t.chatError }]);
      speak(reply);
    } catch (e) {
      setFollowups([...thread, { role: "assistant", content: t.chatError }]);
    } finally { setBusy(false); }
  };

  const sevColor = result?.severity === "high" ? COLORS.red : result?.severity === "medium" ? "#B8860B" : COLORS.green2;
  const sevLabel = result?.severity === "high" ? t.noticeSevHigh : result?.severity === "medium" ? t.noticeSevMed : t.noticeSevLow;

  if (result) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.green }}>{t.noticeResultTitle}</h2>

        <div className="rounded-xl p-5 mb-4" style={{ background: COLORS.green, color: "#F6F4EC" }}>
          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">{t.noticeWhatItIs}</div>
          <div className="text-lg leading-relaxed">{result.whatItIs}</div>
          <button onClick={() => speak(`${result.whatItIs}. ${result.getHelp}`)} className="mt-3 text-sm rounded-lg px-3 py-1.5 font-semibold" style={{ background: COLORS.gold, color: "#2B2205" }}>
            {t.noticeListenBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border p-4" style={{ borderColor: sevColor, background: "#fff" }}>
            <div className="text-xs font-bold mb-1" style={{ color: sevColor }}>{t.noticeSeverity}</div>
            <div className="font-bold" style={{ color: sevColor }}>● {sevLabel}</div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }}>
            <div className="text-xs font-bold mb-1" style={{ color: "#7A6210" }}>{t.noticeDeadline}</div>
            <div className="font-semibold text-sm">{result.deadline}</div>
          </div>
        </div>

        <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#B5CDBD", background: "#F0F5F1" }}>
          <div className="font-bold text-sm mb-2" style={{ color: COLORS.green2 }}>{t.noticeWhatToDo}</div>
          <ol className="text-sm space-y-2">
            {(result.whatToDo || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0" style={{ width: 22, height: 22, background: COLORS.green, color: "#fff" }}>{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {result.getHelp && (
          <div className="rounded-xl border p-4 mb-4" style={{ borderColor: result.severity === "high" ? COLORS.red : "#CBBF9C", background: result.severity === "high" ? "#FBF1EE" : "#FFFDF6" }}>
            <div className="font-bold text-sm mb-1" style={{ color: result.severity === "high" ? COLORS.red : "#7A6210" }}>{t.noticeGetHelp}</div>
            <div className="text-sm">{result.getHelp}</div>
          </div>
        )}

        {/* follow-up */}
        <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
          <div className="font-bold text-sm mb-2">{t.noticeAskFollowup}</div>
          {followups.map((m, i) => (
            <div key={i} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap" style={m.role === "user" ? { background: COLORS.green, color: "#F6F4EC" } : { background: "#F1EDE0", color: COLORS.ink }}>{m.content}</div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={followup} onChange={(e) => setFollowup(e.target.value)} onKeyDown={(e) => e.key === "Enter" && askFollowup()} placeholder={t.chatPlaceholder} className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }} />
            <button onClick={askFollowup} disabled={busy} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: busy ? "#8AA79A" : COLORS.green, color: "#fff" }}>{t.send}</button>
          </div>
        </div>

        <p className="text-xs mb-4" style={{ color: "#6B5A17" }}>⚠ {t.noticeDisclaimer}</p>
        <button onClick={() => { setResult(null); setFile(null); setText(""); setMode(null); }} className="rounded-lg px-5 py-2 text-sm font-semibold" style={{ background: COLORS.green, color: "#fff" }}>{t.noticeStartOver}</button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.green }}>{t.noticeHeroTitle}</h2>
      <p className="text-sm mb-3 opacity-80 leading-relaxed">{t.noticeHeroSub}</p>
      <div className="rounded-xl p-4 mb-5" style={{ background: "#F0F5F1", borderInlineStart: `4px solid ${COLORS.green2}` }}>
        <p className="text-sm" style={{ color: COLORS.green2 }}>🤝 {t.noticeHeroCalm}</p>
      </div>

      {mode !== "type" && (
        <div className="rounded-xl border-2 border-dashed p-6 mb-3 text-center" style={{ borderColor: COLORS.gold, background: "#FFFDF6" }}>
          <label className="cursor-pointer block">
            <div className="text-lg font-bold mb-2" style={{ color: COLORS.green }}>{t.noticeUploadBtn}</div>
            <input type="file" accept="application/pdf,image/*" onChange={onFile} className="text-sm mx-auto" style={{ direction: "ltr" }} />
          </label>
          <p className="text-xs mt-3 text-start leading-relaxed" style={{ color: COLORS.green2 }}>{t.noticeUploadPrivacy}</p>
          {file && <div className="text-xs mt-3 opacity-70" style={{ direction: "ltr" }}>📄 {file.name}</div>}
        </div>
      )}

      {!mode && <div className="text-center text-sm opacity-60 my-2">— {lang === "ur" ? "یا" : "or"} —</div>}

      {mode !== "upload" && (
        <div className="mb-4">
          <button onClick={() => setMode(mode === "type" ? null : "type")} className="text-sm font-semibold mb-2" style={{ color: COLORS.green }}>
            {t.noticeTypeBtn}
          </button>
          {mode === "type" && (
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t.noticeTypePlaceholder} rows={5} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }} />
          )}
        </div>
      )}

      {err && <p className="text-sm mb-3" style={{ color: COLORS.red }}>{err}</p>}
      {busy && <p className="text-sm mb-3 italic opacity-70 animate-pulse">{t.noticeReading}</p>}

      {(file || text.trim()) && (
        <button onClick={explain} disabled={busy} className="rounded-xl px-6 py-3 text-base font-bold w-full sm:w-auto" style={{ background: busy ? "#8AA79A" : COLORS.green, color: "#F6F4EC" }}>
          {t.noticeExplainBtn}
        </button>
      )}

      <p className="text-xs mt-5" style={{ color: "#6B5A17" }}>🔒 {t.noticeDisclaimer}</p>
    </div>
  );
}

// ── Personalized document checklist ──────────────────────────
// Document items keyed by id, with bilingual labels. Each screening
// answer maps to a set of ids; the union (deduped) is the user's list.
const DOC_ITEMS = {
  cnic: { en: "Your CNIC (front and back)", ur: "آپ کا شناختی کارڈ (آگے اور پیچھے)" },
  iris: { en: "IRIS login (or register first with CNIC + your own SIM + email)", ur: "IRIS لاگ اِن (یا پہلے شناختی کارڈ + اپنی سم + ای میل سے رجسٹر کریں)" },
  wealth: { en: "List of your assets & what you owe, as of 30 June 2026", ur: "۳۰ جون ۲۰۲۶ تک اپنے اثاثوں اور واجبات کی فہرست" },
  iban: { en: "Your bank IBAN (for any refund)", ur: "آپ کا بینک IBAN (ریفنڈ کے لیے)" },
  salaryCert: { en: "Salary & tax deduction certificate from your employer (Jul 2025–Jun 2026)", ur: "آجر سے تنخواہ و ٹیکس کٹوتی سرٹیفکیٹ (جولائی ۲۰۲۵–جون ۲۰۲۶)" },
  employerNtn: { en: "Your employer's NTN or registration number", ur: "آپ کے آجر کا NTN یا رجسٹریشن نمبر" },
  bankCert: { en: "Bank profit / withholding certificate from every bank account", ur: "ہر بینک اکاؤنٹ سے منافع / ودہولڈنگ سرٹیفکیٹ" },
  mobileCert: { en: "Mobile & internet tax certificate (Jazz/Zong/Telenor/Ufone)", ur: "موبائل و انٹرنیٹ ٹیکس سرٹیفکیٹ (جاز/زونگ/ٹیلی نار/یوفون)" },
  businessAccounts: { en: "Your sales/receipts summary and expense records for the year", ur: "سال بھر کی فروخت/وصولیوں کا خلاصہ اور اخراجات کا ریکارڈ" },
  businessBank: { en: "Bank statements for all business accounts", ur: "تمام کاروباری اکاؤنٹس کی بینک اسٹیٹمنٹس" },
  prc: { en: "PRC (proceeds realization certificate) for money received from abroad", ur: "بیرونِ ملک سے موصول رقم کی PRC (رسید)" },
  platformStatements: { en: "Your Payoneer/Wise/platform earnings statements", ur: "آپ کی پے اونیئر/وائز/پلیٹ فارم آمدنی کی اسٹیٹمنٹس" },
  rentAgreement: { en: "Rent received per property (rent agreements help)", ur: "فی جائیداد وصول شدہ کرایہ (کرایہ نامے مددگار ہیں)" },
  propertyExpenses: { en: "Property tax / insurance / repair receipts per property", ur: "فی جائیداد پراپرٹی ٹیکس / انشورنس / مرمت کی رسیدیں" },
  propertyPapers: { en: "Ownership papers, purchase deed & cost of each property", ur: "ہر جائیداد کے ملکیتی کاغذات، خرید نامہ اور لاگت" },
  vehiclePapers: { en: "Vehicle registration number AND chassis number", ur: "گاڑی کا رجسٹریشن نمبر اور چیسس نمبر" },
  savingsCert: { en: "National Savings / Behbood / prize bond statements", ur: "قومی بچت / بہبود / پرائز بانڈ کی اسٹیٹمنٹس" },
  goldInvest: { en: "Value of gold & investments held (at cost)", ur: "موجود سونے اور سرمایہ کاری کی قیمت (لاگت پر)" },
  pensionBook: { en: "Pension book / annual pension statement", ur: "پنشن بک / سالانہ پنشن اسٹیٹمنٹ" },
  agriDetail: { en: "Land details (khasra/parcel) and agricultural income per parcel", ur: "زمین کی تفصیل (خسرہ/قطعہ) اور فی قطعہ زرعی آمدنی" },
  agriTax: { en: "Provincial agricultural tax receipts", ur: "صوبائی زرعی ٹیکس کی رسیدیں" },
  foreignStatement: { en: "Foreign income & assets details (separate statement if $10k income / $100k assets)", ur: "غیر ملکی آمدنی و اثاثوں کی تفصیل (الگ اسٹیٹمنٹ اگر ۱۰ ہزار ڈالر آمدنی / ۱ لاکھ ڈالر اثاثے)" },
  utilityBill: { en: "Utility bills if tax was withheld (electricity)", ur: "بجلی کے بل اگر ٹیکس کٹا ہو" },
  prevReturn: { en: "Last year's return (helps carry figures forward)", ur: "گزشتہ سال کا ریٹرن (اعداد آگے لے جانے میں مددگار)" },
};

// income-answer -> doc ids
const INCOME_DOCS = {
  salary: ["salaryCert", "employerNtn"],
  business: ["businessAccounts", "businessBank"],
  freelance: ["prc", "platformStatements", "businessAccounts"],
  rent: ["rentAgreement", "propertyExpenses"],
  foreign: ["prc", "foreignStatement"],
  pension: ["pensionBook"],
  agri: ["agriDetail", "agriTax"],
};
const ASSET_DOCS = {
  property: ["propertyPapers"],
  vehicle: ["vehiclePapers"],
  bank: ["bankCert", "iban"],
  savings: ["savingsCert"],
  gold: ["goldInvest"],
  foreignAsset: ["foreignStatement"],
};
const ALWAYS_DOCS = ["cnic", "iris", "wealth", "mobileCert"];

function DocChecklist({ lang, t }) {
  const [step, setStep] = useState(0); // 0=income,1=assets,2=first,3=result
  const [income, setIncome] = useState({});
  const [assets, setAssets] = useState({});
  const [first, setFirst] = useState(null);
  const [checked, setChecked] = useState({});
  const listRef = useRef(null);

  const toggle = (state, set, id) => set({ ...state, [id]: !state[id] });

  const buildList = () => {
    const ids = new Set(ALWAYS_DOCS);
    Object.keys(income).filter((k) => income[k]).forEach((k) => (INCOME_DOCS[k] || []).forEach((d) => ids.add(d)));
    Object.keys(assets).filter((k) => assets[k]).forEach((k) => (ASSET_DOCS[k] || []).forEach((d) => ids.add(d)));
    if (first === false) ids.add("prevReturn");
    // always list is separate; return the rest
    const always = ALWAYS_DOCS.filter((d) => ids.has(d));
    const situational = [...ids].filter((d) => !ALWAYS_DOCS.includes(d));
    return { always, situational };
  };

  const label = (id) => DOC_ITEMS[id]?.[lang] || DOC_ITEMS[id]?.en || id;

  if (step === 3) {
    const { always, situational } = buildList();
    const all = [...always, ...situational];
    const gotCount = all.filter((id) => checked[id]).length;
    const pct = all.length ? Math.round((gotCount / all.length) * 100) : 0;

    const shareText = `${t.clShareText}\n\n` +
      [...always, ...situational].map((id) => `${checked[id] ? "✅" : "⬜"} ${label(id)}`).join("\n") +
      `\n\n— Tax Return Saathi`;
    const waUrl = "https://wa.me/?text=" + encodeURIComponent(shareText);

    const Row = ({ id }) => (
      <label className="flex items-start gap-3 py-2 cursor-pointer border-b" style={{ borderColor: "#EDE7D6" }}>
        <input type="checkbox" checked={!!checked[id]} onChange={() => toggle(checked, setChecked, id)} className="mt-1 w-5 h-5 flex-shrink-0" />
        <span className="text-sm" style={checked[id] ? { textDecoration: "line-through", opacity: 0.5 } : {}}>{label(id)}</span>
      </label>
    );

    return (
      <div>
        <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.green }}>{t.clResultTitle}</h2>
        <p className="text-sm mb-4 opacity-75">{t.clResultSub}</p>

        {/* progress */}
        <div className="rounded-xl p-4 mb-4" style={{ background: COLORS.green, color: "#F6F4EC" }}>
          <div className="flex justify-between text-sm mb-2">
            <span>{gotCount} / {all.length} {t.clProgress}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "#2E6B54" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS.gold }} />
          </div>
          {pct === 100 && <div className="text-sm mt-2 font-semibold" style={{ color: COLORS.gold }}>{t.clDone}</div>}
        </div>

        <div ref={listRef} className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
          <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "#7A6210" }}>{t.clAlways}</div>
          {always.map((id) => <Row key={id} id={id} />)}
          {situational.length > 0 && (
            <div className="mt-4">
              {situational.map((id) => <Row key={id} id={id} />)}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <button onClick={() => window.print()} className="rounded-lg px-4 py-2 text-sm font-semibold border" style={{ borderColor: COLORS.green, color: COLORS.green, background: "#fff" }}>{t.clPrint}</button>
          <a href={waUrl} target="_blank" rel="noreferrer" className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "#25D366", color: "#fff" }}>{t.clShare}</a>
          <button onClick={() => { setStep(0); setIncome({}); setAssets({}); setFirst(null); setChecked({}); }} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: COLORS.green, color: "#fff" }}>{t.clRestart}</button>
        </div>
      </div>
    );
  }

  const OptionGrid = ({ opts, state, set }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
      {opts.map((o) => {
        const on = !!state[o.id];
        return (
          <button key={o.id} onClick={() => toggle(state, set, o.id)} className="text-start rounded-xl border p-3 flex items-center gap-2" style={on ? { background: COLORS.green, color: "#F6F4EC", borderColor: COLORS.green } : { borderColor: "#CBBF9C", background: "#FFFDF6" }}>
            <span className="inline-flex items-center justify-center rounded w-5 h-5 flex-shrink-0 text-xs" style={{ background: on ? COLORS.gold : "#EDE7D6", color: "#2B2205" }}>{on ? "✓" : ""}</span>
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.green }}>{t.checklistTitle}</h2>
      <p className="text-sm mb-5 opacity-80 leading-relaxed">{t.checklistSub}</p>

      {/* step dots */}
      <div className="flex gap-1.5 mb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 rounded-full flex-1" style={{ background: i <= step ? COLORS.green : "#DDD6C4" }} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <div className="font-bold mb-3">{t.clQ1}</div>
          <OptionGrid opts={t.clQ1opts} state={income} set={setIncome} />
          <button onClick={() => setStep(1)} className="rounded-lg px-6 py-2.5 text-sm font-bold" style={{ background: COLORS.green, color: "#fff" }}>{t.clNext}</button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="font-bold mb-3">{t.clQ2}</div>
          <OptionGrid opts={t.clQ2opts} state={assets} set={setAssets} />
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="rounded-lg px-5 py-2.5 text-sm font-semibold border" style={{ borderColor: "#CBBF9C", color: COLORS.ink }}>{t.clBack}</button>
            <button onClick={() => setStep(2)} className="rounded-lg px-6 py-2.5 text-sm font-bold" style={{ background: COLORS.green, color: "#fff" }}>{t.clNext}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="font-bold mb-3">{t.clQ3}</div>
          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => setFirst(v)} className="rounded-xl border p-3 text-sm font-medium flex-1" style={first === v ? { background: COLORS.green, color: "#F6F4EC", borderColor: COLORS.green } : { borderColor: "#CBBF9C", background: "#FFFDF6" }}>
                {v ? t.clYes : t.clNo}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="rounded-lg px-5 py-2.5 text-sm font-semibold border" style={{ borderColor: "#CBBF9C", color: COLORS.ink }}>{t.clBack}</button>
            <button onClick={() => setStep(3)} disabled={first === null} className="rounded-lg px-6 py-2.5 text-sm font-bold" style={{ background: first === null ? "#8AA79A" : COLORS.green, color: "#fff" }}>{t.clSeeList}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shopkeeper Fixed Tax Scheme ──────────────────────────────
function Shopkeeper({ lang, t }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [turnover, setTurnover] = useState("");

  const questions = [
    { id: "turnover", q: t.shopQ_turnover },
    { id: "oneShop", q: t.shopQ_oneShop },
    { id: "retail", q: t.shopQ_retail },
    { id: "notExcluded", q: t.shopQ_notExcluded },
  ];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const eligible = questions.every((q) => answers[q.id] === true);

  const fmt = (n) => new Intl.NumberFormat(lang === "ur" ? "ur-PK" : "en-PK").format(Math.round(n));
  const to = parseFloat(String(turnover).replace(/[^0-9.]/g, "")) || 0;
  const oneP = to * 0.01;
  const payable = Math.max(oneP, 25000);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.green }}>{t.shopTitle}</h2>
      <p className="text-sm mb-4 opacity-85 leading-relaxed">{t.shopIntro}</p>

      {/* What is it */}
      <div className="rounded-xl border p-4 mb-5" style={{ borderColor: "#B5CDBD", background: "#F0F5F1" }}>
        <div className="font-bold mb-2" style={{ color: COLORS.green2 }}>{t.shopWhatTitle}</div>
        <ul className="text-sm space-y-2">
          {t.shopWhat.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ color: COLORS.gold }}>◆</span><span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Eligibility */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
        <div className="font-bold mb-3" style={{ color: COLORS.green }}>{t.shopEligTitle}</div>
        {questions.map((q) => (
          <div key={q.id} className="mb-3">
            <div className="text-sm mb-2">{q.q}</div>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button key={String(v)} onClick={() => { setAnswers({ ...answers, [q.id]: v }); setChecked(false); }}
                  className="rounded-lg px-5 py-1.5 text-sm font-semibold border"
                  style={answers[q.id] === v ? { background: v ? COLORS.green : COLORS.red, color: "#fff", borderColor: v ? COLORS.green : COLORS.red } : { borderColor: "#CBBF9C", background: "#FFFDF6", color: COLORS.ink }}>
                  {v ? t.shopYes : t.shopNo}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => setChecked(true)} disabled={!allAnswered}
          className="mt-1 rounded-lg px-5 py-2 text-sm font-bold"
          style={{ background: allAnswered ? COLORS.green : "#8AA79A", color: "#fff" }}>
          {t.shopCheckBtn}
        </button>

        {checked && (
          <div className="mt-4 rounded-xl p-4" style={eligible ? { background: "#EAF3EC", border: `1px solid ${COLORS.green2}` } : { background: "#FBF1EE", border: `1px solid ${COLORS.red}` }}>
            <div className="font-bold mb-1" style={{ color: eligible ? COLORS.green2 : COLORS.red }}>
              {eligible ? t.shopEligibleTitle : t.shopNotEligibleTitle}
            </div>
            <div className="text-sm">{eligible ? t.shopEligibleBody : t.shopNotEligibleBody}</div>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "#6B5A17" }}>ℹ {t.shopEligNote}</p>
      </div>

      {/* 1% calculator */}
      <div className="rounded-xl border p-4 mb-4" style={{ borderColor: "#CBBF9C", background: "#FFFDF6" }}>
        <div className="font-bold mb-2" style={{ color: COLORS.green }}>{t.shopCalcTitle}</div>
        <label className="text-sm block mb-1">{t.shopCalcLabel}</label>
        <input value={turnover} onChange={(e) => setTurnover(e.target.value)} inputMode="numeric" placeholder={t.shopCalcPlaceholder}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ borderColor: "#CBBF9C", background: "#fff", direction: "ltr" }} />
        {to > 0 && (
          <div className="rounded-lg p-3" style={{ background: COLORS.green, color: "#F6F4EC" }}>
            <div className="text-sm">{t.shopCalcResult} <span className="font-bold text-lg" style={{ color: COLORS.gold }}>Rs {fmt(oneP)}</span></div>
            {oneP < 25000 && <div className="text-xs mt-1 opacity-90">{t.shopCalcMin}</div>}
            <div className="text-xs mt-2 pt-2" style={{ borderTop: "1px solid #2E6B54" }}>
              {lang === "ur" ? "قابلِ ادائیگی: " : "You'd pay: "}<span className="font-bold" style={{ color: COLORS.gold }}>Rs {fmt(payable)}</span>
            </div>
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "#6B5A17" }}>⚠ {t.shopCalcNote}</p>
      </div>
    </div>
  );
}

// ── Privacy & Disclaimer page ────────────────────────────────
function Privacy({ lang, t, onBack }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button onClick={onBack} className="text-sm font-semibold mb-4" style={{ color: COLORS.green }}>{t.privacyBack}</button>
      <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.green }}>{t.privacyTitle}</h1>
      <p className="text-xs opacity-60 mb-5">{t.privacyUpdated}</p>
      <div className="space-y-4">
        {t.privacySections.map((s, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ borderColor: "#DDD6C4", background: "#fff" }}>
            <div className="font-bold mb-1.5" style={{ color: COLORS.green2 }}>{s.h}</div>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>{s.b}</p>
          </div>
        ))}
      </div>
      <p className="text-xs mt-5 mb-2 opacity-70">{t.privacyContact}</p>
      <button onClick={onBack} className="rounded-lg px-5 py-2 text-sm font-semibold mt-2" style={{ background: COLORS.green, color: "#fff" }}>{t.privacyBack}</button>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────
export default function TaxReturnSaathi({ initialTab = "check", dedicatedAnalysis = false }) {
  const [lang, setLang] = useState("ur");
  const [tab, setTab] = useState(initialTab);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const t = T[lang];

  const urduFont =
    lang === "ur"
      ? { fontFamily: "'Noto Nastaliq Urdu','Jameel Noori Nastaleeq','Urdu Typesetting',serif", lineHeight: 2 }
      : { fontFamily: "Georgia, 'Times New Roman', serif" };

  return (
    <div
      dir={t.dir}
      className="min-h-screen"
      style={{ background: COLORS.paper, color: COLORS.ink, ...urduFont }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        @media print {
          header, nav, footer, button, a[href^="https://wa.me"], input[type="checkbox"] + span::after { display: none !important; }
          .no-print, button { display: none !important; }
          body { background: #fff !important; }
        }`}</style>

      {/* Header */}
      <header style={{ background: COLORS.green }} className="px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "#F6F4EC", letterSpacing: lang === "en" ? "0.02em" : 0 }}
            >
              {t.appTitle}
            </h1>
            <p className="text-xs mt-1" style={{ color: "#BFD5C9" }}>
              {t.appSub}
            </p>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            className="rounded-lg px-4 py-2 text-sm font-bold"
            style={{ background: COLORS.gold, color: "#2B2205" }}
          >
            {t.langBtn}
          </button>
        </div>
      </header>

      {/* Disclaimer strip */}
      <div style={{ background: "#EFE7CE" }} className="px-4 py-2">
        <p className="max-w-3xl mx-auto text-xs" style={{ color: "#6B5A17" }}>
          ⚠ {t.disclaimer}
        </p>
        <p id="pilot-testing-notice" className="max-w-3xl mx-auto text-xs mt-1" style={{ color: "#4d513c" }}>
          {lang === "ur" ? "آزمائشی ورژن: یہ آزاد تعلیمی اور تیاری کی خدمت فی الحال پائلٹ ٹیسٹنگ میں ہے؛ یہ ایف بی آر کی سروس نہیں، ریٹرن جمع نہیں کرتی، اور کسی ذاتی نتیجے کی تصدیق نہیں کرتی۔" : "Pilot testing: this independent education and preparation service is being tested; it is not an FBR service, does not submit returns, and does not confirm personal outcomes."}
        </p>
        <div className="max-w-3xl mx-auto mt-2 flex flex-wrap items-center gap-2">
          <button
            id="pilot-feedback-button"
            type="button"
            onClick={() => { window.dispatchEvent(new Event("tax-return-saathi:close-supplemental-panels")); window.dispatchEvent(new Event("tax-return-saathi:open-pilot-feedback")); }}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm"
            style={{ background: "#0B3D2E", color: "#fffdf2", borderColor: "#0B3D2E" }}
          >
            <span lang="ur" dir="rtl">آزمائشی رائے دیں</span>
            <span aria-hidden="true">·</span>
            <span>Pilot Feedback</span>
          </button>
          <p id="pilot-feedback-category-hint" className="text-xs" style={{ color: "#4d513c" }}>
            {lang === "ur" ? "رائے کی قسم: ایپ کا مسئلہ، وضاحت، رسائی، یا سورس/لنک۔ ذاتی ٹیکس تفصیل یا شناخت شامل نہ کریں۔" : "Feedback category: app issue, clarity, accessibility, or a source/link concern. Do not add personal tax details or identity."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      {!showPrivacy && (
      <nav className="max-w-3xl mx-auto px-4 mt-5 flex gap-2 flex-wrap">
        {dedicatedAnalysis && <a href="/" className="rounded-full px-4 py-2 text-sm font-semibold border" style={{ background: "transparent", color: COLORS.green, borderColor: "#B9C9BF", textDecoration: "none" }}>← {lang === "ur" ? "مرکزی صفحہ" : "Home"}</a>}
        {Object.entries(t.tabs).map(([k, label]) => {
          const isHero = k === "check";
          const active = tab === k;
          return (
            <button
              key={k}
              onClick={() => {
                if (k === "check" && !dedicatedAnalysis) {
                  window.history.pushState({}, "", "/analyze-tax-return");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                  return;
                }
                setTab(k);
              }}
              className="rounded-full px-4 py-2 text-sm font-semibold border"
              style={
                active
                  ? (isHero
                      ? { background: COLORS.gold, color: "#2B2205", borderColor: COLORS.gold }
                      : { background: COLORS.green, color: "#F6F4EC", borderColor: COLORS.green })
                  : (isHero
                      ? { background: "#FBF6E3", color: "#7A6210", borderColor: COLORS.gold }
                      : { background: "transparent", color: COLORS.green, borderColor: "#B9C9BF" })
              }
            >
              {isHero ? "★ " : ""}{label}
            </button>
          );
        })}
      </nav>
      )}

      {/* Body */}
      {showPrivacy ? (
        <Privacy t={t} lang={lang} onBack={() => setShowPrivacy(false)} />
      ) : (
      <main className="max-w-3xl mx-auto px-4 py-6">
        {dedicatedAnalysis && <section className="rounded-2xl border p-5 mb-5" style={{ borderColor: COLORS.gold, background: "#FBF6E3" }}>
          <p className="text-xs font-bold mb-1" style={{ color: "#7A6210" }}>{lang === "ur" ? "خصوصی فیچر · آزمائشی تیاری" : "Special feature · Pilot preparation"}</p>
          <h2 className="text-2xl font-bold mb-1" style={{ color: COLORS.green }}>{lang === "ur" ? "اپنا ٹیکس ریٹرن جانچیں" : "Analyze Your Tax Return"}</h2>
          <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>{lang === "ur" ? "اپنا چھپایا ہوا مکمل ریٹرن اپ لوڈ کر کے IRIS پر جمع کرانے سے پہلے نظر آنے والی کمی اور ممکنہ تضاد کی جانچ کریں۔" : "Upload your redacted complete return to review visible gaps and possible inconsistencies before submitting in IRIS."}</p>
          <p className="text-xs mt-2" style={{ color: "#6B5A17" }}>{lang === "ur" ? "یہ آزاد تعلیمی جانچ ہے، ایف بی آر کی جانچ، حتمی ٹیکس فیصلہ یا فائلنگ نہیں۔" : "This is independent educational screening, not an FBR check, final tax decision, or filing service."}</p>
        </section>}
        {tab === "notice" && <NoticeExplainer t={t} lang={lang} />}
        {tab === "checklist" && <DocChecklist t={t} lang={lang} />}
        {tab === "shop" && <Shopkeeper t={t} lang={lang} />}
        {tab === "guide" && <Guide t={t} lang={lang} />}
        {tab === "scenarios" && <Scenarios t={t} />}
        {tab === "mistakes" && <Mistakes t={t} />}
        {tab === "check" && <GapCheck t={t} lang={lang} dedicated={dedicatedAnalysis} />}
        {tab === "calc" && <Calculator t={t} lang={lang} />}
        {tab === "chat" && <Chat t={t} lang={lang} />}
      </main>
      )}

      <footer className="max-w-3xl mx-auto px-4 pb-8 text-center text-xs opacity-50">
        <p>iris.fbr.gov.pk · FBR Helpline 051-111-772-772</p>
        <p className="mt-1">
          <a href="/privacy" className="underline" style={{ color: "inherit" }}>
            {t.privacyLink}
          </a>
          {" · "}
          <a href="https://www.fbr.gov.pk/act-rules-ordinances/131226" target="_blank" rel="noreferrer" className="underline">
            {lang === "ur" ? "سرکاری قوانین و قواعد (ایف بی آر)" : "Official Acts, Ordinances & Rules (FBR)"}
          </a>
          {" · "}
          <a href="https://fbr.gov.pk/laws" target="_blank" rel="noreferrer" className="underline">
            {lang === "ur" ? "ٹیکس قوانین" : "Taxation Laws"}
          </a>
        </p>
      </footer>
    </div>
  );
}
