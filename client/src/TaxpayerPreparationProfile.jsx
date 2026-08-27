import { useEffect, useMemo, useState } from "react";
import { startLogin } from "./const";
import { trpc } from "./lib/trpc";
import { buildProfilePreparationDashboard, FIRST_TIME_PREPARATION_ROUTE } from "./profilePreparationDashboard";

const PATHS = [
  ["salaried", "Salaried preparation", "تنخواہ دار تیاری"],
  ["freelancer", "Freelance preparation", "فری لانس تیاری"],
  ["business_owner", "Business preparation", "کاروباری تیاری"],
  ["property_owner", "Property preparation", "جائیداد کی تیاری"],
  ["investor", "Investment preparation", "سرمایہ کاری کی تیاری"],
  ["overseas_connection", "Overseas connection", "بیرونِ ملک تعلق"],
  ["not_sure", "I am not sure yet", "ابھی یقین نہیں"],
];

const EMPTY_PROFILE = { preferredLanguage: "ur", taxYearContext: "ty_2026", preparationPaths: [], filingFamiliarity: "not_sure", resourceOrder: "guided" };

function payloadFromForm(form) {
  return {
    version: 1,
    preferredLanguage: form.preferredLanguage,
    taxYearContext: form.taxYearContext,
    preparationPaths: form.preparationPaths,
    filingFamiliarity: form.filingFamiliarity,
    resourceOrder: form.resourceOrder,
  };
}

function formFromProfile(profile) {
  if (!profile) return EMPTY_PROFILE;
  return {
    preferredLanguage: profile.preferredLanguage || "ur",
    taxYearContext: profile.taxYearContext || "ty_2026",
    preparationPaths: profile.preparationPaths || [],
    filingFamiliarity: profile.filingFamiliarity || "not_sure",
    resourceOrder: profile.resourceOrder || "guided",
  };
}

function PreparationRouteCards({ route, firstTime = false }) {
  const headingId = firstTime ? "first-time-preparation-route" : "profile-preparation-route";
  return <section className="taxpayer-profile__route" aria-labelledby={headingId}>
    <h3 id={headingId} className="taxpayer-profile__route-title">{route.title} <span lang="ur" dir="rtl">{route.titleUrdu}</span></h3>
    <p className="taxpayer-profile__boundary">{route.boundary}<br /><span lang="ur" dir="rtl">{route.boundaryUrdu}</span></p>
    <ol className="taxpayer-profile__route-list">{route.cards.map((card) => <li className="taxpayer-profile__route-card" key={card.id}>
      <strong>{card.title} <span lang="ur" dir="rtl">{card.titleUrdu}</span></strong>
      <p>{card.reason}<br /><span lang="ur" dir="rtl">{card.reasonUrdu}</span></p>
      <a href={card.sourceUrl} target="_blank" rel="noreferrer">{card.sourceLabel} ↗</a>
      <small>Reviewed {card.reviewedOn} · {card.scope}<br /><span lang="ur" dir="rtl">{card.scopeUrdu}</span></small>
    </li>)}</ol>
    {!firstTime && <details className="taxpayer-profile__why"><summary>Why these resources? <span lang="ur" dir="rtl">یہ ذرائع کیوں؟</span></summary><ul>{route.why.map((reason, index) => <li key={index}>{reason.text}<br /><span lang="ur" dir="rtl">{reason.urdu}</span></li>)}</ul><p>This explanation uses only the five saved preferences. It does not profile behaviour, infer financial or identity data, or share your preferences.</p></details>}
  </section>;
}

