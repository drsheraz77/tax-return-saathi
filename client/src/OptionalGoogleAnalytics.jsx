import { useEffect, useState } from "react";
import {
  PRIVACY_CONSENT_CHANGE_EVENT,
  PRIVACY_CONSENT_CHOICES,
  getStoredPrivacyConsent,
} from "./privacyConsent.js";

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-VJWBMPJSHW";
const GOOGLE_TAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_MEASUREMENT_ID}`;
const GOOGLE_ANALYTICS_SCRIPT_ID = "tax-return-saathi-google-analytics";
let lastAppliedChoice = null;

const deniedConsent = Object.freeze({
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

function gtag(...args) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

function clearGoogleAnalyticsCookies() {
  if (typeof document === "undefined") return;
  document.cookie.split(";").forEach((entry) => {
    const name = entry.trim().split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  });
}

export function applyOptionalAnalyticsConsent(choice) {
  if (typeof window === "undefined") return false;

  if (choice !== PRIVACY_CONSENT_CHOICES.accepted) {
    if (window.dataLayer) gtag("consent", "update", deniedConsent);
    document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)?.remove();
    clearGoogleAnalyticsCookies();
    lastAppliedChoice = choice;
    return false;
  }

  if (lastAppliedChoice === PRIVACY_CONSENT_CHOICES.accepted) return true;
  gtag("consent", "default", deniedConsent);
  gtag("consent", "update", { ...deniedConsent, analytics_storage: "granted" });

  if (!document.getElementById(GOOGLE_ANALYTICS_SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = GOOGLE_ANALYTICS_SCRIPT_ID;
    script.async = true;
    script.src = GOOGLE_TAG_SRC;
    document.head.appendChild(script);
  }

  gtag("js", new Date());
  gtag("config", GOOGLE_ANALYTICS_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  lastAppliedChoice = PRIVACY_CONSENT_CHOICES.accepted;
  return true;
}

export default function OptionalGoogleAnalytics() {
  const [choice, setChoice] = useState(() => getStoredPrivacyConsent());

  useEffect(() => {
    const updateChoice = (event) => setChoice(event.detail?.choice ?? getStoredPrivacyConsent());
    window.addEventListener(PRIVACY_CONSENT_CHANGE_EVENT, updateChoice);
    return () => window.removeEventListener(PRIVACY_CONSENT_CHANGE_EVENT, updateChoice);
  }, []);

  useEffect(() => {
    applyOptionalAnalyticsConsent(choice);
  }, [choice]);

  return null;
}
