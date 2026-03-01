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
  TrendingUp,
  Award,
  Zap,
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
  const targetRole = user?.target_role?.replace(/_/g, " ") || "SDE at Amazon";
  const daysLeft = roadmap ? Math.max(0, (roadmap.total_weeks - (roadmap.current_week - 1)) * 7) : 85;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-lg font-bold">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="mt-1 text-muted-foreground body-text">
            You're on track to become an {targetRole} in {daysLeft} days.
          </p>
        </div>
        <div className="flex gap-2">
          {roadmap && (
            <Link
              href="/dashboard/today"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold btn-accent"
            >
              Resume Learning
            </Link>
          )}
          <Link
            href="/dashboard/roadmap"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted/50 transition"
          >
            View Roadmap
          </Link>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column - Today's Plan & Skill Analysis */}
        <div className="space-y-5 lg:col-span-2">
          {/* Today's Plan */}
          <div className="rounded-2xl p-5 sm:p-6 card-dark">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="heading-md font-semibold">Today&apos;s Plan</h2>
              {todayPlan && (
                <Link
                  href="/dashboard/today"
                  className="link-glow flex items-center gap-1 text-sm"
                >
                  View All
                </Link>
              )}
            </div>

            {todayPlan ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  {todayPlan.focus_area || "Focus on Dynamic Programming and Leadership Principles today"}
                </p>
                <div className="space-y-3">
                  {/* Task list preview */}
                  {todayPlan.tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 rounded-lg border p-3.5 ${
                        task.completed
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          task.completed
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.duration_minutes && (
                          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {task.duration_minutes} min
                          </span>
                        )}
                        {task.type && (
                          <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                            task.type === "learn" || task.type === "theory"
                              ? "bg-primary/15 text-primary"
                              : task.type === "practice"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {task.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
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

          {/* Skill Analysis */}
          {stats?.skill_levels && Object.keys(stats.skill_levels).length > 0 && (
            <div className="rounded-2xl p-5 sm:p-6 card-dark">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="heading-md font-semibold">Skill Analysis</h2>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                Your current proficiency vs target role
              </p>
              
              {/* Radar Chart */}
              <RadarChart skills={stats.skill_levels} />
            </div>
          )}
        </div>

        {/* Right column - Stats Cards */}
        <div className="space-y-4">
          {/* Weekly Streak */}
          <div className="rounded-xl p-5 card-dark relative overflow-hidden">
            <div className="absolute right-0 top-0 text-6xl opacity-5">
              <Flame />
            </div>
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Weekly Streak</span>
                <Flame className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-3xl font-bold">{stats?.streak_days ?? 0} Days</p>
              <p className="mt-1 text-xs text-muted-foreground">Keep up the great work!</p>
            </div>
          </div>

          {/* Problems Solved */}
          <div className="rounded-xl p-5 card-dark relative overflow-hidden">
            <div className="absolute right-0 top-0 text-6xl opacity-5">
              <CheckCircle2 />
            </div>
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Problems Solved</span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{progress?.completed_tasks ?? 0}</p>
              <p className="mt-1 text-xs text-muted-foreground">Across all your courses</p>
            </div>
          </div>

          {/* Mock Interview Score */}
          <div className="rounded-xl p-5 card-dark relative overflow-hidden">
            <div className="absolute right-0 top-0 text-6xl opacity-5">
              <Award />
            </div>
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Mock Interview</span>
                <Award className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                {progress?.average_interview_score ?? 78}/100
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Average performance score</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold text-muted-foreground">Quick Actions</h3>
            <QuickAction
              href="/dashboard/interview"
              icon={<MessageSquare className="h-4 w-4" />}
              title="Mock Interview"
              description="Practice with AI"
            />
            <QuickAction
              href="/dashboard/jd-analyze"
              icon={<FileSearch className="h-4 w-4" />}
              title="Analyze JD"
              description="Check skill-gap"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ skills }: { skills: Record<string, number> }) {
  const skillEntries = Object.entries(skills).slice(0, 6);
  const numPoints = skillEntries.length;
  const size = 280;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;

  // Calculate points for a regular polygon
  const getPoint = (index: number, value: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (radius * value) / 5;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate polygon points for data
  const dataPoints = skillEntries
    .map(([_, value], i) => {
      const point = getPoint(i, Number(value), maxRadius);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Generate grid circles
  const gridLevels = Array.from({ length: levels }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(maxRadius * level) / levels}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border opacity-30"
          />
        ))}

        {/* Grid lines from center to each point */}
        {skillEntries.map((_, i) => {
          const point = getPoint(i, 5, maxRadius);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border opacity-30"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="currentColor"
          className="text-primary opacity-20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ strokeOpacity: 0.8 }}
        />

        {/* Data points */}
        {skillEntries.map(([_, value], i) => {
          const point = getPoint(i, Number(value), maxRadius);
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-primary"
            />
          );
        })}

        {/* Labels */}
        {skillEntries.map(([skill], i) => {
          const labelPoint = getPoint(i, 5.8, maxRadius);
          const angle = (360 * i) / numPoints - 90;
          const textAnchor =
            angle > 45 && angle < 135
              ? "start"
              : angle > 225 && angle < 315
              ? "end"
              : "middle";

          return (
            <text
              key={skill}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor={textAnchor}
              className="fill-muted-foreground text-xs font-medium"
              dominantBaseline="middle"
            >
              {skill.replace(/_/g, " ").length > 15
                ? skill.replace(/_/g, " ").substring(0, 12) + "..."
                : skill.replace(/_/g, " ")}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border p-3 transition hover:border-primary/50 hover:bg-muted/30"
    >
      <div className="rounded-md bg-primary/15 p-2 text-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
