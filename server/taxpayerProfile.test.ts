import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getChecklistDraftForUser: vi.fn(),
  saveChecklistDraftForUser: vi.fn(),
  deleteChecklistDraftForUser: vi.fn(),
  createFeedbackSubmission: vi.fn(),
  getTaxpayerProfileForUser: vi.fn(),
  createTaxpayerProfileForUser: vi.fn(),
  updateTaxpayerProfileForUser: vi.fn(),
  deleteTaxpayerProfileForUser: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { taxpayerProfileCreateSchema, taxpayerProfilePayloadSchema } from "./draftValidation";
import { appRouter } from "./routers";

const validProfile = {
  version: 1 as const,
  preferredLanguage: "ur" as const,
  taxYearContext: "ty_2026" as const,
  preparationPaths: ["investor"] as const,
  filingFamiliarity: "first_time" as const,
  resourceOrder: "guided" as const,
};

const authedContext = {
  user: { id: 42, openId: "profile-owner", email: null, name: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: {} as any,
  res: { clearCookie: vi.fn() } as any,
};

describe("approved taxpayer preparation profile safeguards", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts only the approved enum-only preference payload and explicit consent", () => {
    expect(taxpayerProfilePayloadSchema.parse(validProfile)).toEqual(validProfile);
    expect(taxpayerProfileCreateSchema.parse({ ...validProfile, consent: true })).toMatchObject(validProfile);
    expect(() => taxpayerProfileCreateSchema.parse({ ...validProfile, consent: false })).toThrow();
    expect(() => taxpayerProfilePayloadSchema.parse({ ...validProfile, cnic: "12345-1234567-1" })).toThrow();
    expect(() => taxpayerProfilePayloadSchema.parse({ ...validProfile, taxAmount: 120000 })).toThrow();
    expect(() => taxpayerProfilePayloadSchema.parse({ ...validProfile, document: "return.pdf" })).toThrow();
    expect(() => taxpayerProfilePayloadSchema.parse({ ...validProfile, note: "free text is prohibited" })).toThrow();
    expect(() => taxpayerProfilePayloadSchema.parse({ version: 1 })).toThrow();
  });

  it("uses only the authenticated owner for profile creation and rejects a browser-supplied owner", async () => {
    const stored = { payload: JSON.stringify(validProfile), updatedAt: new Date("2026-08-26T00:00:00.000Z") };
    dbMocks.getTaxpayerProfileForUser.mockResolvedValueOnce(undefined);
    dbMocks.createTaxpayerProfileForUser.mockResolvedValue(stored);
    const caller = appRouter.createCaller(authedContext as any);

    await expect(caller.taxpayerProfile.create({ ...validProfile, consent: true })).resolves.toMatchObject({ ...validProfile, savedAt: "2026-08-26T00:00:00.000Z" });
    expect(dbMocks.getTaxpayerProfileForUser).toHaveBeenCalledWith(42);
    expect(dbMocks.createTaxpayerProfileForUser).toHaveBeenCalledWith(42, validProfile);
    await expect(caller.taxpayerProfile.create({ ...validProfile, consent: true, userId: 99 } as any)).rejects.toBeInstanceOf(TRPCError);
  });

  it("requires authentication and permanently deletes only the authenticated user's profile after confirmation", async () => {
    const anonymous = appRouter.createCaller({ ...authedContext, user: null } as any);
    await expect(anonymous.taxpayerProfile.get()).rejects.toBeInstanceOf(TRPCError);

    dbMocks.deleteTaxpayerProfileForUser.mockResolvedValue(undefined);
    const caller = appRouter.createCaller(authedContext as any);
    await expect(caller.taxpayerProfile.delete({ confirmation: "DELETE_MY_PREPARATION_PROFILE" })).resolves.toEqual({ success: true });
    expect(dbMocks.deleteTaxpayerProfileForUser).toHaveBeenCalledWith(42);
    await expect(caller.taxpayerProfile.delete({ confirmation: "DELETE" } as any)).rejects.toBeInstanceOf(TRPCError);
  });
});
