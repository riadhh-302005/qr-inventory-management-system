import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, ShieldCheck, Zap, BarChart3, ScanLine } from "lucide-react";

export default function Landing() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="py-6 px-8 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Inventory<span className="text-primary">Pro</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="font-medium">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="font-medium shadow-sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-8 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Warehouse Management System v2.0 is live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Inventory control,<br /> <span className="text-primary">built for speed.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            A practical, dense, and efficient tool for tracking products in your warehouse or store. No bloat, just the features you need to get the job done.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-12 px-8 text-base shadow-md">
                Start tracking now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-20 px-8 bg-secondary/30 border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm mb-6 text-primary">
                  <ScanLine className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">QR Scanner</h3>
                <p className="text-muted-foreground">Instantly scan products using your device's camera to view details, update stock, or verify inventory.</p>
              </div>
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm mb-6 text-primary">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time Dashboard</h3>
                <p className="text-muted-foreground">Monitor low stock alerts, category breakdowns, and total inventory value at a glance.</p>
              </div>
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center border border-border shadow-sm mb-6 text-primary">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dense Interface</h3>
                <p className="text-muted-foreground">Designed for power users. Information-dense tables, keyboard-friendly forms, and zero wasted space.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-8 border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">Inventory<span className="text-primary">Pro</span></span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} InventoryPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
