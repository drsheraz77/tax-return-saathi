import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(projectRoot, "client/src/App.jsx"), "utf8");
const appEntry = readFileSync(resolve(projectRoot, "client/src/main.jsx"), "utf8");
const privacyNotice = readFileSync(resolve(projectRoot, "client/src/PrivacyConsentNotice.jsx"), "utf8");
const privacyPolicy = readFileSync(resolve(projectRoot, "client/src/PublicPrivacyPolicy.jsx"), "utf8");
const resourceHub = readFileSync(resolve(projectRoot, "client/src/OfficialResourceHub.jsx"), "utf8");
const optionalAnalytics = readFileSync(resolve(projectRoot, "client/src/OptionalGoogleAnalytics.jsx"), "utf8");

describe("pilot privacy and public policy interface", () => {
  it("makes pilot status and a shareable public privacy route visible", () => {
    expect(app).toContain('id="pilot-testing-notice"');
    expect(app).toContain('href="/privacy"');
    expect(appEntry).toContain('React.lazy(() => import("./PublicPrivacyPolicy.jsx"))');
    expect(appEntry).toContain('window.location.pathname === "/privacy"');
    expect(appEntry.match(/<PrivacyConsentNotice \/>/g)).toHaveLength(2);
    expect(privacyPolicy).toContain("Public privacy policy · pilot release");
    expect(privacyPolicy).toContain("Last operational review: 30 August 2026");
  });

  it("offers equal visitor-measurement controls with a local-only, withdrawable preference", () => {
    expect(privacyNotice).toContain('id="privacy-consent-notice"');
    expect(privacyNotice).toContain("Allow visitor measurement");
    expect(privacyNotice).toContain("Decline visitor measurement");
    expect(privacyNotice).toContain("Change privacy choice");
    expect(privacyNotice).toContain("not a Google-certified CMP");
  });

  it("uses a compact first step and an optional accessible details step without hiding consent choices", () => {
    expect(privacyNotice).toContain("Why this choice?");
    expect(privacyNotice).toContain('aria-controls="privacy-consent-details"');
    expect(privacyNotice).toContain('aria-expanded={showDetails}');
    expect(privacyNotice).toContain('id="privacy-consent-details"');
    expect(privacyNotice).toContain("Return to compact view");
    expect(privacyNotice).toContain("Optional Google Analytics only after clear permission");
  });

  it("states the material analytics and advertising limits without claiming certification", () => {
    expect(privacyPolicy).toContain("Anonymous feedback is scheduled for automatic deletion after 30 days");
    expect(privacyPolicy).toContain("Only after clear permission may Google Analytics load for aggregate visitor measurement");
    expect(privacyPolicy).toContain("Google Ads and AdSense tags are not enabled");
    expect(privacyPolicy).toContain("not a Google-certified CMP");
    expect(privacyPolicy).toContain("not a legal certification");
  });

  it("loads the supplied Google tag only after the explicit local acceptance and disables advertising signals", () => {
    expect(appEntry).toContain('import OptionalGoogleAnalytics from "./OptionalGoogleAnalytics.jsx"');
    expect(appEntry).toContain("<OptionalGoogleAnalytics />");
    expect(optionalAnalytics).toContain('GOOGLE_ANALYTICS_MEASUREMENT_ID = "G-VJWBMPJSHW"');
    expect(optionalAnalytics).toContain("https://www.googletagmanager.com/gtag/js?id=");
    expect(optionalAnalytics).toContain('choice !== PRIVACY_CONSENT_CHOICES.accepted');
    expect(optionalAnalytics).toContain('analytics_storage: "granted"');
    expect(optionalAnalytics).toContain("allow_google_signals: false");
    expect(optionalAnalytics).toContain("allow_ad_personalization_signals: false");
    expect(optionalAnalytics).not.toContain("user_id");
    expect(optionalAnalytics).not.toMatch(/gtag\("event"/);
  });

  it("offers the supplied pilot email as an optional non-anonymous contact route with a sensitive-data warning", () => {
    expect(resourceHub).toContain('const PILOT_FEEDBACK_EMAIL_HREF = "mailto:driris@gmail.com?subject=Tax%20Return%20Saathi%20pilot%20feedback%20%E2%80%94%20%5Bcategory%5D"');
    expect(resourceHub).toContain('href={PILOT_FEEDBACK_EMAIL_HREF}');
    expect(resourceHub).not.toContain('mailto:driris@gmail.com?subject=Tax%20Return%20Saathi%20pilot%20feedback"');
    expect(resourceHub).not.toContain('mailto:driris@gmail.com?body=');
    expect(resourceHub).toContain("email is not anonymous and is separate from this form");
    expect(resourceHub).toContain("do not send tax, identity, financial, credential, notice, or document details");
    expect(privacyPolicy).toContain("Optional direct pilot feedback may be emailed to driris@gmail.com");
    expect(privacyPolicy).toContain("email is not anonymous and is separate from the form");
  });
});
