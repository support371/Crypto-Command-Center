import { Router, Request } from "express";
import { db } from "@workspace/db";
import { profilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const [profile] = await db.select().from(profilesTable).where(eq(profilesTable.userId, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    userId: profile.userId,
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    preferredExchange: profile.preferredExchange,
    apiKeysBtcc: profile.apiKeysBtcc,
    apiKeysBitget: profile.apiKeysBitget,
    forexAccountId: profile.forexAccountId,
    updatedAt: profile.updatedAt,
  });
});

router.put("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { riskMode, maxExposure, maxDailyLoss, autoTrade, preferredExchange, forexAccountId } = req.body;

  const updates: Partial<typeof profilesTable.$inferInsert> = {};
  if (riskMode) updates.riskMode = riskMode;
  if (maxExposure !== undefined) updates.maxExposure = String(maxExposure);
  if (maxDailyLoss !== undefined) updates.maxDailyLoss = String(maxDailyLoss);
  if (autoTrade !== undefined) updates.autoTrade = autoTrade;
  if (preferredExchange) updates.preferredExchange = preferredExchange;
  if (forexAccountId !== undefined) updates.forexAccountId = forexAccountId;
  updates.updatedAt = new Date();

  const [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.userId, userId)).returning();
  res.json({
    userId: profile.userId,
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    preferredExchange: profile.preferredExchange,
    apiKeysBtcc: profile.apiKeysBtcc,
    apiKeysBitget: profile.apiKeysBitget,
    forexAccountId: profile.forexAccountId,
    updatedAt: profile.updatedAt,
  });
});

export { router as profileRouter };
