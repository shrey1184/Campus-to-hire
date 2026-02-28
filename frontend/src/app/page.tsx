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
  LogIn,
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

const steps = [
  { num: "01", title: "Create Profile", desc: "Tell us about your education, skills, and target role." },
  { num: "02", title: "Get Your Roadmap", desc: "AI generates a personalized weekly learning path for you." },
  { num: "03", title: "Practice Daily", desc: "Follow bite-sized tasks, mock interviews, and coding exercises." },
  { num: "04", title: "Get Hired", desc: "Track your progress and ace your campus placement interviews." },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background page-base">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="container-main flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Campus-to-Hire</span>
          </div>
          <div className="flex items-center gap-3">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  className="rounded-full px-5 py-2 text-sm font-semibold btn-accent"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium btn-outline"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Login
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full px-5 py-2 text-sm font-semibold btn-accent"
                  >
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 pill-badge">
            <Sparkles className="h-4 w-4" />
            AI-Powered Campus Placement Prep
          </div>
          <h1 className="heading-xl">
            Your Personalized Path to{" "}
            <span className="text-gradient">
              Getting Hired
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-secondary-foreground body-text">
            Whether you&apos;re from a Tier-1 IIT or a Tier-3 college, Campus-to-Hire
            creates a personalized roadmap, daily tasks, mock interviews, and
            skill-gap analysis — all in your preferred language.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-semibold btn-accent"
            >
              {user ? "Go to Dashboard" : "Start Free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!user && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-base font-medium btn-outline"
              >
                Learn More
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-main px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-14 text-center">
          <h2 className="heading-lg">
            Everything You Need to Be Job-Ready
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-secondary-foreground body-text">
            Built on AWS with Amazon Bedrock AI, personalized for every student.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl p-5 sm:p-6 card-dark card-interactive"
            >
              <div className="mb-4 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold sm:text-lg">{f.title}</h3>
              <p className="body-text text-secondary-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — numbered timeline like reference */}
      <section className="container-main px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-14 text-center">
          <h2 className="heading-lg">How It Works</h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary-foreground body-text">
            From zero to interview-ready in four simple steps.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="rounded-2xl p-5 card-dark card-interactive">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {s.num}
              </span>
              <h3 className="mb-1.5 text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-secondary-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container-main flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-secondary-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Campus-to-Hire</span>
            <span className="text-muted-foreground">© 2026</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Built for students, by developers
          </div>
        </div>
      </footer>
    </div>
  );
}
