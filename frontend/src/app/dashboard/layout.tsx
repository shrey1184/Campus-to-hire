"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  MessageSquare,
  FileSearch,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: Map },
  { href: "/dashboard/today", label: "Today's Plan", icon: CalendarCheck },
  { href: "/dashboard/interview", label: "Mock Interview", icon: MessageSquare },
  { href: "/dashboard/jd-analyze", label: "JD Analysis", icon: FileSearch },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const shouldRedirectToOnboarding = Boolean(
    user && !user.onboarding_completed && pathname !== "/onboarding"
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && shouldRedirectToOnboarding) {
      router.replace("/onboarding");
    }
  }, [loading, shouldRedirectToOnboarding, router]);

  if (loading || shouldRedirectToOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center card-glass pulse-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary spinner-glow" />
          <p className="mt-3 text-micro text-muted-foreground">
            {loading ? "Initializing workspace..." : "Redirecting to onboarding..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background page-base">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/40 bg-card lg:block card-glass">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border/40 px-6">
            <Logo size="md" />
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium nav-link ${
                    isActive
                      ? "nav-active text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-border/40 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground btn-outline"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-card px-4 lg:hidden card-glass">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className="rounded-full bg-primary/10 p-2 text-primary">
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/40 bg-card lg:hidden card-glass">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 pt-14 pb-16 lg:ml-64 lg:pt-0 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