export default function TaxpayerPreparationProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [notice, setNotice] = useState("");
  const { data: accountUser, isLoading: isAccountLoading } = trpc.auth.me.useQuery();
  const profileQuery = trpc.taxpayerProfile.get.useQuery(undefined, { enabled: Boolean(accountUser), retry: false });
  const utils = trpc.useUtils();
  const hasProfile = Boolean(profileQuery.data);
  const profileSummary = useMemo(() => profileQuery.data?.preparationPaths?.map((path) => PATHS.find(([id]) => id === path)?.[1]).filter(Boolean).join(", ") || "No preparation paths selected", [profileQuery.data]);
  const profileRoute = useMemo(() => hasProfile ? buildProfilePreparationDashboard(profileQuery.data) : null, [hasProfile, profileQuery.data]);

  useEffect(() => {
    if (profileQuery.data && !isEditing) setForm(formFromProfile(profileQuery.data));
  }, [profileQuery.data, isEditing]);

  const refresh = () => utils.taxpayerProfile.get.invalidate();
  const createMutation = trpc.taxpayerProfile.create.useMutation({ onSuccess: () => { refresh(); setIsEditing(false); setConsent(false); setNotice("Preparation preferences saved to your account. You can edit or permanently delete them at any time."); } });
  const updateMutation = trpc.taxpayerProfile.update.useMutation({ onSuccess: () => { refresh(); setIsEditing(false); setNotice("Preparation preferences updated."); } });
  const deleteMutation = trpc.taxpayerProfile.delete.useMutation({ onSuccess: () => { refresh(); setForm(EMPTY_PROFILE); setConsent(false); setNotice("Preparation profile permanently deleted. Your separate checklist draft was not deleted."); } });

  const open = () => {
    setIsOpen((value) => !value);
    setNotice("");
    if (!isOpen) setForm(formFromProfile(profileQuery.data));
  };
  useEffect(() => {
    const openPreferences = () => {
      setIsOpen(true);
      setNotice("");
      setForm(formFromProfile(profileQuery.data));
    };
    const closePreferences = () => setIsOpen(false);
    window.addEventListener("tax-return-saathi:open-preferences", openPreferences);
    window.addEventListener("tax-return-saathi:close-supplemental-panels", closePreferences);
    return () => {
      window.removeEventListener("tax-return-saathi:open-preferences", openPreferences);
      window.removeEventListener("tax-return-saathi:close-supplemental-panels", closePreferences);
    };
  }, [profileQuery.data]);
  const togglePath = (path) => setForm((current) => ({ ...current, preparationPaths: current.preparationPaths.includes(path) ? current.preparationPaths.filter((item) => item !== path) : [...current.preparationPaths, path] }));
  const save = () => {
    const payload = payloadFromForm(form);
    if (hasProfile) updateMutation.mutate(payload);
    else createMutation.mutate({ ...payload, consent: true });
  };

  return (
    <aside className="taxpayer-profile" aria-label="Optional taxpayer preparation profile">
      <style>{`
        .taxpayer-profile { position: fixed; z-index: 80; right: 16px; bottom: 84px; font-family: Georgia, 'Times New Roman', serif; color: #173b31; }
        .taxpayer-profile__button:hover, .taxpayer-profile__button:focus-visible { outline:3px solid rgba(202,165,24,.35); outline-offset:2px; }
        .taxpayer-profile__panel { width:min(430px, calc(100vw - 32px)); max-height:calc(100vh - 160px); margin-bottom:10px; overflow:auto; border:1px solid #d6bd67; border-radius:14px; background:#fffdf7; box-shadow:0 20px 50px rgba(10,43,33,.28); }
        .taxpayer-profile__header { display:flex; justify-content:space-between; gap:10px; padding:15px 16px 13px; background:#0B3D2E; color:#fffdf2; }
        .taxpayer-profile__eyebrow { margin:0 0 4px; color:#ead675; font:700 10px/1.25 Arial,sans-serif; letter-spacing:.06em; text-transform:uppercase; }
        .taxpayer-profile__title { margin:0; font-size:19px; line-height:1.2; }.taxpayer-profile__urdu { display:block; margin-top:3px; color:#f3e79e; font-size:14px; }
        .taxpayer-profile__close { border:0; border-radius:50%; background:transparent; color:#fffdf2; cursor:pointer; min-width:32px; min-height:32px; font:700 21px/1 Arial,sans-serif; }
        .taxpayer-profile__body { padding:15px 16px 17px; }.taxpayer-profile__notice, .taxpayer-profile__boundary, .taxpayer-profile__summary { margin:0 0 12px; border-left:3px solid #caa518; padding:9px 0 9px 10px; background:#faf5df; color:#4c503c; font-size:12px; line-height:1.45; }
        .taxpayer-profile__notice { border-left-color:#0B3D2E; background:#edf5ee; }.taxpayer-profile__group { margin:14px 0 0; border:0; padding:0; }.taxpayer-profile__legend { margin:0 0 6px; color:#0B3D2E; font-size:14px; font-weight:700; }.taxpayer-profile__hint { margin:0 0 8px; color:#5b5b46; font-size:12px; line-height:1.4; }
        .taxpayer-profile__choices { display:grid; gap:6px; }.taxpayer-profile__choice { display:flex; align-items:flex-start; gap:8px; border:1px solid #e0d6aa; border-radius:9px; background:#fffefb; padding:8px; color:#173b31; font-size:12px; line-height:1.3; }.taxpayer-profile__choice:focus-within { outline:3px solid rgba(202,165,24,.3); outline-offset:2px; }.taxpayer-profile__choice input { margin-top:2px; accent-color:#0B3D2E; }
        .taxpayer-profile__actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; }.taxpayer-profile__button { border:1px solid #0B3D2E; border-radius:8px; background:#0B3D2E; color:#fffdf2; cursor:pointer; padding:9px 11px; font:700 12px/1.2 inherit; }.taxpayer-profile__button--secondary { background:#fffdf7; color:#0B3D2E; }.taxpayer-profile__button--danger { border-color:#8b2e26; color:#8b2e26; }.taxpayer-profile__button:disabled { cursor:not-allowed; opacity:.5; }
        @media (max-width:520px) { .taxpayer-profile { right:12px; bottom:74px; }.taxpayer-profile__panel { max-height:calc(100vh - 158px); } }
      `}</style>
      <style>{`
        .taxpayer-profile__route { margin:16px 0 0; border-top:1px solid #e0d6aa; padding-top:14px; }.taxpayer-profile__route-title { margin:0 0 8px; color:#0B3D2E; font-size:15px; }.taxpayer-profile__route-list { display:grid; gap:8px; margin:0; padding:0; list-style:none; }.taxpayer-profile__route-card { border:1px solid #e0d6aa; border-radius:9px; background:#fffefb; padding:9px; color:#24483d; font-size:12px; line-height:1.4; }.taxpayer-profile__route-card p { margin:5px 0; }.taxpayer-profile__route-card a { color:#0B3D2E; font-weight:700; }.taxpayer-profile__route-card small { display:block; margin-top:6px; color:#5b5b46; }.taxpayer-profile__why { margin-top:10px; border:1px solid #d6bd67; border-radius:8px; padding:8px; color:#4c503c; font-size:12px; line-height:1.4; }.taxpayer-profile__why summary { cursor:pointer; color:#0B3D2E; font-weight:700; }.taxpayer-profile__why ul { padding-left:18px; }
      `}</style>
      {isOpen && <section className="taxpayer-profile__panel" aria-live="polite">
        <header className="taxpayer-profile__header"><div><p className="taxpayer-profile__eyebrow">Optional account preference · not an FBR profile</p><h2 className="taxpayer-profile__title">My preparation preferences <span className="taxpayer-profile__urdu" lang="ur" dir="rtl">میری تیاری کی ترجیحات</span></h2></div><button className="taxpayer-profile__close" type="button" onClick={() => setIsOpen(false)} aria-label="Close preparation preferences">×</button></header>
        <div className="taxpayer-profile__body">
          <p className="taxpayer-profile__boundary"><strong>Privacy boundary:</strong> this optional profile stores only five controlled preparation preferences. It does not ask for CNIC, NTN, amounts, bank details, documents, passwords, OTPs, IRIS access, filing status, notices, or outcomes. It is not FBR and cannot determine your tax, deadline, filing, or result.<br /><span lang="ur" dir="rtl">یہ اختیاری پروفائل صرف پانچ محدود تیاری کی ترجیحات رکھتا ہے؛ یہ شناختی نمبر، رقم، دستاویز، پاس ورڈ یا فائلنگ کا نتیجہ نہیں لیتا۔</span></p>
          {!accountUser ? <><p className="taxpayer-profile__summary">Sign in is required only if you choose to create these optional account preferences. You can use all educational tools without a profile.</p><PreparationRouteCards route={FIRST_TIME_PREPARATION_ROUTE} firstTime /><div className="taxpayer-profile__actions"><button className="taxpayer-profile__button" type="button" onClick={startLogin} disabled={isAccountLoading}>Sign in to create preferences</button></div></> : <>
            {notice && <p className="taxpayer-profile__notice" role="status">{notice}</p>}
            {profileQuery.isLoading ? <p className="taxpayer-profile__summary">Checking whether you have optional preparation preferences…</p> : !isEditing ? <>
              <p className="taxpayer-profile__summary"><strong>{hasProfile ? "Saved preparation preferences" : "No preparation profile yet"}</strong><br />{hasProfile ? `${profileSummary}. This only organises educational tools; it is not a tax or filing result.` : "You may continue without a profile, or create a small optional preference set."}</p>
              {hasProfile ? <PreparationRouteCards route={profileRoute} /> : <PreparationRouteCards route={FIRST_TIME_PREPARATION_ROUTE} firstTime />}
              <div className="taxpayer-profile__actions"><button className="taxpayer-profile__button" type="button" onClick={() => { setForm(formFromProfile(profileQuery.data)); setIsEditing(true); }}>{hasProfile ? "Edit preferences" : "Create optional preferences"}</button>{hasProfile && <button className="taxpayer-profile__button taxpayer-profile__button--secondary taxpayer-profile__button--danger" type="button" onClick={() => { if (window.confirm("Permanently delete only your preparation profile? Your checklist draft will remain separate.")) deleteMutation.mutate({ confirmation: "DELETE_MY_PREPARATION_PROFILE" }); }} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? "Deleting…" : "Permanently delete profile"}</button>}</div>
            </> : <form onSubmit={(event) => { event.preventDefault(); save(); }}>
              <fieldset className="taxpayer-profile__group"><legend className="taxpayer-profile__legend">Language <span lang="ur" dir="rtl">زبان</span></legend><div className="taxpayer-profile__choices">{[["ur", "Urdu first", "اردو پہلے"], ["en", "English first", "انگریزی پہلے"]].map(([value, label, urdu]) => <label className="taxpayer-profile__choice" key={value}><input type="radio" name="profile-language" checked={form.preferredLanguage === value} onChange={() => setForm((current) => ({ ...current, preferredLanguage: value }))} /><span>{label} <span lang="ur" dir="rtl">{urdu}</span></span></label>)}</div></fieldset>
              <fieldset className="taxpayer-profile__group"><legend className="taxpayer-profile__legend">Preparation source scope <span lang="ur" dir="rtl">تیاری کے ذریعہ کا دائرہ</span></legend><div className="taxpayer-profile__choices">{[["ty_2026", "Tax Year 2026 reviewed sources", "ٹیکس سال 2026 کے جانچے گئے ذرائع"], ["other_or_unsure", "Another year or not sure", "دوسرا سال یا یقین نہیں"]].map(([value, label, urdu]) => <label className="taxpayer-profile__choice" key={value}><input type="radio" name="profile-year" checked={form.taxYearContext === value} onChange={() => setForm((current) => ({ ...current, taxYearContext: value }))} /><span>{label} <span lang="ur" dir="rtl">{urdu}</span></span></label>)}</div></fieldset>
              <fieldset className="taxpayer-profile__group"><legend className="taxpayer-profile__legend">Broad preparation paths <span lang="ur" dir="rtl">عمومی تیاری کے راستے</span></legend><p className="taxpayer-profile__hint">Choose only broad learning paths. Do not enter personal details.</p><div className="taxpayer-profile__choices">{PATHS.map(([id, label, urdu]) => <label className="taxpayer-profile__choice" key={id}><input type="checkbox" checked={form.preparationPaths.includes(id)} onChange={() => togglePath(id)} /><span>{label} <span lang="ur" dir="rtl">{urdu}</span></span></label>)}</div></fieldset>
              <fieldset className="taxpayer-profile__group"><legend className="taxpayer-profile__legend">Filing familiarity <span lang="ur" dir="rtl">فائلنگ کی واقفیت</span></legend><div className="taxpayer-profile__choices">{[["first_time", "First time", "پہلی بار"], ["filed_before", "Filed before", "پہلے فائل کیا ہے"], ["not_sure", "Not sure", "یقین نہیں"]].map(([value, label, urdu]) => <label className="taxpayer-profile__choice" key={value}><input type="radio" name="profile-familiarity" checked={form.filingFamiliarity === value} onChange={() => setForm((current) => ({ ...current, filingFamiliarity: value }))} /><span>{label} <span lang="ur" dir="rtl">{urdu}</span></span></label>)}</div></fieldset>
              <fieldset className="taxpayer-profile__group"><legend className="taxpayer-profile__legend">Resource order <span lang="ur" dir="rtl">ذرائع کی ترتیب</span></legend><div className="taxpayer-profile__choices">{[["guided", "Guided learning", "رہنمائی کے ساتھ"], ["review_first", "Review first", "پہلے جائزہ"], ["source_first", "Official sources first", "پہلے سرکاری ذرائع"]].map(([value, label, urdu]) => <label className="taxpayer-profile__choice" key={value}><input type="radio" name="profile-order" checked={form.resourceOrder === value} onChange={() => setForm((current) => ({ ...current, resourceOrder: value }))} /><span>{label} <span lang="ur" dir="rtl">{urdu}</span></span></label>)}</div></fieldset>
              {!hasProfile && <label className="taxpayer-profile__choice" style={{ marginTop: 15 }}><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I choose to save only these optional preparation preferences to my account. I can edit or permanently delete them. <span lang="ur" dir="rtl">میں صرف ان اختیاری ترجیحات کو اپنے اکاؤنٹ میں محفوظ کرنے کا انتخاب کرتا/کرتی ہوں۔</span></span></label>}
              <div className="taxpayer-profile__actions"><button className="taxpayer-profile__button taxpayer-profile__button--secondary" type="button" onClick={() => { setIsEditing(false); setConsent(false); setForm(formFromProfile(profileQuery.data)); }}>Cancel</button><button className="taxpayer-profile__button" type="submit" disabled={(!hasProfile && !consent) || createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Saving…" : hasProfile ? "Save changes" : "Save optional preferences"}</button></div>
            </form>}
          </>}
        </div>
      </section>}
    </aside>
  );
}
