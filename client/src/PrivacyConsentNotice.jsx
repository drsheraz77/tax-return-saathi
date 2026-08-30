import React, { useEffect, useState } from "react";
import {
  PRIVACY_CONSENT_CHOICES,
  PRIVACY_CONSENT_CHANGE_EVENT,
  clearPrivacyConsent,
  getStoredPrivacyConsent,
  savePrivacyConsent,
} from "./privacyConsent.js";

const copy = {
  ur: {
    title: "رازداری کا انتخاب",
    eyebrow: "آزمائشی رازداری نوٹس · Pilot privacy notice",
    summary: "یہ انتخاب صرف اسی براؤزر میں رہے گا؛ اسے کسی بھی وقت بدلیں۔",
    compactBoundary: "اختیاری Google Analytics اور صرف مجموعی فرسٹ پارٹی وزٹ گنتی واضح اجازت کے بعد؛ اشتہار نہیں۔ یہ Google-certified CMP یا قانونی سرٹیفکیشن نہیں۔",
    detailsTitle: "تفصیلات اور انتخاب کی وجہ",
    body: "یہ نوٹس ہر وزیٹر کو دکھایا جاتا ہے، بشمول EU/EEA/UK، اور آپ کے مقام کا تعین نہیں کرتا۔ اجازت پر Google Analytics مجموعی وزٹ پیمائش کے لیے لوڈ ہو سکتی ہے اور ایپ UTC دن کے لیے ایک مجموعی سیشن سگنل بڑھا سکتی ہے۔ ایپ IP، کوکی، اکاؤنٹ، صفحہ URL، ٹیکس/فارم، یا فیڈبیک متن محفوظ یا نہیں بھیجتی۔",
    boundary: "یہ مقامی انتخاب Google-certified CMP، قانونی سرٹیفکیشن، یا AdSense کی منظوری نہیں ہے۔",
    accept: "وزیٹر پیمائش منظور کریں",
    decline: "وزیٹر پیمائش مسترد کریں",
    details: "تفصیلات دیکھیں",
    back: "مختصر منظر پر واپس",
    policy: "پرائیویسی پالیسی پڑھیں",
    manage: "رازداری کا انتخاب تبدیل کریں",
    saved: "وزیٹر پیمائش کا انتخاب مقامی طور پر محفوظ ہے۔ آپ اسے کسی بھی وقت تبدیل کر سکتے ہیں۔",
    close: "بند کریں",
    reset: "انتخاب دوبارہ کریں",
  },
  en: {
    title: "Privacy choice",
    eyebrow: "Pilot privacy notice · آزمائشی رازداری نوٹس",
    summary: "This browser remembers your choice; change it any time.",
    compactBoundary: "Optional Google Analytics and a first-party aggregate visit counter only after clear permission; no advertising. This is not a Google-certified CMP or legal certification.",
    detailsTitle: "Details and why this choice appears",
    body: "This notice is shown to every visitor, including people in the EU/EEA/UK, without determining your location. If you allow it, Google Analytics may load for aggregate visit measurement and the app may increase one aggregate session signal for the UTC day. The app does not store or send an IP address, cookie, account, page URL, tax/form data, or feedback text.",
    boundary: "This local choice is not a Google-certified CMP, legal certification, or AdSense approval.",
    accept: "Allow visitor measurement",
    decline: "Decline visitor measurement",
    details: "Why this choice?",
    back: "Return to compact view",
    policy: "Read the privacy policy",
    manage: "Change privacy choice",
    saved: "Your visitor-measurement choice is stored locally. You can change it at any time.",
    close: "Close",
    reset: "Choose again",
  },
};

