import { useEffect, useState } from "react";
import { trpc } from "./lib/trpc";
import {
  PRIVACY_CONSENT_CHANGE_EVENT,
  PRIVACY_CONSENT_CHOICES,
  getStoredPrivacyConsent,
} from "./privacyConsent.js";

const VISIT_RECORDED_SESSION_KEY = "tax-return-saathi:first-party-aggregate-visit-recorded";

function hasRecordedThisSession() {
  try {
    return window.sessionStorage.getItem(VISIT_RECORDED_SESSION_KEY) === "true";
  } catch {
    return true;
  }
}

function markRecordedThisSession() {
  try {
    window.sessionStorage.setItem(VISIT_RECORDED_SESSION_KEY, "true");
  } catch {
    // Fail closed: do not record when session-only duplicate protection is unavailable.
  }
}

/**
 * Records a single aggregate visit signal per browser session only after the
 * existing explicit measurement consent. No URL, identifier, cookies, text,
 * or visitor metadata are sent to this endpoint.
 */
export default function FirstPartyVisitorAggregate() {
  const [choice, setChoice] = useState(() => getStoredPrivacyConsent());
  const { mutate: recordVisit } = trpc.visitorAnalytics.recordConsentedVisit.useMutation();

  useEffect(() => {
    const updateChoice = (event) => setChoice(event.detail?.choice ?? getStoredPrivacyConsent());
    window.addEventListener(PRIVACY_CONSENT_CHANGE_EVENT, updateChoice);
    return () => window.removeEventListener(PRIVACY_CONSENT_CHANGE_EVENT, updateChoice);
  }, []);

  useEffect(() => {
    if (choice !== PRIVACY_CONSENT_CHOICES.accepted || hasRecordedThisSession()) return;
    markRecordedThisSession();
    recordVisit();
  }, [choice, recordVisit]);

  return null;
}
