"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dailyPlanApi } from "@/lib/api";
import type { DailyPlan, Task } from "@/types";
import { TASK_TYPE_COLORS } from "@/types";
import { BlurFade } from "@/components/magic/BlurFade";
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
  ArrowRight,
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
  const [advancing, setAdvancing] = useState(false);

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

  async function handleNextDay() {
    setAdvancing(true);
    try {
      const nextPlan = await dailyPlanApi.nextDay();
      setPlan(nextPlan);
    } catch (err) {
      console.error("Failed to advance:", err);
    } finally {
      setAdvancing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center card-glass pulse-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary spinner-glow" />
          <p className="mt-3 text-micro text-muted-foreground">Preparing today&apos;s tasks...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">No Plan For Today</h2>
        <p className="text-sm text-muted-foreground">Generate a roadmap first to get daily plans.</p>
      </div>
    );
  }

  const completed = plan.tasks.filter((t) => t.completed).length;
  const total = plan.tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalMinutes = plan.tasks.reduce((s, t) => s + (t.duration_minutes || 30), 0);
  const allDone = completed === total && total > 0;
  const ringCircumference = 2 * Math.PI * 42;
  const ringOffset = ringCircumference - (pct / 100) * ringCircumference;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div>
        <h1 className="heading-lg flex items-center gap-2 font-bold">
          <CalendarCheck className="h-6 w-6 text-primary" />
          Today&apos;s Plan
        </h1>
        <p className="body-text mt-1 text-muted-foreground">
          Week {plan.week}, Day {plan.day}
        </p>
      </div>

      <BlurFade delay={0.1}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl p-4 text-center card-dark">
            <p className="text-xl font-bold text-primary sm:text-2xl">
              {completed}/{total}
            </p>
            <p className="text-xs text-muted-foreground">Tasks Done</p>
          </div>
          <div className="rounded-xl p-4 text-center card-dark">
            <div className="mx-auto flex w-fit items-center justify-center">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  style={{ strokeDasharray: ringCircumference }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-bold sm:text-2xl">{pct}%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 text-center card-dark">
            <p className="flex items-center justify-center gap-1 text-xl font-bold sm:text-2xl">
              <Clock className="h-4 w-4" />
              {Math.round((totalMinutes / 60) * 10) / 10}h
            </p>
            <p className="text-xs text-muted-foreground">Total Time</p>
          </div>
        </div>
      </BlurFade>

      <div className="rounded-xl p-4 card-dark">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Daily Progress</span>
          <span className="tabular-nums text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted">
          <motion.div
            className={`h-3 rounded-full ${allDone ? "bg-gradient-to-r from-primary to-amber-500" : "bg-gradient-to-r from-primary to-amber-600"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="card-glass flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 flex-shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-primary">All tasks completed!</p>
                <p className="text-sm text-muted-foreground">
                  Great job! Move on to the next day when you&apos;re ready.
                </p>
              </div>
            </div>
            <motion.button
              onClick={handleNextDay}
              disabled={advancing}
              whileHover={{ scale: advancing ? 1 : 1.03 }}
              whileTap={{ scale: advancing ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="btn-accent flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Next Day
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {plan.tasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`flex items-start gap-3 rounded-xl border p-3.5 transition sm:gap-4 sm:p-4 ${
              task.completed
                ? "card-glass border-primary/40 bg-primary/10"
                : "card-dark card-interactive border-border/50 bg-card hover:border-primary/30"
            }`}
          >
            <button onClick={() => handleToggle(task)} disabled={toggling === task.id} className="mt-0.5 flex-shrink-0">
              {toggling === task.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary spinner-glow" />
              ) : (
                <motion.div
                  animate={task.completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                  )}
                </motion.div>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{TYPE_ICONS[task.type] || <BookOpen className="h-4 w-4" />}</span>
                <p className={`font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}>{task.title}</p>
              </div>
              {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
              {task.resources && task.resources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {task.resources.map((r, i) => (
                    <a key={i} href={r.url || "#"} target="_blank" rel="noopener noreferrer" className="link-glow text-xs">
                      Resource: {r.title}
                    </a>
                  ))}
                </div>
              )}
            </div>

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
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
