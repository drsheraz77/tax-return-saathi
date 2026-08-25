import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * One high-level checklist draft per signed-in user. It intentionally stores
 * only the prototype's controlled answer values and progress marks, never tax
 * amounts, account numbers, CNICs, NTN, passwords, or document uploads.
 */
export const checklistDrafts = mysqlTable("checklistDrafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  payload: text("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("checklistDrafts_userId_unique").on(table.userId)]);

/**
 * Voluntary product feedback. It is intentionally not associated with a user
 * account and must not contain tax, identity, account, or credential details.
 */
export const feedbackSubmissions = mysqlTable("feedbackSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 32 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistDraft = typeof checklistDrafts.$inferSelect;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
