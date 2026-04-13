import { Router, Request } from "express";
import { db } from "@workspace/db";
import { riskStateTable, auditLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const [state] = await db.select().from(riskStateTable).where(eq(riskStateTable.userId, userId)).limit(1);

  res.json({
    active: state?.killSwitchActive ?? false,
    reason: state?.killSwitchReason ?? null,
    triggeredAt: state?.killSwitchTriggeredAt ?? null,
    triggeredBy: state?.killSwitchTriggeredBy ?? null,
    canReset: true,
  });
});

router.post("/", async (req, res) => {
  const userId = (req as Request & { userId: number }).userId;
  const { action, reason } = req.body;

  const isTriggering = action === "trigger";

  const [existing] = await db.select().from(riskStateTable).where(eq(riskStateTable.userId, userId)).limit(1);

  if (existing) {
    const [state] = await db.update(riskStateTable).set({
      killSwitchActive: isTriggering,
      killSwitchReason: isTriggering ? (reason || "Manual trigger") : null,
      killSwitchTriggeredAt: isTriggering ? new Date() : null,
      killSwitchTriggeredBy: isTriggering ? "user" : null,
      guardianStatus: isTriggering ? "critical" : "healthy",
    }).where(eq(riskStateTable.userId, userId)).returning();

    await db.insert(auditLogsTable).values({
      userId,
      level: isTriggering ? "error" : "info",
      category: "risk",
      message: isTriggering ? `Kill-switch triggered: ${reason || "Manual trigger"}` : "Kill-switch reset",
      metadata: JSON.stringify({ action, reason }),
    });

    res.json({
      active: state.killSwitchActive,
      reason: state.killSwitchReason,
      triggeredAt: state.killSwitchTriggeredAt,
      triggeredBy: state.killSwitchTriggeredBy,
      canReset: true,
    });
  } else {
    const [state] = await db.insert(riskStateTable).values({
      userId,
      killSwitchActive: isTriggering,
      killSwitchReason: isTriggering ? (reason || "Manual trigger") : null,
      killSwitchTriggeredAt: isTriggering ? new Date() : null,
      killSwitchTriggeredBy: isTriggering ? "user" : null,
      guardianStatus: isTriggering ? "critical" : "healthy",
      currentExposure: "0",
      dailyLoss: "0",
    }).returning();

    res.json({
      active: state.killSwitchActive,
      reason: state.killSwitchReason,
      triggeredAt: state.killSwitchTriggeredAt,
      triggeredBy: state.killSwitchTriggeredBy,
      canReset: true,
    });
  }
});

export { router as killswitchRouter };
