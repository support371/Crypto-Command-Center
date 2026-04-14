import { useState } from "react";
import {
  useGetRiskState, useGetKillSwitchStatus, useTriggerKillSwitch,
  useGetRiskSettings, useUpdateRiskSettings
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldAlert, AlertTriangle, ShieldCheck, Radio, RotateCcw, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function GaugeBar({ label, value, max, color }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  const barColor = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">${value.toLocaleString()} / ${max.toLocaleString()} <span className="text-muted-foreground">({pct.toFixed(1)}%)</span></span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Risk() {
  const { data: state, isLoading: loadingState } = useGetRiskState();
  const { data: ks, isLoading: loadingKs, refetch: refetchKs } = useGetKillSwitchStatus();
  const { data: settings, isLoading: loadingSettings } = useGetRiskSettings();
  const triggerKs = useTriggerKillSwitch();
  const updateSettings = useUpdateRiskSettings();
  const { toast } = useToast();

  const [maxExposure, setMaxExposure] = useState("");
  const [maxDailyLoss, setMaxDailyLoss] = useState("");
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  if (settings && !settingsInitialized) {
    setMaxExposure(String(settings.maxExposure || 50000));
    setMaxDailyLoss(String(settings.maxDailyLoss || 5000));
    setSettingsInitialized(true);
  }

  const handleKillSwitch = (action: "trigger" | "reset") => {
    const msg = action === "trigger"
      ? "WARNING: This will halt ALL trading activity and close open positions. Confirm?"
      : "Reset the kill switch and allow trading to resume?";
    if (!confirm(msg)) return;

    triggerKs.mutate({ data: { action, reason: action === "trigger" ? "Manual override from Risk Monitor" : "Manual reset from Risk Monitor" } }, {
      onSuccess: () => {
        toast({
          title: action === "trigger" ? "Kill Switch Activated" : "Kill Switch Reset",
          description: action === "trigger" ? "All trading halted. Positions closing." : "Trading may now resume.",
          variant: action === "trigger" ? "destructive" : "default",
        });
        refetchKs();
      }
    });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate({
      data: {
        maxExposure: parseFloat(maxExposure),
        maxDailyLoss: parseFloat(maxDailyLoss),
      }
    }, {
      onSuccess: () => toast({ title: "Risk settings updated", description: "Guardian will enforce new limits immediately." }),
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    });
  };

  if (loadingState || loadingKs || loadingSettings) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const guardianStatus = state?.guardianStatus ?? "healthy";
  const GuardianIcon = guardianStatus === "healthy" ? ShieldCheck : guardianStatus === "warning" ? AlertTriangle : ShieldAlert;
  const guardianColor = guardianStatus === "healthy" ? "text-green-500" : guardianStatus === "warning" ? "text-yellow-500" : "text-red-500";
  const guardianBg = guardianStatus === "healthy" ? "border-green-500/30 bg-green-500/5" : guardianStatus === "warning" ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5";

  const killActive = ks?.active ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Guardian Risk Monitor</h1>
        <p className="text-sm text-muted-foreground">Architecture & Risk Agent · Real-time policy enforcement and kill-switch control</p>
      </div>

      {/* Top row: Guardian + Kill Switch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guardian Status */}
        <Card className={`border ${guardianBg}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GuardianIcon className={`w-5 h-5 ${guardianColor}`} />
              Guardian Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold uppercase tracking-widest mb-2 ${guardianColor}`}>
              {guardianStatus}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {state?.lastChecked ? new Date(state.lastChecked).toLocaleTimeString() : "—"}
            </p>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground/60 uppercase text-[10px] tracking-wider mb-2">Guardian Responsibilities</p>
              {[
                "Enforces exposure and daily loss limits",
                "Monitors all positions in real-time",
                "Auto-triggers kill switch on breach",
                "Logs every risk event immutably",
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${guardianColor}`} />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kill Switch */}
        <Card className={`border ${killActive ? "border-red-500/50 bg-red-500/5" : "border-border"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {killActive ? <Radio className="w-5 h-5 text-red-500 animate-pulse" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
              Kill Switch
            </CardTitle>
            <CardDescription className="text-xs">Emergency halt — stops all trading across all exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            {killActive ? (
              <div className="space-y-3">
                <div className="text-2xl font-bold text-red-500 animate-pulse">SYSTEM HALTED</div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  {ks?.reason && <p>Reason: <span className="text-foreground">{ks.reason}</span></p>}
                  {ks?.triggeredAt && <p>Triggered: {new Date(ks.triggeredAt).toLocaleString()}</p>}
                  {ks?.triggeredBy && <p>By: {ks.triggeredBy}</p>}
                </div>
                {ks?.canReset && (
                  <Button variant="outline" className="w-full gap-2 border-green-500/30 text-green-500 hover:bg-green-500/10" onClick={() => handleKillSwitch("reset")} disabled={triggerKs.isPending}>
                    {triggerKs.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Reset Kill Switch
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Trading is active. The kill switch can be engaged manually at any time or will auto-trigger if risk limits are breached.
                </div>
                <Button variant="destructive" className="w-full gap-2 font-bold" onClick={() => handleKillSwitch("trigger")} disabled={triggerKs.isPending}>
                  {triggerKs.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  ENGAGE KILL SWITCH
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exposure Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Live Exposure Metrics</CardTitle>
          <CardDescription className="text-xs">Real-time guardian enforcement gauges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <GaugeBar
            label="Current Exposure"
            value={parseFloat(String(state?.currentExposure || 0))}
            max={parseFloat(String(state?.exposureLimit || 50000))}
          />
          <GaugeBar
            label="Daily Loss"
            value={parseFloat(String(state?.dailyLoss || 0))}
            max={parseFloat(String(state?.dailyLossLimit || 5000))}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Events</CardTitle>
            <CardDescription className="text-xs">Guardian interventions and breach history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {state?.breaches?.map((breach: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  {breach.severity === "critical"
                    ? <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium">{breach.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="uppercase font-semibold">{breach.type}</span>
                      <span>·</span>
                      <span>{new Date(breach.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!state?.breaches || state.breaches.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ShieldCheck className="w-8 h-8 text-green-500/50 mb-2" />
                  <p className="text-sm">No risk breaches recorded</p>
                  <p className="text-xs mt-1">Guardian is operating within all limits</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Limit Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Risk Limit Configuration</CardTitle>
            <CardDescription className="text-xs">Guardian enforcement thresholds — changes take effect immediately</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="riskMaxExp" className="text-xs">Maximum Exposure (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="riskMaxExp"
                  type="number"
                  value={maxExposure}
                  onChange={e => setMaxExposure(e.target.value)}
                  className="pl-7 bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="riskMaxLoss" className="text-xs">Maximum Daily Loss (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="riskMaxLoss"
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(e.target.value)}
                  className="pl-7 bg-background"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
              Limit changes are enforced immediately. Exceeding these thresholds triggers automatic kill-switch activation.
            </div>
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="w-full gap-2">
              {updateSettings.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <ShieldCheck className="w-4 h-4" />
              Update Risk Limits
            </Button>
            {settings?.updatedAt && (
              <p className="text-[10px] text-muted-foreground text-center">
                Last updated: {new Date(settings.updatedAt).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
