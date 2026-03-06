"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/Logo";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// Aceternity Components
import { AuroraBackground } from "@/components/aceternity/AuroraBackground";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Spotlight } from "@/components/aceternity/Spotlight";
import { MovingBorder, MovingBorderButton } from "@/components/aceternity/MovingBorder";

// Magic Components
import { NumberTicker } from "@/components/magic/NumberTicker";
import { AnimatedGradientText } from "@/components/magic/AnimatedGradientText";
import { BlurFade, BlurFadeContainer } from "@/components/magic/BlurFade";
import { Marquee } from "@/components/magic/Marquee";
import { ShimmerButton } from "@/components/magic/ShimmerButton";

import {
  GraduationCap,
  Target,
  CalendarCheck,
  MessageSquare,
  FileSearch,
  Globe,
  ArrowRight,
  LogIn,
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
  Sparkles,
  Zap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA STRUCTURES (Preserved from original)
// ─────────────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Target,
    title: "AI Roadmap Generation",
    description:
      "Get a personalized weekly roadmap based on your profile, skills, and target role, powered by Amazon Bedrock.",
    size: "large" as const,
  },
  {
    icon: CalendarCheck,
    title: "Daily Action Plans",
    description:
      "Bite-sized daily tasks with time estimates, balanced across theory, coding practice, and interview prep.",
    size: "small" as const,
  },
  {
    icon: MessageSquare,
    title: "Mock Interviews",
    description:
      "AI-powered interview simulation with role-specific questions, evaluation, and detailed feedback.",
    size: "small" as const,
  },
  {
    icon: FileSearch,
    title: "JD Skill-Gap Analysis",
    description:
      "Paste any job description and instantly see how your skills stack up against the requirements.",
    size: "medium" as const,
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Access content in Hindi, Tamil, Telugu, Bengali, and Marathi with technical terms preserved in English.",
    size: "medium" as const,
  },
  {
    icon: GraduationCap,
    title: "Progress Dashboard",
    description:
      "Track your journey with skill radar charts, streak counters, completion stats, and readiness scores.",
    size: "large" as const,
  },
];

const steps = [
  { num: "01", title: "Create Profile", desc: "Tell us about your education, skills, and target role." },
  { num: "02", title: "Get Your Roadmap", desc: "AI generates a personalized weekly learning path for you." },
  { num: "03", title: "Practice Daily", desc: "Follow bite-sized tasks, mock interviews, and coding exercises." },
  { num: "04", title: "Get Hired", desc: "Track your progress and ace your campus placement interviews." },
];

/* ── Browse-by-category section ────────────── */
type CategoryTab = "topics" | "roles" | "companies";

interface CategoryItem {
  icon: LucideIcon;
  count: number;
  unit: string;
  label: string;
  color: string;
  bg: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MagneticButton({ 
  children, 
  className = "", 
  href 
}: { 
  children: React.ReactNode; 
  className?: string;
  href?: string;
}) {
  const Component = href ? motion(Link) : motion.button;
  
  return (
    <Component
      href={href}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </Component>
  );
}

function OrbitNumber({ num, delay = 0 }: { num: string; delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15, 
        delay 
      }}
      className="relative"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-[var(--accent)]/30"
      />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-lg font-bold text-[var(--text-inverse)]">
        {num}
      </span>
    </motion.div>
  );
}

