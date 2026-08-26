import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getChecklistDraftForUser: vi.fn(),
  saveChecklistDraftForUser: vi.fn(),
  deleteChecklistDraftForUser: vi.fn(),
  getTaxpayerProfileForUser: vi.fn(),
  createFeedbackSubmission: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { checklistDraftPayloadSchema, feedbackInputSchema } from "./draftValidation";
import { appRouter } from "./routers";

const validDraft = {
  answers: {
    taxYearScope: "ty_2026",
    taxpayerPath: ["investor"],
    filingExperience: "first_time",
    incomeCategories: ["investments"],
    investmentRecords: "partly",
    withholding: "no",
    foreignConnection: "no",
    recordsReadiness: "some_missing",
  },
  itemStatus: { investments: "Need to find" },
  step: 4,
  showResults: true,
};

const authedContext = {
  user: { id: 42, openId: "draft-owner", email: null, name: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: {} as any,
  res: { clearCookie: vi.fn() } as any,
};

describe("authenticated checklist draft and feedback safeguards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts only controlled high-level draft values", () => {
    expect(checklistDraftPayloadSchema.parse(validDraft)).toEqual(validDraft);
    expect(() => checklistDraftPayloadSchema.parse({ ...validDraft, answers: { ...validDraft.answers, cnic: "12345-1234567-1" } })).toThrow();
    expect(() => checklistDraftPayloadSchema.parse({ ...validDraft, answers: { ...validDraft.answers, taxYearScope: "tax_year_2027" } })).toThrow();
    expect(() => checklistDraftPayloadSchema.parse({ ...validDraft, answers: { ...validDraft.answers, taxpayerPath: ["company_director"] } })).toThrow();
    expect(() => checklistDraftPayloadSchema.parse({ ...validDraft, itemStatus: { "bank-account-number": "Have it" } })).toThrow();
  });

  it("rejects feedback containing common sensitive identifiers", () => {
    expect(() => feedbackInputSchema.parse({ category: "general", message: "My CNIC is 12345-1234567-1 and I need help." })).toThrow(/Do not include/);
    expect(feedbackInputSchema.parse({ category: "usability", message: "The checklist questions are easy to understand." }).category).toBe("usability");
  });

  it("uses the authenticated owner id for draft retrieval, never a client supplied id", async () => {
    dbMocks.getChecklistDraftForUser.mockResolvedValue({ payload: JSON.stringify(validDraft), updatedAt: new Date("2026-08-24T00:00:00.000Z") });
    const caller = appRouter.createCaller(authedContext as any);
    await expect(caller.checklistDraft.get()).resolves.toMatchObject({ answers: validDraft.answers, savedAt: "2026-08-24T00:00:00.000Z" });
    expect(dbMocks.getChecklistDraftForUser).toHaveBeenCalledWith(42);
  });

  it("requires authentication for account draft operations", async () => {
    const caller = appRouter.createCaller({ ...authedContext, user: null } as any);
    await expect(caller.checklistDraft.get()).rejects.toBeInstanceOf(TRPCError);
  });

  it("summarizes and deletes only the authenticated user's account-held draft after an explicit confirmation value", async () => {
    dbMocks.getChecklistDraftForUser.mockResolvedValue({ payload: JSON.stringify(validDraft), updatedAt: new Date() });
    dbMocks.getTaxpayerProfileForUser.mockResolvedValue(undefined);
    dbMocks.deleteChecklistDraftForUser.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(authedContext as any);
    await expect(caller.privacy.summary()).resolves.toEqual({ hasChecklistDraft: true, hasTaxpayerProfile: false, feedbackIsAnonymous: true });
    await expect(caller.privacy.deleteAccountHeldData({ confirmation: "DELETE_MY_DRAFT_DATA" })).resolves.toEqual({ success: true });
    expect(dbMocks.getChecklistDraftForUser).toHaveBeenCalledWith(42);
    expect(dbMocks.deleteChecklistDraftForUser).toHaveBeenCalledWith(42);
    await expect(caller.privacy.deleteAccountHeldData({ confirmation: "DELETE" } as any)).rejects.toBeInstanceOf(TRPCError);
  });

  it("accepts feedback without associating it with an account", async () => {
    dbMocks.createFeedbackSubmission.mockResolvedValue(undefined);
    const caller = appRouter.createCaller({ ...authedContext, user: null } as any);
    await expect(caller.feedback.submit({ category: "content", message: "Please add more plain-language examples for documents." })).resolves.toEqual({ success: true, acknowledgement: "Thank you. Your feedback was received without account or contact information." });
    expect(dbMocks.createFeedbackSubmission).toHaveBeenCalledWith({ category: "content", message: "Please add more plain-language examples for documents." });
  });
});
