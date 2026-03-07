const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SPEECH_LANG_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  mr: "mr-IN",
};

interface VoiceSynthesizeResponse {
  audio_base64: string;
  content_type: string;
  voice_id: string;
}

interface SpeechRecognitionResultAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: ArrayLike<ArrayLike<SpeechRecognitionResultAlternativeLike>>;
}

interface SpeechRecognitionErrorEventLike {
  readonly error: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export interface VoiceRecorderController {
  stop: () => void;
}

let currentAudio: HTMLAudioElement | null = null;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function resolveSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const maybeWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return maybeWindow.SpeechRecognition ?? maybeWindow.webkitSpeechRecognition ?? null;
}

function languageToSpeechLocale(languageCode: string | null | undefined): string {
  if (!languageCode) return "en-US";
  return SPEECH_LANG_MAP[languageCode.toLowerCase()] ?? "en-US";
}

export function isVoiceInputSupported(): boolean {
  return resolveSpeechRecognitionConstructor() !== null;
}

export function startVoiceInput(
  languageCode: string | null | undefined,
  onTranscript: (text: string) => void,
  onError: (message: string) => void,
  onEnd?: () => void,
): VoiceRecorderController | null {
  const Recognition = resolveSpeechRecognitionConstructor();
  if (!Recognition) {
    onError("Voice input is not supported in this browser.");
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = languageToSpeechLocale(languageCode);
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const first = event.results?.[0]?.[0];
    const transcript = first?.transcript?.trim() ?? "";
    if (transcript) onTranscript(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error || "Voice input failed.");
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.start();

  return {
    stop: () => recognition.stop(),
  };
}

function base64ToBlob(base64Data: string, contentType: string): Blob {
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
}

export function stopVoicePlayback(): void {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

export async function speakInterviewText(
  text: string,
  languageCode: string | null | undefined,
): Promise<void> {
  const token = getToken();
  if (!token) return;

  const res = await fetch(`${BASE_URL}/api/interview/voice/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
      language_code: languageCode ?? "en",
    }),
  });

  if (!res.ok) {
    return;
  }

  const data = (await res.json()) as VoiceSynthesizeResponse;
  const blob = base64ToBlob(data.audio_base64, data.content_type || "audio/mp3");
  const objectUrl = URL.createObjectURL(blob);

  stopVoicePlayback();

  const audio = new Audio(objectUrl);
  currentAudio = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      if (currentAudio === audio) currentAudio = null;
      reject(new Error("Audio playback failed"));
    };
    void audio.play().catch((err) => {
      URL.revokeObjectURL(objectUrl);
      if (currentAudio === audio) currentAudio = null;
      reject(err);
    });
  });
}
