import { useState, useEffect } from "react";
import { useGetProfile, useUpdateProfile, useGetCurrentUser, useGetExchanges } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, AlertTriangle, Settings2, Zap, Link2, User, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: user } = useGetCurrentUser();
  const { data: exchanges } = useGetExchanges();
  const update = useUpdateProfile();
  const { toast } = useToast();

  const [riskMode, setRiskMode] = useState("moderate");
  const [maxExposure, setMaxExposure] = useState("50000");
  const [maxDailyLoss, setMaxDailyLoss] = useState("5000");
  const [autoTrade, setAutoTrade] = useState(false);
  const [preferredExchange, setPreferredExchange] = useState("btcc");
  const [forexAccountId, setForexAccountId] = useState("");

  useEffect(() => {
    if (profile) {
      setRiskMode(profile.riskMode || "moderate");
      setMaxExposure(String(profile.maxExposure || 50000));
      setMaxDailyLoss(String(profile.maxDailyLoss || 5000));
      setAutoTrade(profile.autoTrade ?? false);
      setPreferredExchange(profile.preferredExchange || "btcc");
      setForexAccountId(profile.forexAccountId || "");
    }
  }, [profile]);

  const handleSave = () => {
    update.mutate({
      data: {
        riskMode,
        maxExposure: parseFloat(maxExposure),
        maxDailyLoss: parseFloat(maxDailyLoss),
        autoTrade,
        preferredExchange,
        forexAccountId,
      }
    }, {
      onSuccess: () => toast({ title: "Settings saved", description: "Your risk policy and preferences have been updated." }),
      onError: () => toast({ title: "Save failed", description: "Please try again.", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const riskModes = [
    { value: "conservative", label: "Conservative", description: "Minimal risk, smaller positions, tighter stops" },
    { value: "moderate", label: "Moderate", description: "Balanced risk/reward with standard position sizing" },
    { value: "aggressive", label: "Aggressive", description: "Higher risk tolerance, larger positions, wider stops" },
  ];

  const btccStatus = exchanges?.find((e: any) => e.exchange === "btcc");
  const bitgetStatus = exchanges?.find((e: any) => e.exchange === "bitget");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your risk policy, strategy preferences, and exchange connections.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={User} title="Account Profile" description="Your identity on the NexusCore terminal" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium mt-0.5">{user?.name || "—"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium mt-0.5">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded bg-muted/30 border border-border text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Account name and email changes require contacting your administrator.
          </div>
        </CardContent>
      </Card>

      {/* Risk Policy */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={ShieldCheck} title="Risk Policy" description="Guardian enforcement parameters — applied to all trading activity" />
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Risk Mode */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Risk Mode</Label>
            <div className="grid grid-cols-3 gap-2">
              {riskModes.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setRiskMode(mode.value)}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${riskMode === mode.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}
                >
                  <p className="font-semibold text-xs mb-1">{mode.label}</p>
                  <p className="text-[10px] leading-tight opacity-80">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Exposure & Loss */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="maxExposure" className="text-xs">Max Exposure (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="maxExposure"
                  type="number"
                  value={maxExposure}
                  onChange={e => setMaxExposure(e.target.value)}
                  className="pl-7 bg-background text-sm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Maximum total market exposure at any time</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxDailyLoss" className="text-xs">Max Daily Loss (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="maxDailyLoss"
                  type="number"
                  value={maxDailyLoss}
                  onChange={e => setMaxDailyLoss(e.target.value)}
                  className="pl-7 bg-background text-sm"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Guardian triggers halt when daily loss exceeds this</p>
            </div>
          </div>

          {/* Auto-trade */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
            <div>
              <p className="text-sm font-medium">Auto-Trade Execution</p>
              <p className="text-xs text-muted-foreground">Allow the execution core to place trades automatically on qualified signals</p>
            </div>
            <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
          </div>
        </CardContent>
      </Card>

      {/* Strategy Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Settings2} title="Strategy Preferences" description="Routing and execution preferences for the trading engine" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium mb-2 block">Preferred Routing Exchange</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "btcc", label: "BTCC", note: "Primary crypto exchange" },
                { value: "bitget", label: "Bitget", note: "Secondary crypto exchange" },
              ].map(ex => (
                <button
                  key={ex.value}
                  onClick={() => setPreferredExchange(ex.value)}
                  className={`text-left p-3 rounded-lg border transition-colors ${preferredExchange === ex.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${ex.value === "btcc" ? (btccStatus?.status === "connected" ? "bg-green-500" : "bg-red-500") : (bitgetStatus?.status === "connected" ? "bg-green-500" : "bg-red-500")}`} />
                    <span className="text-sm font-bold">{ex.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ex.note}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Connections */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Link2} title="Exchange & Broker Connections" description="Integration metadata for connected execution partners" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* BTCC */}
          <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${btccStatus?.status === "connected" ? "bg-green-500" : "bg-muted-foreground"}`} />
                <span className="text-sm font-bold">BTCC</span>
                <Badge variant="outline" className="text-[10px] h-4">Crypto Exchange · Primary</Badge>
              </div>
              <span className={`text-xs font-medium ${btccStatus?.status === "connected" ? "text-green-500" : "text-muted-foreground"}`}>
                {btccStatus?.status === "connected" ? "CONNECTED" : "NOT CONFIGURED"}
              </span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <Input
                type="password"
                placeholder={profile?.apiKeysBtcc ? "••••••••••••••••" : "Enter BTCC API key"}
                className="bg-background text-sm mt-1"
                disabled
              />
              <p className="text-[10px] text-muted-foreground mt-1">API key management requires the execution core configuration interface</p>
            </div>
          </div>

          {/* Bitget */}
          <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${bitgetStatus?.status === "connected" ? "bg-green-500" : "bg-muted-foreground"}`} />
                <span className="text-sm font-bold">Bitget</span>
                <Badge variant="outline" className="text-[10px] h-4">Crypto Exchange · Secondary</Badge>
              </div>
              <span className={`text-xs font-medium ${bitgetStatus?.status === "connected" ? "text-green-500" : "text-muted-foreground"}`}>
                {bitgetStatus?.status === "connected" ? "CONNECTED" : "NOT CONFIGURED"}
              </span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <Input
                type="password"
                placeholder={profile?.apiKeysBitget ? "••••••••••••••••" : "Enter Bitget API key"}
                className="bg-background text-sm mt-1"
                disabled
              />
              <p className="text-[10px] text-muted-foreground mt-1">API key management requires the execution core configuration interface</p>
            </div>
          </div>

          {/* Forex.com */}
          <div className="p-3 rounded-lg border border-border bg-muted/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${forexAccountId ? "bg-green-500" : "bg-muted-foreground"}`} />
                <span className="text-sm font-bold">Forex.com</span>
                <Badge variant="outline" className="text-[10px] h-4">Broker Execution · Account Data Only</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="forexAccountId" className="text-xs text-muted-foreground">Account ID</Label>
              <Input
                id="forexAccountId"
                value={forexAccountId}
                onChange={e => setForexAccountId(e.target.value)}
                placeholder="e.g. FX-00123456"
                className="bg-background text-sm mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Used for broker execution and account-data queries only. Not an authentication provider.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Forex.com, Yahoo Finance, and Investopedia are role-scoped partners — not login providers. Their data is used only within their designated agent boundary.
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <p className="text-xs text-muted-foreground">
          Last updated: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "—"}
        </p>
        <Button onClick={handleSave} disabled={update.isPending} className="gap-2">
          {update.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Zap className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
