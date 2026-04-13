import { Router, Request } from "express";
import { db } from "@workspace/db";
import { tradesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { exchange, status, limit } = req.query;
  const lim = parseInt(String(limit || "50"));

  const results = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId)).orderBy(desc(tradesTable.createdAt)).limit(lim);

  const filtered = results.filter(t => {
    if (exchange && exchange !== "all" && t.exchange !== exchange) return false;
    if (status && status !== "all" && t.status !== status) return false;
    return true;
  });

  res.json(filtered.map(t => ({
    id: t.id,
    symbol: t.symbol,
    exchange: t.exchange,
    side: t.side,
    size: parseFloat(t.size),
    price: parseFloat(t.price),
    filledPrice: t.filledPrice ? parseFloat(t.filledPrice) : undefined,
    fee: t.fee ? parseFloat(t.fee) : undefined,
    pnl: t.pnl ? parseFloat(t.pnl) : undefined,
    status: t.status,
    orderId: t.orderId,
    signalId: t.signalId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  })));
});

router.get("/summary", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const trades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));

  const completed = trades.filter(t => t.status === "filled");
  const winning = completed.filter(t => parseFloat(t.pnl || "0") > 0);
  const totalPnl = completed.reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0);
  const pnls = completed.map(t => parseFloat(t.pnl || "0"));
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;
  const totalSize = completed.reduce((sum, t) => sum + parseFloat(t.size), 0);

  const btccTrades = completed.filter(t => t.exchange === "btcc");
  const bitgetTrades = completed.filter(t => t.exchange === "bitget");

  res.json({
    totalTrades: completed.length,
    winningTrades: winning.length,
    losingTrades: completed.length - winning.length,
    winRate: completed.length > 0 ? (winning.length / completed.length) * 100 : 0,
    totalPnl,
    avgTradeSize: completed.length > 0 ? totalSize / completed.length : 0,
    bestTrade,
    worstTrade,
    byExchange: [
      { exchange: "btcc", trades: btccTrades.length, pnl: btccTrades.reduce((s, t) => s + parseFloat(t.pnl || "0"), 0) },
      { exchange: "bitget", trades: bitgetTrades.length, pnl: bitgetTrades.reduce((s, t) => s + parseFloat(t.pnl || "0"), 0) },
    ],
  });
});

export { router as tradesRouter };
