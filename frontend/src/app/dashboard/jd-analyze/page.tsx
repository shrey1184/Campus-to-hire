"use client";

import { useState } from "react";
import { jdApi } from "@/lib/api";
import type { JDAnalysis } from "@/types";
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-lg font-bold flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" />
          JD Skill-Gap Analysis
        </h1>
        <p className="mt-1 text-muted-foreground body-text">
          Paste a job description to see how your skills match up
        </p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-5 sm:p-6 card-dark">
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-semibold">Job Description</label>
          <button
            onClick={useSample}
            className="link-glow flex items-center gap-1 text-xs"
          >
            <Clipboard className="h-3 w-3" />
            Use Sample JD
          </button>
        </div>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full rounded-lg px-4 py-3 text-sm outline-none resize-none input-dark"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !jdText.trim()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 btn-accent"
        >
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
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2 border border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <div className="rounded-2xl p-5 sm:p-6 card-dark">
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

          {/* Required Skills */}
          <div className="rounded-2xl p-5 sm:p-6 card-dark">
            <h2 className="mb-4 heading-md font-semibold">Required Skills</h2>
            <div className="space-y-2">
              {analysis.required_skills.map((skill, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg border border-border/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {skill.level}
                    </span>
                    {skill.importance && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        priorityColors[skill.importance.toLowerCase()] || "bg-secondary text-secondary-foreground"
                      }`}>
                        {skill.importance}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gap Analysis */}
          {analysis.gap_analysis.length > 0 && (
            <div className="rounded-2xl p-5 sm:p-6 card-dark">
              <h2 className="mb-4 heading-md font-semibold flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-primary" />
                Skill Gaps
              </h2>
              <div className="space-y-3">
                {analysis.gap_analysis.map((gap, i) => (
                  <div key={i} className="rounded-lg border border-border/30 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-sm">{gap.skill}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        priorityColors[gap.priority?.toLowerCase()] || "bg-secondary text-secondary-foreground"
                      }`}>
                        {gap.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Current: {gap.current_level}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span>Required: {gap.required_level}</span>
                    </div>
                    {gap.gap && (
                      <p className="mt-1 text-xs text-muted-foreground">{gap.gap}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="rounded-2xl p-5 sm:p-6 card-dark">
              <h2 className="mb-4 heading-md font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Recommendations
              </h2>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
