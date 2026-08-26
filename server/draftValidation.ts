import { z } from "zod";

const responseValue = z.enum(["ready", "partly", "not_ready", "not_sure"]);

export const checklistDraftPayloadSchema = z.object({
  answers: z.object({
    taxYearScope: z.enum(["ty_2026", "other_or_unsure"]).optional(),
    taxpayerPath: z.array(z.enum(["salaried", "freelancer", "business_owner", "property_owner", "investor", "overseas_connection", "not_sure"])).max(7).optional(),
    filingExperience: z.enum(["first_time", "filed_before", "not_sure"]).optional(),
    incomeCategories: z.array(z.enum(["salary", "business", "property", "freelancer", "bank_profit", "investments", "other"])).max(7).optional(),
    businessRecords: responseValue.optional(),
    propertyRecords: responseValue.optional(),
    freelancerRecords: responseValue.optional(),
    investmentRecords: responseValue.optional(),
    withholding: z.enum(["yes", "no", "not_sure"]).optional(),
    foreignConnection: z.enum(["yes", "no", "not_sure"]).optional(),
    recordsReadiness: z.enum(["complete", "some_missing", "not_started", "not_sure"]).optional(),
  }).strict(),
  itemStatus: z.object({
    "tax-year-scope": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    iris: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    access: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-salaried": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-freelancer": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-business": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-property": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-investor": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-overseas": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "path-uncertain": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    salary: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    business: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "business-ready": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    property: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "property-ready": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    freelancer: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "freelancer-ready": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    bank: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    investments: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    "investments-ready": z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    withholding: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    foreign: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    records: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
    uncertainty: z.enum(["Have it", "Need to find", "Not sure"]).optional(),
  }).strict(),
  step: z.number().int().min(0).max(10),
  showResults: z.boolean(),
});

export type ChecklistDraftPayload = z.infer<typeof checklistDraftPayloadSchema>;

const sensitiveFeedbackPattern = /\b(cnic|ntn|password|passcode|iban|account\s*(?:number|no\.?|details)|bank\s*details|card\s*(?:number|details)|passport)\b|\b\d{5}-?\d{7}-?\d\b/i;

export const feedbackInputSchema = z.object({
  category: z.enum(["general", "usability", "content", "technical"]),
  message: z.string().trim().min(15, "Please write at least 15 characters.").max(1000, "Please keep feedback to 1,000 characters or fewer.").refine(
    (value) => !sensitiveFeedbackPattern.test(value),
    "Do not include CNIC, NTN, passwords, bank or account details, or other sensitive information.",
  ),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
