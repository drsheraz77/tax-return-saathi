import { useEffect, useMemo, useState } from "react";
import { AI_ANSWER_EVALUATION_STEPS, CALCULATION_EXPLANATION_MAP, COMPLEX_SITUATION_PREPARATION_PATHS, FILING_READINESS_STEPS, filterLargeBusinessIndustryResources, FREELANCER_FAQ, FREELANCER_PRE_FILING_CHECKLIST, getFilingReadinessSummary, getOfficialResourceCategoryReview, getPreSubmissionErrorPreventionSummary, getSourceAwareQuestionPlan, getTemporaryGuidanceSummary, IRIS_FAQ, IRIS_NAVIGATION_WALKTHROUGH, LARGE_BUSINESS_INTERNAL_ROLE_CHECKLIST, LARGE_BUSINESS_PREPARATION_FILTERS, LARGE_BUSINESS_QUALIFIED_ESCALATION, OFFICIAL_RESOURCE_HUB, POST_SUBMISSION_CONTINUITY_STEPS, PRE_FILING_CHECKLIST, PRE_SUBMISSION_ERROR_PREVENTION_STEPS, RETURN_WEALTH_RELATIONSHIP_STEPS, searchFreelancerFaq, searchIrisFaq, SOURCE_AWARE_QUESTION_PLANS } from "./officialResourceHub.js";
import { trpc } from "./lib/trpc";
import { getWealthReadinessPrintRows, getWealthStatementReadinessSummary, WEALTH_READINESS_OPTIONS, WEALTH_STATEMENT_PREPARATION_STEPS } from "./wealthStatementPreparation.js";
import { buildNonSensitiveReadinessSummary, getPreFilingTimelineSummary, PRE_FILING_TIMELINE_STEPS, TIMELINE_STATUS_OPTIONS } from "./preFilingTimelinePlanner.js";

const linkProps = { target: "_blank", rel: "noreferrer" };
const PILOT_FEEDBACK_EMAIL = "driris@gmail.com";
const PILOT_FEEDBACK_EMAIL_HREF = "mailto:driris@gmail.com?subject=Tax%20Return%20Saathi%20pilot%20feedback%20%E2%80%94%20%5Bcategory%5D";

