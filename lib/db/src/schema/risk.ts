import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskStateTable = pgTable("risk_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  guardianStatus: text("guardian_status").notNull().default("healthy"),
  currentExposure: numeric("current_exposure", { precision: 18, scale: 2 }).notNull().default("0"),
  dailyLoss: numeric("daily_loss", { precision: 18, scale: 2 }).notNull().default("0"),
  killSwitchActive: boolean("kill_switch_active").notNull().default(false),
  killSwitchReason: text("kill_switch_reason"),
  killSwitchTriggeredAt: timestamp("kill_switch_triggered_at"),
  killSwitchTriggeredBy: text("kill_switch_triggered_by"),
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  level: text("level").notNull().default("info"),
  category: text("category").notNull().default("system"),
  message: text("message").notNull(),
  metadata: text("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const routingDecisionsTable = pgTable("routing_decisions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  symbol: text("symbol").notNull(),
  exchange: text("exchange").notNull(),
  decision: text("decision").notNull(),
  reason: text("reason").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 4 }),
  riskScore: numeric("risk_score", { precision: 5, scale: 4 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, timestamp: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
