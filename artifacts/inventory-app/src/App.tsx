import React from "react";
import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ProductsList from "@/pages/products/index";
import ProductNew from "@/pages/products/new";
import ProductEdit from "@/pages/products/edit";
import Scanner from "@/pages/scanner";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) setLocation("/sign-in");
  }, [isLoaded, isSignedIn, setLocation]);

  if (!isLoaded || !isSignedIn) return null;
  return <Layout><Component /></Layout>;
}

function HomeRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (isSignedIn) return <Layout><Dashboard /></Layout>;
  return <Landing />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/products">{() => <ProtectedRoute component={ProductsList} />}</Route>
      <Route path="/products/new">{() => <ProtectedRoute component={ProductNew} />}</Route>
      <Route path="/products/:id/edit">{() => <ProtectedRoute component={ProductEdit} />}</Route>
      <Route path="/scanner">{() => <ProtectedRoute component={Scanner} />}</Route>
      <Route>{() => <Layout><NotFound /></Layout>}</Route>
    </Switch>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppRoutes />
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