function AnimatedLine({ progress }: { progress: any }) {
  return (
    <div className="absolute top-8 left-0 right-0 h-0.5 bg-[var(--border-default)] hidden lg:block">
      <motion.div
        className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)]"
        style={{ width: progress }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({ user, loading }: { user: any; loading: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AuroraBackground className="min-h-screen">
      {/* Spotlight Effect */}
      <Spotlight className="hidden md:block" fill="rgba(201, 168, 76, 0.12)" />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-default)]/40 bg-[var(--bg-base)]/80 backdrop-blur-xl"
      >
        <div className="container-main flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            {mounted && !loading && (
              user ? (
                <MagneticButton href="/dashboard">
                  <ShimmerButton>Dashboard</ShimmerButton>
                </MagneticButton>
              ) : (
                <>
                  <MagneticButton href="/login" className="hidden sm:inline-flex">
                    <motion.span
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Login
                    </motion.span>
                  </MagneticButton>
                  <MagneticButton href="/login">
                    <ShimmerButton>Get Started</ShimmerButton>
                  </MagneticButton>
                </>
              )
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="mx-auto w-full max-w-6xl text-center">
          {/* Floating Badge */}
          <BlurFade delay={0.1}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <AnimatedGradientText className="text-sm font-medium">
                AI-Powered Campus Placement Prep
              </AnimatedGradientText>
            </div>
          </BlurFade>

          {/* Main Headline with Text Generate Effect */}
          <div className="mb-6">
            <TextGenerateEffect
              words="CAMPUS FOR HIRE"
              className="text-5xl font-black tracking-tight text-[var(--text-primary)] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
              delay={0.3}
            />
          </div>

          {/* Subtitle */}
          <BlurFade delay={0.8}>
            <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)] sm:text-xl mb-10">
              Your AI-powered companion for campus placements. Personalized roadmaps, 
              mock interviews, and skill-gap analysis — in your preferred language.
            </p>
          </BlurFade>

          {/* CTA Buttons with Magnetic Effect */}
          <BlurFade delay={1}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <MagneticButton href={user ? "/dashboard" : "/login"}>
                <motion.div
                  className="group relative overflow-hidden rounded-full bg-[var(--accent)] px-8 py-4 text-base font-bold text-[var(--text-inverse)] shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative flex items-center gap-2">
                    Start Your Journey
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.div>
              </MagneticButton>
              
              <MagneticButton href="/login">
                <motion.span
                  className="flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-4 text-base font-semibold text-[var(--text-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="h-5 w-5 text-[var(--accent)]" />
                  Watch Demo
                </motion.span>
              </MagneticButton>
            </div>
          </BlurFade>

          {/* Stats Strip with NumberTicker */}
          <BlurFade delay={1.2}>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">
                  <NumberTicker value={10000} />+
                </div>
                <div className="text-sm text-[var(--text-muted)]">Students</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-[var(--border-default)]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">
                  <NumberTicker value={450} />+
                </div>
                <div className="text-sm text-[var(--text-muted)]">Problems</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-[var(--border-default)]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold">
                  <NumberTicker value={6} />
                </div>
                <div className="text-sm text-[var(--text-muted)]">Languages</div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="h-8 w-5 rounded-full border-2 border-[var(--border-default)] p-1">
            <motion.div 
              className="h-2 w-full rounded-full bg-[var(--accent)]"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

