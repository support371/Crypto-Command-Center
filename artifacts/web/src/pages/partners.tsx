import { useGetExchanges } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Shield, Globe, BookOpen, AlertTriangle } from "lucide-react";

type PartnerRole = "exchange" | "broker" | "data" | "education";

interface Partner {
  id: string;
  name: string;
  tagline: string;
  role: PartnerRole;
  roleLabel: string;
  agentBoundary: string;
  capabilities: string[];
  restrictions: string[];
  isAuthProvider: boolean;
  priority?: "primary" | "secondary";
  exchangeKey?: string;
}

const PARTNERS: Partner[] = [
  {
    id: "btcc",
    name: "BTCC",
    tagline: "Established crypto exchange with deep BTC/ETH liquidity",
    role: "exchange",
    roleLabel: "Crypto Exchange",
    agentBoundary: "Backend & Adapter Agent",
    capabilities: [
      "Spot and futures order execution",
      "Account balance and position data",
      "Real-time order book access",
      "Trade history retrieval",
      "WebSocket market feed",
    ],
    restrictions: [
      "Not used for authentication or user identity",
      "Not a source of risk policy",
      "Not a data provider for market news",
    ],
    isAuthProvider: false,
    priority: "primary",
    exchangeKey: "btcc",
  },
  {
    id: "bitget",
    name: "Bitget",
    tagline: "Competitive crypto exchange with copy-trading and derivatives",
    role: "exchange",
    roleLabel: "Crypto Exchange",
    agentBoundary: "Backend & Adapter Agent",
    capabilities: [
      "Spot and derivatives execution",
      "Account balance and margin data",
      "Order management and fills",
      "Position and PnL data",
      "REST and WebSocket API",
    ],
    restrictions: [
      "Not used for authentication or user identity",
      "Not a source of risk policy",
      "Not a market data editorial source",
    ],
    isAuthProvider: false,
    priority: "secondary",
    exchangeKey: "bitget",
  },
  {
    id: "forex",
    name: "Forex.com",
    tagline: "Regulated global broker for FX and CFD execution",
    role: "broker",
    roleLabel: "Broker Execution",
    agentBoundary: "Backend & Adapter Agent",
    capabilities: [
      "Broker order execution (FX, CFDs)",
      "Account data and margin information",
      "Position and open order retrieval",
    ],
    restrictions: [
      "NOT an authentication provider — login is handled by NexusCore Auth only",
      "Not a source of crypto exchange data",
      "Not a market data or news provider",
      "Not an education content provider",
    ],
    isAuthProvider: false,
  },
  {
    id: "yahoo",
    name: "Yahoo Finance",
    tagline: "Market data source for prices, benchmarks, and financial news",
    role: "data",
    roleLabel: "Market Data",
    agentBoundary: "Market Data Layer",
    capabilities: [
      "Cryptocurrency price feeds",
      "24h price change and volume data",
      "Market cap and dominance metrics",
      "Financial news and analysis",
      "Fear & Greed Index data",
    ],
    restrictions: [
      "NOT an authentication provider",
      "Not used for trade execution",
      "Not used for risk policy decisions",
      "Market data is informational, not a trading signal source",
    ],
    isAuthProvider: false,
  },
  {
    id: "investopedia",
    name: "Investopedia",
    tagline: "Authoritative financial education and term definitions",
    role: "education",
    roleLabel: "Education",
    agentBoundary: "Education Layer",
    capabilities: [
      "Term definitions and explanations",
      "Algorithmic trading concepts",
      "Risk management guides",
      "Strategy articles and tutorials",
      "External deep-links for further reading",
    ],
    restrictions: [
      "NOT an authentication provider",
      "Not used for trade execution",
      "Not used for market data or pricing",
      "Content is educational only — not investment advice",
    ],
    isAuthProvider: false,
  },
];

const roleConfig: Record<PartnerRole, { color: string; icon: any; bgColor: string }> = {
  exchange: { color: "text-primary", bgColor: "bg-primary/10 border-primary/20", icon: Globe },
  broker: { color: "text-amber-500", bgColor: "bg-amber-500/10 border-amber-500/20", icon: Shield },
  data: { color: "text-blue-400", bgColor: "bg-blue-400/10 border-blue-400/20", icon: Globe },
  education: { color: "text-purple-400", bgColor: "bg-purple-400/10 border-purple-400/20", icon: BookOpen },
};

