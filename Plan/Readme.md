 Plan: Complete Missing Features to Win the Hackathon
  
 STATUS: All 8 original items DONE. Remaining work below.

 Context

 Campus-to-Hire is an AI-powered personalized learning platform for Indian students, built for the AI for Bharat
 Hackathon. The core features (auth, onboarding, roadmap generation, daily plans, mock interviews, JD analysis,
 dashboard) are all functional. However, the #1 differentiator promised by the project — multi-language support for      
 non-English students — is not actually working in the UI. Additionally, dashboard fallback data is misleading, error    
 handling is incomplete, and loading states are basic spinners instead of polished skeletons. This plan addresses these  
 gaps to maximize hackathon impact.

 ---
 Implementation Plan (Priority Order)

 1. Multi-Language UI Integration (CRITICAL - The Differentiator)

 The landing page promises Hindi/Tamil/Telugu support. The backend POST /api/translate and POST
 /api/content/translate-roadmap endpoints work. The frontend stores preferred_language in the user profile. But nothing  
 in the UI actually translates. This is the single biggest gap.

 Approach: Create a LanguageProvider context + static translation dictionary for UI chrome, plus on-demand translation   
 for dynamic AI content.

 1a. Static UI translations

 Create frontend/src/lib/translations.ts
 - Dictionary of ~80 UI string keys (nav.dashboard, nav.roadmap, dashboard.heading, today.title, etc.)
 - Translations for en and hi (Hindi is the highest-impact demo language; add ta/te as stretch)
 - Helper function t(key, language) for synchronous lookup

 Create frontend/src/lib/language-context.tsx
 - React context reading user.preferred_language from useAuth()
 - Exposes: language, setLanguage(code), t(key) (static), translateText(text) (dynamic, calls API + caches)
 - Translation cache (Map<string, string>) to avoid redundant API calls

 1b. Language switcher component

 Create frontend/src/components/LanguageSwitcher.tsx
 - Globe icon + current language label
 - Dropdown with supported languages (en, hi, ta, te, bn, mr)
 - On select: calls profileApi.update({ preferred_language: code }), updates context

 Modify frontend/src/app/dashboard/layout.tsx
 - Add <LanguageSwitcher /> in sidebar (desktop, above sign-out) and mobile header
 - Replace hardcoded NAV_ITEMS labels with t() calls

 Modify frontend/src/app/layout.tsx
 - Wrap app in <LanguageProvider> inside <AuthProvider>

 1c. Translate dashboard + page headings

 Modify these pages to use t() for all headings, labels, and button text:
 - frontend/src/app/dashboard/page.tsx — section titles, stat labels, CTA buttons
 - frontend/src/app/dashboard/today/page.tsx — page title, task labels
 - frontend/src/app/dashboard/roadmap/page.tsx — page title, generate button text
 - frontend/src/app/dashboard/interview/page.tsx — page title, role labels
 - frontend/src/app/dashboard/jd-analyze/page.tsx — page title, button text

 1d. Roadmap content translation

 Modify frontend/src/lib/api.ts
 - Add contentApi.translateRoadmap(roadmapId, targetLanguage) calling POST /api/content/translate-roadmap

 Modify frontend/src/app/dashboard/roadmap/page.tsx
 - Add "Translate Roadmap" toggle button (visible when language !== 'en')
 - On click: call contentApi.translateRoadmap(), swap displayed content
 - Cache translated content in component state

 1e. Interview in preferred language (HIGH demo impact, small change)

 Modify backend/app/routers/interview.py (in the /start endpoint)
 - Read current_user.preferred_language
 - If not en, append to the system prompt: "Conduct this interview primarily in {language_name}. Keep technical terms    
 (data structures, algorithms, API names) in English but explain and converse in {language_name}."
 - Reuse existing INTERVIEW_SYSTEM_PROMPT from backend/app/services/prompts.py

 Complexity: L (3-4 hours total) | Impact: CRITICAL

 ---
 2. Dashboard Mock Data Cleanup

 When a fresh user has no data, the dashboard shows fake performance trends and activity heatmaps. Judges will notice.   

 Modify frontend/src/app/dashboard/page.tsx
 - Performance trend fallback (~line 111): Change [2, 3, 4, 3, 5, 4, 6] to [0, 0, 0, 0, 0, 0, 0]
 - Activity heatmap fallback (~line 120, buildFallbackActivity ~line 679): Replace fake activity patterns with all-zero  
 entries
 - Weekly stats fallback (~line 97-102): Show zeros instead of guesses
 - Add an empty-state overlay on performance chart and heatmap when all values are 0: "Complete your first task to see   
 trends here"

 Complexity: S (30 min) | Impact: HIGH

 ---
 3. Error Handling & User Feedback

 Prevent blank screens and silent failures during demo.

 Modify frontend/src/app/dashboard/interview/page.tsx
 - handleStart, handleSend, handleEnd currently only console.error on failure
 - Add visible error banner (similar to roadmap page's error state pattern)

 Modify frontend/src/app/dashboard/today/page.tsx
 - handleToggle catch block needs user-visible error feedback

 Modify frontend/src/app/dashboard/page.tsx
 - If all dashboard API calls fail, show a "Could not load some data" banner instead of empty cards

 Modify frontend/src/app/dashboard/jd-analyze/page.tsx
 - Verify the existing error state renders in the UI (it does — just confirm)

 Complexity: M (1 hour) | Impact: MEDIUM-HIGH

 ---
 4. Loading Skeletons

 Replace generic spinners with content-shaped skeleton loaders for a professional feel.

 Create frontend/src/components/skeletons/DashboardSkeleton.tsx
 - Mimics dashboard layout: stat cards, chart areas, task list using animate-pulse + bg-muted

 Create frontend/src/components/skeletons/RoadmapSkeleton.tsx
 - 3-4 collapsed week card skeletons

 Create frontend/src/components/skeletons/TodaySkeleton.tsx
 - KPI row + 4-5 task card skeletons

 Modify pages to use skeletons instead of <Loader2> spinner:
 - frontend/src/app/dashboard/page.tsx (~line 183-192)
 - frontend/src/app/dashboard/roadmap/page.tsx (~line 94-103)
 - frontend/src/app/dashboard/today/page.tsx (~line 103-112)

 Complexity: M (1 hour) | Impact: MEDIUM

 ---
 5. Mobile Responsiveness Quick Pass

 The sidebar/bottom-nav layout is already built. Quick fixes:

 Modify frontend/src/app/dashboard/layout.tsx
 - Mobile bottom nav labels: "Today's" → "Today", "Mock" → "Interview" (cleaner)

 Modify frontend/src/app/dashboard/interview/page.tsx
 - Chat height calc: verify no overlap with mobile header (h-14) + bottom nav (h-14)
 - May need h-[calc(100vh-9rem)] lg:h-[calc(100vh-3rem)]

 Audit all dashboard pages on 375px width — fix any overflow issues.

 Complexity: S (30 min) | Impact: MEDIUM

 ---
 6. Demo Account Seeding Script

 Pre-populate a demo account so the dashboard looks impressive during the live demo.

 Create backend/scripts/seed_demo.py
 - Creates demo user: demo@campushire.com / demo123, onboarding complete, language=hi
 - Creates active roadmap with 4 weeks (2 weeks with task data)
 - Creates 5 daily plans with mixed completion (showing realistic heatmap/XP)
 - Creates 2 completed interviews with scores (75, 82)
 - Run with: python -m scripts.seed_demo

 Complexity: M (1 hour) | Impact: HIGH (demo safety net)

 ---
 8. Curated Resource Database (Real LeetCode + YouTube Links)

 Currently resources are AI-generated text URLs embedded in task JSON — generic and often hallucinated. Replace with a   
 structured Resource table seeded with real data from Striver's SDE Sheet and curated YouTube channels.

 Approach: Create a Resource model, auto-generate a seed file with ~190 LeetCode problems + ~50 YouTube videos, seed     
 into DB, add a query API, and wire into roadmap generation so AI picks from real resources.

 8a. Database model + migration

 Create Alembic migration for resources table:
 resources:
   id: UUID (PK)
   title: str (e.g. "Two Sum")
   topic: str (e.g. "Arrays", "Trees", "Dynamic Programming")
   sub_topic: str (e.g. "Two Pointers", "Binary Search")
   difficulty: str ("easy" | "medium" | "hard")
   resource_type: str ("leetcode" | "youtube" | "article" | "practice")
   url: str (e.g. "https://leetcode.com/problems/two-sum/")
   youtube_url: str | null (solution video link)
   platform: str ("leetcode" | "geeksforgeeks" | "youtube" | "neetcode")
   estimated_minutes: int | null
   tags: JSON (e.g. ["array", "hash-map", "easy"])
   created_at: datetime

 Modify backend/app/models.py
 - Add Resource SQLAlchemy model

 Modify backend/app/schemas.py
 - Add ResourceOut, ResourceFilter Pydantic schemas

 8b. Auto-generated seed data

 Create backend/scripts/seed_resources.py
 - ~190 problems from Striver's SDE Sheet organized by topic:
   - Arrays & Hashing (~25): Two Sum, Best Time to Buy/Sell Stock, Contains Duplicate, etc.
   - Strings (~15): Longest Substring Without Repeating, Valid Anagram, Group Anagrams, etc.
   - Linked List (~20): Reverse Linked List, Merge Two Sorted Lists, Linked List Cycle, etc.
   - Stacks & Queues (~15): Valid Parentheses, Min Stack, Next Greater Element, etc.
   - Binary Trees (~20): Inorder Traversal, Max Depth, Level Order Traversal, etc.
   - BST (~10): Validate BST, Kth Smallest, LCA of BST, etc.
   - Graphs (~20): Number of Islands, Clone Graph, Course Schedule, etc.
   - Dynamic Programming (~30): Climbing Stairs, Coin Change, Longest Common Subsequence, etc.
   - Greedy (~10): Jump Game, Activity Selection, etc.
   - Backtracking (~10): Subsets, Permutations, N-Queens, etc.
   - Binary Search (~10): Search in Rotated Array, Find Minimum, etc.
   - Heap (~5): Kth Largest, Merge K Sorted Lists, etc.
 - Each entry has: real LeetCode URL, difficulty, topic, estimated time
 - ~50 curated YouTube videos: NeetCode, Striver (takeUforward), CodeWithHarry (Hindi), Apna College (Hindi)
 - Run with: python -m scripts.seed_resources

 8c. Resource query API

 Create/Modify backend/app/routers/content.py
 - GET /api/resources?topic=Arrays&difficulty=easy&limit=10 — query resources with filters
 - GET /api/resources/topics — list all available topics with counts
 - GET /api/resources/random?topic=DP&count=5 — random selection for daily plans

 8d. Wire into roadmap generation

 Modify backend/app/services/prompts.py
 - Instead of hardcoding ~20 generic URLs in ROADMAP_SYSTEM_PROMPT, dynamically inject relevant resources per topic      
 - When generating Week N about "Arrays", query the Resource table for array problems and include real URLs in the       
 prompt context

 Modify backend/app/routers/roadmap.py
 - Before calling AI for week generation, fetch relevant resources from DB
 - Pass them as context: "Use ONLY these resources for tasks: [list of real URLs]"
 - This ensures every resource link in the roadmap is a real, working URL

 8e. Frontend resource display enhancement

 Modify frontend/src/app/dashboard/roadmap/page.tsx
 - Render resource type badges (LeetCode icon for problems, YouTube icon for videos)
 - Color-code by difficulty (green/yellow/red for easy/medium/hard)

 Modify frontend/src/types/index.ts
 - Extend ResourceRef type with difficulty, platform, youtube_url fields

 Complexity: L (2-3 hours) | Impact: HIGH — real working links vs AI hallucinations, impressive to judges

 ---
 7. Confetti on Milestones (Cherry on Top)

 Install canvas-confetti package

 Modify frontend/src/app/dashboard/today/page.tsx
 - When all tasks completed (allDone = true), fire confetti burst

 Modify frontend/src/app/dashboard/interview/page.tsx
 - When interview score >= 70, fire confetti

 Complexity: S (20 min) | Impact: LOW-MEDIUM (delightful)

 ---
 Implementation Order

 ┌──────┬──────────────────────────────────────────────────────┬───────────┬────────────┐
 │ Step │                         Item                         │ Est. Time │ Depends On │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 1    │ Dashboard mock data cleanup (#2)                     │ 30 min    │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 2    │ Resource DB table + seed data (#8a, 8b)              │ 1.5 hr    │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 3    │ Resource query API (#8c)                             │ 30 min    │ Step 2     │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 4    │ Wire resources into roadmap generation (#8d, 8e)     │ 1 hr      │ Step 3     │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 5    │ Language context + translations + switcher (#1a, 1b) │ 1.5 hr    │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 6    │ Wire translations into all pages (#1c)               │ 1 hr      │ Step 5     │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 7    │ Roadmap content translation (#1d)                    │ 45 min    │ Step 5     │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 8    │ Interview language support (#1e)                     │ 20 min    │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 9    │ Error handling (#3)                                  │ 1 hr      │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 10   │ Loading skeletons (#4)                               │ 1 hr      │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 11   │ Mobile responsiveness (#5)                           │ 30 min    │ —          │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 12   │ Demo seed script (#6)                                │ 1 hr      │ Step 2     │
 ├──────┼──────────────────────────────────────────────────────┼───────────┼────────────┤
 │ 13   │ Confetti (#7)                                        │ 20 min    │ —          │
 └──────┴──────────────────────────────────────────────────────┴───────────┴────────────┘

 Total: ~10.5 hours

 Parallelization strategy:
 - Steps 1, 2, 5, 8, 9, 10, 11 can all start in parallel (no dependencies)
 - Steps 3→4 are sequential (need Resource table first)
 - Steps 5→6→7 are sequential (need LanguageProvider first)
 - Step 12 depends on Step 2 (needs Resource table for seeding demo data with real resources)

 ---
 Key Files Reference

 ┌───────────────────────────────────────────────┬───────────────────────────────────────────────────────────────┐       
 │                     File                      │                             Role                              │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/lib/api.ts                       │ All API client functions — add contentApi.translateRoadmap    │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/lib/auth-context.tsx             │ Auth context — user.preferred_language lives here             │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/app/dashboard/layout.tsx         │ Sidebar + mobile nav — add LanguageSwitcher, translate labels │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/app/dashboard/page.tsx           │ Main dashboard — fix mock data, add translations              │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/app/dashboard/roadmap/page.tsx   │ Roadmap — add translate toggle                                │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/app/dashboard/today/page.tsx     │ Daily plan — add translations, error handling, confetti       │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ frontend/src/app/dashboard/interview/page.tsx │ Interview — add error handling, confetti                      │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/routers/interview.py              │ Interview start — add language to system prompt               │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/routers/content.py                │ Already has translate-roadmap endpoint (reuse)                │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/services/prompts.py               │ System prompts — reference for language injection             │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/services/translate.py             │ Amazon Translate wrapper (already works)                      │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/models.py                         │ Add Resource SQLAlchemy model                                 │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/app/schemas.py                        │ Add ResourceOut, ResourceFilter schemas                       │       
 ├───────────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤       
 │ backend/scripts/seed_resources.py             │ Auto-generated seed data (~240 curated resources)             │       
 └───────────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘       

 ---
 ---
 REMAINING TASK: Fill Missing Language Translations

 Context

 The custom LanguageProvider and translations.ts are working with 168 keys for English and Hindi. However, Tamil,        
 Telugu, Bengali, and Marathi dictionaries are empty. This means if a user selects any of these 4 languages, they'll see 
  English fallback text (or raw translation keys).

 Approach

 Keep the existing custom translation system (no library switch). Auto-generate all 168 translation keys for the 4       
 missing languages.

 Implementation

 Modify frontend/src/lib/translations.ts
 - Fill the ta (Tamil) dictionary with all 168 keys translated to Tamil
 - Fill the te (Telugu) dictionary with all 168 keys translated to Telugu
 - Fill the bn (Bengali) dictionary with all 168 keys translated to Bengali
 - Fill the mr (Marathi) dictionary with all 168 keys translated to Marathi
 - Use natural, colloquial language (same style as Hindi translations)
 - Keep technical terms in English (DSA, LeetCode, API, etc.)
 - Keep proper nouns and brand names untranslated

 Complexity: M (1 hour) | Impact: HIGH — completes the multi-language promise

 ---
 Verification

 1. Fresh user flow: Register → onboarding (select Hindi) → generate roadmap → view daily plan → complete task → mock    
 interview → analyze JD → check dashboard → verify all pages show Hindi UI labels
 2. Language switch: Change language to English via switcher → all labels revert → change to Tamil → labels update       
 3. Roadmap translation: Generate roadmap → click "Translate" → task titles/descriptions appear in Hindi → toggle back   
 to English
 4. Interview in Hindi: Start interview with Hindi preference → AI asks questions in Hindi with English technical terms  
 5. Empty state: New user with no data → dashboard shows zeros and "get started" prompts, not fake data
 6. Error resilience: Kill backend → frontend shows error banners, not blank screens
 7. Mobile: Open on 375px width → all pages usable, no overflow, bottom nav works
 8. Demo account: Run seed script → login as demo@campushire.com → dashboard shows rich data (XP, streak, heatmap,       
 interviews)
╌╌╌╌╌╌╌╌╌╌╌╌╌╌