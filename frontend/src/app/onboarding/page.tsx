"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { profileApi } from "@/lib/api";
import {
  COLLEGE_TIERS,
  DEGREES,
  TARGET_ROLES,
  TARGET_COMPANIES,
  SUPPORTED_LANGUAGES,
} from "@/types";
import type { UserProfileUpdate } from "@/types";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import {
  GraduationCap,
  Target,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import Logo from "@/components/Logo";

const STEPS = [
  { title: "Background", icon: GraduationCap, description: "Tell us about your education" },
  { title: "Skills", icon: Target, description: "Assess your current skills" },
  { title: "Goals", icon: Target, description: "Set your career targets" },
  { title: "Preferences", icon: Clock, description: "Customize your experience" },
];

const SKILL_CATEGORIES = [
  { id: "dsa", label: "Data Structures & Algorithms" },
  { id: "programming", label: "Programming (Java/Python/C++)" },
  { id: "system_design", label: "System Design" },
  { id: "database", label: "Databases & SQL" },
  { id: "os", label: "Operating Systems" },
  { id: "networking", label: "Computer Networks" },
  { id: "web_dev", label: "Web Development" },
  { id: "cloud", label: "Cloud Computing" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    college: "",
    college_tier: "tier2",
    degree: "B.Tech",
    major: "",
    current_year: 4,
    is_cs_background: true,
    target_role: "sde",
    target_companies: [] as string[],
    hours_per_day: 4,
    days_per_week: 5,
    preferred_language: "en",
    skills: {} as Record<string, { level: number; category: string }>,
  });

  const updateField = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCompany = (company: string) => {
    setForm((prev) => {
      const companies = prev.target_companies.includes(company)
        ? prev.target_companies.filter((c) => c !== company)
        : prev.target_companies.length < 5
          ? [...prev.target_companies, company]
          : prev.target_companies;
      return { ...prev, target_companies: companies };
    });
  };

  const setSkillLevel = (skillId: string, level: number) => {
    setForm((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [skillId]: { level, category: skillId },
      },
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const update: UserProfileUpdate = {
        ...form,
        onboarding_completed: true,
      };
      await profileApi.update(update);
      await refreshUser();
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    switch (step) {
      case 0:
        return form.college.trim() !== "" && form.major.trim() !== "";
      case 1:
        return Object.keys(form.skills).length >= 3;
      case 2:
        return form.target_role !== "" && form.target_companies.length > 0;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    setDirection(1);
    setStep((current) => Math.min(STEPS.length - 1, current + 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((current) => Math.max(0, current - 1));
  };

  return (
    <div className="page-base min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <BlurFade delay={0.05}>
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <Logo size="md" linked />
            </div>
            <h1 className="heading-lg font-bold">Set Up Your Profile</h1>
            <p className="body-text mt-1 text-muted-foreground">
              Complete in under 10 minutes. This helps us personalize your roadmap.
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.1}>
          <div className="mb-8">
            <div className="relative mx-auto flex max-w-2xl items-center justify-between gap-2">
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
              <motion.div
                className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-primary to-amber-500"
                initial={false}
                animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              />
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    {i === step && (
                      <motion.div
                        layoutId="onboarding-active-step"
                        className="absolute inset-0 rounded-full bg-primary shadow-[0_0_24px_var(--accent-glow)]"
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      />
                    )}
                    <div
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                        i <= step ? "text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                  </div>
                  <span className={`hidden text-[11px] font-medium sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.14}>
          <div className="mb-6 text-center">
            <h2 className="heading-md font-semibold">{STEPS[step].title}</h2>
            <p className="body-text text-muted-foreground">{STEPS[step].description}</p>
          </div>
        </BlurFade>

        <div className="rounded-2xl p-5 card-dark sm:p-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">College Name</label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Delhi, VJTI Mumbai"
                      value={form.college}
                      onChange={(e) => updateField("college", e.target.value)}
                      className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">College Tier</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {COLLEGE_TIERS.map((t) => (
                        <motion.button
                          key={t.value}
                          onClick={() => updateField("college_tier", t.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                            form.college_tier === t.value
                              ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--accent-glow)]"
                              : "border-border hover:border-primary/30 hover:bg-accent/60"
                          }`}
                        >
                          {t.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Degree</label>
                      <select
                        value={form.degree}
                        onChange={(e) => updateField("degree", e.target.value)}
                        className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                      >
                        {DEGREES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Major</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={form.major}
                        onChange={(e) => updateField("major", e.target.value)}
                        className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Current Year</label>
                      <select
                        value={form.current_year}
                        onChange={(e) => updateField("current_year", parseInt(e.target.value))}
                        className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                      >
                        {[1, 2, 3, 4].map((y) => (
                          <option key={y} value={y}>
                            Year {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">CS Background?</label>
                      <div className="flex gap-2 pt-1">
                        {[true, false].map((v) => (
                          <motion.button
                            key={String(v)}
                            onClick={() => updateField("is_cs_background", v)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                              form.is_cs_background === v
                                ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--accent-glow)]"
                                : "border-border hover:border-primary/30 hover:bg-accent/60"
                            }`}
                          >
                            {v ? "Yes" : "No"}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Rate your skill level (1 = beginner, 5 = advanced). Select at least 3.
                  </p>
                  {SKILL_CATEGORIES.map((skill, index) => (
                    <BlurFade key={skill.id} delay={index * 0.04}>
                      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <span className="text-sm font-medium sm:max-w-[70%]">{skill.label}</span>
                        <div className="flex gap-1 sm:flex-shrink-0">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const isSelected = (form.skills[skill.id]?.level ?? 0) >= level;
                            return (
                              <motion.button
                                key={level}
                                onClick={() => setSkillLevel(skill.id, level)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                  backgroundColor: isSelected ? "var(--accent)" : "var(--bg-elevated)",
                                  color: isSelected ? "var(--text-inverse)" : "var(--text-secondary)",
                                  boxShadow: isSelected ? "0 0 18px var(--accent-glow)" : "none",
                                }}
                                transition={{ duration: 0.2 }}
                                className="h-8 w-8 rounded-md text-xs font-bold"
                              >
                                {level}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </BlurFade>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Target Role</label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {TARGET_ROLES.map((r) => (
                        <motion.button
                          key={r.value}
                          onClick={() => updateField("target_role", r.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                            form.target_role === r.value
                              ? "border-primary bg-primary/10 font-medium text-primary shadow-[0_0_16px_var(--accent-glow)]"
                              : "border-border hover:border-primary/30 hover:bg-accent/60"
                          }`}
                        >
                          {r.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Target Companies (up to 5)</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {TARGET_COMPANIES.map((c, index) => {
                        const selected = form.target_companies.includes(c);
                        return (
                          <motion.div
                            key={c}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02, type: "spring", stiffness: 260, damping: 20 }}
                          >
                            <button
                              onClick={() => toggleCompany(c)}
                              className={`w-full rounded-xl border px-3 py-3 text-left text-xs transition ${
                                selected
                                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_18px_var(--accent-glow)]"
                                  : "border-border hover:border-primary/30 hover:bg-accent/60"
                              }`}
                            >
                              <span className="block font-medium">{c}</span>
                              <span className="mt-1 block text-[10px] text-muted-foreground">
                                {selected ? "Selected" : "Add to target list"}
                              </span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Selected: {form.target_companies.length}/5</p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Hours per Day</label>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={form.hours_per_day}
                        onChange={(e) => updateField("hours_per_day", parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <p className="text-center text-sm font-bold text-primary">{form.hours_per_day} hours</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Days per Week</label>
                      <input
                        type="range"
                        min={1}
                        max={7}
                        value={form.days_per_week}
                        onChange={(e) => updateField("days_per_week", parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <p className="text-center text-sm font-bold text-primary">{form.days_per_week} days</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Preferred Language</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <motion.button
                          key={l.value}
                          onClick={() => updateField("preferred_language", l.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`rounded-lg border px-3 py-2 text-sm transition ${
                            form.preferred_language === l.value
                              ? "border-primary bg-primary/10 font-medium text-primary shadow-[0_0_16px_var(--accent-glow)]"
                              : "border-border hover:border-primary/30 hover:bg-accent/60"
                          }`}
                        >
                          {l.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg p-4 text-sm card-glass">
                    <p className="font-medium">Your weekly commitment:</p>
                    <p className="body-text text-muted-foreground">
                      {form.hours_per_day * form.days_per_week} hours/week (~{" "}
                      {Math.round((form.hours_per_day * form.days_per_week * 4) / 10) * 10} hours/month)
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <motion.button
            onClick={goBack}
            disabled={step === 0}
            whileHover={{ scale: step === 0 ? 1 : 1.03 }}
            whileTap={{ scale: step === 0 ? 1 : 0.97 }}
            className="btn-outline flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </motion.button>

          {step < STEPS.length - 1 ? (
            <motion.button
              onClick={goNext}
              disabled={!canNext()}
              whileHover={{ scale: canNext() ? 1.03 : 1 }}
              whileTap={{ scale: canNext() ? 0.97 : 1 }}
              className="btn-accent flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              Next <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <ShimmerButton onClick={handleComplete} disabled={loading} className="px-6 py-2.5">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
              ) : (
                <>
                  Complete Setup <Check className="h-4 w-4" />
                </>
              )}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  );
}
