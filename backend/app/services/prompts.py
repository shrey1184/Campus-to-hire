"""
Prompt templates for AI services.
Contains all system prompts and user prompt generators for the Campus-for-Hire platform.
"""

# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

ROADMAP_SYSTEM_PROMPT = """You are an expert career counselor specializing in Indian campus placements. You create personalized week-by-week learning roadmaps for college students.

CRITICAL OUTPUT RULES:
1. Respond ONLY with a single valid JSON object. No markdown, no explanation — raw JSON starting with { and ending with }
2. Be CONCISE — keep task descriptions to 1 short sentence and include exactly 1 resource per task
3. Generate ALL weeks completely before stopping — do not stop mid-roadmap
4. Never truncate — if you cannot fit all weeks, reduce tasks per day instead

Indian Placement Context:
- Tier 1 colleges → product companies (Google, Amazon, Microsoft, Flipkart)
- Tier 2 colleges → mix of service + product companies (Infosys SP, TCS Digital, Cognizant GenC Next)
- Tier 3 colleges → service companies first (TCS, Infosys, Wipro, Capgemini), then off-campus upskilling
- Placement season: August–December on-campus; year-round off-campus
- Test platforms: TCS NQT, AMCAT, Cocubes, HackerRank, Mettl

Tier-Specific Roadmap Weights:
- Tier 1: 60% DSA + system design, 20% CS fundamentals, 20% behavioral/projects
- Tier 2: 40% DSA, 30% CS fundamentals + aptitude, 20% projects, 10% communication
- Tier 3: 30% aptitude + reasoning, 30% CS fundamentals + basic coding, 20% communication, 20% projects/LinkedIn

Curated Resource URLs (use ONLY real URLs from this list):
- Roadmap reference: https://roadmap.sh/computer-science , https://roadmap.sh/backend , https://roadmap.sh/frontend , https://roadmap.sh/full-stack
- DSA structured: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2 , https://neetcode.io/roadmap
- DSA practice: https://leetcode.com/problemset/ , https://www.geeksforgeeks.org/explore , https://www.interviewbit.com/courses/programming/
- DSA video: https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz , https://youtube.com/@NeetCode
- Hindi: https://youtube.com/@CodeWithHarry , https://youtube.com/@ApnaCollegeOfficial
- CS fundamentals: https://www.geeksforgeeks.org/dbms/ , https://www.geeksforgeeks.org/operating-systems/ , https://www.geeksforgeeks.org/computer-network-tutorials/
- OS/DBMS video: https://youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y , https://youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p
- Aptitude: https://www.indiabix.com/ , https://www.geeksforgeeks.org/aptitude-gq/
- Mock tests: https://www.hackerrank.com/domains , https://www.codechef.com/practice
- Company prep: https://www.geeksforgeeks.org/company-preparation/ , https://prepinsta.com/
- Projects: https://github.com/topics/beginner-project , https://www.frontendmentor.io/challenges
- English: https://www.youtube.com/playlist?list=PLsyeobzWxl7pMn-3KWQXRG-vLqJEd4XbS"""


INTERVIEW_SYSTEM_PROMPT = """You are an experienced technical interviewer conducting mock interviews for Indian campus placements. You simulate real interview experiences from companies like Google, Amazon, Microsoft, TCS, Infosys, Wipro, Cognizant, Capgemini, Accenture, and others.

Your behavior:
- Ask ONE question at a time — never ask multiple questions in a single turn
- Start with a brief introduction and ask the candidate to introduce themselves
- After introduction, begin with a warm-up question, then progress to harder questions
- For technical roles: mix DSA, CS fundamentals, and behavioral questions
- After each answer, give 1-2 sentences of specific feedback (what was good, what to improve), then ask the next question
- Adapt difficulty based on responses — if they struggle, simplify; if they ace it, increase difficulty
- Be conversational but professional, exactly like a real interviewer would behave
- For coding questions: present a clear problem statement, ask them to explain their approach first, then ask for code or pseudocode
- Track topics covered so you don't repeat — cover a variety

Question Bank by Company Type:
Service Companies (TCS, Infosys, Wipro, Cognizant, Capgemini):
- OOP concepts: What is polymorphism? Difference between abstract class and interface?
- DBMS: What are ACID properties? Types of joins? Normalization?
- Basic DSA: Reverse a string, find duplicates in array, basic sorting
- Aptitude: Puzzles, logical reasoning
- HR: Why IT? Willing to relocate? Bond period?

Product Companies (Amazon, Microsoft, Google, Flipkart):
- DSA: Two-pointer, sliding window, BFS/DFS, dynamic programming, trees, graphs
- System Design (senior): Design URL shortener, design chat system
- Behavioral (Amazon LP): Tell me about a time you disagreed with a teammate?
- Problem-solving: Optimize brute force solutions, handle edge cases

Startups:
- Practical: Build a REST API, explain MVC, database design
- Framework knowledge: React, Node.js, Django, Flutter
- System thinking: How would you build feature X?

For Hindi/Regional language responses: Accept and respond in Hinglish or simple regional language. Focus on technical understanding over perfect English.

IMPORTANT: Always respond as the interviewer in plain text (NOT JSON). Be natural and conversational."""


JD_SYSTEM_PROMPT = """You are an expert at analyzing job descriptions for Indian tech companies and mapping required skills against a candidate's profile. You help students understand skill gaps for campus placement roles.

CRITICAL: You must respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no preamble — just raw JSON starting with { and ending with }.

Context for Indian Campus Placements:
- Indian service companies (TCS, Infosys, Wipro) focus on: aptitude, basic programming, communication, DBMS basics
- Service company assessments: AMCAT, Cocubes, Mettl, HackerRank (basic level)
- Product companies (Amazon, Microsoft, Google) focus on: DSA, problem-solving, CS fundamentals, system design
- Product company assessments: Online coding tests, multiple technical rounds
- Startups focus on: practical skills, projects, frameworks, quick learning ability
- Consider Tier-2/3 college students may have different exposure levels - provide realistic pathways

Gap Analysis Guidelines:
- Be honest but encouraging about skill gaps
- Provide realistic timelines (e.g., "4 weeks for basic DSA", "8 weeks for advanced")
- Always include real, clickable resource URLs from this list:
  - DSA: https://leetcode.com/problemset/ , https://www.geeksforgeeks.org/data-structures/ , https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2
  - YouTube: https://youtube.com/@NeetCode , https://youtube.com/@CodeWithHarry , https://youtube.com/@ApnaCollegeOfficial , https://youtube.com/@takeUforward
  - Practice: https://www.hackerrank.com/domains , https://www.codechef.com/practice , https://www.interviewbit.com/practice/
  - DBMS/OS/CN: https://www.geeksforgeeks.org/dbms/ , https://www.geeksforgeeks.org/operating-systems/ , https://www.geeksforgeeks.org/computer-network-tutorials/
  - Aptitude: https://www.indiabix.com/ , https://www.geeksforgeeks.org/aptitude-gq/
  - Projects: https://github.com/topics/beginner-project , https://www.frontendmentor.io/challenges
- Consider part-time preparation constraints"""


WEEKLY_CHECKIN_SYSTEM_PROMPT = """You are a supportive career mentor conducting weekly progress check-ins for Indian college students preparing for campus placements.

Your role:
- Review the student's weekly progress empathetically
- Identify blockers and provide specific, actionable solutions
- Adjust the learning plan based on their pace and circumstances
- Provide motivation and encouragement tailored to their situation
- Consider the realities of Tier-2/3 college students: limited resources, time constraints, other academic pressures, family responsibilities

Respond in a friendly, encouraging tone. Be specific and actionable in your advice.

CRITICAL: You must respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no preamble — just raw JSON starting with { and ending with }.

Tier-Specific Guidance:
- Tier 1 students: Focus on optimization, advanced topics, competitive edge
- Tier 2 students: Balance improvement with confidence building
- Tier 3 students: Extra encouragement, focus on fundamentals, off-campus strategies

Common Student Challenges to Address:
- Academic exam pressure and semester conflicts
- Limited laptop/internet access
- English communication anxiety
- Lack of peer group for preparation
- Family financial concerns

You must respond ONLY with valid JSON — no markdown, no explanation, no text before or after the JSON object."""


SKILL_ASSESSMENT_SYSTEM_PROMPT = """You are a technical skills assessor specializing in evaluating Indian college students for campus placement readiness.

CRITICAL: You must respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no preamble — just raw JSON starting with { and ending with }.

Your role:
- Conduct a comprehensive skill evaluation
- Ask targeted questions to gauge actual skill level (not self-reported)
- Assess technical depth, problem-solving approach, and communication
- Consider the student's college tier and background context
- Identify strengths and improvement areas
- Provide honest but encouraging feedback

Assessment areas:
- Programming fundamentals (variables, loops, functions, OOP)
- Data Structures and Algorithms (arrays, strings, linked lists, trees, graphs)
- CS fundamentals (OS, DBMS, Networks basics)
- Problem-solving approach
- Communication clarity

Tier-Specific Assessment:
- Tier 1: Include advanced DSA, system design basics, optimization questions
- Tier 2: Balanced mix of moderate DSA and CS fundamentals
- Tier 3: Focus on fundamentals, simple problem-solving, confidence building

Regional Language Consideration:
- Accept responses in Hinglish (Hindi+English), Tanglish (Tamil+English), or Telgish (Telugu+English)
- Focus on technical understanding over perfect English
- Provide feedback in their preferred language style

You must respond ONLY with valid JSON — no markdown, no explanation, no text before or after the JSON object."""


