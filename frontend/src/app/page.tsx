"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  GraduationCap,
  Target,
  CalendarCheck,
  MessageSquare,
  FileSearch,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "AI Roadmap Generation",
    description:
      "Get a personalized weekly roadmap based on your profile, skills, and target role, powered by Amazon Bedrock.",
  },
  {
    icon: CalendarCheck,
    title: "Daily Action Plans",
    description:
      "Bite-sized daily tasks with time estimates, balanced across theory, coding practice, and interview prep.",
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "AI-powered interview simulation with role-specific questions, evaluation, and detailed feedback.",
  },
  {
    icon: FileSearch,
    title: "JD Skill-Gap Analysis",
    description:
      "Paste any job description and instantly see how your skills stack up against the requirements.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Access content in Hindi, Tamil, Telugu, Bengali, and Marathi with technical terms preserved in English.",
  },
  {
    icon: GraduationCap,
    title: "Progress Dashboard",
    description:
      "Track your journey with skill radar charts, streak counters, completion stats, and readiness scores.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background cyber-page">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md cyber-panel-soft">
        <div className="cyber-container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold sm:text-xl">Campus-to-Hire</span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium cyber-button"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium cyber-button"
                >
                  Get Started
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium cyber-pill">
            <Sparkles className="h-4 w-4" />
            AI-Powered Campus Placement Prep
          </div>
          <h1 className="cyber-heading-xl font-extrabold">
            Your Personalized Path to{" "}
            <span className="cyber-title">
              Getting Hired
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground cyber-copy">
            Whether you&apos;re from a Tier-1 IIT or a Tier-3 college, Campus-to-Hire
            creates a personalized roadmap, daily tasks, mock interviews, and
            skill-gap analysis, all in your preferred language.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold cyber-button"
            >
              {user ? "Go to Dashboard" : "Start Free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="cyber-container px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-16 text-center">
          <h2 className="cyber-heading-lg font-bold">
            Everything You Need to Be Job-Ready
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground cyber-copy">
            Built on AWS with Amazon Bedrock AI, personalized for every student.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl p-5 sm:p-6 cyber-panel cyber-panel-hover"
            >
              <div className="mb-4 inline-flex rounded-xl border border-primary/25 bg-primary/10 p-3 text-primary shadow-[0_0_20px_var(--neon-green-glow)]">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">{f.title}</h3>
              <p className="cyber-copy text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8 sm:px-6 lg:px-8 cyber-panel-soft">
        <div className="cyber-container flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Campus-to-Hire 2026
          </div>
          <div className="text-sm text-muted-foreground">
            Built for students and developers
          </div>
        </div>
      </footer>
    </div>
  );
}
