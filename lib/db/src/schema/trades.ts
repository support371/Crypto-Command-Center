import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  side: text("side").notNull(),
  size: numeric("size", { precision: 18, scale: 8 }).notNull(),
  price: numeric("price", { precision: 18, scale: 8 }).notNull(),
  filledPrice: numeric("filled_price", { precision: 18, scale: 8 }),
  fee: numeric("fee", { precision: 18, scale: 8 }),
  pnl: numeric("pnl", { precision: 18, scale: 8 }),
  status: text("status").notNull().default("open"),
  orderId: text("order_id"),
  signalId: integer("signal_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const positionsTable = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  side: text("side").notNull(),
  size: numeric("size", { precision: 18, scale: 8 }).notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 8 }).notNull(),
  currentPrice: numeric("current_price", { precision: 18, scale: 8 }).notNull(),
  unrealizedPnl: numeric("unrealized_pnl", { precision: 18, scale: 8 }),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
