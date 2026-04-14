import { useState } from "react";
import { useGetLogs, useGetReconciliationReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, FileText, RefreshCw } from "lucide-react";

const LEVELS = ["all", "info", "warn", "error"] as const;
const CATEGORIES = ["all", "auth", "risk", "trade", "system", "guardian", "killswitch"] as const;

type Level = typeof LEVELS[number];
type Category = typeof CATEGORIES[number];

function LevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    error: "bg-red-500/10 text-red-500 border-red-500/20",
    warn: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[level] || "bg-muted text-muted-foreground border-border"}`}>
      {level}
    </span>
  );
}

export default function Logs() {
  const [level, setLevel] = useState<Level>("all");
  const [category, setCategory] = useState<Category>("all");

  const { data: logs, isLoading, refetch, isFetching } = useGetLogs({
    level: level === "all" ? undefined : level,
    category: category === "all" ? undefined : category,
    limit: 100,
  });
  const { data: reconciliation, isLoading: loadingRecon } = useGetReconciliationReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit & Verification</h1>
          <p className="text-sm text-muted-foreground">Immutable audit trail and exchange reconciliation · Verification Agent</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      {/* Reconciliation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Exchange Reconciliation</CardTitle>
              <CardDescription className="text-xs">Local trade records vs exchange trade records</CardDescription>
            </div>
            {!loadingRecon && (
              <Badge className={`${reconciliation?.status === "clean" ? "bg-green-500/10 text-green-500 border-green-500/30" : "bg-red-500/10 text-red-500 border-red-500/30"}`}>
                {reconciliation?.status?.toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingRecon ? (
            <div className="flex items-center justify-center h-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reconciliation?.exchanges?.map((ex: any) => (
                <div key={ex.exchange} className="p-3 rounded-lg border border-border bg-muted/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${ex.discrepancies === 0 ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm font-bold uppercase">{ex.exchange}</span>
                    </div>
                    {ex.discrepancies === 0
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-0.5">Local</p>
                      <p className="font-mono font-medium">{ex.localTrades}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">Exchange</p>
                      <p className="font-mono font-medium">{ex.exchangeTrades}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-0.5">Discrepancies</p>
                      <p className={`font-mono font-bold ${ex.discrepancies > 0 ? "text-red-500" : "text-green-500"}`}>{ex.discrepancies}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Last synced: {new Date(ex.lastSynced).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">Level:</span>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${level === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">Category:</span>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {logs?.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2.5 hover:bg-muted/20 px-1 rounded transition-colors">
                  <LevelBadge level={log.level} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{log.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className="capitalize">{log.category}</span>
                      <span>·</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.metadata && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-[10px] truncate max-w-40">{JSON.stringify(log.metadata)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {log.level === "error" && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                  {log.level === "warn" && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />}
                </div>
              ))}
              {(!logs || logs.length === 0) && (
                <div className="text-center py-12 text-sm text-muted-foreground">No log entries match the current filters</div>
              )}
            </div>
          )}
          {logs && logs.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">{logs.length} entries shown</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
