import copy
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, attributes

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Roadmap
from app.schemas import RoadmapResponse, RoadmapListResponse, GenerateWeekRequest
from app.services.bedrock import bedrock_service
from app.services.prompts import (
    ROADMAP_SYSTEM_PROMPT,
    ROADMAP_WEEK_SYSTEM_PROMPT,
    get_roadmap_prompt,
    get_roadmap_plan_prompt,
    get_roadmap_week_prompt,
)

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

ALLOWED_TASK_TYPES = {"learn", "practice", "review", "interview", "project", "quiz"}
TASK_TYPE_ALIASES = {
    "video": "learn",
    "read": "learn",
    "reading": "learn",
    "article": "learn",
    "coding": "practice",
    "code": "practice",
}


def _to_positive_int(value: object, default: int) -> int:
    try:
        parsed = int(value)  # type: ignore[arg-type]
        if parsed > 0:
            return parsed
    except (TypeError, ValueError):
        pass
    return default


def _normalize_task(task: object, week_num: int, day_num: int, task_num: int) -> dict:
    data = task if isinstance(task, dict) else {}

    task_id = str(data.get("id") or f"w{week_num}d{day_num}t{task_num}")
    title = str(data.get("title") or f"Task {task_num}").strip()
    description = str(data.get("description") or "").strip()

    raw_type = str(data.get("type") or "learn").strip().lower()
    task_type = TASK_TYPE_ALIASES.get(raw_type, raw_type)
    if task_type not in ALLOWED_TASK_TYPES:
        task_type = "learn"

    duration = _to_positive_int(data.get("duration_minutes"), 30)

    resources: list[dict] = []
    raw_resources = data.get("resources") if isinstance(data, dict) else None
    if isinstance(raw_resources, list):
        for resource in raw_resources:
            if isinstance(resource, dict):
                title_value = str(
                    resource.get("title")
                    or resource.get("name")
                    or resource.get("label")
                    or "Resource"
                ).strip()
                resource_item = {
                    "title": title_value or "Resource",
                    "type": str(resource.get("type") or "link").strip() or "link",
                }
                if resource.get("url"):
                    resource_item["url"] = str(resource.get("url"))
                resources.append(resource_item)
            elif isinstance(resource, str) and resource.strip():
                resources.append(
                    {
                        "title": resource.strip(),
                        "type": "link",
                    }
                )

    if not resources:
        resources = [{"title": "Practice Materials", "type": "reference"}]

    normalized_task = {
        "id": task_id or str(uuid.uuid4()),
        "title": title or f"Task {task_num}",
        "type": task_type,
        "duration_minutes": duration,
        "completed": bool(data.get("completed", False)),
        "resources": resources,
    }

    if description:
        normalized_task["description"] = description

    return normalized_task


def _normalize_day(day: object, week_num: int, day_num: int) -> dict:
    data = day if isinstance(day, dict) else {}
    parsed_day_num = _to_positive_int(data.get("day"), day_num)
    title = str(data.get("title") or f"Day {parsed_day_num}").strip()

    raw_tasks = data.get("tasks") if isinstance(data, dict) else None
    task_list = raw_tasks if isinstance(raw_tasks, list) else []
    tasks = [
        _normalize_task(task, week_num, parsed_day_num, index + 1)
        for index, task in enumerate(task_list)
    ]

    if not tasks:
        tasks = [
            _normalize_task(
                {
                    "title": "Foundational learning task",
                    "description": "Review core concepts and solve 2 practice problems.",
                    "type": "learn",
                    "duration_minutes": 45,
                    "resources": [{"title": "GeeksforGeeks", "type": "article"}],
                },
                week_num,
                parsed_day_num,
                1,
            )
        ]

    return {
        "day": parsed_day_num,
        "title": title or f"Day {parsed_day_num}",
        "tasks": tasks,
    }


def _normalize_week(week: object, week_num: int, days_per_week: int) -> dict:
    data = week if isinstance(week, dict) else {}
    parsed_week_num = _to_positive_int(data.get("week"), week_num)
    title = str(data.get("title") or data.get("theme") or f"Week {parsed_week_num}").strip()
    description = str(data.get("description") or "").strip()

    raw_days = data.get("days") if isinstance(data, dict) else None
    day_list = raw_days if isinstance(raw_days, list) else []
    days = [
        _normalize_day(day, parsed_week_num, index + 1)
        for index, day in enumerate(day_list[:days_per_week])
    ]

    if not days:
        for day_num in range(1, days_per_week + 1):
            days.append(_normalize_day({}, parsed_week_num, day_num))

    normalized_week = {
        "week": parsed_week_num,
        "title": title or f"Week {parsed_week_num}",
        "days": days,
    }

    if description:
        normalized_week["description"] = description

    return normalized_week


