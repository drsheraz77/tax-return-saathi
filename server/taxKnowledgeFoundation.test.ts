import { describe, expect, it } from "vitest";
import { TAX_KNOWLEDGE_FOUNDATION } from "../client/src/taxKnowledgeFoundation.js";

describe("limited Tax Year 2026 official-source foundation", () => {
  it("keeps a reviewed version and a non-determination boundary", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.version).toContain("Tax Year 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.reviewedOn).toBe("26 August 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.limitation).toMatch(/not a complete tax-rule database/i);
  });

  it("uses a small set of official FBR starting points with explicit purposes", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.topics.map((topic) => topic.id)).toEqual(["filing-workflow", "due-dates", "laws-index"]);
    for (const topic of TAX_KNOWLEDGE_FOUNDATION.topics) {
      expect(new URL(topic.sourceUrl).hostname).toBe("www.fbr.gov.pk");
      expect(topic.purpose).toBeTruthy();
      expect(topic.purposeUrdu).toBeTruthy();
    }
  });
});
