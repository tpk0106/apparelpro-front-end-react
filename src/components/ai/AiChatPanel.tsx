import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddCommentIcon from "@mui/icons-material/AddComment";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  useAiChatSend,
  useAiChatSessions,
  useAiChatSessionDetail,
  useAiChatDeleteSession,
} from "../../tanstack-hooks/ai/useAiChat";
import type { AiChatMessageItem } from "../../services/ai/ai-chat.service";
import { copperTextColor } from "../../themes/button-color-themes";

// ─── Types ────────────────────────────────────────────────

type ChatView = "chat" | "history";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  tokensUsed?: number;
  provider?: string;
  model?: string;
}

interface AiChatPanelProps {
  entityType: string;
  entityKey: string;
}

// ─── Helpers ──────────────────────────────────────────────

const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ─── Component ────────────────────────────────────────────

export default function AiChatPanel({
  entityType,
  entityKey,
}: AiChatPanelProps) {
  // ── State ─────────────────────────────────────────────
  const [view, setView] = useState<ChatView>("chat");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Hooks ─────────────────────────────────────────────
  const sendMessage = useAiChatSend();
  const deleteSession = useAiChatDeleteSession();
  const sessionsQuery = useAiChatSessions(entityType, entityKey, 1, 50, view === "history");
  const sessionDetailQuery = useAiChatSessionDetail(activeSessionId);

  // ── Load session detail into local messages ───────────
  useEffect(() => {
    if (sessionDetailQuery.data?.messages) {
      const loaded: ChatMessage[] = sessionDetailQuery.data.messages.map(
        (m: AiChatMessageItem) => ({
          id: m.messageId,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          tokensUsed: m.tokensUsed,
        }),
      );
      setMessages(loaded);
    }
  }, [sessionDetailQuery.data]);

  // ── Auto-scroll to bottom on new messages ─────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessage.isPending]);

  // ── Handlers ──────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || sendMessage.isPending) return;

    // Add user message locally
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    sendMessage.mutate(
      {
        sessionId: activeSessionId ?? undefined,
        entityType: activeSessionId ? undefined : entityType,
        entityKey: activeSessionId ? undefined : entityKey,
        message: trimmed,
      },
      {
        onSuccess: (data) => {
          // Set session ID from first response
          if (!activeSessionId || data.isNewSession) {
            setActiveSessionId(data.sessionId);
          }
          // Add assistant message
          const assistantMsg: ChatMessage = {
            id: data.messageId,
            role: "assistant",
            content: data.reply,
            createdAt: data.createdAt,
            provider: data.provider,
            model: data.model,
            tokensUsed: data.totalTokens,
          };
          setMessages((prev) => [...prev, assistantMsg]);
        },
        onError: () => {
          // Remove the optimistic user message on error
          setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
          setInputValue(trimmed);
        },
      },
    );
  }, [inputValue, sendMessage, activeSessionId, entityType, entityKey]);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue("");
    sendMessage.reset();
    setView("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [sendMessage]);

  const handleLoadSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
      setMessages([]);
      setView("chat");
    },
    [],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!sessionToDelete) return;
    deleteSession.mutate(sessionToDelete, {
      onSuccess: () => {
        if (activeSessionId === sessionToDelete) {
          handleNewChat();
        }
        setIsDeleteDialogOpen(false);
        setSessionToDelete(null);
      },
    });
  }, [sessionToDelete, deleteSession, activeSessionId, handleNewChat]);

  const handleCopy = useCallback(async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // ── Session title ─────────────────────────────────────
  const sessionTitle = useMemo(() => {
    if (sessionDetailQuery.data?.title) return sessionDetailQuery.data.title;
    if (messages.length === 0) return "New Chat";
    return "Chat Session";
  }, [sessionDetailQuery.data?.title, messages.length]);

  // ── Render ────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 400,
        maxHeight: 600,
        backgroundColor: "#141922",
        borderRadius: 2,
        border: "1px solid rgba(201, 128, 61, 0.2)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {view === "history" && (
          <IconButton
            size="small"
            onClick={() => setView("chat")}
            sx={{ color: "#8B93A1" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        )}
        <AutoAwesomeIcon sx={{ color: copperTextColor, fontSize: 20 }} />
        <Typography
          variant="subtitle2"
          sx={{ flex: 1, color: "#F3E9D6", fontWeight: 600 }}
        >
          {view === "history" ? "Chat History" : sessionTitle}
        </Typography>
        <Chip
          label={entityType}
          size="small"
          sx={{
            backgroundColor: "rgba(201, 128, 61, 0.12)",
            color: copperTextColor,
            fontSize: "0.65rem",
            height: 22,
          }}
        />
        <Tooltip title="New chat">
          <IconButton
            size="small"
            onClick={handleNewChat}
            sx={{ color: "#8B93A1", "&:hover": { color: copperTextColor } }}
          >
            <AddCommentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chat history">
          <IconButton
            size="small"
            onClick={() => setView(view === "history" ? "chat" : "history")}
            sx={{
              color: view === "history" ? copperTextColor : "#8B93A1",
              "&:hover": { color: copperTextColor },
            }}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── History view ───────────────────────────────── */}
      {view === "history" && (
        <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
          {sessionsQuery.isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: copperTextColor }} />
            </Box>
          )}
          {sessionsQuery.data?.items.length === 0 && (
            <Typography
              variant="body2"
              sx={{ color: "#8B93A1", textAlign: "center", py: 4 }}
            >
              No chat history for this {entityType.toLowerCase()}.
            </Typography>
          )}
          <List dense disablePadding>
            {sessionsQuery.data?.items.map((session) => (
              <ListItemButton
                key={session.sessionId}
                onClick={() => handleLoadSession(session.sessionId)}
                selected={activeSessionId === session.sessionId}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(201, 128, 61, 0.12)",
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.04)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ChatIcon
                    sx={{ fontSize: 16, color: "#8B93A1" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={session.title ?? "Untitled"}
                  secondary={`${session.messageCount} messages · ${formatTimestamp(session.lastMessageAt)}`}
                  slotProps={{
                    primary: {
                      variant: "body2",
                      sx: {
                        color: "#F4F6F8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    secondary: {
                      variant: "caption",
                      sx: { color: "#8B93A1" },
                    },
                  }}
                />
                <Tooltip title="Delete session">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session.sessionId);
                      setIsDeleteDialogOpen(true);
                    }}
                    sx={{
                      color: "#8B93A1",
                      opacity: 0,
                      ".MuiListItemButton-root:hover &": { opacity: 1 },
                      "&:hover": { color: "#f87171" },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {/* ── Chat view ──────────────────────────────────── */}
      {view === "chat" && (
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
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255,255,255,0.02)",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(201, 128, 61, 0.3)",
                borderRadius: 3,
              },
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && !sendMessage.isPending && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  gap: 1,
                  py: 4,
                }}
              >
                <SmartToyIcon
                  sx={{ fontSize: 40, color: "rgba(201, 128, 61, 0.3)" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#8B93A1", textAlign: "center", maxWidth: 280 }}
                >
                  Ask anything about this {entityType.toLowerCase()}. I have
                  full context of its data.
                </Typography>
              </Box>
            )}

            {/* Message bubbles */}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    maxWidth: "85%",
                    flexDirection:
                      msg.role === "user" ? "row-reverse" : "row",
                  }}
                >
                  {/* Avatar */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      mt: 0.5,
                      backgroundColor:
                        msg.role === "user"
                          ? "rgba(96, 165, 250, 0.15)"
                          : "rgba(201, 128, 61, 0.15)",
                    }}
                  >
                    {msg.role === "user" ? (
                      <PersonIcon
                        sx={{ fontSize: 16, color: "#60a5fa" }}
                      />
                    ) : (
                      <SmartToyIcon
                        sx={{ fontSize: 16, color: copperTextColor }}
                      />
                    )}
                  </Box>

                  {/* Bubble */}
                  <Box
                    sx={{
                      backgroundColor:
                        msg.role === "user"
                          ? "rgba(96, 165, 250, 0.1)"
                          : "#0D1117",
                      border:
                        msg.role === "user"
                          ? "1px solid rgba(96, 165, 250, 0.2)"
                          : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#F4F6F8",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                        fontSize: "0.82rem",
                      }}
                    >
                      {msg.content}
                    </Typography>

                    {/* Footer for assistant messages */}
                    {msg.role === "assistant" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mt: 0.5,
                          pt: 0.5,
                          borderTop: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "#8B93A1", fontSize: "0.65rem" }}
                        >
                          {[msg.provider, msg.model, msg.tokensUsed ? `${msg.tokensUsed} tokens` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                        <Tooltip
                          title={
                            copiedId === msg.id
                              ? "Copied!"
                              : "Copy"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleCopy(msg.content, msg.id)
                            }
                            sx={{
                              color: "#8B93A1",
                              p: 0.3,
                              "&:hover": { color: copperTextColor },
                            }}
                          >
                            <ContentCopyIcon
                              sx={{ fontSize: 13 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}

            {/* Typing indicator */}
            {sendMessage.isPending && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pl: 0.5,
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
                    backgroundColor: "rgba(201, 128, 61, 0.15)",
                  }}
                >
                  <SmartToyIcon
                    sx={{ fontSize: 16, color: copperTextColor }}
                  />
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#0D1117",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <CircularProgress
                    size={14}
                    sx={{ color: copperTextColor }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "#8B93A1", ml: 0.5 }}
                  >
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Error state */}
            {sendMessage.isError && (
              <Typography
                variant="caption"
                sx={{
                  color: "#f87171",
                  backgroundColor: "rgba(248, 113, 113, 0.08)",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.75,
                  alignSelf: "center",
                }}
              >
                {sendMessage.error?.message ??
                  "Failed to send. Please try again."}
              </Typography>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* ── Input area ───────────────────────────────── */}
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
              px: 2,
              py: 1.5,
              flexShrink: 0,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder={
                activeSessionId
                  ? "Continue the conversation..."
                  : `Ask about this ${entityType.toLowerCase()}...`
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sendMessage.isPending}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#0D1117",
                  color: "#F4F6F8",
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": {
                    borderColor: "rgba(201, 128, 61, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: copperTextColor,
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#8B93A1",
                  opacity: 1,
                },
              }}
            />
            <Tooltip title="Send (Enter)">
              <span>
                <IconButton
                  onClick={handleSend}
                  disabled={
                    !inputValue.trim() || sendMessage.isPending
                  }
                  sx={{
                    backgroundColor: "rgba(201, 128, 61, 0.15)",
                    color: copperTextColor,
                    "&:hover": {
                      backgroundColor: "rgba(201, 128, 61, 0.25)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(201, 128, 61, 0.3)",
                    },
                  }}
                >
                  {sendMessage.isPending ? (
                    <CircularProgress
                      size={20}
                      sx={{ color: copperTextColor }}
                    />
                  ) : (
                    <SendIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </>
      )}

      {/* ── Delete confirmation dialog ───────────────────── */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSessionToDelete(null);
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#141922",
              backgroundImage: "none",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          },
        }}
      >
        <DialogTitle sx={{ color: "#F4F6F8" }}>
          Delete Chat Session?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#8B93A1" }}>
            This will permanently delete the chat session and all its
            messages. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setSessionToDelete(null);
            }}
            sx={{
              color: "#8B93A1",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": {
                borderColor: "rgba(255,255,255,0.2)",
                backgroundColor: "rgba(255,255,255,0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleteSession.isPending}
            variant="contained"
            sx={{
              backgroundColor: "#dc2626",
              color: "#fff",
              "&:hover": { backgroundColor: "#b91c1c" },
              "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
            }}
            startIcon={
              deleteSession.isPending ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
