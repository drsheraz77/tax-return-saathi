import { useState } from "react";
import { FBR_NOTICE_ARCHIVE } from "./fbrNoticeArchive.js";
import { FBR_NOTICE_PREPARATION_TYPES, FBR_NOTICE_SUPPORT_URL, getNoticeDocumentChecklist, getNoticePreparationSteps } from "./fbrNoticePreparation.js";
import { TAX_KNOWLEDGE_FOUNDATION } from "./taxKnowledgeFoundation.js";
import { TAX_YEAR_2026_SOURCES, TAX_YEAR_2026_UPDATE } from "./taxYear2026Update.js";

const linkProps = {
  target: "_blank",
  rel: "noreferrer",
};

export default function TaxYear2026Update() {
  const [isOpen, setIsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [noticeGuideOpen, setNoticeGuideOpen] = useState(false);
  const [noticeType, setNoticeType] = useState("unsure");
  const [noticeDocumentItems, setNoticeDocumentItems] = useState({});

  return (
    <aside className="tax-year-update" aria-label="Verified Tax Year 2026 filing updates">
      <style>{`
        .tax-year-update { position: fixed; z-index: 60; right: 16px; bottom: 16px; font-family: Georgia, 'Times New Roman', serif; }
        .tax-year-update__toggle { display: flex; align-items: center; gap: 8px; border: 1px solid #b99116; border-radius: 999px; background: #0B3D2E; color: #fffdf2; box-shadow: 0 8px 24px rgba(11, 61, 46, .23); cursor: pointer; padding: 11px 15px; font: 700 14px/1.15 inherit; }
        .tax-year-update__toggle:hover, .tax-year-update__toggle:focus-visible { background: #12543f; outline: 3px solid rgba(202, 165, 24, .36); outline-offset: 2px; }
        .tax-year-update__status { display: inline-flex; width: 8px; height: 8px; border-radius: 50%; background: #e4bd35; }
        .tax-year-update__panel { width: min(390px, calc(100vw - 32px)); max-height: calc(100vh - 104px); margin-bottom: 10px; overflow-x: hidden; overflow-y: auto; border: 1px solid #d6bd67; border-radius: 14px; background: #fffdf5; color: #173b31; box-shadow: 0 16px 40px rgba(10, 43, 33, .24); }
        .tax-year-update__header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; padding: 15px 16px 13px; background: #0B3D2E; color: #fffdf2; }
        .tax-year-update__eyebrow { margin: 0 0 4px; color: #ecd46e; font-size: 11px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; }
        .tax-year-update__title { margin: 0; font-size: 18px; line-height: 1.2; }
        .tax-year-update__close { min-width: 30px; min-height: 30px; border: 0; border-radius: 50%; background: transparent; color: #fffdf2; cursor: pointer; font: 700 20px/1 sans-serif; }
        .tax-year-update__close:hover, .tax-year-update__close:focus-visible { background: rgba(255,255,255,.15); outline: 2px solid #ecd46e; outline-offset: 2px; }
        .tax-year-update__body { padding: 15px 16px 16px; font-size: 14px; line-height: 1.45; }
        .tax-year-update__body p { margin: 0 0 11px; }
        .tax-year-update__facts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 12px; }
        .tax-year-update__fact { border: 1px solid #e4d9a9; border-radius: 9px; background: #fffef9; padding: 9px; }
        .tax-year-update__fact--wide { grid-column: 1 / -1; }
        .tax-year-update__label { display: block; color: #665d40; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
        .tax-year-update__value { display: block; margin-top: 2px; color: #0B3D2E; font-size: 14px; font-weight: 700; }
        .tax-year-update__note { border-left: 3px solid #caa518; padding-left: 10px; color: #4d513c; font-size: 12px; }
        .tax-year-update__links { display: flex; flex-wrap: wrap; gap: 8px 12px; margin-top: 12px; font-size: 12px; }
        .tax-year-update__links a { color: #075c48; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .tax-year-update__archive-toggle { width: 100%; margin-top: 14px; border: 1px solid #d1bd69; border-radius: 9px; background: #f7f1d9; color: #0B3D2E; cursor: pointer; padding: 9px 10px; text-align: left; font: 700 13px/1.3 inherit; }
        .tax-year-update__archive-toggle:hover, .tax-year-update__archive-toggle:focus-visible { background: #eee1ad; outline: 3px solid rgba(202, 165, 24, .3); outline-offset: 2px; }
        .tax-year-update__archive { margin-top: 10px; border-top: 1px solid #e5dbb3; padding-top: 12px; }
        .tax-year-update__archive-heading { margin: 0 0 4px; color: #0B3D2E; font-size: 15px; }
        .tax-year-update__archive-intro { color: #5d5a46; font-size: 12px; }
        .tax-year-update__archive-list { display: grid; gap: 9px; margin: 10px 0 0; padding: 0; list-style: none; }
        .tax-year-update__archive-entry { border-left: 3px solid #caa518; padding: 8px 0 8px 10px; }
        .tax-year-update__archive-entry--historical { border-left-color: #8b8b74; }
        .tax-year-update__archive-date { display: block; color: #6b6246; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
        .tax-year-update__archive-title { display: block; margin-top: 2px; color: #173b31; font-size: 13px; font-weight: 700; }
        .tax-year-update__archive-summary { margin: 3px 0 5px !important; color: #454d40; font-size: 12px; }
        .tax-year-update__archive-link { color: #075c48; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .tax-year-update__source-map, .tax-year-update__notice-guide { margin-top: 12px; border: 1px solid #e4d9a9; border-radius: 10px; background: #fffef9; padding: 11px; }
        .tax-year-update__source-heading, .tax-year-update__notice-heading { margin: 0 0 5px; color: #0B3D2E; font-size: 14px; }
        .tax-year-update__source-copy, .tax-year-update__notice-copy { margin: 0 0 8px; color: #5d5a46; font-size: 12px; }
        .tax-year-update__source-list, .tax-year-update__notice-list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
        .tax-year-update__source-item, .tax-year-update__notice-item { border-left: 3px solid #caa518; padding-left: 9px; }
        .tax-year-update__source-title, .tax-year-update__notice-step { display: block; color: #173b31; font-size: 12px; font-weight: 700; }
        .tax-year-update__source-purpose { margin: 3px 0 5px; color: #4d513c; font-size: 12px; }
        .tax-year-update__select { box-sizing: border-box; width: 100%; margin: 4px 0 10px; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 8px; font: 13px/1.3 inherit; }
        .tax-year-update__select:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        @media (max-width: 520px) { .tax-year-update { right: 12px; bottom: 12px; } .tax-year-update__facts { grid-template-columns: 1fr; } .tax-year-update__fact--wide { grid-column: auto; } }
      `}</style>

      {isOpen && (
        <section id="tax-year-update-panel" className="tax-year-update__panel" aria-live="polite">
          <header className="tax-year-update__header">
            <div>
              <p className="tax-year-update__eyebrow">Verified filing update · reviewed {TAX_YEAR_2026_UPDATE.reviewedOn}</p>
              <h2 className="tax-year-update__title">Tax Year 2026 updates<br /><span lang="ur" dir="rtl">ٹیکس سال 2026 کی تازہ معلومات</span></h2>
            </div>
            <button className="tax-year-update__close" type="button" onClick={() => setIsOpen(false)} aria-label="Close Tax Year 2026 updates">×</button>
          </header>
          <div className="tax-year-update__body">
            <p><strong>IRIS filing is open.</strong> FBR’s public announcement states that Tax Year 2026 filing opened on {TAX_YEAR_2026_UPDATE.filingOpened}. File complete and accurate information.</p>
            <p lang="ur" dir="rtl"><strong>آئرس فائلنگ کھلی ہے۔</strong> ایف بی آر کے عوامی اعلان کے مطابق ٹیکس سال 2026 کی ریٹرن فائلنگ 27 جولائی 2026 کو شروع ہوئی۔ مکمل اور درست معلومات جمع کریں۔</p>
            <div className="tax-year-update__facts">
              <div className="tax-year-update__fact tax-year-update__fact--wide"><span className="tax-year-update__label">Tax period</span><span className="tax-year-update__value">{TAX_YEAR_2026_UPDATE.period}</span></div>
              <div className="tax-year-update__fact"><span className="tax-year-update__label">Individuals & AOPs</span><span className="tax-year-update__value">Due {TAX_YEAR_2026_UPDATE.individualAndAopDueDate}</span></div>
              <div className="tax-year-update__fact"><span className="tax-year-update__label">Companies</span><span className="tax-year-update__value">Due {TAX_YEAR_2026_UPDATE.companyDueDate}</span></div>
              <div className="tax-year-update__fact tax-year-update__fact--wide"><span className="tax-year-update__label">Special tax-year companies</span><span className="tax-year-update__value">Due {TAX_YEAR_2026_UPDATE.specialTaxYearCompanyDueDate}</span></div>
            </div>
            <p className="tax-year-update__note">These are the published due dates, not a statement that any extension has been granted. Check FBR’s current notice before filing and keep your supporting records.</p>
            <section className="tax-year-update__source-map" aria-label="Limited Tax Year 2026 official-source foundation">
              <h3 className="tax-year-update__source-heading">{TAX_KNOWLEDGE_FOUNDATION.version}<br /><span lang="ur" dir="rtl">ٹیکس سال 2026 سرکاری ذرائع کا محدود نقشہ</span></h3>
              <p className="tax-year-update__source-copy">Reviewed {TAX_KNOWLEDGE_FOUNDATION.reviewedOn}. {TAX_KNOWLEDGE_FOUNDATION.limitation}</p>
              <p className="tax-year-update__source-copy" lang="ur" dir="rtl">جائزہ: {TAX_KNOWLEDGE_FOUNDATION.reviewedOn}۔ {TAX_KNOWLEDGE_FOUNDATION.limitationUrdu}</p>
              <ul className="tax-year-update__source-list">
                {TAX_KNOWLEDGE_FOUNDATION.topics.map((topic) => (
                  <li className="tax-year-update__source-item" key={topic.id}>
                    <span className="tax-year-update__source-title">{topic.title}<br /><span lang="ur" dir="rtl">{topic.titleUrdu}</span></span>
                    <p className="tax-year-update__source-purpose">{topic.purpose}<br /><span lang="ur" dir="rtl">{topic.purposeUrdu}</span></p>
                    <a className="tax-year-update__archive-link" href={topic.sourceUrl} {...linkProps}>{topic.sourceLabel} ↗</a>
                  </li>
                ))}
              </ul>
            </section>
            <div className="tax-year-update__links">
              <a href={TAX_YEAR_2026_UPDATE.irisUrl} {...linkProps}>Open FBR IRIS</a>
              <a href={TAX_YEAR_2026_SOURCES.fbrDueDates} {...linkProps}>FBR due dates</a>
              <a href={TAX_YEAR_2026_SOURCES.fbrFilingGuidance} {...linkProps}>FBR filing guidance</a>
              <a href={TAX_YEAR_2026_SOURCES.fbrSocialAnnouncement} {...linkProps}>FBR public announcement</a>
              <a href={TAX_YEAR_2026_SOURCES.newspaperCoverage} {...linkProps}>Newspaper coverage</a>
            </div>
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setNoticeGuideOpen((open) => !open)} aria-expanded={noticeGuideOpen} aria-controls="fbr-notice-preparation-guide">
              {noticeGuideOpen ? "Hide" : "Open"} FBR notice preparation guide · <span lang="ur" dir="rtl">ایف بی آر نوٹس تیاری گائیڈ</span>
            </button>
            {noticeGuideOpen && (
              <section id="fbr-notice-preparation-guide" className="tax-year-update__notice-guide" aria-label="FBR notice preparation guide">
                <h3 className="tax-year-update__notice-heading">Prepare safely; do not upload or enter notice details here.<br /><span lang="ur" dir="rtl">محفوظ تیاری کریں؛ نوٹس کی تفصیل یہاں اپ لوڈ یا درج نہ کریں۔</span></h3>
                <p className="tax-year-update__notice-copy">Select only a broad, temporary category. This guide does not identify a notice, calculate a deadline, draft a response, or determine the correct outcome.</p>
                <label htmlFor="fbr-notice-type">Broad notice category / <span lang="ur" dir="rtl">نوٹس کی عمومی قسم</span></label>
                <select id="fbr-notice-type" className="tax-year-update__select" value={noticeType} onChange={(event) => { setNoticeType(event.target.value); setNoticeDocumentItems({}); }}>
                  {FBR_NOTICE_PREPARATION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label} — {type.labelUrdu}</option>)}
                </select>
                <ol className="tax-year-update__notice-list">
                  {getNoticePreparationSteps(noticeType).map((step) => (
                    <li className="tax-year-update__notice-item" key={step.id}><span className="tax-year-update__notice-step">{step.label}<br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></span></li>
                  ))}
                </ol>
                <h4 className="tax-year-update__notice-heading">Temporary document-preparation categories<br /><span lang="ur" dir="rtl">عارضی دستاویز تیاری زمرے</span></h4>
                <p className="tax-year-update__notice-copy">Mark only broad categories to organise your own private response preparation. Do not enter reference numbers, identifiers, tax amounts, notice text, passwords, OTPs, or upload documents here. These marks disappear when this page is refreshed.</p>
                <ul className="tax-year-update__notice-list" aria-label="Temporary notice-response document preparation categories">
                  {getNoticeDocumentChecklist(noticeType).map((item) => (
                    <li className="tax-year-update__notice-item" key={item.id}>
                      <label><input type="checkbox" checked={Boolean(noticeDocumentItems[item.id])} onChange={() => setNoticeDocumentItems((current) => ({ ...current, [item.id]: !current[item.id] }))} /> <span className="tax-year-update__notice-step">{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span></label>
                    </li>
                  ))}
                </ul>
                <button className="tax-year-update__archive-toggle" type="button" onClick={() => setNoticeDocumentItems({})}>Clear temporary categories · <span lang="ur" dir="rtl">عارضی زمرے صاف کریں</span></button>
                <p className="tax-year-update__note">For an unclear notice, response, or deadline, verify directly through the official channel or seek qualified advice.</p>
                <a className="tax-year-update__archive-link" href={FBR_NOTICE_SUPPORT_URL} {...linkProps}>Open FBR contact and support route ↗</a>
              </section>
            )}
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setArchiveOpen((open) => !open)} aria-expanded={archiveOpen} aria-controls="fbr-notice-archive">
              {archiveOpen ? "Hide" : "View"} dated FBR notice archive · <span lang="ur" dir="rtl">ایف بی آر اعلانات</span>
            </button>
            {archiveOpen && (
              <section id="fbr-notice-archive" className="tax-year-update__archive" aria-label="Dated FBR notice archive">
                <h3 className="tax-year-update__archive-heading">Dated FBR notice archive</h3>
                <p className="tax-year-update__archive-intro">Official-source record. Historical entries are retained for context and do not change Tax Year 2026 dates.</p>
                <ol className="tax-year-update__archive-list">
                  {FBR_NOTICE_ARCHIVE.map((notice) => (
                    <li key={notice.id} className={`tax-year-update__archive-entry${notice.scope.startsWith("Historical") ? " tax-year-update__archive-entry--historical" : ""}`}>
                      <time className="tax-year-update__archive-date" dateTime={notice.dateIso}>{notice.publishedOn} · {notice.scope}</time>
                      <span className="tax-year-update__archive-title">{notice.title}</span>
                      <p className="tax-year-update__archive-summary">{notice.summary}</p>
                      <a className="tax-year-update__archive-link" href={notice.sourceUrl} {...linkProps}>{notice.sourceLabel}</a>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </section>
      )}

      <button className="tax-year-update__toggle" type="button" onClick={() => { setIsOpen((open) => !open); if (isOpen) setArchiveOpen(false); }} aria-expanded={isOpen} aria-controls="tax-year-update-panel">
        <span className="tax-year-update__status" aria-hidden="true" />
        Tax Year 2026 update · <span lang="ur" dir="rtl">ٹیکس سال 2026</span>
      </button>
    </aside>
  );
}
