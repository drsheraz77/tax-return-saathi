import { eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { checklistDrafts, feedbackRetentionSchedules, feedbackSubmissions, InsertUser, taxpayerProfiles, users } from "../drizzle/schema";
import type { ChecklistDraftPayload, FeedbackInput, TaxpayerProfilePayload } from "./draftValidation";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getChecklistDraftForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(checklistDrafts).where(eq(checklistDrafts.userId, userId)).limit(1);
  return result[0];
}

export async function saveChecklistDraftForUser(userId: number, payload: ChecklistDraftPayload) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(checklistDrafts).values({ userId, payload: JSON.stringify(payload) }).onDuplicateKeyUpdate({
    set: { payload: JSON.stringify(payload), updatedAt: new Date() },
  });
  return getChecklistDraftForUser(userId);
}

export async function deleteChecklistDraftForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.delete(checklistDrafts).where(eq(checklistDrafts.userId, userId));
}

export async function getTaxpayerProfileForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(taxpayerProfiles).where(eq(taxpayerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function createTaxpayerProfileForUser(userId: number, payload: TaxpayerProfilePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(taxpayerProfiles).values({ userId, payload: JSON.stringify(payload) });
  return getTaxpayerProfileForUser(userId);
}

export async function updateTaxpayerProfileForUser(userId: number, payload: TaxpayerProfilePayload) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.update(taxpayerProfiles).set({ payload: JSON.stringify(payload), updatedAt: new Date() }).where(eq(taxpayerProfiles.userId, userId));
  return getTaxpayerProfileForUser(userId);
}

export async function deleteTaxpayerProfileForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.delete(taxpayerProfiles).where(eq(taxpayerProfiles.userId, userId));
}

export async function createFeedbackSubmission(input: FeedbackInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(feedbackSubmissions).values(input);
}

export async function getFeedbackRetentionScheduleByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const rows = await db.select().from(feedbackRetentionSchedules)
    .where(eq(feedbackRetentionSchedules.scheduleCronTaskUid, taskUid)).limit(1);
  return rows[0];
}

/** Idempotently delete anonymous feedback that has reached the configured retention cutoff. */
export async function deleteFeedbackOlderThan(cutoff: Date): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const result = await db.delete(feedbackSubmissions).where(lt(feedbackSubmissions.createdAt, cutoff));
  return Number((result as unknown as { affectedRows?: number }).affectedRows ?? 0);
}
