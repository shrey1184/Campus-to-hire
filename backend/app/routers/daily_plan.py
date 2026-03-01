import copy
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Roadmap, DailyPlan
from app.schemas import DailyPlanResponse, TaskCompleteRequest

router = APIRouter(prefix="/api/daily-plan", tags=["daily-plan"])


def _get_active_roadmap(user: User, db: Session) -> Roadmap:
    """Return the user's active roadmap or raise 404."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id, Roadmap.is_active == True)
        .first()
    )
    if roadmap is None:
        raise HTTPException(status_code=404, detail="No active roadmap found.")
    return roadmap


def _get_today_plan(roadmap: Roadmap, db: Session) -> DailyPlan | None:
    """Return the DailyPlan row for the roadmap's current week/day, if it exists."""
    return (
        db.query(DailyPlan)
        .filter(
            DailyPlan.roadmap_id == roadmap.id,
            DailyPlan.week == roadmap.current_week,
            DailyPlan.day == roadmap.current_day,
        )
        .first()
    )


def _derive_tasks_from_roadmap(roadmap: Roadmap) -> list[dict]:
    """
    Extract the task list for the current week/day from the roadmap's
    JSON content.  Each task gets a stable UUID and a ``completed`` flag.

    Expected content shape:
        {"weeks": [{"days": [{"tasks": [...]}]}]}
    """
    try:
        week_index = roadmap.current_week - 1
        day_index = roadmap.current_day - 1
        raw_tasks: list[dict] = (
            roadmap.content["weeks"][week_index]["days"][day_index]["tasks"]
        )
    except (KeyError, IndexError, TypeError):
        raise HTTPException(
            status_code=422,
            detail=(
                f"Roadmap content does not contain tasks for "
                f"week {roadmap.current_week}, day {roadmap.current_day}."
            ),
        )

    tasks: list[dict] = []
    for raw in raw_tasks:
        task = dict(raw)
        if "id" not in task or not task["id"]:
            task["id"] = str(uuid.uuid4())
        task.setdefault("completed", False)
        tasks.append(task)

    return tasks


def _advance_roadmap(roadmap: Roadmap) -> None:
    """
    Move the roadmap pointer to the next day (and week if needed).

    Days per week are inferred from the roadmap content; we fall back to 7
    if the structure is unavailable.  The pointer is capped at total_weeks
    to avoid going past the end of the roadmap.
    """
    try:
        week_index = roadmap.current_week - 1
        days_this_week: int = len(
            roadmap.content["weeks"][week_index]["days"]
        )
    except (KeyError, IndexError, TypeError):
        days_this_week = 7

    if roadmap.current_day < days_this_week:
        roadmap.current_day += 1
    elif roadmap.current_week < roadmap.total_weeks:
        roadmap.current_week += 1
        roadmap.current_day = 1
    # If already on the last day of the last week, leave the pointer in place.


def _sync_tasks_to_roadmap(
    roadmap: Roadmap,
    week: int,
    day: int,
    tasks: list[dict],
    db: Session,
) -> None:
    """Write task completion flags back into the roadmap's content JSON.

    This keeps the roadmap page in sync with the daily-plan page so that
    completed tasks show as completed everywhere.
    """
    try:
        week_index = week - 1
        day_index = day - 1
        content = copy.deepcopy(roadmap.content)
        roadmap_tasks = content["weeks"][week_index]["days"][day_index]["tasks"]
    except (KeyError, IndexError, TypeError):
        return  # Nothing to sync — silently skip

    # Build a lookup from task id → completed
    completion_map = {t["id"]: t.get("completed", False) for t in tasks if "id" in t}

    changed = False
    for rt in roadmap_tasks:
        tid = rt.get("id")
        if tid and tid in completion_map:
            new_val = completion_map[tid]
            if rt.get("completed") != new_val:
                rt["completed"] = new_val
                changed = True

    if changed:
        roadmap.content = content
        flag_modified(roadmap, "content")


