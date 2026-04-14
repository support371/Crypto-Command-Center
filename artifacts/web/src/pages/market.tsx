import { useGetMarketOverview, useGetMarketNews } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, ExternalLink, Newspaper } from "lucide-react";

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 60 ? "#22c55e" : value >= 40 ? "#f59e0b" : "#ef4444";
  const rotation = (value / 100) * 180 - 90;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc segments */}
          <path d="M5,50 A45,45 0 0,1 50,5" stroke="#ef4444" strokeWidth="8" fill="none" />
          <path d="M50,5 A45,45 0 0,1 95,50" stroke="#22c55e" strokeWidth="8" fill="none" />
          {/* Needle */}
          <line
            x1="50" y1="50"
            x2={50 + 38 * Math.cos((rotation - 90) * Math.PI / 180)}
            y2={50 + 38 * Math.sin((rotation - 90) * Math.PI / 180)}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
      </div>
      <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
      <p className="text-sm font-medium" style={{ color }}>{label}</p>
    </div>
  );
}

export default function Market() {
  const { data: market, isLoading: loadingMarket } = useGetMarketOverview();
  const { data: news, isLoading: loadingNews } = useGetMarketNews({ limit: 8 });

  if (loadingMarket) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Data</h1>
        <p className="text-sm text-muted-foreground">
          Price feeds and market context via Yahoo Finance · Data layer only, not a trading signal source
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <FearGreedGauge value={market?.fearGreedIndex || 50} label={market?.fearGreedLabel || "Neutral"} />
            <p className="text-xs text-muted-foreground mt-2">Fear & Greed Index</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
            <p className="text-xl font-bold">${(market?.totalMarketCap / 1e12).toFixed(2)}T</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
            <p className="text-xl font-bold">{market?.btcDominance}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Assets Tracked</p>
            <p className="text-xl font-bold">{market?.assets?.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">via Yahoo Finance</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Grid */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Price Overview</CardTitle>
            <Badge variant="outline" className="text-[10px]">Yahoo Finance · Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2.5 font-medium">Asset</th>
                  <th className="pb-2.5 font-medium text-right">Price</th>
                  <th className="pb-2.5 font-medium text-right">24h Change</th>
                  <th className="pb-2.5 font-medium text-right hidden sm:table-cell">High 24h</th>
                  <th className="pb-2.5 font-medium text-right hidden sm:table-cell">Low 24h</th>
                  <th className="pb-2.5 font-medium text-right hidden md:table-cell">Volume 24h</th>
                  <th className="pb-2.5 font-medium text-right hidden md:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {market?.assets?.map((asset: any) => (
                  <tr key={asset.symbol} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {asset.symbol.split("-")[0].slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{asset.symbol.split("-")[0]}</p>
                          <p className="text-[10px] text-muted-foreground">{asset.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-medium">
                      ${asset.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right">
                      <div className={`flex items-center justify-end gap-1 font-medium ${asset.changePct24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.changePct24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {asset.changePct24h >= 0 ? "+" : ""}{asset.changePct24h?.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-3 text-right text-muted-foreground hidden sm:table-cell font-mono text-xs">
                      ${asset.high24h?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-muted-foreground hidden sm:table-cell font-mono text-xs">
                      ${asset.low24h?.toLocaleString()}
                    </td>
                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell text-xs">
                      ${(asset.volume24h / 1e9).toFixed(1)}B
                    </td>
                    <td className="py-3 text-right text-muted-foreground hidden md:table-cell text-xs">
                      ${(asset.marketCap / 1e9).toFixed(0)}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* News */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Market News
              </CardTitle>
              <CardDescription className="text-xs">Sourced via Yahoo Finance · Informational only</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingNews ? (
            <div className="flex h-24 items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-3">
              {news?.map((item: any) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/20 transition-colors">
                  <div className={`w-1 rounded-full shrink-0 ${item.sentiment === "positive" ? "bg-green-500" : item.sentiment === "negative" ? "bg-red-500" : "bg-muted"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span>{new Date(item.publishedAt).toLocaleString()}</span>
                      <span>·</span>
                      <div className="flex gap-1">
                        {item.relatedAssets?.map((a: string) => (
                          <span key={a} className="bg-muted px-1.5 py-0.5 rounded font-mono">{a.split("-")[0]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
