# 🎓 Campus-for-Hire — AI-Powered Placement Preparation Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.133-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-FF9900?style=for-the-badge&logo=amazon-aws)
![AWS Polly](https://img.shields.io/badge/AWS-Polly-FF9900?style=for-the-badge&logo=amazon-aws)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwind-css)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A personalized, AI-driven campus placement preparation platform for Indian students — from Tier-1 IITs to Tier-3 colleges.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [API Endpoints](#-api-endpoints) • [Architecture](#️-architecture)

</div>

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **🗺️ AI Roadmap Generation** | Personalized weekly roadmaps based on student profile, skills, and target role — powered by Amazon Bedrock; enriched with curated resource context |
| **📅 Daily Action Plans** | Bite-sized daily tasks with time estimates, balanced across theory, coding practice, and interview prep; synced with roadmap progress and supports advance-to-next-day |
| **💬 Mock Interviews** | AI-powered interview simulation with role-specific questions, structured evaluation, and detailed feedback |
| **🎙️ Voice Interviews** | Text-to-speech interview questions via Amazon Polly with voice input support; language-aware voices for all supported Indian languages |
| **📄 JD Skill-Gap Analysis** | Paste any job description and instantly see how your skills stack up against requirements |
| **🌐 Real-Time Language Switching** | In-app language switcher (English, Hindi, Tamil, Telugu, Bengali, Marathi) with translation caching and profile preference sync |
| **📊 Gamified Progress Dashboard** | XP system, level progression, activity heatmap, skill radar, learning streaks, and weekly summaries |
| **🔐 Auth (Email + Google OAuth)** | Secure JWT-based authentication with email/password and Google OAuth 2.0 login |
| **🎨 Adaptive Theming** | Light/dark mode toggle, 5 accent color schemes (Gold, Blue, Green, Red, Violet), custom background image with opacity and glass-blur controls |
| **✨ Animated UI Components** | Aceternity UI components (Aurora Background, Bento Grid, Moving Border, Spotlight, Text Generate Effect), Magic UI, and Framer Motion animations |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 with adaptive light/dark theme and CSS variable–driven accent system
- **UI:** Lucide Icons, Framer Motion, Recharts, React Markdown, Aceternity UI, Magic UI
- **Theming:** `ThemeProvider` with light/dark toggle, 5 accent palettes, background image + glass controls
- **i18n:** `LanguageProvider` with real-time switching, translation caching, and Amazon Translate integration
- **Auth:** JWT tokens with context-based auth state

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Migrations:** Alembic (resources table, target_role, focus_area, Google ID)
- **AI/ML:** Amazon Bedrock (Claude) for roadmap generation, interview simulation, JD analysis
- **Text-to-Speech:** Amazon Polly for voice interview questions (neural engine, language-aware voices)
- **Translation:** Amazon Translate for multi-language support
- **Auth:** JWT (PyJWT) + bcrypt password hashing + Google OAuth 2.0
- **HTTP Client:** HTTPX for async external API calls

### Infrastructure
- **Containerization:** Docker & Docker Compose (dev + production `docker-compose.prod.yml`)
- **Reverse Proxy:** Nginx
- **Cloud:** AWS (Bedrock, Translate, Polly, S3)
- **Region:** ap-south-1 (Mumbai) for low-latency India access

---

## 📦 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- **PostgreSQL** ≥ 14 (or Docker)
- **AWS credentials** (for Bedrock & Translate features)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Campus-for-hire.git
cd Campus-for-hire
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, AWS keys, etc.

# Start PostgreSQL (via Docker, optional)
docker compose up -d db

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check: `http://localhost:8000/health`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start the dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```
Campus-for-hire/
├── README.md                    # ← You are here
├── requirements.md              # Detailed product requirements
├── design.md                    # System architecture & design doc
│
├── backend/                     # FastAPI backend
│   ├── main.py                  # Entry point
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Container config
│   ├── docker-compose.yml       # Local dev services
│   ├── alembic.ini              # Migration config
│   ├── alembic/                 # Database migrations
│   │   └── versions/            # Migration scripts
│   ├── app/
│   │   ├── main.py              # FastAPI app factory
│   │   ├── auth.py              # JWT & auth utilities
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models.py            # ORM models (Users, Roadmaps, etc.)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── middleware/          # Error handling, rate limiting
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # Login, register, Google OAuth
│   │   │   ├── profile.py       # User profile & progress
│   │   │   ├── roadmap.py       # AI roadmap generation
│   │   │   ├── daily_plan.py    # Daily task management
│   │   │   ├── interview.py     # Mock interview sessions
│   │   │   ├── jd.py            # JD skill-gap analysis
│   │   │   ├── dashboard.py     # Dashboard stats
│   │   │   ├── content.py       # Content delivery
│   │   │   ├── translate.py     # Translation endpoint
│   │   │   └── progress.py      # Progress tracking
│   │   ├── services/            # Business logic
│   │   │   ├── bedrock.py       # Amazon Bedrock AI client
│   │   │   ├── content_service.py
│   │   │   ├── prompts.py       # AI prompt templates
│   │   │   └── translate.py     # Amazon Translate client
│   │   └── utils/               # Logging, response helpers
│   ├── nginx/                   # Nginx reverse proxy config
│   └── scripts/                 # Startup scripts
│
├── frontend/                    # Next.js frontend
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── globals.css      # Adaptive light/dark theme & CSS variable design system
│       │   ├── layout.tsx       # Root layout with auth, theme & language providers
│       │   ├── page.tsx         # Landing page
│       │   ├── login/           # Auth (email + Google OAuth)
│       │   ├── onboarding/      # 4-step profile setup
│       │   ├── dashboard/       # Protected dashboard
│       │   │   ├── layout.tsx   # Sidebar with ThemeToggle, AccentPicker, BackgroundImagePicker, LanguageSwitcher
│       │   │   ├── page.tsx     # Dashboard overview (XP, levels, heatmap, skill radar)
│       │   │   ├── roadmap/     # AI-generated roadmap viewer (resource links & task tracking)
│       │   │   ├── today/       # Daily task tracker (roadmap-synced, advance-to-next-day)
│       │   │   ├── interview/   # Mock interview chat + voice playback
│       │   │   └── jd-analyze/  # JD skill-gap analyzer
│       │   └── auth/callback/   # OAuth callback handler
│       ├── components/
│       │   ├── ThemeToggle.tsx      # ThemeToggle, AccentPicker, BackgroundImagePicker
│       │   ├── LanguageSwitcher.tsx # Real-time language switcher dropdown
│       │   ├── Logo.tsx
│       │   ├── HeroUIProviderWrapper.tsx
│       │   ├── aceternity/          # AuroraBackground, BentoGrid, GridBackground, MovingBorder, Spotlight, TextGenerateEffect
│       │   ├── magic/               # Magic UI components
│       │   ├── skeletons/           # Loading skeleton components
│       │   └── ui/                  # shadcn/ui primitives (DropdownMenu, Form, Input, Progress, Tabs, …)
│       ├── lib/
│       │   ├── api.ts               # API client (fetch wrappers)
│       │   ├── auth-context.tsx     # React auth context & provider
│       │   ├── auth.ts              # Auth utilities
│       │   ├── theme-context.tsx    # ThemeProvider (light/dark, accent, background image, glass)
│       │   ├── language-context.tsx # LanguageProvider (language, t(), translateText())
│       │   ├── translations.ts      # Static translation strings
│       │   ├── interview-voice.ts   # Amazon Polly voice client
│       │   └── utils.ts             # General utilities
│       └── types/
│           └── index.ts         # TypeScript types & constants
│
└── Plan/                        # Planning docs
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register with email/password |
| `POST` | `/api/auth/login` | Login with email/password |
| `GET`  | `/api/auth/google/login` | Initiate Google OAuth flow |
| `GET`  | `/api/auth/google/callback` | Google OAuth callback |
| `GET`  | `/api/auth/me` | Get current user profile |

### Profile & Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT`  | `/api/profile` | Update user profile (incl. `preferred_language`) |
| `GET`  | `/api/profile/progress` | Get progress statistics |
| `GET`  | `/api/profile/stats` | Get dashboard stats |

### Progress Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/progress/overview` | Full progress overview (XP, streak, skill radar) |
| `GET`  | `/api/progress/roadmap` | Roadmap completion % and per-week breakdown |
| `GET`  | `/api/progress/streak` | Learning streak (current & longest) |
| `GET`  | `/api/progress/weekly` | Weekly summary report |

### Roadmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/roadmap/generate` | Generate AI roadmap |
| `GET`  | `/api/roadmap/active` | Get active roadmap |

### Daily Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/daily-plan/today` | Get today's plan |
| `POST` | `/api/daily-plan/task/{id}/complete` | Toggle task completion |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/start` | Start mock interview |
| `POST` | `/api/interview/{id}/respond` | Send interview response |
| `POST` | `/api/interview/{id}/end` | End & score interview |

### Voice (Amazon Polly)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/voice/synthesize` | Convert interview text to speech (language-aware neural voice) |

### JD Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/jd/analyze` | Analyze job description |

### Translation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/translate` | Translate content |

---

## 🏗️ Architecture

```
┌─────────────────────────┐
│   Next.js 16 Frontend   │  ← Adaptive UI (Light/Dark + 5 Accent Themes)
│   (React 19 + Tailwind) │    ThemeProvider · LanguageProvider · Auth
└───────────┬─────────────┘
            │ HTTPS
┌───────────▼─────────────┐
│    FastAPI Backend       │  ← JWT Auth, REST API
│    (Python 3.12)         │
├──────────┬──────────────┤
│          │              │
│  ┌───────▼──────┐ ┌────▼────────────────────┐
│  │ PostgreSQL   │ │ Amazon Bedrock (Claude)  │  ← AI roadmap, interviews, JD
│  │ (SQLAlchemy) │ │ Amazon Translate          │  ← Multi-language
│  └──────────────┘ │ Amazon Polly              │  ← Voice synthesis
│                   └──────────────────────────┘
```

### Key Design Decisions

- **Serverless-ready**: FastAPI backend designed for AWS Lambda deployment via Mangum
- **AI-first**: All personalization powered by Amazon Bedrock (Claude) with structured prompts
- **Mobile-responsive**: PWA-ready design optimized for smartphone access
- **Offline-friendly**: Minimal bundle size, lazy loading, 2G/3G optimized
- **Multi-tenant**: User isolation via JWT claims and row-level DB filtering
- **Theme-agnostic UI**: All colors driven by CSS custom properties; no hardcoded palette
- **Voice-enabled**: Amazon Polly neural TTS integrated directly into the interview flow

---

## 🎨 UI Theming

The UI supports **Light** and **Dark** modes with **5 accent colour schemes**:

| Accent | Dark mode | Light mode |
|--------|-----------|------------|
| Gold *(default)* | `#c9a84c` | `#9a7b2e` |
| Blue   | `#3b82f6` | `#1d4ed8` |
| Green  | `#22c55e` | `#15803d` |
| Red    | `#ef4444` | `#b91c1c` |
| Violet | `#8b5cf6` | `#6d28d9` |

Additional customisation options available per-session:
- **Background image** — upload any image with adjustable opacity
- **Glass effect** — control surface transparency (solid → frosted glass)

All preferences (theme, accent) are persisted to `localStorage` with system preference detection on first visit.

---

## 🌍 Supported Languages

| Language | Code |
|----------|------|
| English | `en` |
| Hindi | `hi` |
| Tamil | `ta` |
| Telugu | `te` |
| Bengali | `bn` |
| Marathi | `mr` |

---

## � Recent Changes

### March 2026
- **🎨 Theme system overhaul** — full light/dark mode, 5 accent colour schemes (Gold, Blue, Green, Red, Violet), background image picker with opacity & glass-blur sliders; all preferences persisted to `localStorage` with system-preference detection
- **🌐 Real-time language switching** — `LanguageSwitcher` dropdown in dashboard sidebar; language preference synced to user profile via API; translation results cached per session
- **🎙️ Voice interviews** — Amazon Polly neural TTS integrated at `/api/interview/voice/synthesize`; language-aware voice selection (Joanna for English, Kajal for Indian languages); voice input support in interview UI
- **📊 Gamified dashboard** — XP calculation, level display, activity heatmap, skill radar chart, learning streak tracking, and weekly summary via new `/api/progress/*` endpoints
- **🗺️ Roadmap enrichment** — `target_role` field added to roadmap responses; AI prompts enriched with curated resource context; per-task resource links surfaced in the roadmap viewer
- **📅 Daily plan sync** — `focus_area` field added to daily plan responses; task completion now bidirectionally synced with the roadmap; advance-to-next-day action implemented
- **✨ Animated UI library** — Aceternity UI components added (AuroraBackground, BentoGrid, GridBackground, MovingBorder with gradient animation, Spotlight, TextGenerateEffect); Magic UI components; Framer Motion animations throughout
- **🗄️ Database migrations** — new `resources` table (seeded via `scripts/seed_resources.py`); `target_role` & `focus_area` columns on roadmap/daily-plan tables; `google_id` column on users table
- **🐳 Production Docker** — `docker-compose.prod.yml` added for production deployments

---

## �📄 License

This project is for educational and portfolio purposes. All rights reserved.

---

<div align="center">

**Built with ❤️ for Indian students preparing for campus placements**

</div>
