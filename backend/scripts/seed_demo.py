from datetime import datetime, timedelta

from app.auth import hash_password
from app.database import SessionLocal
from app.models import DailyPlan, Interview, Resource, Roadmap, User


DEMO_EMAIL = "demo@campushire.com"
DEMO_PASSWORD = "demo123"


def build_task(task_id: str, title: str, task_type: str, duration: int, completed: bool, resources: list[dict]):
    return {
        "id": task_id,
        "title": title,
        "type": task_type,
        "duration_minutes": duration,
        "completed": completed,
        "description": f"Work through {title.lower()} and record the key takeaways.",
        "resources": resources,
    }


def pick_resources(db, topic: str, limit: int = 2):
    resources = (
        db.query(Resource)
        .filter(Resource.topic == topic)
        .order_by(Resource.resource_type.asc(), Resource.title.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "title": resource.title,
            "type": resource.resource_type,
            "url": resource.url,
            "difficulty": resource.difficulty,
            "platform": resource.platform,
            "resource_type": resource.resource_type,
            "youtube_url": resource.youtube_url,
        }
        for resource in resources
    ]


def build_roadmap_content(db):
    arrays_resources = pick_resources(db, "Arrays")
    strings_resources = pick_resources(db, "Strings")
    graph_resources = pick_resources(db, "Graphs")
    dp_resources = pick_resources(db, "Dynamic Programming")
    sql_resources = pick_resources(db, "SQL") or pick_resources(db, "DBMS")
    project_resources = pick_resources(db, "Projects")

    return {
        "title": "Roadmap: SDE at Amazon, Microsoft",
        "total_weeks": 4,
        "weeks": [
            {
                "week": 1,
                "title": "Array Sprint",
                "description": "Core array patterns with interview-style repetition.",
                "days": [
                    {
                        "day": 1,
                        "title": "Array Warmup",
                        "tasks": [
                            build_task("w1d1t1", "Solve Two Sum and Best Time to Buy/Sell Stock", "practice", 45, True, arrays_resources[:1]),
                            build_task("w1d1t2", "Review prefix sums and sliding window notes", "review", 30, True, arrays_resources[1:2] or arrays_resources[:1]),
                        ],
                    },
                    {
                        "day": 2,
                        "title": "Intervals Focus",
                        "tasks": [
                            build_task("w1d2t1", "Practice Merge Intervals", "practice", 45, True, arrays_resources[:1]),
                            build_task("w1d2t2", "Summarize interval heuristics", "review", 25, False, arrays_resources[1:2] or arrays_resources[:1]),
                        ],
                    },
                    {
                        "day": 3,
                        "title": "Mock Mix",
                        "tasks": [
                            build_task("w1d3t1", "Solve Container With Most Water", "practice", 40, False, arrays_resources[:1]),
                            build_task("w1d3t2", "Explain your approach in Hindi", "learn", 20, False, project_resources[:1] or arrays_resources[:1]),
                        ],
                    },
                ],
            },
            {
                "week": 2,
                "title": "Strings and SQL",
                "description": "Strings, hashing, and quick SQL refresh for service + product rounds.",
                "days": [
                    {
                        "day": 1,
                        "title": "String Patterns",
                        "tasks": [
                            build_task("w2d1t1", "Group Anagrams and Valid Anagram", "practice", 45, True, strings_resources[:1]),
                            build_task("w2d1t2", "Write SQL joins revision sheet", "learn", 30, True, sql_resources[:1] or strings_resources[:1]),
                        ],
                    },
                    {
                        "day": 2,
                        "title": "Window Drills",
                        "tasks": [
                            build_task("w2d2t1", "Longest Substring Without Repeating Characters", "practice", 45, False, strings_resources[:1]),
                            build_task("w2d2t2", "Minimum Window Substring walkthrough", "review", 35, False, strings_resources[1:2] or strings_resources[:1]),
                        ],
                    },
                ],
            },
            {
                "week": 3,
                "title": "Graphs Push",
                "description": "BFS/DFS and graph traversal under time pressure.",
                "days": [
                    {
                        "day": 1,
                        "title": "Traversal Core",
                        "tasks": [
                            build_task("w3d1t1", "Number of Islands", "practice", 45, False, graph_resources[:1]),
                            build_task("w3d1t2", "Rotting Oranges", "practice", 35, False, graph_resources[1:2] or graph_resources[:1]),
                        ],
                    }
                ],
            },
            {
                "week": 4,
                "title": "DP and Interview",
                "description": "DP fundamentals plus interview polish.",
                "days": [
                    {
                        "day": 1,
                        "title": "DP Core",
                        "tasks": [
                            build_task("w4d1t1", "House Robber and Coin Change", "practice", 50, False, dp_resources[:1]),
                            build_task("w4d1t2", "Record a concise explanation of your state transition", "review", 20, False, dp_resources[1:2] or dp_resources[:1]),
                        ],
                    }
                ],
            },
        ],
    }


