import { useGetTrades, useGetTradesSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function Trades() {
  const { data: trades, isLoading: loadingTrades } = useGetTrades();
  const { data: summary, isLoading: loadingSummary } = useGetTradesSummary();

  if (loadingTrades || loadingSummary) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Trade Execution History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Trades</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary?.totalTrades}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary?.winRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total PnL</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.totalPnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${summary?.totalPnl?.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Best Trade</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-500">${summary?.bestTrade?.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Exchange</th>
                  <th className="pb-3">Side</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">PnL</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trades?.map((trade: any) => (
                  <tr key={trade.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-2 text-muted-foreground">{new Date(trade.createdAt).toLocaleString()}</td>
                    <td className="py-3 font-medium">{trade.symbol}</td>
                    <td className="py-3 uppercase text-xs">{trade.exchange}</td>
                    <td className={`py-3 font-medium ${trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.side.toUpperCase()}
                    </td>
                    <td className="py-3 font-mono">{trade.size}</td>
                    <td className="py-3 font-mono">${trade.price?.toLocaleString()}</td>
                    <td className={`py-3 font-mono font-medium ${!trade.pnl ? '' : trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl ? `$${trade.pnl}` : '-'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs bg-muted`}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Trades;