import React, { useState } from "react";

const policy = {
  ur: {
    label: "عوامی پرائیویسی پالیسی · آزمائشی ورژن",
    title: "پرائیویسی پالیسی اور آزمائشی خدمت کی وضاحت",
    updated: "آخری عملیاتی جائزہ: 26 اگست 2026",
    back: "← ایپ پر واپس جائیں",
    intro: "Tax Return Saathi ایک آزاد، عوامی، تعلیمی اور تیاری کی آزمائشی خدمت ہے۔ یہ ایف بی آر نہیں ہے، نہ ریٹرن جمع کرتی ہے، نہ ایف بی آر کی جانچ دہراتی ہے، نہ انفرادی ٹیکس یا قانونی فیصلہ دیتی ہے۔ یہ صفحہ موجودہ عملی ڈیٹا طریقوں کو واضح کرتا ہے؛ یہ قانونی سرٹیفکیشن یا ہر مقام کے لیے مکمل قانونی نوٹس کا دعویٰ نہیں کرتا۔",
    sections: [
      { h: "آزمائشی حیثیت اور دائرہ", b: "خصوصیات آزمائشی مرحلے میں ہیں اور استعمال کے تجربے یا حفاظت بہتر کرنے کے لیے بدل سکتی ہیں۔ سرکاری فائلنگ، ڈیڈ لائن، اہلیت، ٹیکس نتیجے یا ایف بی آر کے فیصلے کی تصدیق کے لیے صرف ایف بی آر یا مستند پیشہ ور سے رجوع کریں۔" },
      { h: "ہم کن معلومات کے ساتھ کام کرتے ہیں", b: "عوامی ٹولز میں براؤزر کے اندر عارضی تیاری انتخاب ہو سکتے ہیں۔ اختیاری سائن اِن صارف کے لیے محدود چیک لسٹ ڈرافٹ اور صرف پانچ مقررہ تیاری ترجیحات اکاؤنٹ سے منسلک ہو سکتی ہیں۔ فیڈبیک اکاؤنٹ یا رابطے سے منسلک نہیں کیا جاتا اور حساس شناختی یا مالی تفصیل شامل نہ کرنے کی ہدایت دی جاتی ہے۔" },
      { h: "فائل، نوٹس اور AI کی درخواست", b: "اگر آپ تعلیمی AI وضاحت کے لیے متن یا چھپائی ہوئی فائل بھیجتے ہیں تو وہ صرف درخواست کا جواب بنانے کے لیے سرور سائیڈ مینیجڈ AI راستے سے گزرتی ہے۔ ایپ اسے اپنے ڈیٹابیس میں محفوظ نہیں کرتی۔ حساس مواد، پاس ورڈ، OTP، مکمل CNIC/NTN، بینک، کارڈ یا IBAN تفصیل کبھی نہ بھیجیں۔" },
      { h: "مدت، حذف اور براؤزر کنٹرول", b: "گمنام فیڈبیک 30 دن کے بعد خودکار طور پر حذف ہونے کے لیے مقرر ہے۔ سائن اِن صارف Resource Hub میں اپنی اکاؤنٹ میں رکھی چیک لسٹ ڈرافٹ اور کم سے کم تیاری پروفائل حذف کر سکتے ہیں۔ براؤزر میں محفوظ مقامی ڈرافٹ یا رازداری انتخاب کو اسی براؤزر کے کنٹرول سے ہٹایا جا سکتا ہے۔" },
      { h: "کوکیز، مقامی انتخاب اور EU/EEA/UK", b: "ضروری سیشن اور سیکیورٹی ٹیکنالوجی سائن اِن خدمت کے لیے استعمال ہو سکتی ہے۔ اختیاری رازداری نوٹس تمام وزیٹرز کو دکھایا جاتا ہے، بشمول EU/EEA/UK، بغیر مقام معلوم کیے۔ اس وقت ایپ Google Ads یا analytics tracking نہیں چلاتی؛ قبول یا مسترد کرنے کا مقامی انتخاب صرف نوٹس کو یاد رکھنے کے لیے ہے اور کسی اشتہار کو فعال نہیں کرتا۔" },
      { h: "تیسرے فریق اور اشتہارات", b: "انٹرفیس Urdu فونٹ کے لیے Google Fonts اور style utility کے لیے Tailwind CDN resource لوڈ کر سکتا ہے اور سائن اِن کے لیے ہوسٹنگ پلیٹ فارم کا OAuth استعمال کرتا ہے۔ یہ ایپ اس وقت Google Ads، AdSense tags یا analytics tags نہیں چلاتی۔ اگر اشتہارات مستقبل میں شامل ہوں تو متعلقہ مقام کے لیے باقاعدہ consent-management، vendor disclosure، tag configuration اور پالیسی کا جائزہ لازم ہو گا؛ موجودہ نوٹس Google-certified CMP نہیں ہے۔" },
      { h: "رابطہ اور حق کی درخواست", b: "اس ایپ میں الگ عوامی data-protection contact یا DPO شائع نہیں کیا گیا۔ اکاؤنٹ والا ڈیٹا اوپر بیان کردہ self-service controls سے حذف کریں۔ حساس تفصیل، شناخت یا ٹیکس معاملہ فیڈبیک فارم میں نہ بھیجیں۔ EU/EEA/UK سمیت کسی مقام کے حق، نمائندہ، قانونی بنیاد یا ریگولیٹری شکایت کے تقاضے کے لیے service owner کو مناسب قانونی مشورے کے ساتھ یہ تفصیل مکمل کرنی چاہیے۔" },
    ],
  },
  en: {
    label: "Public privacy policy · pilot release",
    title: "Privacy policy and pilot-service notice",
    updated: "Last operational review: 26 August 2026",
    back: "← Back to the app",
    intro: "Tax Return Saathi is an independent public education and preparation pilot. It is not FBR, does not submit returns, reproduce FBR checks, or make individual tax or legal decisions. This page describes current operational data practices; it is not a legal certification or a claim that every legal notice requirement is complete in every location.",
    sections: [
      { h: "Pilot status and scope", b: "Features are being tested and may change to improve safety or usability. For an official filing, deadline, eligibility, tax result, or FBR decision, use FBR’s official route or a qualified professional." },
      { h: "Information we work with", b: "Public tools may hold temporary preparation choices in the browser. An optional signed-in user may have a limited checklist draft and only five controlled preparation preferences connected to an account. Feedback is not linked to an account or contact details, and people are told not to include sensitive identity or financial information." },
      { h: "Files, notices, and AI requests", b: "If you send text or a redacted file for an educational AI explanation, it passes through a server-side managed AI pathway solely to answer that request. The app does not store that content in its own database. Never send sensitive content, passwords, OTPs, full CNIC/NTN, bank, card, or IBAN details." },
      { h: "Retention, deletion, and browser controls", b: "Anonymous feedback is scheduled for automatic deletion after 30 days. Signed-in users can delete account-held checklist draft data and the minimal preparation profile in the Resource Hub. A local draft or privacy choice can be removed with controls in the same browser." },
      { h: "Cookies, local choice, and EU/EEA/UK visitors", b: "Necessary session and security technology may be used for sign-in. An optional privacy notice is shown to every visitor, including people in the EU/EEA/UK, without determining location. The app does not currently run Google Ads or analytics tracking; an accept-or-decline local choice only remembers the notice and does not activate advertising." },
      { h: "Third parties and advertising", b: "The interface may load Google Fonts for Urdu typography, a Tailwind CDN resource for styling, and the hosting platform’s OAuth for sign-in. The app does not currently run Google Ads, AdSense tags, or analytics tags. If advertising is introduced, location-appropriate consent management, vendor disclosure, tag configuration, and policy review will be required; the current notice is not a Google-certified CMP." },
      { h: "Contact and rights requests", b: "A separate public data-protection contact or DPO is not currently published in this app. Use the self-service controls above for account-held data. Do not send sensitive details, identity information, or tax matters through feedback. For EU/EEA/UK and other location-specific rights, representative, lawful-basis, or regulator-complaint requirements, the service owner must complete the necessary details with appropriate legal advice." },
    ],
  },
};

