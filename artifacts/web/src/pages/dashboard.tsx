import {
  useGetDashboardSummary, useGetPositions, useGetRoutingDecisions,
  useTriggerKillSwitch, useGetExchanges, useGetMarketOverview, useGetLogs
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Zap, Radio, Activity, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${color || ""}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ReadinessRow({ label, agent, status, note }: { label: string; agent: string; status: "live" | "staging" | "pending"; note: string }) {
  const icon = status === "live"
    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
    : status === "staging"
      ? <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
      : <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />;
  const badge = status === "live"
    ? <Badge className="text-[10px] h-4 bg-green-500/15 text-green-500 border-green-500/30">LIVE</Badge>
    : status === "staging"
      ? <Badge className="text-[10px] h-4 bg-yellow-500/15 text-yellow-500 border-yellow-500/30">STAGING</Badge>
      : <Badge className="text-[10px] h-4 bg-muted text-muted-foreground">PENDING</Badge>;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {badge}
        </div>
        <p className="text-xs text-muted-foreground truncate">{agent} · {note}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: positions, isLoading: loadingPositions } = useGetPositions();
  const { data: decisions, isLoading: loadingDecisions } = useGetRoutingDecisions();
  const { data: exchanges } = useGetExchanges();
  const { data: market } = useGetMarketOverview();
  const { data: recentLogs } = useGetLogs({ limit: 5 });
  const killSwitch = useTriggerKillSwitch();
  const { toast } = useToast();

  const handleKillSwitch = () => {
    if (summary?.killSwitchActive) return;
    if (confirm("WARNING: This will immediately halt all trading activity across all exchanges. Proceed?")) {
      killSwitch.mutate({ data: { action: "trigger", reason: "Manual dashboard override" } }, {
        onSuccess: () => {
          toast({ title: "Kill Switch Activated", description: "All trading halted. Positions are being closed.", variant: "destructive" });
        }
      });
    }
  };

  if (loadingSummary || loadingPositions || loadingDecisions) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const guardianStatus = summary?.guardianStatus ?? "healthy";
  const GuardianIcon = guardianStatus === "healthy" ? ShieldCheck : guardianStatus === "warning" ? AlertTriangle : ShieldAlert;
  const guardianColor = guardianStatus === "healthy" ? "text-green-500" : guardianStatus === "warning" ? "text-yellow-500" : "text-red-500";

  const btc = market?.assets?.find((a: any) => a.symbol === "BTC-USD");
  const eth = market?.assets?.find((a: any) => a.symbol === "ETH-USD");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Terminal Overview</h1>
          <p className="text-sm text-muted-foreground">Live execution command center · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${guardianStatus === "healthy" ? "border-green-500/30 bg-green-500/10 text-green-500" : guardianStatus === "warning" ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500" : "border-red-500/30 bg-red-500/10 text-red-500"}`}>
            <GuardianIcon className={`w-3.5 h-3.5 ${guardianColor}`} />
            Guardian: {guardianStatus.toUpperCase()}
          </div>
          <Button
            variant={summary?.killSwitchActive ? "outline" : "destructive"}
            size="sm"
            className={`font-bold gap-2 ${summary?.killSwitchActive ? "border-destructive text-destructive animate-pulse" : ""}`}
            onClick={handleKillSwitch}
            disabled={killSwitch.isPending}
          >
            {summary?.killSwitchActive ? <Radio className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            {summary?.killSwitchActive ? "SYSTEM HALTED" : "KILL SWITCH"}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Portfolio Value"
          value={`$${summary?.totalBalanceUsd?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          sub="Across all exchanges"
        />
        <KpiCard
          label="Daily PnL"
          value={`${(summary?.dailyPnl || 0) >= 0 ? "+" : ""}$${summary?.dailyPnl?.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          sub={`${summary?.dailyPnlPct?.toFixed(2)}% today`}
          color={(summary?.dailyPnl || 0) >= 0 ? "text-green-500" : "text-red-500"}
        />
        <KpiCard
          label="Exposure"
          value={`${summary?.exposurePct?.toFixed(1)}%`}
          sub={`$${summary?.exposure?.toLocaleString(undefined, { maximumFractionDigits: 0 })} deployed`}
          color={(summary?.exposurePct || 0) > 80 ? "text-red-500" : (summary?.exposurePct || 0) > 50 ? "text-yellow-500" : ""}
        />
        <KpiCard
          label="Open Positions"
          value={String(summary?.activePositions ?? 0)}
          sub={`${summary?.openOrders ?? 0} pending orders`}
        />
      </div>

      {/* Exchange Status Band */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(exchanges || []).map((ex: any) => (
          <Card key={ex.exchange} className="border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ex.status === "connected" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  <span className="font-bold text-sm uppercase tracking-wide">{ex.exchange}</span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {ex.exchange === "btcc" ? "Primary" : "Secondary"}
                  </Badge>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${ex.status === "connected" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                  {ex.status?.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground mb-0.5">Latency</p>
                  <p className="font-mono font-medium">{ex.latency?.toFixed(0)}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Fill Rate</p>
                  <p className="font-mono font-medium">{(ex.fillRate * 100)?.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5">Orders Today</p>
                  <p className="font-mono font-medium">{ex.ordersToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Mini-Snapshot */}
      {market && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[btc, eth].filter(Boolean).map((asset: any) => (
            <Card key={asset.symbol} className="border-border">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">{asset.symbol.split("-")[0]}</span>
                  {asset.changePct24h >= 0
                    ? <TrendingUp className="w-3 h-3 text-green-500" />
                    : <TrendingDown className="w-3 h-3 text-red-500" />}
                </div>
                <p className="text-base font-bold font-mono">${asset.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className={`text-xs font-medium ${asset.changePct24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {asset.changePct24h >= 0 ? "+" : ""}{asset.changePct24h?.toFixed(2)}% 24h
                </p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Fear & Greed</p>
              <p className="text-base font-bold">{market.fearGreedIndex}</p>
              <p className={`text-xs font-medium ${market.fearGreedIndex >= 60 ? "text-green-500" : market.fearGreedIndex >= 40 ? "text-yellow-500" : "text-red-500"}`}>
                {market.fearGreedLabel}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-3 pb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">BTC Dominance</p>
              <p className="text-base font-bold">{market.btcDominance}%</p>
              <p className="text-xs text-muted-foreground">of total mkt cap</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Open Positions</CardTitle>
              <Link href="/trades" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b border-border">
                    <th className="pb-2 font-medium">Symbol</th>
                    <th className="pb-2 font-medium">Exchange</th>
                    <th className="pb-2 font-medium">Side</th>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium text-right">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {positions?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="py-2.5 font-medium">{p.symbol}</td>
                      <td className="py-2.5 text-xs uppercase text-muted-foreground">{p.exchange}</td>
                      <td className={`py-2.5 text-xs font-bold ${p.side === "long" ? "text-green-500" : "text-red-500"}`}>{p.side.toUpperCase()}</td>
                      <td className="py-2.5 font-mono text-xs">{p.size}</td>
                      <td className={`py-2.5 font-mono text-xs text-right font-medium ${p.unrealizedPnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {p.unrealizedPnl >= 0 ? "+" : ""}${p.unrealizedPnl?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!positions || positions.length === 0) && (
                    <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No active positions</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Routing Decisions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Routing Decisions</CardTitle>
              <Link href="/signals" className="text-xs text-primary hover:underline">View signals →</Link>
            </div>
            <CardDescription className="text-xs">Exchange selection rationale from execution core</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {decisions?.slice(0, 6).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 rounded-md bg-muted/20 border border-border">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{d.symbol}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="text-xs font-bold uppercase">{d.exchange}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-48">{d.reason}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.decision === "execute" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                      {d.decision?.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(d.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {(!decisions || decisions.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">No routing decisions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Audit Log */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Audit Events</CardTitle>
              <Link href="/logs" className="text-xs text-primary hover:underline">Full log →</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentLogs?.slice(0, 5).map((log: any) => (
                <div key={log.id} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.level === "error" ? "bg-red-500/10 text-red-500"
                    : log.level === "warn" ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-muted text-muted-foreground"
                  }`}>{log.level}</span>
                  <div className="min-w-0">
                    <p className="truncate">{log.message}</p>
                    <p className="text-muted-foreground">{log.category} · {new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {(!recentLogs || recentLogs.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent events</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Surface */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">System Readiness</CardTitle>
            <CardDescription className="text-xs">Agent layer status · staging vs live grade</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadinessRow label="Auth & Registration" agent="Registration Agent" status="live" note="Users, sessions, onboarding complete" />
            <ReadinessRow label="Risk & Guardian" agent="Architecture & Risk Agent" status="live" note="Guardian active, kill-switch wired" />
            <ReadinessRow label="BTCC Adapter" agent="Backend & Adapter Agent" status="staging" note="Mock data · real API keys not connected" />
            <ReadinessRow label="Bitget Adapter" agent="Backend & Adapter Agent" status="staging" note="Mock data · real API keys not connected" />
            <ReadinessRow label="Audit & Reconciliation" agent="Verification Agent" status="live" note="Logs, reconciliation, health running" />
            <ReadinessRow label="Production Deployment" agent="Infrastructure" status="staging" note="Railway-ready · not yet deployed" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
