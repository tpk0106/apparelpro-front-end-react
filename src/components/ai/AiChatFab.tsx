import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MicIcon from "@mui/icons-material/Mic";
import SearchIcon from "@mui/icons-material/Search";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
// 🎓 Phase 5: AutoAwesome sparkle icon for the Predictions FAB.
// This "magic wand / sparkle" icon immediately communicates "AI predictions /
// forward-looking intelligence", visually distinct from the chart icon used
// for backward-looking analytics.
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import { useAiEntityContext } from "./AiEntityContext";
import AiChatWindow from "./AiChatWindow";
import AiVoicePanel from "./AiVoicePanel";
import RagSearchPanel from "./RagSearchPanel";
import CrossEntityAnalyticsPanel from "./CrossEntityAnalyticsPanel";

/**
 * 🎓 Floating Action Button group that toggles four AI panels
 * and navigates to the Predictions Dashboard:
 *
 *   1. Chat (Bobby)           — persistent chat sessions with AI
 *   2. Voice                  — speech-to-text interaction
 *   3. RAG Search             — question→vector-search→AI-generated answer
 *   4. Cross-Entity Analytics — AI-powered strategic analysis across all data
 *   5. Predictions (navigate) — navigates to /ai-predictions full-page dashboard
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
 * 🎓 PHASE 5 ADDITION:
 * The 5th FAB button (Predictions) does NOT open a floating panel.
 * Instead it navigates to the /ai-predictions route which renders
 * PredictionsDashboard as a full-page component. This is because
 * predictions need more screen real estate (slider, category cards,
 * large result area) than a floating panel can comfortably provide.
 * The FAB uses a purple/violet accent to distinguish it from the
 * other AI modes (copper analytics, teal RAG, blue voice).
 */
export default function AiChatFab() {
  const { entityType, entityKey } = useAiEntityContext();
  // 🎓 Phase 5: useNavigate hook for programmatic navigation to /ai-predictions.
  // Unlike the other 4 FABs which toggle floating panels, Predictions navigates
  // to a full-page route because the dashboard needs significant screen space.
  const navigate = useNavigate();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isRagOpen, setIsRagOpen] = useState(false);
  // 🎓 State for the Cross-Entity Analytics panel (Phase 2, Feature 1)
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

  // 🎓 Toggle handler for Cross-Entity Analytics panel.
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

  // 🎓 Phase 5: Navigation handler for Predictions Dashboard.
  // Unlike the other handlers which toggle floating panels, this one:
  //   1. Closes ALL open panels (so they don't overlap the full-page dashboard)
  //   2. Navigates to /ai-predictions route via React Router
  // This is a navigation action, NOT a toggle — clicking again when already
  // on the predictions page will still navigate (React Router handles the no-op).
  const handleNavigatePredictions = useCallback(() => {
    // 🎓 Close any open floating panel before navigating away
    setIsChatOpen(false);
    setIsVoiceOpen(false);
    setIsRagOpen(false);
    setIsAnalyticsOpen(false);
    navigate("/ai-predictions");
  }, [navigate]);

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

  // 🎓 Close handler for Analytics panel — called when the user
  // clicks the X button inside CrossEntityAnalyticsPanel's header.
  const handleCloseAnalytics = useCallback(() => {
    setIsAnalyticsOpen(false);
  }, []);

  /**
   * 🎓 isAnyOpen controls whether we show the individual FABs
   * or a single "Close" button. When any panel is open, we swap
   * the FAB group to just a close button.
   */
  const isAnyOpen = isChatOpen || isVoiceOpen || isRagOpen || isAnalyticsOpen;

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

      {/* 🎓 Cross-Entity Analytics panel — Phase 2, Feature 1.
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
          Layout (left to right):
            [Predictions] [Analytics] [RAG Search] [Voice] [Main Chat FAB]

          🎓 PHASE 5 UPDATE: Added Predictions FAB as the NEW leftmost button.
          Order rationale: Predictions is the newest and most "forward-looking"
          action, so it sits furthest from the main FAB. The existing buttons
          (Analytics, RAG, Voice) remain in their established positions.

          🎓 COLOR CODING for all 5 AI modes:
            - Predictions : purple/violet  (rgba(168, 85, 247, x)) — future-looking
            - Analytics   : copper/amber   (rgba(201, 128, 61, x)) — strategic
            - RAG Search  : teal           (rgba(45, 212, 191, x)) — data retrieval
            - Voice       : blue           (rgba(96, 165, 250, x)) — interaction
            - Main Chat   : copper gloss   (copperGlossButtonSx)   — primary
        */}
        {!isAnyOpen && (
          <>
            {/* 🎓 Phase 5 NEW: Predictions FAB — sits furthest left.
                Uses purple/violet to visually distinguish from the copper analytics
                button. The AutoAwesome (sparkle) icon communicates "AI predictions /
                magic / forward-looking intelligence".

                🎓 KEY DIFFERENCE from other FABs:
                This does NOT toggle a floating panel. Instead it navigates to
                /ai-predictions (a full-page route). Predictions need more screen
                real estate for the category cards, time horizon slider, and
                large result area than a floating panel can comfortably provide. */}
            <Tooltip
              title="Predictive Analytics"
              placement="top"
              slotProps={{ popper: { sx: { zIndex: 10001 } } }}
            >
              <Box
                onClick={handleNavigatePredictions}
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
                  // 🎓 Purple/violet border — matches the predictions "future-looking" theme
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  "&:hover": {
                    transform: "scale(1.08)",
                    borderColor: "rgba(168, 85, 247, 0.5)",
                    boxShadow:
                      "0 4px 12px rgba(0,0,0,0.4), 0 0 12px rgba(168, 85, 247, 0.2)",
                  },
                }}
              >
                <AutoAwesomeIcon
                  sx={{
                    fontSize: 20,
                    // 🎓 Purple/violet icon color — consistent with the border accent
                    color: "rgba(168, 85, 247, 0.9)",
                  }}
                />
              </Box>
            </Tooltip>

            {/* 🎓 Analytics FAB — sits second from left.
                Uses copper/amber border for the cross-entity analytics panel. */}
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

            {/* RAG Search FAB — sits third from left */}
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