export default function PrivacyConsentNotice() {
  const [language, setLanguage] = useState("ur");
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const t = copy[language];

  useEffect(() => {
    setChoice(getStoredPrivacyConsent());
  }, []);

  useEffect(() => {
    const openPrivacyNotice = () => {
      setShowDetails(false);
      setOpen(true);
    };
    window.addEventListener("tax-return-saathi:open-privacy-consent", openPrivacyNotice);
    return () => window.removeEventListener("tax-return-saathi:open-privacy-consent", openPrivacyNotice);
  }, []);

  function choose(nextChoice) {
    const saved = savePrivacyConsent(nextChoice);
    setChoice(saved ?? nextChoice);
    window.dispatchEvent(new CustomEvent(PRIVACY_CONSENT_CHANGE_EVENT, { detail: { choice: saved ?? nextChoice } }));
    setShowDetails(false);
    setOpen(false);
  }

  function resetChoice() {
    clearPrivacyConsent();
    setChoice(null);
    window.dispatchEvent(new CustomEvent(PRIVACY_CONSENT_CHANGE_EVENT, { detail: { choice: null } }));
    setShowDetails(false);
    setOpen(true);
  }

  const panel = (
    <section className="privacy-consent-notice__panel" aria-labelledby="privacy-consent-title" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="privacy-consent-notice__heading-row">
        <div>
          <p className="privacy-consent-notice__eyebrow">{t.eyebrow}</p>
          <h2 id="privacy-consent-title">{t.title}</h2>
        </div>
        <button type="button" className="privacy-consent-notice__language" onClick={() => setLanguage(language === "ur" ? "en" : "ur")}>
          {language === "ur" ? "English" : "اردو"}
        </button>
      </div>
      <p className="privacy-consent-notice__summary">{t.summary}</p>
      <p className="privacy-consent-notice__compact-boundary">{t.compactBoundary}</p>
      <div className="privacy-consent-notice__actions privacy-consent-notice__choice-actions">
        <button type="button" className="privacy-consent-notice__primary" onClick={() => choose(PRIVACY_CONSENT_CHOICES.accepted)}>{t.accept}</button>
        <button type="button" className="privacy-consent-notice__secondary" onClick={() => choose(PRIVACY_CONSENT_CHOICES.declined)}>{t.decline}</button>
        <button
          type="button"
          className="privacy-consent-notice__details-toggle"
          aria-expanded={showDetails}
          aria-controls="privacy-consent-details"
          onClick={() => setShowDetails((visible) => !visible)}
        >
          {t.details}
        </button>
      </div>
      {showDetails ? (
        <div id="privacy-consent-details" className="privacy-consent-notice__details">
          <h3>{t.detailsTitle}</h3>
          <p>{t.body}</p>
          <p className="privacy-consent-notice__boundary">{t.boundary}</p>
          <div className="privacy-consent-notice__details-links">
            <a href="/privacy" className="privacy-consent-notice__link">{t.policy}</a>
            <button type="button" className="privacy-consent-notice__details-toggle" onClick={() => setShowDetails(false)}>{t.back}</button>
          </div>
        </div>
      ) : null}
    </section>
  );

  return (
    <>
      <style>{`
        .privacy-consent-notice { position: fixed; z-index: 90; inset: auto 16px 84px; max-width: 500px; margin: 0 auto; }
        .privacy-consent-notice__panel { border: 1px solid #b7ab79; border-radius: 14px; padding: 12px; background: #fffdf5; box-shadow: 0 14px 34px rgba(11,61,46,.2); color: #173b31; font-family: Georgia, 'Times New Roman', serif; }
        .privacy-consent-notice__heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .privacy-consent-notice__eyebrow { margin: 0 0 2px; color: #7a6210; font: 700 9px/1.15 system-ui, sans-serif; letter-spacing: .03em; }
        .privacy-consent-notice__panel h2 { margin: 0; color: #0b3d2e; font-size: 16px; }
        .privacy-consent-notice__panel h3 { margin: 0; color: #0b3d2e; font-size: 14px; }
        .privacy-consent-notice__panel p { margin: 6px 0 0; font-size: 12px; line-height: 1.4; }
        .privacy-consent-notice__summary { font-weight: 700; }
        .privacy-consent-notice__compact-boundary, .privacy-consent-notice__boundary { color: #625f4e; font-size: 11px !important; }
        .privacy-consent-notice__language, .privacy-consent-notice__primary, .privacy-consent-notice__secondary, .privacy-consent-notice__details-toggle { min-height: 32px; border-radius: 8px; padding: 6px 8px; font: 700 11px/1.2 system-ui, sans-serif; cursor: pointer; }
        .privacy-consent-notice__language { border: 1px solid #b7ab79; background: #fffef9; color: #173b31; }
        .privacy-consent-notice__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
        .privacy-consent-notice__primary { border: 1px solid #0b3d2e; background: #0b3d2e; color: #fffdf5; }
        .privacy-consent-notice__secondary { border: 1px solid #0b3d2e; background: #fffdf5; color: #0b3d2e; }
        .privacy-consent-notice__details-toggle { border: 0; background: transparent; color: #0b3d2e; text-decoration: underline; }
        .privacy-consent-notice__details { margin-top: 8px; padding-top: 9px; border-top: 1px solid #e1d9bb; }
        .privacy-consent-notice__details-links { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 9px; }
        .privacy-consent-notice__link { color: #0b3d2e; font: 700 11px/1.2 system-ui, sans-serif; text-decoration: underline; }
        .privacy-consent-notice__dialog { position: fixed; z-index: 90; inset: auto 16px 84px; max-width: 500px; margin: 0 auto; }
        .privacy-consent-notice__saved { margin-top: 9px !important; color: #075c48; font-weight: 700; }
        .privacy-consent-notice button:focus-visible, .privacy-consent-notice a:focus-visible { outline: 3px solid rgba(202,165,24,.55); outline-offset: 3px; }
        @media (max-width: 560px) {
          .privacy-consent-notice { inset: auto 10px 70px; }
          .privacy-consent-notice__dialog { inset: auto 10px 70px; }
          .privacy-consent-notice__heading-row { align-items: center; }
          .privacy-consent-notice__eyebrow { display: none; }
          .privacy-consent-notice__choice-actions { gap: 5px; }
          .privacy-consent-notice__primary, .privacy-consent-notice__secondary { flex: 1 1 145px; }
        }
      `}</style>
      {!choice ? <aside id="privacy-consent-notice" className="privacy-consent-notice" role="dialog" aria-modal="false">{panel}</aside> : null}
      {choice && open ? <aside className="privacy-consent-notice__dialog privacy-consent-notice" role="dialog" aria-modal="false">{panel}<p className="privacy-consent-notice__saved">{t.saved}</p><div className="privacy-consent-notice__actions"><button type="button" className="privacy-consent-notice__secondary" onClick={resetChoice}>{t.reset}</button><button type="button" className="privacy-consent-notice__secondary" onClick={() => setOpen(false)}>{t.close}</button></div></aside> : null}
    </>
  );
}
