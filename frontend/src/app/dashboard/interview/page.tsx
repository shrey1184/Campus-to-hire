"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/api";
import {
  isVoiceInputSupported,
  speakInterviewText,
  startVoiceInput,
  stopVoicePlayback,
  type VoiceRecorderController,
} from "@/lib/interview-voice";
import { fireConfetti } from "@/lib/confetti";
import { useLanguage } from "@/lib/language-context";
import type { Interview, ChatMessage, InterviewEvaluation } from "@/types";
import { TARGET_ROLES, TARGET_COMPANIES } from "@/types";
import { BlurFade } from "@/components/magic/BlurFade";
import { ShimmerButton } from "@/components/magic/ShimmerButton";
import { NumberTicker } from "@/components/magic/NumberTicker";
import {
  AlertTriangle,
  Bot,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronUp,
  ExternalLink,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Play,
  Send,
  Star,
  StopCircle,
  Target,
  Trophy,
  User,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ── Helper: parse evaluation JSON from feedback ─────────────────────────────

function parseEvaluation(feedback: string | null | undefined): InterviewEvaluation | null {
  if (!feedback) return null;
  try {
    const data = JSON.parse(feedback);
    if (typeof data === "object" && data !== null) return data as InterviewEvaluation;
  } catch {
    // Not valid JSON — try to extract JSON from text that might contain it
    const jsonMatch = feedback.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        if (typeof data === "object" && data !== null) return data as InterviewEvaluation;
      } catch {
        // Truly not parseable
      }
    }
  }
  return null;
}

// ── Helper: compute display score from evaluation sub-scores ────────────────

function computeDisplayScore(interview: Interview): number {
  const evaluation = parseEvaluation(interview.feedback);
  let score = interview.score || 0;
  if (evaluation?.technical_score != null && evaluation?.problem_solving_score != null && evaluation?.communication_score != null) {
    const weighted = evaluation.technical_score * 0.40 + evaluation.problem_solving_score * 0.35 + evaluation.communication_score * 0.25;
    score = Math.round(weighted * 10);
  } else if (evaluation?.score != null) {
    score = evaluation.score <= 10 ? evaluation.score * 10 : evaluation.score;
  }
  return Math.max(0, Math.min(100, score));
}

// ── Score ring helper ────────────────────────────────────────────────────────

function ScoreRing({ value, max = 10, label, color }: { value: number; max?: number; label: string; color: string }) {
  const pct = (value / max) * 100;
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <motion.circle
          cx="26" cy="26" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          className={color}
          stroke="currentColor"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="text-base font-bold">{value}/{max}</span>
      <span className="text-[11px] text-muted-foreground leading-tight text-center">{label}</span>
    </div>
  );
}

// ── Rich evaluation card ─────────────────────────────────────────────────────

