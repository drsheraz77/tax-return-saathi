import { describe, expect, it } from "vitest";
import { getLearningPath, getPlanningReflection, getStarterKnowledgeTopics, TAX_KNOWLEDGE_FOUNDATION, TAX_LEARNING_PATHS, TAX_PLANNING_REFLECTIONS, TAX_PREPARATION_VISUAL_JOURNEY, TAX_SOURCE_TOPIC_BRIEFS } from "../client/src/taxKnowledgeFoundation.js";

describe("reviewed Tax Year 2026 starter knowledge catalogue", () => {
  it("keeps a reviewed version, citation label, and non-determination boundary", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.version).toContain("Tax Year 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.reviewedOn).toBe("26 August 2026");
    expect(TAX_KNOWLEDGE_FOUNDATION.citationLabel).toMatch(/official source/i);
    expect(TAX_KNOWLEDGE_FOUNDATION.limitation).toMatch(/not a live legal database/i);
  });

  it("uses a bounded set of official FBR knowledge records with a visible scope and linked preparation tools", () => {
    expect(TAX_KNOWLEDGE_FOUNDATION.topics.map((topic) => topic.id)).toEqual(["iris-access", "return-completion-records", "wealth-statement-reconciliation", "bank-record-cross-check", "due-dates", "laws-index", "contact-support-route", "company-industry-preparation"]);
    for (const topic of TAX_KNOWLEDGE_FOUNDATION.topics) {
      expect(new URL(topic.sourceUrl).hostname).toBe("www.fbr.gov.pk");
      expect(topic.purpose).toBeTruthy();
      expect(topic.purposeUrdu).toBeTruthy();
      expect(topic.reviewedOn).toBe("26 August 2026");
      expect(topic.scope).toBeTruthy();
      expect(topic.scopeUrdu).toBeTruthy();
      expect(topic.preparationLinks.length).toBeGreaterThan(0);
    }
    const supportRoute = TAX_KNOWLEDGE_FOUNDATION.topics.find((topic) => topic.id === "contact-support-route");
    expect(supportRoute?.sourceUrl).toBe("https://www.fbr.gov.pk/contact-us/142252/173964");
    expect(supportRoute?.scope).toMatch(/does not provide an app-operated support channel/i);
    const industryRoute = TAX_KNOWLEDGE_FOUNDATION.topics.find((topic) => topic.id === "company-industry-preparation");
    expect(industryRoute?.scope).toMatch(/does not decide company status, registration, return type, sales-tax treatment, tax, deadline, or FBR acceptance/i);
  });

  it("filters only the in-memory reviewed records without broadening the catalogue", () => {
    expect(getStarterKnowledgeTopics("IRIS").map((topic) => topic.id)).toEqual(["iris-access"]);
    expect(getStarterKnowledgeTopics("Wealth Statement").map((topic) => topic.id)).toEqual(["wealth-statement-reconciliation", "bank-record-cross-check"]);
    expect(getStarterKnowledgeTopics("bank").map((topic) => topic.id)).toEqual(["bank-record-cross-check"]);
    expect(getStarterKnowledgeTopics("industry").map((topic) => topic.id)).toEqual(["company-industry-preparation"]);
    expect(getStarterKnowledgeTopics("no match")).toEqual([]);
    expect(getStarterKnowledgeTopics()).toBe(TAX_KNOWLEDGE_FOUNDATION.topics);
  });

  it("keeps learning paths broad, source-bound, and non-determinative", () => {
    expect(TAX_LEARNING_PATHS).toHaveLength(6);
    for (const path of TAX_LEARNING_PATHS) {
      expect(TAX_KNOWLEDGE_FOUNDATION.topics.some((topic) => topic.id === path.topicId)).toBe(true);
      expect(path.boundary).toBeTruthy();
      expect(path.boundaryUrdu).toBeTruthy();
    }
    expect(getLearningPath("not-a-path").id).toBe("iris-start");
  });

  it("keeps source-linked topic briefs bounded and tied to an existing reviewed FBR record", () => {
    expect(TAX_SOURCE_TOPIC_BRIEFS).toHaveLength(5);
    for (const brief of TAX_SOURCE_TOPIC_BRIEFS) {
      const topic = TAX_KNOWLEDGE_FOUNDATION.topics.find((item) => item.id === brief.topicId);
      expect(topic).toBeTruthy();
      expect(new URL(topic.sourceUrl).hostname).toBe("www.fbr.gov.pk");
      expect(brief.boundary).toBeTruthy();
      expect(brief.boundaryUrdu).toBeTruthy();
    }
  });

  it("keeps the visual journey educational and the planning reflections local, broad, and non-personal", () => {
    expect(TAX_PREPARATION_VISUAL_JOURNEY).toHaveLength(5);
    expect(TAX_PREPARATION_VISUAL_JOURNEY.map((step) => step.id)).toContain("escalate");
    expect(TAX_PLANNING_REFLECTIONS).toHaveLength(3);
    for (const reflection of TAX_PLANNING_REFLECTIONS) {
      expect(TAX_KNOWLEDGE_FOUNDATION.topics.some((topic) => topic.id === reflection.topicId)).toBe(true);
      expect(reflection.boundary).toMatch(/not/i);
    }
    expect(getPlanningReflection("missing").id).toBe("official-source-first");
  });
});
