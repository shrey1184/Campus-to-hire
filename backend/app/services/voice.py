"""
Nova Sonic Voice Service for real-time speech-to-speech interviews.

Uses the aws_sdk_bedrock_runtime Smithy SDK for bidirectional streaming,
following the official AWS Nova Sonic sample pattern.
"""

import asyncio
import base64
import json
import logging
import os
import uuid
from typing import AsyncGenerator, Any

import boto3
from aws_sdk_bedrock_runtime.client import (
    BedrockRuntimeClient,
    InvokeModelWithBidirectionalStreamOperationInput,
)
from aws_sdk_bedrock_runtime.config import Config
from aws_sdk_bedrock_runtime.models import (
    BidirectionalInputPayloadPart,
    InvokeModelWithBidirectionalStreamInputChunk,
)
from smithy_aws_core.identity.environment import EnvironmentCredentialsResolver

from app.config import settings

logger = logging.getLogger(__name__)


class NovaSonicSession:
    """Represents an active Nova Sonic bidirectional streaming session."""

    def __init__(self, stream, prompt_name: str, content_name: str, audio_content_name: str) -> None:
        self.stream = stream
        self.prompt_name = prompt_name
        self.content_name = content_name
        self.audio_content_name = audio_content_name
        self._active = True
        self.role: str | None = None
        self.display_assistant_text = False

    @property
    def is_active(self) -> bool:
        return self._active

    def mark_closed(self) -> None:
        self._active = False


