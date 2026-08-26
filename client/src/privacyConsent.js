export const PRIVACY_CONSENT_STORAGE_KEY = "tax-return-saathi-privacy-choice-v1";

export const PRIVACY_CONSENT_CHOICES = Object.freeze({
  accepted: "accepted_optional",
  declined: "declined_optional",
});

const allowedChoices = new Set(Object.values(PRIVACY_CONSENT_CHOICES));

export function getStoredPrivacyConsent(storage = globalThis.localStorage) {
  try {
    const choice = storage.getItem(PRIVACY_CONSENT_STORAGE_KEY);
    return allowedChoices.has(choice) ? choice : null;
  } catch {
    return null;
  }
}

export function savePrivacyConsent(choice, storage = globalThis.localStorage) {
  if (!allowedChoices.has(choice)) return null;
  try {
    storage.setItem(PRIVACY_CONSENT_STORAGE_KEY, choice);
    return choice;
  } catch {
    return null;
  }
}

export function clearPrivacyConsent(storage = globalThis.localStorage) {
  try {
    storage.removeItem(PRIVACY_CONSENT_STORAGE_KEY);
  } catch {
    // Local-only preference controls must never interrupt access to the service.
  }
}
