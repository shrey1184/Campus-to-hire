"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { roadmapApi } from "@/lib/api";
import type { Roadmap } from "@/types";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  Loader2,
  Map,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  learn: BookOpen,
  practice: Code,
  review: FileText,
  interview: MessageSquare,
  project: Zap,
  quiz: CheckCircle2,
  theory: BookOpen,
};

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingWeek, setGeneratingWeek] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoadmap();
  }, []);

  async function loadRoadmap() {
    try {
      const result = await roadmapApi.getActive();
      setRoadmap(result);
      setExpandedWeek(Math.max(result.current_week - 1, 0));
    } catch {
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGeneratingWeek(null);
    setError("");

    try {
      const initialRoadmap = await roadmapApi.generate();
      setRoadmap(initialRoadmap);
      setExpandedWeek(0);

      const pendingWeeks = initialRoadmap.content.weeks
        .filter((week) => week.pending || !week.days?.length)
        .map((week) => week.week);

      let nextRoadmap = initialRoadmap;

      for (const weekNumber of pendingWeeks) {
        setGeneratingWeek(weekNumber);
        try {
          nextRoadmap = await roadmapApi.generateWeek(initialRoadmap.id, weekNumber);
          setRoadmap(nextRoadmap);
        } catch {
          setError(`Failed to generate week ${weekNumber}. You can retry to continue.`);
        }
      }
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Failed to generate roadmap");
    } finally {
      setGenerating(false);
      setGeneratingWeek(null);
    }
  }

  const roadmapSummary = useMemo(() => {
    if (!roadmap) {
      return {
        totalWeeks: 0,
        currentWeek: 0,
        totalTasks: 0,
        completedTasks: 0,
        progressPct: 0,
      };
    }

    const allTasks = roadmap.content.weeks.flatMap((week) => week.days?.flatMap((day) => day.tasks || []) || []);
    const completedTasks = allTasks.filter((task) => task.completed).length;
    const totalTasks = allTasks.length;
    const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalWeeks: roadmap.total_weeks,
      currentWeek: roadmap.current_week,
      totalTasks,
      completedTasks,
      progressPct,
    };
  }, [roadmap]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="card-glass pulse-card rounded-xl px-8 py-6 text-center">
          <Loader2 className="spinner-glow mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-micro mt-3 text-muted-foreground">Loading roadmap nodes...</p>
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
        <section className="rounded-[28px] border border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_28%),linear-gradient(135deg,#101010,#080808)] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Map className="h-3.5 w-3.5" />
                Strategic roadmap
              </div>
              <div>
                <h1 className="heading-xl">A strong roadmap removes guesswork from placement prep.</h1>
                <p className="body-text mt-3 max-w-2xl text-[var(--text-secondary)]">
                  This page is your sequence engine. Generate the plan, open the current week, then drill down into the exact day and task blocks you need to execute.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Total weeks" value={String(roadmapSummary.totalWeeks)} />
                <Metric label="Current week" value={String(roadmapSummary.currentWeek)} />
                <Metric label="Completion" value={`${roadmapSummary.progressPct}%`} />
              </div>

              <div className="flex flex-wrap gap-3">
                <ShimmerButton onClick={handleGenerate} disabled={generating} className="w-full sm:w-auto">
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {generatingWeek ? `Generating week ${generatingWeek}...` : "Creating roadmap..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {roadmap ? "Regenerate roadmap" : "Generate roadmap"}
                    </>
                  )}
                </ShimmerButton>
              </div>
            </div>

            <div className="card-glass rounded-[24px] border-white/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Step-by-step usage
              </p>
              <div className="mt-4 space-y-3">
                <GuideStep number="01" title="Generate the plan" description="Create the multi-week structure using your current profile and target role." />
                <GuideStep number="02" title="Expand the active week" description="Open the current week first. That is where your execution focus should live." />
                <GuideStep number="03" title="Go day by day" description="Use each day as a compact sprint. The roadmap matters only if the daily tasks get finished." />
              </div>
            </div>
          </div>
        </section>
      </BlurFade>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {generating && roadmap ? (
        <BlurFade delay={0.08}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">
                {generatingWeek ? `Generating week ${generatingWeek} of ${roadmap.total_weeks}` : "Preparing roadmap structure"}
              </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {generatingWeek ? `${Math.round(((generatingWeek - 1) / roadmap.total_weeks) * 100)}%` : "Starting"}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                initial={{ width: 0 }}
                animate={{ width: `${generatingWeek ? ((generatingWeek - 1) / roadmap.total_weeks) * 100 : 12}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </BlurFade>
      ) : null}

      {roadmap ? (
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <BlurFade delay={0.12}>
            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Plan health
                </p>
                <h2 className="heading-md mt-1">Current roadmap snapshot</h2>
              </div>

              <div className="space-y-3">
                <SnapshotRow label="Target role" value={roadmap.target_role?.replace(/_/g, " ") || "Not specified"} />
                <SnapshotRow label="Completed tasks" value={`${roadmapSummary.completedTasks}/${roadmapSummary.totalTasks}`} />
                <SnapshotRow label="Active position" value={`Week ${roadmap.current_week}, Day ${roadmap.current_day}`} />
                <SnapshotRow label="Estimated length" value={`${roadmap.total_weeks} weeks`} />
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Overall completion</span>
                  <span className="font-semibold text-[var(--text-primary)]">{roadmapSummary.progressPct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                    initial={{ width: 0 }}
                    animate={{ width: `${roadmapSummary.progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.16}>
            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Step 1 to {roadmap.total_weeks}
                </p>
                <h2 className="heading-md mt-1">Open the roadmap timeline</h2>
              </div>

              <div className="space-y-4">
                {roadmap.content.weeks.map((week, index) => {
                  const isExpanded = expandedWeek === index;
                  const isCurrent = week.week === roadmap.current_week;
                  const isPast = week.week < roadmap.current_week;
                  const isPending = week.pending || !week.days?.length;
                  const weekTasks = week.days?.flatMap((day) => day.tasks || []) || [];
                  const completedTasks = weekTasks.filter((task) => task.completed).length;
                  const weekProgress = weekTasks.length > 0 ? Math.round((completedTasks / weekTasks.length) * 100) : 0;

                  return (
                    <div
                      key={week.week}
                      className={`rounded-[24px] border ${
                        isCurrent
                          ? "border-[var(--accent)]/30 bg-[var(--accent-subtle)]"
                          : isPast
                            ? "border-white/8 bg-white/[0.03]"
                            : isPending
                              ? "border-white/6 bg-white/[0.01] opacity-75"
                              : "border-white/8 bg-white/[0.02]"
                      }`}
                    >
                      <button
                        onClick={() => !isPending && setExpandedWeek(isExpanded ? null : index)}
                        disabled={isPending}
                        className="flex w-full items-start gap-4 p-5 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/25 font-semibold text-[var(--accent)]">
                          {isPending && generatingWeek === week.week ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isPast ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            week.week
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                  Week {week.week}
                                </span>
                                {isCurrent ? (
                                  <span className="rounded-full border border-[var(--accent)]/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                                    Current
                                  </span>
                                ) : null}
                              </div>
                              <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">{week.title}</h3>
                              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {week.description || "Structured learning, deliberate practice, and interview-oriented reinforcement."}
                              </p>
                            </div>

                            {!isPending ? (
                              <div className="flex shrink-0 items-center gap-3">
                                <span className="hidden text-sm font-semibold text-[var(--text-secondary)] sm:inline">
                                  {weekProgress}%
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
                                )}
                              </div>
                            ) : null}
                          </div>

                          {!isPending ? (
                            <div className="mt-4">
                              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${weekProgress}%` }}
                                  transition={{ duration: 0.35, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-[var(--text-muted)]">
                              {generatingWeek === week.week ? "Generating tasks for this week..." : "Waiting to generate week details."}
                            </p>
                          )}
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && !isPending && week.days ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t border-white/8"
                          >
                            <div className="space-y-3 p-5 pt-4">
                              {week.days.map((day, dayIndex) => {
                                const dayKey = `${week.week}-${day.day}-${dayIndex}`;
                                const isDayExpanded = expandedDay === dayKey;
                                const totalTasks = day.tasks?.length || 0;
                                const completedTasksForDay = day.tasks?.filter((task) => task.completed).length || 0;

                                return (
                                  <div key={dayKey} className="rounded-[20px] border border-white/8 bg-black/15">
                                    <button
                                      onClick={() => setExpandedDay(isDayExpanded ? null : dayKey)}
                                      className="flex w-full items-center gap-3 p-4 text-left"
                                    >
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-[var(--accent)]">
                                        {day.day || dayIndex + 1}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                                          {day.title || `Day ${day.day || dayIndex + 1}`}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                          {completedTasksForDay}/{totalTasks} tasks completed
                                        </p>
                                      </div>
                                      {isDayExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                                      )}
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {isDayExpanded && day.tasks ? (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.22 }}
                                          className="overflow-hidden border-t border-white/8"
                                        >
                                          <div className="space-y-3 p-4">
                                            {day.tasks.map((task, taskIndex) => {
                                              const Icon = TYPE_ICONS[task.type] || BookOpen;

                                              return (
                                                <div
                                                  key={`${dayKey}-${task.id || taskIndex}`}
                                                  className={`rounded-2xl border p-4 ${
                                                    task.completed
                                                      ? "border-[var(--accent)]/25 bg-[var(--accent-subtle)]"
                                                      : "border-white/8 bg-white/[0.02]"
                                                  }`}
                                                >
                                                  <div className="flex items-start gap-3">
                                                    <div className="rounded-xl bg-white/5 p-2 text-[var(--accent)]">
                                                      <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                      <div className="flex flex-wrap items-center gap-2">
                                                        <p className={`text-sm font-semibold ${task.completed ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                                                          {task.title}
                                                        </p>
                                                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                                                          {task.type}
                                                        </span>
                                                      </div>
                                                      {task.description ? (
                                                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
                                                      ) : null}
                                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        {task.duration_minutes ? (
                                                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                                                            {task.duration_minutes} min
                                                          </span>
                                                        ) : null}
                                                        {task.resources?.map((resource, resourceIndex) =>
                                                          resource.url ? (
                                                            <a
                                                              key={`${dayKey}-${taskIndex}-${resourceIndex}`}
                                                              href={resource.url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="link-glow rounded-full border border-white/10 px-2.5 py-1 text-xs"
                                                            >
                                                              {resource.title}
                                                            </a>
                                                          ) : (
                                                            <span
                                                              key={`${dayKey}-${taskIndex}-${resourceIndex}`}
                                                              className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--text-secondary)]"
                                                            >
                                                              {resource.title}
                                                            </span>
                                                          ),
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </motion.div>
                                      ) : null}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </BlurFade>
        </section>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)]">
            <Map className="h-6 w-6" />
          </div>
          <h2 className="heading-lg">No roadmap yet</h2>
          <p className="body-text mx-auto mt-2 max-w-2xl text-[var(--text-secondary)]">
            Generate a personalized roadmap to turn your target role into a week-by-week preparation system.
          </p>
        </div>
      )}
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function GuideStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-black/25 text-sm font-semibold text-[var(--accent)]">
          {number}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className="max-w-[12rem] truncate text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
