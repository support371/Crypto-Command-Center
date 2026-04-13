import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signalsTable = pgTable("signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull(),
  strength: numeric("strength", { precision: 5, scale: 4 }).notNull(),
  status: text("status").notNull().default("active"),
  source: text("source").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  targetPrice: numeric("target_price", { precision: 18, scale: 8 }),
  stopLoss: numeric("stop_loss", { precision: 18, scale: 8 }),
  takeProfit: numeric("take_profit", { precision: 18, scale: 8 }),
  explanation: text("explanation"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const predictionsTable = pgTable("predictions", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  model: text("model").notNull(),
  direction: text("direction").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
  horizon: text("horizon").notNull(),
  predictedChange: numeric("predicted_change", { precision: 8, scale: 4 }),
  explanation: text("explanation"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSignalSchema = createInsertSchema(signalsTable).omit({ id: true, createdAt: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signalsTable.$inferSelect;