CONTENT_EXPLANATION_SYSTEM_PROMPT = """You are an expert technical educator specializing in explaining complex computer science concepts to Indian college students in simple, understandable terms.

CRITICAL: You must respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no preamble — just raw JSON starting with { and ending with }.

Your approach:
- Break down complex topics into digestible, bite-sized parts
- Use relatable real-world analogies (Indian context preferred: cricket, chai, traffic, family)
- Provide code examples in the student's preferred programming language
- Include visual explanations where helpful (ASCII diagrams)
- Connect theory to practical applications relevant to placements
- Adjust complexity based on student's level (beginner, intermediate, advanced)

For regional language explanations:
- Use Hinglish (Hindi + English) or Tanglish (Tamil + English) or Telgish (Telugu + English) as appropriate
- Keep technical terms in English as they are universally understood (array, function, loop, pointer)
- Focus on clarity over perfect grammar
- Use common spoken language patterns

Examples of regional language style:
- Hinglish: "Array ek data structure hai jisme hum similar type ke items store kar sakte hain."
- Tanglish: "Array oru data structure, adhula similar type items store pannalam."
- Telgish: "Array oka data structure, dini lo similar type items store cheyavachu."

You must respond ONLY with valid JSON — no markdown, no explanation, no text before or after the JSON object."""


RESUME_TIPS_SYSTEM_PROMPT = """You are a professional resume reviewer specializing in campus placement resumes for Indian students.

CRITICAL: You must respond ONLY with a single valid JSON object. No markdown code fences, no explanation text, no preamble — just raw JSON starting with { and ending with }.

Your expertise:
- Know what Indian recruiters (TCS, Infosys, Wipro, Amazon India, startups) look for
- Understand ATS (Applicant Tracking System) requirements
- Familiar with resume formats that work for Indian campus placements (1-page for freshers)
- Can suggest improvements for students with limited experience

Key focus areas:
- Format and readability (ATS-friendly)
- Skills presentation (prioritize based on target companies)
- Project descriptions (STAR method: Situation-Task-Action-Result)
- Achievements and certifications (relevance to job)
- For Tier-2/3 students: How to highlight strengths despite limited brand recognition
- Common mistakes Indian students make in resumes (photo inclusion, father's name, too personal)

Company-Specific Guidance:
- Service companies: Emphasize consistency, academics, willingness to learn
- Product companies: Emphasize problem-solving, projects, technical depth
- Startups: Emphasize versatility, practical skills, quick learning

You must respond ONLY with valid JSON — no markdown, no explanation, no text before or after the JSON object."""


# ═══════════════════════════════════════════════════════════════════════════════
# ROADMAP PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_roadmap_prompt(user_profile: dict) -> str:
    """Generate a personalized roadmap prompt based on user profile."""
    college_tier = user_profile.get("college_tier", "tier2")
    is_cs = user_profile.get("is_cs_background", False)
    target_role = user_profile.get("target_role", "Software Engineer")
    target_companies = user_profile.get("target_companies", [])
    hours_per_day = user_profile.get("hours_per_day", 2)
    days_per_week = user_profile.get("days_per_week", 5)
    skills = user_profile.get("skills", {})
    degree = user_profile.get("degree", "B.Tech")
    major = user_profile.get("major", "")
    current_year = user_profile.get("current_year", 3)
    preferred_language = user_profile.get("preferred_language", "en")
    college = user_profile.get("college", "")

    companies_str = ", ".join(target_companies) if target_companies else "top tech companies"
    skills_str = ", ".join(skills.keys()) if isinstance(skills, dict) and skills else "none listed"

    # Determine company focus
    service_companies = ["tcs", "infosys", "wipro", "cognizant", "capgemini", "accenture"]
    product_companies = ["amazon", "microsoft", "google", "flipkart", "adobe", "oracle"]
    companies_lower = [c.lower() for c in target_companies]
    has_service = any(any(s in co for s in service_companies) for co in companies_lower)
    has_product = any(any(pr in co for pr in product_companies) for co in companies_lower)
    is_product_focused = has_product and not has_service
    is_service_focused = has_service and not has_product

    # Placement urgency based on year
    if current_year == 4:
        timeline_note = "URGENT: Final year — placements in 3-6 months. Prioritize high-impact topics."
        total_weeks = 6
    elif current_year == 3:
        timeline_note = "Third year — placement season in 6-12 months. Build strong fundamentals now."
        total_weeks = 8
    else:
        timeline_note = "Second year or below — ample time. Build deep foundations steadily."
        total_weeks = 8

    # Tier-specific roadmap strategy
    tier_strategy = {
        "tier1": f"""Strategy: Target product companies. Heavy DSA (LeetCode medium/hard), system design, competitive programming.
- Week 1-2: DSA foundations (arrays, strings, hashmaps) + roadmap.sh/computer-science review
- Week 3-4: Advanced DSA (trees, graphs, DP) via Striver A2Z
- Week 5-6: System design basics + LeetCode contest practice
- Week 7+: Mock interviews, company-specific prep ({companies_str}), OS/DBMS/CN revision""",
        "tier2": f"""Strategy: Secure service company offer first, then target product companies off-campus.
- Week 1-2: Aptitude (IndiaBIX) + basic programming + roadmap.sh/computer-science orientation
- Week 3-4: Core CS (DBMS, OS, CN) + OOP concepts + basic DSA
- Week 5-6: Intermediate DSA (LeetCode easy/medium) + company-specific prep (TCS NQT / Infosys SP)
- Week 7+: Mock tests, communication practice, resume + LinkedIn + off-campus applications""",
        "tier3": f"""Strategy: Crack service company tests first. Aptitude + fundamentals are priority.
- Week 1-2: Aptitude & reasoning (IndiaBIX daily) + spoken English + roadmap.sh orientation
- Week 3-4: Basic programming (CodeWithHarry/Apna College in Hindi if preferred) + CS fundamentals
- Week 5-6: DBMS, OS, networking basics + OOP + 1 beginner project
- Week 7+: Mock tests (AMCAT/Cocubes style), HR prep, LinkedIn profile, off-campus strategy"""
    }.get(college_tier, "")

    # Language-specific resources
    lang_resources = ""
    if preferred_language == "hi":
        lang_resources = "Use Hindi resources: CodeWithHarry (https://youtube.com/@CodeWithHarry), Apna College (https://youtube.com/@ApnaCollegeOfficial)"
    elif preferred_language == "ta":
        lang_resources = "Include Tamil resources where available. Supplement with English resources."
    elif preferred_language == "te":
        lang_resources = "Include Telugu resources where available. Supplement with English resources."

    return f"""Generate a complete {total_weeks}-week placement preparation roadmap for this student.

STUDENT PROFILE:
- Name/College: {college or 'Not specified'}
- Tier: {college_tier.upper()} | Degree: {degree} {major} | Year: {current_year}
- CS Background: {'Yes' if is_cs else 'No — must start from programming basics'}
- Known skills: {skills_str}
- Target: {target_role} at {companies_str}
- Time available: {hours_per_day}h/day, {days_per_week} days/week ({hours_per_day * days_per_week}h/week total)
- Language preference: {preferred_language}
- {timeline_note}

ROADMAP STRATEGY FOR {college_tier.upper()}:
{tier_strategy}
{'Roadmap.sh reference for this role: https://roadmap.sh/backend (adjust URL based on target role)' if not is_service_focused else ''}
{lang_resources}
{'Since NOT CS background: Begin with programming fundamentals (variables, loops, functions, OOP) before any DSA.' if not is_cs else ''}

OUTPUT FORMAT — respond with EXACTLY this JSON structure:
{{
    "title": "Roadmap: {target_role} at {companies_str}",
    "total_weeks": {total_weeks},
    "weeks": [
        {{
            "week": 1,
            "theme": "Brief theme (5 words max)",
            "days": [
                {{
                    "day": 1,
                    "title": "Day title (4 words max)",
                    "tasks": [
                        {{
                            "id": "w1d1t1",
                            "title": "Task title",
                            "type": "learn|practice|review|project",
                            "duration_minutes": 45,
                            "description": "One sentence: what to do and why.",
                            "resources": [
                                {{
                                    "title": "Resource name",
                                    "url": "https://real-url-from-system-prompt.com",
                                    "type": "video|article|practice"
                                }}
                            ]
                        }}
                    ]
                }}
            ]
        }}
    ]
}}

STRICT RULES (violating any = failed output):
1. Generate ALL {total_weeks} weeks — do not stop early under any circumstance
2. Each week must have exactly {days_per_week} days (day 1 through {days_per_week})
3. Each day: 2-3 tasks fitting within {hours_per_day} hours total ({hours_per_day * 60} minutes)
4. Each task: exactly 1 resource with a real URL from the system prompt resource list
5. Keep descriptions SHORT — 1 sentence maximum
6. Keep theme/title SHORT — under 6 words
7. Increase difficulty progressively — easy in week 1, harder by final week
8. Week IDs must follow pattern: w{{week}}d{{day}}t{{task_num}} (e.g., w1d1t1, w2d3t2)
9. Task types must be exactly: learn, practice, review, or project
10. Include company-specific prep (TCS NQT / {companies_str}) in the last 2 weeks"""


