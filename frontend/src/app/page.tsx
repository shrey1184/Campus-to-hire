"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
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
  Code,
  Database,
  Network,
  Cpu,
  Layout,
  Cloud,
  BrainCircuit,
  PenTool,
  Users,
  BarChart3,
  Briefcase,
  BookOpen,
  Lightbulb,
  Trophy,
  type LucideIcon,
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

/* ── Browse-by-category section (myScheme-style) ────────────── */
type CategoryTab = "topics" | "roles" | "companies";

interface CategoryItem {
  icon: LucideIcon;
  count: number;
  unit: string;
  label: string;
  color: string; // tailwind text-color class for the icon
  bg: string;    // tailwind bg-color class for the icon bubble
}

const CATEGORY_TABS: { key: CategoryTab; label: string }[] = [
  { key: "topics", label: "By Topic" },
  { key: "roles", label: "By Role" },
  { key: "companies", label: "By Company" },
];

const CATEGORIES: Record<CategoryTab, CategoryItem[]> = {
  topics: [
    { icon: Code,          count: 450, unit: "Problems",  label: "Data Structures\n& Algorithms",     color: "text-emerald-600 dark:text-emerald-400",  bg: "bg-emerald-100 dark:bg-emerald-500/15" },
    { icon: BrainCircuit,  count: 120, unit: "Concepts",  label: "System Design",                     color: "text-violet-600 dark:text-violet-400",    bg: "bg-violet-100 dark:bg-violet-500/15" },
    { icon: Cpu,           count: 85,  unit: "Topics",    label: "Operating\nSystems",                color: "text-sky-600 dark:text-sky-400",           bg: "bg-sky-100 dark:bg-sky-500/15" },
    { icon: Database,      count: 95,  unit: "Queries",   label: "Database\n& SQL",                   color: "text-amber-600 dark:text-amber-400",       bg: "bg-amber-100 dark:bg-amber-500/15" },
    { icon: Network,       count: 70,  unit: "Topics",    label: "Computer\nNetworks",                color: "text-cyan-600 dark:text-cyan-400",         bg: "bg-cyan-100 dark:bg-cyan-500/15" },
    { icon: Layout,        count: 200, unit: "Resources",  label: "Web\nDevelopment",                  color: "text-rose-600 dark:text-rose-400",         bg: "bg-rose-100 dark:bg-rose-500/15" },
    { icon: Cloud,         count: 60,  unit: "Labs",      label: "Cloud\nComputing",                  color: "text-blue-600 dark:text-blue-400",         bg: "bg-blue-100 dark:bg-blue-500/15" },
    { icon: BarChart3,     count: 150, unit: "Questions", label: "Aptitude\n& Reasoning",             color: "text-orange-600 dark:text-orange-400",     bg: "bg-orange-100 dark:bg-orange-500/15" },
    { icon: MessageSquare, count: 80,  unit: "Sessions",  label: "Mock\nInterviews",                  color: "text-indigo-600 dark:text-indigo-400",     bg: "bg-indigo-100 dark:bg-indigo-500/15" },
    { icon: PenTool,       count: 40,  unit: "Templates", label: "Resume\nBuilding",                  color: "text-pink-600 dark:text-pink-400",         bg: "bg-pink-100 dark:bg-pink-500/15" },
    { icon: Users,         count: 110, unit: "Questions", label: "Behavioral\n& HR Prep",             color: "text-teal-600 dark:text-teal-400",         bg: "bg-teal-100 dark:bg-teal-500/15" },
    { icon: Lightbulb,     count: 90,  unit: "Projects",  label: "Projects\n& Portfolios",            color: "text-yellow-600 dark:text-yellow-400",     bg: "bg-yellow-100 dark:bg-yellow-500/15" },
    { icon: Globe,         count: 65,  unit: "Resources", label: "Communication\nSkills",             color: "text-lime-600 dark:text-lime-400",         bg: "bg-lime-100 dark:bg-lime-500/15" },
    { icon: BookOpen,      count: 180, unit: "Notes",     label: "Core CS\nSubjects",                 color: "text-fuchsia-600 dark:text-fuchsia-400",   bg: "bg-fuchsia-100 dark:bg-fuchsia-500/15" },
    { icon: Trophy,        count: 300, unit: "Challenges",label: "Competitive\nProgramming",          color: "text-red-600 dark:text-red-400",           bg: "bg-red-100 dark:bg-red-500/15" },
  ],
  roles: [
    { icon: Code,          count: 520, unit: "Resources", label: "Software Dev\nEngineer (SDE)",      color: "text-emerald-600 dark:text-emerald-400",  bg: "bg-emerald-100 dark:bg-emerald-500/15" },
    { icon: Database,      count: 180, unit: "Resources", label: "Data\nAnalyst",                     color: "text-amber-600 dark:text-amber-400",       bg: "bg-amber-100 dark:bg-amber-500/15" },
    { icon: BrainCircuit,  count: 210, unit: "Resources", label: "ML / AI\nEngineer",                 color: "text-violet-600 dark:text-violet-400",    bg: "bg-violet-100 dark:bg-violet-500/15" },
    { icon: Layout,        count: 170, unit: "Resources", label: "Frontend\nDeveloper",               color: "text-rose-600 dark:text-rose-400",         bg: "bg-rose-100 dark:bg-rose-500/15" },
    { icon: Cloud,         count: 140, unit: "Resources", label: "Cloud &\nDevOps",                   color: "text-blue-600 dark:text-blue-400",         bg: "bg-blue-100 dark:bg-blue-500/15" },
    { icon: Cpu,           count: 95,  unit: "Resources", label: "Embedded\nSystems",                 color: "text-sky-600 dark:text-sky-400",           bg: "bg-sky-100 dark:bg-sky-500/15" },
    { icon: BarChart3,     count: 160, unit: "Resources", label: "Business\nAnalyst",                 color: "text-orange-600 dark:text-orange-400",     bg: "bg-orange-100 dark:bg-orange-500/15" },
    { icon: Network,       count: 110, unit: "Resources", label: "Network\nEngineer",                 color: "text-cyan-600 dark:text-cyan-400",         bg: "bg-cyan-100 dark:bg-cyan-500/15" },
    { icon: FileSearch,    count: 130, unit: "Resources", label: "QA / Test\nEngineer",               color: "text-teal-600 dark:text-teal-400",         bg: "bg-teal-100 dark:bg-teal-500/15" },
    { icon: Briefcase,     count: 200, unit: "Resources", label: "Product\nManager",                  color: "text-indigo-600 dark:text-indigo-400",     bg: "bg-indigo-100 dark:bg-indigo-500/15" },
  ],
  companies: [
    { icon: Briefcase, count: 320, unit: "Questions", label: "Google",         color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-500/15" },
    { icon: Briefcase, count: 290, unit: "Questions", label: "Amazon",         color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-500/15" },
    { icon: Briefcase, count: 260, unit: "Questions", label: "Microsoft",      color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-100 dark:bg-cyan-500/15" },
    { icon: Briefcase, count: 180, unit: "Questions", label: "Flipkart",       color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-500/15" },
    { icon: Briefcase, count: 150, unit: "Questions", label: "Goldman\nSachs",  color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/15" },
    { icon: Briefcase, count: 200, unit: "Questions", label: "TCS / Infosys",  color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-100 dark:bg-teal-500/15" },
    { icon: Briefcase, count: 170, unit: "Questions", label: "Adobe",          color: "text-red-600 dark:text-red-400",        bg: "bg-red-100 dark:bg-red-500/15" },
    { icon: Briefcase, count: 140, unit: "Questions", label: "Uber",           color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/15" },
    { icon: Briefcase, count: 130, unit: "Questions", label: "Walmart",        color: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-100 dark:bg-sky-500/15" },
    { icon: Briefcase, count: 160, unit: "Questions", label: "Deloitte",       color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-100 dark:bg-violet-500/15" },
  ],
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryTab>("topics");
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-background page-base">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
        <div className="container-main flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {mounted && !loading && (
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
              `linear-gradient(var(--hero-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid-line) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />
        <div className="mx-auto w-full max-w-7xl">
          {/* ── Main Hero Card ── */}
          <div
            className="relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl"
            style={{ background: "var(--hero-bg)", borderColor: "var(--hero-border)" }}
          >

            {/* ── Top bar: badge + auth buttons ── */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-black shrink-0"
                  style={{ background: "var(--hero-badge-bg)", color: "var(--hero-badge-text)" }}
                >
                  0.1
                </span>
                <span
                  className="text-[0.65rem] sm:text-xs font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--hero-subtitle-text)" }}
                >
                  AI-Powered Campus Placement Prep
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 rounded-full border text-xs sm:text-sm font-semibold tracking-wide transition-colors"
                  style={{
                    background: "var(--hero-login-bg)",
                    borderColor: "var(--hero-login-border)",
                    color: "var(--hero-login-text)",
                  }}
                >
                  LOGIN
                </Link>
                <Link
                  href="/login"
                  className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-black tracking-wide transition-colors"
                  style={{ background: "var(--hero-cta-bg)", color: "var(--hero-cta-text)" }}
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
                    className="uppercase leading-[0.88] tracking-tight select-none"
                    style={{
                      fontFamily: "var(--font-playfair), 'Georgia', serif",
                      fontSize: "clamp(3.4rem, 9vw, 7.5rem)",
                      fontWeight: 900,
                      color: "var(--hero-title-text)",
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
                  <div
                    className="flex-1 h-[3px] rounded-full overflow-hidden"
                    style={{ background: "var(--hero-progress-track)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: "62%", background: "var(--hero-progress-fill)" }}
                    />
                  </div>
                  <div
                    className="h-5 w-5 rounded-full shrink-0"
                    style={{
                      background: "var(--hero-progress-fill)",
                      boxShadow: `0 0 10px var(--hero-dot-glow)`,
                    }}
                  />
                </div>
              </div>

              {/* Right — description card */}
              <div
                className="lg:w-[19rem] xl:w-[21rem] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-lg"
                style={{ background: "var(--hero-card-bg)", color: "var(--hero-card-text)" }}
              >
                <div>
                  <h2
                    className="text-lg sm:text-xl font-extrabold leading-snug mb-3"
                    style={{ fontFamily: "var(--font-playfair), 'Georgia', serif", color: "var(--hero-card-text)" }}
                  >
                    What is Campus for Hire?
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--hero-card-subtitle)" }}>
                    Campus for Hire is your AI-powered companion for campus placements.
                    It builds a personalized weekly roadmap, daily action plans, mock
                    interviews, and skill-gap analysis — available in your preferred
                    language.
                  </p>
                </div>
                <div className="flex justify-end mt-5">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="h-10 w-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "var(--hero-card-btn-bg)", color: "var(--hero-card-btn-text)" }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Bottom: action icons + view more ── */}
            <div
              className="flex items-center justify-between mt-7 pt-5 border-t"
              style={{ borderColor: "var(--hero-bottom-border)" }}
            >
              <div className="flex items-center gap-3">
                <button
                  aria-label="Like"
                  className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
                  style={{
                    borderColor: "var(--hero-action-border)",
                    color: "var(--hero-action-text)",
                  }}
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  aria-label="Save"
                  className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
                  style={{
                    borderColor: "var(--hero-action-border)",
                    color: "var(--hero-action-text)",
                  }}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  aria-label="Share"
                  className="h-10 w-10 rounded-full border flex items-center justify-center transition-colors"
                  style={{
                    borderColor: "var(--hero-action-border)",
                    color: "var(--hero-action-text)",
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="flex items-center gap-2.5 text-sm font-semibold tracking-wide hover:text-[var(--accent)] transition-colors group"
                style={{ color: "var(--hero-action-text)" }}
              >
                View more
                <span
                  className="h-8 w-8 rounded-full border flex items-center justify-center transition-colors"
                  style={{ borderColor: "var(--hero-action-border)" }}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by Category (myScheme-style grid) ─────────────── */}
      <section className="container-main px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        {/* Tabs */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-2 text-sm sm:text-base font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div className="mb-12 text-center">
          <h2
            className="heading-lg"
            style={{ fontFamily: "var(--font-playfair), 'Georgia', serif" }}
          >
            Find prep resources based
            <br className="hidden sm:block" />
            {" "}on categories
          </h2>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6">
          {CATEGORIES[activeTab].map((cat) => (
            <Link
              key={cat.label}
              href={user ? "/dashboard" : "/login"}
              className="group flex flex-col items-center gap-3 rounded-2xl p-5 sm:p-6 text-center transition card-dark card-interactive"
            >
              {/* Icon bubble */}
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.bg} transition-transform group-hover:scale-110`}>
                <cat.icon className={`h-7 w-7 ${cat.color}`} />
              </div>

              {/* Count */}
              <p className="text-sm font-bold">
                <span className="text-primary">{cat.count}</span>{" "}
                <span className="text-muted-foreground font-medium">{cat.unit}</span>
              </p>

              {/* Label */}
              <p className="text-sm font-semibold leading-tight whitespace-pre-line">
                {cat.label}
              </p>
            </Link>
          ))}
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
