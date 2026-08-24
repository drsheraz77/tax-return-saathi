import { useMemo, useState } from "react";
import { FREELANCER_FAQ, FREELANCER_PRE_FILING_CHECKLIST, IRIS_FAQ, OFFICIAL_RESOURCE_HUB, PRE_FILING_CHECKLIST, searchFreelancerFaq, searchIrisFaq } from "./officialResourceHub.js";

const linkProps = { target: "_blank", rel: "noreferrer" };

export default function OfficialResourceHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("filing");
  const [faqQuery, setFaqQuery] = useState("");
  const [freelancerFaqQuery, setFreelancerFaqQuery] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [showFreelancerChecklist, setShowFreelancerChecklist] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const matchingFaq = useMemo(() => searchIrisFaq(faqQuery), [faqQuery]);
  const matchingFreelancerFaq = useMemo(() => searchFreelancerFaq(freelancerFaqQuery), [freelancerFaqQuery]);

  function toggleChecklistItem(itemId) {
    setCheckedItems((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  return (
    <aside className="official-resource-hub" aria-label="Official registration, tax filing, and investment education resources">
      <style>{`
        .official-resource-hub { position: fixed; z-index: 60; left: 16px; bottom: 78px; font-family: Georgia, 'Times New Roman', serif; }
        .official-resource-hub__toggle { display: flex; align-items: center; gap: 8px; border: 1px solid #b99116; border-radius: 999px; background: #fffdf2; color: #0B3D2E; box-shadow: 0 8px 24px rgba(11, 61, 46, .18); cursor: pointer; padding: 10px 14px; font: 700 14px/1.2 inherit; }
        .official-resource-hub__toggle:hover, .official-resource-hub__toggle:focus-visible { background: #f7f0d5; outline: 3px solid rgba(202, 165, 24, .36); outline-offset: 2px; }
        .official-resource-hub__icon { display: inline-grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; background: #0B3D2E; color: #ecd46e; font: 700 12px/1 sans-serif; }
        .official-resource-hub__panel { width: min(430px, calc(100vw - 32px)); max-height: calc(100vh - 128px); margin-bottom: 10px; overflow-x: hidden; overflow-y: auto; border: 1px solid #d6bd67; border-radius: 14px; background: #fffdf5; color: #173b31; box-shadow: 0 16px 40px rgba(10, 43, 33, .24); }
        .official-resource-hub__header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 15px 16px 13px; background: #0B3D2E; color: #fffdf2; }
        .official-resource-hub__eyebrow { margin: 0 0 4px; color: #ecd46e; font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
        .official-resource-hub__title { margin: 0; font-size: 18px; line-height: 1.2; }
        .official-resource-hub__close { min-width: 30px; min-height: 30px; border: 0; border-radius: 50%; background: transparent; color: #fffdf2; cursor: pointer; font: 700 20px/1 sans-serif; }
        .official-resource-hub__close:hover, .official-resource-hub__close:focus-visible { background: rgba(255,255,255,.15); outline: 2px solid #ecd46e; outline-offset: 2px; }
        .official-resource-hub__body { padding: 15px 16px 16px; font-size: 14px; line-height: 1.45; }
        .official-resource-hub__boundary { margin: 0 0 12px; border-left: 3px solid #caa518; padding-left: 10px; color: #4d513c; font-size: 12px; }
        .official-resource-hub__accordion { border-top: 1px solid #e5dbb3; }
        .official-resource-hub__section-toggle { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 12px; border: 0; background: transparent; color: #0B3D2E; cursor: pointer; padding: 12px 0; text-align: left; font: 700 15px/1.3 inherit; }
        .official-resource-hub__section-toggle:hover, .official-resource-hub__section-toggle:focus-visible { color: #075c48; outline: 3px solid rgba(202, 165, 24, .3); outline-offset: -1px; }
        .official-resource-hub__chevron { color: #a77e0e; font-family: sans-serif; }
        .official-resource-hub__section-content { padding: 0 0 12px; }
        .official-resource-hub__intro { margin: 0 0 10px; color: #595844; font-size: 12px; }
        .official-resource-hub__list, .official-resource-hub__faq-list, .official-resource-hub__print-list { display: grid; gap: 9px; margin: 0; padding: 0; list-style: none; }
        .official-resource-hub__item, .official-resource-hub__faq-item { border: 1px solid #e4d9a9; border-radius: 10px; background: #fffef9; padding: 10px; }
        .official-resource-hub__item-title, .official-resource-hub__faq-question { display: block; color: #173b31; font-size: 13px; font-weight: 700; }
        .official-resource-hub__item-urdu, .official-resource-hub__faq-urdu { display: block; margin-top: 2px; color: #4d513c; font-size: 13px; }
        .official-resource-hub__item-description, .official-resource-hub__faq-answer { margin: 6px 0; color: #4d513c; font-size: 12px; }
        .official-resource-hub__item-description--urdu { margin-top: -2px; }
        .official-resource-hub__link { color: #075c48; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .official-resource-hub__tools { border-top: 1px solid #e5dbb3; padding-top: 13px; }
        .official-resource-hub__tool-title { margin: 0 0 6px; color: #0B3D2E; font-size: 15px; }
        .official-resource-hub__tool-copy { margin: 0 0 9px; color: #595844; font-size: 12px; }
        .official-resource-hub__search { box-sizing: border-box; width: 100%; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 9px 10px; font: 14px/1.3 inherit; }
        .official-resource-hub__search:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .official-resource-hub__no-results { margin: 10px 0; color: #625f4e; font-size: 12px; }
        .official-resource-hub__print-toggle, .official-resource-hub__print-action { border: 1px solid #0B3D2E; border-radius: 8px; background: #0B3D2E; color: #fffdf2; cursor: pointer; padding: 9px 11px; font: 700 13px/1.2 inherit; }
        .official-resource-hub__print-toggle:hover, .official-resource-hub__print-toggle:focus-visible, .official-resource-hub__print-action:hover, .official-resource-hub__print-action:focus-visible { background: #075c48; outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .official-resource-hub__print-sheet { display: none; }
        .official-resource-hub__print-sheet--visible { display: block; margin-top: 12px; border: 1px dashed #b99116; border-radius: 10px; padding: 12px; background: #fffef9; }
        .official-resource-hub__check-label { display: flex; align-items: flex-start; gap: 8px; color: #173b31; font-size: 12px; cursor: pointer; }
        .official-resource-hub__check-label input { width: 16px; height: 16px; margin-top: 1px; accent-color: #0B3D2E; }
        .official-resource-hub__print-meta { margin: 0 0 10px; color: #625f4e; font-size: 11px; }
        .official-resource-hub__print-action { margin-top: 12px; }
        .official-resource-hub__footer { margin: 13px 0 0; color: #625f4e; font-size: 11px; }
        @media (max-width: 520px) { .official-resource-hub { left: 12px; bottom: 126px; } .official-resource-hub__panel { max-height: calc(100vh - 156px); } .official-resource-hub__toggle { font-size: 13px; } }
        @media print { body * { visibility: hidden !important; } .official-resource-hub__print-sheet, .official-resource-hub__print-sheet * { visibility: visible !important; } .official-resource-hub__print-sheet { display: block !important; position: fixed; inset: 0; width: auto; margin: 0; border: 0; border-radius: 0; padding: 20px; background: #fff; color: #000; } .official-resource-hub__print-action { display: none !important; } }
      `}</style>

      {isOpen && (
        <section id="official-resource-hub-panel" className="official-resource-hub__panel" aria-live="polite">
          <header className="official-resource-hub__header">
            <div>
              <p className="official-resource-hub__eyebrow">Official-resource desk · reviewed {OFFICIAL_RESOURCE_HUB.reviewedOn}</p>
              <h2 className="official-resource-hub__title">Registration, filing & investment resources<br /><span lang="ur" dir="rtl">رجسٹریشن، فائلنگ اور سرمایہ کاری وسائل</span></h2>
            </div>
            <button className="official-resource-hub__close" type="button" onClick={() => setIsOpen(false)} aria-label="Close registration and filing resources">×</button>
          </header>
          <div className="official-resource-hub__body">
            <p className="official-resource-hub__boundary"><strong>Educational support only.</strong> This hub links to official services and helps you prepare; it does not register a business, submit a return, or determine your tax position.</p>
            <p className="official-resource-hub__boundary" lang="ur" dir="rtl"><strong>صرف تعلیمی معاونت۔</strong> یہ حصہ سرکاری سروسز کے لنکس اور تیاری میں مدد دیتا ہے؛ یہ کاروبار رجسٹر، ریٹرن جمع یا آپ کی ٹیکس پوزیشن طے نہیں کرتا۔</p>
            <p className="official-resource-hub__boundary"><strong>Investment education only.</strong> The investments section does not recommend a product, estimate returns, or decide what is suitable for you.</p>
            <p className="official-resource-hub__boundary" lang="ur" dir="rtl"><strong>صرف سرمایہ کاری کی معلومات۔</strong> سرمایہ کاری والا حصہ کسی پراڈکٹ کی سفارش، منافع کا اندازہ یا آپ کے لیے موزونیت کا فیصلہ نہیں کرتا۔</p>
            {OFFICIAL_RESOURCE_HUB.sections.map((section) => {
              const isExpanded = expandedSection === section.id;
              const panelId = `official-resource-${section.id}`;
              return (
                <section className="official-resource-hub__accordion" key={section.id}>
                  <button className="official-resource-hub__section-toggle" type="button" onClick={() => setExpandedSection((current) => current === section.id ? "" : section.id)} aria-expanded={isExpanded} aria-controls={panelId}>
                    <span>{section.title}<br /><span lang="ur" dir="rtl">{section.titleUrdu}</span></span>
                    <span className="official-resource-hub__chevron" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && (
                    <div id={panelId} className="official-resource-hub__section-content">
                      <p className="official-resource-hub__intro">{section.introduction}</p>
                      <p className="official-resource-hub__intro" lang="ur" dir="rtl">{section.introductionUrdu}</p>
                      <ul className="official-resource-hub__list">
                        {section.resources.map((resource) => (
                          <li className="official-resource-hub__item" key={resource.id}>
                            <span className="official-resource-hub__item-title">{resource.title}</span>
                            <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{resource.titleUrdu}</span>
                            <p className="official-resource-hub__item-description">{resource.description}</p>
                            <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{resource.descriptionUrdu}</p>
                            <a className="official-resource-hub__link" href={resource.url} {...linkProps}>{resource.sourceLabel} ↗</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}

            <section className="official-resource-hub__tools" aria-labelledby="iris-faq-title">
              <h3 id="iris-faq-title" className="official-resource-hub__tool-title">IRIS help & troubleshooting<br /><span lang="ur" dir="rtl">آئرس مدد اور مسائل کا حل</span></h3>
              <p className="official-resource-hub__tool-copy">Search common access and filing questions. Each answer links to FBR’s official support route.</p>
              <label className="sr-only" htmlFor="iris-faq-search">Search IRIS help questions</label>
              <input id="iris-faq-search" className="official-resource-hub__search" value={faqQuery} onChange={(event) => setFaqQuery(event.target.value)} placeholder="Search: password, mobile, return…" type="search" />
              {matchingFaq.length === 0 ? <p className="official-resource-hub__no-results">No matching topic. Use the official FBR filing-help link below or search with fewer words.</p> : (
                <ul className="official-resource-hub__faq-list" aria-label="IRIS troubleshooting answers">
                  {matchingFaq.map((item) => (
                    <li className="official-resource-hub__faq-item" key={item.id}>
                      <span className="official-resource-hub__faq-question">{item.question}</span>
                      <span className="official-resource-hub__faq-urdu" lang="ur" dir="rtl">{item.questionUrdu}</span>
                      <p className="official-resource-hub__faq-answer">{item.answer}</p>
                      <p className="official-resource-hub__faq-answer" lang="ur" dir="rtl">{item.answerUrdu}</p>
                      <a className="official-resource-hub__link" href={item.url} {...linkProps}>{item.sourceLabel} ↗</a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="freelancer-faq-title">
              <h3 id="freelancer-faq-title" className="official-resource-hub__tool-title">Freelancer foreign-client & records help<br /><span lang="ur" dir="rtl">فری لانسر بیرونِ ملک کلائنٹ اور ریکارڈ مدد</span></h3>
              <p className="official-resource-hub__tool-copy">Search preparation guidance for foreign-client payments and record keeping. This tool does not determine tax treatment.</p>
              <label className="sr-only" htmlFor="freelancer-faq-search">Search freelancer foreign-client and record-keeping questions</label>
              <input id="freelancer-faq-search" className="official-resource-hub__search" value={freelancerFaqQuery} onChange={(event) => setFreelancerFaqQuery(event.target.value)} placeholder="Search: foreign client, invoice, bank, records…" type="search" />
              {matchingFreelancerFaq.length === 0 ? <p className="official-resource-hub__no-results">No matching topic. Use the official FBR filing-help link below or search with fewer words.</p> : (
                <ul className="official-resource-hub__faq-list" aria-label="Freelancer foreign-client and record-keeping answers">
                  {matchingFreelancerFaq.map((item) => (
                    <li className="official-resource-hub__faq-item" key={item.id}>
                      <span className="official-resource-hub__faq-question">{item.question}</span>
                      <span className="official-resource-hub__faq-urdu" lang="ur" dir="rtl">{item.questionUrdu}</span>
                      <p className="official-resource-hub__faq-answer">{item.answer}</p>
                      <p className="official-resource-hub__faq-answer" lang="ur" dir="rtl">{item.answerUrdu}</p>
                      <a className="official-resource-hub__link" href={item.url} {...linkProps}>{item.sourceLabel} ↗</a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="freelancer-prefiling-title">
              <h3 id="freelancer-prefiling-title" className="official-resource-hub__tool-title">Printable freelancer pre-filing checklist<br /><span lang="ur" dir="rtl">قابلِ پرنٹ فری لانسر پری فائلنگ چیک لسٹ</span></h3>
              <p className="official-resource-hub__tool-copy">A local preparation aid for freelance work and client-payment records. It does not save answers, submit a return, or ask for amounts, CNICs, or documents.</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setShowFreelancerChecklist((visible) => !visible)} aria-expanded={showFreelancerChecklist} aria-controls="freelancer-prefiling-print-sheet">{showFreelancerChecklist ? "Hide freelancer checklist" : "Open freelancer printable checklist"}</button>
              {showFreelancerChecklist && (
                <section id="freelancer-prefiling-print-sheet" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Printable freelancer pre-filing document checklist">
                  <h2>Tax Return Saathi — Freelancer pre-filing checklist</h2>
                  <p className="official-resource-hub__print-meta">Educational preparation aid · Check items that apply to you · Confirm current requirements on FBR IRIS before filing.</p>
                  <p className="official-resource-hub__print-meta" lang="ur" dir="rtl">تعلیمی تیاری معاونت · متعلقہ اشیا پر نشان لگائیں · فائلنگ سے پہلے ایف بی آر آئرس پر موجودہ شرائط کی تصدیق کریں۔</p>
                  <ul className="official-resource-hub__print-list">
                    {FREELANCER_PRE_FILING_CHECKLIST.map((item) => (
                      <li key={item.id}>
                        <label className="official-resource-hub__check-label">
                          <input type="checkbox" checked={Boolean(checkedItems[item.id])} onChange={() => toggleChecklistItem(item.id)} />
                          <span>{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => window.print()}>Print freelancer checklist</button>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="prefiling-title">
              <h3 id="prefiling-title" className="official-resource-hub__tool-title">Printable pre-filing checklist<br /><span lang="ur" dir="rtl">قابلِ پرنٹ پری فائلنگ چیک لسٹ</span></h3>
              <p className="official-resource-hub__tool-copy">A local preparation aid. It does not save answers, submit a return, or ask for amounts, CNICs, or documents.</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setShowChecklist((visible) => !visible)} aria-expanded={showChecklist} aria-controls="prefiling-print-sheet">{showChecklist ? "Hide checklist" : "Open printable checklist"}</button>
              {showChecklist && (
                <section id="prefiling-print-sheet" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Printable pre-filing document checklist">
                  <h2>Tax Return Saathi — Pre-filing document checklist</h2>
                  <p className="official-resource-hub__print-meta">Educational preparation aid · Check items that apply to you · Confirm current requirements on FBR IRIS before filing.</p>
                  <p className="official-resource-hub__print-meta" lang="ur" dir="rtl">تعلیمی تیاری معاونت · متعلقہ اشیا پر نشان لگائیں · فائلنگ سے پہلے ایف بی آر آئرس پر موجودہ شرائط کی تصدیق کریں۔</p>
                  <ul className="official-resource-hub__print-list">
                    {PRE_FILING_CHECKLIST.map((item) => (
                      <li key={item.id}>
                        <label className="official-resource-hub__check-label">
                          <input type="checkbox" checked={Boolean(checkedItems[item.id])} onChange={() => toggleChecklistItem(item.id)} />
                          <span>{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => window.print()}>Print checklist</button>
                </section>
              )}
            </section>
            <p className="official-resource-hub__footer">Before acting, confirm current requirements, fees, deadlines, and eligibility directly on the linked official portal.</p>
          </div>
        </section>
      )}

      <button className="official-resource-hub__toggle" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="official-resource-hub-panel">
        <span className="official-resource-hub__icon" aria-hidden="true">i</span>
        Tax & investment resources · <span lang="ur" dir="rtl">ٹیکس اور سرمایہ کاری وسائل</span>
      </button>
    </aside>
  );
}