@router.get("", response_model=DailyPlanResponse)
def get_today_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyPlan:
    """Return today's daily plan derived from the user's active roadmap.

    If no DailyPlan row exists for the current week/day yet, one is created
    from the roadmap's content JSON and persisted to the database.
    """
    roadmap = _get_active_roadmap(current_user, db)

    plan = _get_today_plan(roadmap, db)
    if plan is not None:
        return plan

    tasks = _derive_tasks_from_roadmap(roadmap)

    plan = DailyPlan(
        roadmap_id=roadmap.id,
        user_id=current_user.id,
        week=roadmap.current_week,
        day=roadmap.current_day,
        tasks=tasks,
    )
    db.add(plan)

    # Sync the stable UUIDs we just assigned back into the roadmap content
    # so that the roadmap page and daily-plan page always reference the same IDs.
    _sync_tasks_to_roadmap(roadmap, roadmap.current_week, roadmap.current_day, tasks, db)

    db.commit()
    db.refresh(plan)

    return plan


@router.patch("/task/complete", response_model=DailyPlanResponse)
def complete_task(
    body: TaskCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyPlan:
    """Mark a task as complete or incomplete.

    If all tasks in the plan are completed after the update, the roadmap
    pointer is automatically advanced to the next day (or next week).
    """
    roadmap = _get_active_roadmap(current_user, db)

    plan = _get_today_plan(roadmap, db)
    if plan is None:
        raise HTTPException(status_code=404, detail="No daily plan found for today.")

    tasks: list[dict] = copy.deepcopy(plan.tasks)
    task_found = False
    for task in tasks:
        if task.get("id") == body.task_id:
            task["completed"] = body.completed
            task_found = True
            break

    if not task_found:
        raise HTTPException(
            status_code=404,
            detail=f"Task '{body.task_id}' not found in today's plan.",
        )

    # Reassign and explicitly flag the JSON column dirty so SQLAlchemy always
    # issues an UPDATE (plain reassignment can be a no-op when the in-memory
    # dicts were mutated before the column was set).
    plan.tasks = tasks
    flag_modified(plan, "tasks")

    # ── Sync completion state back into the roadmap content JSON ──
    _sync_tasks_to_roadmap(roadmap, plan.week, plan.day, tasks, db)

    db.commit()
    db.refresh(plan)

    return plan


@router.post("/next", response_model=DailyPlanResponse)
def advance_to_next_day(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DailyPlan:
    """Advance the roadmap pointer to the next day and return a new plan.

    Only allowed when all tasks in the current day's plan are completed.
    If the next day's content doesn't exist (pending week), raises 422.
    """
    roadmap = _get_active_roadmap(current_user, db)

    plan = _get_today_plan(roadmap, db)
    if plan is not None:
        all_complete = all(t.get("completed", False) for t in plan.tasks)
        if not all_complete:
            raise HTTPException(
                status_code=400,
                detail="Complete all tasks before advancing to the next day.",
            )

    # Advance the roadmap pointer
    old_week, old_day = roadmap.current_week, roadmap.current_day
    _advance_roadmap(roadmap)

    # Check if pointer actually moved (could be at the end of roadmap)
    if roadmap.current_week == old_week and roadmap.current_day == old_day:
        raise HTTPException(
            status_code=400,
            detail="You have reached the end of the roadmap.",
        )

    # Try to create a plan for the new day
    existing = _get_today_plan(roadmap, db)
    if existing is not None:
        db.commit()
        return existing

    tasks = _derive_tasks_from_roadmap(roadmap)

    new_plan = DailyPlan(
        roadmap_id=roadmap.id,
        user_id=current_user.id,
        week=roadmap.current_week,
        day=roadmap.current_day,
        tasks=tasks,
    )
    db.add(new_plan)
    _sync_tasks_to_roadmap(roadmap, roadmap.current_week, roadmap.current_day, tasks, db)

    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.get("/history", response_model=list[DailyPlanResponse])
def get_plan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DailyPlan]:
    """Return all DailyPlan records for the user's active roadmap.

    Results are ordered by week ascending, then day ascending so callers
    receive the plans in chronological order.
    """
    roadmap = _get_active_roadmap(current_user, db)

    plans: list[DailyPlan] = (
        db.query(DailyPlan)
        .filter(DailyPlan.roadmap_id == roadmap.id)
        .order_by(DailyPlan.week.asc(), DailyPlan.day.asc())
        .all()
    )

    return plans
