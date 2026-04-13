# NexusCore Crypto Trading Platform

## Overview

Full-stack algorithmic crypto trading platform — production-shaped SaaS with a React frontend and Express backend. Designed for sophisticated traders who need real-time risk management, guardian-supervised execution, and explainable routing decisions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Framer Motion

## Architecture

### Frontend (`artifacts/web`)
- React + Vite app at `/` 
- Dark-first design: deep navy (#0D1117 family) + electric blue primary + amber accent + red kill-switch
- Pages: Landing, Login, Register, Onboarding (5-step wizard), Dashboard, Signals, Trades, Risk, Logs, Market, Education, Partners, Settings
- Auth via localStorage token + `setAuthTokenGetter` injected at main.tsx

### Backend (`artifacts/api-server`)
- Express 5 API at `/api`
- Custom Bearer token auth (SHA-256 hash, base64 token — dev only, replace with JWT for production)
- All routes in `artifacts/api-server/src/routes/`

### Database Schema (`lib/db/src/schema`)
- `users` — registration, roles, onboarding status
- `profiles` — risk mode, max exposure, max daily loss, auto-trade, exchange API keys, onboarding step
- `signals` — trading signals with direction/strength/confidence/explanation
- `predictions` — AI model predictions with model name, horizon, confidence
- `trades` — full trade history with exchange, side, size, PnL, status
- `positions` — open positions with unrealized PnL
- `risk_state` — guardian status, exposure, daily loss, kill-switch
- `audit_logs` — immutable audit trail with level/category/message
- `routing_decisions` — exchange routing decisions with explanation

## Key Pages & Responsibilities

### Registration/Auth Agent Layer
- `/register` — creates user + default profile
- `/login` — authenticates, returns Bearer token
- `/api/auth/me` — validates token, returns user

### Architecture & Risk Agent Layer
- `/risk` — guardian status, exposure gauges, breach log
- `/killswitch` — kill-switch trigger/reset
- Risk settings enforce exposure limit and daily loss cap

### Backend & Adapter Layer
- `/exchanges` — BTCC + Bitget adapter status and latency
- `/exchanges/{exchange}/account` — account balances
- `/trades` — trade history with exchange filter
- `/dashboard/routing` — routing decisions with exchange selection rationale

### Verification & Audit Layer
- `/logs` — filterable audit trail
- `/logs/reconciliation` — exchange reconciliation report
- `/dashboard/summary` — health surface

## Partner Boundaries (Strictly Enforced)

- **BTCC**: crypto exchange execution + account data only
- **Bitget**: crypto exchange execution + account data only
- **Forex.com**: broker execution + account data only (NOT an auth provider)
- **Yahoo Finance**: market data only (prices, charts, news, benchmarks)
- **Investopedia**: education only (definitions, learn-more links)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/web run dev` — run frontend locally

## Demo Credentials
- Email: `demo@nexuscore.io`
- Password: `123456` (hash: SHA-256 of "123456nexuscore_salt")

## Deployment Notes

- Ready for Railway deployment with pnpm workspace support
- Frontend builds to static files via `pnpm --filter @workspace/web run build`
- API server bundles to `artifacts/api-server/dist/index.mjs`
- Replace simple SHA-256 token auth with proper JWT for production
- Add real exchange API integration (currently returns mock data for BTCC/Bitget account balances and market prices)
