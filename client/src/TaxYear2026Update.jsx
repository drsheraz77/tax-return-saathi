import { useState } from "react";
import { FBR_NOTICE_ARCHIVE } from "./fbrNoticeArchive.js";
import { FBR_NOTICE_PREPARATION_TYPES, FBR_NOTICE_SUPPORT_URL, getNoticeDocumentChecklist, getNoticePreparationSteps } from "./fbrNoticePreparation.js";
import { getLearningPath, getPlanningReflection, getStarterKnowledgeTopics, TAX_KNOWLEDGE_FOUNDATION, TAX_LEARNING_PATHS, TAX_PLANNING_REFLECTIONS, TAX_PREPARATION_VISUAL_JOURNEY, TAX_SOURCE_TOPIC_BRIEFS } from "./taxKnowledgeFoundation.js";
import { MANUAL_SOURCE_REVIEW_WORKFLOW, OFFICIAL_SOURCE_UPDATE_CENTRE, REVIEWED_SOURCE_CHANGE_LOG, TAX_YEAR_2026_SOURCES, TAX_YEAR_2026_UPDATE, URDU_FIRST_ESCALATION_GUIDANCE_CARDS } from "./taxYear2026Update.js";

const linkProps = {
  target: "_blank",
  rel: "noreferrer",
};

