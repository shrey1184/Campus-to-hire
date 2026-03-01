from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Roadmap, DailyPlan, Interview
from app.schemas import (
    DashboardData,
    ActivitiesResponse,
    RecommendationsResponse,
    ActivityItem,
    RecommendationItem,
    UserProfile,
    RoadmapResponse,
    DailyPlanResponse,
    ProgressOverview,
    LearningStreak,
    DashboardStats,
    CompleteDashboardStats,
    WeeklyStats,
    PerformanceTrend,
    ActivityHeatmapData,
    Achievement,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _get_recent_activities(user: User, db: Session, limit: int = 10) -> list[ActivityItem]:
    """Get recent user activities from various sources."""
    activities = []
    
    # Get activities from daily plans
    daily_plans = (
        db.query(DailyPlan)
        .filter(DailyPlan.user_id == user.id)
        .order_by(DailyPlan.created_at.desc())
        .limit(limit)
        .all()
    )
    
    for plan in daily_plans:
        tasks_completed = sum(1 for t in (plan.tasks or []) if t.get("completed", False))
        if tasks_completed > 0:
            activities.append(ActivityItem(
                id=f"task_{plan.id}",
                type="task_completion",
                title="Completed Daily Tasks",
                description=f"Completed {tasks_completed} tasks in Week {plan.week}, Day {plan.day}",
                timestamp=plan.created_at,
                metadata={
                    "week": plan.week,
                    "day": plan.day,
                    "tasks_completed": tasks_completed,
                },
            ))
    
    # Get activities from interviews
    interviews = (
        db.query(Interview)
        .filter(Interview.user_id == user.id)
        .order_by(Interview.created_at.desc())
        .limit(limit)
        .all()
    )
    
    for interview in interviews:
        if interview.score is not None:
            activities.append(ActivityItem(
                id=f"interview_{interview.id}",
                type="interview_completed",
                title=f"Completed Mock Interview: {interview.role}",
                description=f"Scored {interview.score}/10 in {interview.company or 'General'} interview",
                timestamp=interview.created_at,
                metadata={
                    "role": interview.role,
                    "company": interview.company,
                    "score": interview.score,
                },
            ))
        else:
            activities.append(ActivityItem(
                id=f"interview_{interview.id}",
                type="interview_started",
                title=f"Started Mock Interview: {interview.role}",
                description=f"Started practice interview for {interview.role} role",
                timestamp=interview.created_at,
                metadata={
                    "role": interview.role,
                    "company": interview.company,
                },
            ))
    
    # Get activities from roadmap creation
    roadmaps = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id)
        .order_by(Roadmap.created_at.desc())
        .limit(limit)
        .all()
    )
    
    for roadmap in roadmaps:
        title = roadmap.content.get("title", "New Roadmap") if roadmap.content else "New Roadmap"
        activities.append(ActivityItem(
            id=f"roadmap_{roadmap.id}",
            type="roadmap_created",
            title="Created Learning Roadmap",
            description=title,
            timestamp=roadmap.created_at,
            metadata={
                "roadmap_id": roadmap.id,
                "is_active": roadmap.is_active,
            },
        ))
    
    # Sort by timestamp descending and return top items
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    return activities[:limit]


