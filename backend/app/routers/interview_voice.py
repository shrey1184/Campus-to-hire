"""
Voice Interview WebSocket Router.
Handles real-time bidirectional audio streaming for Nova Sonic voice interviews,
plus legacy Polly TTS endpoint.
"""

from __future__ import annotations

import asyncio
import base64
import json
import logging
from typing import Any

import boto3
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_current_user, verify_token
from app.config import settings
from app.database import SessionLocal, get_db
from app.models import Interview, User
from app.routers.interview import _evaluate_interview
from app.services.voice import voice_service

# Try to import voice prompts, fallback to inline defaults if not available
try:
    from app.services.prompts import (
        INTERVIEW_VOICE_SYSTEM_PROMPT,
        get_interview_voice_start_prompt,
    )
except ImportError:
    # Fallback defaults if prompts not yet implemented
    INTERVIEW_VOICE_SYSTEM_PROMPT = """You are an experienced technical interviewer conducting a voice interview for campus placements. Keep responses concise and conversational. Ask one question at a time."""
    
    def get_interview_voice_start_prompt(role: str, company: str | None = None) -> str:
        company_str = f" at {company}" if company else ""
        return f"Begin interview for {role} role{company_str}. Introduce yourself briefly and start with candidate introduction."


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/interview/voice", tags=["interview-voice"])


# ═══════════════════════════════════════════════════════════════════════════════
# LEGACY POLLY TTS ENDPOINT (Backward Compatibility)
# ═══════════════════════════════════════════════════════════════════════════════

_polly_client = boto3.client(
    "polly",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)


class InterviewVoiceSynthesizeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    language_code: str | None = "en"
    voice_id: str | None = None


class InterviewVoiceSynthesizeResponse(BaseModel):
    audio_base64: str
    content_type: str
    voice_id: str


POLLY_VOICES = {
    "en": "Joanna",
    "hi": "Aditi",
    "es": "Mia",
    "fr": "Celine",
    "de": "Marlene",
    "it": "Carla",
    "pt": "Vitoria",
    "ja": "Mizuki",
    "ko": "Seoyeon",
}


@router.post("/synthesize", response_model=InterviewVoiceSynthesizeResponse)
def synthesize_interview_voice(
    body: InterviewVoiceSynthesizeRequest,
    current_user: User = Depends(get_current_user),
) -> InterviewVoiceSynthesizeResponse:
    """
    Convert interview text to speech using Amazon Polly (legacy endpoint).

    This endpoint is intentionally isolated from the main interview flow,
    so voice support can be removed independently.
    """
    language_code = body.language_code or current_user.preferred_language or "en"
    voice_id = body.voice_id or POLLY_VOICES.get(language_code, "Joanna")

    try:
        response = _polly_client.synthesize_speech(
            Text=body.text,
            OutputFormat="mp3",
            VoiceId=voice_id,
            Engine="neural" if voice_id in ["Joanna", "Matthew"] else "standard",
        )
        audio_bytes = response["AudioStream"].read()
        content_type = response["ContentType"]
    except Exception as exc:
        logger.error(f"Polly synthesis failed: {exc}")
        raise HTTPException(status_code=502, detail="Speech synthesis failed") from exc

    return InterviewVoiceSynthesizeResponse(
        audio_base64=base64.b64encode(audio_bytes).decode("utf-8"),
        content_type=content_type,
        voice_id=voice_id,
    )


# ═══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET VOICE INTERVIEW ENDPOINT
# ═══════════════════════════════════════════════════════════════════════════════

MAX_EXCHANGES = 8  # After 8 Q&A exchanges (16 messages), evaluate and end
VOICE_TIME_LIMIT_SECONDS = 5 * 60


