"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  MessageSquare,
  FileSearch,
  LogOut,
  Loader2,
} from "lucide-react";
import Logo from "@/components/Logo";

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
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl lg:block noise-texture">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-[var(--border-default)] px-6">
            <Logo size="md" />
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 w-[3px] h-6 bg-[var(--accent)] rounded-r-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavBg"
                        className="absolute inset-0 bg-[var(--accent-subtle)] rounded-lg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User */}
          <div className="border-t border-[var(--border-default)] p-4">
            <div className="mb-3 flex items-center gap-3">
              <motion.div
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute -inset-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-sm font-bold text-[var(--text-inverse)]">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </motion.div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] btn-outline hover:text-[var(--text-primary)] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl px-4 lg:hidden">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <motion.div
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute -inset-[2px] bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-xs font-bold text-[var(--text-inverse)]">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-1 py-3 text-xs"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavPill"
                  className="absolute inset-x-2 inset-y-1 bg-[var(--accent-subtle)] rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                <item.icon className="h-4 w-4 mx-auto mb-0.5" />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </span>
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
