import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MinimizeIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import {
  useAiChatSend,
  useAiChatSessions,
  useAiChatSession,
  useAiChatDeleteSession,
} from "../../tanstack-hooks/ai/useAiChat";
import type {
  AiChatMessageItem,
  AiChatSendMessageRequest,
} from "../../services/ai/ai.service";
import { copperGlossButtonSx } from "../../themes/button-color-themes";

// ─── Theme tokens ─────────────────────────────────────────

const CHAT_COLORS = {
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
  scrollTrack: "rgba(255, 255, 255, 0.02)",
  scrollThumb: "rgba(201, 128, 61, 0.3)",
} as const;

const SCROLLBAR_SX = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { backgroundColor: CHAT_COLORS.scrollTrack },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: CHAT_COLORS.scrollThumb,
    borderRadius: 3,
  },
} as const;

// ─── Size constraints ─────────────────────────────────────

const MIN_WIDTH = 360;
const MIN_HEIGHT = 400;
const DEFAULT_WIDTH = 420;
const DEFAULT_HEIGHT = 560;

// ─── Types ────────────────────────────────────────────────

type ChatView = "chat" | "history";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  tokensUsed?: number;
}

interface AiChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-fill entity context for new sessions started from a specific screen */
  entityType?: string;
  entityKey?: string;
}

// ─── Component ────────────────────────────────────────────

