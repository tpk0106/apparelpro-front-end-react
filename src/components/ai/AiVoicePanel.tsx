import { useCallback, useRef, useEffect, useMemo } from "react";
import { Box, IconButton, Typography, Tooltip, Fade } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import StopIcon from "@mui/icons-material/Stop";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
// import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ErrorOutlineIcon from "@mui/icons-material/WarningAmber";
import {
  useVoiceChat,
  type VoiceState,
  type VoiceTranscript,
} from "../../tanstack-hooks/ai/useVoiceChat";

// ─── Theme tokens (matching AiChatWindow) ────────────────

const VOICE_COLORS = {
  canvas: "#0A0E14",
  surface: "#141922",
  input: "#0D1117",
  text: "#F4F6F8",
  muted: "#8B93A1",
  copper: "#C9803D",
  copperLight: "rgba(201, 128, 61, 0.15)",
  copperGlow: "rgba(201, 128, 61, 0.3)",
  border: "rgba(255, 255, 255, 0.06)",
  borderHover: "rgba(255, 255, 255, 0.12)",
  userBubble: "rgba(201, 128, 61, 0.12)",
  aiBubble: "rgba(96, 165, 250, 0.08)",
  listening: "#60a5fa",
  listeningGlow: "rgba(96, 165, 250, 0.3)",
  processing: "#C9803D",
  processingGlow: "rgba(201, 128, 61, 0.4)",
  speaking: "#34d399",
  speakingGlow: "rgba(52, 211, 153, 0.3)",
  error: "#f87171",
  errorGlow: "rgba(248, 113, 113, 0.3)",
  scrollTrack: "rgba(255, 255, 255, 0.02)",
  scrollThumb: "rgba(201, 128, 61, 0.3)",
} as const;

const SCROLLBAR_SX = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { backgroundColor: VOICE_COLORS.scrollTrack },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: VOICE_COLORS.scrollThumb,
    borderRadius: 3,
  },
} as const;

// ─── Props ───────────────────────────────────────────────

interface AiVoicePanelProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: string;
  entityKey?: string;
}

// ─── State label & colour map ────────────────────────────

function getStateConfig(state: VoiceState): {
  label: string;
  color: string;
  glow: string;
} {
  switch (state) {
    case "listening":
      return {
        label: "Listening...",
        color: VOICE_COLORS.listening,
        glow: VOICE_COLORS.listeningGlow,
      };
    case "processing":
      return {
        label: "Thinking...",
        color: VOICE_COLORS.processing,
        glow: VOICE_COLORS.processingGlow,
      };
    case "speaking":
      return {
        label: "Speaking...",
        color: VOICE_COLORS.speaking,
        glow: VOICE_COLORS.speakingGlow,
      };
    case "error":
      return {
        label: "Error",
        color: VOICE_COLORS.error,
        glow: VOICE_COLORS.errorGlow,
      };
    case "unsupported":
      return {
        label: "Not Supported",
        color: VOICE_COLORS.error,
        glow: VOICE_COLORS.errorGlow,
      };
    default:
      return {
        label: "Ready",
        color: VOICE_COLORS.copper,
        glow: VOICE_COLORS.copperGlow,
      };
  }
}

// ─── Waveform visualiser ─────────────────────────────────

function WaveformVisualiser({
  audioLevel,
  voiceState,
}: {
  audioLevel: number;
  voiceState: VoiceState;
}) {
  const barCount = 24;
  const config = getStateConfig(voiceState);
  const isActive =
    voiceState === "listening" ||
    voiceState === "speaking" ||
    voiceState === "processing";

  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      // Create a wave pattern based on position and audio level
      const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
      const baseHeight = isActive ? 0.15 : 0.08;
      const waveAmplitude = isActive
        ? audioLevel * (1 - centerDistance * 0.6)
        : 0;
      const height = Math.max(baseHeight, waveAmplitude);
      return Math.min(1, height);
    });
  }, [audioLevel, isActive]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        height: 60,
        px: 2,
      }}
    >
      {bars.map((height, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            borderRadius: 1.5,
            backgroundColor: config.color,
            height: `${Math.max(4, height * 48)}px`,
            transition: "height 0.08s ease-out",
            opacity: isActive ? 0.6 + height * 0.4 : 0.3,
          }}
        />
      ))}
    </Box>
  );
}

// ─── Transcript bubble ───────────────────────────────────