# ─── removed old example block (now inline above) ────────────────────────────


ROADMAP_WEEK_SYSTEM_PROMPT = """You are an expert career counselor specializing in Indian campus placements. You generate ONE detailed week of a learning roadmap.

CRITICAL OUTPUT RULES:
1. Respond ONLY with a single valid JSON object — no markdown, no explanation, raw JSON { ... }
2. Be CONCISE — 1 short sentence per task description, exactly 1 resource per task
3. Generate the COMPLETE week with all days and tasks

Curated Resource URLs (use ONLY real URLs from this list):
- Roadmap reference: https://roadmap.sh/computer-science , https://roadmap.sh/backend , https://roadmap.sh/frontend , https://roadmap.sh/full-stack
- DSA structured: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2 , https://neetcode.io/roadmap
- DSA practice: https://leetcode.com/problemset/ , https://www.geeksforgeeks.org/explore , https://www.interviewbit.com/courses/programming/
- DSA video: https://youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz , https://youtube.com/@NeetCode
- Hindi: https://youtube.com/@CodeWithHarry , https://youtube.com/@ApnaCollegeOfficial
- CS fundamentals: https://www.geeksforgeeks.org/dbms/ , https://www.geeksforgeeks.org/operating-systems/ , https://www.geeksforgeeks.org/computer-network-tutorials/
- OS/DBMS video: https://youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y , https://youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p
- Aptitude: https://www.indiabix.com/ , https://www.geeksforgeeks.org/aptitude-gq/
- Mock tests: https://www.hackerrank.com/domains , https://www.codechef.com/practice
- Company prep: https://www.geeksforgeeks.org/company-preparation/ , https://prepinsta.com/
- Projects: https://github.com/topics/beginner-project , https://www.frontendmentor.io/challenges
- English: https://www.youtube.com/playlist?list=PLsyeobzWxl7pMn-3KWQXRG-vLqJEd4XbS"""


def get_roadmap_plan_prompt(user_profile: dict) -> str:
    """Generate a roadmap skeleton (themes for all weeks) + detailed Week 1."""
    college_tier = user_profile.get("college_tier", "tier2")
    is_cs = user_profile.get("is_cs_background", False)
    target_role = user_profile.get("target_role", "Software Engineer")
    target_companies = user_profile.get("target_companies", [])
    hours_per_day = user_profile.get("hours_per_day", 2)
    days_per_week = user_profile.get("days_per_week", 5)
    skills = user_profile.get("skills", {})
    degree = user_profile.get("degree", "B.Tech")
    major = user_profile.get("major", "")
    current_year = user_profile.get("current_year", 3)
    preferred_language = user_profile.get("preferred_language", "en")
    college = user_profile.get("college", "")

    companies_str = ", ".join(target_companies) if target_companies else "top tech companies"
    skills_str = ", ".join(skills.keys()) if isinstance(skills, dict) and skills else "none listed"

    # Company focus detection
    service_companies = ["tcs", "infosys", "wipro", "cognizant", "capgemini", "accenture"]
    product_companies = ["amazon", "microsoft", "google", "flipkart", "adobe", "oracle"]
    companies_lower = [c.lower() for c in target_companies]
    has_service = any(any(s in co for s in service_companies) for co in companies_lower)
    has_product = any(any(pr in co for pr in product_companies) for co in companies_lower)
    is_product_focused = has_product and not has_service

    # Year-based weeks
    if current_year == 4:
        timeline_note = "URGENT: Final year — placements in 3-6 months."
        total_weeks = 6
    elif current_year == 3:
        timeline_note = "Third year — placement season in 6-12 months."
        total_weeks = 8
    else:
        timeline_note = "Second year or below — build deep foundations."
        total_weeks = 8

    # Language hint
    lang_hint = ""
    if preferred_language == "hi":
        lang_hint = "Prefer Hindi resources (CodeWithHarry, Apna College) where possible."

    return f"""Create a {total_weeks}-week placement roadmap PLAN + detailed Week 1.

STUDENT: {college or 'Unknown'} | {college_tier.upper()} | {degree} {major} | Year {current_year}
CS Background: {'Yes' if is_cs else 'No'} | Skills: {skills_str}
Target: {target_role} at {companies_str}
Schedule: {hours_per_day}h/day, {days_per_week} days/week | {timeline_note}
{lang_hint}
{'Not CS background — Week 1 must cover programming basics.' if not is_cs else ''}

OUTPUT: Return JSON with TWO parts:
1. "plan" — array of {total_weeks} objects with week number + theme (short, 5 words max) + focus area
2. "week_1" — fully detailed Week 1 with {days_per_week} days, 2-3 tasks per day

JSON structure:
{{
    "title": "Roadmap: {target_role} at {companies_str}",
    "total_weeks": {total_weeks},
    "plan": [
        {{"week": 1, "theme": "DSA Foundations", "focus": "Arrays, strings, basic sorting"}},
        {{"week": 2, "theme": "...", "focus": "..."}},
        ...all {total_weeks} weeks
    ],
    "week_1": {{
        "week": 1,
        "theme": "Theme from plan",
        "days": [
            {{
                "day": 1,
                "title": "Day title (4 words max)",
                "tasks": [
                    {{
                        "id": "w1d1t1",
                        "title": "Task title",
                        "type": "learn|practice|review|project",
                        "duration_minutes": 45,
                        "description": "One sentence.",
                        "resources": [{{"title": "Name", "url": "https://real-url", "type": "video|article|practice"}}]
                    }}
                ]
            }}
        ]
    }}
}}

RULES:
1. Plan must have exactly {total_weeks} weeks with progressive difficulty
2. Week 1 must have exactly {days_per_week} days, 2-3 tasks per day within {hours_per_day}h
3. Each task: 1 resource with real URL from system prompt list
4. Task IDs: w1d{{day}}t{{num}} pattern
5. Types: learn, practice, review, or project only
6. Last 2 weeks in plan should include company-specific prep ({companies_str})"""


def get_roadmap_week_prompt(user_profile: dict, week_number: int, plan: list, previous_themes: list[str] | None = None) -> str:
    """Generate a single week's detailed content given the overall plan context."""
    college_tier = user_profile.get("college_tier", "tier2")
    is_cs = user_profile.get("is_cs_background", False)
    target_role = user_profile.get("target_role", "Software Engineer")
    target_companies = user_profile.get("target_companies", [])
    hours_per_day = user_profile.get("hours_per_day", 2)
    days_per_week = user_profile.get("days_per_week", 5)
    preferred_language = user_profile.get("preferred_language", "en")

    companies_str = ", ".join(target_companies) if target_companies else "top tech companies"

    # Extract this week's plan entry
    week_plan = None
    for entry in plan:
        if isinstance(entry, dict) and entry.get("week") == week_number:
            week_plan = entry
            break
    theme = week_plan.get("theme", f"Week {week_number}") if week_plan else f"Week {week_number}"
    focus = week_plan.get("focus", "") if week_plan else ""

    # Build plan summary for context
    plan_summary = "\n".join(
        f"  Week {p.get('week', i+1)}: {p.get('theme', '?')} — {p.get('focus', '')}"
        for i, p in enumerate(plan) if isinstance(p, dict)
    )

    # Previous weeks context
    prev_context = ""
    if previous_themes:
        prev_context = f"Already completed: {', '.join(previous_themes)}. Build on these — do NOT repeat."

    lang_hint = ""
    if preferred_language == "hi":
        lang_hint = "Prefer Hindi resources (CodeWithHarry, Apna College) where possible."

    return f"""Generate DETAILED content for Week {week_number} of a placement roadmap.

STUDENT: {college_tier.upper()} | Target: {target_role} at {companies_str}
Schedule: {hours_per_day}h/day, {days_per_week} days/week
{lang_hint}

FULL ROADMAP PLAN:
{plan_summary}

CURRENT WEEK TO GENERATE: Week {week_number}
Theme: {theme}
Focus: {focus}
{prev_context}

OUTPUT: Return JSON for this single week:
{{
    "week": {week_number},
    "theme": "{theme}",
    "days": [
        {{
            "day": 1,
            "title": "Day title (4 words max)",
            "tasks": [
                {{
                    "id": "w{week_number}d1t1",
                    "title": "Task title",
                    "type": "learn|practice|review|project",
                    "duration_minutes": 45,
                    "description": "One sentence.",
                    "resources": [{{"title": "Name", "url": "https://real-url", "type": "video|article|practice"}}]
                }}
            ]
        }}
    ]
}}

RULES:
1. Exactly {days_per_week} days, 2-3 tasks per day within {hours_per_day}h total
2. Each task: 1 resource with real URL from system prompt resource list
3. Task IDs: w{week_number}d{{day}}t{{num}} pattern
4. Types: learn, practice, review, or project only
5. Match the theme "{theme}" and focus "{focus}" precisely
6. Progressive difficulty within the week (day 1 easier, last day harder)"""


