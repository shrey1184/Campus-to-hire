"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BlurFade } from "@/components/magic/BlurFade";
import { NumberTicker } from "@/components/magic/NumberTicker";
import { useAuth } from "@/lib/auth-context";
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
  Loader2,
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
  icon: typeof Target;
  status: "ready" | "attention" | "locked";
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgressStats | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [completeStats, setCompleteStats] = useState<CompleteDashboardStats | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [todayPlan, setTodayPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);

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

        if (roadmapData) {
          const planData = await dailyPlanApi.getToday().catch(() => null);
          setTodayPlan(planData);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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
    problems_solved: Math.max(progress?.completed_tasks ?? 0, completedTasks),
    study_hours: Number(((todayPlan?.tasks.reduce((sum, task) => sum + (task.duration_minutes ?? 0), 0) ?? 0) / 60).toFixed(1)),
    xp_gained: completeStats?.xp_gained_today ?? xpStats.totalXP,
    tasks_completed: completedTasks,
  };

  const performanceLabels =
    completeStats?.performance_trend.labels ??
    stats?.weekly_progress.labels ??
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const performanceValues =
    completeStats?.performance_trend.values ??
    stats?.weekly_progress.tasks_completed ??
    [2, 3, 4, 3, 5, 4, 6];
  const performanceChange =
    completeStats?.performance_trend.change_percentage ??
    calculateTrendChange(performanceValues);

  const activityData =
    completeStats?.activity_heatmap?.map((entry) => ({
      ...entry,
      dateLabel: new Date(entry.date).toLocaleDateString(),
    })) ?? buildFallbackActivity(progress?.completed_tasks ?? 0, stats?.streak_days ?? 0);

  const activeDays = activityData.filter((entry) => entry.count > 0).length;
  const roadmapWeeks = roadmap?.content.weeks.length ?? roadmap?.total_weeks ?? 0;
  const remainingWeeks = roadmap ? Math.max(roadmap.total_weeks - roadmap.current_week + 1, 0) : 0;

  const nextSteps: StepCard[] = roadmap
    ? [
        {
          title: "Execute today",
          description:
            totalTasks > 0
              ? `${completedTasks} of ${totalTasks} tasks done. Finish the current study block first.`
              : "Your roadmap exists, but today’s task list still needs to be generated.",
          href: "/dashboard/today",
          cta: totalTasks > 0 ? "Open today’s tasks" : "Check today’s plan",
          icon: CalendarCheck,
          status: totalTasks > 0 ? "ready" : "attention",
        },
        {
          title: "Review roadmap",
          description: `Week ${roadmap.current_week} is active. ${remainingWeeks} week${remainingWeeks === 1 ? "" : "s"} remain in the current plan.`,
          href: "/dashboard/roadmap",
          cta: "See full roadmap",
          icon: Map,
          status: "ready",
        },
        {
          title: "Pressure-test with a JD",
          description: "Compare your current profile to a real role before the next mock interview.",
          href: "/dashboard/jd-analyze",
          cta: "Analyze a job description",
          icon: FileSearch,
          status: "ready",
        },
      ]
    : [
        {
          title: "Generate roadmap",
          description: "Start with a full preparation plan based on your role, time, and current skill level.",
          href: "/dashboard/roadmap",
          cta: "Create roadmap",
          icon: Map,
          status: "attention",
        },
        {
          title: "Define today’s work",
          description: "Daily tasks unlock automatically after the roadmap is created.",
          href: "/dashboard/today",
          cta: "Preview tasks page",
          icon: CalendarCheck,
          status: "locked",
        },
        {
          title: "Validate against a JD",
          description: "Use the job description analyzer to see what employers expect right now.",
          href: "/dashboard/jd-analyze",
          cta: "Open JD analyzer",
          icon: FileSearch,
          status: "ready",
        },
      ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="card-glass pulse-card rounded-xl px-8 py-6 text-center">
          <Loader2 className="spinner-glow mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-micro mt-3 text-muted-foreground">Syncing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <BlurFade delay={0.05}>
        <section className="relative overflow-hidden rounded-[28px] border border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_30%),linear-gradient(135deg,#101010,#080808)] p-6 sm:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(180deg,rgba(201,168,76,0.08),transparent)] lg:block" />
          <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Placement mission control
              </div>

              <div className="space-y-3">
                <h1 className="heading-xl max-w-3xl">
                  {firstName}, your path to <span className="text-gradient">{targetRole}</span> is already mapped.
                </h1>
                <p className="body-text max-w-2xl text-[var(--text-secondary)]">
                  Work the plan in sequence: lock the roadmap, finish today’s tasks, then test yourself against real interview and JD expectations.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={roadmap ? "/dashboard/today" : "/dashboard/roadmap"} className="btn-accent inline-flex items-center gap-2 px-5 py-3 text-sm">
                  {roadmap ? "Continue today’s plan" : "Generate your roadmap"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/dashboard/jd-analyze" className="btn-outline inline-flex items-center gap-2 px-5 py-3 text-sm">
                  <FileSearch className="h-4 w-4" />
                  Analyze a JD
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatPanel
                  label="Current level"
                  value={xpStats.currentLevel}
                  helper={`${xpStats.xpForNextLevel - xpStats.xpInCurrentLevel} XP to next level`}
                  icon={Award}
                />
                <StatPanel
                  label="Streak"
                  value={completeStats?.streak_days ?? stats?.streak_days ?? 0}
                  helper={`${completeStats?.personal_best_streak ?? Math.max(stats?.streak_days ?? 0, 0)} day best`}
                  icon={Flame}
                />
                <StatPanel
                  label="Readiness"
                  value={progress?.completion_rate ?? 0}
                  suffix="%"
                  helper={roadmap ? `Week ${roadmap.current_week} of ${roadmapWeeks}` : "No roadmap generated yet"}
                  icon={Target}
                />
              </div>
            </div>

            <div className="card-glass rounded-[24px] border-white/10 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    XP progress
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-[var(--text-primary)]">
                    <NumberTicker value={xpStats.totalXP} />
                  </p>
                </div>
                <div className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                  Level {xpStats.currentLevel}
                </div>
              </div>

              <div className="mb-5 h-3 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((xpStats.xpInCurrentLevel / xpStats.xpForNextLevel) * 100, 100)}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              </div>

              <div className="grid gap-3">
                <MiniMetric
                  label="Today’s completion"
                  value={`${completionPct}%`}
                  icon={CalendarCheck}
                />
                <MiniMetric
                  label="Problems solved"
                  value={String(completeStats?.problems_solved ?? progress?.completed_tasks ?? 0)}
                  icon={CheckCircle2}
                />
                <MiniMetric
                  label="Interview average"
                  value={`${completeStats?.average_interview_score ?? progress?.average_interview_score ?? 0}/100`}
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
                  Step by step
                </p>
                <h2 className="heading-md mt-1">What to do next</h2>
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
                  This week
                </p>
                <h2 className="heading-md mt-1">Execution summary</h2>
              </div>
              <Clock3 className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <SummaryCard label="Tasks completed" value={weeklyStats.tasks_completed} />
              <SummaryCard label="Study hours" value={weeklyStats.study_hours} />
              <SummaryCard label="XP gained" value={weeklyStats.xp_gained} />
              <SummaryCard label="Problems solved" value={weeklyStats.problems_solved} />
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
                  Today
                </p>
                <h2 className="heading-md mt-1">Current task lane</h2>
              </div>
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            </div>

            {todayPlan ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Week {todayPlan.week}, Day {todayPlan.day}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {todayPlan.focus_area || "Focus on consistent execution and interview-oriented practice."}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                      {completedTasks}/{totalTasks} done
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
                          <p className={`text-sm font-medium ${task.completed ? "text-[var(--text-secondary)] line-through" : "text-[var(--text-primary)]"}`}>
                            {task.title}
                          </p>
                        </div>
                        {task.description ? (
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">{task.description}</p>
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

                <Link href="/dashboard/today" className="link-glow inline-flex items-center gap-2 text-sm font-medium">
                  Open the full task board
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={CalendarCheck}
                title="No daily plan yet"
                description="Generate or refresh your roadmap first, then today’s tasks will appear here."
                href="/dashboard/roadmap"
                cta="Go to roadmap"
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
                    Performance
                  </p>
                  <h2 className="heading-md mt-1">7-day trend</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <PerformanceChart
                labels={performanceLabels}
                values={performanceValues}
                changePercentage={performanceChange}
              />
            </div>

            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Consistency
                  </p>
                  <h2 className="heading-md mt-1">Activity heatmap</h2>
                </div>
                <Flame className="h-5 w-5 text-[var(--accent)]" />
              </div>

              <ActivityHeatmap activeDays={activeDays} data={activityData} />
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
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
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {step.status}
            </span>
          </div>

          <Link href={step.href} className="link-glow mt-4 inline-flex items-center gap-2 text-sm font-medium">
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function PerformanceChart({
  labels,
  values,
  changePercentage,
}: {
  labels: string[];
  values: number[];
  changePercentage: number;
}) {
  const maxValue = Math.max(...values, 1);

  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-3">
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
            <span className="text-xs text-[var(--text-muted)]">{labels[index] || `D${index + 1}`}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-secondary)]">Daily output score</span>
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
}: {
  data: Array<{ date: string; count: number; level: number; dateLabel: string }>;
  activeDays: number;
}) {
  const levelClass = ["bg-white/5", "bg-[var(--accent)]/25", "bg-[var(--accent)]/45", "bg-[var(--accent)]/70", "bg-[var(--accent)]"];

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        {activeDays} active day{activeDays === 1 ? "" : "s"} in the last 12 weeks.
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
          {data.map((entry) => (
            <div
              key={entry.date}
              title={`${entry.dateLabel}: ${entry.count} tasks`}
              className={`h-3.5 w-3.5 rounded-[4px] ${levelClass[entry.level] ?? levelClass[0]}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {levelClass.map((className) => (
            <div key={className} className={`h-3.5 w-3.5 rounded-[4px] ${className}`} />
          ))}
        </div>
        <span>More</span>
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
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
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

function buildFallbackActivity(totalTasks: number, streak: number) {
  const entries: Array<{ date: string; count: number; level: number; dateLabel: string }> = [];
  const today = new Date();

  for (let offset = 83; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);

    const count = offset < streak ? 1 + ((totalTasks + offset) % 4) : (totalTasks + offset) % 5 === 0 ? 1 : 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;

    entries.push({
      date: date.toISOString(),
      dateLabel: date.toLocaleDateString(),
      count,
      level,
    });
  }

  return entries;
}
