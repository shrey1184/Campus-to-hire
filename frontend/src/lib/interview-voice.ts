/**
 * Interview voice utilities.
 *
 * Two modes:
 * 1. Nova Sonic WebSocket — real-time bidirectional audio streaming (primary)
 * 2. Legacy Polly TTS + browser SpeechRecognition (fallback)
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = BASE_URL.replace(/^http/, "ws");

// ── Types ────────────────────────────────────────────────────────────────────

export interface VoiceRecorderController {
  stop: () => void;
}

export interface NovaVoiceSession {
  /** Send raw PCM audio bytes to Nova Sonic */
  sendAudio: (data: ArrayBuffer) => void;
  /** Signal end of user's speech turn */
  endTurn: () => void;
  /** End the interview entirely */
  endInterview: () => void;
  /** Close the session */
  close: () => void;
  /** Whether the WebSocket is connected */
  readonly connected: boolean;
}

export interface NovaVoiceCallbacks {
  /** Called when AI audio chunk arrives (PCM 24kHz 16-bit mono) */
  onAudio: (pcmData: ArrayBuffer) => void;
  /** Called when a transcript (user or assistant) arrives */
  onTranscript: (role: "user" | "assistant", content: string) => void;
  /** Called when an AI turn is complete */
  onTurnEnd: () => void;
  /** Called when evaluation arrives (interview complete) */
  onEvaluation: (data: { score: number; feedback: string }) => void;
  /** Called on error */
  onError: (message: string) => void;
  /** Called when connection closes */
  onClose: () => void;
}

// ── Nova Sonic WebSocket Session ─────────────────────────────────────────────

export function connectNovaVoice(
  interviewId: string,
  token: string,
  callbacks: NovaVoiceCallbacks,
): NovaVoiceSession {
  const url = `${WS_BASE}/api/interview/voice/ws?token=${encodeURIComponent(token)}&interview_id=${encodeURIComponent(interviewId)}`;
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  let isConnected = false;

  ws.onopen = () => {
    isConnected = true;
  };

  ws.onmessage = (event: MessageEvent) => {
    if (event.data instanceof ArrayBuffer) {
      // Binary frame = audio from Nova Sonic
      callbacks.onAudio(event.data);
    } else if (typeof event.data === "string") {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "transcript":
            callbacks.onTranscript(msg.role, msg.content);
            break;
          case "turn_end":
            callbacks.onTurnEnd();
            break;
          case "evaluation":
            callbacks.onEvaluation(msg);
            break;
          case "error":
            callbacks.onError(msg.message || "Voice session error");
            break;
          default:
            break;
        }
      } catch {
        // Ignore non-JSON text frames
      }
    }
  };

  ws.onerror = () => {
    callbacks.onError("WebSocket connection error");
  };

  ws.onclose = () => {
    isConnected = false;
    callbacks.onClose();
  };

  return {
    sendAudio(data: ArrayBuffer) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    },
    endTurn() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "end_turn" }));
      }
    },
    endInterview() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "end_interview" }));
      }
    },
    close() {
      isConnected = false;
      ws.close();
    },
    get connected() {
      return isConnected && ws.readyState === WebSocket.OPEN;
    },
  };
}

// ── Audio Capture (PCM 16kHz 16-bit mono via AudioWorklet) ──────────────────

export interface AudioCaptureController {
  stop: () => void;
}

export async function startAudioCapture(
  onChunk: (pcmData: ArrayBuffer) => void,
  onError: (msg: string) => void,
): Promise<AudioCaptureController | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const audioCtx = new AudioContext({ sampleRate: 16000 });
    const source = audioCtx.createMediaStreamSource(stream);

    // Use ScriptProcessorNode (deprecated but widely supported)
    // AudioWorklet would be better but requires a separate file
    const processor = audioCtx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e: AudioProcessingEvent) => {
      const float32 = e.inputBuffer.getChannelData(0);
      // Convert float32 [-1, 1] to int16 PCM
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      onChunk(int16.buffer);
    };

    source.connect(processor);
    // Connect through a silent gain node to keep ScriptProcessor active
    // WITHOUT playing mic audio through speakers (causes terrible echo)
    const silentGain = audioCtx.createGain();
    silentGain.gain.value = 0;
    processor.connect(silentGain);
    silentGain.connect(audioCtx.destination);

    return {
      stop() {
        processor.disconnect();
        source.disconnect();
        void audioCtx.close();
        stream.getTracks().forEach((t) => t.stop());
      },
    };
  } catch (err) {
    onError(err instanceof Error ? err.message : "Microphone access denied");
    return null;
  }
}

// ── Audio Playback (PCM 24kHz 16-bit mono) ──────────────────────────────────

export class AudioPlayer {
  private ctx: AudioContext;
  private nextStartTime = 0;
  private playing = false;

  constructor() {
    this.ctx = new AudioContext({ sampleRate: 24000 });
  }

  /** Enqueue a PCM chunk for gapless playback */
  enqueue(pcmData: ArrayBuffer): void {
    const int16 = new Int16Array(pcmData);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
    }
    const buffer = this.ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    // Schedule playback at the exact end of the previous chunk (no gaps)
    const now = this.ctx.currentTime;
    const startAt = Math.max(now, this.nextStartTime);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;
    this.playing = true;
  }

  /** Stop all playback and clear scheduled audio */
  stop(): void {
    this.playing = false;
    this.nextStartTime = 0;
    // Close and recreate context to cancel all scheduled sources
    void this.ctx.close().catch(() => {});
    this.ctx = new AudioContext({ sampleRate: 24000 });
  }

  /** Whether audio is currently playing */
  get isPlaying(): boolean {
    return this.playing && this.ctx.currentTime < this.nextStartTime;
  }

  destroy(): void {
    this.playing = false;
    void this.ctx.close().catch(() => {});
  }
}

// ── Legacy Polly + Browser Speech API (backward compat) ─────────────────────

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

  if (!res.ok) return;

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