def seed_demo():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if user is None:
            user = User(
                email=DEMO_EMAIL,
                name="Campus Demo",
                password_hash=hash_password(DEMO_PASSWORD),
            )
            db.add(user)
            db.flush()

        user.name = "Campus Demo"
        user.password_hash = hash_password(DEMO_PASSWORD)
        user.college = "Demo Engineering College"
        user.college_tier = "tier2"
        user.degree = "B.Tech"
        user.major = "Computer Science"
        user.current_year = 3
        user.is_cs_background = True
        user.target_role = "sde"
        user.target_companies = ["Amazon", "Microsoft"]
        user.hours_per_day = 3
        user.days_per_week = 5
        user.preferred_language = "hi"
        user.onboarding_completed = True
        user.skills = {
            "DSA": {"level": 3},
            "DBMS": {"level": 2},
            "OS": {"level": 2},
            "SQL": {"level": 3},
        }

        db.query(DailyPlan).filter(DailyPlan.user_id == user.id).delete()
        db.query(Interview).filter(Interview.user_id == user.id).delete()
        db.query(Roadmap).filter(Roadmap.user_id == user.id).delete()
        db.flush()

        roadmap_content = build_roadmap_content(db)
        roadmap = Roadmap(
            user_id=user.id,
            content=roadmap_content,
            total_weeks=4,
            current_week=1,
            current_day=3,
            is_active=True,
            target_role="sde",
        )
        db.add(roadmap)
        db.flush()

        now = datetime.now()

        def _focus(week_idx: int, day_idx: int) -> str | None:
            try:
                d = roadmap_content["weeks"][week_idx]["days"][day_idx]
                return d.get("focus_area") or d.get("title") or None
            except (KeyError, IndexError):
                return None

        daily_plan_payloads = [
            (1, 1, roadmap_content["weeks"][0]["days"][0]["tasks"], now - timedelta(days=4), _focus(0, 0)),
            (1, 2, roadmap_content["weeks"][0]["days"][1]["tasks"], now - timedelta(days=3), _focus(0, 1)),
            (1, 3, roadmap_content["weeks"][0]["days"][2]["tasks"], now - timedelta(days=2), _focus(0, 2)),
            (2, 1, roadmap_content["weeks"][1]["days"][0]["tasks"], now - timedelta(days=1), _focus(1, 0)),
            (2, 2, roadmap_content["weeks"][1]["days"][1]["tasks"], now, _focus(1, 1)),
        ]

        for week, day, tasks, created_at, focus_area in daily_plan_payloads:
            db.add(
                DailyPlan(
                    roadmap_id=roadmap.id,
                    user_id=user.id,
                    week=week,
                    day=day,
                    tasks=tasks,
                    focus_area=focus_area,
                    created_at=created_at,
                )
            )

        db.add(
            Interview(
                user_id=user.id,
                role="sde",
                company="Amazon",
                messages=[
                    {"role": "assistant", "content": "Tell me about yourself."},
                    {"role": "user", "content": "I am a third-year CSE student focused on DSA and backend development."},
                ],
                score=75,
                feedback="Good structure and clarity. Improve by adding one concrete project impact example.",
                created_at=now - timedelta(days=2),
            )
        )
        db.add(
            Interview(
                user_id=user.id,
                role="sde",
                company="Microsoft",
                messages=[
                    {"role": "assistant", "content": "How would you solve Two Sum efficiently?"},
                    {"role": "user", "content": "I would use a hash map to track complements in O(n) time."},
                ],
                score=82,
                feedback="Strong problem solving and clean explanation. Push harder on edge-case discussion.",
                created_at=now - timedelta(days=1),
            )
        )

        db.commit()
        print(f"Demo account ready: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
