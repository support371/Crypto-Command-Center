import { Router, Request } from "express";
import { db } from "@workspace/db";
import { tradesTable, positionsTable, riskStateTable, routingDecisionsTable, profilesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/summary", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;

  const [riskState] = await db.select().from(riskStateTable).where(eq(riskStateTable.userId, userId)).limit(1);
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  const positions = await db.select().from(positionsTable).where(eq(positionsTable.userId, userId));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTrades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
  const dailyPnl = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0);

  const totalBalance = 45230.50 + Math.sin(Date.now() / 100000) * 500;
  const exposure = parseFloat(riskState?.currentExposure || "0");

  res.json({
    totalBalance,
    totalBalanceUsd: totalBalance,
    dailyPnl,
    dailyPnlPct: (dailyPnl / totalBalance) * 100,
    exposure,
    exposurePct: profile ? (exposure / parseFloat(profile.maxExposure)) * 100 : 0,
    killSwitchActive: riskState?.killSwitchActive ?? false,
    activePositions: positions.length,
    openOrders: todayTrades.filter(t => t.status === "open").length,
    guardianStatus: riskState?.guardianStatus ?? "healthy",
    riskMode: profile?.riskMode ?? "moderate",
    autoTradeEnabled: profile?.autoTrade ?? false,
    lastUpdated: new Date(),
    exchanges: [
      { name: "btcc", balance: totalBalance * 0.55, status: "connected" },
      { name: "bitget", balance: totalBalance * 0.45, status: "connected" },
    ],
  });
});

router.get("/routing", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const decisions = await db.select().from(routingDecisionsTable)
    .where(eq(routingDecisionsTable.userId, userId))
    .orderBy(desc(routingDecisionsTable.timestamp))
    .limit(20);
  res.json(decisions.map(d => ({
    id: d.id,
    timestamp: d.timestamp,
    symbol: d.symbol,
    exchange: d.exchange,
    decision: d.decision,
    reason: d.reason,
    confidence: parseFloat(d.confidence || "0"),
    riskScore: parseFloat(d.riskScore || "0"),
  })));
});

router.get("/positions", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const positions = await db.select().from(positionsTable).where(eq(positionsTable.userId, userId));
  res.json(positions.map(p => ({
    id: p.id,
    symbol: p.symbol,
    exchange: p.exchange,
    side: p.side,
    size: parseFloat(p.size),
    entryPrice: parseFloat(p.entryPrice),
    currentPrice: parseFloat(p.currentPrice),
    unrealizedPnl: parseFloat(p.unrealizedPnl || "0"),
    unrealizedPnlPct: ((parseFloat(p.currentPrice) - parseFloat(p.entryPrice)) / parseFloat(p.entryPrice)) * 100,
    openedAt: p.openedAt,
  })));
});

export { router as dashboardRouter };