function TranscriptBubble({ transcript }: { transcript: VoiceTranscript }) {
  const isUser = transcript.role === "user";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
        flexDirection: isUser ? "row-reverse" : "row",
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isUser
            ? VOICE_COLORS.copperLight
            : VOICE_COLORS.aiBubble,
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 16, color: VOICE_COLORS.copper }} />
        ) : (
          <SmartToyIcon sx={{ fontSize: 16, color: VOICE_COLORS.listening }} />
        )}
      </Box>

      <Box
        sx={{
          maxWidth: "85%",
          px: 1.5,
          py: 1,
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          backgroundColor: isUser
            ? VOICE_COLORS.userBubble
            : VOICE_COLORS.aiBubble,
          border: `1px solid ${VOICE_COLORS.border}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: VOICE_COLORS.text,
            fontSize: "0.82rem",
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {transcript.content}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main component ──────────────────────────────────────

export default function AiVoicePanel({
  isOpen,
  onClose,
  entityType,
  entityKey,
}: AiVoicePanelProps) {
  const {
    voiceState,
    isListening,
    isSpeaking,
    transcripts,
    interimTranscript,
    audioLevel,
    errorMessage,
    toggleListening,
    stopSpeaking,
    clearTranscripts,
  } = useVoiceChat({ entityType, entityKey });

  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest transcript
  useEffect(() => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts.length]);

  const stateConfig = getStateConfig(voiceState);

  const handleClose = useCallback(() => {
    if (isSpeaking) stopSpeaking();
    onClose();
  }, [isSpeaking, stopSpeaking, onClose]);

  const handleMicClick = useCallback(() => {
    if (voiceState === "unsupported") return;
    toggleListening();
  }, [voiceState, toggleListening]);

  if (!isOpen) return null;

  return (
    <Fade in={isOpen}>
      <Box
        sx={{
          position: "fixed",
          bottom: 90,
          right: 24,
          width: 380,
          height: 520,
          backgroundColor: VOICE_COLORS.canvas,
          borderRadius: 3,
          border: `1px solid ${VOICE_COLORS.border}`,
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Title bar ────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.25,
            borderBottom: `1px solid ${VOICE_COLORS.border}`,
            backgroundColor: VOICE_COLORS.surface,
            userSelect: "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VolumeUpIcon sx={{ fontSize: 18, color: stateConfig.color }} />
            <Typography
              variant="subtitle2"
              sx={{
                color: VOICE_COLORS.text,
                fontWeight: 600,
                fontSize: "0.82rem",
                letterSpacing: "0.02em",
              }}
            >
              Voice Assistant
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 0.25 }}>
            <Tooltip
              title="Clear conversation"
              slotProps={{ popper: { sx: { zIndex: 10000 } } }}
            >
              <IconButton
                size="small"
                onClick={clearTranscripts}
                disabled={transcripts.length === 0}
                sx={{
                  color: VOICE_COLORS.muted,
                  "&:hover": { color: VOICE_COLORS.text },
                }}
              >
                <DeleteSweepIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip
              title="Close voice panel"
              slotProps={{ popper: { sx: { zIndex: 10000 } } }}
            >
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                  color: VOICE_COLORS.muted,
                  "&:hover": { color: VOICE_COLORS.text },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Transcript area ──────────────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2,
            py: 1.5,
            ...SCROLLBAR_SX,
          }}
        >
          {transcripts.length === 0 && voiceState !== "listening" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1.5,
                opacity: 0.5,
              }}
            >
              <MicIcon sx={{ fontSize: 40, color: VOICE_COLORS.muted }} />
              <Typography
                variant="body2"
                sx={{
                  color: VOICE_COLORS.muted,
                  textAlign: "center",
                  fontSize: "0.82rem",
                  lineHeight: 1.6,
                }}
              >
                Tap the microphone to start
                <br />a voice conversation
              </Typography>
              {entityType && entityKey && (
                <Typography
                  variant="caption"
                  sx={{
                    color: VOICE_COLORS.muted,
                    opacity: 0.7,
                    mt: 0.5,
                    fontSize: "0.72rem",
                  }}
                >
                  Context: {entityType} / {entityKey}
                </Typography>
              )}
            </Box>
          )}

          {transcripts.map((t) => (
            <TranscriptBubble key={t.id} transcript={t} />
          ))}

          {/* Interim transcript (live speech) */}
          {interimTranscript && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  maxWidth: "85%",
                  px: 1.5,
                  py: 1,
                  borderRadius: "12px 12px 2px 12px",
                  backgroundColor: VOICE_COLORS.copperLight,
                  border: `1px dashed ${VOICE_COLORS.copper}`,
                  opacity: 0.7,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: VOICE_COLORS.text,
                    fontSize: "0.82rem",
                    fontStyle: "italic",
                  }}
                >
                  {interimTranscript}
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={transcriptsEndRef} />
        </Box>

        {/* ── Error display ────────────────────────── */}
        {errorMessage && (
          <Box
            sx={{
              mx: 2,
              mb: 1,
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 16, color: VOICE_COLORS.error }}
            />
            <Typography
              variant="caption"
              sx={{ color: VOICE_COLORS.error, fontSize: "0.72rem" }}
            >
              {errorMessage}
            </Typography>
          </Box>
        )}

        {/* ── Waveform + mic button area ───────────── */}
        <Box
          sx={{
            borderTop: `1px solid ${VOICE_COLORS.border}`,
            backgroundColor: VOICE_COLORS.surface,
            px: 2,
            py: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Waveform */}
          <WaveformVisualiser audioLevel={audioLevel} voiceState={voiceState} />

          {/* State label */}
          <Typography
            variant="caption"
            sx={{
              color: stateConfig.color,
              fontSize: "0.72rem",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {stateConfig.label}
          </Typography>

          {/* Mic button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {isSpeaking && (
              <Tooltip
                title="Stop speaking"
                slotProps={{ popper: { sx: { zIndex: 10000 } } }}
              >
                <IconButton
                  onClick={stopSpeaking}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: "rgba(248, 113, 113, 0.15)",
                    color: VOICE_COLORS.error,
                    border: `1px solid rgba(248, 113, 113, 0.3)`,
                    "&:hover": {
                      backgroundColor: "rgba(248, 113, 113, 0.25)",
                    },
                  }}
                >
                  <StopIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip
              title={
                voiceState === "unsupported"
                  ? "Speech not supported in this browser"
                  : isListening
                    ? "Stop listening"
                    : voiceState === "processing"
                      ? "Processing..."
                      : "Start listening"
              }
              slotProps={{ popper: { sx: { zIndex: 10000 } } }}
            >
              <Box
                onClick={handleMicClick}
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    voiceState === "unsupported" || voiceState === "processing"
                      ? "not-allowed"
                      : "pointer",
                  backgroundColor: isListening
                    ? VOICE_COLORS.listening
                    : VOICE_COLORS.surface,
                  border: `2px solid ${stateConfig.color}`,
                  boxShadow: isListening
                    ? `0 0 20px ${VOICE_COLORS.listeningGlow}, 0 0 40px ${VOICE_COLORS.listeningGlow}`
                    : `0 4px 12px rgba(0,0,0,0.3)`,
                  transition: "all 0.25s ease",
                  opacity:
                    voiceState === "processing" || voiceState === "unsupported"
                      ? 0.5
                      : 1,
                  // Pulse animation when listening
                  ...(isListening && {
                    animation: "voicePulse 1.5s ease-in-out infinite",
                    "@keyframes voicePulse": {
                      "0%, 100%": {
                        boxShadow: `0 0 20px ${VOICE_COLORS.listeningGlow}, 0 0 40px ${VOICE_COLORS.listeningGlow}`,
                        transform: "scale(1)",
                      },
                      "50%": {
                        boxShadow: `0 0 30px ${VOICE_COLORS.listeningGlow}, 0 0 60px ${VOICE_COLORS.listeningGlow}`,
                        transform: "scale(1.05)",
                      },
                    },
                  }),
                  // Processing spin
                  ...(voiceState === "processing" && {
                    animation: "voiceProcessing 2s linear infinite",
                    "@keyframes voiceProcessing": {
                      "0%": {
                        borderColor: VOICE_COLORS.processing,
                      },
                      "50%": {
                        borderColor: VOICE_COLORS.copperGlow,
                      },
                      "100%": {
                        borderColor: VOICE_COLORS.processing,
                      },
                    },
                  }),
                  "&:hover": {
                    transform:
                      voiceState === "processing" ||
                      voiceState === "unsupported"
                        ? "none"
                        : "scale(1.05)",
                  },
                }}
              >
                {isListening ? (
                  <MicIcon sx={{ fontSize: 30, color: "#fff" }} />
                ) : voiceState === "unsupported" ? (
                  <MicOffIcon
                    sx={{ fontSize: 30, color: VOICE_COLORS.error }}
                  />
                ) : (
                  <MicIcon sx={{ fontSize: 30, color: stateConfig.color }} />
                )}
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
}
