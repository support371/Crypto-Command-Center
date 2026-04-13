import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Signals from "@/pages/signals";
import Trades from "@/pages/trades";
import Risk from "@/pages/risk";
import Logs from "@/pages/logs";
import Market from "@/pages/market";
import Education from "@/pages/education";
import Partners from "@/pages/partners";
import Settings from "@/pages/settings";
import SidebarLayout from "@/components/layout/sidebar-layout";
import { useGetCurrentUser } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { data: user, isLoading, error } = useGetCurrentUser();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error || !user) {
    return <Redirect to="/login" />;
  }

  if (!user.onboardingComplete && window.location.pathname !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  return (
    <SidebarLayout>
      <Component {...rest} />
    </SidebarLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/onboarding">
        {() => <Onboarding />}
      </Route>
      <Route path="/signals">
        {() => <ProtectedRoute component={Signals} />}
      </Route>
      <Route path="/trades">
        {() => <ProtectedRoute component={Trades} />}
      </Route>
      <Route path="/risk">
        {() => <ProtectedRoute component={Risk} />}
      </Route>
      <Route path="/logs">
        {() => <ProtectedRoute component={Logs} />}
      </Route>
      <Route path="/market">
        {() => <ProtectedRoute component={Market} />}
      </Route>
      <Route path="/education">
        {() => <ProtectedRoute component={Education} />}
      </Route>
      <Route path="/partners">
        {() => <ProtectedRoute component={Partners} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
