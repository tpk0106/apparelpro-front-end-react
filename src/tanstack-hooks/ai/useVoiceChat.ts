import { useState, useRef, useCallback, useEffect } from "react";
import { useAiChatSend } from "./useAiChat";
import type { AiChatSendMessageRequest } from "../../services/ai/ai.service";

// ─── Markdown → spoken text ─────────────────────────────
// Strips markdown formatting so TTS reads natural sentences
// instead of "asterisk asterisk Fabric asterisk asterisk".

function stripMarkdownForSpeech(text: string): string {
  return (
    text
      // Remove bold/italic markers: **text** or *text* or __text__ or _text_
      .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
      .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
      // Remove heading markers: ### Heading
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bullet points: - item or * item or • item
      .replace(/^\s*[-*•]\s+/gm, "")
      // Convert numbered lists "1. item" → "item" (the AI should use words instead)
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove inline code backticks
      .replace(/`([^`]+)`/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Collapse multiple blank lines into one
      .replace(/\n{3,}/g, "\n\n")
      // Trim
      .trim()
  );
}

// ─── Types ───────────────────────────────────────────────

export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "unsupported";

export interface VoiceTranscript {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UseVoiceChatOptions {
  entityType?: string;
  entityKey?: string;
  /** TTS voice name — defaults to first available English voice */
  voiceName?: string;
  /** TTS speech rate (0.5–2.0, default 1.0) */
  speechRate?: number;
  /** TTS pitch (0–2, default 1.0) */
  pitch?: number;
  /** Speech recognition language (default "en-US") */
  language?: string;
}

export interface UseVoiceChatReturn {
  voiceState: VoiceState;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcripts: VoiceTranscript[];
  interimTranscript: string;
  currentSessionId: string | null;
  audioLevel: number;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
  clearTranscripts: () => void;
  toggleListening: () => void;
}

// ─── Browser API type guards ─────────────────────────────

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  const w = window as Record<string, unknown>;
  return (
    (w.SpeechRecognition as new () => SpeechRecognition) ??
    (w.webkitSpeechRecognition as new () => SpeechRecognition) ??
    null
  );
}

function getSpeechSynthesis(): SpeechSynthesis | null {
  return window.speechSynthesis ?? null;
}

// ─── Hook ────────────────────────────────────────────────

export function useVoiceChat(
  options: UseVoiceChatOptions = {},
): UseVoiceChatReturn {
  const {
    entityType,
    entityKey,
    voiceName,
    speechRate = 1.0,
    pitch = 1.0,
    language = "en-US",
  } = options;

  // ── State ───────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const isManualStopRef = useRef(false);

  // ── Chat mutation ───────────────────────────────────
  const chatMutation = useAiChatSend();

  // ── Check browser support on mount ──────────────────
  useEffect(() => {
    if (!getSpeechRecognition()) {
      setVoiceState("unsupported");
      setErrorMessage(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
    }
    synthRef.current = getSpeechSynthesis();
  }, []);

  // ── Audio level analyser ────────────────────────────
  const startAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        // Average volume level normalised to 0–1
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length / 255;
        setAudioLevel(avg);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // Mic access denied — continue without visualisation
      setAudioLevel(0);
    }
  }, []);

  const stopAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // ── TTS: speak the AI response ──────────────────────
  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const synth = synthRef.current;
        if (!synth) {
          resolve();
          return;
        }

        // Cancel any ongoing speech
        synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;
        utterance.pitch = pitch;
        utterance.lang = language;

        // Pick a voice
        const voices = synth.getVoices();
        if (voiceName) {
          const match = voices.find((v) =>
            v.name.toLowerCase().includes(voiceName.toLowerCase()),
          );
          if (match) utterance.voice = match;
        } else {
          // Default: pick first English voice, prefer Google/Microsoft
          const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
          const preferred = englishVoices.find(
            (v) =>
              v.name.includes("Google") ||
              v.name.includes("Microsoft") ||
              v.name.includes("Samantha"),
          );
          utterance.voice = preferred ?? englishVoices[0] ?? voices[0] ?? null;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          if (e.error === "canceled") {
            resolve(); // User stopped
          } else {
            reject(new Error(e.error));
          }
        };

        synth.speak(utterance);
      });
    },
    [speechRate, pitch, language, voiceName],
  );

  // ── Process recognised speech ───────────────────────
  const processVoiceInput = useCallback(
    async (spokenText: string) => {
      if (!spokenText.trim()) {
        setVoiceState("idle");
        return;
      }

      // Add user transcript
      const userTranscript: VoiceTranscript = {
        id: `voice-user-${Date.now()}`,
        role: "user",
        content: spokenText,
        timestamp: new Date(),
      };
      setTranscripts((prev) => [...prev, userTranscript]);
      setInterimTranscript("");

      // ── Send to AI ──────────────────────────────────
      setVoiceState("processing");

      const request: AiChatSendMessageRequest = {
        message: spokenText,
        preferredProvider: "OpenAI",
        ...(currentSessionId
          ? { sessionId: currentSessionId }
          : {
              entityType: entityType || "Voice",
              entityKey: entityKey || "voice-conversation",
            }),
      };

      try {
        const response = await chatMutation.mutateAsync(request);

        // Track session
        if (!currentSessionId) {
          setCurrentSessionId(response.sessionId);
        }

        // Add AI transcript
        const aiTranscript: VoiceTranscript = {
          id: `voice-ai-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          timestamp: new Date(),
        };
        setTranscripts((prev) => [...prev, aiTranscript]);

        // ── Speak the response ──────────────────────
        // Strip any residual markdown so TTS reads natural speech
        const spokenText = stripMarkdownForSpeech(response.reply);
        setVoiceState("speaking");
        await speak(spokenText);

        setVoiceState("idle");
        setErrorMessage(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to get AI response";
        setErrorMessage(message);
        setVoiceState("error");

        // Auto-recover to idle after 3s
        setTimeout(() => {
          setVoiceState("idle");
          setErrorMessage(null);
        }, 3000);
      }
    },
    [currentSessionId, entityType, entityKey, chatMutation, speak],
  );

  // ── Start listening ─────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    // Stop any existing recognition
    if (recognitionRef.current) {
      isManualStopRef.current = true;
      recognitionRef.current.abort();
    }

    // Cancel any ongoing TTS
    synthRef.current?.cancel();

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false; // Single utterance mode
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceState("listening");
      setInterimTranscript("");
      setErrorMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (final) {
        setInterimTranscript("");
        processVoiceInput(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        // User cancelled or no speech detected
        setVoiceState("idle");
        setInterimTranscript("");
        return;
      }

      const messages: Record<string, string> = {
        "not-allowed":
          "Microphone access denied. Please allow microphone access in your browser settings.",
        "network":
          "Network error during speech recognition. Check your connection.",
        "audio-capture":
          "No microphone found. Please connect a microphone.",
      };

      setErrorMessage(messages[event.error] ?? `Speech recognition error: ${event.error}`);
      setVoiceState("error");

      setTimeout(() => {
        setVoiceState("idle");
        setErrorMessage(null);
      }, 4000);
    };

    recognition.onend = () => {
      if (isManualStopRef.current) {
        isManualStopRef.current = false;
        return;
      }
      // If recognition ended without producing a final result, reset
      if (voiceState === "listening") {
        setVoiceState("idle");
        setInterimTranscript("");
      }
    };

    recognitionRef.current = recognition;
    isManualStopRef.current = false;
    recognition.start();
    startAudioAnalyser();
  }, [language, processVoiceInput, startAudioAnalyser, voiceState]);

  // ── Stop listening ──────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isManualStopRef.current = true;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopAudioAnalyser();
    if (voiceState === "listening") {
      setVoiceState("idle");
      setInterimTranscript("");
    }
  }, [stopAudioAnalyser, voiceState]);

  // ── Stop speaking ───────────────────────────────────
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setVoiceState("idle");
  }, []);

  // ── Toggle ──────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (voiceState === "listening") {
      stopListening();
    } else if (voiceState === "speaking") {
      stopSpeaking();
    } else if (voiceState === "idle" || voiceState === "error") {
      startListening();
    }
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  // ── Clear transcripts ───────────────────────────────
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
    setCurrentSessionId(null);
    setInterimTranscript("");
    setErrorMessage(null);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      synthRef.current?.cancel();
      stopAudioAnalyser();
    };
  }, [stopAudioAnalyser]);

  return {
    voiceState,
    isListening: voiceState === "listening",
    isProcessing: voiceState === "processing",
    isSpeaking: voiceState === "speaking",
    transcripts,
    interimTranscript,
    currentSessionId,
    audioLevel,
    errorMessage,
    startListening,
    stopListening,
    stopSpeaking,
    clearTranscripts,
    toggleListening,
  };
}
