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
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    complete: user?.onboardingComplete ?? false,
    step: profile.onboardingStep,
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    exchangeConnected: profile.apiKeysBtcc || profile.apiKeysBitget,
  });
});

router.post("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { step, riskMode, maxExposure, maxDailyLoss, autoTrade, exchange, exchangeApiKey, exchangeApiSecret, forexAccountId } = req.body;

  const updates: Partial<typeof profilesTable.$inferInsert> = {};
  if (step !== undefined) updates.onboardingStep = step;
  if (riskMode) updates.riskMode = riskMode;
  if (maxExposure !== undefined) updates.maxExposure = String(maxExposure);
  if (maxDailyLoss !== undefined) updates.maxDailyLoss = String(maxDailyLoss);
  if (autoTrade !== undefined) updates.autoTrade = autoTrade;
  if (exchange === "btcc" || exchange === "both") updates.apiKeysBtcc = !!(exchangeApiKey && exchangeApiSecret);
  if (exchange === "bitget" || exchange === "both") updates.apiKeysBitget = !!(exchangeApiKey && exchangeApiSecret);
  if (forexAccountId !== undefined) updates.forexAccountId = forexAccountId;
  updates.updatedAt = new Date();

  const isComplete = step >= 4;
  if (isComplete) {
    await db.update(usersTable).set({ onboardingComplete: true }).where(eq(usersTable.id, userId));
  }

  const [profile] = await db.update(profilesTable).set(updates).where(eq(profilesTable.userId, userId)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.json({
    complete: user?.onboardingComplete ?? false,
    step: profile.onboardingStep,
    riskMode: profile.riskMode,
    maxExposure: parseFloat(profile.maxExposure),
    maxDailyLoss: parseFloat(profile.maxDailyLoss),
    autoTrade: profile.autoTrade,
    exchangeConnected: profile.apiKeysBtcc || profile.apiKeysBitget,
  });
});

export { router as onboardingRouter };
