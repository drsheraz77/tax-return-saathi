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
 * An optional, account-owned preparation-preferences profile. Its versioned
 * payload is strictly validated server-side and intentionally excludes every
 * identity, financial, document, credential, filing, and outcome field.
 */
export const taxpayerProfiles = mysqlTable("taxpayerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  payload: text("payload").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("taxpayerProfiles_userId_unique").on(table.userId)]);

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

/**
 * Durable configuration for the project-level, platform-managed feedback
 * retention Heartbeat. The callback resolves this row by task UID rather than
 * trusting any request body value.
 */
export const feedbackRetentionSchedules = mysqlTable("feedbackRetentionSchedules", {
  id: int("id").autoincrement().primaryKey(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }).notNull(),
  retentionDays: int("retentionDays").default(30).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("feedbackRetentionSchedules_taskUid_unique").on(table.scheduleCronTaskUid)]);

/**
 * Consent-gated, first-party aggregate visit totals. Each row is one UTC
 * calendar day and contains only a counter—never a visitor identifier, IP
 * address, cookie, user account, URL, tax data, document, or feedback text.
 */
export const aggregateVisitorDays = mysqlTable("aggregateVisitorDays", {
  id: int("id").autoincrement().primaryKey(),
  day: varchar("day", { length: 10 }).notNull(),
  pageViews: int("pageViews").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("aggregateVisitorDays_day_unique").on(table.day)]);

export type ChecklistDraft = typeof checklistDrafts.$inferSelect;
export type TaxpayerProfile = typeof taxpayerProfiles.$inferSelect;
export type FeedbackSubmission = typeof feedbackSubmissions.$inferSelect;
export type FeedbackRetentionSchedule = typeof feedbackRetentionSchedules.$inferSelect;
export type AggregateVisitorDay = typeof aggregateVisitorDays.$inferSelect;
