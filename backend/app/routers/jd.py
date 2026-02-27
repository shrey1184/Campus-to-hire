from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import User
from app.schemas import JDAnalyzeRequest, JDAnalyzeResponse
from app.services.bedrock import bedrock_service
from app.services.prompts import JD_SYSTEM_PROMPT, get_jd_analysis_prompt

router = APIRouter(prefix="/api/jd", tags=["jd"])


def _normalize_skill_item(item: object) -> dict:
    if isinstance(item, dict):
        name = str(item.get("name") or item.get("skill") or "Unknown Skill").strip()
        level = item.get("level", "intermediate")
        normalized = {"name": name or "Unknown Skill", "level": level}
        if item.get("importance"):
            normalized["importance"] = str(item.get("importance"))
        return normalized

    if isinstance(item, str):
        return {"name": item.strip() or "Unknown Skill", "level": "intermediate"}

    return {"name": "Unknown Skill", "level": "intermediate"}


def _normalize_gap_item(item: object) -> dict:
    if isinstance(item, dict):
        return {
            "skill": str(item.get("skill") or item.get("name") or "Unknown Skill"),
            "current_level": item.get("current_level", "beginner"),
            "required_level": item.get("required_level", "intermediate"),
            "gap": str(item.get("gap") or "Needs improvement"),
            "priority": str(item.get("priority") or "medium"),
        }

    return {
        "skill": "Unknown Skill",
        "current_level": "beginner",
        "required_level": "intermediate",
        "gap": "Needs improvement",
        "priority": "medium",
    }


@router.post("/analyze", response_model=JDAnalyzeResponse)
def analyze_jd(
    body: JDAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JDAnalyzeResponse:
    """Analyze a job description and return a skill gap report against the user's current skills."""
    user_skills = current_user.skills or {}

    raw = bedrock_service.invoke_model(
        JD_SYSTEM_PROMPT,
        get_jd_analysis_prompt(body.job_description, user_skills),
        fallback_type="jd_analysis",
    )
    data = bedrock_service.parse_json_response_safe(
        raw,
        fallback={
            "role": "Unknown",
            "company": None,
            "required_skills": [],
            "gap_analysis": [],
            "recommendations": ["Please try again later for a detailed analysis."],
            "fallback": True,
        },
    )

    # Normalise user_skills to a list of dicts regardless of the stored format.
    if isinstance(user_skills, dict):
        skills_list: list[dict] = [
            {"name": name, **attrs} if isinstance(attrs, dict) else {"name": name, "level": attrs}
            for name, attrs in user_skills.items()
        ]
    elif isinstance(user_skills, list):
        skills_list = user_skills
    else:
        skills_list = []

    required_skills = data.get("required_skills")
    gap_analysis = data.get("gap_analysis")
    recommendations = data.get("recommendations")

    normalized_data = {
        "role": str(data.get("role") or "Unknown"),
        "company": data.get("company"),
        "required_skills": [
            _normalize_skill_item(item)
            for item in (required_skills if isinstance(required_skills, list) else [])
        ],
        "user_skills": skills_list,
        "gap_analysis": [
            _normalize_gap_item(item)
            for item in (gap_analysis if isinstance(gap_analysis, list) else [])
        ],
        "recommendations": [
            str(item)
            for item in (recommendations if isinstance(recommendations, list) else [])
            if str(item).strip()
        ],
    }

    if not normalized_data["recommendations"]:
        normalized_data["recommendations"] = [
            "Update your profile skills and try again for more specific recommendations.",
        ]

    return JDAnalyzeResponse(**normalized_data)