def _normalize_roadmap_content(content: object, days_per_week: int) -> dict:
    payload = content if isinstance(content, dict) else {}
    days_per_week = max(1, min(7, _to_positive_int(days_per_week, 5)))

    raw_weeks = payload.get("weeks") if isinstance(payload, dict) else None
    week_list = raw_weeks if isinstance(raw_weeks, list) else []

    normalized_weeks = [
        _normalize_week(week, index + 1, days_per_week)
        for index, week in enumerate(week_list)
    ]

    total_weeks = _to_positive_int(payload.get("total_weeks"), len(normalized_weeks) or 8)

    if not normalized_weeks:
        normalized_weeks = [
            _normalize_week({}, week_num, days_per_week)
            for week_num in range(1, total_weeks + 1)
        ]
    else:
        total_weeks = max(total_weeks, len(normalized_weeks))
        if len(normalized_weeks) < total_weeks:
            for week_num in range(len(normalized_weeks) + 1, total_weeks + 1):
                normalized_weeks.append(_normalize_week({}, week_num, days_per_week))

    title = str(payload.get("title") or "Personalized Learning Roadmap").strip()

    return {
        "title": title or "Personalized Learning Roadmap",
        "total_weeks": total_weeks,
        "weeks": normalized_weeks,
        "fallback": bool(payload.get("fallback", False)),
        "message": str(payload.get("message") or ""),
    }


