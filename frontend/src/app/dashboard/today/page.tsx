"use client";

import { useEffect, useState, useCallback } from "react";
import { dailyPlanApi } from "@/lib/api";
import type { DailyPlan, Task } from "@/types";
import { TASK_TYPE_COLORS } from "@/types";
import {
  CalendarCheck,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code,
  FileText,
  MessageSquare,
  Zap,
  Trophy,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  learn: <BookOpen className="h-4 w-4" />,
  practice: <Code className="h-4 w-4" />,
  review: <FileText className="h-4 w-4" />,
  interview: <MessageSquare className="h-4 w-4" />,
  project: <Zap className="h-4 w-4" />,
  quiz: <CheckCircle2 className="h-4 w-4" />,
};

export default function TodayPage() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    try {
      const p = await dailyPlanApi.getToday();
      setPlan(p);
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
    } catch (err) {
      console.error("Failed to toggle task:", err);
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center cyber-panel-soft cyber-loading-panel">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary cyber-spinner" />
          <p className="mt-3 cyber-micro text-muted-foreground">Preparing today&apos;s tasks...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Plan For Today</h2>
        <p className="text-sm text-muted-foreground">
          Generate a roadmap first to get daily plans.
        </p>
      </div>
    );
  }

  const completed = plan.tasks.filter((t) => t.completed).length;
  const total = plan.tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalMinutes = plan.tasks.reduce((s, t) => s + (t.duration_minutes || 30), 0);
  const allDone = completed === total && total > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="cyber-heading-lg font-bold flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Today&apos;s Plan
        </h1>
        <p className="mt-1 text-muted-foreground cyber-copy">
          Week {plan.week}, Day {plan.day}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl p-4 text-center cyber-panel">
          <p className="text-xl font-bold text-primary sm:text-2xl">{completed}/{total}</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </div>
        <div className="rounded-xl p-4 text-center cyber-panel">
          <p className="text-xl font-bold sm:text-2xl">{pct}%</p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
        <div className="rounded-xl p-4 text-center cyber-panel">
          <p className="flex items-center justify-center gap-1 text-xl font-bold sm:text-2xl">
            <Clock className="h-4 w-4" />
            {Math.round(totalMinutes / 60 * 10) / 10}h
          </p>
          <p className="text-xs text-muted-foreground">Total Time</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl p-4 cyber-panel">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Daily Progress</span>
          <span className="text-muted-foreground tabular-nums">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted">
          <div
            className={`h-3 rounded-full transition-all ${
              allDone
                ? "bg-gradient-to-r from-primary to-violet-400"
                : "bg-gradient-to-r from-primary to-purple-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4 cyber-panel-soft">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <p className="font-semibold text-primary">
              All tasks completed.
            </p>
            <p className="text-sm text-muted-foreground">
              Great job today! Come back tomorrow for new tasks.
            </p>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {plan.tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-start gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition ${
              task.completed
                ? "border-primary/40 bg-primary/10 cyber-panel-soft"
                : "border-border/50 bg-card hover:border-primary/30 cyber-panel cyber-panel-hover"
            }`}
          >
            {/* Toggle */}
            <button
              onClick={() => handleToggle(task)}
              disabled={toggling === task.id}
              className="mt-0.5 flex-shrink-0"
            >
              {toggling === task.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary cyber-spinner" />
              ) : task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {TYPE_ICONS[task.type] || <BookOpen className="h-4 w-4" />}
                </span>
                <p
                  className={`font-medium ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </p>
              </div>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
              )}
              {task.resources && task.resources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {task.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cyber-link text-xs"
                    >
                      Resource: {r.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end gap-1">
              {task.duration_minutes && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.duration_minutes}m
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                  TASK_TYPE_COLORS[task.type] || "bg-secondary text-secondary-foreground"
                }`}
              >
                {task.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