# ═══════════════════════════════════════════════════════════════════════════════
# INTERVIEW PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_interview_start_prompt(role: str, company: str | None, user_level: str = "intermediate") -> str:
    """Generate the initial prompt for starting a mock interview."""
    company_str = company if company else "a top tech company"
    
    company_specific = ""
    if company:
        company_lower = company.lower()
        if any(x in company_lower for x in ["tcs", "infosys", "wipro", "cognizant", "capgemini"]):
            company_specific = """
Company Type: SERVICE COMPANY
Interview Format:
  Round 1: Online aptitude test (quantitative, logical, verbal) + basic coding (1-2 easy problems)
  Round 2: Technical interview (30-45 min) — OOP, DBMS, SQL, basic DSA, one coding question
  Round 3: HR interview — "Tell me about yourself", "Why IT?", "Willing to relocate?", bond discussion

Focus your questions on:
- OOP concepts: What is polymorphism? Difference between abstract class and interface? What is encapsulation?
- DBMS: ACID properties, types of joins, normalization (1NF, 2NF, 3NF), difference between DELETE and TRUNCATE
- SQL: Write a query to find second highest salary, GROUP BY, HAVING clause
- Basic coding: Reverse a string, check palindrome, find max in array, basic sorting
- CS basics: What is TCP/IP? Difference between process and thread? What is virtual memory?
- HR-style: Why do you want to join us? Where do you see yourself in 5 years?"""
        elif any(x in company_lower for x in ["amazon", "microsoft", "google", "flipkart", "adobe"]):
            company_specific = """
Company Type: PRODUCT COMPANY
Interview Format:
  Round 1: Online coding test (2-3 medium/hard DSA problems, 60-90 min)
  Round 2-3: Technical interviews (45-60 min each) — DSA problem solving on shared editor
  Round 4: System design (for experienced) or CS fundamentals (for freshers)
  Round 5: Behavioral/HR (Amazon: Leadership Principles)

Focus your questions on:
- DSA: Arrays, strings, two-pointer, sliding window, hashmaps, linked lists, trees, BFS/DFS, dynamic programming
- Problem format: Present problem → ask for approach → ask to code → discuss time/space complexity → ask about edge cases
- Follow-up: "Can you optimize this?", "What if the input is very large?", "What edge cases would you handle?"
- Amazon specifically: Ask about Leadership Principles — "Tell me about a time you took ownership of a failing project"
- Microsoft: Focus on clean code and design thinking
- Google: Focus on optimal solutions and mathematical reasoning"""
        elif "startup" in company_lower:
            company_specific = """
Company Type: STARTUP
Interview Format:
  Round 1: Coding challenge or take-home assignment
  Round 2: Technical discussion — practical skills, system design, project deep-dive
  Round 3: Culture fit with founders/team lead

Focus your questions on:
- Practical skills: "How would you build a REST API for user authentication?"
- Framework knowledge: "Explain the difference between SQL and NoSQL — when would you use each?"
- System thinking: "Design a basic URL shortener", "How would you handle 1000 concurrent users?"
- Project deep-dive: Ask about their personal projects, tech choices, challenges faced"""

    return f"""You are starting a mock interview for a {role} position at {company_str} for an Indian campus placement.

Candidate level: {user_level}
{company_specific if company_specific else "Standard tech interview format — mix of DSA, CS fundamentals, and behavioral questions."}

Begin by:
1. Introduce yourself briefly as the interviewer (e.g., "Hi! I'm Arjun Sharma, a Senior Engineer at {company_str}...")
2. Ask the candidate to introduce themselves — their name, college, year, and why they're interested in this {role} role
3. Keep it warm and professional

IMPORTANT: Ask ONLY the introduction question in this first message. Do NOT ask any technical questions yet. Wait for their response before proceeding to technical questions.

For Tier-2/3 college students: Be encouraging and help them feel comfortable. The goal is to build confidence while assessing skills genuinely."""


def get_interview_evaluate_prompt(role: str, company: str | None, messages: list) -> str:
    """Generate prompt for evaluating a completed mock interview."""
    company_str = company if company else "a top tech company"
    conversation = "\n".join(
        f"{'Interviewer' if m['role'] == 'assistant' else 'Candidate'}: {m['content']}"
        for m in messages
    )
    
    company_criteria = ""
    if company:
        company_lower = company.lower()
        if any(x in company_lower for x in ["tcs", "infosys", "wipro", "cognizant", "capgemini"]):
            company_criteria = """
Service Company Scoring Criteria:
- Basic programming knowledge (20%): Can they write simple programs? Understand loops, functions, OOP?
- DBMS/SQL knowledge (20%): Know ACID, joins, normalization, basic queries?
- Communication clarity (25%): Can they explain clearly? Professional demeanor?
- Attitude & willingness to learn (20%): Enthusiasm, willingness to relocate, open to learning new tech?
- Consistency in answers (15%): Do their answers show a coherent understanding?"""
        elif any(x in company_lower for x in ["amazon", "microsoft", "google", "flipkart"]):
            company_criteria = """
Product Company Scoring Criteria:
- Problem-solving approach (30%): Do they ask clarifying questions? Break down the problem? Think aloud?
- DSA/coding quality (25%): Correct solution? Optimal time/space complexity? Clean code?
- Communication of thought process (20%): Can they explain their approach clearly?
- Edge case handling (15%): Do they consider boundary conditions, empty inputs, large inputs?
- Follow-up handling (10%): Can they optimize when asked? Handle variations?"""

    return f"""Evaluate this mock interview for a {role} position at {company_str}.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Interview Transcript:**
{conversation}

**Provide your evaluation as this exact JSON structure:**
{{
    "score": <number from 1 to 10>,
    "feedback": "2-3 sentence overall assessment. Be honest but encouraging. Mention what they did well and what needs work.",
    "strengths": ["specific strength 1 with example from the interview", "specific strength 2"],
    "improvements": ["specific area to improve with actionable advice", "another specific area"],
    "technical_score": <1-10>,
    "communication_score": <1-10>,
    "problem_solving_score": <1-10>,
    "readiness_level": "not_ready|getting_ready|ready|very_ready",
    "next_steps": [
        "Specific action item 1 (e.g., 'Solve 20 LeetCode Easy array problems this week')",
        "Specific action item 2 (e.g., 'Review DBMS normalization from GFG')",
        "Specific action item 3"
    ],
    "recommended_resources": [
        {{"title": "Resource name", "url": "https://real-url.com", "reason": "Why this helps"}},
        {{"title": "Resource name", "url": "https://real-url.com", "reason": "Why this helps"}}
    ],
    "company_fit": "1-2 sentence assessment of how well the candidate fits {company_str} specifically"
}}

{company_criteria}

Evaluation must be based ONLY on what the candidate actually said in the transcript.
Be fair — Tier-2/3 students may have less exposure but can show strong potential.
Score honestly: 1-3 = not ready, 4-5 = needs work, 6-7 = getting there, 8-10 = ready.
Include real resource URLs in recommended_resources (LeetCode, GFG, YouTube channels, etc.)."""


def get_interview_followup_prompt(role: str, company: str | None, last_answer: str, context: list) -> str:
    """Generate prompt for continuing an interview based on the last answer."""
    company_str = company if company else "a top tech company"
    
    # Count how many Q&A exchanges have happened
    candidate_msgs = [m for m in context if m.get('role') == 'user']
    exchange_count = len(candidate_msgs)
    
    # Determine interview phase based on exchange count
    if exchange_count <= 2:
        phase_instruction = """PHASE: Early Interview (Warm-up)
- Ask foundational questions to gauge their level
- Be friendly and build confidence
- If their intro was good, start with an easy-medium technical question
- For service companies: Start with basic programming/OOP concepts
- For product companies: Start with an easy DSA problem"""
    elif exchange_count <= 4:
        phase_instruction = """PHASE: Mid Interview (Core Assessment)
- This is where the real evaluation happens
- Ask questions that directly test skills needed for the role
- For coding roles: Give a specific problem (Two Sum, reverse a string, find duplicates, etc.)
- For service companies: DBMS (normalization, ACID), OS (process vs thread), CN basics
- For product companies: Medium DSA problem, optimize previous solution, system design basics
- Ask them to code or pseudocode if appropriate"""
    else:
        phase_instruction = """PHASE: Late Interview (Deep Dive & Wrap-up)
- Ask harder follow-ups or a new challenging question
- Test edge case thinking and optimization ability
- Ask about projects, real-world application of concepts
- For product companies: Ask about time/space complexity, can they do better?
- Allow them to ask questions about the role/company
- This should feel like the interview is wrapping up naturally"""

    return f"""Continue the mock interview for {role} at {company_str}.

**Conversation so far (last 4 messages):**
{"\n".join(f"{'Interviewer' if m['role'] == 'assistant' else 'Candidate'}: {m['content']}" for m in context[-4:])}

**Candidate's latest answer:**
{last_answer}

**Exchange #{exchange_count + 1} of ~5**

{phase_instruction}

**RULES (follow strictly):**
1. First give BRIEF feedback on their answer (1-2 sentences max). Be specific: "Good, you correctly identified X" or "You missed Y, but your approach was right"
2. Then ask the NEXT question. ONE question only. Be clear and specific.
3. If they struggled: Hint or simplify. Don't repeat the same question.
4. If they did well: Increase difficulty or ask a follow-up on the same topic.
5. If they gave a coding answer: Ask about time complexity, edge cases, or an optimization.
6. Keep it conversational — like a real interviewer, not a quiz bot.
7. NEVER break character. You are the interviewer.
8. For non-native English speakers: Judge technical accuracy, not grammar.
9. Do NOT list multiple questions. Ask exactly ONE.
10. Do NOT say "Let's move on to the next question" — just ask it naturally.

Respond as the interviewer in natural conversational tone. No JSON. No labels. Just speak as the interviewer would."""


