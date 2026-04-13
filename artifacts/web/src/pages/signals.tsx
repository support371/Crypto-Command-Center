import { useGetSignals, useGetPredictions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function Signals() {
  const { data: signals, isLoading: loadingSignals } = useGetSignals();
  const { data: predictions, isLoading: loadingPredictions } = useGetPredictions();

  if (loadingSignals || loadingPredictions) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === 'long' || direction === 'up') return <TrendingUp className="text-green-500 w-4 h-4 mr-1" />;
    if (direction === 'short' || direction === 'down') return <TrendingDown className="text-red-500 w-4 h-4 mr-1" />;
    return <Minus className="text-yellow-500 w-4 h-4 mr-1" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Signals & Intelligence</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Trading Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals?.map(signal => (
                <div key={signal.id} className="border border-border p-4 rounded-lg bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{signal.symbol}</span>
                      <Badge variant="outline" className="uppercase text-xs">{signal.status}</Badge>
                    </div>
                    <div className="flex items-center text-sm font-medium">
                      {getDirectionIcon(signal.direction)}
                      <span className="uppercase">{signal.direction}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs mb-1">Target</span>
                      <span className="font-mono">${signal.targetPrice?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-1">Stop Loss</span>
                      <span className="font-mono">${signal.stopLoss?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-1">Strength</span>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${signal.strength}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{signal.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Learning Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions?.map(pred => (
                <div key={pred.id} className="border border-border p-4 rounded-lg bg-card flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{pred.symbol}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{pred.model}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      {getDirectionIcon(pred.direction)}
                      <span className="text-sm font-medium capitalize">{pred.direction} ({pred.horizon})</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground mr-2">Confidence:</span>
                      <span className="font-bold">{pred.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{pred.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Signals;