"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlurFade } from "@/components/magic/BlurFade";
import { dailyPlanApi } from "@/lib/api";
import type { DailyPlan, Task } from "@/types";
import { TASK_TYPE_COLORS } from "@/types";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Code,
  FileText,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const TYPE_ICONS: Record<string, typeof BookOpen> = {
  learn: BookOpen,
  practice: Code,
  review: FileText,
  interview: MessageSquare,
  project: Zap,
  quiz: Sparkles,
  theory: BookOpen,
};

export default function TodayPage() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);

  const loadPlan = useCallback(async () => {
    try {
      const result = await dailyPlanApi.getToday();
      setPlan(result);
    } catch {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  async function handleToggle(task: Task) {
    if (!plan) return;

    setToggling(task.id);
    try {
      const updated = await dailyPlanApi.completeTask(task.id, !task.completed);
      setPlan(updated);
    } finally {
      setToggling(null);
    }
  }

  async function handleNextDay() {
    setAdvancing(true);
    try {
      const next = await dailyPlanApi.nextDay();
      setPlan(next);
    } finally {
      setAdvancing(false);
    }
  }

  const summary = useMemo(() => {
    if (!plan) {
      return {
        completed: 0,
        total: 0,
        completionPct: 0,
        totalMinutes: 0,
        completedMinutes: 0,
        nextTask: null as Task | null,
      };
    }

    const completed = plan.tasks.filter((task) => task.completed).length;
    const total = plan.tasks.length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalMinutes = plan.tasks.reduce((sum, task) => sum + (task.duration_minutes ?? 30), 0);
    const completedMinutes = plan.tasks
      .filter((task) => task.completed)
      .reduce((sum, task) => sum + (task.duration_minutes ?? 30), 0);
    const nextTask = plan.tasks.find((task) => !task.completed) ?? null;

    return { completed, total, completionPct, totalMinutes, completedMinutes, nextTask };
  }, [plan]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="card-glass pulse-card rounded-xl px-8 py-6 text-center">
          <Loader2 className="spinner-glow mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-micro mt-3 text-muted-foreground">Preparing today&apos;s tasks...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)]">
          <CalendarCheck className="h-6 w-6" />
        </div>
        <h1 className="heading-lg">No tasks for today</h1>
        <p className="body-text mt-2 text-[var(--text-secondary)]">
          Generate a roadmap first, then this page becomes your daily execution board.
        </p>
      </div>
    );
  }

  const allDone = summary.total > 0 && summary.completed === summary.total;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <BlurFade delay={0.05}>
        <section className="rounded-[28px] border border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_28%),linear-gradient(135deg,#101010,#080808)] p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                <Target className="h-3.5 w-3.5" />
                Today&apos;s execution plan
              </div>
              <div>
                <h1 className="heading-xl">Finish one focused day before worrying about the whole journey.</h1>
                <p className="body-text mt-3 max-w-2xl text-[var(--text-secondary)]">
                  Move in order: understand today’s focus, complete the highest-value task first, then close the day only when the board is green.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Kpi label="Tasks done" value={`${summary.completed}/${summary.total}`} />
                <Kpi label="Completion" value={`${summary.completionPct}%`} />
                <Kpi label="Time budget" value={`${Math.round((summary.totalMinutes / 60) * 10) / 10}h`} />
              </div>
            </div>

            <div className="card-glass rounded-[24px] border-white/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Day snapshot
              </p>
              <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Week {plan.week}, Day {plan.day}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {plan.focus_area || "Steady repetition, deliberate practice, and one interview-oriented task."}
                </p>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Progress</span>
                  <span className="font-semibold text-[var(--text-primary)]">{summary.completionPct}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.completionPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <InlineMetric label="Minutes completed" value={`${summary.completedMinutes}m`} icon={Clock3} />
                <InlineMetric
                  label="Next priority"
                  value={summary.nextTask?.title || "Everything is complete"}
                  icon={ArrowRight}
                />
              </div>
            </div>
          </div>
        </section>
      </BlurFade>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BlurFade delay={0.1}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Step 1
              </p>
              <h2 className="heading-md mt-1">Orient yourself</h2>
            </div>

            <div className="space-y-3">
              <StepCard
                number="01"
                title="Know the goal"
                description={plan.focus_area || "Treat today as a blended day: learning, practice, and review should all connect to the same role outcome."}
              />
              <StepCard
                number="02"
                title="Protect the time block"
                description={`${Math.round((summary.totalMinutes / 60) * 10) / 10} hours are planned today. Finish the first incomplete task before switching context.`}
              />
              <StepCard
                number="03"
                title="Close the loop"
                description={allDone ? "All tasks are complete. You can move to the next day when ready." : "Mark work as complete immediately after each block so the board stays reliable."}
              />
            </div>

            <AnimatePresence>
              {allDone ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-5 rounded-[22px] border border-[var(--accent)]/25 bg-[var(--accent-subtle)] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-black/25 p-3 text-[var(--accent)]">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Day complete</p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          Move forward only when you are ready for the next day&apos;s workload.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNextDay}
                      disabled={advancing}
                      className="btn-accent inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
                    >
                      {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Next day
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </BlurFade>

        <BlurFade delay={0.14}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Step 2
                </p>
                <h2 className="heading-md mt-1">Execute the board</h2>
              </div>
              <CalendarCheck className="h-5 w-5 text-[var(--accent)]" />
            </div>

            <div className="space-y-3">
              {plan.tasks.map((task, index) => (
                <TaskRow
                  key={task.id}
                  index={index}
                  task={task}
                  toggling={toggling === task.id}
                  onToggle={() => handleToggle(task)}
                />
              ))}
            </div>
          </div>
        </BlurFade>
      </section>
    </motion.div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function InlineMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--accent-subtle)] p-2 text-[var(--accent)]">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="max-w-[12rem] truncate text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.02] p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/30 text-sm font-semibold text-[var(--accent)]">
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

function TaskRow({
  index,
  task,
  toggling,
  onToggle,
}: {
  index: number;
  task: Task;
  toggling: boolean;
  onToggle: () => void;
}) {
  const Icon = TYPE_ICONS[task.type] || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`rounded-[22px] border p-4 ${
        task.completed
          ? "border-[var(--accent)]/25 bg-[var(--accent-subtle)]"
          : "border-white/8 bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          disabled={toggling}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/25 text-[var(--accent)]"
          aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : task.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5 text-[var(--text-muted)]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl bg-white/5 p-2 text-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </div>
            <p className={`text-sm font-semibold ${task.completed ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
              {task.title}
            </p>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${TASK_TYPE_COLORS[task.type] || "bg-secondary text-secondary-foreground"}`}>
              {task.type}
            </span>
          </div>

          {task.description ? (
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{task.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.duration_minutes ? (
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                {task.duration_minutes} min
              </span>
            ) : null}
            {task.resources?.map((resource, resourceIndex) => (
              <a
                key={`${task.id}-${resourceIndex}`}
                href={resource.url || "#"}
                target={resource.url ? "_blank" : undefined}
                rel={resource.url ? "noopener noreferrer" : undefined}
                className="link-glow rounded-full border border-white/10 px-2.5 py-1 text-xs"
              >
                {resource.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