class VoiceService:
    """Service for Nova Sonic real-time speech-to-speech conversations."""

    MODEL_ID = "amazon.nova-sonic-v1:0"

    INPUT_SAMPLE_RATE = 16000
    OUTPUT_SAMPLE_RATE = 24000

    def __init__(self) -> None:
        # Expose credentials via env vars for EnvironmentCredentialsResolver
        os.environ.setdefault("AWS_ACCESS_KEY_ID", settings.AWS_ACCESS_KEY_ID)
        os.environ.setdefault("AWS_SECRET_ACCESS_KEY", settings.AWS_SECRET_ACCESS_KEY)
        os.environ.setdefault("AWS_DEFAULT_REGION", settings.AWS_REGION)

        self._config = Config(
            endpoint_uri=f"https://bedrock-runtime.{settings.AWS_REGION}.amazonaws.com",
            region=settings.AWS_REGION,
            aws_credentials_identity_resolver=EnvironmentCredentialsResolver(),
        )
        self._client = BedrockRuntimeClient(self._config)
        logger.info(f"VoiceService initialized (Smithy SDK) – model: {self.MODEL_ID}")

    # ── helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    async def _send_event(session: NovaSonicSession, event: dict) -> None:
        """Send a JSON event dict to the Nova Sonic input stream."""
        chunk = InvokeModelWithBidirectionalStreamInputChunk(
            value=BidirectionalInputPayloadPart(
                bytes_=json.dumps(event).encode("utf-8")
            )
        )
        await session.stream.input_stream.send(chunk)

    # ── public API ────────────────────────────────────────────────────────────

    async def create_session(self, system_prompt: str) -> NovaSonicSession:
        prompt_name = str(uuid.uuid4())
        content_name = str(uuid.uuid4())
        audio_content_name = str(uuid.uuid4())

        try:
            logger.info("Creating Nova Sonic bidirectional stream")
            stream = await self._client.invoke_model_with_bidirectional_stream(
                InvokeModelWithBidirectionalStreamOperationInput(model_id=self.MODEL_ID)
            )
            session = NovaSonicSession(stream, prompt_name, content_name, audio_content_name)

            # 1. sessionStart
            await self._send_event(session, {
                "event": {
                    "sessionStart": {
                        "inferenceConfiguration": {
                            "maxTokens": 1024,
                            "topP": 0.9,
                            "temperature": 0.7,
                        }
                    }
                }
            })

            # 2. promptStart
            await self._send_event(session, {
                "event": {
                    "promptStart": {
                        "promptName": prompt_name,
                        "textOutputConfiguration": {"mediaType": "text/plain"},
                        "audioOutputConfiguration": {
                            "mediaType": "audio/lpcm",
                            "sampleRateHertz": self.OUTPUT_SAMPLE_RATE,
                            "sampleSizeBits": 16,
                            "channelCount": 1,
                            "voiceId": "matthew",
                            "encoding": "base64",
                            "audioType": "SPEECH",
                        },
                    }
                }
            })

            # 3. system prompt – contentStart → textInput → contentEnd
            await self._send_event(session, {
                "event": {
                    "contentStart": {
                        "promptName": prompt_name,
                        "contentName": content_name,
                        "type": "TEXT",
                        "interactive": False,
                        "role": "SYSTEM",
                        "textInputConfiguration": {"mediaType": "text/plain"},
                    }
                }
            })
            await self._send_event(session, {
                "event": {
                    "textInput": {
                        "promptName": prompt_name,
                        "contentName": content_name,
                        "content": system_prompt,
                    }
                }
            })
            await self._send_event(session, {
                "event": {
                    "contentEnd": {
                        "promptName": prompt_name,
                        "contentName": content_name,
                    }
                }
            })

            logger.info("Nova Sonic session ready")
            return session

        except Exception as exc:
            logger.error(f"Failed to create Nova Sonic session: {exc}")
            raise RuntimeError(str(exc)) from exc

    async def send_initial_text(self, session: NovaSonicSession, text: str) -> None:
        """Send an initial user text message to kick off the assistant's first response."""
        text_content_name = str(uuid.uuid4())
        await self._send_event(session, {
            "event": {
                "contentStart": {
                    "promptName": session.prompt_name,
                    "contentName": text_content_name,
                    "type": "TEXT",
                    "interactive": True,
                    "role": "USER",
                    "textInputConfiguration": {"mediaType": "text/plain"},
                }
            }
        })
        await self._send_event(session, {
            "event": {
                "textInput": {
                    "promptName": session.prompt_name,
                    "contentName": text_content_name,
                    "content": text,
                }
            }
        })
        await self._send_event(session, {
            "event": {
                "contentEnd": {
                    "promptName": session.prompt_name,
                    "contentName": text_content_name,
                }
            }
        })
        logger.info("Sent initial text to trigger assistant response")

    async def start_audio_input(self, session: NovaSonicSession) -> None:
        """Send contentStart for user audio – call once before streaming audio chunks."""
        await self._send_event(session, {
            "event": {
                "contentStart": {
                    "promptName": session.prompt_name,
                    "contentName": session.audio_content_name,
                    "type": "AUDIO",
                    "interactive": True,
                    "role": "USER",
                    "audioInputConfiguration": {
                        "mediaType": "audio/lpcm",
                        "sampleRateHertz": self.INPUT_SAMPLE_RATE,
                        "sampleSizeBits": 16,
                        "channelCount": 1,
                        "audioType": "SPEECH",
                        "encoding": "base64",
                    },
                }
            }
        })
        logger.info("Audio input started")

    async def send_audio_chunk(self, session: NovaSonicSession, audio_bytes: bytes) -> None:
        if not session.is_active:
            return
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        await self._send_event(session, {
            "event": {
                "audioInput": {
                    "promptName": session.prompt_name,
                    "contentName": session.audio_content_name,
                    "content": audio_b64,
                }
            }
        })

    async def end_audio_input(self, session: NovaSonicSession) -> None:
        """Signal end of the current user audio content block."""
        await self._send_event(session, {
            "event": {
                "contentEnd": {
                    "promptName": session.prompt_name,
                    "contentName": session.audio_content_name,
                }
            }
        })
        logger.info("Audio input ended (contentEnd)")

    async def receive_events(self, session: NovaSonicSession) -> AsyncGenerator[dict[str, Any], None]:
        """Yield parsed events from the Nova Sonic output stream."""
        if not session.is_active:
            raise RuntimeError("Session inactive")

        try:
            while session.is_active:
                output = await session.stream.await_output()
                result = await output[1].receive()

                if not (result.value and result.value.bytes_):
                    continue

                data = json.loads(result.value.bytes_.decode("utf-8"))
                if "event" not in data:
                    continue

                evt = data["event"]

                # Track current role from contentStart
                if "contentStart" in evt:
                    cs = evt["contentStart"]
                    session.role = cs.get("role")
                    session.display_assistant_text = False
                    if "additionalModelFields" in cs:
                        extra = json.loads(cs["additionalModelFields"])
                        if extra.get("generationStage") == "SPECULATIVE":
                            session.display_assistant_text = True
                    continue

                if "textOutput" in evt:
                    text = evt["textOutput"].get("content", "")
                    if session.role == "ASSISTANT" and session.display_assistant_text:
                        yield {"type": "transcript", "role": "assistant", "content": text}
                    elif session.role == "USER":
                        yield {"type": "transcript", "role": "user", "content": text}
                    continue

                if "audioOutput" in evt:
                    raw = evt["audioOutput"].get("content", "")
                    if raw:
                        yield {"type": "audio", "data": base64.b64decode(raw)}
                    continue

                if "contentEnd" in evt:
                    # Only signal turn_end for assistant content blocks
                    if session.role == "ASSISTANT":
                        yield {"type": "turn_end"}
                    continue

                if "sessionEnd" in evt:
                    session.mark_closed()
                    yield {"type": "session_end"}
                    break

        except Exception as exc:
            logger.error(f"Error receiving events: {exc}")
            session.mark_closed()
            raise RuntimeError(str(exc)) from exc

    async def close_session(self, session: NovaSonicSession) -> None:
        if not session.is_active:
            return
        try:
            await self._send_event(session, {
                "event": {
                    "promptEnd": {"promptName": session.prompt_name}
                }
            })
            await self._send_event(session, {"event": {"sessionEnd": {}}})
            await session.stream.input_stream.close()
            session.mark_closed()
            logger.info("Nova Sonic session closed")
        except Exception as exc:
            logger.error(f"Error closing session: {exc}")
            session.mark_closed()

    def health_check(self) -> dict[str, Any]:
        try:
            bedrock_client = boto3.client(
                "bedrock",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            bedrock_client.list_foundation_models(
                byProvider="Amazon", byOutputModality="SPEECH"
            )
            return {
                "status": "healthy",
                "model_id": self.MODEL_ID,
                "region": settings.AWS_REGION,
                "service": "nova-sonic",
            }
        except Exception as exc:
            logger.error(f"Health check failed: {exc}")
            return {
                "status": "unhealthy",
                "model_id": self.MODEL_ID,
                "region": settings.AWS_REGION,
                "error": str(exc),
            }


voice_service = VoiceService()
