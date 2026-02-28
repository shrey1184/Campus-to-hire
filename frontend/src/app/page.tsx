"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/Logo";
import {
  GraduationCap,
  Target,
  CalendarCheck,
  MessageSquare,
  FileSearch,
  Globe,
  ArrowRight,
  LogIn,
  Heart,
  Bookmark,
  Share2,
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
          <Logo size="md" />
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
      <section className="relative flex flex-col justify-center min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6">
        {/* Grid background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        <div className="mx-auto w-full max-w-7xl">
          {/* ── Main Hero Card ── */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-[#1f1f1f] p-6 sm:p-8 shadow-2xl">

            {/* ── Top bar: badge + auth buttons ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black text-xs font-black shrink-0">
                  0.1
                </span>
                <span className="text-[0.65rem] sm:text-xs font-semibold tracking-[0.18em] text-[#707070] uppercase">
                  AI-Powered Campus Placement Prep
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 rounded-full bg-[#1a1a1a] border border-[#2e2e2e] text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#252525] transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 rounded-full bg-white text-black text-xs sm:text-sm font-black tracking-wide hover:bg-gray-100 transition-colors"
                >
                  GET STARTED
                </Link>
              </div>
            </div>

            {/* ── Content: title left, description card right ── */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">

              {/* Left — serif title */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h1
                    className="text-white uppercase leading-[0.88] tracking-tight select-none"
                    style={{
                      fontFamily: "var(--font-playfair), 'Georgia', serif",
                      fontSize: "clamp(3.4rem, 9vw, 7.5rem)",
                      fontWeight: 900,
                    }}
                  >
                    <span className="block">CAMPUS</span>
                    <span className="block">FOR</span>
                    {/* Highlighted word — replicates the band across "SEJARAH"/"HIRE" in the image */}
                    <span className="relative inline-block mt-1">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-sm"
                        style={{
                          background: "rgba(201,168,76,0.22)",
                          top: "18%",
                          bottom: "14%",
                          left: "-4px",
                          right: "-4px",
                        }}
                      />
                      <span className="relative z-10">HIRE</span>
                    </span>
                  </h1>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-8 lg:mt-10">
                  <div className="flex-1 h-[3px] bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: "62%" }}
                    />
                  </div>
                  <div className="h-5 w-5 rounded-full bg-white shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.35)]" />
                </div>
              </div>

              {/* Right — white description card */}
              <div className="lg:w-[19rem] xl:w-[21rem] bg-white rounded-2xl p-5 sm:p-6 text-black flex flex-col justify-between shadow-lg">
                <div>
                  <h2
                    className="text-lg sm:text-xl font-extrabold leading-snug mb-3 text-black"
                    style={{ fontFamily: "var(--font-playfair), 'Georgia', serif" }}
                  >
                    What is Campus for Hire?
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600">
                    Campus for Hire is your AI-powered companion for campus placements.
                    It builds a personalized weekly roadmap, daily action plans, mock
                    interviews, and skill-gap analysis — available in your preferred
                    language.
                  </p>
                </div>
                <div className="flex justify-end mt-5">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Bottom: action icons + view more ── */}
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <button
                  aria-label="Like"
                  className="h-10 w-10 rounded-full border border-[#2e2e2e] flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  aria-label="Save"
                  className="h-10 w-10 rounded-full border border-[#2e2e2e] flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  aria-label="Share"
                  className="h-10 w-10 rounded-full border border-[#2e2e2e] flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="flex items-center gap-2.5 text-white text-sm font-semibold tracking-wide hover:text-[#c9a84c] transition-colors group"
              >
                View more
                <span className="h-8 w-8 rounded-full border border-[#2e2e2e] flex items-center justify-center group-hover:border-[#c9a84c] transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
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
          <div className="flex items-center gap-3 text-sm text-secondary-foreground">
            <Logo size="sm" />
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