export default function TaxYear2026Update() {
  const [isOpen, setIsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [sourceUpdateCentreOpen, setSourceUpdateCentreOpen] = useState(false);
  const [sourceChangeLogOpen, setSourceChangeLogOpen] = useState(false);
  const [manualSourceReviewWorkflowOpen, setManualSourceReviewWorkflowOpen] = useState(false);
  const [escalationGuidanceCardsOpen, setEscalationGuidanceCardsOpen] = useState(false);
  const [noticeGuideOpen, setNoticeGuideOpen] = useState(false);
  const [noticeType, setNoticeType] = useState("unsure");
  const [noticeDocumentItems, setNoticeDocumentItems] = useState({});
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [learningPathId, setLearningPathId] = useState(TAX_LEARNING_PATHS[0].id);
  const [planningReflectionId, setPlanningReflectionId] = useState(TAX_PLANNING_REFLECTIONS[0].id);
  const filteredKnowledgeTopics = getStarterKnowledgeTopics(knowledgeQuery);
  const activeLearningPath = getLearningPath(learningPathId);
  const activeLearningTopic = TAX_KNOWLEDGE_FOUNDATION.topics.find((topic) => topic.id === activeLearningPath.topicId);
  const activePlanningReflection = getPlanningReflection(planningReflectionId);
  const activePlanningTopic = TAX_KNOWLEDGE_FOUNDATION.topics.find((topic) => topic.id === activePlanningReflection.topicId);

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
        .tax-year-update__manual-review-badge { display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; margin: 11px 0 12px; border: 1px solid #cfc189; border-radius: 999px; background: #f7f1d9; color: #173b31; padding: 7px 10px; font-size: 11px; line-height: 1.35; }
        .tax-year-update__manual-review-badge strong { color: #0B3D2E; }
        .tax-year-update__manual-review-date { border-radius: 999px; background: #0B3D2E; color: #fffdf2; padding: 2px 6px; font-weight: 700; }
        .tax-year-update__manual-review-boundary { color: #5d5a46; }
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
        .tax-year-update__citation { display: block; margin: 5px 0 4px; color: #6b6246; font-size: 11px; font-weight: 700; }
        .tax-year-update__connection-label { display: block; margin-top: 7px; color: #665d40; font-size: 11px; font-weight: 700; }
        .tax-year-update__connection-list { display: flex; flex-wrap: wrap; gap: 5px; margin: 4px 0 2px; padding: 0; list-style: none; }
        .tax-year-update__connection { border: 1px solid #d8ceaa; border-radius: 999px; background: #f7f1d9; color: #365446; padding: 3px 6px; font-size: 10px; }
        .tax-year-update__finder-label { display: block; margin: 9px 0 4px; color: #173b31; font-size: 12px; font-weight: 700; }
        .tax-year-update__finder-input { box-sizing: border-box; width: 100%; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 8px; font: 13px/1.3 inherit; }
        .tax-year-update__finder-input:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .tax-year-update__empty { margin: 8px 0 0; color: #5d5a46; font-size: 12px; }
        .tax-year-update__learning-card { margin-top: 11px; border: 1px solid #cfc189; border-radius: 9px; background: #f7f1d9; padding: 9px; }
        .tax-year-update__learning-card p { margin: 5px 0; color: #4d513c; font-size: 12px; }
        .tax-year-update__select { box-sizing: border-box; width: 100%; margin: 4px 0 10px; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 8px; font: 13px/1.3 inherit; }
        .tax-year-update__select:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .tax-year-update__journey { display: grid; gap: 7px; margin: 9px 0 0; padding: 0; list-style: none; }
        .tax-year-update__journey-step { display: grid; grid-template-columns: 23px 1fr; gap: 7px; align-items: start; border-left: 3px solid #caa518; padding: 7px 0 7px 8px; }
        .tax-year-update__journey-number { display: grid; place-items: center; width: 21px; height: 21px; border-radius: 50%; background: #0B3D2E; color: #fffdf2; font: 700 11px/1 sans-serif; }
        .tax-year-update__journey-copy { margin: 2px 0 0 !important; color: #4d513c; font-size: 12px; }
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
            <aside id="last-manual-source-review-badge" className="tax-year-update__manual-review-badge" aria-label="Last manual source review">
              <strong lang="ur" dir="rtl">آخری دستی سورس جائزہ</strong>
              <time className="tax-year-update__manual-review-date" dateTime={REVIEWED_SOURCE_CHANGE_LOG.entries[0].dateIso}>{REVIEWED_SOURCE_CHANGE_LOG.entries[0].displayDate}</time>
              <span>Last manual source review</span>
              <span className="tax-year-update__manual-review-boundary">Manual catalogue review — not live updates.</span>
            </aside>
            <section id="reviewed-tax-knowledge-catalogue" className="tax-year-update__source-map" aria-label="Reviewed Tax Year 2026 starter knowledge catalogue">
              <h3 className="tax-year-update__source-heading">{TAX_KNOWLEDGE_FOUNDATION.version}<br /><span lang="ur" dir="rtl">ٹیکس سال 2026 جائزہ شدہ ابتدائی معلوماتی کیٹلاگ</span></h3>
              <p className="tax-year-update__source-copy">Reviewed {TAX_KNOWLEDGE_FOUNDATION.reviewedOn}. {TAX_KNOWLEDGE_FOUNDATION.limitation}</p>
              <p className="tax-year-update__source-copy" lang="ur" dir="rtl">جائزہ: {TAX_KNOWLEDGE_FOUNDATION.reviewedOn}۔ {TAX_KNOWLEDGE_FOUNDATION.limitationUrdu}</p>
              <label className="tax-year-update__finder-label" htmlFor="reviewed-knowledge-topic-finder">Find a reviewed topic locally / <span lang="ur" dir="rtl">مقامی طور پر جائزہ شدہ موضوع تلاش کریں</span></label>
              <input id="reviewed-knowledge-topic-finder" className="tax-year-update__finder-input" value={knowledgeQuery} onChange={(event) => setKnowledgeQuery(event.target.value)} placeholder="e.g. IRIS, records, due dates / آئرس، ریکارڈ، تاریخ" />
              <p className="tax-year-update__source-copy">This finder runs only in this page. Your search is not sent to a server or saved. <span lang="ur" dir="rtl">یہ فائنڈر صرف اسی صفحے میں چلتا ہے۔ آپ کی تلاش سرور کو نہیں بھیجی اور نہ محفوظ کی جاتی ہے۔</span></p>
              <ul className="tax-year-update__source-list">
                {filteredKnowledgeTopics.map((topic) => (
                  <li className="tax-year-update__source-item" key={topic.id}>
                    <span className="tax-year-update__source-title">{topic.title}<br /><span lang="ur" dir="rtl">{topic.titleUrdu}</span></span>
                    <p className="tax-year-update__source-purpose">{topic.purpose}<br /><span lang="ur" dir="rtl">{topic.purposeUrdu}</span></p>
                    <span className="tax-year-update__citation">{TAX_KNOWLEDGE_FOUNDATION.citationLabel} · {topic.sourceLabel} · reviewed {topic.reviewedOn}<br /><span lang="ur" dir="rtl">{TAX_KNOWLEDGE_FOUNDATION.citationLabelUrdu} · جائزہ {topic.reviewedOn}</span></span>
                    <p className="tax-year-update__source-purpose"><strong>Scope:</strong> {topic.scope}<br /><span lang="ur" dir="rtl"><strong>دائرہ:</strong> {topic.scopeUrdu}</span></p>
                    <a className="tax-year-update__archive-link" href={topic.sourceUrl} {...linkProps}>{topic.sourceLabel} ↗</a>
                    <span className="tax-year-update__connection-label">Use alongside existing preparation tools / <span lang="ur" dir="rtl">موجودہ تیاری ٹولز کے ساتھ استعمال کریں</span></span>
                    <ul className="tax-year-update__connection-list">
                      {topic.preparationLinks.map((connection) => <li className="tax-year-update__connection" key={connection.id}>{connection.label} · <span lang="ur" dir="rtl">{connection.labelUrdu}</span></li>)}
                    </ul>
                  </li>
                ))}
              </ul>
              {filteredKnowledgeTopics.length === 0 && <p className="tax-year-update__empty">No reviewed topic matched that search. Clear the text or check FBR directly. <span lang="ur" dir="rtl">اس تلاش سے کوئی جائزہ شدہ موضوع نہیں ملا۔ متن صاف کریں یا براہِ راست ایف بی آر دیکھیں۔</span></p>}
              <section id="low-data-learning-path" className="tax-year-update__learning-card" aria-label="Low-data guided learning path">
                <h4 className="tax-year-update__source-heading">Choose a broad learning goal / <span lang="ur" dir="rtl">عمومی سیکھنے کا مقصد منتخب کریں</span></h4>
                <p>Select only an educational goal. This does not ask for figures, identity, documents, or an account status. <span lang="ur" dir="rtl">صرف تعلیمی مقصد منتخب کریں۔ یہ اعداد، شناخت، دستاویزات یا اکاؤنٹ اسٹیٹس نہیں مانگتا۔</span></p>
                <select className="tax-year-update__select" aria-label="Choose a broad learning goal" value={learningPathId} onChange={(event) => setLearningPathId(event.target.value)}>
                  {TAX_LEARNING_PATHS.map((path) => <option key={path.id} value={path.id}>{path.title} — {path.titleUrdu}</option>)}
                </select>
                <span className="tax-year-update__source-title">1. {activeLearningTopic.title}<br /><span lang="ur" dir="rtl">1۔ {activeLearningTopic.titleUrdu}</span></span>
                <a className="tax-year-update__archive-link" href={activeLearningTopic.sourceUrl} {...linkProps}>{activeLearningTopic.sourceLabel} ↗</a>
                <p><strong>2. Preparation action:</strong> {activeLearningPath.preparationAction}<br /><span lang="ur" dir="rtl"><strong>2۔ تیاری عمل:</strong> {activeLearningPath.preparationActionUrdu}</span></p>
                <p><strong>3. Limit:</strong> {activeLearningPath.boundary}<br /><span lang="ur" dir="rtl"><strong>3۔ حد:</strong> {activeLearningPath.boundaryUrdu}</span></p>
              </section>
              <section id="source-linked-topic-briefs" className="tax-year-update__learning-card" aria-label="Source-linked educational topic briefs">
                <h4 className="tax-year-update__source-heading">Source-linked topic briefs / <span lang="ur" dir="rtl">ذریعہ سے منسلک موضوع بریف</span></h4>
                <p>Each brief points back to a reviewed FBR source. It is not a complete legal database or personal advice. <span lang="ur" dir="rtl">ہر بریف جائزہ شدہ ایف بی آر ذریعہ سے منسلک ہے۔ یہ مکمل قانونی ڈیٹابیس یا ذاتی مشورہ نہیں۔</span></p>
                <ul className="tax-year-update__source-list">
                  {TAX_SOURCE_TOPIC_BRIEFS.map((brief) => {
                    const topic = TAX_KNOWLEDGE_FOUNDATION.topics.find((item) => item.id === brief.topicId);
                    return <li className="tax-year-update__source-item" key={brief.id}>
                      <span className="tax-year-update__source-title">{brief.title}<br /><span lang="ur" dir="rtl">{brief.titleUrdu}</span></span>
                      <p className="tax-year-update__source-purpose">{brief.summary}<br /><span lang="ur" dir="rtl">{brief.summaryUrdu}</span></p>
                      <span className="tax-year-update__citation">{TAX_KNOWLEDGE_FOUNDATION.citationLabel} · {topic.sourceLabel} · reviewed {topic.reviewedOn}</span>
                      <a className="tax-year-update__archive-link" href={topic.sourceUrl} {...linkProps}>{topic.sourceLabel} ↗</a>
                      <p className="tax-year-update__source-purpose"><strong>Limit:</strong> {brief.boundary}<br /><span lang="ur" dir="rtl"><strong>حد:</strong> {brief.boundaryUrdu}</span></p>
                    </li>;
                  })}
                </ul>
              </section>
              <section id="visual-preparation-journey" className="tax-year-update__learning-card" aria-label="Visual education-to-source preparation journey">
                <h4 className="tax-year-update__source-heading">Visual preparation journey / <span lang="ur" dir="rtl">بصری تیاری کا سفر</span></h4>
                <p>This explains a source-checking sequence, not an IRIS workflow, tax calculation, or filing route. <span lang="ur" dir="rtl">یہ ذریعہ چیک کرنے کی ترتیب بتاتا ہے، آئرس ورک فلو، ٹیکس حساب یا فائلنگ راستہ نہیں۔</span></p>
                <ol className="tax-year-update__journey">
                  {TAX_PREPARATION_VISUAL_JOURNEY.map((step, index) => <li className="tax-year-update__journey-step" key={step.id}><span className="tax-year-update__journey-number">{index + 1}</span><span><strong>{step.label}<br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></strong><p className="tax-year-update__journey-copy">{step.explanation}<br /><span lang="ur" dir="rtl">{step.explanationUrdu}</span></p></span></li>)}
                </ol>
              </section>
              <section id="general-planning-reflection-guide" className="tax-year-update__learning-card" aria-label="Local general planning reflection guide">
                <h4 className="tax-year-update__source-heading">General planning reflection / <span lang="ur" dir="rtl">عمومی منصوبہ بندی پر غور</span></h4>
                <p>Choose only a broad, non-personal reflection. This selection stays on this page and is not sent or saved. <span lang="ur" dir="rtl">صرف عمومی، غیر ذاتی غور منتخب کریں۔ یہ انتخاب اسی صفحے میں رہتا ہے، نہ بھیجا اور نہ محفوظ کیا جاتا ہے۔</span></p>
                <select className="tax-year-update__select" aria-label="Choose a general planning reflection" value={planningReflectionId} onChange={(event) => setPlanningReflectionId(event.target.value)}>
                  {TAX_PLANNING_REFLECTIONS.map((reflection) => <option key={reflection.id} value={reflection.id}>{reflection.title} — {reflection.titleUrdu}</option>)}
                </select>
                <p><strong>Reflection:</strong> {activePlanningReflection.reflection}<br /><span lang="ur" dir="rtl"><strong>غور:</strong> {activePlanningReflection.reflectionUrdu}</span></p>
                <a className="tax-year-update__archive-link" href={activePlanningTopic.sourceUrl} {...linkProps}>{activePlanningTopic.sourceLabel} ↗</a>
                <p><strong>Limit:</strong> {activePlanningReflection.boundary}<br /><span lang="ur" dir="rtl"><strong>حد:</strong> {activePlanningReflection.boundaryUrdu}</span></p>
              </section>
            </section>
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setSourceUpdateCentreOpen((open) => !open)} aria-expanded={sourceUpdateCentreOpen} aria-controls="official-source-update-centre">
              {sourceUpdateCentreOpen ? "Hide" : "Open"} reviewed official-source update centre · <span lang="ur" dir="rtl">جائزہ شدہ سرکاری ذرائع اپڈیٹ سینٹر</span>
            </button>
            {sourceUpdateCentreOpen && (
              <section id="official-source-update-centre" className="tax-year-update__source-map" aria-label="Reviewed official-source update centre">
                <h3 className="tax-year-update__source-heading">{OFFICIAL_SOURCE_UPDATE_CENTRE.title}<br /><span lang="ur" dir="rtl">{OFFICIAL_SOURCE_UPDATE_CENTRE.titleUrdu}</span></h3>
                <p className="tax-year-update__source-copy"><strong>Reviewed {OFFICIAL_SOURCE_UPDATE_CENTRE.reviewedOn} · reviewed guidance, not a live FBR feed.</strong><br />{OFFICIAL_SOURCE_UPDATE_CENTRE.limitation}</p>
                <p className="tax-year-update__source-copy" lang="ur" dir="rtl"><strong>جائزہ: {OFFICIAL_SOURCE_UPDATE_CENTRE.reviewedOn} · جائزہ شدہ رہنمائی، لائیو ایف بی آر فیڈ نہیں۔</strong><br />{OFFICIAL_SOURCE_UPDATE_CENTRE.limitationUrdu}</p>
                <ul className="tax-year-update__source-list">
                  {OFFICIAL_SOURCE_UPDATE_CENTRE.sources.map((source) => (
                    <li className="tax-year-update__source-item" key={source.id}>
                      <span className="tax-year-update__source-title">{source.title}<br /><span lang="ur" dir="rtl">{source.titleUrdu}</span></span>
                      <p className="tax-year-update__source-purpose">{source.purpose}<br /><span lang="ur" dir="rtl">{source.purposeUrdu}</span></p>
                      <a className="tax-year-update__archive-link" href={source.sourceUrl} {...linkProps}>{source.sourceLabel} ↗</a>
                    </li>
                  ))}
                </ul>
                <a className="tax-year-update__archive-link" href={OFFICIAL_SOURCE_UPDATE_CENTRE.currentFbrUpdatesUrl} {...linkProps}>Check FBR’s current website directly ↗</a>
              </section>
            )}
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setSourceChangeLogOpen((open) => !open)} aria-expanded={sourceChangeLogOpen} aria-controls="manual-source-change-log">
              {sourceChangeLogOpen ? "Hide" : "Open"} manual source-catalogue change log · <span lang="ur" dir="rtl">دستی سورس کیٹلاگ تبدیلی لاگ</span>
            </button>
            {sourceChangeLogOpen && (
              <section id="manual-source-change-log" className="tax-year-update__source-map" aria-label="Manual reviewed-source catalogue change log">
                <h3 className="tax-year-update__source-heading">{REVIEWED_SOURCE_CHANGE_LOG.title}<br /><span lang="ur" dir="rtl">{REVIEWED_SOURCE_CHANGE_LOG.titleUrdu}</span></h3>
                <p className="tax-year-update__source-copy"><strong>Manual catalogue log; not a live FBR feed or automated monitor.</strong><br />Reviewed {REVIEWED_SOURCE_CHANGE_LOG.reviewedOn}. {REVIEWED_SOURCE_CHANGE_LOG.limitation}</p>
                <p className="tax-year-update__source-copy" lang="ur" dir="rtl"><strong>دستی کیٹلاگ لاگ؛ لائیو ایف بی آر فیڈ یا خودکار مانیٹر نہیں۔</strong><br />جائزہ: {REVIEWED_SOURCE_CHANGE_LOG.reviewedOn}۔ {REVIEWED_SOURCE_CHANGE_LOG.limitationUrdu}</p>
                <ol className="tax-year-update__source-list">
                  {REVIEWED_SOURCE_CHANGE_LOG.entries.map((entry) => (
                    <li className="tax-year-update__source-item" key={entry.id}>
                      <time className="tax-year-update__archive-date" dateTime={entry.dateIso}>{entry.displayDate} · {entry.statusLabel}<br /><span lang="ur" dir="rtl">{entry.statusLabelUrdu}</span></time>
                      <span className="tax-year-update__source-title">{entry.title}<br /><span lang="ur" dir="rtl">{entry.titleUrdu}</span></span>
                      <p className="tax-year-update__source-purpose">{entry.summary}<br /><span lang="ur" dir="rtl">{entry.summaryUrdu}</span></p>
                      <p className="tax-year-update__source-purpose"><strong>Scope:</strong> {entry.scope}<br /><span lang="ur" dir="rtl"><strong>دائرہ:</strong> {entry.scopeUrdu}</span></p>
                      <a className="tax-year-update__archive-link" href={entry.sourceUrl} {...linkProps}>{entry.sourceLabel} ↗</a>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setManualSourceReviewWorkflowOpen((open) => !open)} aria-expanded={manualSourceReviewWorkflowOpen} aria-controls="manual-source-review-workflow">
              <span lang="ur" dir="rtl">آئندہ دستی سورس جائزہ ورک فلو کھولیں</span> · {manualSourceReviewWorkflowOpen ? "Hide" : "Open"} future manual source-review workflow
            </button>
            {manualSourceReviewWorkflowOpen && (
              <section id="manual-source-review-workflow" className="tax-year-update__source-map" aria-label="Future manual reviewed-source workflow">
                <h3 className="tax-year-update__source-heading"><span lang="ur" dir="rtl">{MANUAL_SOURCE_REVIEW_WORKFLOW.titleUrdu}</span><br />{MANUAL_SOURCE_REVIEW_WORKFLOW.title}</h3>
                <p className="tax-year-update__source-copy" lang="ur" dir="rtl"><strong>اگلا دستی جائزہ: <time dateTime={MANUAL_SOURCE_REVIEW_WORKFLOW.nextReviewDateIso}>{MANUAL_SOURCE_REVIEW_WORKFLOW.nextReviewDisplayDate}</time>۔</strong><br />{MANUAL_SOURCE_REVIEW_WORKFLOW.cadenceLabelUrdu}</p>
                <p className="tax-year-update__source-copy"><strong>Next manual review: <time dateTime={MANUAL_SOURCE_REVIEW_WORKFLOW.nextReviewDateIso}>{MANUAL_SOURCE_REVIEW_WORKFLOW.nextReviewDisplayDate}</time>.</strong><br />{MANUAL_SOURCE_REVIEW_WORKFLOW.cadenceLabel}</p>
                <p className="tax-year-update__source-copy" lang="ur" dir="rtl">{MANUAL_SOURCE_REVIEW_WORKFLOW.limitationUrdu}</p>
                <p className="tax-year-update__source-copy">{MANUAL_SOURCE_REVIEW_WORKFLOW.limitation}</p>
                <ol className="tax-year-update__source-list">
                  {MANUAL_SOURCE_REVIEW_WORKFLOW.steps.map((step) => <li className="tax-year-update__source-item" key={step.id}><span className="tax-year-update__source-title"><span lang="ur" dir="rtl">{step.labelUrdu}</span><br />{step.label}</span></li>)}
                </ol>
                <span className="tax-year-update__connection-label"><span lang="ur" dir="rtl">صرف یہ چار طے شدہ سرکاری ذرائع</span> / Only these four fixed official destinations</span>
                <ul className="tax-year-update__source-list">
                  {MANUAL_SOURCE_REVIEW_WORKFLOW.destinations.map((destination) => <li className="tax-year-update__source-item" key={destination.id}><span className="tax-year-update__source-title"><span lang="ur" dir="rtl">{destination.titleUrdu}</span><br />{destination.title}</span><a className="tax-year-update__archive-link" href={destination.sourceUrl} {...linkProps}>{destination.sourceLabel} ↗</a></li>)}
                </ul>
              </section>
            )}
            <button className="tax-year-update__archive-toggle" type="button" onClick={() => setEscalationGuidanceCardsOpen((open) => !open)} aria-expanded={escalationGuidanceCardsOpen} aria-controls="urdu-first-escalation-guidance-cards">
              <span lang="ur" dir="rtl">اردو-اوّل رہنمائی کارڈ کھولیں</span> · {escalationGuidanceCardsOpen ? "Hide" : "Open"} Urdu-first escalation guidance cards
            </button>
            {escalationGuidanceCardsOpen && (
              <section id="urdu-first-escalation-guidance-cards" className="tax-year-update__source-map" aria-label="Urdu-first escalation guidance cards">
                <h3 className="tax-year-update__source-heading"><span lang="ur" dir="rtl">غیر واضح یا پیچیدہ معاملے میں عمومی رہنمائی</span><br />General guidance for unclear or complex matters</h3>
                <p className="tax-year-update__source-copy" lang="ur" dir="rtl">یہ کارڈ صرف عمومی اگلا قدم بتاتے ہیں۔ کوئی تفصیل، دستاویز، شناخت، رقم، پاس ورڈ یا نوٹس متن درج نہ کریں۔</p>
                <p className="tax-year-update__source-copy">These cards show only a broad next step. Do not enter details, documents, identity, amounts, passwords, or notice text.</p>
                <ul className="tax-year-update__source-list">
                  {URDU_FIRST_ESCALATION_GUIDANCE_CARDS.map((card) => (
                    <li className="tax-year-update__source-item" key={card.id}>
                      <span className="tax-year-update__source-title"><span lang="ur" dir="rtl">{card.titleUrdu}</span><br />{card.title}</span>
                      <p className="tax-year-update__source-purpose"><span lang="ur" dir="rtl">{card.guidanceUrdu}</span><br />{card.guidance}</p>
                      <p className="tax-year-update__source-purpose"><strong lang="ur" dir="rtl">حد:</strong> <span lang="ur" dir="rtl">{card.boundaryUrdu}</span><br /><strong>Limit:</strong> {card.boundary}</p>
                      <a className="tax-year-update__archive-link" href={card.sourceUrl} {...linkProps}>{card.sourceLabel} ↗</a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
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
