# Adaptive Filing Checklist Prototype Verification

**Date:** 22 August 2026  
**Environment:** Fresh managed development preview session

## Initial journey check

The new **“Try filing checklist prototype”** control appeared at the lower left of the existing Tax Return Saathi interface without covering its primary content or the separate Tax Year 2026 update control. Selecting it opened the local-only panel in the same page.

The panel displayed the first adaptive question, English and Urdu labels, disabled the Continue button until a response is selected, and exposed the stated privacy boundary. The browser-visible text confirmed that the prototype does not ask for tax amounts, CNIC, NTN, bank details, documents, or passwords, and describes itself as a preparation tool rather than tax advice or a filing decision.

## Adaptive branch check

Selecting **“This is my first return”** enabled Continue and advanced to the category-selection question. This step accepted multiple categories and reiterated that users should not provide monetary amounts, account numbers, CNIC, or passwords. The available category choices included salary/pension, business/shop, property rent/sale, bank profit/investments/dividends, and an uncertainty path.

The browser then selected both **Business or shop** and **Property rent or sale**. Both selections were visibly retained as checked options, demonstrating that the prototype supports multi-category inputs before it calculates which conditional follow-up questions to show.

Advancing from these selections displayed **“Are your business records ready to review?”**, which explicitly explains that it appears only after Business or shop is selected. Selecting **“Not ready yet”** enabled the onward path so the prototype can add an appropriate records-preparation reminder to its final preview.

The next conditional question correctly covered property-related records and similarly stated that it appears only after the Property option is selected. After choosing **“Not ready yet,”** the common withholding question appeared. Selecting **Yes** on that question confirmed the flow accepts a high-level withholding signal while continuing to avoid collection of amounts or payer details.

After the withholding response, the prototype displayed the foreign-income, overseas-assets, and tax-residence safety gate. The helper text makes clear that it does not assess foreign-tax or tax-residence treatment. Selecting **No** retained the standard journey and enables the final checklist view without presenting a tax determination.

The standard path then reached the supporting-records readiness question. Its helper text explicitly states that readiness is used to highlight preparation steps rather than assess compliance. Selecting **“I have not started”** enabled the **“Preview my checklist”** control for review of the resulting local-only prompts.

The final preview grouped targeted prompts into Before IRIS, Income records, Tax deducted and records, and Before you submit. It included business, property, tax-deducted-at-source, and missing-records prompts selected by the tested path. Each prompt exposes **Have it**, **Need to find**, and **Not sure** controls; selecting **Have it** visibly updated the control in-browser. The panel retained its explicit no-save and no-tax-determination boundary and exposed Edit answers and Start over controls.

Selecting **Start over** cleared the tested path and returned the panel to its initial filing-experience question with no selection retained. A final browser-console inspection after the full journey, result interaction, and reset returned no console output.
