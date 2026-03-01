// ── User ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  auth_provider?: string | null;
  college?: string | null;
  college_tier?: string | null;
  degree?: string | null;
  major?: string | null;
  current_year?: number | null;
  is_cs_background: boolean;
  target_role?: string | null;
  target_companies?: string[] | null;
  hours_per_day: number;
  days_per_week: number;
  preferred_language: string;
  skills?: Record<string, SkillData> | null;
  onboarding_completed: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface SkillData {
  level: number;
  category?: string;
}

export interface UserProfileUpdate {
  college?: string;
  college_tier?: string;
  degree?: string;
  major?: string;
  current_year?: number;
  is_cs_background?: boolean;
  target_role?: string;
  target_companies?: string[];
  hours_per_day?: number;
  days_per_week?: number;
  preferred_language?: string;
  skills?: Record<string, SkillData>;
  onboarding_completed?: boolean;
}

// ── Roadmap ────────────────────────────────────────────────────────────────

export interface Roadmap {
  id: string;
  user_id: string;
  content: RoadmapContent;
  pace: string;
  total_weeks: number;
  current_week: number;
  current_day: number;
  is_active: boolean;
  created_at: string;
}

export interface RoadmapContent {
  title?: string;
  total_weeks: number;
  weeks: RoadmapWeek[];
  fallback?: boolean;
  message?: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  description?: string;
  days: RoadmapDay[];
  pending?: boolean;
}

export interface RoadmapDay {
  day: number;
  title?: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: "learn" | "practice" | "review" | "interview" | "project" | "quiz" | "theory";
  duration_minutes?: number;
  completed: boolean;
  resources?: ResourceRef[];
}

export interface ResourceRef {
  title: string;
  type: string;
  url?: string;
}

// ── Daily Plan ──────────────────────────────────────────────────────────────

export interface DailyPlan {
  id: string;
  roadmap_id: string;
  user_id: string;
  week: number;
  day: number;
  tasks: Task[];
  focus_area?: string;
  created_at: string;
}

// ── Interview ────────────────────────────────────────────────────────────────

export interface Interview {
  id: string;
  user_id: string;
  role: string;
  company?: string | null;
  messages: ChatMessage[];
  score?: number | null;
  feedback?: string | null;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── JD Analysis ──────────────────────────────────────────────────────────────

export interface JDAnalysis {
  role: string;
  company?: string | null;
  required_skills: SkillRequirement[];
  user_skills: SkillEntry[];
  gap_analysis: GapItem[];
  recommendations: string[];
}

export interface SkillRequirement {
  name: string;
  level: string;
  importance?: string;
}

export interface SkillEntry {
  name: string;
  level: number | string;
}

export interface GapItem {
  skill: string;
  current_level: number | string;
  required_level: number | string;
  gap: string;
  priority: string;
}

// ── Translation ──────────────────────────────────────────────────────────────

export interface TranslateResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

// ── Progress ─────────────────────────────────────────────────────────────────

export interface UserProgressStats {
  total_roadmaps: number;
  active_roadmaps: number;
  completed_roadmaps: number;
  total_interviews: number;
  average_interview_score?: number | null;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface DashboardStats {
  weekly_progress: {
    labels: string[];
    tasks_completed: number[];
    hours_spent: number[];
  };
  skill_levels: Record<string, number>;
  streak_days: number;
  upcoming_milestones: MilestoneItem[];
}

export interface MilestoneItem {
  title: string;
  description?: string;
  target_week: number;
  status: string;
}

export interface WeeklyStats {
  problems_solved: number;
  study_hours: number;
  xp_gained: number;
  tasks_completed: number;
}

export interface PerformanceTrend {
  labels: string[];
  values: number[];
  change_percentage: number;
}

export interface ActivityHeatmapData {
  date: string;
  count: number;
  level: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  color: string;
  progress?: number;
  target?: number;
}

export interface CompleteDashboardStats {
  total_xp: number;
  xp_gained_today: number;
  current_level: number;
  xp_in_current_level: number;
  xp_for_next_level: number;
  streak_days: number;
  personal_best_streak: number;
  problems_solved: number;
  completion_rate: number;
  total_interviews: number;
  average_interview_score: number;
  weekly_stats: WeeklyStats;
  performance_trend: PerformanceTrend;
  activity_heatmap: ActivityHeatmapData[];
  achievements: Achievement[];
  skill_levels: Record<string, number>;
}

// ── Constants ────────────────────────────────────────────────────────────────

export const TARGET_ROLES = [
  { value: "sde", label: "Software Development Engineer (SDE)" },
  { value: "cloud_engineer", label: "Cloud Engineer" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "qa", label: "QA Engineer" },
  { value: "ml_engineer", label: "ML Engineer" },
  { value: "fullstack_developer", label: "Full-Stack Developer" },
] as const;

export const COLLEGE_TIERS = [
  { value: "tier1", label: "Tier 1 (IITs, NITs, BITS, Top IIITs)" },
  { value: "tier2", label: "Tier 2 (Good State/Private Universities)" },
  { value: "tier3", label: "Tier 3 (Other Colleges)" },
] as const;

export const DEGREES = [
  "B.Tech", "B.E.", "BCA", "B.Sc CS", "MCA", "M.Tech", "M.Sc", "Other",
] as const;

export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "ta", label: "தமிழ் (Tamil)" },
  { value: "te", label: "తెలుగు (Telugu)" },
  { value: "bn", label: "বাংলা (Bengali)" },
  { value: "mr", label: "मराठी (Marathi)" },
] as const;

export const TARGET_COMPANIES = [
  "Amazon", "Google", "Microsoft", "Meta", "Apple",
  "Flipkart", "Infosys", "TCS", "Wipro", "HCL",
  "Paytm", "Razorpay", "Zomato", "Swiggy", "PhonePe",
  "Atlassian", "Adobe", "Salesforce", "Oracle", "SAP",
] as const;

export const TASK_TYPE_COLORS: Record<string, string> = {
  learn: "bg-primary/15 text-primary",
  practice: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  review: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  interview: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  project: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  quiz: "bg-secondary text-secondary-foreground",
};
