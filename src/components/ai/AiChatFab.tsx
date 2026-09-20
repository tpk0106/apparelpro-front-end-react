import { useState, useCallback } from "react";
import { Box, Tooltip } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import AiChatWindow from "./AiChatWindow";

interface AiChatFabProps {
  /** Pre-fill entity context for sessions started from this screen */
  entityType?: string;
  entityKey?: string;
}

/**
 * Floating Action Button that toggles the AI Chat window.
 * Mount this once at the app root (e.g. inside your layout component)
 * so the chat window floats over every screen.
 *
 * Usage:
 *   <AiChatFab />
 *   <AiChatFab entityType="Style" entityKey="1/ORD001/2/ST001" />
 */
export default function AiChatFab({ entityType, entityKey }: AiChatFabProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <>
      {/* Chat window */}
      <AiChatWindow
        isOpen={isChatOpen}
        onClose={handleClose}
        entityType={entityType}
        entityKey={entityKey}
      />

      {/* FAB button */}
      <Tooltip title={isChatOpen ? "Close AI Chat" : "Open AI Chat"}>
        <Box
          onClick={handleToggle}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10000,
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.25s ease",
            ...copperGlossButtonSx,
            // Override border-radius for circle shape
            borderRadius: "50%",
            "&:hover": {
              ...copperGlossButtonSx["&:hover"],
              transform: "scale(1.08)",
            },
            // Subtle pulse animation when closed (inviting click)
            ...(!isChatOpen && {
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
          {isChatOpen ? (
            <CloseIcon
              sx={{ fontSize: 24, color: "#F3E9D6", position: "relative", zIndex: 1 }}
            />
          ) : (
            <SmartToyIcon
              sx={{ fontSize: 24, color: "#F3E9D6", position: "relative", zIndex: 1 }}
            />
          )}
        </Box>
      </Tooltip>
    </>
  );
}