export default function OfficialResourceHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("filing");
  const [faqQuery, setFaqQuery] = useState("");
  const [freelancerFaqQuery, setFreelancerFaqQuery] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [showFreelancerChecklist, setShowFreelancerChecklist] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [largeBusinessRoleItems, setLargeBusinessRoleItems] = useState({});
  const [largeBusinessFilter, setLargeBusinessFilter] = useState("all");
  const [irisWalkthroughOpen, setIrisWalkthroughOpen] = useState(false);
  const [irisWalkthroughItems, setIrisWalkthroughItems] = useState({});
  const [preSubmissionChecklistOpen, setPreSubmissionChecklistOpen] = useState(false);
  const [preSubmissionItems, setPreSubmissionItems] = useState({});
  const [complexSituationOpen, setComplexSituationOpen] = useState(false);
  const [complexSituationItems, setComplexSituationItems] = useState({});
  const [returnWealthOpen, setReturnWealthOpen] = useState(false);
  const [returnWealthItems, setReturnWealthItems] = useState({});
  const [postSubmissionOpen, setPostSubmissionOpen] = useState(false);
  const [postSubmissionItems, setPostSubmissionItems] = useState({});
  const [questionPlannerOpen, setQuestionPlannerOpen] = useState(false);
  const [questionPlanId, setQuestionPlanId] = useState(SOURCE_AWARE_QUESTION_PLANS[0].id);
  const [calculationMapOpen, setCalculationMapOpen] = useState(false);
  const [answerEvaluationOpen, setAnswerEvaluationOpen] = useState(false);
  const [answerEvaluationItems, setAnswerEvaluationItems] = useState({});
  const [filingReadinessItems, setFilingReadinessItems] = useState({});
  const [wealthPreparationOpen, setWealthPreparationOpen] = useState(false);
  const [wealthReadinessItems, setWealthReadinessItems] = useState({});
  const [timelineItems, setTimelineItems] = useState({});
  const [feedbackCategory, setFeedbackCategory] = useState("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [feedbackAcknowledged, setFeedbackAcknowledged] = useState(false);
  const [showDataDeletionConfirm, setShowDataDeletionConfirm] = useState(false);
  const [privacyNotice, setPrivacyNotice] = useState("");
  const matchingFaq = useMemo(() => searchIrisFaq(faqQuery), [faqQuery]);
  const matchingFreelancerFaq = useMemo(() => searchFreelancerFaq(freelancerFaqQuery), [freelancerFaqQuery]);
  const filteredLargeBusinessResources = useMemo(() => filterLargeBusinessIndustryResources(largeBusinessFilter), [largeBusinessFilter]);
  const filingReadiness = useMemo(() => getFilingReadinessSummary(filingReadinessItems), [filingReadinessItems]);
  const preSubmissionReadiness = useMemo(() => getPreSubmissionErrorPreventionSummary(preSubmissionItems), [preSubmissionItems]);
  const complexSituationReadiness = useMemo(() => getTemporaryGuidanceSummary(complexSituationItems, COMPLEX_SITUATION_PREPARATION_PATHS), [complexSituationItems]);
  const returnWealthReadiness = useMemo(() => getTemporaryGuidanceSummary(returnWealthItems, RETURN_WEALTH_RELATIONSHIP_STEPS), [returnWealthItems]);
  const postSubmissionReadiness = useMemo(() => getTemporaryGuidanceSummary(postSubmissionItems, POST_SUBMISSION_CONTINUITY_STEPS), [postSubmissionItems]);
  const answerEvaluationReadiness = useMemo(() => getTemporaryGuidanceSummary(answerEvaluationItems, AI_ANSWER_EVALUATION_STEPS), [answerEvaluationItems]);
  const activeQuestionPlan = getSourceAwareQuestionPlan(questionPlanId);
  const wealthReadiness = useMemo(() => getWealthStatementReadinessSummary(wealthReadinessItems), [wealthReadinessItems]);
  const timelineReadiness = useMemo(() => getPreFilingTimelineSummary(timelineItems), [timelineItems]);
  const { data: accountUser, isLoading: isAccountLoading } = trpc.auth.me.useQuery();
  const privacyUtils = trpc.useUtils();
  const accountPrivacyQuery = trpc.privacy.summary.useQuery(undefined, { enabled: Boolean(accountUser), retry: false });
  const accountDataDeletionMutation = trpc.privacy.deleteAccountHeldData.useMutation({
    onSuccess: () => {
      privacyUtils.privacy.summary.invalidate();
      privacyUtils.checklistDraft.get.invalidate();
      setShowDataDeletionConfirm(false);
      setPrivacyNotice("Your account-held checklist draft data was deleted.");
    },
    onError: (error) => setPrivacyNotice(error.message),
  });
  const feedbackMutation = trpc.feedback.submit.useMutation({
    onSuccess: (result) => {
      setFeedbackMessage("");
      setFeedbackNotice(result.acknowledgement);
      setFeedbackAcknowledged(true);
    },
    onError: (error) => setFeedbackNotice(error.message),
  });

  useEffect(() => {
    function openPilotFeedback() {
      setIsOpen(true);
      window.requestAnimationFrame(() => document.getElementById("pilot-feedback-form")?.focus());
    }
    function openResourceHub() {
      setIsOpen(true);
    }
    function closeResourceHub() {
      setIsOpen(false);
    }

    window.addEventListener("tax-return-saathi:open-pilot-feedback", openPilotFeedback);
    window.addEventListener("tax-return-saathi:open-resources", openResourceHub);
    window.addEventListener("tax-return-saathi:close-supplemental-panels", closeResourceHub);
    return () => {
      window.removeEventListener("tax-return-saathi:open-pilot-feedback", openPilotFeedback);
      window.removeEventListener("tax-return-saathi:open-resources", openResourceHub);
      window.removeEventListener("tax-return-saathi:close-supplemental-panels", closeResourceHub);
    };
  }, []);

  function toggleChecklistItem(itemId) {
    setCheckedItems((current) => ({ ...current, [itemId]: !current[itemId] }));
  }

  function downloadNonSensitiveReadinessSummary() {
    const content = buildNonSensitiveReadinessSummary({
      timelineStatus: timelineItems,
      wealthReadiness: wealthReadinessItems,
    });
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tax-return-saathi-readiness-summary.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
        .official-resource-hub__review-badge { display: inline-block; margin: 2px 0 5px; border: 1px solid #c8b264; border-radius: 999px; background: #f7f1d9; color: #4d513c; padding: 4px 7px; font-size: 10px; font-weight: 700; line-height: 1.3; }
        .official-resource-hub__industry-filter { margin: 10px 0; border: 1px solid #d9c975; border-radius: 10px; background: #f7f1d9; padding: 10px; }
        .official-resource-hub__industry-filter label { display: block; color: #173b31; font-size: 12px; font-weight: 700; }
        .official-resource-hub__industry-filter-note { margin: 6px 0 0; color: #625f4e; font-size: 11px; }
        .official-resource-hub__industry-checklist { margin-top: 12px; border: 1px solid #d9c975; border-radius: 10px; background: #fffef9; padding: 11px; }
        .official-resource-hub__industry-checklist h3 { margin: 0 0 6px; color: #0B3D2E; font-size: 14px; }
        .official-resource-hub__industry-escalation { margin-top: 12px; border: 1px solid #cfad71; border-left: 4px solid #a6512d; border-radius: 10px; background: #fff7ed; padding: 11px; }
        .official-resource-hub__industry-escalation h3 { margin: 0 0 6px; color: #6a321c; font-size: 14px; }
        .official-resource-hub__industry-support-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 9px; margin-top: 7px; }
        .official-resource-hub__industry-support-review { color: #625f4e; font-size: 11px; line-height: 1.45; }
        .official-resource-hub__link { color: #075c48; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
        .official-resource-hub__link:focus-visible { outline: 3px solid rgba(202,165,24,.48); outline-offset: 3px; border-radius: 3px; }
        .official-resource-hub__quick-nav { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 12px; padding: 10px; border: 1px solid #d9c975; border-radius: 10px; background: #f7f1d9; }
        .official-resource-hub__quick-nav-title { flex-basis: 100%; color: #304d43; font-size: 11px; font-weight: 700; }
        .official-resource-hub__quick-link { border: 1px solid #a89242; border-radius: 999px; background: #fffdf5; color: #075c48; padding: 5px 8px; font: 700 11px/1.2 inherit; text-decoration: none; }
        .official-resource-hub__quick-link:hover, .official-resource-hub__quick-link:focus-visible { background: #e9dfb7; outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .official-resource-hub__tools { border-top: 1px solid #e5dbb3; padding-top: 13px; }
        .official-resource-hub__tool-title { margin: 0 0 6px; color: #0B3D2E; font-size: 15px; }
        .official-resource-hub__tool-copy { margin: 0 0 9px; color: #595844; font-size: 12px; }
        .official-resource-hub__search, .official-resource-hub__select { box-sizing: border-box; width: 100%; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 9px 10px; font: 14px/1.3 inherit; }
        .official-resource-hub__search:focus-visible, .official-resource-hub__select:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
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
        .official-resource-hub__support { border-top: 1px solid #e5dbb3; margin-top: 14px; padding-top: 13px; }
        .official-resource-hub__support-title { margin: 0 0 7px; color: #0B3D2E; font-size: 15px; }
        .official-resource-hub__support-card { margin-top: 9px; border: 1px solid #e4d9a9; border-radius: 10px; background: #fffef9; padding: 10px; }
        .official-resource-hub__support-card h4 { margin: 0 0 5px; color: #173b31; font-size: 13px; }
        .official-resource-hub__support-card p { margin: 5px 0; color: #4d513c; font-size: 12px; }
        .official-resource-hub__feedback-form { display: grid; gap: 8px; margin-top: 8px; }
        .official-resource-hub__feedback-form label { color: #173b31; font-size: 12px; font-weight: 700; }
        .official-resource-hub__feedback-form select, .official-resource-hub__feedback-form textarea { box-sizing: border-box; width: 100%; border: 1px solid #b7ab79; border-radius: 8px; background: #fffef9; color: #173b31; padding: 8px 9px; font: 13px/1.35 inherit; }
        .official-resource-hub__feedback-form textarea { min-height: 86px; resize: vertical; }
        .official-resource-hub__feedback-form select:focus-visible, .official-resource-hub__feedback-form textarea:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .official-resource-hub__feedback-form button { justify-self: start; border: 1px solid #0B3D2E; border-radius: 8px; background: #0B3D2E; color: #fffdf2; cursor: pointer; padding: 8px 10px; font: 700 12px/1.15 inherit; }
        .official-resource-hub__feedback-form button:disabled { cursor: not-allowed; opacity: .5; }
        .official-resource-hub__feedback-note { color: #625f4e !important; font-size: 11px !important; }
        .official-resource-hub__feedback-status { color: #075c48 !important; font-weight: 700; }
        .official-resource-hub__feedback-shortcut { margin-top: 10px; border-left: 3px solid #b7ab79; border-radius: 0 8px 8px 0; background: #fffdf2; padding: 10px; }
        .official-resource-hub__feedback-shortcut button { border: 1px solid #0B3D2E; border-radius: 8px; background: #fffdf2; color: #0B3D2E; cursor: pointer; padding: 8px 10px; font: 700 12px/1.2 inherit; }
        .official-resource-hub__feedback-shortcut button:focus-visible { outline: 3px solid rgba(202,165,24,.36); outline-offset: 2px; }
        .official-resource-hub__feedback-shortcut button:active { transform: scale(.97); }
        .official-resource-hub__acknowledgement { border: 1px solid #9fbd9a; border-radius: 9px; background: #edf7eb; padding: 10px; color: #164b2c; }
        .official-resource-hub__acknowledgement h5 { margin: 0 0 5px; font-size: 13px; }
        .official-resource-hub__acknowledgement p { margin: 4px 0; }
        .official-resource-hub__acknowledgement button, .official-resource-hub__privacy-actions button { border: 1px solid #0B3D2E; border-radius: 8px; background: #fffef9; color: #0B3D2E; cursor: pointer; padding: 7px 9px; font: 700 12px/1.2 inherit; }
        .official-resource-hub__privacy-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 9px; }
        .official-resource-hub__danger-button { border-color: #8a2c22 !important; background: #fff7f5 !important; color: #7a231b !important; }
        .official-resource-hub__confirm { margin-top: 10px; border: 1px solid #b98554; border-radius: 9px; background: #fff4e8; padding: 10px; }
        .official-resource-hub__confirm h5 { margin: 0 0 5px; color: #6e311e; font-size: 13px; }
        .official-resource-hub__confirm p { margin: 5px 0; }
        @media (max-width: 520px) { .official-resource-hub { left: 12px; bottom: 126px; } .official-resource-hub__panel { max-height: calc(100vh - 156px); } .official-resource-hub__toggle { font-size: 13px; } }
        @media (prefers-reduced-motion: reduce) { .official-resource-hub *, .official-resource-hub *::before, .official-resource-hub *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; } }
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
            <nav className="official-resource-hub__quick-nav" aria-label="Resource hub quick navigation">
              <span className="official-resource-hub__quick-nav-title">Quick navigation · <span lang="ur" dir="rtl">فوری نیویگیشن</span></span>
              <a className="official-resource-hub__quick-link" href="#official-resource-filing" onClick={() => setExpandedSection("filing")}>Official filing sources</a>
              <a className="official-resource-hub__quick-link" href="#pre-submission-error-prevention-title">Pre-submission check</a>
              <a className="official-resource-hub__quick-link" href="#source-aware-question-planner-title">Source-aware questions</a>
              <a className="official-resource-hub__quick-link" href="#support-title">Privacy & official help</a>
            </nav>
            <section className="official-resource-hub__support-card" aria-label="Official source freshness and verification scope">
              <h4>Official source check · reviewed {OFFICIAL_RESOURCE_HUB.reviewedOn}<br /><span lang="ur" dir="rtl">سرکاری ذرائع کا جائزہ · {OFFICIAL_RESOURCE_HUB.reviewedOn}</span></h4>
              <p>These links are checked as official starting points for preparation. They do not confirm current eligibility, deadlines, amounts, portal acceptance, or your tax position.</p>
              <p lang="ur" dir="rtl">یہ لنکس تیاری کے لیے سرکاری ابتدائی ذرائع کے طور پر دیکھے گئے ہیں۔ یہ موجودہ اہلیت، تاریخوں، رقوم، پورٹل قبولیت یا آپ کی ٹیکس پوزیشن کی تصدیق نہیں کرتے۔</p>
              <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158" {...linkProps}>Verify current FBR filing guidance ↗</a>
            </section>
            {OFFICIAL_RESOURCE_HUB.sections.map((section) => {
              const isExpanded = expandedSection === section.id;
              const isIndustrySection = section.id === "large-business-industry";
              const panelId = `official-resource-${section.id}-content`;
              const categoryReview = getOfficialResourceCategoryReview(section);
              const visibleResources = isIndustrySection ? filteredLargeBusinessResources : section.resources;
              return (
                <section id={`official-resource-${section.id}`} className="official-resource-hub__accordion" key={section.id}>
                  <button className="official-resource-hub__section-toggle" type="button" onClick={() => setExpandedSection((current) => current === section.id ? "" : section.id)} aria-expanded={isExpanded} aria-controls={panelId}>
                    <span>{section.title}<br /><span lang="ur" dir="rtl">{section.titleUrdu}</span></span>
                    <span className="official-resource-hub__chevron" aria-hidden="true">{isExpanded ? "−" : "+"}</span>
                  </button>
                  {isExpanded && (
                    <div id={panelId} className="official-resource-hub__section-content">
                      <p className="official-resource-hub__intro">{section.introduction}</p>
                      <p className="official-resource-hub__intro" lang="ur" dir="rtl">{section.introductionUrdu}</p>
                      <p className="official-resource-hub__print-meta"><strong>Category source review · {categoryReview.reviewedOn}</strong><br />{categoryReview.scope}<br /><span lang="ur" dir="rtl">زمرہ وار ماخذ جائزہ · {categoryReview.reviewedOn}<br />{categoryReview.scopeUrdu}</span></p>
                      {isIndustrySection && (
                        <div className="official-resource-hub__industry-filter">
                          <label htmlFor="large-business-resource-filter">Filter industry cards locally / <span lang="ur" dir="rtl">صنعتی کارڈز مقامی طور پر فلٹر کریں</span></label>
                          <select id="large-business-resource-filter" className="official-resource-hub__select" value={largeBusinessFilter} onChange={(event) => setLargeBusinessFilter(event.target.value)}>
                            {LARGE_BUSINESS_PREPARATION_FILTERS.map((filter) => <option key={filter.id} value={filter.id}>{filter.label} — {filter.labelUrdu}</option>)}
                          </select>
                          <p className="official-resource-hub__industry-filter-note">This temporary filter is not saved and does not decide whether a business must register or file. <span lang="ur" dir="rtl">یہ عارضی فلٹر محفوظ نہیں ہوتا اور یہ فیصلہ نہیں کرتا کہ کاروبار کو رجسٹر یا فائل کرنا ہے۔</span></p>
                        </div>
                      )}
                      <ul className="official-resource-hub__list">
                        {visibleResources.map((resource) => (
                          <li className="official-resource-hub__item" key={resource.id}>
                            <span className="official-resource-hub__item-title">{resource.title}</span>
                            <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{resource.titleUrdu}</span>
                            {isIndustrySection && <span className="official-resource-hub__review-badge">Industry source review · {categoryReview.reviewedOn} · manual, not live<br /><span lang="ur" dir="rtl">صنعتی ماخذ جائزہ · {categoryReview.reviewedOn} · دستی، براہِ راست نہیں</span></span>}
                            <p className="official-resource-hub__item-description">{resource.description}</p>
                            <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{resource.descriptionUrdu}</p>
                            <a className="official-resource-hub__link" href={resource.url} {...linkProps}>{resource.sourceLabel} ↗</a>
                          </li>
                        ))}
                      </ul>
                      {isIndustrySection && (
                        <section id="large-business-internal-role-checklist" className="official-resource-hub__industry-checklist" aria-labelledby="large-business-internal-role-checklist-title">
                          <h3 id="large-business-internal-role-checklist-title">Internal role preparation checklist<br /><span lang="ur" dir="rtl">اندرونی کردار تیاری چیک لسٹ</span></h3>
                          <p className="official-resource-hub__tool-copy">Temporary on-screen prompts for broad team preparation only. No names, company information, records, figures, documents, or filing data are requested, stored, or sent.</p>
                          <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">یہ صرف عمومی ٹیم تیاری کے عارضی آن اسکرین نکات ہیں۔ نام، کمپنی معلومات، ریکارڈ، اعداد، دستاویزات یا فائلنگ ڈیٹا نہ مانگا، محفوظ کیا یا بھیجا جاتا ہے۔</p>
                          <ul className="official-resource-hub__print-list">
                            {LARGE_BUSINESS_INTERNAL_ROLE_CHECKLIST.map((item) => (
                              <li key={item.id}>
                                <label className="official-resource-hub__check-label">
                                  <input type="checkbox" checked={Boolean(largeBusinessRoleItems[item.id])} onChange={() => setLargeBusinessRoleItems((current) => ({ ...current, [item.id]: !current[item.id] }))} />
                                  <span>{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span>
                                </label>
                              </li>
                            ))}
                          </ul>
                          <button className="official-resource-hub__print-action" type="button" onClick={() => setLargeBusinessRoleItems({})}>Clear temporary role marks / <span lang="ur" dir="rtl">عارضی کردار نشانات صاف کریں</span></button>
                          <p className="official-resource-hub__footer">These marks disappear on refresh and do not assign legal responsibility, confirm a filing requirement, or determine an FBR outcome.</p>
                        </section>
                      )}
                      {isIndustrySection && (
                        <section id={LARGE_BUSINESS_QUALIFIED_ESCALATION.id} className="official-resource-hub__industry-escalation" aria-labelledby="large-business-qualified-escalation-title">
                          <h3 id="large-business-qualified-escalation-title">{LARGE_BUSINESS_QUALIFIED_ESCALATION.title}<br /><span lang="ur" dir="rtl">{LARGE_BUSINESS_QUALIFIED_ESCALATION.titleUrdu}</span></h3>
                          <p className="official-resource-hub__tool-copy">{LARGE_BUSINESS_QUALIFIED_ESCALATION.description}</p>
                          <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">{LARGE_BUSINESS_QUALIFIED_ESCALATION.descriptionUrdu}</p>
                          <div className="official-resource-hub__industry-support-meta">
                            <a className="official-resource-hub__link" href={LARGE_BUSINESS_QUALIFIED_ESCALATION.url} {...linkProps}>{LARGE_BUSINESS_QUALIFIED_ESCALATION.sourceLabel} ↗</a>
                            <span className="official-resource-hub__industry-support-review">{LARGE_BUSINESS_QUALIFIED_ESCALATION.supportReviewNote}<br /><span lang="ur" dir="rtl">{LARGE_BUSINESS_QUALIFIED_ESCALATION.supportReviewNoteUrdu}</span></span>
                          </div>
                          <p className="official-resource-hub__footer">{LARGE_BUSINESS_QUALIFIED_ESCALATION.boundary}</p>
                          <p className="official-resource-hub__footer" lang="ur" dir="rtl">{LARGE_BUSINESS_QUALIFIED_ESCALATION.boundaryUrdu}</p>
                        </section>
                      )}
                    </div>
                  )}
                </section>
              );
            })}

            <section className="official-resource-hub__support" aria-labelledby="support-title">
              <h3 id="support-title" className="official-resource-hub__support-title">Feedback, privacy & contact<br /><span lang="ur" dir="rtl">رائے، رازداری اور رابطہ</span></h3>
              <div className="official-resource-hub__support-card">
                <h4>Privacy & data use <span lang="ur" dir="rtl">رازداری اور ڈیٹا کا استعمال</span></h4>
                <p>Browser save stays in this browser. If you choose account save after signing in, we store only the checklist’s fixed high-level choices and progress marks so you can resume later. You can delete that account draft at any time.</p>
                <p lang="ur" dir="rtl">براؤزر سیو اسی براؤزر میں رہتا ہے۔ اگر آپ سائن اِن کے بعد اکاؤنٹ سیو منتخب کریں تو صرف چیک لسٹ کے طے شدہ عمومی انتخاب اور پیش رفت محفوظ ہوتی ہے تاکہ آپ بعد میں دوبارہ کام کر سکیں۔ آپ اکاؤنٹ ڈرافٹ کسی بھی وقت حذف کر سکتے ہیں۔</p>
                <p>We do not ask for or store tax amounts, CNIC, NTN, passwords, bank or account details, documents, or uploads in these draft tools. Feedback is voluntary, is not linked to an account, and is used only to review product feedback. Anonymous feedback is scheduled for deletion 30 days after submission. Do not include sensitive information.</p>
                <div className="official-resource-hub__privacy-actions" aria-label="Account data privacy controls">
                  {!accountUser && <button type="button" onClick={() => window.location.assign("/api/oauth/login")} disabled={isAccountLoading}>Sign in to manage account-held data</button>}
                  {accountUser && <button className="official-resource-hub__danger-button" type="button" onClick={() => { setPrivacyNotice(""); setShowDataDeletionConfirm(true); }}>Delete my account-held data</button>}
                </div>
                {accountUser && <p className="official-resource-hub__feedback-note">{accountPrivacyQuery.isLoading ? "Checking account-held data…" : accountPrivacyQuery.data?.hasChecklistDraft ? "One high-level checklist draft is currently stored in your account." : "No checklist draft is currently stored in your account."} Feedback cannot be included because it is intentionally anonymous and not linked to your account.</p>}
                {privacyNotice && <p role="status" className="official-resource-hub__feedback-status">{privacyNotice}</p>}
                {showDataDeletionConfirm && (
                  <section className="official-resource-hub__confirm" role="alertdialog" aria-labelledby="account-data-delete-title" aria-describedby="account-data-delete-copy">
                    <h5 id="account-data-delete-title">Delete your account-held Tax Return Saathi data?</h5>
                    <p id="account-data-delete-copy">This permanently deletes only your high-level checklist draft from this site. It does not delete your Manus sign-in profile, browser-local drafts, or anonymous feedback.</p>
                    <div className="official-resource-hub__privacy-actions">
                      <button type="button" onClick={() => setShowDataDeletionConfirm(false)} disabled={accountDataDeletionMutation.isPending}>Cancel</button>
                      <button className="official-resource-hub__danger-button" type="button" onClick={() => accountDataDeletionMutation.mutate({ confirmation: "DELETE_MY_DRAFT_DATA" })} disabled={accountDataDeletionMutation.isPending}>{accountDataDeletionMutation.isPending ? "Deleting…" : "Permanently delete checklist data"}</button>
                    </div>
                  </section>
                )}
              </div>
              <div id="pilot-feedback-form" className="official-resource-hub__support-card" tabIndex={-1}>
                <h4>Share feedback <span lang="ur" dir="rtl">اپنی رائے دیں</span></h4>
                <p>Tell us how the tool can be clearer or easier to use. This is not a channel for tax records, personal tax advice, or urgent filing help.</p>
                <p className="official-resource-hub__feedback-note">For optional direct pilot contact, email <a className="official-resource-hub__link" href={PILOT_FEEDBACK_EMAIL_HREF}>{PILOT_FEEDBACK_EMAIL}</a>. The subject includes a neutral <strong>[category]</strong> template; email is not anonymous and is separate from this form, so do not send tax, identity, financial, credential, notice, or document details.</p>
                <p className="official-resource-hub__feedback-note" lang="ur" dir="rtl">آزمائشی ورژن کے بارے میں براہِ راست رابطے کے لیے <a className="official-resource-hub__link" href={PILOT_FEEDBACK_EMAIL_HREF}>{PILOT_FEEDBACK_EMAIL}</a> کو ای میل کر سکتے ہیں۔ موضوع میں غیر حساس <strong>[category]</strong> نمونہ شامل ہے؛ ای میل گمنام نہیں ہوتی اور اس فارم سے الگ ہے، اس لیے ٹیکس، شناختی، مالی، اسناد، نوٹس یا دستاویز کی تفصیل نہ بھیجیں۔</p>
                <div id="report-broken-link-shortcut" className="official-resource-hub__feedback-shortcut">
                  <button type="button" onClick={() => { setFeedbackCategory("technical"); setFeedbackAcknowledged(false); setFeedbackNotice(""); window.requestAnimationFrame(() => document.getElementById("feedback-message")?.focus()); }}>ٹوٹا ہوا لنک رپورٹ کریں / Report a broken link</button>
                  <p className="official-resource-hub__feedback-note" lang="ur" dir="rtl">یہ بٹن گمنام تکنیکی فیڈبیک فارم کھولتا ہے اور حساس تفصیل شامل نہیں کرنی چاہیے۔ لنک، صفحہ یا براؤزر کی کوئی معلومات خودکار طور پر جمع نہیں کی جاتی۔</p>
                  <p className="official-resource-hub__feedback-note">This prepares the anonymous technical-feedback form; do not include sensitive details. No link, page, or browser information is collected automatically.</p>
                </div>
                {!feedbackAcknowledged ? <form className="official-resource-hub__feedback-form" onSubmit={(event) => { event.preventDefault(); setFeedbackNotice(""); feedbackMutation.mutate({ category: feedbackCategory, message: feedbackMessage }); }}>
                  <label htmlFor="feedback-category">Topic</label>
                  <select id="feedback-category" value={feedbackCategory} onChange={(event) => setFeedbackCategory(event.target.value)}>
                    <option value="general">General feedback</option>
                    <option value="usability">Ease of use</option>
                    <option value="content">Educational content</option>
                    <option value="technical">Technical issue</option>
                  </select>
                  <label htmlFor="feedback-message">Your feedback</label>
                  <textarea id="feedback-message" value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} maxLength={1000} minLength={15} required placeholder="Do not include CNIC, NTN, passwords, bank details, or tax records." />
                  <p className="official-resource-hub__feedback-note">No email or account details are requested. Messages containing sensitive details are rejected and accepted anonymous feedback is scheduled for deletion after 30 days.</p>
                  <button type="submit" disabled={feedbackMutation.isPending}>{feedbackMutation.isPending ? "Sending…" : "Send feedback"}</button>
                  {feedbackNotice && <p role="status" className="official-resource-hub__feedback-status">{feedbackNotice}</p>}
                </form> : <section className="official-resource-hub__acknowledgement" role="status" aria-live="polite" aria-label="Feedback acknowledgement">
                  <h5>Feedback received <span lang="ur" dir="rtl">آپ کی رائے موصول ہو گئی</span></h5>
                  <p>{feedbackNotice}</p>
                  <p>Your message is anonymous; this site cannot reply directly. For official tax or IRIS help, use the FBR contact details below.</p>
                  <p>If you need to contact the pilot team directly, you may email <a className="official-resource-hub__link" href={PILOT_FEEDBACK_EMAIL_HREF}>{PILOT_FEEDBACK_EMAIL}</a>; email is not anonymous, and you must not send sensitive details.</p>
                  <button type="button" onClick={() => { setFeedbackAcknowledged(false); setFeedbackNotice(""); }}>Send another feedback message</button>
                </section>}
              </div>
              <div className="official-resource-hub__support-card">
                <h4>Contact & official help <span lang="ur" dir="rtl">رابطہ اور سرکاری مدد</span></h4>
                <p>For this site, use the anonymous feedback form above or optional direct pilot email at <a className="official-resource-hub__link" href={PILOT_FEEDBACK_EMAIL_HREF}>{PILOT_FEEDBACK_EMAIL}</a>. Direct email is not anonymous; do not include sensitive details. Neither route provides individual tax advice. For official tax or IRIS help, contact the FBR Helpline: <strong>051 111 772 772</strong> (international: <strong>+92 51 111 772 772</strong>) or <a className="official-resource-hub__link" href="mailto:helpline@fbr.gov.pk">helpline@fbr.gov.pk</a>. FBR states Monday–Friday, 8:00 AM–11:30 PM.</p>
                <p lang="ur" dir="rtl">اس ویب سائٹ کے لیے اوپر والا گمنام فیڈبیک فارم یا اختیاری براہِ راست آزمائشی ای میل <a className="official-resource-hub__link" href={PILOT_FEEDBACK_EMAIL_HREF}>{PILOT_FEEDBACK_EMAIL}</a> استعمال کریں۔ براہِ راست ای میل گمنام نہیں؛ حساس تفصیل شامل نہ کریں۔ کوئی بھی راستہ انفرادی ٹیکس مشورہ نہیں دیتا۔ سرکاری ٹیکس یا آئرس مدد کے لیے ایف بی آر ہیلپ لائن سے رابطہ کریں۔</p>
                <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/contact-us/142252/173964" {...linkProps}>Official FBR contact page ↗</a>
              </div>
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="iris-navigation-title">
              <h3 id="iris-navigation-title" className="official-resource-hub__tool-title">Guided IRIS navigation walkthrough<br /><span lang="ur" dir="rtl">آئرس نیویگیشن رہنمائی</span></h3>
              <p className="official-resource-hub__tool-copy">A temporary, link-out orientation guide—not a reproduction of IRIS. Portal screens and requirements can change, so use the official links and do not enter credentials into this site.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">یہ ایک عارضی، بیرونی لنکس والی رہنمائی ہے—آئرس کی نقل نہیں۔ پورٹل اسکرینیں اور شرائط بدل سکتی ہیں، اس لیے سرکاری لنکس استعمال کریں اور اس سائٹ میں اسناد درج نہ کریں۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setIrisWalkthroughOpen((open) => !open)} aria-expanded={irisWalkthroughOpen} aria-controls="iris-navigation-walkthrough">{irisWalkthroughOpen ? "Hide IRIS walkthrough" : "Open guided IRIS walkthrough"}</button>
              {irisWalkthroughOpen && (
                <section id="iris-navigation-walkthrough" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Guided official IRIS navigation walkthrough">
                  <p className="official-resource-hub__print-meta" role="status"><strong>Temporary orientation marks: {Object.values(irisWalkthroughItems).filter(Boolean).length}/{IRIS_NAVIGATION_WALKTHROUGH.length}</strong><br /><span lang="ur" dir="rtl">عارضی رہنمائی کے نشانات: {Object.values(irisWalkthroughItems).filter(Boolean).length}/{IRIS_NAVIGATION_WALKTHROUGH.length}</span></p>
                  <ol className="official-resource-hub__print-list">
                    {IRIS_NAVIGATION_WALKTHROUGH.map((step, index) => (
                      <li className="official-resource-hub__item" key={step.id}>
                        <label className="official-resource-hub__check-label">
                          <input type="checkbox" checked={Boolean(irisWalkthroughItems[step.id])} onChange={() => setIrisWalkthroughItems((current) => ({ ...current, [step.id]: !current[step.id] }))} />
                          <span><strong>{index + 1}. {step.label}</strong><br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></span>
                        </label>
                        <p className="official-resource-hub__item-description">{step.boundary}</p>
                        <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{step.boundaryUrdu}</p>
                        <a className="official-resource-hub__link" href={step.url} {...linkProps}>{step.sourceLabel} ↗</a>
                      </li>
                    ))}
                  </ol>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setIrisWalkthroughItems({})}>Clear temporary walkthrough marks / <span lang="ur" dir="rtl">عارضی رہنمائی کے نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">This guide cannot log in, navigate inside IRIS, enter information, e-sign, submit a return, view a status, or confirm an acknowledgement. Only official FBR IRIS can do those things.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="pre-submission-prevention-title">
              <h3 id="pre-submission-prevention-title" className="official-resource-hub__tool-title">Pre-submission error-prevention checklist<br /><span lang="ur" dir="rtl">جمع کرانے سے پہلے غلطی سے بچاؤ چیک لسٹ</span></h3>
              <p className="official-resource-hub__tool-copy">Use these temporary “pause and recheck” prompts immediately before using an official IRIS submission action. They do not run FBR checks, assess legal completeness, calculate tax, or confirm acceptance.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">سرکاری آئرس میں جمع کرانے کے عمل سے فوراً پہلے ان عارضی "رکیں اور دوبارہ دیکھیں" نکات کو استعمال کریں۔ یہ ایف بی آر چیکس نہیں چلاتے، قانونی تکمیل نہیں جانچتے، ٹیکس نہیں نکالتے اور قبولیت کی تصدیق نہیں کرتے۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setPreSubmissionChecklistOpen((open) => !open)} aria-expanded={preSubmissionChecklistOpen} aria-controls="pre-submission-error-prevention">{preSubmissionChecklistOpen ? "Hide error-prevention checklist" : "Open error-prevention checklist"}</button>
              {preSubmissionChecklistOpen && (
                <section id="pre-submission-error-prevention" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Temporary pre-submission error-prevention checklist">
                  <p className="official-resource-hub__print-meta" role="status"><strong>{preSubmissionReadiness.label} · {preSubmissionReadiness.completed}/{preSubmissionReadiness.total}</strong><br /><span lang="ur" dir="rtl">{preSubmissionReadiness.labelUrdu}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {PRE_SUBMISSION_ERROR_PREVENTION_STEPS.map((item) => (
                      <li key={item.id}>
                        <label className="official-resource-hub__check-label">
                          <input type="checkbox" checked={Boolean(preSubmissionItems[item.id])} onChange={() => setPreSubmissionItems((current) => ({ ...current, [item.id]: !current[item.id] }))} />
                          <span>{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158" {...linkProps}>Recheck current FBR filing guidance ↗</a>
                  <br />
                  <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/categ/income-tax-due-dates/51147/40846/81148" {...linkProps}>Recheck FBR due-date information ↗</a>
                  <br />
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setPreSubmissionItems({})}>Clear temporary review marks / <span lang="ur" dir="rtl">عارضی جائزہ کے نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">These marks disappear when the page is refreshed and are not written to browser storage, your account, or the app database. Marking every item does not confirm that a return is complete, correct, accepted, or free of later questions.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="complex-situation-navigator-title">
              <h3 id="complex-situation-navigator-title" className="official-resource-hub__tool-title">Complex-situation preparation navigator<br /><span lang="ur" dir="rtl">پیچیدہ صورتِ حال تیاری رہنما</span></h3>
              <p className="official-resource-hub__tool-copy">Choose only broad situation labels to identify where you may need an official check or qualified clarification. Do not enter facts, dates, figures, notice text, account details, or documents.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">سرکاری جانچ یا اہل وضاحت کی ضرورت والی صورت شناخت کرنے کے لیے صرف عمومی صورتحال کے لیبل منتخب کریں۔ حقائق، تاریخیں، اعداد، نوٹس متن، اکاؤنٹ تفصیلات یا دستاویزات درج نہ کریں۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setComplexSituationOpen((open) => !open)} aria-expanded={complexSituationOpen} aria-controls="complex-situation-preparation-navigator">{complexSituationOpen ? "Hide complex-situation navigator" : "Open complex-situation navigator"}</button>
              {complexSituationOpen && (
                <section id="complex-situation-preparation-navigator" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Temporary complex-situation preparation navigator">
                  <p className="official-resource-hub__print-meta" role="status"><strong>{complexSituationReadiness.label} · {complexSituationReadiness.completed}/{complexSituationReadiness.total}</strong><br /><span lang="ur" dir="rtl">{complexSituationReadiness.labelUrdu}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {COMPLEX_SITUATION_PREPARATION_PATHS.map((path) => (
                      <li className="official-resource-hub__item" key={path.id}>
                        <label className="official-resource-hub__check-label"><input type="checkbox" checked={Boolean(complexSituationItems[path.id])} onChange={() => setComplexSituationItems((current) => ({ ...current, [path.id]: !current[path.id] }))} /><span><strong>{path.label}</strong><br /><span lang="ur" dir="rtl">{path.labelUrdu}</span></span></label>
                        <p className="official-resource-hub__item-description">{path.boundary}</p>
                        <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{path.boundaryUrdu}</p>
                        <a className="official-resource-hub__link" href={path.url} {...linkProps}>{path.sourceLabel} ↗</a>
                      </li>
                    ))}
                  </ul>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setComplexSituationItems({})}>Clear temporary situation marks / <span lang="ur" dir="rtl">عارضی صورتحال نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">These temporary marks are not saved and do not determine a tax treatment, filing route, eligibility, deadline, notice response, or outcome.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="return-wealth-relationship-title">
              <h3 id="return-wealth-relationship-title" className="official-resource-hub__tool-title">Return & wealth-statement preparation relationship<br /><span lang="ur" dir="rtl">ریٹرن اور ویلتھ اسٹیٹمنٹ تیاری تعلق</span></h3>
              <p className="official-resource-hub__tool-copy">A local orientation for keeping your preparation organised. It is not a wealth statement, reconciliation, calculator, validation, or legal-completeness check.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">اپنی تیاری منظم رکھنے کے لیے مقامی رہنمائی۔ یہ ویلتھ اسٹیٹمنٹ، مصالحت، کیلکولیٹر، توثیق یا قانونی تکمیل جانچ نہیں ہے۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setReturnWealthOpen((open) => !open)} aria-expanded={returnWealthOpen} aria-controls="return-wealth-relationship-guide">{returnWealthOpen ? "Hide return & wealth guide" : "Open return & wealth guide"}</button>
              {returnWealthOpen && (
                <section id="return-wealth-relationship-guide" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Temporary return and wealth-statement preparation relationship guide">
                  <p className="official-resource-hub__print-meta" role="status"><strong>{returnWealthReadiness.label} · {returnWealthReadiness.completed}/{returnWealthReadiness.total}</strong><br /><span lang="ur" dir="rtl">{returnWealthReadiness.labelUrdu}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {RETURN_WEALTH_RELATIONSHIP_STEPS.map((step) => (
                      <li className="official-resource-hub__item" key={step.id}>
                        <label className="official-resource-hub__check-label"><input type="checkbox" checked={Boolean(returnWealthItems[step.id])} onChange={() => setReturnWealthItems((current) => ({ ...current, [step.id]: !current[step.id] }))} /><span><strong>{step.label}</strong><br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></span></label>
                        <p className="official-resource-hub__item-description">{step.boundary}</p>
                        <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{step.boundaryUrdu}</p>
                      </li>
                    ))}
                  </ul>
                  <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158" {...linkProps}>Check current FBR filing guidance ↗</a>
                  <br />
                  <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/act-rules-ordinances/131226" {...linkProps}>Check FBR Acts, Rules & Ordinances index ↗</a>
                  <br />
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setReturnWealthItems({})}>Clear temporary relationship marks / <span lang="ur" dir="rtl">عارضی تعلق نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">These marks disappear when the page is refreshed and are not written to browser storage, your account, or the app database. They do not reconcile entries or confirm that any official form is complete.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="post-submission-continuity-title">
              <h3 id="post-submission-continuity-title" className="official-resource-hub__tool-title">Post-submission continuity checklist<br /><span lang="ur" dir="rtl">جمع کرانے کے بعد تسلسل چیک لسٹ</span></h3>
              <p className="official-resource-hub__tool-copy">Use this temporary reminder after an official action. It does not track a return, send alerts, keep copies, or say that FBR has accepted anything.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">سرکاری عمل کے بعد یہ عارضی یاد دہانی استعمال کریں۔ یہ ریٹرن ٹریک نہیں کرتی، الرٹس نہیں بھیجتی، نقول نہیں رکھتی اور نہ ہی کہتی ہے کہ ایف بی آر نے کچھ قبول کیا ہے۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setPostSubmissionOpen((open) => !open)} aria-expanded={postSubmissionOpen} aria-controls="post-submission-continuity-checklist">{postSubmissionOpen ? "Hide post-submission checklist" : "Open post-submission checklist"}</button>
              {postSubmissionOpen && (
                <section id="post-submission-continuity-checklist" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Temporary post-submission continuity checklist">
                  <p className="official-resource-hub__print-meta" role="status"><strong>{postSubmissionReadiness.label} · {postSubmissionReadiness.completed}/{postSubmissionReadiness.total}</strong><br /><span lang="ur" dir="rtl">{postSubmissionReadiness.labelUrdu}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {POST_SUBMISSION_CONTINUITY_STEPS.map((step) => (
                      <li className="official-resource-hub__item" key={step.id}>
                        <label className="official-resource-hub__check-label"><input type="checkbox" checked={Boolean(postSubmissionItems[step.id])} onChange={() => setPostSubmissionItems((current) => ({ ...current, [step.id]: !current[step.id] }))} /><span><strong>{step.label}</strong><br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></span></label>
                        <p className="official-resource-hub__item-description">{step.boundary}</p>
                        <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{step.boundaryUrdu}</p>
                        <a className="official-resource-hub__link" href={step.url} {...linkProps}>{step.sourceLabel} ↗</a>
                      </li>
                    ))}
                  </ul>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setPostSubmissionItems({})}>Clear temporary continuity marks / <span lang="ur" dir="rtl">عارضی تسلسل نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">These marks disappear when the page is refreshed and are not written to browser storage, your account, or the app database. They do not confirm submission, acknowledgement, acceptance, or a future FBR outcome.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="source-aware-question-planner-title">
              <h3 id="source-aware-question-planner-title" className="official-resource-hub__tool-title">Source-aware question planner<br /><span lang="ur" dir="rtl">سورس آگاہ سوال منصوبہ ساز</span></h3>
              <p className="official-resource-hub__tool-copy">Choose a broad learning goal to see a safe question for an official-source check. Your choice stays only on this page; do not enter facts, figures, identifiers, documents, or account details.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">سرکاری سورس چیک کے لیے محفوظ سوال دیکھنے کو ایک عمومی سیکھنے کا مقصد منتخب کریں۔ آپ کا انتخاب صرف اسی صفحے پر رہتا ہے؛ حقائق، اعداد، شناختی معلومات، دستاویزات یا اکاؤنٹ تفصیلات درج نہ کریں۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setQuestionPlannerOpen((open) => !open)} aria-expanded={questionPlannerOpen} aria-controls="source-aware-question-planner">{questionPlannerOpen ? "Hide question planner" : "Open question planner"}</button>
              {questionPlannerOpen && (
                <section id="source-aware-question-planner" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Local source-aware question planner">
                  <label className="sr-only" htmlFor="source-aware-question-plan">Choose a broad question goal</label>
                  <select id="source-aware-question-plan" className="official-resource-hub__select" value={questionPlanId} onChange={(event) => setQuestionPlanId(event.target.value)}>
                    {SOURCE_AWARE_QUESTION_PLANS.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
                  </select>
                  <article className="official-resource-hub__item" style={{ marginTop: 10 }}>
                    <strong>{activeQuestionPlan.label}</strong>
                    <p className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{activeQuestionPlan.labelUrdu}</p>
                    <p className="official-resource-hub__item-description">{activeQuestionPlan.prompt}</p>
                    <p className="official-resource-hub__item-description official-resource-hub__item-description--urdu" lang="ur" dir="rtl">{activeQuestionPlan.promptUrdu}</p>
                    <p className="official-resource-hub__footer">{activeQuestionPlan.boundary}</p>
                    <p className="official-resource-hub__footer" lang="ur" dir="rtl">{activeQuestionPlan.boundaryUrdu}</p>
                    <a className="official-resource-hub__link" href={activeQuestionPlan.url} {...linkProps}>{activeQuestionPlan.sourceLabel} ↗</a>
                  </article>
                  <p className="official-resource-hub__footer">This planner does not send a question to AI, save a selection, determine treatment, or give a filing decision.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="calculation-explanation-map-title">
              <h3 id="calculation-explanation-map-title" className="official-resource-hub__tool-title">Educational calculation-explanation map<br /><span lang="ur" dir="rtl">تعلیمی کیلکولیشن وضاحتی نقشہ</span></h3>
              <p className="official-resource-hub__tool-copy">A visual review sequence for using an educational calculation responsibly. It does not change the authored calculator, request amounts, or produce an official tax result.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">تعلیمی کیلکولیشن کو ذمہ داری سے استعمال کرنے کے لیے بصری جائزہ ترتیب۔ یہ اصل کیلکولیٹر نہیں بدلتا، اعداد نہیں مانگتا اور سرکاری ٹیکس نتیجہ نہیں دیتا۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setCalculationMapOpen((open) => !open)} aria-expanded={calculationMapOpen} aria-controls="calculation-explanation-map">{calculationMapOpen ? "Hide explanation map" : "Open explanation map"}</button>
              {calculationMapOpen && (
                <section id="calculation-explanation-map" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Educational calculation explanation map">
                  <ol className="official-resource-hub__print-list">
                    {CALCULATION_EXPLANATION_MAP.map((step) => (
                      <li className="official-resource-hub__item" key={step.id}>
                        <strong>{step.label}</strong><br />
                        <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{step.labelUrdu}</span>
                      </li>
                    ))}
                  </ol>
                  <a className="official-resource-hub__link" href="https://www.fbr.gov.pk/categ/file-income-tax-return/51147/80860/71158" {...linkProps}>Check current FBR filing guidance ↗</a>
                  <p className="official-resource-hub__footer">This map cannot validate categories, rates, deductions, credits, withholding, a return, or FBR acceptance. Use current official guidance when a rule or result matters.</p>
                </section>
              )}
            </section>

            <section className="official-resource-hub__tools" aria-labelledby="ai-answer-evaluation-title">
              <h3 id="ai-answer-evaluation-title" className="official-resource-hub__tool-title">Educational AI-answer evaluation checklist<br /><span lang="ur" dir="rtl">تعلیمی اے آئی جواب جائزہ چیک لسٹ</span></h3>
              <p className="official-resource-hub__tool-copy">Use temporary marks to assess whether an educational answer explains its limits before you rely on it. This checklist does not grade an answer, verify sources, or replace an official check.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">کسی تعلیمی جواب پر انحصار سے پہلے اس کی حدود کی وضاحت جانچنے کے لیے عارضی نشانات استعمال کریں۔ یہ چیک لسٹ جواب کو گریڈ، سورس کی تصدیق یا سرکاری جانچ کا متبادل نہیں بناتی۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setAnswerEvaluationOpen((open) => !open)} aria-expanded={answerEvaluationOpen} aria-controls="ai-answer-evaluation-checklist">{answerEvaluationOpen ? "Hide AI-answer checklist" : "Open AI-answer checklist"}</button>
              {answerEvaluationOpen && (
                <section id="ai-answer-evaluation-checklist" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Temporary educational AI-answer evaluation checklist">
                  <p className="official-resource-hub__print-meta" role="status"><strong>{answerEvaluationReadiness.label} · {answerEvaluationReadiness.completed}/{answerEvaluationReadiness.total}</strong><br /><span lang="ur" dir="rtl">{answerEvaluationReadiness.labelUrdu}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {AI_ANSWER_EVALUATION_STEPS.map((step) => (
                      <li key={step.id}>
                        <label className="official-resource-hub__check-label"><input type="checkbox" checked={Boolean(answerEvaluationItems[step.id])} onChange={() => setAnswerEvaluationItems((current) => ({ ...current, [step.id]: !current[step.id] }))} /><span>{step.label}<br /><span lang="ur" dir="rtl">{step.labelUrdu}</span></span></label>
                      </li>
                    ))}
                  </ul>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setAnswerEvaluationItems({})}>Clear temporary evaluation marks / <span lang="ur" dir="rtl">عارضی جائزہ نشانات صاف کریں</span></button>
                  <p className="official-resource-hub__footer">These marks disappear on refresh and are not saved to browser storage, your account, or the app database. Marking every item does not make an answer correct, complete, current, or suitable for your facts.</p>
                </section>
              )}
            </section>

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

            <section className="official-resource-hub__tools" aria-labelledby="filing-readiness-title">
              <h3 id="filing-readiness-title" className="official-resource-hub__tool-title">Local filing-readiness board<br /><span lang="ur" dir="rtl">مقامی فائلنگ تیاری بورڈ</span></h3>
              <p className="official-resource-hub__tool-copy">Temporary, on-screen preparation marks only. Nothing is saved to your browser or account, and this board does not assess a return or FBR filing status.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">یہ صرف عارضی، آن اسکرین تیاری کے نشانات ہیں۔ کچھ بھی آپ کے براؤزر یا اکاؤنٹ میں محفوظ نہیں ہوتا، اور یہ بورڈ ریٹرن یا ایف بی آر فائلنگ اسٹیٹس کا جائزہ نہیں لیتا۔</p>
              <p className="official-resource-hub__print-meta" role="status"><strong>{filingReadiness.label} · {filingReadiness.completed}/{filingReadiness.total}</strong><br /><span lang="ur" dir="rtl">{filingReadiness.labelUrdu}</span></p>
              <ul className="official-resource-hub__print-list">
                {FILING_READINESS_STEPS.map((item) => (
                  <li key={item.id}>
                    <label className="official-resource-hub__check-label">
                      <input type="checkbox" checked={Boolean(filingReadinessItems[item.id])} onChange={() => setFilingReadinessItems((current) => ({ ...current, [item.id]: !current[item.id] }))} />
                      <span>{item.label}<br /><span lang="ur" dir="rtl">{item.labelUrdu}</span></span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="official-resource-hub__footer">Marking every item does not confirm that IRIS will accept a return or that FBR agrees with an entry. Recheck current official requirements before submission.</p>
            </section>
            <section className="official-resource-hub__tools" aria-labelledby="wealth-preparation-title">
              <h3 id="wealth-preparation-title" className="official-resource-hub__tool-title">Local wealth-statement preparation<br /><span lang="ur" dir="rtl">مقامی ویلتھ اسٹیٹمنٹ تیاری</span></h3>
              <p className="official-resource-hub__tool-copy">Use broad, temporary readiness choices to organise your own records. This is not a wealth-statement calculator, reconciliation, validation, or filing form. It never asks for or stores figures, assets, liabilities, identifiers, documents, passwords, OTPs, or bank details.</p>
              <p className="official-resource-hub__tool-copy" lang="ur" dir="rtl">اپنے ریکارڈ ترتیب دینے کے لیے صرف عمومی، عارضی تیاری کے انتخاب استعمال کریں۔ یہ ویلتھ اسٹیٹمنٹ کیلکولیٹر، مصالحت، توثیق یا فائلنگ فارم نہیں۔ یہ اعداد، اثاثے، ذمہ داریاں، شناختی معلومات، دستاویزات، پاس ورڈ، او ٹی پی یا بینک تفصیلات نہ مانگتا ہے نہ محفوظ کرتا ہے۔</p>
              <button className="official-resource-hub__print-toggle" type="button" onClick={() => setWealthPreparationOpen((open) => !open)} aria-expanded={wealthPreparationOpen} aria-controls="wealth-preparation-board">{wealthPreparationOpen ? "Hide wealth preparation" : "Open wealth preparation board"}</button>
              {wealthPreparationOpen && (
                <section id="wealth-preparation-board" className="official-resource-hub__print-sheet official-resource-hub__print-sheet--visible" aria-label="Local wealth-statement preparation board">
                  <p className="official-resource-hub__print-meta" role="status"><strong>Temporary choices: {wealthReadiness.selected}/{wealthReadiness.total} · support located {wealthReadiness.ready} · review needed {wealthReadiness.needsReview} · unsure {wealthReadiness.notSure}</strong><br /><span lang="ur" dir="rtl">عارضی انتخاب: {wealthReadiness.selected}/{wealthReadiness.total} · ثبوت دستیاب {wealthReadiness.ready} · جائزہ درکار {wealthReadiness.needsReview} · غیر یقینی {wealthReadiness.notSure}</span></p>
                  <ul className="official-resource-hub__print-list">
                    {WEALTH_STATEMENT_PREPARATION_STEPS.map((step) => (
                      <li className="official-resource-hub__item" key={step.id}>
                        <span className="official-resource-hub__item-title">{step.label}</span>
                        <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{step.labelUrdu}</span>
                        <label className="sr-only" htmlFor={`wealth-${step.id}`}>Temporary preparation status for {step.label}</label>
                        <select id={`wealth-${step.id}`} className="official-resource-hub__select" value={wealthReadinessItems[step.id] || ""} onChange={(event) => setWealthReadinessItems((current) => ({ ...current, [step.id]: event.target.value }))}>
                          {WEALTH_READINESS_OPTIONS.map((option) => <option key={option.value || "empty"} value={option.value}>{option.label} — {option.labelUrdu}</option>)}
                        </select>
                      </li>
                    ))}
                  </ul>
                  <section className="official-resource-hub__print-summary" aria-label="Printable local wealth readiness summary">
                    <h4>Printable temporary readiness summary<br /><span lang="ur" dir="rtl">پرنٹ کے قابل عارضی تیاری خلاصہ</span></h4>
                    <p>Only these broad on-screen states are included. No amounts, identities, documents, or account details are shown, saved, or sent.</p>
                    <ul className="official-resource-hub__print-list">
                      {getWealthReadinessPrintRows(wealthReadinessItems).map((row) => <li key={`print-${row.id}`}><strong>{row.label}: {row.status}</strong><br /><span lang="ur" dir="rtl">{row.labelUrdu}: {row.statusUrdu}</span></li>)}
                    </ul>
                  </section>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => window.print()}>Print temporary summary / <span lang="ur" dir="rtl">عارضی خلاصہ پرنٹ کریں</span></button>
                  <button className="official-resource-hub__print-action" type="button" onClick={() => setWealthReadinessItems({})}>Clear temporary choices / <span lang="ur" dir="rtl">عارضی انتخاب صاف کریں</span></button>
                  <p className="official-resource-hub__footer">Nothing from this board is written to browser storage, your account, or the app database. Verify current requirements through official FBR sources before acting.</p>
                </section>
              )}

              <section className="official-resource-hub__tools" aria-labelledby="pre-filing-timeline-title">
                <h3 className="official-resource-hub__tool-title" id="pre-filing-timeline-title">Pre-filing timeline planner · <span lang="ur" dir="rtl">فائلنگ سے پہلے ٹائم لائن پلانر</span></h3>
                <p className="official-resource-hub__tool-copy">Mark only a temporary preparation status for each stage. This planner does not calculate legal deadlines, collect tax information, or decide whether you are ready to file. <span lang="ur" dir="rtl">ہر مرحلے کے لیے صرف عارضی تیاری کی حالت منتخب کریں۔ یہ پلانر قانونی آخری تاریخ نہیں نکالتا، ٹیکس معلومات جمع نہیں کرتا، اور فائلنگ کی تیاری کا فیصلہ نہیں کرتا۔</span></p>
                <p className="official-resource-hub__print-meta">{timelineReadiness.readyToVerify} ready to verify · {timelineReadiness.inProgress} in progress · {timelineReadiness.notStarted} not started · {timelineReadiness.unmarked} not marked</p>
                <ul className="official-resource-hub__print-list">
                  {PRE_FILING_TIMELINE_STEPS.map((step) => (
                    <li className="official-resource-hub__item" key={step.id}>
                      <strong className="official-resource-hub__item-title">{step.label}</strong>
                      <span className="official-resource-hub__item-urdu" lang="ur" dir="rtl">{step.urdu}</span>
                      <p className="official-resource-hub__item-description">{step.boundary}</p>
                      <select className="official-resource-hub__select" aria-label={`${step.label} temporary status`} value={timelineItems[step.id] || ""} onChange={(event) => setTimelineItems((current) => ({ ...current, [step.id]: event.target.value }))}>
                        <option value="">Not marked / نشان زد نہیں</option>
                        {TIMELINE_STATUS_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label} / {option.urdu}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
                <button className="official-resource-hub__print-action" type="button" onClick={downloadNonSensitiveReadinessSummary}>Download private readiness summary / <span lang="ur" dir="rtl">نجی تیاری خلاصہ ڈاؤن لوڈ کریں</span></button>
                <button className="official-resource-hub__print-action" type="button" onClick={() => setTimelineItems({})}>Clear temporary timeline / <span lang="ur" dir="rtl">عارضی ٹائم لائن صاف کریں</span></button>
                <p className="official-resource-hub__footer">The download is created in your browser and contains only these selected status labels and the wealth-readiness status labels. It contains no figures, names, CNICs, account details, documents, or credentials.</p>
              </section>
            </section>
            <p className="official-resource-hub__footer">Before acting, confirm current requirements, fees, deadlines, and eligibility directly on the linked official portal.</p>
          </div>
        </section>
      )}

    </aside>
  );
}
