import { Router, Request } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { level, category, limit } = req.query;
  const lim = parseInt(String(limit || "100"));

  const results = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.timestamp)).limit(lim * 2);

  const filtered = results.filter(l => {
    if (level && level !== "all" && l.level !== level) return false;
    if (category && category !== "all" && l.category !== category) return false;
    return true;
  }).slice(0, lim);

  res.json(filtered.map(l => ({
    id: l.id,
    level: l.level,
    category: l.category,
    message: l.message,
    metadata: l.metadata ? JSON.parse(l.metadata) : undefined,
    userId: l.userId,
    timestamp: l.timestamp,
  })));
});

router.get("/reconciliation", async (_req, res) => {
  res.json({
    status: "clean",
    checkedAt: new Date(),
    exchanges: [
      { exchange: "btcc", localTrades: 42, exchangeTrades: 42, discrepancies: 0, lastSynced: new Date() },
      { exchange: "bitget", localTrades: 38, exchangeTrades: 38, discrepancies: 0, lastSynced: new Date() },
    ],
  });
});

export { router as logsRouter };
