import { useGetDashboardSummary, useGetPositions, useGetRoutingDecisions, useTriggerKillSwitch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: positions, isLoading: loadingPositions } = useGetPositions();
  const { data: decisions, isLoading: loadingDecisions } = useGetRoutingDecisions();
  const killSwitch = useTriggerKillSwitch();
  const { toast } = useToast();

  const handleKillSwitch = () => {
    if (confirm("WARNING: This will immediately close all open positions and halt trading. Proceed?")) {
      killSwitch.mutate({ data: { action: "trigger", reason: "Manual dashboard override" } }, {
        onSuccess: () => {
          toast({
            title: "Kill Switch Activated",
            description: "All trading halted. Positions closing.",
            variant: "destructive"
          });
        }
      });
    }
  };

  if (loadingSummary || loadingPositions || loadingDecisions) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Terminal Overview</h1>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Guardian Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${summary?.guardianStatus === 'healthy' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
              {summary?.guardianStatus?.toUpperCase()}
            </span>
          </div>
          <Button 
            variant="destructive" 
            className="font-bold gap-2"
            onClick={handleKillSwitch}
            disabled={summary?.killSwitchActive}
          >
            <ShieldAlert className="w-4 h-4" />
            {summary?.killSwitchActive ? 'SYSTEM HALTED' : 'ENGAGE KILL SWITCH'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${summary?.totalBalanceUsd?.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${(summary?.dailyPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${summary?.dailyPnl?.toLocaleString()} ({summary?.dailyPnlPct}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.exposurePct}%</div>
            <p className="text-xs text-muted-foreground mt-1">${summary?.exposure?.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.activePositions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="pb-2">Symbol</th>
                    <th className="pb-2">Side</th>
                    <th className="pb-2">Size</th>
                    <th className="pb-2">Entry</th>
                    <th className="pb-2">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {positions?.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 font-medium">{p.symbol}</td>
                      <td className={`py-3 ${p.side === 'long' ? 'text-green-500' : 'text-red-500'}`}>{p.side.toUpperCase()}</td>
                      <td className="py-3">{p.size}</td>
                      <td className="py-3">${p.entryPrice}</td>
                      <td className={`py-3 ${p.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${p.unrealizedPnl}
                      </td>
                    </tr>
                  ))}
                  {(!positions || positions.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No active positions</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Routing Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decisions?.slice(0, 5).map((d: any) => (
                <div key={d.id} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{d.symbol} &rarr; {d.exchange.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(d.timestamp).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${d.decision === 'execute' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {d.decision.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">{d.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}