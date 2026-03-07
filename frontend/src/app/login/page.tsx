"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Briefcase,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import Link from "next/link";

// Aceternity components
import { GridBackground } from "@/components/aceternity/GridBackground";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { Spotlight } from "@/components/aceternity/Spotlight";

// Magic components
import { NumberTicker } from "@/components/magic/NumberTicker";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { GlowingOrb } from "@/components/magic/GlowingOrb";
import { AnimatedGradientText } from "@/components/magic/AnimatedGradientText";

import { ThemeToggle } from "@/components/ThemeToggle";

// Google icon SVG component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Floating preview card component
const FloatingCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute rounded-xl border border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-md p-4 shadow-xl ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: [0, -10, 0],
    }}
    transition={{
      opacity: { duration: 0.5, delay },
      y: {
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }}
  >
    {children}
  </motion.div>
);

// Animated input with focus border
const AnimatedInput = ({
  icon: Icon,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onDrag" | "onDragStart" | "onDragEnd"> & {
  icon: React.ElementType;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <motion.div
        animate={{
          borderColor: isFocused ? "var(--accent)" : "var(--border-default)",
          boxShadow: isFocused
            ? "0 0 0 3px var(--accent-subtle), 0 0 20px var(--accent-glow)"
            : "none",
        }}
        transition={{ duration: 0.2 }}
        className="rounded-lg border"
      >
        <input
          {...props}
          className="w-full rounded-lg border-0 bg-[var(--input-bg)] py-2.5 pl-10 pr-4 text-[15px] text-[var(--text-primary)] outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </motion.div>
    </div>
  );
};

// Magnetic button wrapper
const MagneticButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const email = form.email.trim();
      const password = form.password;
      const name = form.name.trim() || email.split("@")[0];

      const authResult = isLogin
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name);

      await login(authResult.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo login for quick access
  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const demoEmail = "demo@campus-hire.com";
      const demoPassword = "DemoPass123!";

      let authResult;
      try {
        authResult = await authApi.login(demoEmail, demoPassword);
      } catch {
        authResult = await authApi.register(
          demoEmail,
          demoPassword,
          "Demo Student"
        );
      }

      await login(authResult.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }/api/auth/google/login`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex min-h-screen bg-[var(--bg-base)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Left Panel - Brand Visual (60% on desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">

        {/* Theme Toggle - top right of left panel */}
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle compact />
        </div>
        <GridBackground className="h-full">
          {/* Glowing Orbs for ambient effect */}
          <GlowingOrb
            className="top-20 left-20"
            size={300}
            delay={0}
          />
          <GlowingOrb
            className="bottom-40 right-20"
            size={400}
            color="var(--accent-hover)"
            delay={2}
          />
          <GlowingOrb
            className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            size={500}
            color="var(--accent)"
            delay={1}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-16 xl:px-24">
            {/* Branding */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-[var(--text-inverse)]" />
                </div>
                <span className="text-2xl font-bold text-[var(--text-primary)]">
                  Campus for Hire
                </span>
              </div>
              <TextGenerateEffect
                words="Your Career Journey Starts Here"
                className="text-4xl xl:text-5xl font-bold text-[var(--text-primary)] leading-tight"
                delay={0.4}
              />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-lg text-[var(--text-secondary)] max-w-md mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              AI-powered interview preparation, personalized roadmaps, and job
              description analysis to help you land your dream role.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex gap-12 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div>
                <div className="text-3xl font-bold">
                  <NumberTicker value={50000} delay={1.2} />
                  <span className="text-[var(--accent)]">+</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Students Helped
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <NumberTicker value={95} delay={1.4} />
                  <span className="text-[var(--accent)]">%</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Success Rate
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <NumberTicker value={1000} delay={1.6} />
                  <span className="text-[var(--accent)]">+</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  Companies
                </div>
              </div>
            </motion.div>

            {/* Floating Preview Cards */}
            <FloatingCard
              className="top-[15%] right-[10%] w-56"
              delay={1.2}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                  <Target className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Daily Goals
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>3/4 completed</span>
                  <span>75%</span>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard
              className="top-[45%] right-[5%] w-52"
              delay={1.5}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Progress
                </span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-[var(--accent)] to-[var(--accent-hover)] opacity-80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </FloatingCard>

            <FloatingCard
              className="bottom-[20%] right-[15%] w-48"
              delay={1.8}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Next Interview
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Technical Round with Google
              </p>
              <p className="text-xs text-[var(--accent)] mt-1">
                Tomorrow, 2:00 PM
              </p>
            </FloatingCard>
          </div>
        </GridBackground>
      </div>

      {/* Right Panel - Auth Form (40% on desktop, full width on mobile) */}
      <motion.div
        className="w-full lg:w-[40%] min-h-screen flex items-center justify-center p-6 sm:p-8 relative"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Mobile-only background */}
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, var(--accent) 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
          <GlowingOrb className="top-10 right-10" size={200} />
        </div>

        {/* Mobile-only Theme Toggle */}
        <div className="lg:hidden absolute top-4 right-4 z-20">
          <ThemeToggle compact />
        </div>

        {/* Glass Card */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Spotlight className="rounded-2xl" fill="var(--accent-subtle)" />
          
          <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--glass-bg)] backdrop-blur-xl p-6 sm:p-8 shadow-2xl overflow-hidden group">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-[var(--text-inverse)]" />
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                Campus for Hire
              </span>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
                {isLogin ? (
                  <AnimatedGradientText>Welcome Back</AnimatedGradientText>
                ) : (
                  <AnimatedGradientText>Create Account</AnimatedGradientText>
                )}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {isLogin
                  ? "Sign in to continue your preparation journey"
                  : "Start your personalized placement prep"}
              </p>
            </div>

            {/* Error Message with AnimatePresence */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="mb-4 rounded-lg bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)] border border-[var(--destructive)]/30 overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                      Name
                    </label>
                    <AnimatedInput
                      icon={User}
                      type="text"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Email
                </label>
                <AnimatedInput
                  icon={Mail}
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Password
                </label>
                <AnimatedInput
                  icon={Lock}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>

              {/* Primary CTA - ShimmerButton */}
              <div className="pt-2">
                <ShimmerButton
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </ShimmerButton>
              </div>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border-default)]" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="h-px flex-1 bg-[var(--border-default)]" />
            </div>

            {/* Google OAuth Button */}
            <MagneticButton
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-lg py-2.5 text-sm font-medium border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              Continue with Google
            </MagneticButton>

            {/* Demo Login Button */}
            <MagneticButton
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Try Demo Account
            </MagneticButton>

            {/* Toggle Login/Register */}
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors underline-offset-4 hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="absolute bottom-6 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xs text-[var(--text-muted)]">
            By continuing, you agree to our{" "}
            <Link
              href="#"
              className="text-[var(--accent)] hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-[var(--accent)] hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
