"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jdApi } from "@/lib/api";
import type { JDAnalysis } from "@/types";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import {
  FileSearch,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  ChevronRight,
  Sparkles,
  Clipboard,
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
  const [jdText, setJdText] = useState("");
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  async function handleAnalyze() {
    if (!jdText.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await jdApi.analyze(jdText.trim());
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function useSample() {
    setJdText(SAMPLE_JD);
    setAnalysis(null);
  }

  const priorityColors: Record<string, string> = {
    critical: "text-primary bg-primary/20",
    high: "text-amber-700 dark:text-amber-300 bg-amber-500/15",
    medium: "text-yellow-700 dark:text-yellow-300 bg-yellow-500/15",
    low: "text-orange-700 dark:text-orange-300 bg-amber-500/15",
  };

  const getLevelScore = (level: string | number) => {
    if (typeof level === "number") return Math.min(100, Math.max(0, level * 20));
    const normalized = level.toLowerCase();
    if (normalized.includes("advanced")) return 100;
    if (normalized.includes("intermediate")) return 70;
    if (normalized.includes("basic")) return 40;
    if (normalized.includes("beginner")) return 25;
    const parsed = Number.parseInt(level, 10);
    return Number.isNaN(parsed) ? 50 : Math.min(100, Math.max(0, parsed * 20));
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div>
        <h1 className="heading-lg flex items-center gap-2 font-bold">
          <FileSearch className="h-6 w-6 text-primary" />
          JD Skill-Gap Analysis
        </h1>
        <p className="body-text mt-1 text-muted-foreground">
          Paste a job description to see how your skills match up
        </p>
      </div>

      <div className="rounded-2xl p-5 card-dark sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Job Description</label>
          <button onClick={useSample} className="link-glow flex items-center gap-1 text-xs">
            <Clipboard className="h-3 w-3" />
            Use Sample JD
          </button>
        </div>
        <motion.div
          animate={{
            boxShadow: focused ? "0 0 0 3px var(--accent-subtle), 0 0 20px var(--accent-glow)" : "0 0 0 0 transparent",
          }}
          transition={{ duration: 0.2 }}
          className="rounded-lg"
        >
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Paste the full job description here..."
            rows={10}
            className="input-dark w-full resize-none rounded-lg px-4 py-3 text-sm outline-none"
            style={{ borderColor: focused ? "var(--accent)" : undefined }}
          />
        </motion.div>
        <div className="mt-3">
          <ShimmerButton onClick={handleAnalyze} disabled={loading || !jdText.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Job Description
              </>
            )}
          </ShimmerButton>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="rounded-2xl p-5 card-dark sm:p-6">
              <h2 className="mb-4 heading-md font-semibold">Analysis Summary</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-semibold capitalize">{analysis.role}</p>
                </div>
                {analysis.company && (
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="font-semibold">{analysis.company}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Required Skills</p>
                  <p className="font-semibold">{analysis.required_skills.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 card-dark sm:p-6">
              <h2 className="mb-4 heading-md font-semibold">Required Skills</h2>
              <div className="space-y-2">
                {analysis.required_skills.map((skill, i) => (
                  <BlurFade key={`${skill.name}-${i}`} delay={i * 0.05}>
                    <div className="flex flex-col gap-2 rounded-lg border border-border/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs capitalize text-muted-foreground">{skill.level}</span>
                        {skill.importance && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              priorityColors[skill.importance.toLowerCase()] || "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {skill.importance}
                          </span>
                        )}
                      </div>
                    </div>
                  </BlurFade>
                ))}
              </div>
            </div>

            {analysis.gap_analysis.length > 0 && (
              <div className="rounded-2xl p-5 card-dark sm:p-6">
                <h2 className="heading-md mb-4 flex items-center gap-2 font-semibold">
                  <ArrowUpCircle className="h-5 w-5 text-primary" />
                  Skill Gaps
                </h2>
                <div className="space-y-3">
                  {analysis.gap_analysis.map((gap, i) => {
                    const current = getLevelScore(gap.current_level);
                    const required = getLevelScore(gap.required_level);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-lg border border-border/30 p-4"
                      >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-medium">{gap.skill}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              priorityColors[gap.priority?.toLowerCase()] || "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {gap.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Current: {gap.current_level}</span>
                          <ChevronRight className="h-3 w-3" />
                          <span>Required: {gap.required_level}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="h-2 rounded-full bg-muted">
                            <motion.div
                              className="h-2 rounded-full bg-primary/40"
                              initial={{ width: 0 }}
                              animate={{ width: `${current}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.04 }}
                            />
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <motion.div
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-amber-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${required}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 20, delay: i * 0.04 + 0.05 }}
                            />
                          </div>
                        </div>
                        {gap.gap && <p className="mt-2 text-xs text-muted-foreground">{gap.gap}</p>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div className="rounded-2xl p-5 card-dark sm:p-6">
                <h2 className="heading-md mb-4 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Recommendations
                </h2>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