def _merge_transcript_fragments(
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Merge consecutive transcript fragments from the same speaker into one turn."""
    merged: list[dict[str, Any]] = []

    for message in messages:
        role = message.get("role")
        content = (message.get("content") or "").strip()
        if not role or not content:
            continue

        if merged and merged[-1]["role"] == role:
            merged[-1]["content"] = f'{merged[-1]["content"]} {content}'
        else:
            merged.append({"role": role, "content": content})

    return merged


def _update_interview_messages(
    db: Session, interview: Interview, new_messages: list[dict[str, Any]]
) -> None:
    """
    Append new transcript messages to the interview and commit to DB.
    Consecutive turns from the same role are merged to avoid transcript fragmentation.
    """
    current_messages = list(interview.messages or [])
    for message in _merge_transcript_fragments(new_messages):
        if current_messages and current_messages[-1].get("role") == message["role"]:
            current_messages[-1]["content"] = (
                f'{current_messages[-1].get("content", "")} {message["content"]}'
            ).strip()
        else:
            current_messages.append(message)

    interview.messages = current_messages
    db.commit()
    db.refresh(interview)


def _count_exchanges(messages: list[dict[str, Any]]) -> int:
    """
    Count the number of completed Q&A exchanges (assistant questions).
    Each assistant message represents one question/exchange.
    """
    return sum(1 for msg in messages if msg.get("role") == "assistant")


@router.websocket("/ws")
async def voice_interview_websocket(websocket: WebSocket) -> None:
    """
    Real-time voice interview via WebSocket.

    Query params:
    - token: JWT authentication token
    - interview_id: UUID of the interview session

    Protocol:
    - Client sends: Binary audio chunks (PCM 16kHz mono) or JSON control messages
    - Server sends: Binary audio responses, JSON transcripts, and evaluation results

    Control messages from client:
    - {"type": "end_turn"} - Signal end of user's speaking turn
    - {"type": "end_interview"} - Request early interview termination

    Server events:
    - Binary frames: Audio response from assistant
    - {"type": "transcript", "role": "user"|"assistant", "content": "..."} - Transcript
    - {"type": "turn_end"} - Assistant finished speaking
    - {"type": "evaluation", "score": X, "feedback": {...}} - Interview complete
    - {"type": "error", "message": "..."} - Error occurred
    """
    await websocket.accept()
    db: Session | None = None
    nova_session = None

    try:
        # ───────────────────────────────────────────────────────────────────────
        # 1. AUTHENTICATION
        # ───────────────────────────────────────────────────────────────────────
        query_params = dict(websocket.query_params)
        token = query_params.get("token")
        interview_id = query_params.get("interview_id")

        if not token:
            await websocket.close(code=4001, reason="Missing token")
            return

        if not interview_id:
            await websocket.close(code=4002, reason="Missing interview_id")
            return

        try:
            payload = verify_token(token)
            user_id = payload.get("sub")
            if not user_id:
                await websocket.close(code=4001, reason="Invalid token payload")
                return
        except HTTPException:
            await websocket.close(code=4001, reason="Invalid token")
            return

        # ───────────────────────────────────────────────────────────────────────
        # 2. FETCH INTERVIEW
        # ───────────────────────────────────────────────────────────────────────
        db = SessionLocal()
        interview = (
            db.query(Interview)
            .filter(Interview.id == interview_id, Interview.user_id == user_id)
            .first()
        )

        if not interview:
            await websocket.close(code=4004, reason="Interview not found")
            return

        if interview.score is not None:
            await websocket.close(code=4003, reason="Interview already completed")
            return

        # ───────────────────────────────────────────────────────────────────────
        # 3. BUILD SYSTEM PROMPT
        # ───────────────────────────────────────────────────────────────────────
        base_prompt = INTERVIEW_VOICE_SYSTEM_PROMPT
        start_prompt = get_interview_voice_start_prompt(
            interview.role, interview.company
        )
        system_prompt = f"{base_prompt}\n\n{start_prompt}"

        # ───────────────────────────────────────────────────────────────────────
        # 4. CREATE NOVA SONIC SESSION
        # ───────────────────────────────────────────────────────────────────────
        try:
            nova_session = await voice_service.create_session(system_prompt)
            await voice_service.start_audio_input(nova_session)
        except Exception as exc:
            logger.error(f"Failed to create Nova Sonic session: {exc}")
            await websocket.send_json(
                {"type": "error", "message": "Failed to initialize voice session"}
            )
            await websocket.close(code=1011, reason="Nova Sonic initialization failed")
            return

        # ───────────────────────────────────────────────────────────────────────
        # 5. RUN BIDIRECTIONAL STREAMING
        # ───────────────────────────────────────────────────────────────────────
        transcript_buffer: list[dict[str, Any]] = []
        client_ended = asyncio.Event()
        nova_ended = asyncio.Event()
        interview_start_time = asyncio.get_running_loop().time()

        async def forward_client_audio() -> None:
            """Receive audio/control messages from client, forward to Nova Sonic."""
            try:
                while not client_ended.is_set():
                    data = await websocket.receive()

                    if data["type"] == "websocket.receive":
                        # Binary audio frame
                        if "bytes" in data:
                            await voice_service.send_audio_chunk(
                                nova_session, data["bytes"]
                            )

                        # Text control message
                        elif "text" in data:
                            try:
                                msg = json.loads(data["text"])
                                if msg.get("type") == "end_turn":
                                    await voice_service.end_audio_input(nova_session)
                                elif msg.get("type") == "end_interview":
                                    logger.info("Client requested interview end")
                                    client_ended.set()
                                    break
                            except json.JSONDecodeError:
                                logger.warning(f"Invalid JSON from client: {data['text']}")

                    elif data["type"] == "websocket.disconnect":
                        logger.info("Client disconnected")
                        client_ended.set()
                        break

            except WebSocketDisconnect:
                logger.info("WebSocket disconnected in client receiver")
                client_ended.set()
            except Exception as exc:
                logger.error(f"Error in client audio forwarding: {exc}")
                client_ended.set()

        async def forward_nova_sonic_responses() -> None:
            """Receive events from Nova Sonic, forward to client."""
            nonlocal transcript_buffer
            try:
                async for event in voice_service.receive_events(nova_session):
                    if client_ended.is_set():
                        break

                    event_type = event.get("type")

                    # Audio chunk - forward to client
                    if event_type == "audio":
                        await websocket.send_bytes(event["data"])

                    # Transcript - buffer and send to client
                    elif event_type == "transcript":
                        transcript_buffer.append(
                            {"role": event["role"], "content": event["content"]}
                        )
                        await websocket.send_json(
                            {
                                "type": "transcript",
                                "role": event["role"],
                                "content": event["content"],
                            }
                        )

                    # Turn end - save transcripts, check if interview should end
                    elif event_type == "turn_end":
                        await websocket.send_json({"type": "turn_end"})

                        # Save accumulated transcripts to DB as complete turns
                        if transcript_buffer:
                            _update_interview_messages(db, interview, transcript_buffer)
                            transcript_buffer = []

                        elapsed_seconds = (
                            asyncio.get_running_loop().time() - interview_start_time
                        )
                        if elapsed_seconds >= VOICE_TIME_LIMIT_SECONDS:
                            logger.info(
                                "Voice interview time limit reached after %.1fs; evaluating",
                                elapsed_seconds,
                            )

                            # Evaluate interview
                            score, feedback = _evaluate_interview(interview)
                            logger.info(
                                "Voice interview evaluation complete: score=%s, message_count=%s, feedback_length=%s",
                                score,
                                len(interview.messages or []),
                                len(feedback or ""),
                            )
                            interview.score = score
                            interview.feedback = feedback
                            db.commit()

                            # Send evaluation to client
                            try:
                                feedback_json = json.loads(feedback) if feedback else {}
                            except (json.JSONDecodeError, TypeError):
                                feedback_json = {"summary": feedback}

                            await websocket.send_json(
                                {
                                    "type": "evaluation",
                                    "score": score,
                                    "feedback": feedback_json,
                                }
                            )
                            nova_ended.set()
                            break

                    # Session end
                    elif event_type == "session_end":
                        logger.info("Nova Sonic session ended")
                        nova_ended.set()
                        break

            except Exception as exc:
                logger.error(f"Error in Nova Sonic forwarding: {exc}")
                await websocket.send_json(
                    {"type": "error", "message": "Voice service error occurred"}
                )
                nova_ended.set()

        # Run both tasks concurrently
        await asyncio.gather(
            forward_client_audio(),
            forward_nova_sonic_responses(),
            return_exceptions=True,
        )

        # ───────────────────────────────────────────────────────────────────────
        # 6. CLEANUP & EVALUATE
        # ───────────────────────────────────────────────────────────────────────
        # Save any remaining transcripts
        if transcript_buffer:
            _update_interview_messages(db, interview, transcript_buffer)

        # Evaluate if not already scored (early end or client disconnect)
        db.refresh(interview)
        if interview.score is None and (interview.messages or []):
            logger.info("Evaluating interview on early end")
            try:
                score, feedback = _evaluate_interview(interview)
                interview.score = score
                interview.feedback = feedback
                db.commit()

                feedback_json = {}
                try:
                    feedback_json = json.loads(feedback) if feedback else {}
                except (json.JSONDecodeError, TypeError):
                    feedback_json = {"summary": feedback}

                await websocket.send_json(
                    {"type": "evaluation", "score": score, "feedback": feedback_json}
                )
            except Exception as exc:
                logger.error(f"Error evaluating interview on cleanup: {exc}")

        # Close Nova Sonic session
        if nova_session:
            try:
                await voice_service.close_session(nova_session)
                nova_session = None
            except Exception as exc:
                logger.error(f"Error closing Nova Sonic session: {exc}")

        # Close WebSocket
        try:
            await websocket.close(code=1000, reason="Interview completed")
        except RuntimeError as exc:
            logger.info(f"WebSocket already closed during normal cleanup: {exc}")

    except Exception as exc:
        if "Unexpected ASGI message 'websocket.close'" in str(exc):
            logger.info(f"WebSocket closed during reload/disconnect: {exc}")
        else:
            logger.error(f"Unexpected error in voice interview WebSocket: {exc}")
        try:
            await websocket.send_json(
                {"type": "error", "message": "An unexpected error occurred"}
            )
            await websocket.close(code=1011, reason="Internal server error")
        except Exception:
            pass  # WebSocket may already be closed

    finally:
        # Ensure DB session is closed
        if db:
            db.close()

        # Ensure Nova Sonic session is closed
        if nova_session:
            try:
                await voice_service.close_session(nova_session)
            except Exception as exc:
                logger.error(f"Error in final Nova Sonic cleanup: {exc}")