function CategorySection({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<CategoryTab>("topics");

  return (
    <section className="relative py-24 sm:py-32">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <BlurFade>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl mb-4">
              Browse by Category
            </h2>
            <p className="mx-auto max-w-xl text-[var(--text-secondary)]">
              Find prep resources organized by topics, roles, and companies
            </p>
          </div>
        </BlurFade>

        {/* Animated Tabs */}
        <BlurFade delay={0.2}>
          <div className="relative mb-12 flex items-center justify-center gap-2 sm:gap-4">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative px-4 py-2 text-sm sm:text-base font-medium transition-colors"
              >
                <span className={activeTab === tab.key ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}>
                  {tab.label}
                </span>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-0 -bottom-1 h-0.5 bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </BlurFade>

        {/* Cards Grid with MovingBorder */}
        <motion.div 
          layout
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 lg:gap-6"
        >
          {CATEGORIES[activeTab].map((cat, index) => (
            <BlurFade key={`${activeTab}-${cat.label}`} delay={index * 0.05}>
              <Link href={user ? "/dashboard" : "/login"}>
                <MovingBorder
                  containerClassName="h-full"
                  className="h-full p-5 sm:p-6 flex flex-col items-center gap-3 text-center bg-[var(--bg-surface)]"
                  duration={4000}
                >
                  {/* Icon bubble */}
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.bg} transition-transform duration-300 group-hover:scale-110`}>
                    <cat.icon className={`h-7 w-7 ${cat.color}`} />
                  </div>

                  {/* Count */}
                  <p className="text-sm font-bold">
                    <span className="text-[var(--accent)]">{cat.count}</span>{" "}
                    <span className="text-[var(--text-muted)] font-medium">{cat.unit}</span>
                  </p>

                  {/* Label */}
                  <p className="text-sm font-semibold leading-tight whitespace-pre-line text-[var(--text-primary)]">
                    {cat.label}
                  </p>
                </MovingBorder>
              </Link>
            </BlurFade>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const getGridClass = (size: string) => {
    switch (size) {
      case "large": return "sm:col-span-2";
      case "medium": return "sm:col-span-1";
      default: return "";
    }
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-emerald-500/20 to-teal-500/20",
      "from-violet-500/20 to-purple-500/20",
      "from-amber-500/20 to-orange-500/20",
      "from-rose-500/20 to-pink-500/20",
      "from-sky-500/20 to-blue-500/20",
      "from-lime-500/20 to-green-500/20",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="relative py-24 sm:py-32 bg-[var(--bg-surface)]/50">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <BlurFade>
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl mb-4">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-xl text-[var(--text-secondary)]">
              Built on AWS with Amazon Bedrock AI, personalized for every student
            </p>
          </div>
        </BlurFade>

        {/* Bento Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => (
            <BlurFade key={feature.title} delay={index * 0.1} className={getGridClass(feature.size)}>
              <motion.div
                className={`group relative h-full overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 sm:p-8 ${getGridClass(feature.size)}`}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                
                <div className="relative">
                  {/* Icon */}
                  <motion.div 
                    className="mb-4 inline-flex rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-3 text-[var(--accent)]"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="h-6 w-6" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow Link */}
                  <motion.div 
                    className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </div>
              </motion.div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const lineProgress = useTransform(scrollYProgress, [0.2, 0.8], ["0%", "100%"]);
  const smoothProgress = useSpring(lineProgress, { stiffness: 100, damping: 30 });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 overflow-hidden">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <BlurFade>
          <div className="mb-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl mb-4">
              How It Works
            </h2>
            <p className="mx-auto max-w-xl text-[var(--text-secondary)]">
              From zero to interview-ready in four simple steps
            </p>
          </div>
        </BlurFade>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Connecting Line (Desktop) */}
          <AnimatedLine progress={smoothProgress} />

          {/* Steps */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <BlurFade key={step.num} delay={index * 0.15}>
                <motion.div
                  className="relative flex flex-col items-center text-center"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {/* Step Number with Orbit Animation */}
                  <div className="mb-6">
                    <OrbitNumber num={step.num} delay={index * 0.2} />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
                    {step.desc}
                  </p>

                  {/* Connecting Arrow (except last) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="hidden lg:block absolute top-8 -right-4 text-[var(--accent)]"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  )}
                </motion.div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const companies = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", 
    "Netflix", "Uber", "Airbnb", "LinkedIn", "Adobe"
  ];

  return (
    <footer className="relative border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
      {/* Company Logos Marquee */}
      <div className="py-12 border-b border-[var(--border-default)]">
        <BlurFade>
          <p className="text-center text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest mb-8">
            Trusted by students hired at
          </p>
        </BlurFade>
        <Marquee speed="slow" pauseOnHover>
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center px-8 py-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)]"
            >
              <span className="text-lg font-semibold text-[var(--text-secondary)]">
                {company}
              </span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Bottom Footer */}
      <div className="container-main px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-sm text-[var(--text-muted)]">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Contact
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <TrendingUp className="h-4 w-4 text-[var(--accent)]" />
            Built for students, by developers
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      <HeroSection user={user} loading={loading} />
      <CategorySection user={user} />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