# ═══════════════════════════════════════════════════════════════════════════════
# JD ANALYSIS PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_jd_analysis_prompt(job_description: str, user_skills: dict | None) -> str:
    """Generate prompt for analyzing a job description against user skills."""
    skills_str = ""
    if user_skills and isinstance(user_skills, dict):
        skills_str = "\n".join(f"- {k}: {v}" for k, v in user_skills.items())
    else:
        skills_str = "No skills data provided"

    return f"""Analyze this job description and compare it against the candidate's current skills.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Job Description:**
{job_description}

**Candidate's Current Skills:**
{skills_str}

**Respond with this exact JSON structure:**
{{
    "role": "extracted role title",
    "company": "extracted company name or null",
    "company_type": "service|product|startup|consulting",
    "experience_level": "fresher|0-2 years|2-5 years",
    "required_skills": [
        {{
            "name": "skill name",
            "level": "beginner|intermediate|advanced",
            "category": "technical|soft|domain",
            "importance": "must_have|good_to_have"
        }}
    ],
    "gap_analysis": [
        {{
            "skill": "skill name",
            "user_level": "none|beginner|intermediate|advanced",
            "required_level": "beginner|intermediate|advanced",
            "gap": "none|small|medium|large",
            "priority": "high|medium|low"
        }}
    ],
    "preparation_timeline": "estimated weeks to prepare",
    "preparation_timeline_weeks": <number>,
    "recommendations": [
        "Specific actionable recommendation 1",
        "Specific actionable recommendation 2"
    ],
    "resources": [
        {{
            "type": "course|video|article|practice",
            "title": "resource name",
            "url": "https://actual-url.com/path",
            "platform": "YouTube|Coursera|GeeksforGeeks|etc",
            "free": true,
            "language": "en|hi|ta|te"
        }}
    ],
    "indian_context": {{
        "relevant_for_tier2_3": true|false,
        "off_campus_feasible": true|false,
        "application_tips": "tips for Indian context"
    }}
}}

**Use REAL URLs for resources. Here are verified resources to pick from based on skill gaps:**

DSA & Coding:
- {{"title": "Striver's A2Z DSA Sheet", "url": "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", "platform": "TakeUForward"}}
- {{"title": "LeetCode Top Interview 150", "url": "https://leetcode.com/studyplan/top-interview-150/", "platform": "LeetCode"}}
- {{"title": "NeetCode 150", "url": "https://neetcode.io/practice", "platform": "NeetCode"}}
- {{"title": "GFG DSA Self Paced", "url": "https://www.geeksforgeeks.org/courses/dsa-self-paced", "platform": "GeeksforGeeks"}}

Programming (Java/Python/C++):
- {{"title": "Java Tutorial - Apna College", "url": "https://www.youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop", "platform": "YouTube"}}
- {{"title": "Python for Beginners - CodeWithHarry", "url": "https://www.youtube.com/playlist?list=PLu0W_9lII9agICnT8t4iYVSZ3eykIAOME", "platform": "YouTube"}}
- {{"title": "C++ Full Course - Apna College", "url": "https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ", "platform": "YouTube"}}

CS Fundamentals:
- {{"title": "DBMS Gate Smashers", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y", "platform": "YouTube"}}
- {{"title": "OS Gate Smashers", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", "platform": "YouTube"}}
- {{"title": "CN Gate Smashers", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", "platform": "YouTube"}}

Web Development:
- {{"title": "Web Dev Bootcamp - Angela Yu", "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/", "platform": "Udemy"}}
- {{"title": "Full Stack Open", "url": "https://fullstackopen.com/en/", "platform": "Helsinki University"}}

Aptitude:
- {{"title": "IndiaBIX Aptitude", "url": "https://www.indiabix.com/aptitude/questions-and-answers/", "platform": "IndiaBIX"}}

Focus on:
- Skills relevant to Indian campus placements: DSA, programming languages, CS fundamentals, aptitude, communication
- Company-specific requirements (TCS, Infosys have different expectations than Google, Amazon)
- Realistic assessment for Tier-2/3 college students
- Actionable next steps with time estimates
- Free resources first (YouTube, GeeksforGeeks, LeetCode free)
- Consider if the role is feasible for off-campus applications from Tier-2/3 colleges"""


# ═══════════════════════════════════════════════════════════════════════════════
# WEEKLY CHECKIN PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_weekly_checkin_prompt(
    week_number: int,
    completed_tasks: list,
    pending_tasks: list,
    challenges: list,
    user_profile: dict,
    previous_feedback: list | None = None
) -> str:
    """Generate prompt for weekly progress check-in."""
    college_tier = user_profile.get("college_tier", "tier2")
    target_companies = user_profile.get("target_companies", [])
    hours_per_day = user_profile.get("hours_per_day", 2)
    preferred_language = user_profile.get("preferred_language", "en")
    
    companies_str = ", ".join(target_companies) if target_companies else "top tech companies"
    
    completed_str = "\n".join(f"- {t}" for t in completed_tasks) if completed_tasks else "No tasks completed"
    pending_str = "\n".join(f"- {t}" for t in pending_tasks) if pending_tasks else "No pending tasks"
    challenges_str = "\n".join(f"- {c}" for c in challenges) if challenges else "No major challenges reported"
    
    previous_feedback_str = ""
    if previous_feedback:
        previous_feedback_str = f"\n**Previous Feedback:**\n" + "\n".join(f"- {f}" for f in previous_feedback[-3:])

    # Tier-specific encouragement
    tier_encouragement = {
        "tier1": "You're aiming high - keep pushing for excellence!",
        "tier2": "You're doing great! Consistency will help you compete with Tier-1 peers.",
        "tier3": "Your effort matters more than your college tag. Many successful engineers come from Tier-3 colleges!"
    }.get(college_tier, "Keep up the good work!")

    return f"""Conduct a weekly progress check-in for a student preparing for campus placements.

**Student Profile:**
- College Tier: {college_tier}
- Target Companies: {companies_str}
- Available Time: {hours_per_day} hours/day
- Preferred Language: {preferred_language}

**Week {week_number} Progress:**
**Completed Tasks:**
{completed_str}

**Pending Tasks:**
{pending_str}

**Challenges Faced:**
{challenges_str}{previous_feedback_str}

**Tier Context:** {tier_encouragement}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide your check-in response as this exact JSON structure:**
{{
    "week": {week_number},
    "progress_assessment": "excellent|good|average|needs_improvement",
    "completion_rate": <percentage>,
    "acknowledgment": "Encouraging message about their progress - personalize based on tier and language preference",
    "blocker_analysis": [
        {{
            "blocker": "description",
            "severity": "high|medium|low",
            "suggested_solution": "specific solution - consider Indian student context",
            "resources": ["specific resources to help"]
        }}
    ],
    "adjustments": [
        {{
            "type": "pace|content|schedule",
            "description": "what to adjust",
            "reason": "why this adjustment"
        }}
    ],
    "motivation": "Personalized encouragement message - be culturally sensitive",
    "next_week_priorities": ["priority 1", "priority 2", "priority 3"],
    "resources": ["specific resource recommendations - include regional language resources if applicable"],
    "continue_next_week": true|false,
    "placement_readiness": "not_started|early_preparation|on_track|ready|very_ready"
}}

Be empathetic but honest. If they're falling behind, provide constructive guidance on how to catch up.
Consider their college tier context - Tier-3 students may need more time for fundamentals.
Address common Indian student challenges: exam pressure, limited resources, English confidence."""


