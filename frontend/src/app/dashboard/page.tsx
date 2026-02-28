"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { profileApi, roadmapApi, dailyPlanApi } from "@/lib/api";
import type { UserProgressStats, DashboardStats, Roadmap, DailyPlan } from "@/types";
import Link from "next/link";
import {
  Target,
  CalendarCheck,
  Flame,
  Map,
  MessageSquare,
  FileSearch,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgressStats | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [todayPlan, setTodayPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [p, s] = await Promise.all([
          profileApi.getProgress().catch(() => null),
          profileApi.getStats().catch(() => null),
        ]);
        setProgress(p);
        setStats(s);

        const rm = await roadmapApi.getActive().catch(() => null);
        setRoadmap(rm);

        if (rm) {
          const tp = await dailyPlanApi.getToday().catch(() => null);
          setTodayPlan(tp);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="rounded-xl px-8 py-6 text-center card-glass pulse-card">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary spinner-glow" />
          <p className="mt-3 text-micro text-muted-foreground">Syncing your dashboard...</p>
        </div>
      </div>
    );
  }

  const completedTasks = todayPlan?.tasks?.filter((t) => t.completed).length ?? 0;
  const totalTasks = todayPlan?.tasks?.length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="heading-lg font-bold">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 max-w-2xl text-muted-foreground body-text">
          {user?.target_role
            ? `Preparing for ${user.target_role.replace(/_/g, " ").toUpperCase()} roles`
            : "Let's continue your preparation journey"}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Tasks Completed"
          value={progress?.completed_tasks ?? 0}
          subtext={`of ${progress?.total_tasks ?? 0} total`}
          color="text-primary"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Completion Rate"
          value={`${progress?.completion_rate ?? 0}%`}
          subtext="overall"
          color="text-primary"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Current Streak"
          value={`${stats?.streak_days ?? 0} days`}
          subtext="keep it up!"
          color="text-primary"
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Interviews"
          value={progress?.total_interviews ?? 0}
          subtext={
            progress?.average_interview_score
              ? `avg score: ${progress.average_interview_score}`
              : "start practicing"
          }
          color="text-primary"
        />
      </div>

      {/* Main content */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Today's plan summary */}
        <div className="lg:col-span-2 rounded-2xl p-5 sm:p-6 card-dark">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading-md font-semibold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Today&apos;s Plan
            </h2>
            {todayPlan && (
              <Link
                href="/dashboard/today"
                className="link-glow flex items-center gap-1 text-sm"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {todayPlan ? (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {completedTasks}/{totalTasks}
                </span>
              </div>

              {/* Task list preview */}
              {todayPlan.tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 sm:p-3.5 ${
                    task.completed
                      ? "border-primary/40 bg-primary/10"
                      : "border-border"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                  </div>
                  {task.duration_minutes && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.duration_minutes}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : roadmap ? (
            <p className="text-sm text-muted-foreground">
              Loading your daily plan...
            </p>
          ) : (
            <div className="rounded-lg p-8 text-center card-glass">
              <Map className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="mb-2 font-medium">No Roadmap Yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Generate a personalized roadmap to get daily plans
              </p>
              <Link
                href="/dashboard/roadmap"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium btn-accent"
              >
                Generate Roadmap <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <h2 className="heading-md font-semibold">Quick Actions</h2>

          <QuickAction
            href="/dashboard/roadmap"
            icon={<Map className="h-5 w-5" />}
            title="View Roadmap"
            description="Your personalized learning path"
            color="bg-primary/15 text-primary"
          />
          <QuickAction
            href="/dashboard/today"
            icon={<CalendarCheck className="h-5 w-5" />}
            title="Today's Tasks"
            description="Complete your daily goals"
            color="bg-primary/15 text-primary"
          />
          <QuickAction
            href="/dashboard/interview"
            icon={<MessageSquare className="h-5 w-5" />}
            title="Mock Interview"
            description="Practice with AI interviewer"
            color="bg-primary/15 text-primary"
          />
          <QuickAction
            href="/dashboard/jd-analyze"
            icon={<FileSearch className="h-5 w-5" />}
            title="Analyze JD"
            description="Check your skill-gap"
            color="bg-primary/15 text-primary"
          />

          {/* Skill snapshot */}
          {stats?.skill_levels && Object.keys(stats.skill_levels).length > 0 && (
            <div className="rounded-xl p-4 card-dark">
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Skill Levels
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.skill_levels).slice(0, 5).map(([skill, level]) => (
                  <div key={skill} className="flex items-center gap-2">
                    <span className="w-24 truncate text-xs text-muted-foreground capitalize">
                      {skill.replace(/_/g, " ")}
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${(Number(level) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{level}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
}) {
  return (
    <div className="rounded-xl p-4 card-dark">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <p className="text-xl font-bold sm:text-2xl">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl p-4 transition card-dark card-interactive"
    >
      <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
