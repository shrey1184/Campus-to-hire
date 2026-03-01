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
  Trophy,
  Star,
  Brain,
  Code2,
  Sparkles,
  ChevronRight,
  Crown,
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

  // Calculate XP and level (gamification)
  const totalXP = (progress?.completed_tasks ?? 0) * 10 + (progress?.total_interviews ?? 0) * 25;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const xpInCurrentLevel = totalXP % 100;
  const xpForNextLevel = 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting with Level Badge */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="heading-lg font-bold">
              Welcome back, {user?.name?.split(" ")[0] || "Student"}!
            </h1>
            <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/30 px-3 py-1">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Level {currentLevel}</span>
            </div>
          </div>
          <p className="text-muted-foreground body-text">
            You're on track to become an {targetRole} in {daysLeft} days.
          </p>
          {/* XP Progress Bar */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{xpInCurrentLevel} / {xpForNextLevel} XP</span>
              <span className="text-primary font-semibold">{xpForNextLevel - xpInCurrentLevel} XP to Level {currentLevel + 1}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
                style={{ width: `${(xpInCurrentLevel / xpForNextLevel) * 100}%` }}
              />
            </div>
          </div>
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

      {/* Top Stats Row - 4 cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl p-4 card-dark border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total XP</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">+{Math.floor(Math.random() * 50 + 10)} today</p>
        </div>

        <div className="rounded-xl p-4 card-dark border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold">{stats?.streak_days ?? 0} Days</p>
          <p className="text-xs text-muted-foreground mt-1">Personal best: {Math.max(stats?.streak_days ?? 0, 7)}</p>
        </div>

        <div className="rounded-xl p-4 card-dark border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Solved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold">{progress?.completed_tasks ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">{progress?.completion_rate ?? 0}% completion</p>
        </div>

        <div className="rounded-xl p-4 card-dark border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Interviews</span>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold">{progress?.total_interviews ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg: {progress?.average_interview_score ?? 78}/100</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column - 2/3 width */}
        <div className="space-y-5 lg:col-span-2">
          {/* Today's Plan */}
          <div className="rounded-2xl p-5 sm:p-6 card-dark border border-border">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="heading-md font-semibold">Today&apos;s Plan</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
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
                      className={`flex items-start gap-3 rounded-lg border p-3.5 transition-all hover:shadow-md ${
                        task.completed
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:border-primary/30"
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
            <div className="rounded-2xl p-5 sm:p-6 card-dark border border-border">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="heading-md font-semibold">Skill Analysis</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your current proficiency vs target role</p>
                </div>
                <Brain className="h-5 w-5 text-primary" />
              </div>
              
              {/* Radar Chart */}
              <RadarChart skills={stats.skill_levels} />
            </div>
          )}

          {/* Performance Chart */}
          <div className="rounded-2xl p-5 sm:p-6 card-dark border border-border">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="heading-md font-semibold">Performance Trend</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Last 7 days activity</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <PerformanceChart />
          </div>

          {/* Activity Heatmap - GitHub style */}
          <ActivityHeatmap stats={stats} />
        </div>

        {/* Right column - 1/3 width */}
        <div className="space-y-4">
          {/* Achievements */}
          <div className="rounded-xl p-5 card-dark border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Achievements</h3>
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              <AchievementBadge
                icon={<Flame className="h-5 w-5" />}
                title="Fire Starter"
                description="5 day streak"
                earned={true}
                color="bg-amber-500/15 text-amber-500"
              />
              <AchievementBadge
                icon={<Code2 className="h-5 w-5" />}
                title="Code Warrior"
                description="50 problems solved"
                earned={progress?.completed_tasks ?? 0 >= 50}
                color="bg-primary/15 text-primary"
              />
              <AchievementBadge
                icon={<Star className="h-5 w-5" />}
                title="Interview Pro"
                description="10 interviews completed"
                earned={progress?.total_interviews ?? 0 >= 10}
                color="bg-blue-500/15 text-blue-500"
              />
              <AchievementBadge
                icon={<Zap className="h-5 w-5" />}
                title="Speed Demon"
                description="Complete 3 tasks in 1 day"
                earned={false}
                color="bg-purple-500/15 text-purple-500"
              />
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="rounded-xl p-5 card-dark border border-border">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">This Week</h3>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-3">
              <StatItem
                label="Problems Solved"
                value={42}
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              />
              <StatItem
                label="Study Hours"
                value="12.5"
                icon={<Clock className="h-4 w-4 text-blue-500" />}
              />
              <StatItem
                label="XP Gained"
                value={485}
                icon={<Sparkles className="h-4 w-4 text-primary" />}
              />
              <StatItem
                label="Tasks Completed"
                value={completedTasks}
                icon={<Target className="h-4 w-4 text-amber-500" />}
              />
            </div>
          </div>

          {/* Mock Interview Score */}
          <div className="rounded-xl p-5 card-dark relative overflow-hidden border border-border">
            <div className="absolute right-0 top-0 text-6xl opacity-5">
              <Award />
            </div>
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Mock Interview</span>
                <Award className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                {progress?.average_interview_score ?? 78}<span className="text-lg text-muted-foreground">/100</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Average performance score</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-amber-500"
                  style={{ width: `${progress?.average_interview_score ?? 78}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
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
            <QuickAction
              href="/dashboard/roadmap"
              icon={<Map className="h-4 w-4" />}
              title="Roadmap"
              description="View learning path"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityHeatmap({ stats }: { stats: DashboardStats | null }) {
  // Generate last 12 weeks of activity data (84 days)
  const weeks = 12;
  const daysPerWeek = 7;
  const today = new Date();
  
  const activityData: { date: Date; count: number; level: number }[] = [];
  
  for (let week = weeks - 1; week >= 0; week--) {
    for (let day = daysPerWeek - 1; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (week * daysPerWeek + day));
      
      // Generate semi-random activity (higher recent activity)
      const recencyBonus = week < 2 ? 2 : 1;
      const count = Math.floor(Math.random() * 8 * recencyBonus);
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
      
      activityData.push({ date, count, level });
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-muted";
      case 1: return "bg-primary/20";
      case 2: return "bg-primary/40";
      case 3: return "bg-primary/60";
      case 4: return "bg-primary";
      default: return "bg-muted";
    }
  };

  return (
    <div className="rounded-2xl p-5 sm:p-6 card-dark border border-border">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="heading-md font-semibold">Activity</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{activityData.filter(d => d.count > 0).length} days active in the last 12 weeks</p>
        </div>
        <Flame className="h-5 w-5 text-amber-500" />
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
          {activityData.map((day, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)} transition-all hover:ring-2 hover:ring-primary cursor-pointer`}
              title={`${day.date.toLocaleDateString()}: ${day.count} tasks`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-primary/20" />
          <div className="h-3 w-3 rounded-sm bg-primary/40" />
          <div className="h-3 w-3 rounded-sm bg-primary/60" />
          <div className="h-3 w-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function PerformanceChart() {
  // Mock data for last 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [65, 72, 68, 85, 78, 82, 88];
  const maxValue = Math.max(...data);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary to-amber-500 transition-all hover:opacity-80 cursor-pointer relative group"
                style={{ height: `${(value / maxValue) * 100}%`, minHeight: '8px' }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  {value}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{days[i]}</span>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">Daily Score</span>
        </div>
        <span className="font-semibold text-primary">+12% from last week</span>
      </div>
    </div>
  );
}

function AchievementBadge({
  icon,
  title,
  description,
  earned,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
        earned
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "border-border bg-background/50 opacity-60 hover:opacity-80"
      }`}
    >
      <div className={`rounded-lg p-2 ${color} ${!earned && "grayscale"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {earned && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold">{value}</span>
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