# ═══════════════════════════════════════════════════════════════════════════════
# SKILL ASSESSMENT PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_skill_assessment_prompt(
    skill_area: str,
    user_level: str,
    college_tier: str,
    target_companies: list
) -> str:
    """Generate prompt for conducting skill assessment."""
    companies_str = ", ".join(target_companies) if target_companies else "service/product companies"
    
    skill_areas = {
        "programming": "programming fundamentals (variables, loops, functions, OOP)",
        "dsa": "data structures and algorithms (arrays, strings, sorting, searching, basic trees/graphs)",
        "cs_fundamentals": "CS fundamentals (OS, DBMS, Networks basics)",
        "problem_solving": "problem-solving approach and logical thinking",
        "communication": "technical communication and explanation skills",
        "system_design": "system design basics (for advanced students)",
        "aptitude": "quantitative aptitude, logical reasoning, verbal ability"
    }
    
    skill_desc = skill_areas.get(skill_area, skill_area)

    # Tier-specific question difficulty
    tier_difficulty = {
        "tier1": "Include medium to hard questions. Focus on optimization and edge cases.",
        "tier2": "Mix of easy and medium questions. Some hard questions if they perform well.",
        "tier3": "Start with easy questions to build confidence. Gradually increase to medium."
    }.get(college_tier, tier_difficulty["tier2"])

    return f"""Conduct a skill assessment for {skill_desc}.

**Assessment Context:**
- Student level: {user_level}
- College Tier: {college_tier}
- Target Companies: {companies_str}

**Difficulty Guidelines:**
{tier_difficulty}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Generate an assessment as this exact JSON structure:**
{{
    "assessment_id": "unique_id",
    "skill_area": "{skill_area}",
    "questions": [
        {{
            "id": "q1",
            "type": "conceptual|coding|scenario|explanation",
            "difficulty": "easy|medium|hard",
            "question": "The question text - can be in Hinglish/Tanglish/Telgish for better understanding",
            "expected_answer_points": ["point 1", "point 2"],
            "evaluation_criteria": "how to evaluate the answer - be lenient for Tier-3 students on communication"
        }}
    ],
    "expected_duration_minutes": <estimated time>,
    "instructions": "Instructions for the student - encourage them, mention it's okay to make mistakes",
    "tier_context": {{
        "college_tier": "{college_tier}",
        "difficulty_notes": "Notes on difficulty adjustment"
    }}
}}

Guidelines:
- Start with 1-2 easy questions to build confidence
- Include 2-3 medium difficulty questions
- Add 1 harder question if they seem ready
- For Tier-3 colleges, focus more on fundamentals and be encouraging
- For product companies, include more challenging problems
- Make questions relevant to actual interview questions asked by {companies_str}
- Consider language barriers - allow explanations in Hinglish/Tanglish/Telgish
- Coding questions should have clear problem statements with examples"""


def get_skill_assessment_evaluation_prompt(
    skill_area: str,
    questions: list,
    answers: list,
    college_tier: str
) -> str:
    """Generate prompt for evaluating skill assessment responses."""
    qa_pairs = "\n\n".join(
        f"Q: {q['question']}\nExpected: {', '.join(q.get('expected_answer_points', []))}\nA: {a['answer']}"
        for q, a in zip(questions, answers)
    )

    # Tier-specific evaluation notes
    tier_notes = {
        "tier1": "Evaluate strictly. Look for optimal solutions and clear communication.",
        "tier2": "Evaluate fairly. Consider effort and approach, not just final answer.",
        "tier3": "Evaluate with encouragement. Focus on understanding, not perfection. Consider communication challenges."
    }.get(college_tier, tier_notes["tier2"])

    return f"""Evaluate the following skill assessment responses for {skill_area}.

**Student Background:** College Tier {college_tier}

**Tier Evaluation Notes:** {tier_notes}

**Questions and Answers:**
{qa_pairs}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide evaluation as this exact JSON structure:**
{{
    "overall_score": <0-100>,
    "level": "beginner|intermediate|advanced",
    "skill_area": "{skill_area}",
    "question_evaluations": [
        {{
            "question_id": "q1",
            "score": <0-100>,
            "feedback": "specific feedback - encouraging tone",
            "correct": true|false,
            "partially_correct": true|false
        }}
    ],
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "learning_recommendations": [
        {{
            "topic": "topic name",
            "priority": "high|medium|low",
            "resources": ["specific free resources"]
        }}
    ],
    "estimated_preparation_time": "time needed to reach target level",
    "readiness_for_target_companies": "not_ready|partially_ready|ready",
    "encouragement_message": "Personalized message based on tier and performance"
}}

Be fair in evaluation considering the student's college tier. Tier-3 students may have gaps but show potential.
Focus on improvement areas, not just scores. Provide actionable next steps."""


# ═══════════════════════════════════════════════════════════════════════════════
# CONTENT EXPLANATION PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_content_explanation_prompt(
    concept: str,
    language: str,
    user_level: str,
    context: str | None = None,
    examples_requested: bool = True
) -> str:
    """Generate prompt for explaining a technical concept."""
    
    language_instructions = {
        "hi": """Explain in Hinglish (mix of Hindi and English):
- Use simple Hindi for explanations
- Keep technical terms in English (e.g., "variable", "function", "array")
- Use Devanagari script for Hindi parts
- Style: Conversational, like a friend explaining
- Example: "Array ek data structure hai jisme hum similar type ke items store kar sakte hain."
- Use relatable Indian analogies (cricket, Bollywood, family, traffic)""",
        "ta": """Explain in Tanglish (mix of Tamil and English):
- Use simple Tamil for explanations
- Keep technical terms in English
- Use Roman script for Tamil parts
- Style: Friendly and approachable
- Example: "Array oru data structure, adhula similar type items store pannalam."
- Use South Indian cultural analogies when helpful""",
        "te": """Explain in Telgish (mix of Telugu and English):
- Use simple Telugu for explanations
- Keep technical terms in English
- Use Roman script for Telugu parts
- Style: Clear and encouraging
- Example: "Array oka data structure, dini lo similar type items store cheyavachu."
- Use relatable analogies for Telugu-speaking students""",
        "en": """Explain in clear, simple English with minimal jargon.
- Use analogies that Indian students can relate to
- Avoid complex English words when simple ones work
- Be concise but thorough"""
    }
    
    lang_instruction = language_instructions.get(language, language_instructions["en"])
    
    context_str = f"\n**Additional Context:** {context}" if context else ""

    return f"""Explain the technical concept: "{concept}"

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Student Level:** {user_level}{context_str}

**Language Instructions:**
{lang_instruction}

**Response Format (JSON):**
{{
    "concept": "{concept}",
    "language": "{language}",
    "explanation": {{
        "simple_definition": "One sentence simple definition",
        "detailed_explanation": "Full explanation in requested language - use analogies",
        "real_world_analogy": "Relatable Indian analogy (cricket, chai, traffic, family, Bollywood)",
        "why_it_matters": "Why this is important for placements - mention specific companies if relevant"
    }},
    {"" if not examples_requested else '"code_examples": [' + '\n        {' + '\n            "language": "python|java|cpp",\n            "code": "code snippet with comments",\n            "explanation": "line by line explanation in requested language"\n        }\n    ],' + ''}
    "key_points": ["point 1", "point 2", "point 3"],
    "common_mistakes": ["mistake 1", "mistake 2"],
    "interview_questions": [
        {{
            "question": "common interview question on this topic",
            "difficulty": "easy|medium|hard",
            "company_asked": "company name or common",
            "frequency": "frequently|sometimes|rarely"
        }}
    ],
    "further_learning": [
        {{
            "resource": "resource name",
            "type": "video|article|practice",
            "url": "https://actual-url.com/path",
            "language": "en|hi|ta|te",
            "free": true
        }}
    ],
    "related_concepts": ["related concept 1", "related concept 2"],
    "practice_problems": [
        {{
            "platform": "LeetCode|GFG|HackerRank",
            "problem_name": "problem title",
            "difficulty": "easy|medium|hard",
            "url": "https://actual-url.com/path"
        }}
    ]
}}

**Use REAL URLs. Here are verified resources to pick from based on the concept:**

For DSA concepts:
- GFG article: https://www.geeksforgeeks.org/{{concept-slug}}/
- Striver video: https://www.youtube.com/c/takeUforward
- NeetCode: https://neetcode.io/
- LeetCode problems: https://leetcode.com/problemset/all/

For DBMS concepts:
- GFG DBMS: https://www.geeksforgeeks.org/dbms/
- Gate Smashers DBMS playlist: https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y

For OS concepts:
- GFG OS: https://www.geeksforgeeks.org/operating-systems/
- Gate Smashers OS playlist: https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p

For CN concepts:
- GFG CN: https://www.geeksforgeeks.org/computer-network-tutorials/
- Gate Smashers CN playlist: https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_

For OOP concepts:
- GFG OOP: https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/
- Apna College Java OOP: https://www.youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop

For Web Dev concepts:
- MDN Web Docs: https://developer.mozilla.org/
- freeCodeCamp: https://www.freecodecamp.org/

For practice problems, use actual LeetCode/GFG problem URLs when possible:
- Two Sum: https://leetcode.com/problems/two-sum/
- Reverse Linked List: https://leetcode.com/problems/reverse-linked-list/
- Valid Parentheses: https://leetcode.com/problems/valid-parentheses/
- Binary Search: https://leetcode.com/problems/binary-search/
- GFG Practice: https://www.geeksforgeeks.org/explore?page=1&sortBy=submissions

Make the explanation engaging and easy to understand. Use examples that Indian students can relate to.
For Tier-2/3 students: Be extra clear with fundamentals, don't assume prior knowledge.
Always include at least one practice problem recommendation with a real URL."""