export default function Partners() {
  const { data: exchanges } = useGetExchanges();

  const getExchangeStatus = (key?: string) => {
    if (!key) return null;
    return exchanges?.find((e: any) => e.exchange === key);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Partner Integrations</h1>
        <p className="text-sm text-muted-foreground">Each partner operates within a strictly defined role boundary. No partner crosses into another partner's domain.</p>
      </div>

      {/* Role boundary notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-amber-500">
          <p className="font-semibold mb-1">Partner Role Boundaries are Strictly Enforced</p>
          <p className="text-xs opacity-90">Forex.com, Yahoo Finance, and Investopedia are not login providers. Authentication is handled exclusively by the NexusCore Registration Agent. Each partner's data flows only through its designated agent layer.</p>
        </div>
      </div>

      {/* Exchange partners first */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mb-3">Crypto Exchanges · Active Integration Priority</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNERS.filter(p => p.role === "exchange").map(partner => {
            const cfg = roleConfig[partner.role];
            const Icon = cfg.icon;
            const exStatus = getExchangeStatus(partner.exchangeKey);
            return (
              <Card key={partner.id} className={`border ${partner.priority === "primary" ? "border-primary/30" : "border-border"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bgColor} border`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{partner.name}</CardTitle>
                          {partner.priority && (
                            <Badge className={`text-[10px] h-4 ${partner.priority === "primary" ? "bg-primary/20 text-primary border-primary/30" : "bg-muted text-muted-foreground"}`}>
                              {partner.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{partner.roleLabel}</p>
                      </div>
                    </div>
                    {exStatus && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${exStatus.status === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        <span className={exStatus.status === "connected" ? "text-green-500" : "text-red-500"}>
                          {exStatus.status?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{partner.tagline}</p>

                  {exStatus && (
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-muted/20 border border-border text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Latency</p>
                        <p className="font-mono font-medium">{exStatus.latency?.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Fill Rate</p>
                        <p className="font-mono font-medium">{(exStatus.fillRate * 100)?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Orders Today</p>
                        <p className="font-mono font-medium">{exStatus.ordersToday}</p>
                      </div>
                    </div>
                  )}

                  <PartnerCapabilities capabilities={partner.capabilities} restrictions={partner.restrictions} isAuthProvider={partner.isAuthProvider} agentBoundary={partner.agentBoundary} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Broker */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mb-3">Broker Partners</h2>
        <div className="grid grid-cols-1 gap-4">
          {PARTNERS.filter(p => p.role === "broker").map(partner => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </div>

      {/* Data & Education */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mb-3">Data & Education Partners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARTNERS.filter(p => p.role === "data" || p.role === "education").map(partner => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerCapabilities({ capabilities, restrictions, isAuthProvider, agentBoundary }: {
  capabilities: string[];
  restrictions: string[];
  isAuthProvider: boolean;
  agentBoundary: string;
}) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Capabilities</p>
        <div className="space-y-1">
          {capabilities.map((cap, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Boundaries</p>
        <div className="space-y-1">
          {restrictions.map((res, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <XCircle className={`w-3 h-3 shrink-0 ${res.includes("NOT") ? "text-red-500" : "text-muted-foreground"}`} />
              <span className={res.includes("NOT") ? "text-foreground/70 font-medium" : ""}>{res}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border">
        <Shield className="w-3 h-3" />
        <span>Agent boundary: <span className="font-medium text-foreground/60">{agentBoundary}</span></span>
      </div>
    </div>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  const cfg = roleConfig[partner.role];
  const Icon = cfg.icon;
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bgColor} border`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>
          <div>
            <CardTitle className="text-base">{partner.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{partner.roleLabel}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{partner.tagline}</p>
        <PartnerCapabilities capabilities={partner.capabilities} restrictions={partner.restrictions} isAuthProvider={partner.isAuthProvider} agentBoundary={partner.agentBoundary} />
      </CardContent>
    </Card>
  );
}
