import { Router } from "express";
import { authMiddleware } from "../lib/auth-middleware.js";

const router = Router();
router.use(authMiddleware);

const MARKET_DATA = [
  { symbol: "BTC-USD", name: "Bitcoin", price: 67420.50, change24h: 1234.20, changePct24h: 1.86, volume24h: 28500000000, marketCap: 1320000000000, high24h: 68100, low24h: 65800, source: "Yahoo Finance" },
  { symbol: "ETH-USD", name: "Ethereum", price: 3512.80, change24h: -45.30, changePct24h: -1.27, volume24h: 12400000000, marketCap: 421000000000, high24h: 3600, low24h: 3480, source: "Yahoo Finance" },
  { symbol: "BNB-USD", name: "BNB", price: 612.40, change24h: 8.90, changePct24h: 1.47, volume24h: 1800000000, marketCap: 89000000000, high24h: 625, low24h: 598, source: "Yahoo Finance" },
  { symbol: "SOL-USD", name: "Solana", price: 178.60, change24h: -3.20, changePct24h: -1.76, volume24h: 3200000000, marketCap: 82000000000, high24h: 185, low24h: 174, source: "Yahoo Finance" },
  { symbol: "USDT-USD", name: "Tether", price: 1.00, change24h: 0.0001, changePct24h: 0.01, volume24h: 45000000000, marketCap: 112000000000, high24h: 1.001, low24h: 0.999, source: "Yahoo Finance" },
];

router.get("/overview", (_req, res) => {
  const assets = MARKET_DATA.map(a => ({
    ...a,
    price: a.price * (1 + (Math.random() - 0.5) * 0.001),
  }));

  res.json({
    assets,
    btcDominance: 52.4,
    totalMarketCap: 2380000000000,
    fearGreedIndex: 68,
    fearGreedLabel: "Greed",
    updatedAt: new Date(),
  });
});

router.get("/prices", (req, res) => {
  const { symbols } = req.query;
  const symbolList = symbols ? String(symbols).split(",") : MARKET_DATA.map(a => a.symbol);
  const filtered = MARKET_DATA.filter(a => symbolList.includes(a.symbol));
  res.json(filtered.map(a => ({
    ...a,
    price: a.price * (1 + (Math.random() - 0.5) * 0.001),
  })));
});

router.get("/news", (req, res) => {
  const limit = parseInt(String(req.query.limit || "10"));
  const news = [
    { id: "1", title: "Bitcoin Surges Past $67K as Institutional Demand Rises", summary: "Major institutional investors continue to pour capital into Bitcoin as ETF inflows hit a new weekly record.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 3600000), source: "Yahoo Finance", sentiment: "positive", relatedAssets: ["BTC-USD"] },
    { id: "2", title: "Ethereum Layer 2 Adoption Accelerates Amid Fee Optimization", summary: "Transaction volumes on Ethereum Layer 2 networks continue to climb as DeFi protocols migrate for lower fees.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 7200000), source: "Yahoo Finance", sentiment: "positive", relatedAssets: ["ETH-USD"] },
    { id: "3", title: "Crypto Market Faces Regulatory Headwinds in Multiple Jurisdictions", summary: "Regulatory bodies in several countries are increasing scrutiny of crypto exchanges and DeFi protocols.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 10800000), source: "Yahoo Finance", sentiment: "negative", relatedAssets: ["BTC-USD", "ETH-USD"] },
    { id: "4", title: "Solana Network Records Highest Daily Transaction Volume", summary: "Solana processed over 180 million transactions in a single day, demonstrating strong network activity.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 14400000), source: "Yahoo Finance", sentiment: "positive", relatedAssets: ["SOL-USD"] },
    { id: "5", title: "BNB Chain Launches New Validator Incentive Program", summary: "Binance's BNB Chain announced a $100M incentive program to attract new validators and strengthen network security.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 18000000), source: "Yahoo Finance", sentiment: "neutral", relatedAssets: ["BNB-USD"] },
    { id: "6", title: "Crypto Fear & Greed Index Reaches 'Greed' Territory", summary: "The Crypto Fear & Greed Index climbed to 68, indicating growing market optimism among retail and institutional investors.", url: "https://finance.yahoo.com", publishedAt: new Date(Date.now() - 21600000), source: "Yahoo Finance", sentiment: "neutral", relatedAssets: ["BTC-USD"] },
  ].slice(0, limit);
  res.json(news);
});

export { router as marketRouter };
