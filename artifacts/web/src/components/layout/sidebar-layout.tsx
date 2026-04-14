import { Link, useLocation } from "wouter";
import { useLogoutUser, useGetCurrentUser, useGetDashboardSummary, useGetKillSwitchStatus } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Activity, History, ShieldAlert, FileText,
  LineChart, GraduationCap, Users, Settings, LogOut,
  Zap, ShieldCheck, AlertTriangle, Radio
} from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logout = useLogoutUser();
  const { data: user } = useGetCurrentUser();
  const { data: summary } = useGetDashboardSummary();
  const { data: ks } = useGetKillSwitchStatus();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  };

  const guardianStatus = summary?.guardianStatus ?? "healthy";
  const killSwitchActive = ks?.active ?? summary?.killSwitchActive ?? false;

  const navGroups = [
    {
      label: "Command Center",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Signals", href: "/signals", icon: Activity },
        { name: "Trades", href: "/trades", icon: History },
      ]
    },
    {
      label: "Risk & Guardian",
      items: [
        { name: "Risk Monitor", href: "/risk", icon: ShieldAlert },
        { name: "Audit Logs", href: "/logs", icon: FileText },
      ]
    },
    {
      label: "Data & Insights",
      items: [
        { name: "Market Data", href: "/market", icon: LineChart },
        { name: "Education", href: "/education", icon: GraduationCap },
      ]
    },
    {
      label: "Platform",
      items: [
        { name: "Partners", href: "/partners", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    },
  ];

  const GuardianIcon = guardianStatus === "healthy" ? ShieldCheck : guardianStatus === "warning" ? AlertTriangle : ShieldAlert;
  const guardianColor = guardianStatus === "healthy" ? "text-green-500" : guardianStatus === "warning" ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex h-screen bg-background">
      <div className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none">NexusCore</div>
              <div className="text-[10px] text-muted-foreground leading-none mt-0.5">Execution Terminal</div>
            </div>
          </div>

          {/* System status strip */}
          <div className="flex items-center justify-between text-[10px] bg-muted/40 rounded px-2 py-1.5">
            <div className={`flex items-center gap-1 font-medium ${guardianColor}`}>
              <GuardianIcon className="w-3 h-3" />
              <span>Guardian: {guardianStatus.toUpperCase()}</span>
            </div>
            {killSwitchActive && (
              <div className="flex items-center gap-1 text-destructive font-bold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>HALTED</span>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold px-2 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || location.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-sm ${isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Exchange quick-status */}
        <div className="px-3 py-2 border-t border-border">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1.5">Exchanges</p>
          <div className="space-y-1">
            {[
              { name: "BTCC", priority: "Primary" },
              { name: "Bitget", priority: "Secondary" },
            ].map(ex => (
              <div key={ex.name} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium">{ex.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{ex.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User / logout */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {(user?.name || "T")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || "Trader"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground text-xs h-8" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-background p-6">
        {children}
      </main>
    </div>
  );
}