function InterviewEvaluationCard({ interview, t }: { interview: Interview; t: (key: string, vars?: Record<string, string | number>) => string }) {
  const evaluation = parseEvaluation(interview.feedback);
  const displayScore = computeDisplayScore(interview);

  // Readiness badge colors
  const readinessColors: Record<string, string> = {
    not_ready: "bg-red-500/15 text-red-600 dark:text-red-400",
    getting_ready: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    ready: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    very_ready: "bg-green-500/15 text-green-600 dark:text-green-400",
  };
  const readinessLabels: Record<string, string> = {
    not_ready: "Not Ready",
    getting_ready: "Getting Ready",
    ready: "Ready",
    very_ready: "Very Ready",
  };

  return (
    <div className="space-y-4">
      {/* ── Score Header ── */}
      <div className="card-glass rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
        <Trophy className="mx-auto mb-2 h-10 w-10 text-primary" />
        <p className="text-3xl font-bold">
          <NumberTicker value={displayScore} />/100
        </p>
        <div className="mx-auto mb-3 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: s * 0.08, type: "spring", stiffness: 320, damping: 18 }}
            >
              <Star
                className={`h-5 w-5 ${
                  s <= Math.round(displayScore / 20) ? "fill-primary text-primary" : "text-muted"
                }`}
              />
            </motion.div>
          ))}
        </div>

        {evaluation?.readiness_level && (
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${readinessColors[evaluation.readiness_level] ?? "bg-muted text-muted-foreground"}`}>
            {readinessLabels[evaluation.readiness_level] ?? evaluation.readiness_level}
          </span>
        )}
      </div>

      {evaluation ? (
        <>
          {/* ── Feedback summary ── */}
          {evaluation.feedback && (
            <BlurFade delay={0.1}>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 text-sm leading-relaxed">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("interview.feedback")}</p>
                <p>{evaluation.feedback}</p>
              </div>
            </BlurFade>
          )}

          {/* ── Sub-score rings ── */}
          {(evaluation.technical_score != null || evaluation.communication_score != null || evaluation.problem_solving_score != null) && (
            <BlurFade delay={0.2}>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Breakdown</p>
                <div className="flex items-start justify-around">
                  {evaluation.technical_score != null && (
                    <ScoreRing value={evaluation.technical_score} label="Technical" color="text-sky-500" />
                  )}
                  {evaluation.problem_solving_score != null && (
                    <ScoreRing value={evaluation.problem_solving_score} label="Problem Solving" color="text-violet-500" />
                  )}
                  {evaluation.communication_score != null && (
                    <ScoreRing value={evaluation.communication_score} label="Communication" color="text-emerald-500" />
                  )}
                </div>
              </div>
            </BlurFade>
          )}

          {/* ── Strengths & Improvements ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <BlurFade delay={0.3}>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 leading-snug">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>
            )}

            {evaluation.improvements && evaluation.improvements.length > 0 && (
              <BlurFade delay={0.35}>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <ChevronUp className="h-3.5 w-3.5" /> Areas to Improve
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2 leading-snug">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurFade>
            )}
          </div>

          {/* ── Next Steps ── */}
          {evaluation.next_steps && evaluation.next_steps.length > 0 && (
            <BlurFade delay={0.4}>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> Next Steps
                </p>
                <ol className="space-y-1.5 text-sm list-decimal list-inside">
                  {evaluation.next_steps.map((s, i) => (
                    <li key={i} className="leading-snug">{s}</li>
                  ))}
                </ol>
              </div>
            </BlurFade>
          )}

          {/* ── Recommended Resources ── */}
          {evaluation.recommended_resources && evaluation.recommended_resources.length > 0 && (
            <BlurFade delay={0.45}>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> Recommended Resources
                </p>
                <div className="space-y-2">
                  {evaluation.recommended_resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 rounded-lg border border-border/30 p-2.5 text-sm transition-colors hover:bg-muted/50"
                    >
                      <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <div>
                        <span className="font-medium">{r.title}</span>
                        <p className="text-xs text-muted-foreground">{r.reason}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </BlurFade>
          )}

          {/* ── Company Fit ── */}
          {evaluation.company_fit && (
            <BlurFade delay={0.5}>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <BrainCircuit className="h-3.5 w-3.5" /> Company Fit
                </p>
                <p className="text-sm">{evaluation.company_fit}</p>
              </div>
            </BlurFade>
          )}
        </>
      ) : interview.feedback ? (
        /* Legacy plain-text feedback fallback */
        <BlurFade delay={0.12}>
          <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 text-left text-sm">
            <p className="mb-1 font-semibold">{t("interview.feedback")}</p>
            <ReactMarkdown>{interview.feedback}</ReactMarkdown>
          </div>
        </BlurFade>
      ) : null}
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────────────────

export default function InterviewPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.target_role || "sde");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [error, setError] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const celebratedInterviewRef = useRef<string | null>(null);
  const recorderRef = useRef<VoiceRecorderController | null>(null);
  const lastSpokenAssistantIndexRef = useRef<number>(-1);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.messages]);

  useEffect(() => {
    if (
      interview?.id &&
      interview.score !== null &&
      interview.score !== undefined &&
      interview.score >= 70 &&
      celebratedInterviewRef.current !== interview.id
    ) {
      fireConfetti();
      celebratedInterviewRef.current = interview.id;
    }
  }, [interview]);

  useEffect(() => {
    if (!voiceMode || !interview?.messages?.length) return;

    const assistantIndexes = interview.messages
      .map((m, i) => (m.role === "assistant" ? i : -1))
      .filter((i) => i >= 0);

    if (!assistantIndexes.length) return;

    const latestAssistantIndex = assistantIndexes[assistantIndexes.length - 1];
    if (latestAssistantIndex <= lastSpokenAssistantIndexRef.current) return;

    const latestMessage = interview.messages[latestAssistantIndex];
    if (!latestMessage?.content?.trim()) return;

    lastSpokenAssistantIndexRef.current = latestAssistantIndex;
    setSpeaking(true);
    void speakInterviewText(latestMessage.content, user?.preferred_language)
      .catch(() => {
        // Keep interview flow resilient even if voice playback fails.
      })
      .finally(() => {
        setSpeaking(false);
      });
  }, [interview?.messages, user?.preferred_language, voiceMode]);

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      stopVoicePlayback();
    };
  }, []);

  async function handleStart() {
    setStarting(true);
    setError("");
    try {
      const iv = await interviewApi.start(selectedRole, selectedCompany || undefined);
      setInterview(iv);
    } catch {
      setError(t("interview.errorStart"));
    } finally {
      setStarting(false);
    }
  }

  async function handleSend() {
    if (!interview || !message.trim()) return;
    setLoading(true);
    setError("");
    try {
      const updated = await interviewApi.respond(interview.id, message.trim());
      setInterview(updated);
      setMessage("");
    } catch {
      setError(t("interview.errorSend"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    if (!interview) return;
    setEnding(true);
    setError("");
    try {
      const updated = await interviewApi.end(interview.id);
      setInterview(updated);
    } catch {
      setError(t("interview.errorEnd"));
    } finally {
      setEnding(false);
    }
  }

  function handleNewInterview() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setListening(false);
    setSpeaking(false);
    stopVoicePlayback();
    lastSpokenAssistantIndexRef.current = -1;
    setInterview(null);
    setMessage("");
    setError("");
  }

  function handleVoiceToggle() {
    if (voiceMode) {
      recorderRef.current?.stop();
      recorderRef.current = null;
      setListening(false);
      setSpeaking(false);
      stopVoicePlayback();
      setVoiceMode(false);
      return;
    }
    setVoiceMode(true);
  }

  function handleMicClick() {
    if (!voiceMode) return;

    if (listening) {
      recorderRef.current?.stop();
      recorderRef.current = null;
      setListening(false);
      return;
    }

    const controller = startVoiceInput(
      user?.preferred_language,
      (transcript) => {
        setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      () => {
        setError("Voice input failed. Please try again.");
      },
      () => {
        setListening(false);
      },
    );

    if (controller) {
      recorderRef.current = controller;
      setListening(true);
    }
  }

  const isFinished =
    (interview?.score !== null && interview?.score !== undefined) ||
    (interview?.feedback !== null && interview?.feedback !== undefined && interview.feedback !== "");

  if (!interview) {
    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="heading-lg flex items-center gap-2 font-bold">
            <MessageSquare className="h-6 w-6 text-primary" />
            {t("interview.title")}
          </h1>
          <p className="body-text mt-1 text-muted-foreground">{t("interview.subtitle")}</p>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        ) : null}

        <div className="mx-auto max-w-lg rounded-2xl p-5 card-dark sm:p-6">
          <h2 className="mb-4 heading-md font-semibold">{t("interview.setup")}</h2>

          <div className="space-y-4">
            <BlurFade delay={0.1}>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("interview.targetRole")}</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                >
                  {TARGET_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </BlurFade>

            <BlurFade delay={0.2}>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("interview.company")}</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="input-dark w-full rounded-lg px-4 py-2.5 text-sm outline-none"
                >
                  <option value="">{t("interview.general")}</option>
                  {TARGET_COMPANIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </BlurFade>

            <BlurFade delay={0.25}>
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  voiceMode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  {voiceMode ? "Voice mode enabled" : "Enable voice mode (Polly + browser mic)"}
                </span>
              </button>
            </BlurFade>

            <ShimmerButton onClick={handleStart} disabled={starting} className="w-full">
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {t("interview.start")}
                </>
              )}
            </ShimmerButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex h-[calc(100vh-9rem)] flex-col lg:h-[calc(100vh-3rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t("interview.roleHeader", {
              role: interview.role.replace(/_/g, " ").toUpperCase(),
            })}
            {interview.company && ` - ${interview.company}`}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("interview.messages", { count: interview.messages.length })}
            {isFinished
              ? ` | ${t("interview.score", { score: computeDisplayScore(interview) })}`
              : ` | Question ${Math.min(Math.ceil(interview.messages.length / 2), 8)} of ~8`}
          </p>
          {!isFinished && (
            <div className="mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((interview.messages.length / 16) * 100, 100)}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {voiceMode ? (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className="btn-outline flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              {speaking ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              {speaking ? "Voice On" : "Voice"}
            </button>
          ) : null}
          {!isFinished ? (
            <button
              onClick={handleEnd}
              disabled={ending}
              className="btn-outline flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {ending ? (
                <Loader2 className="h-3 w-3 animate-spin spinner-glow" />
              ) : (
                <StopCircle className="h-3 w-3" />
              )}
              {t("interview.end")}
            </button>
          ) : null}
          <button onClick={handleNewInterview} className="btn-outline rounded-lg px-3 py-1.5 text-xs font-medium">
            {t("interview.new")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      <div className="flex-1 space-y-4 overflow-y-auto">
        {interview.messages.map((msg: ChatMessage, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[80%] sm:px-4 sm:py-3 ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  code: ({ children }) => (
                    <code className="rounded bg-background/50 px-1 py-0.5 text-xs font-mono">
                      {children}
                    </code>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}

        {isFinished ? (
          <InterviewEvaluationCard interview={interview} t={t} />
        ) : null}

        <div ref={chatEndRef} />
      </div>

      {!isFinished ? (
        <motion.div
          className="mt-4 flex gap-2 border-t border-border/40 pt-4"
          animate={{
            boxShadow: inputFocused
              ? "0 0 0 1px var(--accent), 0 0 20px var(--accent-glow)"
              : "0 0 0 0 transparent",
          }}
          transition={{ duration: 0.2 }}
          style={{ borderRadius: "1rem", paddingInline: "0.25rem" }}
        >
          {voiceMode && isVoiceInputSupported() ? (
            <button
              type="button"
              onClick={handleMicClick}
              className={`btn-outline flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                listening ? "border-primary text-primary" : ""
              }`}
              title={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          ) : null}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={t("interview.placeholder")}
            disabled={loading}
            className="input-dark flex-1 rounded-lg px-4 py-2.5 text-sm outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="btn-accent flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin spinner-glow" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
