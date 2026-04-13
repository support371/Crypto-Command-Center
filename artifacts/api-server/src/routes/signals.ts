import { Router, Request } from "express";
import { db } from "@workspace/db";
import { signalsTable, predictionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { status, limit } = req.query;
  const lim = parseInt(String(limit || "20"));

  let query = db.select().from(signalsTable);
  const results = await db.select().from(signalsTable).orderBy(desc(signalsTable.createdAt)).limit(lim);

  const filtered = status && status !== "all" ? results.filter(s => s.status === status) : results;

  res.json(filtered.map(s => ({
    id: s.id,
    symbol: s.symbol,
    direction: s.direction,
    strength: parseFloat(s.strength),
    status: s.status,
    source: s.source,
    confidence: parseFloat(s.confidence || "0"),
    targetPrice: s.targetPrice ? parseFloat(s.targetPrice) : undefined,
    stopLoss: s.stopLoss ? parseFloat(s.stopLoss) : undefined,
    takeProfit: s.takeProfit ? parseFloat(s.takeProfit) : undefined,
    explanation: s.explanation,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
  })));
});

router.get("/predictions", async (req, res) => {
  const results = await db.select().from(predictionsTable).orderBy(desc(predictionsTable.createdAt)).limit(20);
  res.json(results.map(p => ({
    id: p.id,
    symbol: p.symbol,
    model: p.model,
    direction: p.direction,
    confidence: parseFloat(p.confidence),
    horizon: p.horizon,
    predictedChange: p.predictedChange ? parseFloat(p.predictedChange) : undefined,
    explanation: p.explanation,
    createdAt: p.createdAt,
  })));
});

export { router as signalsRouter };
