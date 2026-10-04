import { useState, useCallback } from "react";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import { useAiEntityContext } from "./AiEntityContext";
import AiChatWindow from "./AiChatWindow";
import AiVoicePanel from "./AiVoicePanel";
import RagSearchPanel from "./RagSearchPanel";
import CrossEntityAnalyticsPanel from "./CrossEntityAnalyticsPanel";

/**
 * 🎓 Floating Action Button group that toggles four AI panels:
 *
 *   1. Chat (Bobby)        — persistent chat sessions with AI
 *   2. Voice               — speech-to-text interaction
 *   3. RAG Search          — question→vector-search→AI-generated answer
 *   4. Cross-Entity Analytics — AI-powered strategic analysis across all data
 *
 * Mount once at the app root (e.g. inside your layout component).
 *
 * Entity context is read automatically from AiEntityContext —
 * individual screens call useSetAiEntity() to publish what entity
 * they're looking at, and this FAB picks it up without any props.
 *
 * 🎓 Only ONE panel can be open at a time. Opening any panel
 * automatically closes the others (mutual exclusion).
 *
 * 🎓 PHASE 2 ADDITION:
 * The 4th FAB button (Analytics) was added for Cross-Entity Analytics
 * (Phase 2, Feature 1). It uses a copper/amber border to visually
 * distinguish it from RAG (teal), Voice (blue), and Chat (main copper FAB).
 */
export default function AiChatFab() {
  const { entityType, entityKey } = useAiEntityContext();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRagOpen, setIsRagOpen] = useState(false);
  // 🎓 NEW: State for the Cross-Entity Analytics panel (Phase 2, Feature 1)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // ── Toggle handlers (mutual exclusion) ──────────────────

  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    // 🎓 Close ALL other panels when opening chat
    if (!isChatOpen) {
      setIsVoiceOpen(false);
      setIsRagOpen(false);
      setIsAnalyticsOpen(false);
    }
  }, [isChatOpen]);

  const handleToggleVoice = useCallback(() => {
    setIsVoiceOpen((prev) => !prev);
    // 🎓 Close ALL other panels when opening voice
    if (!isVoiceOpen) {
      setIsChatOpen(false);
      setIsRagOpen(false);
      setIsAnalyticsOpen(false);
    }
  }, [isVoiceOpen]);

  const handleToggleRag = useCallback(() => {
    setIsRagOpen((prev) => !prev);
    // 🎓 Close ALL other panels when opening RAG search
    if (!isRagOpen) {
      setIsChatOpen(false);
      setIsVoiceOpen(false);
      setIsAnalyticsOpen(false);
    }
  }, [isRagOpen]);

  // 🎓 NEW: Toggle handler for Cross-Entity Analytics panel.
  // Follows the exact same mutual exclusion pattern as the other 3 panels.
  const handleToggleAnalytics = useCallback(() => {
    setIsAnalyticsOpen((prev) => !prev);
    // 🎓 Close ALL other panels when opening analytics
    if (!isAnalyticsOpen) {
      setIsChatOpen(false);
      setIsVoiceOpen(false);
      setIsRagOpen(false);
    }
  }, [isAnalyticsOpen]);

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

  // 🎓 NEW: Close handler for Analytics panel — called when the user
  // clicks the X button inside CrossEntityAnalyticsPanel's header.
  const handleCloseAnalytics = useCallback(() => {
    setIsAnalyticsOpen(false);
  }, []);

  /**
   * 🎓 isAnyOpen controls whether we show the individual FABs
   * or a single "Close" button. When any panel is open, we swap
   * the FAB group to just a close button.
   *
   * 🎓 UPDATED: Now includes isAnalyticsOpen in the check.
   */
  const isAnyOpen = isChatOpen || isVoiceOpen || isRagOpen || isAnalyticsOpen;

  /**
   * 🎓 Main FAB click handler — when a panel is open, clicking
   * the main FAB closes whichever one is active. When nothing
   * is open, it opens Chat (the primary action).
   *
   * 🎓 UPDATED: Now handles the analytics panel state too.
   */
  const handleMainFabClick = useCallback(() => {
    if (isChatOpen) {
      handleToggleChat();
    } else if (isVoiceOpen) {
      handleToggleVoice();
    } else if (isRagOpen) {
      handleToggleRag();
    } else if (isAnalyticsOpen) {
      handleToggleAnalytics();
    } else {
      handleToggleChat();
    }
  }, [
    isChatOpen,
    isVoiceOpen,
    isRagOpen,
    isAnalyticsOpen,
    handleToggleChat,
    handleToggleVoice,
    handleToggleRag,
    handleToggleAnalytics,
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

      {/* 🎓 RAG search panel — the third AI mode */}
      <RagSearchPanel
        isOpen={isRagOpen}
        onClose={handleCloseRag}
        entityType={entityType}
        entityKey={entityKey}
      />

      {/* 🎓 NEW: Cross-Entity Analytics panel — Phase 2, Feature 1.
          Unlike Chat/Voice/RAG which are entity-contextual, Analytics
          operates across ALL entities, so no entityType/entityKey props. */}
      <CrossEntityAnalyticsPanel
        isOpen={isAnalyticsOpen}
        onClose={handleCloseAnalytics}
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
          Layout (left to right): [Analytics] [RAG Search] [Voice] [Main Chat FAB]

          🎓 UPDATED: Added Analytics FAB as the leftmost secondary button.
          Order rationale: Analytics is the newest and most "strategic" action,
          so it sits furthest from the main FAB. RAG and Voice remain in their
          established positions closer to the main button.
        */}
        {!isAnyOpen && (
          <>
            {/* 🎓 NEW: Analytics FAB — sits furthest left.
                Uses a copper/amber border to visually match the analytics panel's
                copper accent theme. The icon is AnalyticsOutlined — a chart icon
                that immediately communicates "analytics/reporting". */}
            <Tooltip
              title="Cross-Entity Analytics"
              placement="top"
              slotProps={{ popper: { sx: { zIndex: 10001 } } }}
            >
              <Box
                onClick={handleToggleAnalytics}
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
                  border: "1px solid rgba(201, 128, 61, 0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  "&:hover": {
                    transform: "scale(1.08)",
                    borderColor: "rgba(201, 128, 61, 0.5)",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.4), 0 0 12px rgba(201, 128, 61, 0.2)",
                  },
                }}
              >
                <AnalyticsOutlinedIcon
                  sx={{
                    fontSize: 20,
                    color: "rgba(201, 128, 61, 0.9)",
                  }}
                />
              </Box>
            </Tooltip>

            {/* RAG Search FAB — sits second from left */}
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