export default function PublicPrivacyPolicy() {
  const [language, setLanguage] = useState("ur");
  const t = policy[language];

  return (
    <main className="public-privacy-policy" dir={language === "ur" ? "rtl" : "ltr"}>
      <style>{`
        .public-privacy-policy { min-height: 100vh; padding: 32px 16px 56px; background: #f6f4ec; color: #1d2321; font-family: Georgia, 'Times New Roman', serif; }
        .public-privacy-policy__inner { max-width: 760px; margin: 0 auto; }
        .public-privacy-policy__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 3px solid #c9a227; padding-bottom: 16px; }
        .public-privacy-policy__label { margin: 0 0 6px; color: #7a6210; font: 700 12px/1.3 system-ui, sans-serif; letter-spacing: .04em; }
        .public-privacy-policy h1 { margin: 0; color: #0b3d2e; font-size: clamp(26px, 5vw, 38px); line-height: 1.2; }
        .public-privacy-policy__updated { margin: 8px 0 0; color: #625f4e; font-size: 13px; }
        .public-privacy-policy__lang { min-height: 38px; border: 1px solid #0b3d2e; border-radius: 8px; background: #fffdf5; color: #0b3d2e; padding: 8px 10px; font: 700 12px/1 system-ui, sans-serif; cursor: pointer; }
        .public-privacy-policy__intro { margin: 22px 0; border-inline-start: 4px solid #c9a227; background: #fffaf0; padding: 14px 16px; color: #173b31; font-size: 15px; line-height: 1.7; }
        .public-privacy-policy__grid { display: grid; gap: 12px; }
        .public-privacy-policy__card { border: 1px solid #ddd6c4; border-radius: 12px; background: #fff; padding: 16px; }
        .public-privacy-policy__card h2 { margin: 0 0 7px; color: #155e43; font-size: 18px; }
        .public-privacy-policy__card p { margin: 0; font-size: 14px; line-height: 1.7; }
        .public-privacy-policy__back { display: inline-flex; margin-top: 24px; border-radius: 9px; background: #0b3d2e; color: #fffdf5; padding: 10px 14px; font: 700 13px/1.2 system-ui, sans-serif; text-decoration: none; }
        .public-privacy-policy button:focus-visible, .public-privacy-policy a:focus-visible { outline: 3px solid rgba(202,165,24,.65); outline-offset: 3px; }
        @media (max-width: 560px) { .public-privacy-policy { padding: 22px 12px 68px; } .public-privacy-policy__top { gap: 10px; } }
      `}</style>
      <div className="public-privacy-policy__inner">
        <header className="public-privacy-policy__top">
          <div>
            <p className="public-privacy-policy__label">{t.label}</p>
            <h1>{t.title}</h1>
            <p className="public-privacy-policy__updated">{t.updated}</p>
          </div>
          <button type="button" className="public-privacy-policy__lang" onClick={() => setLanguage(language === "ur" ? "en" : "ur")}>{language === "ur" ? "English" : "اردو"}</button>
        </header>
        <p className="public-privacy-policy__intro">{t.intro}</p>
        <section className="public-privacy-policy__grid" aria-label={language === "ur" ? "پرائیویسی پالیسی کے حصے" : "Privacy policy sections"}>
          {t.sections.map((section) => <article className="public-privacy-policy__card" key={section.h}><h2>{section.h}</h2><p>{section.b}</p></article>)}
        </section>
        <a href="/" className="public-privacy-policy__back">{t.back}</a>
      </div>
    </main>
  );
}
