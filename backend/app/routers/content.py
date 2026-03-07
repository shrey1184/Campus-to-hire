import copy

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Resource, Roadmap, User
from app.schemas import (
    ExplainRequest,
    ExplainResponse,
    ResourceItem,
    ResourceOut,
    ResourcesResponse,
    TranslateRoadmapRequest,
    TranslateRoadmapResponse,
)
from app.services.bedrock import bedrock_service
from app.services.translate import translate_service

router = APIRouter(prefix="/api/content", tags=["content"])
resources_router = APIRouter(prefix="/api/resources", tags=["resources"])


EXPLAIN_SYSTEM_PROMPT = """You are an expert computer science educator specializing in explaining technical concepts to Indian college students preparing for campus placements.

Your explanations should be:
- Clear and concise
- Appropriate for the student's level
- Include practical examples relevant to placements
- Focus on what interviewers typically ask

Respond in a structured format with clear sections."""


def _get_explain_prompt(concept: str, context: str | None, difficulty_level: str) -> str:
    context_str = f"\nContext: {context}" if context else ""

    return f"""Explain the concept: "{concept}"{context_str}

Target audience: Indian college student preparing for campus placements
Difficulty level: {difficulty_level}

Please provide:
1. A clear, simple definition (2-3 sentences)
2. 2-3 practical examples with code snippets where applicable
3. 4-5 key points to remember
4. 3-4 related topics they should learn next
5. Common interview questions on this topic (if applicable)

Format your response as structured text with clear headings."""


def _normalize_resource_text(value: str | None) -> str:
    return (value or "").strip().lower().replace("&", "and")


def _build_resource_query(
    db: Session,
    topic: str | None = None,
    difficulty: str | None = None,
    resource_type: str | None = None,
    platform: str | None = None,
):
    query = db.query(Resource)

    if topic:
        normalized = _normalize_resource_text(topic)
        topic_terms = [term for term in normalized.replace("/", " ").split() if len(term) > 1]
        conditions = [
            func.lower(Resource.topic).like(f"%{normalized}%"),
            func.lower(func.coalesce(Resource.sub_topic, "")).like(f"%{normalized}%"),
            func.lower(Resource.title).like(f"%{normalized}%"),
        ]
        for term in topic_terms:
            conditions.extend(
                [
                    func.lower(Resource.topic).like(f"%{term}%"),
                    func.lower(func.coalesce(Resource.sub_topic, "")).like(f"%{term}%"),
                    func.lower(Resource.title).like(f"%{term}%"),
                ]
            )
        query = query.filter(or_(*conditions))

    if difficulty:
        query = query.filter(func.lower(Resource.difficulty) == difficulty.lower())

    if resource_type:
        query = query.filter(func.lower(Resource.resource_type) == resource_type.lower())

    if platform:
        query = query.filter(func.lower(Resource.platform) == platform.lower())

    return query


def _resource_to_item(resource: Resource) -> ResourceItem:
    estimated = (
        f"{resource.estimated_minutes} minutes"
        if resource.estimated_minutes
        else None
    )
    return ResourceItem(
        title=resource.title,
        type=resource.resource_type,
        url=resource.url,
        description=f"{resource.topic} • {resource.platform}",
        difficulty=resource.difficulty,
        estimated_time=estimated,
    )


@router.post("/explain", response_model=ExplainResponse)
def explain_concept(
    body: ExplainRequest,
    current_user: User = Depends(get_current_user),
):
    """Get an AI-generated explanation of a technical concept."""
    try:
        raw_response = bedrock_service.invoke_model(
            EXPLAIN_SYSTEM_PROMPT,
            _get_explain_prompt(body.concept, body.context, body.difficulty_level or "beginner"),
            max_tokens=2048,
        )

        lines = raw_response.split("\n")

        explanation = ""
        examples = []
        key_points = []
        related_topics = []

        current_section = None
        current_content = []

        for line in lines:
            line_lower = line.lower().strip()

            if any(keyword in line_lower for keyword in ["definition", "what is", "introduction"]):
                if current_section and current_content:
                    if current_section == "examples":
                        examples = current_content
                    elif current_section == "key points":
                        key_points = current_content
                    elif current_section == "related topics":
                        related_topics = current_content
                current_section = "explanation"
                current_content = []
            elif any(keyword in line_lower for keyword in ["example", "code"]):
                if current_section and current_content and current_section == "explanation":
                    explanation = "\n".join(current_content)
                current_section = "examples"
                current_content = []
            elif any(keyword in line_lower for keyword in ["key point", "remember", "important"]):
                if current_section and current_content and current_section == "examples":
                    examples = current_content
                current_section = "key_points"
                current_content = []
            elif any(keyword in line_lower for keyword in ["related topic", "learn next", "next topic"]):
                if current_section and current_content and current_section == "key_points":
                    key_points = current_content
                current_section = "related_topics"
                current_content = []
            elif line.strip():
                current_content.append(line.strip())

        if current_section == "explanation":
            explanation = "\n".join(current_content)
        elif current_section == "examples":
            examples = current_content
        elif current_section == "key_points":
            key_points = current_content
        elif current_section == "related_topics":
            related_topics = current_content

        if not explanation:
            explanation = raw_response[:500]
        if not examples:
            examples = ["See the detailed explanation above."]
        if not key_points:
            key_points = ["Practice this concept with coding problems."]
        if not related_topics:
            related_topics = ["Data Structures", "Algorithms"]

        return ExplainResponse(
            explanation=explanation,
            examples=examples[:3],
            key_points=key_points[:5],
            related_topics=related_topics[:4],
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {exc}",
        ) from exc


