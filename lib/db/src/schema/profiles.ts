import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  riskMode: text("risk_mode").notNull().default("moderate"),
  maxExposure: numeric("max_exposure", { precision: 18, scale: 2 }).notNull().default("10000"),
  maxDailyLoss: numeric("max_daily_loss", { precision: 18, scale: 2 }).notNull().default("1000"),
  autoTrade: boolean("auto_trade").notNull().default(false),
  preferredExchange: text("preferred_exchange").notNull().default("auto"),
  apiKeysBtcc: boolean("api_keys_btcc").notNull().default(false),
  apiKeysBitget: boolean("api_keys_bitget").notNull().default(false),
  forexAccountId: text("forex_account_id"),
  onboardingStep: integer("onboarding_step").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
