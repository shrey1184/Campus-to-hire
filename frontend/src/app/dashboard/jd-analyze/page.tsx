"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { jdApi } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import type { JDAnalysis } from "@/types";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  FileSearch,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";

const SAMPLE_JD = `Software Development Engineer (SDE-1) at Amazon

Requirements:
- B.Tech/B.E. in Computer Science or related field
- Strong knowledge of Data Structures and Algorithms
- Proficiency in at least one programming language (Java, Python, or C++)
- Understanding of Object-Oriented Design and System Design basics
- Experience with SQL databases
- Familiarity with version control (Git)
- Problem solving and analytical skills
- Good communication skills

Nice to have:
- Experience with AWS services
- Knowledge of distributed systems
- Open source contributions
- Previous internship experience`;

export default function JDAnalyzePage() {
  const { t } = useLanguage();
  const [jdText, setJdText] = useState("");
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jdText.trim()) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await jdApi.analyze(jdText.trim());
      setAnalysis(result);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    if (!analysis) {
      return {
        matchedSkills: 0,
        totalRequired: 0,
        gapCount: 0,
        matchScore: 0,
      };
    }

    const totalRequired = analysis.required_skills.length;
    const gapCount = analysis.gap_analysis.length;
    const matchedSkills = Math.max(totalRequired - gapCount, 0);
    const matchScore = totalRequired > 0 ? Math.round((matchedSkills / totalRequired) * 100) : 0;

    return {
      matchedSkills,
      totalRequired,
      gapCount,
      matchScore,
    };
  }, [analysis]);

  const priorityClasses: Record<string, string> = {
    critical: "border-red-500/20 bg-red-500/10 text-red-200",
    high: "border-amber-500/20 bg-amber-500/10 text-amber-100",
    medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
    low: "border-white/10 bg-white/[0.04] text-[var(--text-secondary)]",
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <BlurFade delay={0.05}>
        <section className="rounded-[28px] border border-[var(--accent)]/20 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.16),transparent_28%),linear-gradient(135deg,#101010,#080808)] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                <FileSearch className="h-3.5 w-3.5" />
                {t("jd.hero.badge")}
              </div>
              <div>
                <h1 className="heading-xl">{t("jd.hero.title")}</h1>
                <p className="body-text mt-3 max-w-2xl text-[var(--text-secondary)]">
                  {t("jd.hero.description")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label={t("jd.metric.matchScore")} value={analysis ? `${summary.matchScore}%` : "--"} />
                <Metric label={t("jd.metric.requiredSkills")} value={analysis ? String(summary.totalRequired) : "--"} />
                <Metric label={t("jd.metric.gapCount")} value={analysis ? String(summary.gapCount) : "--"} />
              </div>
            </div>

            <div className="card-glass rounded-[24px] border-white/10 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {t("jd.stepByStep")}
              </p>
              <div className="mt-4 space-y-3">
                <GuideStep number="01" title="Paste the JD" description="Use the full description, not only the bullet list, so the role intent is preserved." />
                <GuideStep number="02" title="Inspect the gaps" description="The missing skills matter more than the skills you already have." />
                <GuideStep number="03" title="Feed it back" description="Use the recommendations to update your roadmap and mock-interview focus." />
              </div>
            </div>
          </div>
        </section>
      </BlurFade>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <BlurFade delay={0.1}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Step 1
                </p>
                <h2 className="heading-md mt-1">{t("jd.input")}</h2>
              </div>
              <button onClick={() => setJdText(SAMPLE_JD)} className="link-glow inline-flex items-center gap-2 text-sm">
                <Clipboard className="h-4 w-4" />
                {t("jd.useSample")}
              </button>
            </div>

            <textarea
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              placeholder={t("jd.placeholder")}
              rows={16}
              className="input-dark w-full resize-none rounded-[22px] px-4 py-4 text-sm leading-6 outline-none"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <ShimmerButton onClick={handleAnalyze} disabled={loading || !jdText.trim()} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("jd.analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t("jd.analyze")}
                  </>
                )}
              </ShimmerButton>
            </div>

            {error ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            ) : null}
          </div>
        </BlurFade>

        <BlurFade delay={0.14}>
          <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Step 2
                </p>
                <h2 className="heading-md mt-1">{t("jd.summary")}</h2>
              </div>

            {analysis ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-[var(--accent)]/20 bg-[var(--accent-subtle)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{analysis.role}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {analysis.company ? `${analysis.company} role detected` : "Company not explicitly identified"}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                      {summary.matchScore}% match
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <SummaryRow label="Matched skills" value={`${summary.matchedSkills}/${summary.totalRequired}`} />
                  <SummaryRow label="Missing or weak areas" value={String(summary.gapCount)} />
                  <SummaryRow label="Recommendations" value={String(analysis.recommendations.length)} />
                  <SummaryRow label="Extracted skills" value={String(analysis.required_skills.length)} />
                </div>

                <div className="rounded-[22px] border border-white/8 bg-white/[0.02] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Estimated fit</span>
                    <span className="font-semibold text-[var(--text-primary)]">{summary.matchScore}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                      initial={{ width: 0 }}
                      animate={{ width: `${summary.matchScore}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <EmptyPanel
                title={t("jd.noAnalysis")}
                description={t("jd.noAnalysisDescription")}
              />
            )}
          </div>
        </BlurFade>
      </section>

      <AnimatePresence mode="wait">
        {analysis ? (
          <motion.section
            key="analysis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]"
          >
            <div className="card-dark rounded-[24px] p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Step 3
                </p>
                <h2 className="heading-md mt-1">Inspect required skills</h2>
              </div>

              <div className="space-y-3">
                {analysis.required_skills.map((skill, index) => (
                  <motion.div
                    key={`${skill.name}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-[20px] border border-white/8 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{skill.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          {skill.level}
                        </span>
                        {skill.importance ? (
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityClasses[skill.importance.toLowerCase()] || priorityClasses.low}`}>
                            {skill.importance}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="card-dark rounded-[24px] p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Gap analysis
                    </p>
                    <h2 className="heading-md mt-1">What still needs work</h2>
                  </div>
                  <Target className="h-5 w-5 text-[var(--accent)]" />
                </div>

                {analysis.gap_analysis.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.gap_analysis.map((gap, index) => {
                      const current = getLevelScore(gap.current_level);
                      const required = getLevelScore(gap.required_level);

                      return (
                        <motion.div
                          key={`${gap.skill}-${index}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="rounded-[20px] border border-white/8 bg-white/[0.02] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{gap.skill}</p>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityClasses[gap.priority?.toLowerCase()] || priorityClasses.low}`}>
                              {gap.priority}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-xs text-[var(--text-secondary)] sm:grid-cols-2">
                            <div>
                              Current
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                                <motion.div
                                  className="h-full rounded-full bg-white/30"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${current}%` }}
                                  transition={{ duration: 0.35, ease: "easeOut" }}
                                />
                              </div>
                              <p className="mt-1">{String(gap.current_level)}</p>
                            </div>
                            <div>
                              Required
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#f2d78a]"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${required}%` }}
                                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                                />
                              </div>
                              <p className="mt-1">{String(gap.required_level)}</p>
                            </div>
                          </div>

                          {gap.gap ? (
                            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{gap.gap}</p>
                          ) : null}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyPanel title="No major gaps detected" description="The JD does not show obvious missing skills against your current profile." />
                )}
              </div>

              <div className="card-dark rounded-[24px] p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Action list
                  </p>
                  <h2 className="heading-md mt-1">What to do next</h2>
                </div>

                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={`${recommendation}-${index}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="rounded-xl bg-[var(--accent-subtle)] p-2 text-[var(--accent)]">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function GuideStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-black/25 text-sm font-semibold text-[var(--accent)]">
          {number}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.02] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)]">
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function getLevelScore(level: string | number) {
  if (typeof level === "number") return Math.min(100, Math.max(0, level * 20));

  const normalized = level.toLowerCase();
  if (normalized.includes("advanced")) return 100;
  if (normalized.includes("intermediate")) return 70;
  if (normalized.includes("basic")) return 40;
  if (normalized.includes("beginner")) return 25;

  const parsed = Number.parseInt(level, 10);
  return Number.isNaN(parsed) ? 50 : Math.min(100, Math.max(0, parsed * 20));
}
