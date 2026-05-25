import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function SignIn() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-sidebar border-r border-sidebar-border items-center justify-center flex-col p-12 text-sidebar-foreground">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <img src={`${basePath}/logo.svg`} alt="Logo" className="w-8 h-8 brightness-0 invert" />
            </div>
            <span className="text-3xl font-bold tracking-tight">
              Inventory<span className="text-primary">Pro</span>
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Warehouse control, simplified.</h1>
          <p className="text-lg text-sidebar-foreground/70 mb-12">
            Track products, monitor stock levels, and manage your inventory with our fast,
            dense, and efficient tool.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">QR Scanning</h3>
              <p className="text-sm text-sidebar-foreground/60">Instantly look up products from any device</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center mb-2">
                <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="font-semibold">Live Tracking</h3>
              <p className="text-sm text-sidebar-foreground/60">Real-time alerts for low stock items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Inventory<span className="text-primary">Pro</span></span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to access your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign in
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
