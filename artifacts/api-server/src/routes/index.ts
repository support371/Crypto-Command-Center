import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import { authRouter } from "./auth.js";
import { profileRouter } from "./profile.js";
import { onboardingRouter } from "./onboarding.js";
import { dashboardRouter } from "./dashboard.js";
import { signalsRouter } from "./signals.js";
import { tradesRouter } from "./trades.js";
import { riskRouter } from "./risk.js";
import { killswitchRouter } from "./killswitch.js";
import { logsRouter } from "./logs.js";
import { marketRouter } from "./market.js";
import { educationRouter } from "./education.js";
import { partnersRouter } from "./partners.js";
import { exchangesRouter } from "./exchanges.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/onboarding", onboardingRouter);
router.use("/dashboard", dashboardRouter);
router.use("/signals", signalsRouter);
router.use("/trades", tradesRouter);
router.use("/risk", riskRouter);
router.use("/killswitch", killswitchRouter);
router.use("/logs", logsRouter);
router.use("/market", marketRouter);
router.use("/education", educationRouter);
router.use("/partners", partnersRouter);
router.use("/exchanges", exchangesRouter);

export default router;
