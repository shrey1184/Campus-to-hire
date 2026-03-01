/**
 * API client for the Campus-to-Hire FastAPI backend.
 */

import type {
  AuthResponse,
  UserProfile,
  UserProfileUpdate,
  UserProgressStats,
  DashboardStats,
  Roadmap,
  DailyPlan,
  Interview,
  JDAnalysis,
  TranslateResponse,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 429 with retry-after backoff
  if (res.status === 429 && retries > 0) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
    const delay = Math.min(retryAfter * 1000, 10000);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return request<T>(path, options, retries - 1);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      error?.detail ||
      error?.message ||
      error?.error?.message ||
      `Request failed: ${res.status}`;
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (accessToken: string) =>
    request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    }),

  googleCallback: (code: string) =>
    request<AuthResponse>("/api/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
};

// ── Profile ──────────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => request<UserProfile>("/api/profile"),

  update: (data: UserProfileUpdate) =>
    request<UserProfile>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getProgress: () =>
    request<UserProgressStats>("/api/profile/progress"),

  getStats: () =>
    request<DashboardStats>("/api/profile/stats"),
};

// ── Roadmap ──────────────────────────────────────────────────────────────────

export const roadmapApi = {
  generate: () =>
    request<Roadmap>("/api/roadmap/generate", { method: "POST" }),

  generateWeek: (roadmapId: string, weekNumber: number) =>
    request<Roadmap>(`/api/roadmap/${roadmapId}/generate-week`, {
      method: "POST",
      body: JSON.stringify({ week_number: weekNumber }),
    }),

  getActive: () => request<Roadmap>("/api/roadmap"),

  getById: (id: string) => request<Roadmap>(`/api/roadmap/${id}`),

  activate: (id: string) =>
    request<Roadmap>(`/api/roadmap/${id}/activate`, { method: "PUT" }),

  delete: (id: string) =>
    request<void>(`/api/roadmap/${id}`, { method: "DELETE" }),

  listAll: () =>
    request<{ roadmaps: Roadmap[]; total: number }>("/api/roadmap/list/all"),
};

// ── Daily Plan ───────────────────────────────────────────────────────────────

export const dailyPlanApi = {
  getToday: () => request<DailyPlan>("/api/daily-plan"),

  completeTask: (taskId: string, completed: boolean) =>
    request<DailyPlan>("/api/daily-plan/task/complete", {
      method: "PATCH",
      body: JSON.stringify({ task_id: taskId, completed }),
    }),

  getHistory: () => request<DailyPlan[]>("/api/daily-plan/history"),
};

// ── Interview ────────────────────────────────────────────────────────────────

export const interviewApi = {
  start: (role: string, company?: string) =>
    request<Interview>("/api/interview/start", {
      method: "POST",
      body: JSON.stringify({ role, company }),
    }),

  respond: (interviewId: string, message: string) =>
    request<Interview>("/api/interview/respond", {
      method: "POST",
      body: JSON.stringify({ interview_id: interviewId, message }),
    }),

  end: (interviewId: string) =>
    request<Interview>(`/api/interview/${interviewId}/end`, {
      method: "POST",
    }),

  getHistory: () => request<Interview[]>("/api/interview/history"),
};

// ── JD Analysis ──────────────────────────────────────────────────────────────

export const jdApi = {
  analyze: (jobDescription: string) =>
    request<JDAnalysis>("/api/jd/analyze", {
      method: "POST",
      body: JSON.stringify({ job_description: jobDescription }),
    }),
};

// ── Translation ──────────────────────────────────────────────────────────────

export const translateApi = {
  translate: (text: string, targetLanguage: string) =>
    request<TranslateResponse>("/api/translate", {
      method: "POST",
      body: JSON.stringify({ text, target_language: targetLanguage }),
    }),
};