def _get_recommendations(user: User, db: Session) -> list[RecommendationItem]:
    """Generate personalized recommendations for the user."""
    recommendations = []
    
    # Check if user has an active roadmap
    active_roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id, Roadmap.is_active == True)
        .first()
    )
    
    if not active_roadmap:
        recommendations.append(RecommendationItem(
            id="rec_create_roadmap",
            type="roadmap",
            title="Create Your Learning Roadmap",
            description="You don't have an active learning plan. Generate a personalized roadmap based on your goals.",
            priority="high",
            action_url="/roadmap/generate",
        ))
    else:
        # Check daily plan progress
        today_plan = (
            db.query(DailyPlan)
            .filter(
                DailyPlan.roadmap_id == active_roadmap.id,
                DailyPlan.week == active_roadmap.current_week,
                DailyPlan.day == active_roadmap.current_day,
            )
            .first()
        )
        
        if today_plan:
            pending_tasks = sum(1 for t in (today_plan.tasks or []) if not t.get("completed", False))
            if pending_tasks > 0:
                recommendations.append(RecommendationItem(
                    id="rec_complete_tasks",
                    type="daily_plan",
                    title=f"Complete Today's Tasks",
                    description=f"You have {pending_tasks} pending tasks for today. Keep your streak going!",
                    priority="high",
                    action_url="/daily-plan",
                ))
        
        # Check if roadmap is progressing
        if active_roadmap.current_week == 1 and active_roadmap.current_day <= 2:
            recommendations.append(RecommendationItem(
                id="rec_get_started",
                type="getting_started",
                title="Getting Started with Your Roadmap",
                description="You're just beginning your learning journey. Start with the basics and build consistency.",
                priority="medium",
                action_url="/roadmap",
            ))
    
    # Check if user has taken any interviews
    interview_count = (
        db.query(Interview)
        .filter(Interview.user_id == user.id)
        .count()
    )
    
    if interview_count == 0:
        recommendations.append(RecommendationItem(
            id="rec_first_interview",
            type="interview",
            title="Try Your First Mock Interview",
            description="Practice makes perfect. Take a mock interview to assess your readiness.",
            priority="high",
            action_url="/interview",
        ))
    elif interview_count < 3:
        recommendations.append(RecommendationItem(
            id="rec_more_interviews",
            type="interview",
            title="Take More Mock Interviews",
            description="You've started practicing! Keep going with more interviews to improve.",
            priority="medium",
            action_url="/interview",
        ))
    
    # Check skills
    if not user.skills or (isinstance(user.skills, dict) and len(user.skills) < 3):
        recommendations.append(RecommendationItem(
            id="rec_assess_skills",
            type="skills",
            title="Complete Skills Assessment",
            description="Update your skills profile to get better personalized recommendations.",
            priority="medium",
            action_url="/profile/skills",
        ))
    
    # Target role specific recommendations
    if user.target_role:
        recommendations.append(RecommendationItem(
            id="rec_role_resources",
            type="resources",
            title=f"Resources for {user.target_role}",
            description=f"Explore curated learning materials specifically for {user.target_role} roles.",
            priority="low",
            action_url=f"/content/resources?topic={user.target_role.replace(' ', '+')}",
        ))
    
    # General recommendations
    recommendations.append(RecommendationItem(
        id="rec_consistency",
        type="tip",
        title="Consistency is Key",
        description="Try to study at the same time every day to build a habit. Even 30 minutes daily is better than 3 hours once a week.",
        priority="low",
    ))
    
    return recommendations


def _calculate_streak(user: User, db: Session) -> LearningStreak:
    """Calculate user's learning streak."""
    all_plans = (
        db.query(DailyPlan)
        .filter(DailyPlan.user_id == user.id)
        .order_by(DailyPlan.created_at.desc())
        .all()
    )
    
    if not all_plans:
        return LearningStreak(
            current_streak=0,
            longest_streak=0,
            last_activity_date=None,
            streak_history=[],
        )
    
    # Calculate current streak
    current_streak = 0
    last_date = None
    
    for plan in all_plans:
        plan_date = plan.created_at.date()
        
        if last_date is None:
            # Check if last activity was recent (within last 2 days)
            today = datetime.now().date()
            days_diff = (today - plan_date).days
            
            if days_diff <= 1:
                current_streak = 1
                last_date = plan_date
            else:
                break
        else:
            days_diff = (last_date - plan_date).days
            
            if days_diff == 1:
                current_streak += 1
                last_date = plan_date
            elif days_diff == 0:
                # Same day, continue
                continue
            else:
                break
    
    # Generate streak history
    last_7_days = []
    today = datetime.now().date()
    
    for i in range(7):
        date = today - timedelta(days=i)
        plans_for_date = [p for p in all_plans if p.created_at.date() == date]
        
        if plans_for_date:
            total_completed = sum(
                sum(1 for t in (p.tasks or []) if t.get("completed", False))
                for p in plans_for_date
            )
            last_7_days.append({
                "date": date.isoformat(),
                "active": True,
                "tasks_completed": total_completed,
            })
        else:
            last_7_days.append({
                "date": date.isoformat(),
                "active": False,
                "tasks_completed": 0,
            })
    
    return LearningStreak(
        current_streak=current_streak,
        longest_streak=max(current_streak, 0),
        last_activity_date=all_plans[0].created_at,
        streak_history=last_7_days,
    )


