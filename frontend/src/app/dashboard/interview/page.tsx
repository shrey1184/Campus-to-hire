"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { interviewApi } from "@/lib/api";
import type { Interview, ChatMessage } from "@/types";
import { TARGET_ROLES, TARGET_COMPANIES } from "@/types";
import {
  MessageSquare,
  Send,
  Loader2,
  Play,
  StopCircle,
  Star,
  Trophy,
  Bot,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function InterviewPage() {
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.target_role || "sde");
  const [selectedCompany, setSelectedCompany] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.messages]);

  async function handleStart() {
    setStarting(true);
    try {
      const iv = await interviewApi.start(selectedRole, selectedCompany || undefined);
      setInterview(iv);
    } catch (err) {
      console.error("Failed to start interview:", err);
    } finally {
      setStarting(false);
    }
  }

  async function handleSend() {
    if (!interview || !message.trim()) return;
    setLoading(true);
    try {
      const updated = await interviewApi.respond(interview.id, message.trim());
      setInterview(updated);
      setMessage("");
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnd() {
    if (!interview) return;
    setEnding(true);
    try {
      const updated = await interviewApi.end(interview.id);
      setInterview(updated);
    } catch (err) {
      console.error("Failed to end interview:", err);
    } finally {
      setEnding(false);
    }
  }

  function handleNewInterview() {
    setInterview(null);
    setMessage("");
  }

  const isFinished = interview?.score !== null && interview?.score !== undefined;

  // Setup screen
  if (!interview) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="cyber-heading-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Mock Interview
          </h1>
          <p className="mt-1 text-muted-foreground cyber-copy">
            Practice with an AI interviewer tailored to your target role
          </p>
        </div>

        <div className="mx-auto max-w-lg rounded-2xl p-5 sm:p-6 cyber-panel">
          <h2 className="mb-4 cyber-heading-md font-semibold">Setup Your Interview</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Target Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none cyber-input"
              >
                {TARGET_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Company (optional)
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none cyber-input"
              >
                <option value="">General Interview</option>
                {TARGET_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={starting}
              className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold disabled:opacity-60 cyber-button"
            >
              {starting ? (
                <Loader2 className="h-4 w-4 animate-spin cyber-spinner" />
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Interview
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview screen
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col animate-fade-in lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            {interview.role.replace(/_/g, " ").toUpperCase()} Interview
            {interview.company && ` - ${interview.company}`}
          </h1>
          <p className="text-xs text-muted-foreground">
            {interview.messages.length} messages
            {isFinished && ` | Score: ${interview.score}/100`}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          {!isFinished && (
            <button
              onClick={handleEnd}
              disabled={ending}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground cyber-button-secondary"
            >
              {ending ? <Loader2 className="h-3 w-3 animate-spin cyber-spinner" /> : <StopCircle className="h-3 w-3" />}
              End
            </button>
          )}
          <button
            onClick={handleNewInterview}
            className="rounded-lg px-3 py-1.5 text-xs font-medium cyber-button-secondary"
          >
            New Interview
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 space-y-4 overflow-y-auto">
        {interview.messages.map((msg: ChatMessage, i: number) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm sm:max-w-[80%] sm:px-4 sm:py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
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
          </div>
        ))}

        {/* Score card */}
        {isFinished && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center cyber-panel-soft">
            <Trophy className="mx-auto mb-2 h-10 w-10 text-primary" />
            <p className="text-2xl font-bold">{interview.score}/100</p>
            <div className="mx-auto mb-3 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= Math.round((interview.score || 0) / 20)
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            {interview.feedback && (
              <div className="text-left text-sm">
                <p className="mb-1 font-semibold">Feedback:</p>
                <ReactMarkdown>{interview.feedback}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      {!isFinished && (
        <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your answer..."
            disabled={loading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none disabled:opacity-50 cyber-input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 cyber-button"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin cyber-spinner" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
