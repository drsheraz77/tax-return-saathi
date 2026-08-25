import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { createFeedbackSubmission, deleteChecklistDraftForUser, getChecklistDraftForUser, saveChecklistDraftForUser } from "./db";
import { checklistDraftPayloadSchema, feedbackInputSchema } from "./draftValidation";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

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

  feedback: router({
    submit: publicProcedure.input(feedbackInputSchema).mutation(async ({ input }) => {
      try {
        await createFeedbackSubmission(input);
        return { success: true } as const;
      } catch (error) {
        console.error("[Feedback] submission failed", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Feedback could not be sent. Please try again later." });
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
