# Investment Education Section: Verification Record

**Date:** 24 August 2026

## Desktop managed-preview interaction

The Tax Return Saathi managed preview loaded with the revised **Tax & investment resources** entry button. Opening the official-resource hub showed the added English/Urdu investment-education boundary: it does not recommend a product, estimate returns, or decide suitability.

The separate **Investment education: fixed-term accounts, stocks, ETFs & bonds** accordion expanded successfully. It displayed four bilingual, officially linked education cards:

1. National Savings fixed-term savings accounts and certificates;
2. Pakistan Stock Exchange financial-literacy resources for stocks;
3. Pakistan Stock Exchange ETF overview; and
4. State Bank of Pakistan InvestPak government-securities information for bonds.

The rendered copy was preparation and learning oriented. It did not offer a product recommendation, return forecast, suitability assessment, tax treatment, yield, current rate, or eligibility conclusion.

## Responsive and automated verification

At a 375 × 812 mobile viewport, the visible **Tax & investment resources** floating control remained distinct from the filing-checklist prototype and Tax Year 2026 controls. The controls did not overlap and stayed readable. The full-page mobile capture also retained the authored application’s existing layout.

`pnpm test` completed with **5 passing test files and 20 passing tests**, including the expanded official-resource hub assertions. `pnpm build` completed successfully. The only build output was the pre-existing advisory about a minified client chunk exceeding 500 kB. A review of recent managed-preview console entries after the desktop and mobile checks found no new errors.

## Explicit mobile accordion interaction

An independent Chrome DevTools interaction check ran at **375 × 812**. Before opening the hub, the three fixed controls had distinct non-overlapping bounding boxes: resources `(12, 625, 363 × 61)`, checklist `(12, 697, 246.39 × 48)`, and Tax Year 2026 `(45.44, 752, 317.56 × 48)`. The check opened the resource hub, expanded the investments accordion, and confirmed all four official links were visible: National Savings products, PSX financial-literacy resources, PSX ETF overview, and SBP InvestPak bond information. It also confirmed the neutral education boundary was visible and reported no relevant console errors.

The unit test at `server/officialResourceHub.test.ts` explicitly verifies the investments section ID, the four expected resource IDs, bilingual titles and descriptions, and the non-recommendation introduction. The re-run suite passed all **20 tests**.
