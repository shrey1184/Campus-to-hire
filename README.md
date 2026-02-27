# 🎓 Campus-to-Hire — AI-Powered Placement Preparation Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.133-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS Bedrock](https://img.shields.io/badge/AWS-Bedrock-FF9900?style=for-the-badge&logo=amazon-aws)
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
| **🗺️ AI Roadmap Generation** | Personalized weekly roadmaps based on student profile, skills, and target role — powered by Amazon Bedrock |
| **📅 Daily Action Plans** | Bite-sized daily tasks with time estimates, balanced across theory, coding practice, and interview prep |
| **💬 Mock Interviews** | AI-powered interview simulation with role-specific questions, evaluation, and detailed feedback |
| **📄 JD Skill-Gap Analysis** | Paste any job description and instantly see how your skills stack up against requirements |
| **🌐 Multi-Language Support** | Content in Hindi, Tamil, Telugu, Bengali, and Marathi with technical terms preserved in English |
| **📊 Progress Dashboard** | Track your journey with skill levels, streak counters, completion stats, and readiness scores |
| **🔐 Auth (Email + Google OAuth)** | Secure JWT-based authentication with email/password and Google OAuth 2.0 login |
| **🎨 Cyberpunk UI** | Dark theme with neon pink & purple accents, glowing panels, and smooth animations |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 with custom cyberpunk theme
- **UI:** Lucide Icons, Framer Motion, Recharts, React Markdown
- **Auth:** JWT tokens with context-based auth state

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL with SQLAlchemy ORM
- **Migrations:** Alembic
- **AI/ML:** Amazon Bedrock (Claude) for roadmap generation, interview simulation, JD analysis
- **Translation:** Amazon Translate for multi-language support
- **Auth:** JWT (PyJWT) + bcrypt password hashing + Google OAuth 2.0
- **HTTP Client:** HTTPX for async external API calls

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx
- **Cloud:** AWS (Bedrock, Translate, S3)
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
│       │   ├── globals.css      # Cyberpunk theme & design system
│       │   ├── layout.tsx       # Root layout with auth provider
│       │   ├── page.tsx         # Landing page
│       │   ├── login/           # Auth (email + Google OAuth)
│       │   ├── onboarding/      # 4-step profile setup
│       │   ├── dashboard/       # Protected dashboard
│       │   │   ├── page.tsx     # Dashboard overview
│       │   │   ├── roadmap/     # AI-generated roadmap viewer
│       │   │   ├── today/       # Daily task tracker
│       │   │   ├── interview/   # Mock interview chat
│       │   │   └── jd-analyze/  # JD skill-gap analyzer
│       │   └── auth/callback/   # OAuth callback handler
│       ├── lib/
│       │   ├── api.ts           # API client (fetch wrappers)
│       │   ├── auth-context.tsx # React auth context & provider
│       │   ├── auth.ts          # Auth utilities
│       │   └── utils.ts         # General utilities
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
| `PUT`  | `/api/profile` | Update user profile |
| `GET`  | `/api/profile/progress` | Get progress statistics |
| `GET`  | `/api/profile/stats` | Get dashboard stats |

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
│   Next.js 16 Frontend   │  ← Cyberpunk UI (Black/Pink/Purple)
│   (React 19 + Tailwind) │
└───────────┬─────────────┘
            │ HTTPS
┌───────────▼─────────────┐
│    FastAPI Backend       │  ← JWT Auth, REST API
│    (Python 3.12)         │
├──────────┬──────────────┤
│          │              │
│  ┌───────▼──────┐ ┌────▼────────────┐
│  │ PostgreSQL   │ │ Amazon Bedrock  │  ← AI (Claude)
│  │ (SQLAlchemy) │ │ Amazon Translate│  ← Multi-language
│  └──────────────┘ └─────────────────┘
```

### Key Design Decisions

- **Serverless-ready**: FastAPI backend designed for AWS Lambda deployment via Mangum
- **AI-first**: All personalization powered by Amazon Bedrock (Claude) with structured prompts
- **Mobile-responsive**: PWA-ready design optimized for smartphone access
- **Offline-friendly**: Minimal bundle size, lazy loading, 2G/3G optimized
- **Multi-tenant**: User isolation via JWT claims and row-level DB filtering

---

## 🎨 UI Theme

The UI uses a **Cyberpunk** aesthetic with:

- **Background**: Deep black (`#0a0a0f`) with subtle purple grid overlay
- **Primary**: Hot pink (`#ff2d9b`) — buttons, accents, active states
- **Secondary**: Electric purple (`#bf5fff`) — hover effects, borders, glows
- **Panels**: Frosted glass with pink/purple neon edge lighting
- **Animations**: Shimmer effects on buttons, pulse animations on loading states

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

## 📄 License

This project is for educational and portfolio purposes. All rights reserved.

---

<div align="center">

**Built with ❤️ for Indian students preparing for campus placements**

</div>
