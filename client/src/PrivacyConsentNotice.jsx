import React, { useEffect, useState } from "react";
import {
  PRIVACY_CONSENT_CHOICES,
  clearPrivacyConsent,
  getStoredPrivacyConsent,
  savePrivacyConsent,
} from "./privacyConsent.js";

const copy = {
  ur: {
    title: "رازداری کا انتخاب",
    body: "یہ آزمائشی خدمت اس وقت اشتہاری یا تجزیاتی ٹریکنگ نہیں چلاتی۔ یہ نوٹس ہر وزیٹر کو دکھایا جاتا ہے، بشمول EU/EEA/UK، اور آپ کے مقام کا تعین نہیں کرتا۔ انتخاب صرف اسی براؤزر میں یاد رکھا جاتا ہے۔",
    accept: "اختیاری استعمال منظور کریں",
    decline: "اختیاری استعمال مسترد کریں",
    policy: "پرائیویسی پالیسی پڑھیں",
    manage: "رازداری کا انتخاب تبدیل کریں",
    saved: "رازداری کا انتخاب مقامی طور پر محفوظ ہے۔ آپ اسے کسی بھی وقت تبدیل کر سکتے ہیں۔",
    close: "بند کریں",
    reset: "انتخاب دوبارہ کریں",
  },
  en: {
    title: "Privacy choice",
    body: "This pilot service does not currently run advertising or analytics tracking. This notice is shown to every visitor, including people in the EU/EEA/UK, without determining your location. Your choice is remembered only in this browser.",
    accept: "Allow optional use",
    decline: "Decline optional use",
    policy: "Read the privacy policy",
    manage: "Change privacy choice",
    saved: "Your privacy choice is stored locally. You can change it at any time.",
    close: "Close",
    reset: "Choose again",
  },
};

export default function PrivacyConsentNotice() {
  const [language, setLanguage] = useState("ur");
  const [choice, setChoice] = useState(null);
  const [open, setOpen] = useState(false);
  const t = copy[language];

  useEffect(() => {
    setChoice(getStoredPrivacyConsent());
  }, []);

  function choose(nextChoice) {
    const saved = savePrivacyConsent(nextChoice);
    setChoice(saved ?? nextChoice);
    setOpen(false);
  }

  function resetChoice() {
    clearPrivacyConsent();
    setChoice(null);
    setOpen(true);
  }

  const panel = (
    <section className="privacy-consent-notice__panel" aria-labelledby="privacy-consent-title" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="privacy-consent-notice__heading-row">
        <div>
          <p className="privacy-consent-notice__eyebrow">Pilot privacy notice · {language === "ur" ? "آزمائشی رازداری نوٹس" : "Privacy notice"}</p>
          <h2 id="privacy-consent-title">{t.title}</h2>
        </div>
        <button type="button" className="privacy-consent-notice__language" onClick={() => setLanguage(language === "ur" ? "en" : "ur")}>
          {language === "ur" ? "English" : "اردو"}
        </button>
      </div>
      <p>{t.body}</p>
      <p className="privacy-consent-notice__boundary">
        {language === "ur" ? "یہ مقامی انتخاب Google-certified CMP، قانونی سرٹیفکیشن، یا AdSense کی منظوری نہیں ہے۔" : "This local choice is not a Google-certified CMP, legal certification, or AdSense approval."}
      </p>
      <div className="privacy-consent-notice__actions">
        <button type="button" className="privacy-consent-notice__primary" onClick={() => choose(PRIVACY_CONSENT_CHOICES.accepted)}>{t.accept}</button>
        <button type="button" className="privacy-consent-notice__secondary" onClick={() => choose(PRIVACY_CONSENT_CHOICES.declined)}>{t.decline}</button>
        <a href="/privacy" className="privacy-consent-notice__link">{t.policy}</a>
      </div>
    </section>
  );

  return (
    <>
      <style>{`
        .privacy-consent-notice { position: fixed; z-index: 80; inset: auto 16px 16px; max-width: 700px; margin: 0 auto; }
        .privacy-consent-notice__panel { border: 1px solid #b7ab79; border-radius: 14px; padding: 16px; background: #fffdf5; box-shadow: 0 14px 34px rgba(11,61,46,.2); color: #173b31; font-family: Georgia, 'Times New Roman', serif; }
        .privacy-consent-notice__heading-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .privacy-consent-notice__eyebrow { margin: 0 0 4px; color: #7a6210; font: 700 11px/1.25 system-ui, sans-serif; letter-spacing: .03em; }
        .privacy-consent-notice__panel h2 { margin: 0; color: #0b3d2e; font-size: 18px; }
        .privacy-consent-notice__panel p { margin: 10px 0 0; font-size: 13px; line-height: 1.55; }
        .privacy-consent-notice__boundary { color: #625f4e; font-size: 12px !important; }
        .privacy-consent-notice__language, .privacy-consent-notice__primary, .privacy-consent-notice__secondary, .privacy-consent-notice__manage { min-height: 38px; border-radius: 8px; padding: 8px 10px; font: 700 12px/1.2 system-ui, sans-serif; cursor: pointer; }
        .privacy-consent-notice__language { border: 1px solid #b7ab79; background: #fffef9; color: #173b31; }
        .privacy-consent-notice__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; }
        .privacy-consent-notice__primary { border: 1px solid #0b3d2e; background: #0b3d2e; color: #fffdf5; }
        .privacy-consent-notice__secondary { border: 1px solid #0b3d2e; background: #fffdf5; color: #0b3d2e; }
        .privacy-consent-notice__link { color: #0b3d2e; font: 700 12px/1.2 system-ui, sans-serif; text-decoration: underline; }
        .privacy-consent-notice__manage { position: fixed; z-index: 79; inset: auto 16px 16px auto; border: 1px solid #0b3d2e; background: #fffdf5; color: #0b3d2e; box-shadow: 0 5px 16px rgba(11,61,46,.18); }
        .privacy-consent-notice__dialog { position: fixed; z-index: 80; inset: auto 16px 16px; max-width: 700px; margin: 0 auto; }
        .privacy-consent-notice__saved { margin-top: 10px !important; color: #075c48; font-weight: 700; }
        .privacy-consent-notice button:focus-visible, .privacy-consent-notice a:focus-visible { outline: 3px solid rgba(202,165,24,.55); outline-offset: 3px; }
        @media (max-width: 560px) { .privacy-consent-notice { inset: auto 10px 10px; } .privacy-consent-notice__dialog { inset: auto 10px 10px; } .privacy-consent-notice__manage { inset: auto 10px 10px auto; } .privacy-consent-notice__heading-row { align-items: center; } }
      `}</style>
      {!choice ? <aside id="privacy-consent-notice" className="privacy-consent-notice" role="dialog" aria-modal="false">{panel}</aside> : null}
      {choice ? (
        <>
          <button type="button" className="privacy-consent-notice__manage" onClick={() => setOpen(true)}>{t.manage}</button>
          {open ? <aside className="privacy-consent-notice__dialog privacy-consent-notice" role="dialog" aria-modal="false">{panel}<p className="privacy-consent-notice__saved">{t.saved}</p><div className="privacy-consent-notice__actions"><button type="button" className="privacy-consent-notice__secondary" onClick={resetChoice}>{t.reset}</button><button type="button" className="privacy-consent-notice__secondary" onClick={() => setOpen(false)}>{t.close}</button></div></aside> : null}
        </>
      ) : null}
    </>
  );
}
