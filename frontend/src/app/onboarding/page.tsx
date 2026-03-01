"use client";

import { useState } from "react";
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
import ThemeToggle from "@/components/ThemeToggle";

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
      case 0: return form.college.trim() !== "" && form.major.trim() !== "";
      case 1: return Object.keys(form.skills).length >= 3;
      case 2: return form.target_role !== "" && form.target_companies.length > 0;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 page-base">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Logo size="md" linked />
            <ThemeToggle />
          </div>
          <h1 className="heading-lg font-bold">Set Up Your Profile</h1>
          <p className="mt-1 text-muted-foreground body-text">
            Complete in under 10 minutes. This helps us personalize your roadmap.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-1.5 sm:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 transition ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step title */}
        <div className="mb-6 text-center">
          <h2 className="heading-md font-semibold">{STEPS[step].title}</h2>
          <p className="body-text text-muted-foreground">{STEPS[step].description}</p>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl p-5 sm:p-7 animate-fade-in card-dark">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">College Name</label>
                <input
                  type="text"
                  placeholder="e.g. IIT Delhi, VJTI Mumbai"
                  value={form.college}
                  onChange={(e) => updateField("college", e.target.value)}
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">College Tier</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {COLLEGE_TIERS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => updateField("college_tier", t.value)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                        form.college_tier === t.value
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--accent-glow)]"
                          : "border-border hover:border-primary/30 hover:bg-accent/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Degree</label>
                  <select
                    value={form.degree}
                    onChange={(e) => updateField("degree", e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
                  >
                    {DEGREES.map((d) => (
                      <option key={d} value={d}>{d}</option>
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
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Current Year</label>
                  <select
                    value={form.current_year}
                    onChange={(e) => updateField("current_year", parseInt(e.target.value))}
                    className="w-full rounded-lg px-4 py-2.5 text-sm outline-none input-dark"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">CS Background?</label>
                  <div className="flex gap-2 pt-1">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => updateField("is_cs_background", v)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                          form.is_cs_background === v
                            ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--accent-glow)]"
                            : "border-border hover:border-primary/30 hover:bg-accent/60"
                        }`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
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
              {SKILL_CATEGORIES.map((skill) => (
                <div key={skill.id} className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-sm font-medium sm:max-w-[70%]">{skill.label}</span>
                  <div className="flex gap-1 sm:flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setSkillLevel(skill.id, level)}
                        className={`h-8 w-8 rounded-md text-xs font-bold transition ${
                          (form.skills[skill.id]?.level ?? 0) >= level
                            ? "bg-primary text-primary-foreground shadow-[0_0_14px_var(--accent-glow)]"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Target Role</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {TARGET_ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => updateField("target_role", r.value)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                        form.target_role === r.value
                          ? "border-primary bg-primary/10 text-primary font-medium shadow-[0_0_16px_var(--accent-glow)]"
                          : "border-border hover:border-primary/30 hover:bg-accent/60"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Target Companies (up to 5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCompany(c)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        form.target_companies.includes(c)
                          ? "border-primary bg-primary/10 text-primary font-medium shadow-[0_0_16px_var(--accent-glow)]"
                          : "border-border hover:border-primary/30 hover:bg-accent/60"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selected: {form.target_companies.length}/5
                </p>
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
                  <p className="text-center text-sm font-bold text-primary">
                    {form.hours_per_day} hours
                  </p>
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
                  <p className="text-center text-sm font-bold text-primary">
                    {form.days_per_week} days
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Preferred Language</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => updateField("preferred_language", l.value)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        form.preferred_language === l.value
                          ? "border-primary bg-primary/10 text-primary font-medium shadow-[0_0_16px_var(--accent-glow)]"
                          : "border-border hover:border-primary/30 hover:bg-accent/60"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg p-4 text-sm card-glass">
                <p className="font-medium">Your weekly commitment:</p>
                <p className="text-muted-foreground body-text">
                  {form.hours_per_day * form.days_per_week} hours/week (~{" "}
                  {Math.round((form.hours_per_day * form.days_per_week * 4) / 10) * 10} hours/month
                  )
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-40 btn-outline"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-40 btn-accent"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60 btn-accent"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
              ) : (
                <>
                  Complete Setup <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
