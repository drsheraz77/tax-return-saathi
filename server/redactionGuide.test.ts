import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.jsx"), "utf8");

describe("completed-return redaction guide", () => {
  it("keeps bilingual examples beside the active confirmation gate without claiming verification", () => {
    expect(appSource).toContain("Show a safe redaction example");
    expect(appSource).toContain("محفوظ ریڈیکشن کی مثال دیکھیں");
    expect(appSource).toContain("The app cannot confirm whether a document is safely redacted");
    expect(appSource).toContain("اس ایپ کو یہ تصدیق کرنے کی صلاحیت نہیں");
  });
});
