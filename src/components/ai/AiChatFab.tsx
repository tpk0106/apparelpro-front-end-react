import { useState, useCallback } from "react";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import { useAiEntityContext } from "./AiEntityContext";
import AiChatWindow from "./AiChatWindow";
import AiVoicePanel from "./AiVoicePanel";

/**
 * Floating Action Button group that toggles AI Chat and Voice panels.
 * Mount once at the app root (e.g. inside your layout component).
 *
 * Entity context is read automatically from AiEntityContext —
 * individual screens call useSetAiEntity() to publish what entity
 * they're looking at, and this FAB picks it up without any props.
 */
export default function AiChatFab() {
  const { entityType, entityKey } = useAiEntityContext();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
    // Close voice when opening chat
    if (!isChatOpen) setIsVoiceOpen(false);
  }, [isChatOpen]);

  const handleToggleVoice = useCallback(() => {
    setIsVoiceOpen((prev) => !prev);
    // Close chat when opening voice
    if (!isVoiceOpen) setIsChatOpen(false);
  }, [isVoiceOpen]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleCloseVoice = useCallback(() => {
    setIsVoiceOpen(false);
  }, []);

  const isAnyOpen = isChatOpen || isVoiceOpen;

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

      {/* ── FAB group ─────────────────────────────── */}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        {/* Voice FAB (shown above main FAB when expanded or as secondary) */}
        {!isAnyOpen && (
          <Tooltip
            title="Voice Assistant"
            placement="left"
            slotProps={{ popper: { sx: { zIndex: 10001 } } }}
          >
            <Box
              onClick={handleToggleVoice}
              sx={{
                width: 42,
                height: 42,
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
        )}

        {/* Main FAB — Chat or Close */}
        <Tooltip
          title={
            isAnyOpen
              ? "Close"
              : "AI Chat"
          }
          placement="left"
          slotProps={{ popper: { sx: { zIndex: 10001 } } }}
        >
          <Box
            onClick={isAnyOpen ? (isChatOpen ? handleToggleChat : handleToggleVoice) : handleToggleChat}
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
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
              // Subtle pulse animation when both panels are closed
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
