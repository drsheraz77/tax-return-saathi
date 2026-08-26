import { describe, expect, it } from "vitest";
import { TAX_KNOWLEDGE_FOUNDATION } from "../client/src/taxKnowledgeFoundation.js";

describe("reviewed Tax Year 2026 starter knowledge catalogue", () => {
  it("keeps a reviewed version, citation label, and non-determination boundary", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.version).toContain("Tax Year 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.reviewedOn).toBe("26 August 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.citationLabel).toMatch(/official source/i);
    expect(TAX_KNOWLEDGE_FOUNDATION.limitation).toMatch(/not a live legal database/i);
  });

  it("uses a bounded set of official FBR knowledge records with a visible scope and linked preparation tools", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.topics.map((topic) => topic.id)).toEqual(["iris-access", "return-completion-records", "due-dates", "laws-index"]);
    for (const topic of TAX_KNOWLEDGE_FOUNDATION.topics) {
      expect(new URL(topic.sourceUrl).hostname).toBe("www.fbr.gov.pk");
      expect(topic.purpose).toBeTruthy();
      expect(topic.purposeUrdu).toBeTruthy();
      expect(topic.reviewedOn).toBe("26 August 2026");
      expect(topic.scope).toBeTruthy();
      expect(topic.scopeUrdu).toBeTruthy();
      expect(topic.preparationLinks.length).toBeGreaterThan(0);
    }
  });
});