@router.get("/resources", response_model=ResourcesResponse)
def get_resources(
    topic: str,
    skill_level: str = "intermediate",
    resource_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Compatibility endpoint for topic-based resources used by older clients."""
    difficulty = None
    if skill_level == "beginner":
        difficulty = "easy"
    elif skill_level == "advanced":
        difficulty = "hard"

    resources = (
        _build_resource_query(
            db,
            topic=topic,
            difficulty=difficulty,
            resource_type=resource_type,
        )
        .order_by(Resource.topic.asc(), Resource.title.asc())
        .limit(10)
        .all()
    )

    return ResourcesResponse(
        topic=topic,
        resources=[_resource_to_item(resource) for resource in resources],
    )


@resources_router.get("", response_model=list[ResourceOut])
def list_resources(
    topic: str | None = None,
    difficulty: str | None = None,
    resource_type: str | None = None,
    platform: str | None = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resources = (
        _build_resource_query(
            db,
            topic=topic,
            difficulty=difficulty,
            resource_type=resource_type,
            platform=platform,
        )
        .order_by(Resource.topic.asc(), Resource.title.asc())
        .limit(max(1, min(limit, 50)))
        .all()
    )
    return resources


@resources_router.get("/topics")
def list_resource_topics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Resource.topic, func.count(Resource.id))
        .group_by(Resource.topic)
        .order_by(func.count(Resource.id).desc(), Resource.topic.asc())
        .all()
    )
    return [{"topic": topic, "count": count} for topic, count in rows]


@resources_router.get("/random", response_model=list[ResourceOut])
def random_resources(
    topic: str | None = None,
    difficulty: str | None = None,
    resource_type: str | None = None,
    count: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resources = (
        _build_resource_query(
            db,
            topic=topic,
            difficulty=difficulty,
            resource_type=resource_type,
        )
        .order_by(func.random())
        .limit(max(1, min(count, 20)))
        .all()
    )
    return resources


@router.post("/translate-roadmap", response_model=TranslateRoadmapResponse)
def translate_roadmap(
    body: TranslateRoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Translate roadmap content to a target language."""
    roadmap = (
        db.query(Roadmap)
        .filter(Roadmap.id == body.roadmap_id, Roadmap.user_id == current_user.id)
        .first()
    )

    if roadmap is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    if not roadmap.content:
        raise HTTPException(status_code=400, detail="Roadmap has no content to translate")

    try:
        def translate_text_field(text: str) -> str:
            if not text or not isinstance(text, str):
                return text
            try:
                result = translate_service.translate_text(text, body.target_language)
                return result.get("translated_text", text)
            except Exception:
                return text

        def translate_resource_item(resource: object):
            if isinstance(resource, str):
                return translate_text_field(resource)

            if not isinstance(resource, dict):
                return resource

            translated_resource = dict(resource)
            if translated_resource.get("title"):
                translated_resource["title"] = translate_text_field(translated_resource["title"])
            if translated_resource.get("description"):
                translated_resource["description"] = translate_text_field(translated_resource["description"])
            return translated_resource

        translated_content = copy.deepcopy(roadmap.content)

        if "title" in translated_content:
            translated_content["title"] = translate_text_field(translated_content["title"])

        if "weeks" in translated_content:
            for week in translated_content["weeks"]:
                if "title" in week:
                    week["title"] = translate_text_field(week["title"])
                if "description" in week:
                    week["description"] = translate_text_field(week["description"])
                if "theme" in week:
                    week["theme"] = translate_text_field(week["theme"])
                if "objectives" in week:
                    week["objectives"] = [
                        translate_text_field(obj) for obj in week["objectives"]
                    ]

                if "days" in week:
                    for day in week["days"]:
                        if "title" in day:
                            day["title"] = translate_text_field(day["title"])
                        if "focus_area" in day:
                            day["focus_area"] = translate_text_field(day["focus_area"])

                        if "tasks" in day:
                            for task in day["tasks"]:
                                if "title" in task:
                                    task["title"] = translate_text_field(task["title"])
                                if "description" in task:
                                    task["description"] = translate_text_field(task["description"])
                                if "resources" in task:
                                    task["resources"] = [
                                        translate_resource_item(res) for res in task["resources"]
                                    ]

        return TranslateRoadmapResponse(
            roadmap_id=roadmap.id,
            translated_content=translated_content,
            target_language=body.target_language,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to translate roadmap: {exc}",
        ) from exc
