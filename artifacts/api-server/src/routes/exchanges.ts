import { Router } from "express";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", (_req, res) => {
  res.json([
    {
      exchange: "btcc",
      status: "connected",
      latency: 42 + Math.random() * 10,
      lastHeartbeat: new Date(),
      ordersToday: 23,
      fillRate: 0.982,
    },
    {
      exchange: "bitget",
      status: "connected",
      latency: 38 + Math.random() * 12,
      lastHeartbeat: new Date(),
      ordersToday: 19,
      fillRate: 0.974,
    },
  ]);
});

router.get("/:exchange/account", (req, res) => {
  const { exchange } = req.params;
  if (exchange !== "btcc" && exchange !== "bitget") {
    res.status(400).json({ error: "Invalid exchange" });
    return;
  }

  const btcBalance = exchange === "btcc" ? 0.4821 : 0.2105;
  const ethBalance = exchange === "btcc" ? 3.142 : 5.891;
  const usdtBalance = exchange === "btcc" ? 12450.00 : 8320.50;

  const btcPrice = 67420;
  const ethPrice = 3512;

  const balances = [
    { asset: "BTC", free: btcBalance, locked: 0, totalUsd: btcBalance * btcPrice },
    { asset: "ETH", free: ethBalance, locked: 0, totalUsd: ethBalance * ethPrice },
    { asset: "USDT", free: usdtBalance, locked: 0, totalUsd: usdtBalance },
  ];

  const totalUsd = balances.reduce((s, b) => s + b.totalUsd, 0);

  res.json({
    exchange,
    balances,
    totalUsd,
    updatedAt: new Date(),
  });
});

export { router as exchangesRouter };