export default function AiChatWindow({
  isOpen,
  onClose,
  entityType,
  entityKey,
}: AiChatWindowProps) {
  // ── State ─────────────────────────────────────────────

  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<ChatView>("chat");
  const [message, setMessage] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Optimistic messages added locally (user's send + AI reply) before server
  // query refetches. These are cleared once server data catches up.
  const [pendingMessages, setPendingMessages] = useState<LocalMessage[]>([]);

  // Position & size (draggable / resizable)
  const [position, setPosition] = useState(() => ({
    x:
      typeof window !== "undefined"
        ? window.innerWidth - DEFAULT_WIDTH - 24
        : 0,
    y: 24,
  }));
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeRef = useRef<{
    isResizing: boolean;
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origX: number;
    origY: number;
  } | null>(null);

  // ── Hooks ─────────────────────────────────────────────

  const sendMutation = useAiChatSend();
  const sessionsQuery = useAiChatSessions(1, 50, view === "history");
  const sessionDetailQuery = useAiChatSession(activeSessionId);
  const deleteMutation = useAiChatDeleteSession();

  // ── Derive display messages (no setState, no useEffect) ─
  // Server messages come from TanStack Query; pending (optimistic)
  // messages are appended until the server data catches up.

  const serverMessages: LocalMessage[] = useMemo(() => {
    if (!sessionDetailQuery.data) return [];
    return sessionDetailQuery.data.messages.map((m: AiChatMessageItem) => ({
      id: m.messageId,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt,
      tokensUsed: m.tokensUsed,
    }));
  }, [sessionDetailQuery.data]);

  // Merge: show server messages, then any pending optimistic messages
  // whose IDs aren't already in the server data.
  const localMessages: LocalMessage[] = useMemo(() => {
    if (pendingMessages.length === 0) return serverMessages;
    const serverIds = new Set(serverMessages.map((m) => m.id));
    const unsyncedPending = pendingMessages.filter((m) => !serverIds.has(m.id));
    return [...serverMessages, ...unsyncedPending];
  }, [serverMessages, pendingMessages]);

  // ── Auto-scroll on new messages ───────────────────────
  // These effects only interact with the DOM (external system), not React state,
  // so they are safe under React 19's strict effect rules.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // ── Focus input when opening ──────────────────────────

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, view]);

  // ── Send handler ──────────────────────────────────────

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || sendMutation.isPending) return;

    // Optimistic local user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: LocalMessage = {
      id: tempId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setPendingMessages((prev) => [...prev, userMsg]);
    setMessage("");

    const request: AiChatSendMessageRequest = {
      message: trimmed,
      ...(activeSessionId
        ? { sessionId: activeSessionId }
        : { entityType, entityKey }),
    };

    sendMutation.mutate(request, {
      onSuccess: (data) => {
        if (!activeSessionId) {
          setActiveSessionId(data.sessionId);
        }
        const aiMsg: LocalMessage = {
          id: data.messageId,
          role: "assistant",
          content: data.reply,
          createdAt: data.createdAt,
          tokensUsed: data.totalTokens,
        };
        setPendingMessages((prev) => [...prev, aiMsg]);
      },
      onError: () => {
        const errMsg: LocalMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          createdAt: new Date().toISOString(),
        };
        setPendingMessages((prev) => [...prev, errMsg]);
      },
    });
  }, [message, sendMutation, activeSessionId, entityType, entityKey]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ── New chat ──────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setPendingMessages([]);
    setView("chat");
    setMessage("");
  }, []);

  // ── Load session ──────────────────────────────────────

  const handleLoadSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setPendingMessages([]);
    setView("chat");
  }, []);

  // ── Delete session ────────────────────────────────────

  const handleDeleteSession = useCallback(
    (sessionId: string, e: ReactMouseEvent) => {
      e.stopPropagation();
      deleteMutation.mutate(sessionId, {
        onSuccess: () => {
          if (activeSessionId === sessionId) {
            handleNewChat();
          }
        },
      });
    },
    [deleteMutation, activeSessionId, handleNewChat],
  );

  // ── Drag handlers ─────────────────────────────────────

  const handleDragStart = useCallback(
    (e: ReactMouseEvent) => {
      // Only initiate drag from the title bar, not from buttons
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: position.x,
        origY: position.y,
      };

      const handleDragMove = (ev: globalThis.MouseEvent) => {
        if (!dragRef.current?.isDragging) return;
        const dx = ev.clientX - dragRef.current.startX;
        const dy = ev.clientY - dragRef.current.startY;
        setPosition({
          x: Math.max(
            0,
            Math.min(window.innerWidth - 100, dragRef.current.origX + dx),
          ),
          y: Math.max(
            0,
            Math.min(window.innerHeight - 40, dragRef.current.origY + dy),
          ),
        });
      };

      const handleDragEnd = () => {
        if (dragRef.current) dragRef.current.isDragging = false;
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
      };

      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    },
    [position],
  );

  // ── Resize handler (top-left corner) ──────────────────

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        origW: size.width,
        origH: size.height,
        origX: position.x,
        origY: position.y,
      };

      const handleResizeMove = (ev: globalThis.MouseEvent) => {
        if (!resizeRef.current?.isResizing) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dy = ev.clientY - resizeRef.current.startY;

        // Drag from top-left: expanding left/up shrinks x/y, grows w/h
        const newW = Math.max(MIN_WIDTH, resizeRef.current.origW - dx);
        const newH = Math.max(MIN_HEIGHT, resizeRef.current.origH - dy);
        const newX = resizeRef.current.origX + (resizeRef.current.origW - newW);
        const newY = resizeRef.current.origY + (resizeRef.current.origH - newH);

        setSize({ width: newW, height: newH });
        setPosition({
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      };

      const handleResizeEnd = () => {
        if (resizeRef.current) resizeRef.current.isResizing = false;
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [size, position],
  );

  // ── Resize handler (bottom-right corner) ──────────────

  const handleResizeBRStart = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        isResizing: true,
        startX: e.clientX,
        startY: e.clientY,
        origW: size.width,
        origH: size.height,
        origX: position.x,
        origY: position.y,
      };

      const handleResizeMove = (ev: globalThis.MouseEvent) => {
        if (!resizeRef.current?.isResizing) return;
        const dx = ev.clientX - resizeRef.current.startX;
        const dy = ev.clientY - resizeRef.current.startY;

        setSize({
          width: Math.max(MIN_WIDTH, resizeRef.current.origW + dx),
          height: Math.max(MIN_HEIGHT, resizeRef.current.origH + dy),
        });
      };

      const handleResizeEnd = () => {
        if (resizeRef.current) resizeRef.current.isResizing = false;
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
      };

      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [size, position],
  );

  // ── Session title ─────────────────────────────────────

  const sessionTitle = useMemo(() => {
    if (sessionDetailQuery.data?.title) {
      return sessionDetailQuery.data.title;
    }
    return "New Chat";
  }, [sessionDetailQuery.data]);

  // ── Render ────────────────────────────────────────────

  if (!isOpen) return null;

  // ─ Minimized pill ─────────────────────────────────────

  if (isMinimized) {
    return (
      <Box
        onClick={() => setIsMinimized(false)}
        sx={{
          position: "fixed",
          bottom: 72,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.75,
          borderRadius: "20px",
          cursor: "pointer",
          backgroundColor: CHAT_COLORS.surface,
          border: `1px solid ${CHAT_COLORS.copper}`,
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 8px ${CHAT_COLORS.copperGlow}`,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: CHAT_COLORS.copperLight,
            boxShadow: `0 4px 24px rgba(0, 0, 0, 0.6), 0 0 12px ${CHAT_COLORS.copperGlow}`,
          },
        }}
      >
        <SmartToyIcon sx={{ fontSize: 18, color: CHAT_COLORS.copper }} />
        <Typography
          variant="body2"
          sx={{ color: CHAT_COLORS.text, fontWeight: 500, fontSize: "0.8rem" }}
        >
          Chat with Bobby
        </Typography>
        {sendMutation.isPending && (
          <CircularProgress size={14} sx={{ color: CHAT_COLORS.copper }} />
        )}
      </Box>
    );
  }

  // ─ Full window ────────────────────────────────────────

  return (
    <Box
      ref={windowRef}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        backgroundColor: CHAT_COLORS.canvas,
        border: `1px solid ${CHAT_COLORS.border}`,
        borderRadius: "12px",
        boxShadow:
          "0 12px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04)",
        overflow: "hidden",
        // Prevent text selection during drag
        userSelect: "none",
      }}
    >
      {/* ── Resize handle: top-left ──────────────────── */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
          zIndex: 10,
        }}
      />

      {/* ── Title bar (draggable) ────────────────────── */}
      <Box
        onMouseDown={handleDragStart}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.75,
          minHeight: 44,
          cursor: "move",
          background: `linear-gradient(135deg, ${CHAT_COLORS.surface} 0%, ${CHAT_COLORS.canvas} 100%)`,
          borderBottom: `1px solid ${CHAT_COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          <SmartToyIcon
            sx={{ fontSize: 20, color: CHAT_COLORS.copper, flexShrink: 0 }}
          />
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: CHAT_COLORS.text,
              fontWeight: 600,
              fontSize: "0.82rem",
              minWidth: 0,
            }}
          >
            {view === "history" ? "Chat History" : sessionTitle}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            flexShrink: 0,
          }}
        >
          <Tooltip title="New chat">
            <IconButton size="small" onClick={handleNewChat}>
              <AddIcon sx={{ fontSize: 18, color: CHAT_COLORS.muted }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={view === "history" ? "Back to chat" : "History"}>
            <IconButton
              size="small"
              onClick={() => setView(view === "history" ? "chat" : "history")}
            >
              {view === "history" ? (
                <ArrowBackIcon
                  sx={{ fontSize: 18, color: CHAT_COLORS.muted }}
                />
              ) : (
                <HistoryIcon sx={{ fontSize: 18, color: CHAT_COLORS.muted }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Minimize">
            <IconButton size="small" onClick={() => setIsMinimized(true)}>
              <MinimizeIcon sx={{ fontSize: 18, color: CHAT_COLORS.muted }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18, color: CHAT_COLORS.muted }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Body ─────────────────────────────────────── */}
      {view === "chat" ? (
        <>
          {/* Messages area */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              ...SCROLLBAR_SX,
            }}
          >
            {localMessages.length === 0 && !sendMutation.isPending && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  opacity: 0.6,
                }}
              >
                <ChatIcon sx={{ fontSize: 40, color: CHAT_COLORS.copper }} />
                <Typography
                  variant="body2"
                  sx={{ color: CHAT_COLORS.muted, textAlign: "center" }}
                >
                  Ask anything about your data.
                  <br />
                  Start typing below.
                </Typography>
              </Box>
            )}

            {localMessages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                }}
              >
                {/* Role indicator */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.25,
                    px: 0.5,
                  }}
                >
                  {msg.role === "assistant" ? (
                    <SmartToyIcon
                      sx={{ fontSize: 14, color: CHAT_COLORS.copper }}
                    />
                  ) : (
                    <PersonIcon
                      sx={{ fontSize: 14, color: CHAT_COLORS.muted }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: CHAT_COLORS.muted,
                      fontSize: "0.68rem",
                      fontWeight: 500,
                    }}
                  >
                    {msg.role === "assistant" ? "Bobby" : "You"}
                  </Typography>
                </Box>

                {/* Bubble */}
                <Box
                  sx={{
                    maxWidth: "88%",
                    px: 1.5,
                    py: 1,
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    backgroundColor:
                      msg.role === "user"
                        ? CHAT_COLORS.userBubble
                        : CHAT_COLORS.aiBubble,
                    border: `1px solid ${
                      msg.role === "user"
                        ? "rgba(201, 128, 61, 0.2)"
                        : "rgba(96, 165, 250, 0.12)"
                    }`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: CHAT_COLORS.text,
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                      fontSize: "0.82rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>

                {/* Token count for AI messages */}
                {msg.role === "assistant" && msg.tokensUsed != null && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: CHAT_COLORS.muted,
                      fontSize: "0.62rem",
                      mt: 0.25,
                      px: 0.5,
                      opacity: 0.7,
                    }}
                  >
                    {msg.tokensUsed.toLocaleString()} tokens
                  </Typography>
                )}
              </Box>
            ))}

            {/* Typing indicator */}
            {sendMutation.isPending && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: "12px 12px 12px 2px",
                  backgroundColor: CHAT_COLORS.aiBubble,
                  border: "1px solid rgba(96, 165, 250, 0.12)",
                  maxWidth: "60%",
                }}
              >
                <CircularProgress
                  size={14}
                  sx={{ color: CHAT_COLORS.copper }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: CHAT_COLORS.muted,
                    fontSize: "0.8rem",
                    fontStyle: "italic",
                  }}
                >
                  Thinking...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input area */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${CHAT_COLORS.border}`,
              p: 1.5,
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
              backgroundColor: CHAT_COLORS.surface,
            }}
          >
            <TextField
              inputRef={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              multiline
              maxRows={4}
              fullWidth
              size="small"
              variant="outlined"
              disabled={sendMutation.isPending}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: CHAT_COLORS.input,
                  color: CHAT_COLORS.text,
                  fontSize: "0.85rem",
                  borderRadius: "10px",
                  "& fieldset": {
                    borderColor: CHAT_COLORS.border,
                  },
                  "&:hover fieldset": {
                    borderColor: CHAT_COLORS.borderHover,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: CHAT_COLORS.copper,
                    borderWidth: 1,
                  },
                },
                "& .MuiOutlinedInput-input": {
                  "&::placeholder": {
                    color: CHAT_COLORS.muted,
                    opacity: 1,
                  },
                },
              }}
            />
            <Tooltip title="Send (Enter)">
              <span>
                <IconButton
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  size="small"
                  sx={{
                    ...copperGlossButtonSx,
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    "&.Mui-disabled": {
                      ...copperGlossButtonSx,
                      opacity: 0.35,
                      color: "#F3E9D6",
                    },
                  }}
                >
                  <SendIcon
                    sx={{
                      fontSize: 18,
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </>
      ) : (
        /* ── History view ──────────────────────────────── */
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            ...SCROLLBAR_SX,
          }}
        >
          {sessionsQuery.isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={24} sx={{ color: CHAT_COLORS.copper }} />
            </Box>
          )}

          {sessionsQuery.data && sessionsQuery.data.items.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                gap: 1,
              }}
            >
              <HistoryIcon
                sx={{ fontSize: 36, color: CHAT_COLORS.muted, opacity: 0.4 }}
              />
              <Typography
                variant="body2"
                sx={{ color: CHAT_COLORS.muted, opacity: 0.6 }}
              >
                No chat history yet
              </Typography>
            </Box>
          )}

          <List disablePadding>
            {sessionsQuery.data?.items.map((session) => (
              <ListItemButton
                key={session.sessionId}
                selected={session.sessionId === activeSessionId}
                onClick={() => handleLoadSession(session.sessionId)}
                sx={{
                  px: 2,
                  py: 1,
                  borderBottom: `1px solid ${CHAT_COLORS.border}`,
                  "&:hover": {
                    backgroundColor: CHAT_COLORS.copperLight,
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(201, 128, 61, 0.1)",
                    borderLeft: `3px solid ${CHAT_COLORS.copper}`,
                    "&:hover": {
                      backgroundColor: CHAT_COLORS.copperLight,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: CHAT_COLORS.text,
                        fontWeight: 500,
                        fontSize: "0.82rem",
                      }}
                    >
                      {session.title ??
                        `${session.entityType} · ${session.entityKey}`}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: CHAT_COLORS.muted,
                        fontSize: "0.7rem",
                      }}
                    >
                      {session.messageCount} messages ·{" "}
                      {new Date(session.lastMessageAt).toLocaleDateString()}
                    </Typography>
                  }
                />
                <Tooltip title="Delete session">
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteSession(session.sessionId, e)}
                    sx={{
                      color: CHAT_COLORS.muted,
                      opacity: 0.5,
                      "&:hover": {
                        color: "#f87171",
                        opacity: 1,
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {/* ── Resize handle: bottom-right ──────────────── */}
      <Box
        onMouseDown={handleResizeBRStart}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
          zIndex: 10,
          // Small grip indicator
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 8,
            height: 8,
            borderRight: `2px solid ${CHAT_COLORS.copperGlow}`,
            borderBottom: `2px solid ${CHAT_COLORS.copperGlow}`,
            opacity: 0.6,
          },
        }}
      />
    </Box>
  );
}