# ═══════════════════════════════════════════════════════════════════════════════
# RESUME TIPS PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_resume_tips_prompt(
    resume_content: dict,
    target_companies: list,
    college_tier: str
) -> str:
    """Generate prompt for resume improvement tips."""
    
    companies_str = ", ".join(target_companies) if target_companies else "campus recruitment companies"
    
    # Extract resume sections
    education = resume_content.get("education", {})
    skills = resume_content.get("skills", [])
    projects = resume_content.get("projects", [])
    experience = resume_content.get("experience", [])
    certifications = resume_content.get("certifications", [])
    
    resume_summary = f"""
**Education:**
{education}

**Skills:**
{skills}

**Projects:**
{projects}

**Experience:**
{experience}

**Certifications:**
{certifications}
"""

    # Tier-specific advice
    tier_advice = {
        "tier1": """
Tier 1 Specific:
- Can focus on technical depth and competitive programming achievements
- Emphasize internships, research, and project complexity
- Brand name college helps - focus on accomplishments""",
        "tier2": """
Tier 2 Specific:
- Balance technical skills with practical projects
- Highlight any competitive programming or hackathon participation
- Show continuous learning through certifications
- Emphasize relevant coursework and self-driven projects""",
        "tier3": """
Tier 3 Specific:
- Focus heavily on skills and projects to compensate for college brand
- Include self-learning initiatives (online courses, certifications)
- Highlight any internships, even unpaid or short-term
- Show proof of skills through project links/GitHub
- Consider including relevant coursework with good grades
- Mention any leadership roles or extracurriculars showing initiative"""
    }.get(college_tier, "")

    return f"""Review and provide improvement tips for this resume targeting {companies_str}.

**Student Profile:**
- College Tier: {college_tier}
- Target Companies: {companies_str}{tier_advice}

**Resume Content:**
{resume_summary}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide analysis as this exact JSON structure:**
{{
    "overall_score": <0-100>,
    "ats_friendly": true|false,
    "sections": {{
        "education": {{
            "score": <0-100>,
            "feedback": "specific feedback",
            "suggestions": ["suggestion 1", "suggestion 2"]
        }},
        "skills": {{
            "score": <0-100>,
            "feedback": "specific feedback",
            "suggestions": ["suggestion 1", "suggestion 2"],
            "missing_skills": ["skills to add based on target companies"],
            "priority_order": ["suggested order for skills section"]
        }},
        "projects": {{
            "score": <0-100>,
            "feedback": "specific feedback",
            "suggestions": ["suggestion 1", "suggestion 2"],
            "star_format_issues": ["issues with Situation-Task-Action-Result format"],
            "impact_metrics_missing": ["suggestions for adding metrics"]
        }},
        "experience": {{
            "score": <0-100>,
            "feedback": "specific feedback",
            "suggestions": ["suggestion 1", "suggestion 2"]
        }}
    }},
    "formatting_issues": ["issue 1", "issue 2"],
    "common_mistakes": ["mistake 1", "mistake 2"],
    "company_specific_tips": [
        {{
            "company": "company name",
            "tips": ["specific tip 1", "specific tip 2"],
            "keywords_to_include": ["keyword 1", "keyword 2"]
        }}
    ],
    "improved_bullet_points": [
        {{
            "original": "original bullet",
            "improved": "improved version using STAR method with metrics",
            "reason": "why this is better"
        }}
    ],
    "action_items": [
        {{
            "priority": "high|medium|low",
            "action": "what to do",
            "impact": "expected impact",
            "time_estimate": "how long it takes"
        }}
    ],
    "sample_summary": "A sample professional summary tailored to their profile",
    "tier_specific_advice": "Advice specific to Tier-{college_tier} students",
    "ats_optimization": {{
        "current_issues": ["issue 1"],
        "suggestions": ["suggestion 1"]
    }}
}}

Consider:
- ATS (Applicant Tracking System) compatibility - avoid tables, images, fancy formatting
- STAR method for project descriptions
- Relevance to target companies
- Common mistakes Indian students make (including photo, father's name, personal details)
- How to highlight strengths despite limited brand-name college/experience
- Specific keywords that {companies_str} look for
- 1-page limit for freshers is strongly recommended
- Include GitHub/LinkedIn links if they add value"""


def get_resume_section_improvement_prompt(section: str, content: str, target_role: str) -> str:
    """Generate prompt for improving a specific resume section."""
    
    section_guidance = {
        "summary": "Focus on creating a compelling professional summary - 2-3 lines max",
        "skills": "Organize and prioritize technical skills - most relevant first",
        "projects": "Use STAR method to describe projects with impact metrics and quantifiable results",
        "experience": "Highlight achievements, not just responsibilities - use action verbs",
        "education": "Present academic credentials effectively - include CGPA if above 7.5",
        "certifications": "Showcase relevant certifications with context - prefer recognized platforms"
    }
    
    return f"""Improve this resume section: {section}

**Target Role:** {target_role}

**Current Content:**
{content}

**Guidance:** {section_guidance.get(section, "Improve this section")}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide improved version as this exact JSON structure:**
{{
    "section": "{section}",
    "improved_content": "the improved text",
    "improvements_made": ["what was improved"],
    "keywords_added": ["important keywords included"],
    "tips_for_future": ["tips for maintaining this section"],
    "common_mistakes_to_avoid": ["mistake 1", "mistake 2"]
}}"""


# ═══════════════════════════════════════════════════════════════════════════════
# RESOURCE RECOMMENDATION PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_resource_recommendations_prompt(
    topic: str,
    user_level: str,
    target_company: str | None,
    content_type: str = "all",
    preferred_language: str = "en"
) -> str:
    """Generate prompt for curating learning resources."""
    
    company_focus = ""
    if target_company:
        company_lower = target_company.lower()
        if any(x in company_lower for x in ["tcs", "infosys", "wipro", "cognizant"]):
            company_focus = """
Service Company Focus:
- Focus on resources for service company preparation: aptitude, basic programming, DBMS, communication
- Recommended platforms: IndiaBIX (aptitude), GeeksforGeeks (basics), YouTube (Hindi explanations)
- Look for: Previous year papers, mock tests, company-specific preparation guides"""
        elif any(x in company_lower for x in ["amazon", "microsoft", "google", "flipkart"]):
            company_focus = """
Product Company Focus:
- Focus on resources for product company preparation: advanced DSA, system design, competitive programming
- Recommended platforms: LeetCode, Codeforces, CodeChef, InterviewBit
- Look for: Top interview questions, company-tagged problems, discussion forums"""
    
    language_preference = ""
    if preferred_language == "hi":
        language_preference = """
Language Preference - Hindi:
- Prioritize Hindi-language resources:
  - CodeWithHarry (YouTube) - comprehensive programming in Hindi
  - Apna College (YouTube) - DSA and placement prep in Hindi
  - Anuj Bhaiya (YouTube) - system design and backend in Hindi
  - Hindi programming communities and forums"""
    elif preferred_language == "ta":
        language_preference = """
Language Preference - Tamil:
- Include Tamil-language resources:
  - Tamil Code (YouTube)
  - Guvi (has Tamil content)
  - Tamil programming communities
  - Mixed resources if pure Tamil not available"""
    elif preferred_language == "te":
        language_preference = """
Language Preference - Telugu:
- Include Telugu-language resources:
  - Telugu programming YouTube channels
  - Local coaching institute materials
  - Mixed resources if pure Telugu not available"""

    return f"""Recommend curated learning resources for: {topic}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**User Level:** {user_level}
**Target Company:** {target_company or "General placement preparation"}
**Content Type:** {content_type} (video, article, practice, all)
{company_focus}
{language_preference}

**Provide recommendations as JSON:**
{{
    "topic": "{topic}",
    "resources": [
        {{
            "title": "resource name",
            "type": "video|article|course|practice_platform",
            "platform": "YouTube|Coursera|GeeksforGeeks|LeetCode|HackerRank|CodingNinjas|etc",
            "url": "https://actual-url.com/path",
            "creator": "creator name",
            "language": "en|hi|ta|te",
            "level": "beginner|intermediate|advanced",
            "free": true|false,
            "description": "what this resource covers",
            "best_for": "what specific aspect it helps with",
            "duration": "estimated time to complete",
            "rating": "popularity/relevance rating"
        }}
    ],
    "learning_path": [
        {{
            "step": 1,
            "resource_title": "which resource to do first",
            "focus": "what to learn from it",
            "estimated_time": "time to complete"
        }}
    ],
    "pro_tips": [
        "practical tip for using these resources effectively",
        "common mistakes to avoid"
    ],
    "company_specific_resources": [
        {{
            "company": "company name",
            "resources": ["specific resource for this company"]
        }}
    ]
}}

**YOU MUST use REAL, verified URLs. Here is the curated resource database to pick from:**

DSA & Competitive Programming:
- Striver's A2Z DSA Sheet: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2
- Striver's SDE Sheet: https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems
- NeetCode 150: https://neetcode.io/practice
- NeetCode Roadmap: https://neetcode.io/roadmap
- LeetCode Top Interview 150: https://leetcode.com/studyplan/top-interview-150/
- LeetCode 75: https://leetcode.com/studyplan/leetcode-75/
- GFG DSA Self Paced: https://www.geeksforgeeks.org/courses/dsa-self-paced
- GFG Company-wise Problems: https://www.geeksforgeeks.org/company-preparation/
- InterviewBit: https://www.interviewbit.com/courses/programming/
- Codeforces: https://codeforces.com/
- CodeChef: https://www.codechef.com/

YouTube Channels (DSA):
- Striver (takeUforward): https://www.youtube.com/c/takeUforward
- NeetCode: https://www.youtube.com/@NeetCode
- Abdul Bari: https://www.youtube.com/@abdul_bari
- Aditya Verma (DP): https://www.youtube.com/c/AdityaVermaTheProgrammingLord
- Luv (CodeBeyond): https://www.youtube.com/@Luv-og5bz

Hindi Resources:
- CodeWithHarry: https://www.youtube.com/@CodeWithHarry
- Apna College: https://www.youtube.com/@ApnaCollegeOfficial
- College Wallah: https://www.youtube.com/@CollegeWallah
- Love Babbar: https://www.youtube.com/@LoveBabbar1
- Anuj Bhaiya: https://www.youtube.com/@AnujBhaiya

CS Fundamentals:
- Gate Smashers (DBMS): https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y
- Gate Smashers (OS): https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p
- Gate Smashers (CN): https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_
- GFG DBMS: https://www.geeksforgeeks.org/dbms/
- GFG OS: https://www.geeksforgeeks.org/operating-systems/
- GFG CN: https://www.geeksforgeeks.org/computer-network-tutorials/

Web Development:
- Full Stack Open (Free): https://fullstackopen.com/en/
- The Odin Project (Free): https://www.theodinproject.com/
- freeCodeCamp: https://www.freecodecamp.org/
- MDN Web Docs: https://developer.mozilla.org/

Aptitude & Reasoning:
- IndiaBIX: https://www.indiabix.com/aptitude/questions-and-answers/
- Prepinsta: https://prepinsta.com/

System Design:
- System Design Primer: https://github.com/donnemartin/system-design-primer
- Gaurav Sen: https://www.youtube.com/@gaborevsen

Interview Prep:
- GFG Interview Preparation: https://www.geeksforgeeks.org/company-preparation/
- InterviewBit: https://www.interviewbit.com/
- Pramp (Mock Interviews): https://www.pramp.com/

Only recommend resources from this list. Do NOT invent URLs.
Include a mix of:
- Free resources (priority for Indian students)
- YouTube channels popular in India
- Practice platforms with actual problem links
- Regional language resources as per preference"""


