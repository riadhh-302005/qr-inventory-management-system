import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Package, LayoutDashboard, QrCode, LogOut, Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Scanner", href: "/scanner", icon: QrCode },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Package className="h-6 w-6 text-primary" />
          <span>Inventory<span className="text-primary">Pro</span></span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-sidebar-foreground hover:bg-sidebar-accent">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] z-50 bg-sidebar border-t border-sidebar-border text-sidebar-foreground p-4">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
            <div className="my-4 border-t border-sidebar-border" />
            <Button variant="ghost" className="justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground h-[100dvh] sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Inventory<span className="text-primary">Pro</span></span>
        </div>

        <div className="px-4 pb-4">
          <Link href="/products/new">
            <Button className="w-full justify-start shadow-sm" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-9 w-9 border border-sidebar-border">
                <AvatarFallback className="bg-primary/20 text-primary">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{user?.name || user?.email}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-[100dvh]">
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
