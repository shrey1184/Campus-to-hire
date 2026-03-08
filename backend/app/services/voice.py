from __future__ import annotations

from botocore.exceptions import BotoCoreError, ClientError
import boto3

from app.config import settings


LANGUAGE_TO_POLLY_VOICE: dict[str, str] = {
    "en": "Joanna",
    "hi": "Kajal",
    "ta": "Kajal",  # Polly has limited native voices for Indic languages.
    "te": "Kajal",
    "bn": "Kajal",
    "mr": "Kajal",
}


class VoiceService:
    def __init__(self) -> None:
        self.polly = boto3.client(
            "polly",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        )

    def synthesize(
        self,
        text: str,
        language_code: str = "en",
        voice_id: str | None = None,
        output_format: str = "mp3",
    ) -> tuple[bytes, str, str]:
        clean_text = (text or "").strip()
        if not clean_text:
            raise ValueError("Text is required")

        # Keep payload small for fast interactive playback.
        if len(clean_text) > 2500:
            clean_text = clean_text[:2500]

        code = (language_code or "en").lower()
        selected_voice = voice_id or LANGUAGE_TO_POLLY_VOICE.get(code, "Joanna")

        try:
            response = self.polly.synthesize_speech(
                Text=clean_text,
                OutputFormat=output_format,
                VoiceId=selected_voice,
                Engine="neural",
                TextType="text",
            )
            stream = response.get("AudioStream")
            if stream is None:
                raise ValueError("Audio stream not returned by Polly")
            audio_bytes = stream.read()
            return audio_bytes, f"audio/{output_format}", selected_voice
        except (BotoCoreError, ClientError) as exc:
            raise RuntimeError(f"Polly synthesis failed: {exc}") from exc


voice_service = VoiceService()
