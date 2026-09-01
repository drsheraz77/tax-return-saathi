import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { createFeedbackSubmission, createTaxpayerProfileForUser, deleteChecklistDraftForUser, deleteTaxpayerProfileForUser, getAggregateVisitorDays, getChecklistDraftForUser, getTaxpayerProfileForUser, recordAggregateVisitorPageView, saveChecklistDraftForUser, updateTaxpayerProfileForUser } from "./db";
import { notifyOwner } from "./_core/notification";
import { checklistDraftPayloadSchema, feedbackInputSchema, taxpayerProfileCreateSchema, taxpayerProfilePayloadSchema } from "./draftValidation";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

function toDraftResponse(row: Awaited<ReturnType<typeof getChecklistDraftForUser>>) {
  if (!row) return null;
  try {
    return {
      ...checklistDraftPayloadSchema.parse(JSON.parse(row.payload)),
      savedAt: row.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

function toProfileResponse(row: Awaited<ReturnType<typeof getTaxpayerProfileForUser>>) {
  if (!row) return null;
  try {
    return {
      ...taxpayerProfilePayloadSchema.parse(JSON.parse(row.payload)),
      savedAt: row.updatedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

function utcDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function currentWeeklyRange(now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return { fromDay: utcDay(start), throughDay: utcDay(end) };
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  checklistDraft: router({
    get: protectedProcedure.query(async ({ ctx }) => toDraftResponse(await getChecklistDraftForUser(ctx.user.id))),
    save: protectedProcedure.input(checklistDraftPayloadSchema).mutation(async ({ ctx, input }) => {
      try {
        return toDraftResponse(await saveChecklistDraftForUser(ctx.user.id, input));
      } catch (error) {
        console.error("[Checklist draft] save failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your account draft could not be saved." });
      }
    }),
    delete: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        await deleteChecklistDraftForUser(ctx.user.id);
        return { success: true } as const;
      } catch (error) {
        console.error("[Checklist draft] delete failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your account draft could not be deleted." });
      }
    }),
  }),

  taxpayerProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => toProfileResponse(await getTaxpayerProfileForUser(ctx.user.id))),
    create: protectedProcedure.input(taxpayerProfileCreateSchema).mutation(async ({ ctx, input }) => {
      try {
        const existing = await getTaxpayerProfileForUser(ctx.user.id);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Your preparation profile already exists. Update or delete it instead." });
        const { consent: _consent, ...payload } = input;
        return toProfileResponse(await createTaxpayerProfileForUser(ctx.user.id, payload));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Taxpayer profile] create failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your preparation profile could not be saved." });
      }
    }),
    update: protectedProcedure.input(taxpayerProfilePayloadSchema).mutation(async ({ ctx, input }) => {
      try {
        const existing = await getTaxpayerProfileForUser(ctx.user.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "No preparation profile exists yet." });
        return toProfileResponse(await updateTaxpayerProfileForUser(ctx.user.id, input));
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Taxpayer profile] update failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your preparation profile could not be updated." });
      }
    }),
    delete: protectedProcedure.input(z.object({ confirmation: z.literal("DELETE_MY_PREPARATION_PROFILE") })).mutation(async ({ ctx }) => {
      try {
        await deleteTaxpayerProfileForUser(ctx.user.id);
        return { success: true } as const;
      } catch (error) {
        console.error("[Taxpayer profile] delete failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your preparation profile could not be deleted." });
      }
    }),
  }),

  privacy: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const draft = await getChecklistDraftForUser(ctx.user.id);
      const profile = await getTaxpayerProfileForUser(ctx.user.id);
      return {
        hasChecklistDraft: Boolean(draft),
        hasTaxpayerProfile: Boolean(profile),
        feedbackIsAnonymous: true,
      } as const;
    }),
    deleteAccountHeldData: protectedProcedure.input(z.object({ confirmation: z.literal("DELETE_MY_DRAFT_DATA") })).mutation(async ({ ctx }) => {
      try {
        await deleteChecklistDraftForUser(ctx.user.id);
        return { success: true } as const;
      } catch (error) {
        console.error("[Privacy] account-held data deletion failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your account-held checklist data could not be deleted." });
      }
    }),
  }),

  feedback: router({
    submit: publicProcedure.input(feedbackInputSchema).mutation(async ({ input }) => {
      try {
        await createFeedbackSubmission(input);
        try {
          const ownerNotified = await notifyOwner({
            title: "New anonymous pilot feedback",
            content: "A new anonymous feedback entry was received. This operational alert includes no feedback content or visitor details.",
          });
          if (!ownerNotified) console.warn("[Feedback] owner alert was unavailable after feedback was saved.");
        } catch {
          // Feedback is already saved. Alert delivery must never affect the visitor acknowledgement.
          console.warn("[Feedback] owner alert could not be sent after feedback was saved.");
        }
        return { success: true, acknowledgement: "Thank you. Your feedback was received without account or contact information." } as const;
      } catch (error) {
        console.error("[Feedback] submission failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Feedback could not be sent. Please try again later." });
      }
    }),
  }),

  visitorAnalytics: router({
    /**
     * The browser sends no input. It reaches this mutation only after the
     * local visitor-measurement choice has been explicitly accepted.
     */
    recordConsentedVisit: publicProcedure.mutation(async () => {
      try {
        await recordAggregateVisitorPageView(utcDay(new Date()));
        return { recorded: true } as const;
      } catch (error) {
        console.error("[Aggregate visitor analytics] recording failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Aggregate visitor measurement could not be recorded." });
      }
    }),
    weeklySummary: adminProcedure.query(async () => {
      try {
        const { fromDay, throughDay } = currentWeeklyRange();
        const rows = await getAggregateVisitorDays(fromDay, throughDay);
        const dayTotals = new Map(rows.map((row) => [row.day, row.pageViews]));
        const days = Array.from({ length: 7 }, (_, index) => {
          const date = new Date(`${fromDay}T00:00:00.000Z`);
          date.setUTCDate(date.getUTCDate() + index);
          const day = utcDay(date);
          return { day, pageViews: dayTotals.get(day) ?? 0 };
        });
        return {
          fromDay,
          throughDay,
          totalPageViews: days.reduce((total, day) => total + day.pageViews, 0),
          days,
        } as const;
      } catch (error) {
        console.error("[Aggregate visitor analytics] summary failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Aggregate visitor summary could not be loaded." });
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
