import { useMemo, useState } from "react";
import { startLogin } from "./const";
import { trpc } from "./lib/trpc";
import { formatPrototypeDraftSavedAt, getPrototypeChecklist, getPrototypeDraftSavedAtIso, getPrototypeQuestions, loadPrototypeDraft, removePrototypeDraft, savePrototypeDraft } from "./personalisedChecklistPrototype.js";

const sectionOrder = ["Before IRIS", "Income records", "Investment records", "Tax deducted and records", "Special situations", "Before you submit"];

const typeLabel = {
  gather: "Gather",
  review: "Review",
  seek_advice: "Confirm",
};

export default function PersonalisedChecklistPrototype() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [itemStatus, setItemStatus] = useState({});
  const [savedDraft, setSavedDraft] = useState(null);
  const [draftNotice, setDraftNotice] = useState("");
  const { data: accountUser, isLoading: isAccountLoading } = trpc.auth.me.useQuery();
  const accountDraftQuery = trpc.checklistDraft.get.useQuery(undefined, { enabled: Boolean(accountUser), retry: false });
  const draftUtils = trpc.useUtils();
  const accountSaveMutation = trpc.checklistDraft.save.useMutation({
    onSuccess: () => {
      draftUtils.checklistDraft.get.invalidate();
      setDraftNotice("Account draft saved. Only your high-level choices and progress marks were stored.");
    },
  });
  const accountDeleteMutation = trpc.checklistDraft.delete.useMutation({
    onSuccess: () => {
      draftUtils.checklistDraft.get.invalidate();
      setDraftNotice("Account draft deleted.");
    },
  });

  const questions = useMemo(() => getPrototypeQuestions(answers), [answers]);
  const activeQuestion = questions[step];
  const checklist = useMemo(() => getPrototypeChecklist(answers), [answers]);
  const isAnswered = activeQuestion?.kind === "multiple"
    ? (answers[activeQuestion.id] || []).length > 0
    : Boolean(answers[activeQuestion?.id]);
  const hasProgress = Object.keys(answers).length > 0 || Object.keys(itemStatus).length > 0;
  const savedAtLabel = savedDraft ? formatPrototypeDraftSavedAt(savedDraft.savedAt) : null;
  const savedAtIso = savedDraft ? getPrototypeDraftSavedAtIso(savedDraft.savedAt) : null;

  const readSavedDraft = () => {
    if (typeof window === "undefined") return null;
    try {
      return loadPrototypeDraft(window.localStorage);
    } catch {
      return null;
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
    setItemStatus({});
  };

  const updateAnswer = (question, value) => {
    if (question.kind === "multiple") {
      const current = answers[question.id] || [];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      setAnswers((previous) => ({ ...previous, [question.id]: next }));
      return;
    }
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  };

  const advance = () => {
    if (step === questions.length - 1) {
      setShowResults(true);
      return;
    }
    setStep((current) => current + 1);
  };

  const close = () => {
    setIsOpen(false);
    reset();
  };

  const saveDraft = () => {
    if (typeof window === "undefined") return;
    try {
      const parsed = savePrototypeDraft(window.localStorage, { answers, itemStatus, step, showResults });
      setSavedDraft(parsed);
      setDraftNotice("Saved on this browser only. You can resume or delete it at any time.");
    } catch {
      setDraftNotice("This browser could not save the draft. Your answers remain only in this open panel.");
    }
  };

  const resumeSavedDraft = () => {
    const draft = savedDraft || readSavedDraft();
    if (!draft) {
      setDraftNotice("No saved draft was found on this browser.");
      return;
    }
    const restoredQuestions = getPrototypeQuestions(draft.answers);
    setAnswers(draft.answers);
    setItemStatus(draft.itemStatus);
    setStep(Math.min(draft.step, Math.max(restoredQuestions.length - 1, 0)));
    setShowResults(draft.showResults);
    setDraftNotice("Saved draft resumed. Nothing has been sent to the server.");
  };

  const deleteSavedDraft = () => {
    if (typeof window === "undefined") return;
    try {
      removePrototypeDraft(window.localStorage);
      setSavedDraft(null);
      setDraftNotice("Saved draft removed from this browser.");
    } catch {
      setDraftNotice("This browser could not remove the saved draft. Please clear site data in your browser settings.");
    }
  };

  const saveAccountDraft = () => {
    if (!accountUser) {
      startLogin();
      return;
    }
    accountSaveMutation.mutate({ answers, itemStatus, step, showResults });
  };

  const resumeAccountDraft = () => {
    const draft = accountDraftQuery.data;
    if (!draft) {
      setDraftNotice("No account draft is available yet.");
      return;
    }
    const restoredQuestions = getPrototypeQuestions(draft.answers);
    setAnswers(draft.answers);
    setItemStatus(draft.itemStatus);
    setStep(Math.min(draft.step, Math.max(restoredQuestions.length - 1, 0)));
    setShowResults(draft.showResults);
    setDraftNotice("Account draft resumed.");
  };

  const openPrototype = () => {
    if (isOpen) {
      close();
      return;
    }
    const draft = readSavedDraft();
    setSavedDraft(draft);
    setDraftNotice(draft ? "A saved draft is available on this browser." : "");
    setIsOpen(true);
  };

  return (
    <aside className="filing-prototype" aria-label="Personalised filing checklist prototype">
      <style>{`
        .filing-prototype { position: fixed; z-index: 59; left: 16px; bottom: 16px; font-family: Georgia, 'Times New Roman', serif; color: #173b31; }
        .filing-prototype__launch { display: inline-flex; align-items: center; gap: 8px; border: 1px solid #b99116; border-radius: 999px; background: #fffdf2; color: #0B3D2E; box-shadow: 0 8px 24px rgba(11, 61, 46, .18); cursor: pointer; padding: 11px 15px; font: 700 14px/1.15 inherit; }
        .filing-prototype__launch:hover, .filing-prototype__launch:focus-visible { background: #f7efcb; outline: 3px solid rgba(202, 165, 24, .34); outline-offset: 2px; }
        .filing-prototype__spark { display: inline-grid; place-items: center; width: 19px; height: 19px; border-radius: 50%; background: #0B3D2E; color: #ecd46e; font-size: 12px; }
        .filing-prototype__panel { width: min(535px, calc(100vw - 32px)); max-height: calc(100vh - 100px); margin-bottom: 10px; overflow: auto; border: 1px solid #d6bd67; border-radius: 16px; background: #fffdf7; box-shadow: 0 20px 50px rgba(10, 43, 33, .28); }
        .filing-prototype__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 17px 18px 14px; background: #0B3D2E; color: #fffdf2; }
        .filing-prototype__eyebrow { margin: 0 0 4px; color: #ead675; font: 700 11px/1.25 Arial, sans-serif; letter-spacing: .06em; text-transform: uppercase; }
        .filing-prototype__title { margin: 0; font-size: 20px; line-height: 1.16; }
        .filing-prototype__urdu { display: block; margin-top: 4px; color: #f3e79e; font-size: 15px; }
        .filing-prototype__close { min-width: 32px; min-height: 32px; border: 0; border-radius: 50%; background: transparent; color: #fffdf2; cursor: pointer; font: 700 21px/1 Arial, sans-serif; }
        .filing-prototype__close:hover, .filing-prototype__close:focus-visible { background: rgba(255,255,255,.15); outline: 2px solid #ecd46e; outline-offset: 2px; }
        .filing-prototype__body { padding: 17px 18px 18px; }
        .filing-prototype__privacy { margin: 0 0 15px; border-left: 3px solid #caa518; padding: 9px 0 9px 11px; background: #faf5df; color: #4c503c; font-size: 12px; line-height: 1.45; }
        .filing-prototype__draft { margin: 0 0 15px; border: 1px solid #d9c066; border-radius: 10px; padding: 10px; background: #fff9df; color: #3d4f42; font-size: 12px; line-height: 1.4; }
        .filing-prototype__draft p { margin: 0; }
        .filing-prototype__saved-at { margin-top: 7px !important; color: #5d542e; }
        .filing-prototype__draft-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 9px; }
        .filing-prototype__draft button { border: 1px solid #74641d; border-radius: 8px; background: #fffdf7; color: #173b31; cursor: pointer; padding: 7px 9px; font: 700 12px/1.15 inherit; }
        .filing-prototype__draft button:hover, .filing-prototype__draft button:focus-visible { background: #f4e8b2; outline: 3px solid rgba(202, 165, 24, .28); outline-offset: 2px; }
        .filing-prototype__draft button:disabled { cursor: not-allowed; opacity: .48; }
        .filing-prototype__progress { display: flex; gap: 5px; margin: 0 0 16px; }
        .filing-prototype__progress-dot { flex: 1; height: 5px; border-radius: 99px; background: #ded7b9; }
        .filing-prototype__progress-dot--active { background: #caa518; }
        .filing-prototype__question { margin: 0; border: 0; padding: 0; }
        .filing-prototype__legend { margin: 0 0 5px; color: #0B3D2E; font-size: 18px; font-weight: 700; line-height: 1.25; }
        .filing-prototype__question-urdu { margin: 0 0 8px; color: #436051; font-size: 14px; }
        .filing-prototype__hint { margin: 0 0 14px; color: #646048; font-size: 13px; line-height: 1.45; }
        .filing-prototype__options { display: grid; gap: 8px; }
        .filing-prototype__option { display: flex; align-items: center; gap: 10px; border: 1px solid #e0d6aa; border-radius: 10px; background: #fffefb; cursor: pointer; padding: 11px 12px; color: #173b31; font-size: 14px; line-height: 1.25; }
        .filing-prototype__option:has(input:checked) { border-color: #967719; background: #f9f1cf; box-shadow: inset 0 0 0 1px #d9c066; }
        .filing-prototype__option:focus-within { outline: 3px solid rgba(202, 165, 24, .32); outline-offset: 2px; }
        .filing-prototype__option input { width: 18px; height: 18px; accent-color: #0B3D2E; flex: 0 0 auto; }
        .filing-prototype__actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 18px; }
        .filing-prototype__button { border: 1px solid #0B3D2E; border-radius: 9px; background: #0B3D2E; color: #fffdf2; cursor: pointer; padding: 10px 14px; font: 700 14px/1.2 inherit; }
        .filing-prototype__button:hover, .filing-prototype__button:focus-visible { background: #12543f; outline: 3px solid rgba(11, 61, 46, .22); outline-offset: 2px; }
        .filing-prototype__button:disabled { cursor: not-allowed; opacity: .45; }
        .filing-prototype__button--secondary { background: transparent; color: #0B3D2E; }
        .filing-prototype__result-heading { margin: 0 0 5px; color: #0B3D2E; font-size: 20px; }
        .filing-prototype__result-intro { margin: 0 0 15px; color: #535846; font-size: 13px; line-height: 1.45; }
        .filing-prototype__section { margin-top: 14px; }
        .filing-prototype__section-title { margin: 0 0 7px; color: #6a5a18; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .filing-prototype__item { border: 1px solid #e1d9b8; border-radius: 10px; background: #fffefb; padding: 11px; }
        .filing-prototype__item + .filing-prototype__item { margin-top: 7px; }
        .filing-prototype__item-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 9px; }
        .filing-prototype__item-title { color: #173b31; font-size: 14px; font-weight: 700; line-height: 1.3; }
        .filing-prototype__tag { flex: 0 0 auto; border-radius: 99px; background: #e9e3c8; color: #4d512f; padding: 3px 6px; font: 700 10px/1 Arial, sans-serif; text-transform: uppercase; }
        .filing-prototype__item p { margin: 5px 0 9px; color: #535846; font-size: 12px; line-height: 1.4; }
        .filing-prototype__status { display: flex; flex-wrap: wrap; gap: 6px; }
        .filing-prototype__status button { border: 1px solid #cfc59a; border-radius: 999px; background: transparent; color: #355245; cursor: pointer; padding: 5px 8px; font: 700 11px/1 Arial, sans-serif; }
        .filing-prototype__status button[aria-pressed="true"] { border-color: #0B3D2E; background: #0B3D2E; color: #fffdf2; }
        .filing-prototype__disclaimer { margin: 16px 0 0; color: #605c43; font-size: 11px; line-height: 1.4; }
        @media (max-width: 640px) { .filing-prototype { left: 12px; bottom: 67px; } .filing-prototype__panel { width: min(100vw - 24px, 535px); } .filing-prototype__actions { flex-wrap: wrap; } }
      `}</style>

      {isOpen && (
        <section className="filing-prototype__panel" aria-live="polite">
          <header className="filing-prototype__header">
            <div>
              <p className="filing-prototype__eyebrow">Local-only prototype · browser save is optional</p>
              <h2 className="filing-prototype__title">Personalised filing checklist <span className="filing-prototype__urdu" lang="ur" dir="rtl">ذاتی فائلنگ چیک لسٹ</span></h2>
            </div>
            <button className="filing-prototype__close" type="button" onClick={close} aria-label="Close filing checklist prototype">×</button>
          </header>
          <div className="filing-prototype__body">
            <section className="filing-prototype__draft" aria-label="Optional local draft save">
              <p><strong>Optional browser save:</strong> if you choose Save, only these high-level checklist choices and progress marks are kept in this browser’s local storage. Nothing is sent to our server. Avoid saving on a shared device.</p>
              {savedAtLabel && savedAtIso && <p className="filing-prototype__saved-at"><strong>Last saved on this browser:</strong> <time dateTime={savedAtIso}>{savedAtLabel}</time> <span>(your device’s local time)</span></p>}
              {draftNotice && <p role="status" style={{ marginTop: 7 }}><strong>{draftNotice}</strong></p>}
              <div className="filing-prototype__draft-actions">
                <button type="button" onClick={saveDraft} disabled={!hasProgress}>Save this draft on this device</button>
                {savedDraft && <button type="button" onClick={resumeSavedDraft}>Resume saved draft</button>}
                {savedDraft && <button type="button" onClick={deleteSavedDraft}>Delete saved draft</button>}
              </div>
            </section>
            <section className="filing-prototype__draft" aria-label="Optional account draft save">
              <p><strong>Optional account save:</strong> sign in to save the same high-level checklist choices and progress marks to your account so you can resume on another device. No amounts, CNIC, NTN, bank or account details, documents, or passwords are collected. Delete the account draft whenever you choose.</p>
              {accountUser && accountDraftQuery.data?.savedAt && <p className="filing-prototype__saved-at"><strong>Last saved to your account:</strong> <time dateTime={accountDraftQuery.data.savedAt}>{formatPrototypeDraftSavedAt(accountDraftQuery.data.savedAt)}</time></p>}
              <div className="filing-prototype__draft-actions">
                {!accountUser && <button type="button" onClick={startLogin} disabled={isAccountLoading}>Sign in to save to your account</button>}
                {accountUser && <button type="button" onClick={saveAccountDraft} disabled={!hasProgress || accountSaveMutation.isPending}>{accountSaveMutation.isPending ? "Saving account draft…" : "Save to my account"}</button>}
                {accountUser && accountDraftQuery.data && <button type="button" onClick={resumeAccountDraft}>Resume account draft</button>}
                {accountUser && accountDraftQuery.data && <button type="button" onClick={() => accountDeleteMutation.mutate()} disabled={accountDeleteMutation.isPending}>{accountDeleteMutation.isPending ? "Deleting account draft…" : "Delete account draft"}</button>}
              </div>
            </section>
            {!showResults ? (
              <>
                <p className="filing-prototype__privacy"><strong>Prototype boundary:</strong> answer only high-level categories. This preview does not ask for tax amounts, CNIC, NTN, bank details, documents, or passwords. It gives preparation prompts, not tax advice or a filing decision.</p>
                <div className="filing-prototype__progress" aria-label={`Question ${step + 1} of ${questions.length}`}>
                  {questions.map((question, index) => <span key={question.id} className={`filing-prototype__progress-dot${index <= step ? " filing-prototype__progress-dot--active" : ""}`} />)}
                </div>
                <fieldset className="filing-prototype__question">
                  <legend className="filing-prototype__legend">{activeQuestion.title}</legend>
                  <p className="filing-prototype__question-urdu" lang="ur" dir="rtl">{activeQuestion.urdu}</p>
                  <p className="filing-prototype__hint">{activeQuestion.hint}</p>
                  <div className="filing-prototype__options">
                    {activeQuestion.options.map(([value, label]) => {
                      const checked = activeQuestion.kind === "multiple" ? (answers[activeQuestion.id] || []).includes(value) : answers[activeQuestion.id] === value;
                      return (
                        <label className="filing-prototype__option" key={value}>
                          <input type={activeQuestion.kind === "multiple" ? "checkbox" : "radio"} name={activeQuestion.id} checked={checked} onChange={() => updateAnswer(activeQuestion, value)} />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="filing-prototype__actions">
                  <button className="filing-prototype__button filing-prototype__button--secondary" type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>Back</button>
                  <button className="filing-prototype__button" type="button" disabled={!isAnswered} onClick={advance}>{step === questions.length - 1 ? "Preview my checklist" : "Continue"}</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="filing-prototype__result-heading">Your preparation preview</h3>
                <p className="filing-prototype__result-intro">This is a local prototype. Review each prompt, then use official FBR guidance and a qualified adviser for information that is uncertain or complex.</p>
                {sectionOrder.map((section) => {
                  const entries = checklist.filter((entry) => entry.section === section);
                  if (!entries.length) return null;
                  return (
                    <section className="filing-prototype__section" key={section} aria-label={section}>
                      <h4 className="filing-prototype__section-title">{section}</h4>
                      {entries.map((entry) => (
                        <article className="filing-prototype__item" key={entry.id}>
                          <div className="filing-prototype__item-top"><span className="filing-prototype__item-title">{entry.title}</span><span className="filing-prototype__tag">{typeLabel[entry.type]}</span></div>
                          <p>{entry.body}</p>
                          <div className="filing-prototype__status" aria-label={`Status for ${entry.title}`}>
                            {["Have it", "Need to find", "Not sure"].map((status) => <button key={status} type="button" aria-pressed={itemStatus[entry.id] === status} onClick={() => setItemStatus((previous) => ({ ...previous, [entry.id]: status }))}>{status}</button>)}
                          </div>
                        </article>
                      ))}
                    </section>
                  );
                })}
                <p className="filing-prototype__disclaimer">The prototype does not send answers anywhere. Saving is optional and stores only the listed high-level choices and progress marks in this browser. It does not determine what you must report. Verify current dates and requirements through official FBR sources before filing.</p>
                <div className="filing-prototype__actions"><button className="filing-prototype__button filing-prototype__button--secondary" type="button" onClick={() => { setShowResults(false); setStep(Math.max(questions.length - 1, 0)); }}>Edit answers</button><button className="filing-prototype__button" type="button" onClick={reset}>Start over</button></div>
              </>
            )}
          </div>
        </section>
      )}

      <button className="filing-prototype__launch" type="button" onClick={openPrototype} aria-expanded={isOpen}>
        <span className="filing-prototype__spark" aria-hidden="true">✓</span>
        Try filing checklist prototype
      </button>
    </aside>
  );
}