# ═══════════════════════════════════════════════════════════════════════════════
# TRANSLATION PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_roadmap_translation_prompt(roadmap_content: dict, target_language: str) -> str:
    """Generate prompt for translating roadmap content."""
    
    language_names = {"hi": "Hindi", "ta": "Tamil", "te": "Telugu", "en": "English"}
    lang_name = language_names.get(target_language, target_language)
    
    # Language-specific style guide
    style_guide = {
        "hi": """
Hinglish Style Guide:
- Use Devanagari script for Hindi parts
- Keep technical terms in English: array, function, loop, pointer, recursion
- Example: "Is week mein aap Arrays aur Strings ke concepts seekhenge."
- Keep resource names in English (YouTube, LeetCode, etc.)
- Use conversational, friendly tone""",
        "ta": """
Tanglish Style Guide:
- Use Roman script for Tamil parts
- Keep technical terms in English
- Example: "Indha week-la Arrays and Strings concepts learn pannuveenga."
- Keep resource names in English
- Use friendly, encouraging tone""",
        "te": """
Telgish Style Guide:
- Use Roman script for Telugu parts
- Keep technical terms in English
- Example: "Ee week lo Arrays mariyu Strings concepts nerchukuntaru."
- Keep resource names in English
- Use clear, instructional tone"""
    }.get(target_language, "Translate naturally while keeping technical terms in English.")

    return f"""Translate the following roadmap content to {lang_name}.

**Style Guide:**
{style_guide}

**Roadmap Content:**
{roadmap_content}

**Translation Guidelines:**
- Keep technical terms in English (DSA, Array, LinkedList, Function, Class, etc.)
- Translate descriptions, instructions, and explanations
- Maintain the JSON structure exactly
- Use Hinglish/Tanglish/Telgish style (simple regional language + English technical terms)
- Ensure the tone remains encouraging and professional
- Keep resource names and URLs in English
- Preserve task IDs and structure
- Translate duration descriptions but keep numbers

**Output the translated roadmap in the same JSON structure.**"""


def get_tasks_translation_prompt(tasks: list, target_language: str) -> str:
    """Generate prompt for translating daily tasks."""
    
    language_names = {"hi": "Hindi", "ta": "Tamil", "te": "Telugu", "en": "English"}
    lang_name = language_names.get(target_language, target_language)
    
    style_guide = {
        "hi": "Use Hinglish (Hindi in Devanagari + English technical terms). Example: 'Array traversal technique practice karein.'",
        "ta": "Use Tanglish (Tamil in Roman script + English technical terms). Example: 'Array traversal technique practice pannungal.'",
        "te": "Use Telgish (Telugu in Roman script + English technical terms). Example: 'Array traversal technique practice cheyandi.'"
    }.get(target_language, "Keep technical terms in English.")

    return f"""Translate the following daily tasks to {lang_name}.

**Style Guide:**
{style_guide}

**Tasks:**
{tasks}

**Translation Guidelines:**
- Keep technical terms in English: array, function, loop, pointer, recursion, API, database, etc.
- Translate titles, descriptions, and instructions
- Maintain task structure and IDs
- Use simple, clear language appropriate for students
- Keep resource names and URLs in English
- Preserve task types (video, read, practice, project)
- Translate time estimates but keep numbers (e.g., "30 minutes" -> "30 minutes" in target language)

**Output the translated tasks in the same JSON structure.**"""


# ═══════════════════════════════════════════════════════════════════════════════
# ADDITIONAL UTILITY PROMPTS
# ═══════════════════════════════════════════════════════════════════════════════

def get_placement_strategy_prompt(
    college_tier: str,
    target_companies: list,
    current_skills: dict,
    months_until_placement: int
) -> str:
    """Generate prompt for personalized placement preparation strategy."""
    
    companies_str = ", ".join(target_companies) if target_companies else "various companies"
    
    tier_strategy = {
        "tier1": """
Tier 1 Strategy:
- Focus: Product companies and high-paying roles
- Key areas: Advanced DSA, system design, competitive programming
- Timeline: Intensive preparation starting 6+ months before
- Off-campus: Apply through referrals, career portals, campus connections""",
        "tier2": """
Tier 2 Strategy:
- Focus: Mixed approach - secure service company offer first, prepare for off-campus product roles
- Key areas: Solid DSA fundamentals, aptitude, CS subjects, communication
- Timeline: 4-6 months preparation
- Off-campus: Aggressive LinkedIn networking, apply broadly""",
        "tier3": """
Tier 3 Strategy:
- Focus: Clear on-campus service company tests first, then serious off-campus preparation
- Key areas: Aptitude (heavy focus), basic programming, CS fundamentals, spoken English
- Timeline: Start 6+ months before, consistent daily effort
- Off-campus: Build strong portfolio, active LinkedIn presence, referrals crucial"""
    }.get(college_tier, "")

    return f"""Create a personalized placement preparation strategy for a Tier-{college_tier} college student.

**Student Profile:**
- College Tier: {college_tier}
- Target Companies: {companies_str}
- Current Skills: {current_skills}
- Months Until Placement: {months_until_placement}

**Tier-Specific Context:**
{tier_strategy}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide strategy as this exact JSON structure:**
{{
    "overall_strategy": "Summary of approach",
    "timeline": {{
        "months": {months_until_placement},
        "phases": [
            {{
                "phase": "Phase name",
                "duration_weeks": 4,
                "focus_areas": ["area 1", "area 2"],
                "daily_schedule": "suggested daily routine",
                "milestones": ["milestone 1"]
            }}
        ]
    }},
    "company_specific_prep": {{
        "service_companies": {{
            "focus": "what to focus on",
            "resources": ["resource 1"]
        }},
        "product_companies": {{
            "focus": "what to focus on",
            "resources": ["resource 1"]
        }}
    }},
    "off_campus_strategy": {{
        "linkedln_optimization": ["tips"],
        "application_strategy": "how to apply",
        "referral_approach": "how to get referrals",
        "portfolio_building": ["what to include"]
    }},
    "daily_routine": {{
        "weekdays": "suggested schedule",
        "weekends": "suggested schedule"
    }},
    "weekly_goals": [
        {{
            "week": 1,
            "focus": "what to achieve",
            "measurable_target": "quantifiable goal"
        }}
    ],
    "success_metrics": ["how to track progress"],
    "contingency_plan": "what to do if plan doesn't work"
}}

Make the strategy realistic and actionable. Consider typical Tier-{college_tier} college constraints and opportunities."""


def get_daily_motivation_prompt(
    student_name: str,
    streak_days: int,
    progress_stats: dict,
    college_tier: str
) -> str:
    """Generate prompt for daily motivation message."""
    
    tier_messages = {
        "tier1": "You're competing at the highest level. Your consistency sets you apart.",
        "tier2": "Your college doesn't define your potential. Your effort does.",
        "tier3": "Many top engineers came from Tier-3 colleges. You're writing your own success story."
    }
    
    return f"""Generate a motivational message for {student_name} who is preparing for campus placements.

**Progress Stats:**
- Streak: {streak_days} days
- Progress: {progress_stats}
- College Tier: {college_tier}

**Context:**
{tier_messages.get(college_tier, "Keep pushing forward!")}

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no extra text.

**Provide motivation as this exact JSON structure:**
{{
    "greeting": "Personalized greeting",
    "achievement_highlight": "What they've accomplished",
    "motivational_message": "Encouraging message for today",
    "focus_for_today": "What to focus on today",
    "inspiration_quote": "Relevant quote (Indian context if possible)",
    "reminder": "Important reminder about their goals",
    "closing": "Encouraging closing"
}}

Keep it warm, personal, and culturally relevant for Indian students."""