def _calculate_progress_overview(user: User, db: Session) -> ProgressOverview:
    """Calculate progress overview for the user."""
    roadmaps = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id)
        .all()
    )
    
    # Calculate overall completion
    if roadmaps:
        total_completion = sum(
            min(100, ((r.current_week - 1) * 7 + r.current_day - 1) / max(1, r.total_weeks * 7) * 100)
            for r in roadmaps
        )
        overall_completion = round(total_completion / len(roadmaps), 1)
    else:
        overall_completion = 0.0
    
    # Get active roadmap progress
    active_roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id, Roadmap.is_active == True)
        .first()
    )
    
    active_roadmap_progress = {}
    if active_roadmap:
        title = "Untitled Roadmap"
        if active_roadmap.content and isinstance(active_roadmap.content, dict):
            title = active_roadmap.content.get("title", "Untitled Roadmap")
        
        active_roadmap_progress = {
            "roadmap_id": active_roadmap.id,
            "title": title,
            "current_week": active_roadmap.current_week,
            "total_weeks": active_roadmap.total_weeks,
            "completion_percentage": round(
                ((active_roadmap.current_week - 1) * 7 + active_roadmap.current_day - 1) / 
                max(1, active_roadmap.total_weeks * 7) * 100, 1
            ),
        }
    
    # Weekly completion
    weekly_completion = []
    for week_offset in range(3, -1, -1):
        week_end = datetime.now() - timedelta(days=week_offset * 7)
        week_start = week_end - timedelta(days=7)
        
        plans = (
            db.query(DailyPlan)
            .filter(
                DailyPlan.user_id == user.id,
                DailyPlan.created_at >= week_start,
                DailyPlan.created_at < week_end,
            )
            .all()
        )
        
        tasks_completed = sum(
            sum(1 for t in (p.tasks or []) if t.get("completed", False))
            for p in plans
        )
        
        weekly_completion.append({
            "week": f"Week {4 - week_offset}",
            "tasks_completed": tasks_completed,
            "date_range": f"{week_start.strftime('%b %d')} - {week_end.strftime('%b %d')}",
        })
    
    # Total hours spent
    all_plans = (
        db.query(DailyPlan)
        .filter(DailyPlan.user_id == user.id)
        .all()
    )
    
    total_hours = sum(
        sum((t.get("duration_minutes", 30) or 30) / 60 for t in (p.tasks or []) if t.get("completed", False))
        for p in all_plans
    )
    
    return ProgressOverview(
        overall_completion=overall_completion,
        active_roadmap_progress=active_roadmap_progress,
        weekly_completion=weekly_completion,
        total_hours_spent=int(total_hours),
        skills_improved=[],
    )


def _get_dashboard_stats(user: User, db: Session) -> DashboardStats:
    """Get dashboard statistics."""
    # Weekly progress
    weekly_progress = {
        "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "tasks_completed": [0, 0, 0, 0],
        "hours_spent": [0, 0, 0, 0],
    }
    
    # Skill levels
    skill_levels = {}
    if user.skills and isinstance(user.skills, dict):
        for skill_name, skill_data in user.skills.items():
            if isinstance(skill_data, dict):
                skill_levels[skill_name] = skill_data.get("level", 0)
            else:
                skill_levels[skill_name] = skill_data
    
    # Upcoming milestones
    upcoming_milestones = []
    active_roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == user.id, Roadmap.is_active == True)
        .first()
    )
    
    if active_roadmap:
        if active_roadmap.current_week < active_roadmap.total_weeks:
            upcoming_milestones.append({
                "title": f"Complete Week {active_roadmap.current_week}",
                "type": "weekly_goal",
                "due_in_days": 7,
            })
    
    return DashboardStats(
        weekly_progress=weekly_progress,
        skill_levels=skill_levels,
        streak_days=0,
        upcoming_milestones=upcoming_milestones,
    )


