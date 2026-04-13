import { Router, Request } from "express";
import { db } from "@workspace/db";
import { riskStateTable, profilesTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/state", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const [state] = await db.select().from(riskStateTable).where(eq(riskStateTable.userId, userId)).limit(1);
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);

  if (!state) {
    res.json({
      guardianStatus: "healthy",
      currentExposure: 0,
      exposureLimit: profile ? parseFloat(profile.maxExposure) : 10000,
      dailyLoss: 0,
      dailyLossLimit: profile ? parseFloat(profile.maxDailyLoss) : 1000,
      killSwitchActive: false,
      breaches: [],
      lastChecked: new Date(),
    });
    return;
  }

  const currentExposure = parseFloat(state.currentExposure);
  const dailyLoss = parseFloat(state.dailyLoss);
  const exposureLimit = profile ? parseFloat(profile.maxExposure) : 10000;
  const dailyLossLimit = profile ? parseFloat(profile.maxDailyLoss) : 1000;

  const breaches = [];
  if (currentExposure > exposureLimit * 0.9) {
    breaches.push({ type: "exposure", message: "Exposure approaching limit", severity: "warn", timestamp: new Date() });
  }
  if (dailyLoss > dailyLossLimit * 0.9) {
    breaches.push({ type: "daily_loss", message: "Daily loss approaching limit", severity: "warn", timestamp: new Date() });
  }

  res.json({
    guardianStatus: state.guardianStatus,
    currentExposure,
    exposureLimit,
    dailyLoss,
    dailyLossLimit,
    killSwitchActive: state.killSwitchActive,
    breaches,
    lastChecked: state.lastChecked,
  });
});

router.get("/settings", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    maxPositions: 10,
    maxOrderSize: parseFloat(profile.maxExposure) * 0.1,
    guardianEnabled: true,
  });
});

router.put("/settings", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { riskMode, maxExposure, maxDailyLoss, autoTrade } = req.body;

  const updates: Partial<typeof profilesTable.$inferInsert> = { updatedAt: new Date() };
  if (riskMode) updates.riskMode = riskMode;
  if (maxExposure !== undefined) updates.maxExposure = String(maxExposure);
  if (maxDailyLoss !== undefined) updates.maxDailyLoss = String(maxDailyLoss);
  if (autoTrade !== undefined) updates.autoTrade = autoTrade;

  const [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.userId, userId)).returning();

  await db.insert(auditLogsTable).values({
    userId,
    level: "info",
    category: "risk",
    message: "Risk settings updated",
    metadata: JSON.stringify({ riskMode, maxExposure, maxDailyLoss, autoTrade }),
  });

  res.json({
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    maxPositions: 10,
    maxOrderSize: parseFloat(profile.maxExposure) * 0.1,
    guardianEnabled: true,
  });
});

export { router as riskRouter };
