"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BlurFade } from "@/components/magic/BlurFade";
import { NumberTicker } from "@/components/magic/NumberTicker";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { dashboardApi, dailyPlanApi, profileApi, roadmapApi } from "@/lib/api";
import type {
  CompleteDashboardStats,
  DailyPlan,
  DashboardStats,
  Roadmap,
  UserProgressStats,
} from "@/types";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileSearch,
  Flame,
  Map,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

type StepCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
  statusLabel: string;
  icon: typeof Target;
  status: "ready" | "attention" | "locked";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [progress, setProgress] = useState<UserProgressStats | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [completeStats, setCompleteStats] = useState<CompleteDashboardStats | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [todayPlan, setTodayPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [progressData, statsData, completeStatsData, roadmapData] = await Promise.all([
          profileApi.getProgress().catch(() => null),
          profileApi.getStats().catch(() => null),
          dashboardApi.getCompleteStats().catch(() => null),
          roadmapApi.getActive().catch(() => null),
        ]);

        setProgress(progressData);
        setStats(statsData);
        setCompleteStats(completeStatsData);
        setRoadmap(roadmapData);
        setWarning(
          !progressData && !statsData && !completeStatsData && !roadmapData
            ? t("dashboard.warning.partial")
            : "",
        );

        if (roadmapData) {
          const planData = await dailyPlanApi.getToday().catch(() => null);
          setTodayPlan(planData);
        }
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [t]);

  const targetRole = user?.target_role?.replace(/_/g, " ") || "software engineer";
  const firstName = user?.name?.split(" ")[0] || "Student";
  const completedTasks = todayPlan?.tasks.filter((task) => task.completed).length ?? 0;
  const totalTasks = todayPlan?.tasks.length ?? 0;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const xpStats = useMemo(() => {
    const totalXP =
      completeStats?.total_xp ??
      (progress?.completed_tasks ?? 0) * 10 + (progress?.total_interviews ?? 0) * 25;
    const xpForNextLevel = completeStats?.xp_for_next_level ?? 100;
    const xpInCurrentLevel = completeStats?.xp_in_current_level ?? totalXP % xpForNextLevel;
    const currentLevel = completeStats?.current_level ?? Math.floor(totalXP / xpForNextLevel) + 1;

    return { totalXP, xpForNextLevel, xpInCurrentLevel, currentLevel };
  }, [completeStats, progress]);

  const weeklyStats = completeStats?.weekly_stats ?? {
    problems_solved: 0,
    study_hours: 0,
    xp_gained: 0,
    tasks_completed: 0,
  };

  const performanceLabels =
    completeStats?.performance_trend.labels ??
    stats?.weekly_progress.labels ??
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const performanceValues =
    completeStats?.performance_trend.values ??
    stats?.weekly_progress.tasks_completed ??
    [0, 0, 0, 0, 0, 0, 0];
  const performanceChange =
    completeStats?.performance_trend.change_percentage ??
    calculateTrendChange(performanceValues);

  const activityData =
    completeStats?.activity_heatmap?.map((entry) => ({
      ...entry,
      dateLabel: new Date(entry.date).toLocaleDateString(),
    })) ?? buildFallbackActivity();

  const activeDays = activityData.filter((entry) => entry.count > 0).length;
  const roadmapWeeks = roadmap?.content.weeks.length ?? roadmap?.total_weeks ?? 0;
  const remainingWeeks = roadmap
    ? Math.max(roadmap.total_weeks - roadmap.current_week + 1, 0)
    : 0;

  const nextSteps: StepCard[] = roadmap
    ? [
        {
          title: t("dashboard.steps.executeTitle"),
          description:
            totalTasks > 0
              ? t("dashboard.steps.executeDescriptionReady", {
                  completed: completedTasks,
                  total: totalTasks,
                })
              : t("dashboard.steps.executeDescriptionEmpty"),
          href: "/dashboard/today",
          cta: totalTasks > 0
            ? t("dashboard.steps.executeCtaReady")
            : t("dashboard.steps.executeCtaEmpty"),
          icon: CalendarCheck,
          statusLabel:
            totalTasks > 0 ? t("common.status.ready") : t("common.status.attention"),
          status: totalTasks > 0 ? "ready" : "attention",
        },
        {
          title: t("dashboard.steps.reviewTitle"),
          description: t("dashboard.steps.reviewDescription", {
            week: roadmap.current_week,
            remainingWeeks,
          }),
          href: "/dashboard/roadmap",
          cta: t("dashboard.steps.reviewCta"),
          icon: Map,
          statusLabel: t("common.status.ready"),
          status: "ready",
        },
        {
          title: t("dashboard.steps.jdTitle"),
          description: t("dashboard.steps.jdDescription"),
          href: "/dashboard/jd-analyze",
          cta: t("dashboard.steps.jdCta"),
          icon: FileSearch,
          statusLabel: t("common.status.ready"),
          status: "ready",
        },
      ]
    : [
        {
          title: t("dashboard.steps.generateTitle"),
          description: t("dashboard.steps.generateDescription"),
          href: "/dashboard/roadmap",
          cta: t("dashboard.steps.generateCta"),
          icon: Map,
          statusLabel: t("common.status.attention"),
          status: "attention",
        },
        {
          title: t("dashboard.steps.defineTitle"),
          description: t("dashboard.steps.defineDescription"),
          href: "/dashboard/today",
          cta: t("dashboard.steps.defineCta"),
          icon: CalendarCheck,
          statusLabel: t("common.status.locked"),
          status: "locked",
        },
        {
          title: t("dashboard.steps.validateTitle"),
          description: t("dashboard.steps.validateDescription"),
          href: "/dashboard/jd-analyze",
          cta: t("dashboard.steps.validateCta"),
          icon: FileSearch,
          statusLabel: t("common.status.ready"),
          status: "ready",
        },
      ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {warning ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {warning}
        </div>
      ) : null}

      <BlurFade delay={0.05}>
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_30%),linear-gradient(135deg,#101010,#080808)] p-6 sm:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(201,168,76,0.08),transparent)] lg:block" />
          <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                {t("dashboard.hero.badge")}
              </div>

              <div className="space-y-3">
                <h1 className="heading-xl max-w-3xl">
                  {t("dashboard.hero.title", { name: firstName, role: targetRole })}
                </h1>
                <p className="body-text max-w-2xl text-[var(--text-secondary)]">
                  {t("dashboard.hero.description")}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={roadmap ? "/dashboard/today" : "/dashboard/roadmap"}
                  className="btn-accent inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  {roadmap ? t("dashboard.hero.continue") : t("dashboard.hero.generate")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/jd-analyze"
                  className="btn-outline inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  <FileSearch className="h-4 w-4" />
                  {t("dashboard.hero.analyzeJd")}
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatPanel
                  label={t("dashboard.stats.currentLevel")}
                  value={xpStats.currentLevel}
                  helper={t("dashboard.stats.xpToNext", {
                    xp: xpStats.xpForNextLevel - xpStats.xpInCurrentLevel,
                  })}
                  icon={Award}
                />
                <StatPanel
                  label={t("dashboard.stats.streak")}
                  value={completeStats?.streak_days ?? stats?.streak_days ?? 0}
                  helper={t("dashboard.stats.dayBest", {
                    days:
                      completeStats?.personal_best_streak ??
                      Math.max(stats?.streak_days ?? 0, 0),
                  })}
                  icon={Flame}
                />
                <StatPanel
                  label={t("dashboard.stats.readiness")}
                  value={progress?.completion_rate ?? 0}
                  suffix="%"
                  helper={
                    roadmap
                      ? t("dashboard.stats.weekProgress", {
                          week: roadmap.current_week,
                          total: roadmapWeeks,
                        })
                      : t("dashboard.stats.noRoadmap")
                  }
                  icon={Target}
                />
              </div>
            </div>

            <div className="card-glass rounded-[24px] border-white/10 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {t("dashboard.xp.title")}
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">
                    <NumberTicker value={xpStats.totalXP} />
                  </p>
                </div>
                <div className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                  {t("dashboard.xp.level", { level: xpStats.currentLevel })}
                </div>
              </div>

              <div className="mb-5 h-3 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      (xpStats.xpInCurrentLevel / xpStats.xpForNextLevel) * 100,
                      100,
                    )}%`,
                  }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>

              <div className="grid gap-3">
                <MiniMetric
                  label={t("dashboard.metrics.todayCompletion")}
                  value={`${completionPct}%`}
                  icon={CalendarCheck}
                />
                <MiniMetric
                  label={t("dashboard.metrics.problemsSolved")}
                  value={String(completeStats?.problems_solved ?? progress?.completed_tasks ?? 0)}
                  icon={CheckCircle2}
                />
                <MiniMetric
                  label={t("dashboard.metrics.interviewAverage")}
                  value={`${
                    completeStats?.average_interview_score ??
                    progress?.average_interview_score ??
                    0
                  }/100`}
                  icon={MessageSquare}
                />
              </div>
            </div>
          </div>
        </section>
      </BlurFade>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <BlurFade delay={0.1}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {t("dashboard.steps.badge")}
                </p>
                <h2 className="heading-md mt-1">{t("dashboard.steps.title")}</h2>
              </div>
              <Brain className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <StepActionCard key={step.title} index={index + 1} step={step} />
              ))}
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.14}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {t("dashboard.week.badge")}
                </p>
                <h2 className="heading-md mt-1">{t("dashboard.week.title")}</h2>
              </div>
              <Clock3 className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCard
                label={t("dashboard.summary.tasksCompleted")}
                value={weeklyStats.tasks_completed}
              />
              <SummaryCard
                label={t("dashboard.summary.studyHours")}
                value={weeklyStats.study_hours}
              />
              <SummaryCard label={t("dashboard.summary.xpGained")} value={weeklyStats.xp_gained} />
              <SummaryCard
                label={t("dashboard.metrics.problemsSolved")}
                value={weeklyStats.problems_solved}
              />
            </div>
          </div>
        </BlurFade>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <BlurFade delay={0.18}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {t("dashboard.today.badge")}
                </p>
                <h2 className="heading-md mt-1">{t("dashboard.today.title")}</h2>
              </div>
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            </div>

            {todayPlan ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {t("dashboard.today.weekDay", { week: todayPlan.week, day: todayPlan.day })}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {todayPlan.focus_area ||
                          t("dashboard.today.focusFallback")}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                      {t("dashboard.today.done", {
                        completed: completedTasks,
                        total: totalTasks,
                      })}
                    </div>
                  </div>
                </div>

                {todayPlan.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 ${
                      task.completed
                        ? "border-[var(--accent)]/30 bg-[var(--accent-subtle)]"
                        : "border-white/8 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                          ) : (
                            <Target className="h-4 w-4 text-[var(--text-muted)]" />
                          )}
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? "text-[var(--text-secondary)] line-through"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                        {task.description ? (
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                      {task.duration_minutes ? (
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                          {task.duration_minutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}

                <Link
                  href="/dashboard/today"
                  className="link-glow inline-flex items-center gap-2 text-sm font-medium"
                >
                  {t("dashboard.today.openBoard")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={CalendarCheck}
                title={t("dashboard.today.emptyTitle")}
                description={t("dashboard.today.emptyDescription")}
                href="/dashboard/roadmap"
                cta={t("dashboard.today.emptyCta")}
              />
            )}
          </div>
        </BlurFade>

        <BlurFade delay={0.22}>
          <div className="space-y-4">
            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {t("dashboard.performance.badge")}
                  </p>
                  <h2 className="heading-md mt-1">{t("dashboard.performance.title")}</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <PerformanceChart
                labels={performanceLabels}
                values={performanceValues}
                changePercentage={performanceChange}
                outputLabel={t("dashboard.performance.output")}
                emptyLabel={t("dashboard.performance.empty")}
              />
            </div>

            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    {t("dashboard.consistency.badge")}
                  </p>
                  <h2 className="heading-md mt-1">{t("dashboard.consistency.title")}</h2>
                </div>
                <Flame className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <ActivityHeatmap
                activeDays={activeDays}
                data={activityData}
                emptyLabel={t("dashboard.performance.empty")}
                activeDaysLabel={t("dashboard.consistency.activeDays", { days: activeDays })}
                lessLabel={t("dashboard.consistency.less")}
                moreLabel={t("dashboard.consistency.more")}
                getTooltip={(entry) =>
                  t("dashboard.consistency.tooltip", {
                    date: entry.dateLabel,
                    count: entry.count,
                  })
                }
              />
            </div>
          </div>
        </BlurFade>
      </section>
    </motion.div>
  );
}

function StatPanel({
  label,
  value,
  helper,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: number;
  helper: string;
  suffix?: string;
  icon: typeof Target;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          {label}
        </p>
        <Icon className="h-4 w-4 text-[var(--accent)]" />
      </div>
      <p className="text-2xl font-semibold text-[var(--text-primary)]">
        <NumberTicker value={value} />
        {suffix}
      </p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{helper}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Target;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--accent-subtle)] p-2 text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function StepActionCard({ index, step }: { index: number; step: StepCard }) {
  const statusClasses = {
    ready: "border-white/8 bg-white/[0.02]",
    attention: "border-[var(--accent)]/25 bg-[var(--accent-subtle)]",
    locked: "border-white/6 bg-white/[0.01] opacity-70",
  } as const;

  const Icon = step.icon;

  return (
    <div className={`rounded-[22px] border p-4 sm:p-5 ${statusClasses[step.status]}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/30 text-sm font-semibold text-[var(--accent)]">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Icon className="mt-0.5 h-4 w-4 text-[var(--accent)]" />
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {step.description}
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {step.statusLabel}
            </span>
          </div>

          <Link
            href={step.href}
            className="link-glow mt-4 inline-flex items-center gap-2 text-sm font-medium"
          >
            {step.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function PerformanceChart({
  labels,
  values,
  changePercentage,
  outputLabel,
  emptyLabel,
}: {
  labels: string[];
  values: number[];
  changePercentage: number;
  outputLabel: string;
  emptyLabel: string;
}) {
  const maxValue = Math.max(...values, 1);
  const isEmpty = values.every((value) => value === 0);

  return (
    <div className="space-y-4">
      <div className="relative flex h-48 items-end gap-3">
        {values.map((value, index) => (
          <div key={`${labels[index]}-${index}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end">
              <motion.div
                className="w-full rounded-t-[16px] bg-gradient-to-t from-[var(--accent)] to-[#f2d78a]"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((value / maxValue) * 100, 8)}%` }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              />
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {labels[index] || `D${index + 1}`}
            </span>
          </div>
        ))}
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/35 px-4 text-center text-sm text-[var(--text-secondary)]">
            {emptyLabel}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{outputLabel}</span>
        <span className={changePercentage >= 0 ? "text-[var(--accent)]" : "text-[var(--destructive)]"}>
          {changePercentage >= 0 ? "+" : ""}
          {changePercentage}%
        </span>
      </div>
    </div>
  );
}

function ActivityHeatmap({
  data,
  activeDays,
  emptyLabel,
  activeDaysLabel,
  lessLabel,
  moreLabel,
  getTooltip,
}: {
  data: Array<{ date: string; count: number; level: number; dateLabel: string }>;
  activeDays: number;
  emptyLabel: string;
  activeDaysLabel: string;
  lessLabel: string;
  moreLabel: string;
  getTooltip: (entry: { date: string; count: number; level: number; dateLabel: string }) => string;
}) {
  const levelClass = [
    "bg-white/5",
    "bg-[var(--accent)]/25",
    "bg-[var(--accent)]/45",
    "bg-[var(--accent)]/70",
    "bg-[var(--accent)]",
  ];
  const isEmpty = activeDays === 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">{activeDaysLabel}</p>
      <div className="relative overflow-x-auto pb-1">
        <div
          className="inline-grid grid-flow-col gap-1"
          style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
        >
          {data.map((entry) => (
            <div
              key={entry.date}
              title={getTooltip(entry)}
              className={`h-3.5 w-3.5 rounded-[4px] ${levelClass[entry.level] ?? levelClass[0]}`}
            />
          ))}
        </div>
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/35 px-4 text-center text-sm text-[var(--text-secondary)]">
            {emptyLabel}
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{lessLabel}</span>
        <div className="flex items-center gap-1">
          {levelClass.map((className) => (
            <div key={className} className={`h-3.5 w-3.5 rounded-[4px] ${className}`} />
          ))}
        </div>
        <span>{moreLabel}</span>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof CalendarCheck;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
        {description}
      </p>
      <Link href={href} className="btn-accent mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function calculateTrendChange(values: number[]) {
  if (values.length < 2) return 0;
  const midpoint = Math.floor(values.length / 2);
  const previous = values.slice(0, midpoint).reduce((sum, value) => sum + value, 0);
  const current = values.slice(midpoint).reduce((sum, value) => sum + value, 0);

  if (previous === 0) return current > 0 ? 100 : 0;

  return Math.round(((current - previous) / previous) * 100);
}

function buildFallbackActivity() {
  const entries: Array<{ date: string; count: number; level: number; dateLabel: string }> = [];
  const today = new Date();

  for (let offset = 83; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);

    entries.push({
      date: date.toISOString(),
      dateLabel: date.toLocaleDateString(),
      count: 0,
      level: 0,
    });
  }

  return entries;
}