def _calculate_complete_dashboard_stats(user: User, db: Session) -> CompleteDashboardStats:
    """Calculate comprehensive dashboard statistics with all dynamic data."""
    
    # Get all daily plans
    all_plans = (
        db.query(DailyPlan)
        .filter(DailyPlan.user_id == user.id)
        .order_by(DailyPlan.created_at.desc())
        .all()
    )
    
    # Get all interviews
    all_interviews = (
        db.query(Interview)
        .filter(Interview.user_id == user.id)
        .all()
    )
    
    # Calculate total tasks completed
    total_tasks_completed = sum(
        sum(1 for t in (p.tasks or []) if t.get("completed", False))
        for p in all_plans
    )
    
    total_tasks = sum(len(p.tasks or []) for p in all_plans)
    
    # Calculate XP
    total_xp = total_tasks_completed * 10 + len(all_interviews) * 25
    current_level = total_xp // 100 + 1
    xp_in_current_level = total_xp % 100
    xp_for_next_level = 100
    
    # Calculate XP gained today
    today = datetime.now().date()
    today_plans = [p for p in all_plans if p.created_at.date() == today]
    today_tasks_completed = sum(
        sum(1 for t in (p.tasks or []) if t.get("completed", False))
        for p in today_plans
    )
    today_interviews = [i for i in all_interviews if i.created_at.date() == today]
    xp_gained_today = today_tasks_completed * 10 + len(today_interviews) * 25
    
    # Calculate streak
    current_streak = 0
    personal_best_streak = 0
    temp_streak = 0
    last_date = None
    
    for plan in all_plans:
        plan_date = plan.created_at.date()
        
        if last_date is None:
            days_diff = (today - plan_date).days
            if days_diff <= 1:
                current_streak = 1
                temp_streak = 1
                last_date = plan_date
        else:
            days_diff = (last_date - plan_date).days
            if days_diff == 1:
                if last_date == today or (today - last_date).days <= 1:
                    current_streak += 1
                temp_streak += 1
                last_date = plan_date
            elif days_diff == 0:
                continue
            else:
                personal_best_streak = max(personal_best_streak, temp_streak)
                temp_streak = 0
                last_date = None
    
    personal_best_streak = max(personal_best_streak, temp_streak, current_streak)
    
    # Calculate completion rate
    completion_rate = round((total_tasks_completed / max(1, total_tasks)) * 100, 1)
    
    # Calculate interview stats
    total_interviews = len(all_interviews)
    completed_interviews = [i for i in all_interviews if i.score is not None]
    average_interview_score = (
        round(sum(i.score for i in completed_interviews) / len(completed_interviews), 1)
        if completed_interviews else 0.0
    )
    
    # Weekly stats (current week)
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=7)
    
    week_plans = [
        p for p in all_plans
        if week_start <= p.created_at.date() < week_end
    ]
    
    week_tasks_completed = sum(
        sum(1 for t in (p.tasks or []) if t.get("completed", False))
        for p in week_plans
    )
    
    week_hours = sum(
        sum((t.get("duration_minutes", 30) or 30) / 60 for t in (p.tasks or []) if t.get("completed", False))
        for p in week_plans
    )
    
    week_xp = week_tasks_completed * 10 + len([i for i in all_interviews if week_start <= i.created_at.date() < week_end]) * 25
    
    weekly_stats = WeeklyStats(
        problems_solved=week_tasks_completed,
        study_hours=round(week_hours, 1),
        xp_gained=week_xp,
        tasks_completed=week_tasks_completed,
    )
    
    # Performance trend (last 7 days)
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    last_7_days_data = []
    
    for i in range(7):
        date = today - timedelta(days=6 - i)
        day_plans = [p for p in all_plans if p.created_at.date() == date]
        day_tasks_completed = sum(
            sum(1 for t in (p.tasks or []) if t.get("completed", False))
            for p in day_plans
        )
        day_interviews = [i for i in all_interviews if i.created_at.date() == date and i.score is not None]
        
        # Calculate daily score (weighted average of task completion and interview scores)
        task_score = min(100, day_tasks_completed * 20)
        interview_score = (
            sum(i.score * 10 for i in day_interviews) / len(day_interviews)
            if day_interviews else 0
        )
        
        daily_score = int((task_score * 0.6 + interview_score * 0.4) if day_interviews else task_score)
        last_7_days_data.append(daily_score)
    
    # Calculate change from previous week
    prev_week_avg = sum(last_7_days_data[:4]) / 4 if len(last_7_days_data) >= 4 else 0
    curr_week_avg = sum(last_7_days_data[4:]) / 3 if len(last_7_days_data) >= 7 else 0
    change_percentage = round(((curr_week_avg - prev_week_avg) / max(1, prev_week_avg)) * 100, 1) if prev_week_avg > 0 else 0
    
    performance_trend = PerformanceTrend(
        labels=days,
        values=last_7_days_data,
        change_percentage=change_percentage,
    )
    
    # Activity heatmap (last 12 weeks = 84 days)
    activity_heatmap = []
    for i in range(84):
        date = today - timedelta(days=83 - i)
        day_plans = [p for p in all_plans if p.created_at.date() == date]
        day_tasks_completed = sum(
            sum(1 for t in (p.tasks or []) if t.get("completed", False))
            for p in day_plans
        )
        
        # Calculate activity level (0-4)
        count = day_tasks_completed
        level = 0 if count == 0 else (1 if count < 3 else (2 if count < 6 else (3 if count < 10 else 4)))
        
        activity_heatmap.append(ActivityHeatmapData(
            date=date.isoformat(),
            count=count,
            level=level,
        ))
    
    # Achievements
    achievements = [
        Achievement(
            id="fire_starter",
            icon="Flame",
            title="Fire Starter",
            description="5 day streak",
            earned=current_streak >= 5,
            color="bg-amber-500/15 text-amber-500",
            progress=current_streak,
            target=5,
        ),
        Achievement(
            id="code_warrior",
            icon="Code2",
            title="Code Warrior",
            description="50 problems solved",
            earned=total_tasks_completed >= 50,
            color="bg-primary/15 text-primary",
            progress=total_tasks_completed,
            target=50,
        ),
        Achievement(
            id="interview_pro",
            icon="Star",
            title="Interview Pro",
            description="10 interviews completed",
            earned=total_interviews >= 10,
            color="bg-blue-500/15 text-blue-500",
            progress=total_interviews,
            target=10,
        ),
        Achievement(
            id="speed_demon",
            icon="Zap",
            title="Speed Demon",
            description="Complete 3 tasks in 1 day",
            earned=any(
                sum(1 for t in (p.tasks or []) if t.get("completed", False)) >= 3
                for p in all_plans
            ),
            color="bg-purple-500/15 text-purple-500",
        ),
    ]
    
    # Skill levels
    skill_levels = {}
    if user.skills and isinstance(user.skills, dict):
        for skill_name, skill_data in user.skills.items():
            if isinstance(skill_data, dict):
                skill_levels[skill_name] = skill_data.get("level", 0)
            else:
                skill_levels[skill_name] = skill_data
    
    return CompleteDashboardStats(
        total_xp=total_xp,
        xp_gained_today=xp_gained_today,
        current_level=current_level,
        xp_in_current_level=xp_in_current_level,
        xp_for_next_level=xp_for_next_level,
        streak_days=current_streak,
        personal_best_streak=personal_best_streak,
        problems_solved=total_tasks_completed,
        completion_rate=completion_rate,
        total_interviews=total_interviews,
        average_interview_score=average_interview_score,
        weekly_stats=weekly_stats,
        performance_trend=performance_trend,
        activity_heatmap=activity_heatmap,
        achievements=achievements,
        skill_levels=skill_levels,
    )


