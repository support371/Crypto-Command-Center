import { useState } from "react";
import { useSubmitOnboarding } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [riskMode, setRiskMode] = useState<"conservative" | "moderate" | "aggressive">("moderate");
  const [maxExposure, setMaxExposure] = useState("10000");
  const [maxDailyLoss, setMaxDailyLoss] = useState("500");
  const [autoTrade, setAutoTrade] = useState(false);
  const [exchange, setExchange] = useState<"btcc" | "bitget" | "both">("both");
  
  const submit = useSubmitOnboarding();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = () => {
    submit.mutate({
      data: {
        step: 5,
        riskMode,
        maxExposure: Number(maxExposure),
        maxDailyLoss: Number(maxDailyLoss),
        autoTrade,
        exchange
      }
    }, {
      onSuccess: () => {
        toast({ title: "Setup Complete", description: "Welcome to NexusCore." });
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Setup Failed", description: err.error || "An error occurred", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader>
          <CardTitle>System Initialization - Step {step} of 5</CardTitle>
          <CardDescription>
            {step === 1 && "Welcome to NexusCore Engine."}
            {step === 2 && "Select your risk tolerance profile."}
            {step === 3 && "Configure maximum exposure limits."}
            {step === 4 && "Connect execution venues."}
            {step === 5 && "Review and engage."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                NexusCore is an advanced algorithmic trading engine designed for professional execution. 
                Our system continuously analyzes market data, generates predictive signals, and executes 
                trades across connected venues (BTCC & Bitget) based on your strict risk parameters.
              </p>
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-md">
                <h4 className="font-semibold text-primary mb-2">Engine Architecture:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Real-time market data ingestion (Yahoo Finance)</li>
                  <li>Signal generation & prediction modeling</li>
                  <li>Automated order routing & execution</li>
                  <li>Continuous Guardian risk monitoring</li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <RadioGroup value={riskMode} onValueChange={(v: any) => setRiskMode(v)} className="space-y-3">
              <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-green-500">Conservative</div>
                  <div className="text-xs text-muted-foreground">Focus on capital preservation. Tighter stop-losses.</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-yellow-500">Moderate</div>
                  <div className="text-xs text-muted-foreground">Balanced risk/reward ratio. Standard execution.</div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-red-500">Aggressive</div>
                  <div className="text-xs text-muted-foreground">High volatility tolerance. Maximum capital deployment.</div>
                </Label>
              </div>
            </RadioGroup>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Maximum Exposure (USD)</Label>
                <Input type="number" value={maxExposure} onChange={e => setMaxExposure(e.target.value)} className="bg-background font-mono" />
                <p className="text-xs text-muted-foreground">Total capital allowed in active trades simultaneously.</p>
              </div>
              <div className="space-y-2">
                <Label>Maximum Daily Loss (USD)</Label>
                <Input type="number" value={maxDailyLoss} onChange={e => setMaxDailyLoss(e.target.value)} className="bg-background font-mono" />
                <p className="text-xs text-muted-foreground">Guardian system will halt trading if this loss is breached.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border border-border p-4 rounded-md">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Auto-Trading</Label>
                  <p className="text-xs text-muted-foreground">Allow engine to execute trades automatically based on signals.</p>
                </div>
                <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
              </div>
              
              <div className="space-y-3">
                <Label>Preferred Exchange Venues</Label>
                <RadioGroup value={exchange} onValueChange={(v: any) => setExchange(v)} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="btcc" id="btcc" />
                    <Label htmlFor="btcc" className="cursor-pointer font-medium">BTCC Only</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="bitget" id="bitget" />
                    <Label htmlFor="bitget" className="cursor-pointer font-medium">Bitget Only</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer font-medium text-primary">Both (Smart Routing)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border border-border p-3 rounded bg-muted/50">
                  <span className="text-muted-foreground block mb-1">Risk Mode</span>
                  <span className="font-semibold uppercase">{riskMode}</span>
                </div>
                <div className="border border-border p-3 rounded bg-muted/50">
                  <span className="text-muted-foreground block mb-1">Max Exposure</span>
                  <span className="font-mono font-semibold">${maxExposure}</span>
                </div>
                <div className="border border-border p-3 rounded bg-muted/50">
                  <span className="text-muted-foreground block mb-1">Max Daily Loss</span>
                  <span className="font-mono font-semibold">${maxDailyLoss}</span>
                </div>
                <div className="border border-border p-3 rounded bg-muted/50">
                  <span className="text-muted-foreground block mb-1">Auto Trade</span>
                  <span className="font-semibold uppercase">{autoTrade ? 'Active' : 'Disabled'}</span>
                </div>
                <div className="border border-border p-3 rounded bg-muted/50 col-span-2">
                  <span className="text-muted-foreground block mb-1">Routing Preference</span>
                  <span className="font-semibold uppercase">{exchange}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                By clicking Engage, you authorize NexusCore to monitor and optionally execute trades 
                according to these parameters. Ensure you understand the risks of algorithmic trading.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1 || submit.isPending}>Back</Button>
          {step < 5 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submit.isPending}>
              {submit.isPending ? "Engaging..." : "ENGAGE SYSTEM"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}