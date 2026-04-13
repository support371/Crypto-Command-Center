import { useGetRiskState, useGetRiskSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

export function Risk() {
  const { data: state, isLoading: loadingState } = useGetRiskState();
  const { data: settings, isLoading: loadingSettings } = useGetRiskSettings();

  if (loadingState || loadingSettings) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const exposurePct = Math.min(100, ((state?.currentExposure || 0) / (state?.exposureLimit || 1)) * 100);
  const dailyLossPct = Math.min(100, ((state?.dailyLoss || 0) / (state?.dailyLossLimit || 1)) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Guardian Risk Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {state?.guardianStatus === 'healthy' ? <ShieldCheck className="text-green-500" /> : 
               state?.guardianStatus === 'warning' ? <AlertTriangle className="text-yellow-500" /> : 
               <ShieldAlert className="text-red-500" />}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold uppercase tracking-wider
              ${state?.guardianStatus === 'healthy' ? 'text-green-500' : 
                state?.guardianStatus === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
              {state?.guardianStatus}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last check: {new Date(state?.lastChecked || '').toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Exposure Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Current Exposure</span>
                <span className="font-mono">${state?.currentExposure?.toLocaleString()} / ${state?.exposureLimit?.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${exposurePct > 80 ? 'bg-red-500' : exposurePct > 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                  style={{ width: `${exposurePct}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Daily Loss</span>
                <span className="font-mono">${state?.dailyLoss?.toLocaleString()} / ${state?.dailyLossLimit?.toLocaleString()}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${dailyLossPct > 80 ? 'bg-red-500' : dailyLossPct > 50 ? 'bg-yellow-500' : 'bg-primary'}`}
                  style={{ width: `${dailyLossPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Risk Events</CardTitle>
          <CardDescription>Automated interventions by the Guardian system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state?.breaches?.map((breach: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded bg-muted/30 border border-border">
                {breach.severity === 'critical' ? <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />}
                <div>
                  <div className="font-medium text-sm">{breach.message}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                    <span className="uppercase">{breach.type}</span>
                    <span>•</span>
                    <span>{new Date(breach.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!state?.breaches || state.breaches.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent risk breaches.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Risk;