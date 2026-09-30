import { useState, useCallback } from "react";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import { useAiEntityContext } from "./AiEntityContext";
import AiChatWindow from "./AiChatWindow";
import AiVoicePanel from "./AiVoicePanel";
import RagSearchPanel from "./RagSearchPanel";

/**
 * 🎓 Floating Action Button group that toggles three AI panels:
 *
 *   1. Chat (Bobby)    — persistent chat sessions with AI
 *   2. Voice           — speech-to-text interaction
 *   3. RAG Search      — question→vector-search→AI-generated answer
 *
 * Mount once at the app root (e.g. inside your layout component).
 *
 * Entity context is read automatically from AiEntityContext —
 * individual screens call useSetAiEntity() to publish what entity
 * they're looking at, and this FAB picks it up without any props.
 *
 * 🎓 Only ONE panel can be open at a time. Opening any panel
 * automatically closes the others (mutual exclusion).
 */
export default function AiChatFab() {
  const { entityType, entityKey } = useAiEntityContext();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRagOpen, setIsRagOpen] = useState(false);

  // ── Toggle handlers (mutual exclusion) ──────────────────

  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    // 🎓 Close other panels when opening chat
    if (!isChatOpen) {
      setIsVoiceOpen(false);
      setIsRagOpen(false);
    }
  }, [isChatOpen]);

  const handleToggleVoice = useCallback(() => {
    setIsVoiceOpen((prev) => !prev);
    // 🎓 Close other panels when opening voice
    if (!isVoiceOpen) {
      setIsChatOpen(false);
      setIsRagOpen(false);
    }
  }, [isVoiceOpen]);

  const handleToggleRag = useCallback(() => {
    setIsRagOpen((prev) => !prev);
    // 🎓 Close other panels when opening RAG search
    if (!isRagOpen) {
      setIsChatOpen(false);
      setIsVoiceOpen(false);
    }
  }, [isRagOpen]);

  // ── Close handlers (called by panel's own close button) ──

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleCloseVoice = useCallback(() => {
    setIsVoiceOpen(false);
  }, []);

  const handleCloseRag = useCallback(() => {
    setIsRagOpen(false);
  }, []);

  /**
   * 🎓 isAnyOpen controls whether we show the individual FABs
   * or a single "Close" button. When any panel is open, we swap
   * the FAB group to just a close button.
   */
  const isAnyOpen = isChatOpen || isVoiceOpen || isRagOpen;

  /**
   * 🎓 Main FAB click handler — when a panel is open, clicking
   * the main FAB closes whichever one is active. When nothing
   * is open, it opens Chat (the primary action).
   */
  const handleMainFabClick = useCallback(() => {
    if (isChatOpen) {
      handleToggleChat();
    } else if (isVoiceOpen) {
      handleToggleVoice();
    } else if (isRagOpen) {
      handleToggleRag();
    } else {
      handleToggleChat();
    }
  }, [
    isChatOpen,
    isVoiceOpen,
    isRagOpen,
    handleToggleChat,
    handleToggleVoice,
    handleToggleRag,
  ]);

  return (
    <>
      {/* Chat window */}
      <AiChatWindow
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        entityType={entityType}
        entityKey={entityKey}
      />

      {/* Voice panel */}
      <AiVoicePanel
        isOpen={isVoiceOpen}
        onClose={handleCloseVoice}
        entityType={entityType}
        entityKey={entityKey}
      />

      {/* 🎓 RAG search panel — the new third AI mode */}
      <RagSearchPanel
        isOpen={isRagOpen}
        onClose={handleCloseRag}
        entityType={entityType}
        entityKey={entityKey}
      />

      {/* ── FAB group ─────────────────────────────── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/*
          🎓 Secondary FABs — only visible when ALL panels are closed.
          Layout (left to right): [RAG Search] [Voice] [Main Chat FAB]
        */}
        {!isAnyOpen && (
          <>
            {/* RAG Search FAB — sits furthest left */}
            <Tooltip
              title="Search Data (RAG)"
              placement="top"
              slotProps={{ popper: { sx: { zIndex: 10001 } } }}
            >
              <Box
                onClick={handleToggleRag}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  backgroundColor: "#141922",
                  border: "1px solid rgba(45, 212, 191, 0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  "&:hover": {
                    transform: "scale(1.08)",
                    borderColor: "rgba(45, 212, 191, 0.5)",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.4), 0 0 12px rgba(45, 212, 191, 0.2)",
                  },
                }}
              >
                <SearchIcon
                  sx={{
                    fontSize: 20,
                    color: "rgba(45, 212, 191, 0.9)",
                  }}
                />
              </Box>
            </Tooltip>

            {/* Voice FAB — sits between RAG and main Chat FAB */}
            <Tooltip
              title="Voice Assistant"
              placement="top"
              slotProps={{ popper: { sx: { zIndex: 10001 } } }}
            >
              <Box
                onClick={handleToggleVoice}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  backgroundColor: "#141922",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  "&:hover": {
                    transform: "scale(1.08)",
                    borderColor: "rgba(96, 165, 250, 0.5)",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.4), 0 0 12px rgba(96, 165, 250, 0.2)",
                  },
                }}
              >
                <MicIcon
                  sx={{
                    fontSize: 20,
                    color: "#60a5fa",
                  }}
                />
              </Box>
            </Tooltip>
          </>
        )}

        {/* Main FAB — Chat (when closed) or Close (when any panel open) */}
        <Tooltip
          title={isAnyOpen ? "Close" : "Chat with Bobby"}
          placement="top"
          slotProps={{ popper: { sx: { zIndex: 10001 } } }}
        >
          <Box
            onClick={handleMainFabClick}
            sx={{
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
              ...copperGlossButtonSx,
              borderRadius: "50%",
              "&:hover": {
                ...copperGlossButtonSx["&:hover"],
                transform: "scale(1.08)",
              },
              // Subtle pulse animation when all panels are closed
              ...(!isAnyOpen && {
                animation: "chatFabPulse 3s ease-in-out infinite",
                "@keyframes chatFabPulse": {
                  "0%, 100%": {
                    boxShadow:
                      "0 6px 14px rgba(0,0,0,0.55), 0 1px 0 rgba(243,233,214,0.2) inset",
                  },
                  "50%": {
                    boxShadow:
                      "0 6px 14px rgba(0,0,0,0.55), 0 1px 0 rgba(243,233,214,0.2) inset, 0 0 16px rgba(201, 128, 61, 0.35)",
                  },
                },
              }),
            }}
          >
            {isAnyOpen ? (
              <CloseIcon
                sx={{
                  fontSize: 24,
                  color: "#F3E9D6",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            ) : (
              <SmartToyIcon
                sx={{
                  fontSize: 24,
                  color: "#F3E9D6",
                  position: "relative",
                  zIndex: 1,
                }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>
    </>
  );
}
