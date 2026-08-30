import { describe, expect, it } from "vitest";
import {
  PRIVACY_CONSENT_CHOICES,
  LEGACY_PRIVACY_CONSENT_STORAGE_KEY,
  PRIVACY_CONSENT_STORAGE_KEY,
  clearPrivacyConsent,
  getStoredPrivacyConsent,
  savePrivacyConsent,
} from "../client/src/privacyConsent.js";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("local privacy-choice safeguards", () => {
  it("uses a new explicit consent version rather than reusing the earlier generic optional-use choice", () => {
    const storage = createStorage();
    storage.setItem(LEGACY_PRIVACY_CONSENT_STORAGE_KEY, PRIVACY_CONSENT_CHOICES.accepted);
    expect(PRIVACY_CONSENT_STORAGE_KEY).toBe("tax-return-saathi-privacy-choice-v2");
    expect(getStoredPrivacyConsent(storage)).toBeNull();
  });

  it("persists an explicit optional-use refusal without enabling any service", () => {
    const storage = createStorage();
    expect(savePrivacyConsent(PRIVACY_CONSENT_CHOICES.declined, storage)).toBe(PRIVACY_CONSENT_CHOICES.declined);
    expect(storage.getItem(PRIVACY_CONSENT_STORAGE_KEY)).toBe(PRIVACY_CONSENT_CHOICES.declined);
    expect(getStoredPrivacyConsent(storage)).toBe(PRIVACY_CONSENT_CHOICES.declined);
  });

  it("accepts only the two explicit choices and lets a visitor remove the local preference", () => {
    const storage = createStorage();
    expect(savePrivacyConsent("implied" as never, storage)).toBeNull();
    expect(getStoredPrivacyConsent(storage)).toBeNull();
    savePrivacyConsent(PRIVACY_CONSENT_CHOICES.accepted, storage);
    clearPrivacyConsent(storage);
    expect(getStoredPrivacyConsent(storage)).toBeNull();
    expect(storage.getItem(LEGACY_PRIVACY_CONSENT_STORAGE_KEY)).toBeNull();
  });
});