@router.get("", response_model=DashboardData)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all dashboard data in a single call."""
    # Get user profile
    user_profile = UserProfile.model_validate(current_user)
    
    # Get active roadmap
    active_roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == current_user.id, Roadmap.is_active == True)
        .first()
    )
    
    roadmap_response = None
    if active_roadmap:
        roadmap_response = RoadmapResponse.model_validate(active_roadmap)
    
    # Get today's plan
    today_plan = None
    if active_roadmap:
        today_plan = (
            db.query(DailyPlan)
            .filter(
                DailyPlan.roadmap_id == active_roadmap.id,
                DailyPlan.week == active_roadmap.current_week,
                DailyPlan.day == active_roadmap.current_day,
            )
            .first()
        )
    
    today_plan_response = None
    if today_plan:
        today_plan_response = DailyPlanResponse.model_validate(today_plan)
    
    # Get all components
    progress = _calculate_progress_overview(current_user, db)
    streak = _calculate_streak(current_user, db)
    activities = _get_recent_activities(current_user, db, limit=10)
    recommendations = _get_recommendations(current_user, db)
    stats = _get_dashboard_stats(current_user, db)
    
    return DashboardData(
        user=user_profile,
        active_roadmap=roadmap_response,
        progress=progress,
        today_plan=today_plan_response,
        streak=streak,
        recent_activities=activities,
        recommendations=recommendations,
        stats=stats,
    )


@router.get("/activities", response_model=ActivitiesResponse)
def get_activities(
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recent activities with pagination."""
    all_activities = _get_recent_activities(current_user, db, limit=limit + offset)
    activities = all_activities[offset:offset + limit]
    
    return ActivitiesResponse(
        activities=activities,
        total=len(all_activities),
        has_more=len(all_activities) > offset + limit,
    )


@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized recommendations."""
    recommendations = _get_recommendations(current_user, db)
    
    return RecommendationsResponse(
        recommendations=recommendations,
    )


@router.get("/stats", response_model=CompleteDashboardStats)
def get_complete_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get complete dashboard statistics with all dynamic data."""
    return _calculate_complete_dashboard_stats(current_user, db)
