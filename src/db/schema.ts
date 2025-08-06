import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  dueDate: text("due_date"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const debugSessions = sqliteTable("debug_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  problemDescription: text("problem_description").notNull(),
  aiResponse: text("ai_response"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const focusSessions = sqliteTable("focus_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  durationMinutes: integer("duration_minutes").notNull(),
  taskDescription: text("task_description"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  startedAt: text("started_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  completedAt: text("completed_at"),
});

export const spotifyTokens = sqliteTable("spotify_tokens", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});
