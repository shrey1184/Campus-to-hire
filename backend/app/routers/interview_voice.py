from __future__ import annotations

import base64

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.models import User
from app.services.voice import voice_service


router = APIRouter(prefix="/api/interview/voice", tags=["interview-voice"])


class InterviewVoiceSynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    language_code: str | None = "en"
    voice_id: str | None = None


class InterviewVoiceSynthesizeResponse(BaseModel):
    audio_base64: str
    content_type: str
    voice_id: str


@router.post("/synthesize", response_model=InterviewVoiceSynthesizeResponse)
def synthesize_interview_voice(
    body: InterviewVoiceSynthesizeRequest,
    current_user: User = Depends(get_current_user),
) -> InterviewVoiceSynthesizeResponse:
    """
    Convert interview text to speech using Amazon Polly.

    This endpoint is intentionally isolated from the main interview flow,
    so voice support can be removed independently.
    """
    language_code = body.language_code or current_user.preferred_language or "en"

    try:
        audio_bytes, content_type, selected_voice = voice_service.synthesize(
            text=body.text,
            language_code=language_code,
            voice_id=body.voice_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return InterviewVoiceSynthesizeResponse(
        audio_base64=base64.b64encode(audio_bytes).decode("utf-8"),
        content_type=content_type,
        voice_id=selected_voice,
    )
