import { Router } from "express";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", (_req, res) => {
  res.json([
    {
      id: "btcc",
      name: "BTCC",
      role: "broker_execution",
      status: "connected",
      description: "BTCC is a tier-1 crypto exchange providing order execution, account data, and real-time position management. All crypto trade execution routes through BTCC's adapter.",
      capabilities: ["order_execution", "account_data", "position_management", "order_book", "market_data"],
      lastChecked: new Date(),
    },
    {
      id: "bitget",
      name: "Bitget",
      role: "broker_execution",
      status: "connected",
      description: "Bitget is a leading derivatives and spot crypto exchange. The Bitget adapter handles order routing, fills, and account reconciliation.",
      capabilities: ["order_execution", "account_data", "futures_trading", "copy_trading", "position_management"],
      lastChecked: new Date(),
    },
    {
      id: "forex-com",
      name: "Forex.com",
      role: "broker_execution",
      status: "connected",
      description: "Forex.com provides broker execution services and account data access for supported forex and CFD instruments. Forex.com is exclusively a broker execution and account-data partner — it is not an authentication provider.",
      capabilities: ["broker_execution", "account_data", "forex_instruments", "cfd_execution"],
      lastChecked: new Date(),
    },
    {
      id: "yahoo-finance",
      name: "Yahoo Finance",
      role: "market_data",
      status: "connected",
      description: "Yahoo Finance provides real-time and historical market data including prices, charts, news, and benchmarks. Yahoo Finance is exclusively a market data partner.",
      capabilities: ["price_data", "historical_data", "market_news", "charts", "benchmarks"],
      lastChecked: new Date(),
    },
    {
      id: "investopedia",
      name: "Investopedia",
      role: "education",
      status: "connected",
      description: "Investopedia provides educational content including term definitions, concept explanations, and learn-more links. Investopedia is exclusively an education partner.",
      capabilities: ["definitions", "educational_articles", "learn_more_links", "glossary"],
      lastChecked: new Date(),
    },
  ]);
});

export { router as partnersRouter };
