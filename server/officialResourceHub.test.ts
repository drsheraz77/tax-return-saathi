import { describe, expect, it } from "vitest";
import {
  AI_ANSWER_EVALUATION_STEPS,
  CALCULATION_EXPLANATION_MAP,
  IRIS_FAQ,
  FREELANCER_FAQ,
  FREELANCER_PRE_FILING_CHECKLIST,
  FILING_READINESS_STEPS,
  COMPLEX_SITUATION_PREPARATION_PATHS,
  getFilingReadinessSummary,
  getOfficialResourceCategoryReview,
  getPreSubmissionErrorPreventionSummary,
  getTemporaryGuidanceSummary,
  OFFICIAL_RESOURCE_HUB,
  POST_SUBMISSION_CONTINUITY_STEPS,
  PRE_FILING_CHECKLIST,
  PRE_SUBMISSION_ERROR_PREVENTION_STEPS,
  RETURN_WEALTH_RELATIONSHIP_STEPS,
  getSourceAwareQuestionPlan,
  IRIS_NAVIGATION_WALKTHROUGH,
  SOURCE_AWARE_QUESTION_PLANS,
  searchFreelancerFaq,
  searchIrisFaq,
  validateOfficialResourceHub,
  validateResourceTools,
} from "../client/src/officialResourceHub.js";

