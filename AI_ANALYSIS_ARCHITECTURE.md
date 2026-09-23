# Tax Return Saathi AI analysis architecture

## Scope of this release

This release replaces the previous single-call pattern for the main chatbot and redacted return review with two server-owned pipelines. The browser keeps the existing interface and sends no credentials or persistent case identifier. Return-review documents are processed in memory for the request; the application database does not receive the file bytes, extracted facts, calculations, or model response.

The main return-review path is now:

> **Document → structured extraction → deterministic calculation → bounded AI explanation**

The chatbot is now a separate server endpoint with a bounded prompt and session-only message history supplied by the browser. The large authored tax content and the verified rule data in `client/src/App.jsx` were not broadly regenerated or rewritten.

## Return-review pipeline

The `/api/return-review` endpoint performs two model calls. The first is a multimodal extraction call using a strict JSON schema. Uploaded PDFs, images, and text are treated as untrusted data rather than instructions; prompt-like text inside a document must not alter the extraction task. The extraction schema includes tax-year context, wealth sources and applications, bank closing-balance checks, funds-trace inputs, and property values. Property acquisition cost, deed value, FBR/DC valuation, market value, sale proceeds, and construction cost remain separate fields.

The second model call receives only the structured case facts, extraction observations, missing-evidence list, and deterministic calculation pack. It does not receive the original document blocks. Its strict response schema includes an overall status, findings, missing items, warnings, clarifying questions, evidence classification, and confidence. The response is explanatory and preparation-oriented; it does not make an FBR outcome determination.

## Deterministic calculation layer

`server/taxReconciliation.ts` contains pure functions for arithmetic that should not be delegated to a language model. The wealth calculation adds opening wealth and legitimate sources, subtracts applications, and reports expected closing wealth, declared closing wealth, and the exact unexplained difference. The bank comparison reports the difference between a statement closing balance and the declared Wealth Statement balance. The funds tracer carries opening funds into current-year receipts and applications, allowing a prior-year sale balance to be traced into a later purchase, construction cost, or vehicle booking.

The current calculator deliberately does not decide tax treatment. Internal transfers, gifts, loans, cash, and property payments remain classification questions for evidence and qualified review. The model receives the arithmetic and the uncertainty rather than being asked to invent or silently perform it.

## Chatbot pipeline

The `/api/tax-chat` endpoint owns the chatbot quality protocol on the server. It preserves the current browser session history but does not persist it. The response is instructed to distinguish rule or procedure, calculation, interpretation, assumption, and verification needs. It is also instructed to reuse facts already supplied during the current session, show formulas for stated figures, distinguish property valuation concepts, avoid fabricated current-law claims, and escalate audits, notices, court matters, large refunds, foreign assets, and possible prosecution to qualified help.

The legacy `/api/claude` compatibility route remains for the notice explainer and other existing flows. It is not used by the main chatbot or the new return-review path.

## Privacy and security boundaries

The pipeline never logs document bytes or model content. Error logs contain only a generic failure message and an error class/message, not document contents. Server-side managed AI credentials remain inside `invokeLLM`; they are not sent to the browser. Uploaded documents are capped by the existing browser and Express limits and are not written to the database. The extraction prompt explicitly treats document text as data, which reduces the risk of prompt injection from a malicious or malformed uploaded file.

The current product boundary remains educational preparation support. It is not FBR, does not submit a return, does not read a user's live IRIS account, does not predict an FBR action, and does not replace a qualified tax professional.

## Validation completed

Synthetic unit coverage covers exact wealth differences, bank-balance mismatches, multi-year funds tracing, strict extraction and review schemas, prompt-injection boundaries, and the server-owned chatbot prompt. The full project suite passed **25 test files and 123 tests**. TypeScript checking passed. The production Vite and server build passed. A live preview probe using only synthetic figures returned HTTP 200 with both a review object and a deterministic calculation pack; the synthetic response content was not retained.

The managed preview was also checked at desktop and narrow mobile widths. The chatbot controls fit without horizontal overflow, and the browser console showed no new runtime errors.

## Remaining limitations and next phases

This is the first architecture slice, not a complete tax-law knowledge platform. It does not yet provide live FBR retrieval, a versioned source database, OCR-specific preprocessing, Excel/CSV parsing, a persistent user-owned case object, full transaction de-duplication, property notification search, or statutory capital-gain calculators. Those features should be added separately with dated official sources, explicit tax-year applicability, deterministic formulas, migration tests, and a reviewed privacy design.

The next safe expansion is a versioned, source-linked knowledge catalogue for a small set of official FBR destinations, followed by explicit synthetic input forms for wealth and bank values. Only after those are validated should additional document types, OCR, or authenticated case drafts be considered.
