import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.jsx"), "utf8");

describe("review-first application copy", () => {
  it("opens in English while retaining the Urdu language switch", () => {
    expect(appSource).toContain('const [lang, setLang] = useState("en")');
    expect(appSource).toContain('onClick={() => setLang(lang === "en" ? "ur" : "en")}');
  });

  it("opens the completed-return review as the starred first journey", () => {
    expect(appSource).toContain('const [tab, setTab] = useState(initialTab)');
    expect(appSource).toContain('const isHero = k === "check"');
    expect(appSource).toContain('check: "Analyze Your Tax Return"');
    expect(appSource).toContain('check: "اپنا ٹیکس ریٹرن جانچیں · Analyze Your Tax Return"');
  });

  it("keeps the English review limited to visible educational guidance", () => {
    expect(appSource).toContain("Analyze your completed income tax return");
    expect(appSource).toContain("supporting salary, tax-statement, bank, or asset pages");
    expect(appSource).toContain("cannot access or reproduce FBR checks, confirm your figures, predict notices, submit a return, or make a binding tax decision");
    expect(appSource).toContain("Do not upload passwords, OTPs, bank-account details, or an unmasked CNIC number.");
    expect(appSource).toContain("I confirm that I removed or masked passwords, OTPs, full CNIC numbers, and bank, account, card, or IBAN details before selecting files.");
    expect(appSource).toContain("Independent preparation support, not an FBR service.");
    expect(appSource).toContain("disabled={!redactionConfirmed}");
  });

  it("keeps the equivalent Urdu review boundary and redaction prompt", () => {
    expect(appSource).toContain("اپنا مکمل انکم ٹیکس ریٹرن اور معاون دستاویزات جانچیں");
    expect(appSource).toContain("اپنا چھپایا ہوا بھرا ہوا ریٹرن اپ لوڈ کریں");
    expect(appSource).toContain("یہ ایف بی آر کی جانچ تک رسائی نہیں رکھتا، اسے نقل نہیں کر سکتا");
    expect(appSource).toContain("میں تصدیق کرتا/کرتی ہوں کہ فائل منتخب کرنے سے پہلے میں نے پاس ورڈ، OTP، مکمل شناختی کارڈ نمبر");
    expect(appSource).toContain("یہ آزاد تیاری کی مدد ہے، ایف بی آر سروس نہیں");
  });
});
