import {
  pgTable,
  integer,
  text,
  boolean,
  timestamp,
  uuid,
  char,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().default(""),
  email: text().notNull().unique(),
  provider: text().notNull(),
  confirmed: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
  deleted: boolean().notNull().default(false),
});

export const emailTokens = pgTable("email_tokens", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull(),
  token: char("token", { length: 6 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const userMemories = pgTable("user_memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer().references(() => users.id),
  memory: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const chat = pgTable("chat", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer().references(() => users.id),
  title: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const chatMessage = pgTable("chat_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").references(() => chat.id, {
    onDelete: "cascade",
  }),
  role: text().notNull(),
  text: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const agent = pgTable("agent", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => users.id),
  name: text().notNull(),
  description: text().notNull(),
  prompt: text().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  deleted: boolean().notNull().default(false),
});
