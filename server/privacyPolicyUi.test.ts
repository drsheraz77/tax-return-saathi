import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(projectRoot, "client/src/App.jsx"), "utf8");
const appEntry = readFileSync(resolve(projectRoot, "client/src/main.jsx"), "utf8");
const privacyNotice = readFileSync(resolve(projectRoot, "client/src/PrivacyConsentNotice.jsx"), "utf8");
const privacyPolicy = readFileSync(resolve(projectRoot, "client/src/PublicPrivacyPolicy.jsx"), "utf8");

describe("pilot privacy and public policy interface", () => {
  it("makes pilot status and a shareable public privacy route visible", () => {
    expect(app).toContain('id="pilot-testing-notice"');
    expect(app).toContain('href="/privacy"');
    expect(appEntry).toContain('React.lazy(() => import("./PublicPrivacyPolicy.jsx"))');
    expect(appEntry).toContain('window.location.pathname === "/privacy"');
    expect(appEntry.match(/<PrivacyConsentNotice \/>/g)).toHaveLength(2);
    expect(privacyPolicy).toContain("Public privacy policy · pilot release");
    expect(privacyPolicy).toContain("Last operational review: 26 August 2026");
  });

  it("offers equal accept and decline controls with a local-only, withdrawable preference", () => {
    expect(privacyNotice).toContain('id="privacy-consent-notice"');
    expect(privacyNotice).toContain("Allow optional use");
    expect(privacyNotice).toContain("Decline optional use");
    expect(privacyNotice).toContain("Change privacy choice");
    expect(privacyNotice).toContain("not a Google-certified CMP");
  });

  it("uses a compact first step and an optional accessible details step without hiding consent choices", () => {
    expect(privacyNotice).toContain("Why this choice?");
    expect(privacyNotice).toContain('aria-controls="privacy-consent-details"');
    expect(privacyNotice).toContain('aria-expanded={showDetails}');
    expect(privacyNotice).toContain('id="privacy-consent-details"');
    expect(privacyNotice).toContain("Return to compact view");
    expect(privacyNotice).toContain("No advertising or analytics tracking");
  });

  it("states the material policy limits without claiming advertising approval or GDPR certification", () => {
    expect(privacyPolicy).toContain("Anonymous feedback is scheduled for automatic deletion after 30 days");
    expect(privacyPolicy).toContain("does not currently run Google Ads, AdSense tags, or analytics tags");
    expect(privacyPolicy).toContain("not a Google-certified CMP");
    expect(privacyPolicy).toContain("not a legal certification");
  });
});