describe("official resource hub", () => {
  it("contains complete bilingual resources on approved official hosts", () => {
    expect(validateOfficialResourceHub()).toBe(true);
    expect(OFFICIAL_RESOURCE_HUB.sections.map((section) => section.id)).toEqual(["company", "business-forms", "freelancers", "large-business-industry", "investments", "filing"]);
    expect(OFFICIAL_RESOURCE_HUB.sections.flatMap((section) => section.resources)).toHaveLength(22);
  });

  it("keeps freelancer guidance in a distinct official-source section", () => {
    const freelancerSection = OFFICIAL_RESOURCE_HUB.sections.find((section) => section.id === "freelancers");
    expect(freelancerSection).toBeDefined();
    expect(freelancerSection?.resources.map((resource) => resource.id)).toEqual([
      "fbr-freelancer-individual-registration",
      "fbr-freelancer-return-help",
      "pseb-freelancer-membership",
      "pseb-freelancer-registration-portal",
    ]);
    expect(freelancerSection?.resources.every((resource) => resource.titleUrdu && resource.descriptionUrdu)).toBe(true);
  });

  it("keeps large business and industry preparation in a separate official-source category", () => {
    const industrySection = OFFICIAL_RESOURCE_HUB.sections.find((section) => section.id === "large-business-industry");
    expect(industrySection?.reviewedOn).toBe("26 August 2026");
    expect(industrySection?.resources.map((resource) => resource.id)).toEqual([
      "fbr-company-aop-enrolment",
      "fbr-industry-income-tax-filing",
      "fbr-industry-record-keeping",
      "fbr-industry-sales-tax-registration",
      "fbr-industry-sales-tax-filing",
    ]);
    expect(industrySection?.introduction).toMatch(/do not decide registration, tax treatment, sales-tax status, a return type, a deadline, or what FBR will accept/i);
    expect(industrySection?.resources.every((resource) => new URL(resource.url).hostname.endsWith("fbr.gov.pk") && resource.titleUrdu && resource.descriptionUrdu)).toBe(true);
  });

  it("keeps fixed-term accounts, stocks, ETFs, and bonds in a distinct neutral education section", () => {
    const investmentsSection = OFFICIAL_RESOURCE_HUB.sections.find((section) => section.id === "investments");
    expect(investmentsSection).toBeDefined();
    expect(investmentsSection?.resources.map((resource) => resource.id)).toEqual([
      "national-savings-fixed-term-products",
      "psx-stock-market-learning",
      "psx-etf-learning",
      "sbp-government-bonds",
    ]);
    expect(investmentsSection?.introduction).toMatch(/does not recommend an investment/i);
    expect(investmentsSection?.resources.every((resource) => resource.titleUrdu && resource.descriptionUrdu)).toBe(true);
  });

  it("rejects a resource that does not use an approved official source host", () => {
    const alteredHub = structuredClone(OFFICIAL_RESOURCE_HUB);
    alteredHub.sections[0].resources[0].url = "https://example.com/not-official";
    expect(validateOfficialResourceHub(alteredHub)).toBe(false);
  });

  it("provides searchable official IRIS and freelancer help plus bilingual printable preparation checklists", () => {
    expect(validateResourceTools()).toBe(true);
    expect(searchIrisFaq("password").map((item) => item.id)).toContain("password-reset");
    expect(searchIrisFaq("mobile").map((item) => item.id)).toContain("account-recovery");
    expect(searchIrisFaq("")).toHaveLength(IRIS_FAQ.length);
    expect(PRE_FILING_CHECKLIST).toHaveLength(7);
    expect(searchFreelancerFaq("foreign client").map((item) => item.id)).toContain("foreign-client-records");
    expect(searchFreelancerFaq("record").map((item) => item.id)).toContain("freelancer-record-keeping");
    expect(FREELANCER_FAQ).toHaveLength(3);
    expect(FREELANCER_PRE_FILING_CHECKLIST).toHaveLength(7);
  });

  it("keeps source freshness visible in the model and provides a local-only, non-determinative filing-readiness summary", () => {
    expect(OFFICIAL_RESOURCE_HUB.reviewedOn).toMatch(/2026/);
    expect(FILING_READINESS_STEPS).toHaveLength(4);
    expect(FILING_READINESS_STEPS.every((item) => item.label && item.labelUrdu)).toBe(true);
    expect(getFilingReadinessSummary()).toMatchObject({ completed: 0, total: 4, status: "not-started", label: "Not started" });
    expect(getFilingReadinessSummary({ "year-and-route": true, "records-in-hand": true })).toMatchObject({ completed: 2, status: "in-progress" });
    expect(getFilingReadinessSummary(Object.fromEntries(FILING_READINESS_STEPS.map((item) => [item.id, true])))).toMatchObject({ completed: 4, status: "steps-marked", label: "Preparation steps marked" });
  });

  it("provides bilingual official-link IRIS orientation without representing the portal or accepting credentials", () => {
    expect(validateResourceTools()).toBe(true);
    expect(IRIS_NAVIGATION_WALKTHROUGH).toHaveLength(5);
    expect(IRIS_NAVIGATION_WALKTHROUGH.every((item) => item.labelUrdu && item.boundaryUrdu && item.url.includes("fbr.gov.pk"))).toBe(true);
    expect(IRIS_NAVIGATION_WALKTHROUGH.map((item) => item.boundary).join(" ")).toMatch(/does not open, control, or reproduce|Do not enter passwords|cannot submit/i);
  });

  it("keeps error-prevention as temporary review marks rather than a filing decision", () => {
    expect(PRE_SUBMISSION_ERROR_PREVENTION_STEPS).toHaveLength(6);
    expect(PRE_SUBMISSION_ERROR_PREVENTION_STEPS.every((item) => item.label && item.labelUrdu)).toBe(true);
    expect(getPreSubmissionErrorPreventionSummary()).toMatchObject({ completed: 0, total: 6, status: "not-started", label: "Not started" });
    expect(getPreSubmissionErrorPreventionSummary({ "pre-submit-year": true, "pre-submit-support": true })).toMatchObject({ completed: 2, status: "in-progress" });
    expect(getPreSubmissionErrorPreventionSummary(Object.fromEntries(PRE_SUBMISSION_ERROR_PREVENTION_STEPS.map((item) => [item.id, true])))).toMatchObject({ completed: 6, status: "review-marks-complete", label: "Review marks complete" });
  });

  it("routes broad complex situations to official or qualified follow-up without determining treatment", () => {
    expect(validateResourceTools()).toBe(true);
    expect(COMPLEX_SITUATION_PREPARATION_PATHS).toHaveLength(6);
    expect(COMPLEX_SITUATION_PREPARATION_PATHS.every((item) => item.labelUrdu && item.boundaryUrdu && item.url.includes("fbr.gov.pk"))).toBe(true);
    expect(COMPLEX_SITUATION_PREPARATION_PATHS.map((item) => item.boundary).join(" ")).toMatch(/does not determine|does not classify|does not value|cannot decide/i);
    expect(COMPLEX_SITUATION_PREPARATION_PATHS.map((item) => item.id)).toContain("freelancer-individual-work");
    expect(COMPLEX_SITUATION_PREPARATION_PATHS.map((item) => item.id)).toContain("company-industry-operation");
    expect(getTemporaryGuidanceSummary({ "overseas-residency": true }, COMPLEX_SITUATION_PREPARATION_PATHS)).toMatchObject({ completed: 1, total: 6, status: "in-progress" });
  });

  it("keeps return-and-wealth relationship education non-sensitive and non-reconciliatory", () => {
    expect(RETURN_WEALTH_RELATIONSHIP_STEPS).toHaveLength(4);
    expect(RETURN_WEALTH_RELATIONSHIP_STEPS.every((item) => item.labelUrdu && item.boundaryUrdu)).toBe(true);
    expect(RETURN_WEALTH_RELATIONSHIP_STEPS.map((item) => item.boundary).join(" ")).toMatch(/does not decide|Do not enter figures|cannot reconcile/i);
    expect(getTemporaryGuidanceSummary(Object.fromEntries(RETURN_WEALTH_RELATIONSHIP_STEPS.map((item) => [item.id, true])), RETURN_WEALTH_RELATIONSHIP_STEPS)).toMatchObject({ completed: 4, total: 4, status: "all-marked", label: "Temporary marks complete" });
  });

  it("keeps post-submission continuity as an official-channel reminder rather than return tracking", () => {
    expect(POST_SUBMISSION_CONTINUITY_STEPS).toHaveLength(4);
    expect(POST_SUBMISSION_CONTINUITY_STEPS.every((item) => item.labelUrdu && item.boundaryUrdu && item.url.includes("fbr.gov.pk"))).toBe(true);
    expect(POST_SUBMISSION_CONTINUITY_STEPS.map((item) => item.boundary).join(" ")).toMatch(/cannot see a submission|Do not upload|does not monitor|cannot draft/i);
    expect(getTemporaryGuidanceSummary()).toMatchObject({ completed: 0, total: 0, status: "not-started", label: "Not started" });
  });

  it("provides a local source-aware question planner without sending a question or deciding treatment", () => {
    expect(validateResourceTools()).toBe(true);
    expect(SOURCE_AWARE_QUESTION_PLANS).toHaveLength(4);
    expect(SOURCE_AWARE_QUESTION_PLANS.every((item) => item.labelUrdu && item.prompt && item.promptUrdu && item.boundaryUrdu && item.url.includes("fbr.gov.pk"))).toBe(true);
    expect(getSourceAwareQuestionPlan("question-published-date")).toMatchObject({ id: "question-published-date", sourceLabel: "Open FBR published due dates" });
    expect(getSourceAwareQuestionPlan("unknown-plan").id).toBe("question-iris");
    expect(SOURCE_AWARE_QUESTION_PLANS.map((item) => item.boundary).join(" ")).toMatch(/does not calculate a personal deadline|does not inspect records|does not interpret law/i);
  });

  it("keeps calculation explanations and answer evaluation as education rather than a legal or AI-verification result", () => {
    expect(CALCULATION_EXPLANATION_MAP).toHaveLength(5);
    expect(CALCULATION_EXPLANATION_MAP.every((item) => item.id && item.label && item.labelUrdu)).toBe(true);
    expect(CALCULATION_EXPLANATION_MAP.map((item) => item.label).join(" ")).toMatch(/educational tool|official FBR result|qualified help/i);
    expect(AI_ANSWER_EVALUATION_STEPS).toHaveLength(5);
    expect(AI_ANSWER_EVALUATION_STEPS.every((item) => item.label && item.labelUrdu)).toBe(true);
    expect(AI_ANSWER_EVALUATION_STEPS.map((item) => item.label).join(" ")).toMatch(/tax-year assumption|official FBR source|uncertainty|Do not paste CNIC/i);
    expect(getTemporaryGuidanceSummary(Object.fromEntries(AI_ANSWER_EVALUATION_STEPS.map((item) => [item.id, true])), AI_ANSWER_EVALUATION_STEPS)).toMatchObject({ completed: 5, total: 5, status: "all-marked" });
  });

  it("derives a dated, limited review scope for each official resource category", () => {
    const section = OFFICIAL_RESOURCE_HUB.sections.find((item) => item.id === "filing");
    const review = getOfficialResourceCategoryReview(section);
    expect(review.reviewedOn).toBe(OFFICIAL_RESOURCE_HUB.reviewedOn);
    expect(review.scope).toContain(section?.title);
    expect(review.scopeUrdu).toContain(section?.titleUrdu);
    const industrySection = OFFICIAL_RESOURCE_HUB.sections.find((item) => item.id === "large-business-industry");
    expect(getOfficialResourceCategoryReview(industrySection).reviewedOn).toBe("26 August 2026");
  });
});
