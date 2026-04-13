import { Link, useLocation } from "wouter";
import { useLogoutUser, useGetCurrentUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Activity, History, ShieldAlert, FileText, LineChart, GraduationCap, Users, Settings, LogOut } from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const logout = useLogoutUser();
  const { data: user } = useGetCurrentUser();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Signals", href: "/signals", icon: Activity },
    { name: "Trades", href: "/trades", icon: History },
    { name: "Risk", href: "/risk", icon: ShieldAlert },
    { name: "Logs", href: "/logs", icon: FileText },
    { name: "Market", href: "/market", icon: LineChart },
    { name: "Education", href: "/education", icon: GraduationCap },
    { name: "Partners", href: "/partners", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background">
      <div className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">NexusCore</h1>
          <p className="text-xs text-muted-foreground mt-1">Algorithmic Trading</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4">
            <p className="text-sm font-medium">{user?.name || 'Trader'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}