@router.post("/generate", response_model=RoadmapResponse)
def generate_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_profile = {
        "college": current_user.college,
        "college_tier": current_user.college_tier,
        "degree": current_user.degree,
        "major": current_user.major,
        "is_cs_background": current_user.is_cs_background,
        "target_role": current_user.target_role,
        "target_companies": current_user.target_companies,
        "hours_per_day": current_user.hours_per_day,
        "days_per_week": current_user.days_per_week,
        "skills": current_user.skills,
        "current_year": current_user.current_year,
    }

    # Step 1: Generate the plan skeleton + detailed Week 1
    raw_response = bedrock_service.invoke_model(
        ROADMAP_SYSTEM_PROMPT,
        get_roadmap_plan_prompt(user_profile),
        max_tokens=4096,
        fallback_type="roadmap",
    )
    parsed_json = bedrock_service.parse_json_response_safe(
        raw_response,
        fallback={
            "title": "Personalized Learning Roadmap",
            "total_weeks": 8,
            "plan": [],
            "week_1": {},
            "fallback": True,
            "message": "Generated fallback roadmap due to AI response parsing issues.",
        },
    )

    plan = parsed_json.get("plan", [])
    week_1_data = parsed_json.get("week_1", {})
    total_weeks = _to_positive_int(parsed_json.get("total_weeks"), 8)
    title = str(parsed_json.get("title") or "Personalized Learning Roadmap").strip()

    # Build weeks array: Week 1 is detailed, rest are skeleton placeholders
    weeks = []
    normalized_week_1 = _normalize_week(week_1_data, 1, current_user.days_per_week)
    weeks.append(normalized_week_1)

    for i in range(2, total_weeks + 1):
        # Find theme from plan
        plan_entry = next((p for p in plan if isinstance(p, dict) and p.get("week") == i), {})
        theme = str(plan_entry.get("theme") or f"Week {i}").strip()
        focus = str(plan_entry.get("focus") or "").strip()
        weeks.append({
            "week": i,
            "title": theme,
            "description": focus,
            "days": [],  # Empty — will be filled by generate-week calls
            "pending": True,  # Marker for frontend to know this week needs generation
        })

    normalized_content = {
        "title": title or "Personalized Learning Roadmap",
        "total_weeks": total_weeks,
        "weeks": weeks,
        "plan": plan,  # Store plan for use in subsequent generate-week calls
        "fallback": bool(parsed_json.get("fallback", False)),
        "message": str(parsed_json.get("message") or ""),
    }

    # Deactivate existing active roadmaps
    db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.is_active == True,
    ).update({"is_active": False})

    roadmap = Roadmap(
        user_id=current_user.id,
        content=normalized_content,
        total_weeks=total_weeks,
        is_active=True,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.post("/{roadmap_id}/generate-week", response_model=RoadmapResponse)
def generate_week(
    roadmap_id: str,
    body: GenerateWeekRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate detailed content for a single week of an existing roadmap."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if roadmap is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    content = roadmap.content or {}
    weeks = content.get("weeks", [])
    plan = content.get("plan", [])
    total_weeks = content.get("total_weeks", len(weeks))
    week_number = body.week_number

    if week_number < 1 or week_number > total_weeks:
        raise HTTPException(status_code=400, detail=f"Week number must be between 1 and {total_weeks}")

    # Check if this week already has content (non-empty days and no pending flag)
    week_index = week_number - 1
    if week_index < len(weeks):
        existing = weeks[week_index]
        if isinstance(existing, dict) and existing.get("days") and not existing.get("pending"):
            raise HTTPException(status_code=400, detail=f"Week {week_number} already has content")

    # Build user profile for the prompt
    user_profile = {
        "college_tier": current_user.college_tier,
        "is_cs_background": current_user.is_cs_background,
        "target_role": current_user.target_role,
        "target_companies": current_user.target_companies,
        "hours_per_day": current_user.hours_per_day,
        "days_per_week": current_user.days_per_week,
        "preferred_language": getattr(current_user, "preferred_language", "en"),
    }

    # Collect themes of already-generated weeks for context
    previous_themes = []
    for w in weeks[:week_index]:
        if isinstance(w, dict) and w.get("days") and not w.get("pending"):
            previous_themes.append(str(w.get("title") or w.get("theme") or f"Week {w.get('week', '?')}"))

    raw_response = bedrock_service.invoke_model(
        ROADMAP_WEEK_SYSTEM_PROMPT,
        get_roadmap_week_prompt(user_profile, week_number, plan, previous_themes or None),
        max_tokens=4096,
        fallback_type="roadmap_week",
    )
    parsed_week = bedrock_service.parse_json_response_safe(
        raw_response,
        fallback={"week": week_number, "theme": f"Week {week_number}", "days": []},
    )

    # Normalize the generated week
    normalized_week = _normalize_week(parsed_week, week_number, current_user.days_per_week)

    # Update the roadmap content — use deepcopy + flag_modified for SQLAlchemy
    updated_content = copy.deepcopy(content)
    updated_weeks = updated_content.get("weeks", [])

    # Ensure weeks array is long enough
    while len(updated_weeks) <= week_index:
        updated_weeks.append({"week": len(updated_weeks) + 1, "title": f"Week {len(updated_weeks) + 1}", "days": [], "pending": True})

    # Replace the week — remove the pending flag
    normalized_week.pop("pending", None)
    updated_weeks[week_index] = normalized_week
    updated_content["weeks"] = updated_weeks

    roadmap.content = updated_content
    attributes.flag_modified(roadmap, "content")
    db.commit()
    db.refresh(roadmap)
    return roadmap


@router.get("", response_model=RoadmapResponse)
def get_active_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id, Roadmap.is_active == True)
        .first()
    )
    if roadmap is None:
        raise HTTPException(status_code=404, detail="No active roadmap found")
    return roadmap


@router.get("/list/all", response_model=RoadmapListResponse)
def list_all_roadmaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all roadmaps for the current user."""
    roadmaps = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id)
        .order_by(Roadmap.is_active.desc(), Roadmap.created_at.desc())
        .all()
    )

    return RoadmapListResponse(
        roadmaps=roadmaps,
        total=len(roadmaps),
    )


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap_by_id(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    if roadmap is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.put("/{roadmap_id}/activate", response_model=RoadmapResponse)
def activate_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Switch active roadmap. Deactivates current active roadmap and activates the specified one."""
    # Check if the roadmap exists and belongs to the user
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    
    if roadmap is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    if roadmap.is_active:
        return roadmap  # Already active
    
    # Deactivate all user's roadmaps
    db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.is_active == True,
    ).update({"is_active": False})
    
    # Activate the specified roadmap
    roadmap.is_active = True
    db.commit()
    db.refresh(roadmap)
    
    return roadmap


@router.delete("/{roadmap_id}", status_code=204)
def delete_roadmap(
    roadmap_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a roadmap. If it was the active roadmap, another roadmap may become active."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )
    
    if roadmap is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    was_active = roadmap.is_active
    
    db.delete(roadmap)
    db.commit()
    
    # If we deleted the active roadmap, try to activate another one
    if was_active:
        another_roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.user_id == current_user.id)
            .order_by(Roadmap.created_at.desc())
            .first()
        )
        if another_roadmap:
            another_roadmap.is_active = True
            db.commit()
    
    return None
