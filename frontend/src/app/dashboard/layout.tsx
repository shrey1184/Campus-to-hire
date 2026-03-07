"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
import { ThemeToggle, AccentPicker } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    labelKey: "nav.dashboard",
    mobileLabelKey: "nav.dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/roadmap",
    labelKey: "nav.roadmap",
    mobileLabelKey: "nav.roadmap",
    icon: Map,
  },
  {
    href: "/dashboard/today",
    labelKey: "nav.today",
    mobileLabelKey: "nav.mobileToday",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/interview",
    labelKey: "nav.interview",
    mobileLabelKey: "nav.mobileInterview",
    icon: MessageSquare,
  },
  {
    href: "/dashboard/jd-analyze",
    labelKey: "nav.jd",
    mobileLabelKey: "nav.mobileJd",
    icon: FileSearch,
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { t } = useLanguage();
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
            {loading ? t("common.loadingWorkspace") : t("common.redirectingOnboarding")}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background page-base">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 shrink-0 overflow-hidden overscroll-none border-r border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl lg:flex lg:flex-col noise-texture">
        <div className="flex h-full flex-col overflow-hidden">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b border-[var(--border-default)] px-6">
            <Logo size="md" />
          </div>

          {/* Nav */}
          <nav className="shrink-0 space-y-1 px-3 py-4">
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
                      {t(item.labelKey)}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Spacer pushes footer to bottom */}
          <div className="flex-1" />

          {/* User */}
          <div className="border-t border-[var(--border-default)] p-4">            {/* Accent colour dots */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Accent</span>
              <AccentPicker />
            </div>

            {/* Language + Theme toggle on same row */}            <div className="mb-3 flex items-center gap-2">
              <div className="flex-1">
                <LanguageSwitcher />
              </div>
              <ThemeToggle compact />
            </div>
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
              {t("common.signOut")}
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
          <AccentPicker />
          <ThemeToggle compact />
          <LanguageSwitcher compact />
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
                <span className="truncate">{t(item.mobileLabelKey)}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 pb-16 lg:pl-64 lg:pt-0 lg:pb-0">
        <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-6 lg:py-8 xl:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
