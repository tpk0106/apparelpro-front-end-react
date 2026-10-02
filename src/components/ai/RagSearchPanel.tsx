/**
 * 🎓 RagSearchPanel — Chat-style floating panel for RAG queries.
 *
 * This component lets users ask natural-language questions about their
 * ERP data. Under the hood it calls the RAG pipeline:
 *   Question → OpenAI embedding → Qdrant vector search → Claude generation
 *
 * The panel mirrors AiChatWindow's visual language (same CHAT_COLORS,
 * bubble shapes, drag/resize, minimize) but is SIMPLER:
 *   • No session management / history — just Q&A pairs in-memory
 *   • Source "evidence cards" appear beneath each AI answer
 *   • Optional entity-type filter chip bar at the top of the input area
 *
 * The conversation is ephemeral — it resets when the panel closes.
 * If the user wants persistent chat, they use the Bobby chat window instead.
 */
import {
  useState,
  useRef,
  useCallback,
  useEffect,
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
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MinimizeIcon from "@mui/icons-material/Remove";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SourceIcon from "@mui/icons-material/Description";
import { copperGlossButtonSx } from "../../themes/button-color-themes";
import { useRagQuery } from "../../tanstack-hooks/ai/useRagQuery";
import type {
  RagQueryResponse,
  RagSourceReference,
  ReportIntentDetection,
} from "../../services/ai/ai.service";
import { fetchReportPdf } from "../../services/ai/ai.service";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

// ─── Theme tokens (shared with AiChatWindow) ────────────────
// 🎓 We duplicate these rather than importing from AiChatWindow
// so each panel remains a self-contained module. If the design
// system grows, these should move to a shared tokens file.

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
  /** 🎓 New: teal tint for source evidence cards */
  sourceBg: "rgba(45, 212, 191, 0.08)",
  sourceBorder: "rgba(45, 212, 191, 0.2)",
  /**
   * 🎓 Report intent action card colors — a warm amber/gold to visually
   * distinguish "I can generate a PDF for you" from regular source cards (teal).
   * This uses a gold tint that complements the copper accent without clashing.
   */
  reportBg: "rgba(234, 179, 8, 0.08)",
  reportBorder: "rgba(234, 179, 8, 0.25)",
  reportText: "rgba(250, 204, 21, 0.9)",
} as const;

const SCROLLBAR_SX = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-track": { backgroundColor: CHAT_COLORS.scrollTrack },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: CHAT_COLORS.scrollThumb,
    borderRadius: 3,
  },
} as const;

// ─── Size constraints ────────────────────────────────────────

const MIN_WIDTH = 380;
const MIN_HEIGHT = 420;
const DEFAULT_WIDTH = 440;
const DEFAULT_HEIGHT = 580;

// ─── Entity type filter options ──────────────────────────────
// 🎓 These match the valid entity types in RagController.cs.
// "All" = null filter, meaning search every entity type in Qdrant.

const ENTITY_FILTERS = [
  { label: "All", value: null },
  { label: "Styles", value: "Style" },
  { label: "Purchase Orders", value: "PurchaseOrder" },
  { label: "Buyers", value: "Buyer" },
  { label: "Suppliers", value: "Supplier" },
  // 🎓 SOPs added in Phase 2 Step 6 — allows users to scope RAG queries
  // specifically to Standard Operating Procedures (company rules, T&C, compliance).
  { label: "SOPs", value: "Sop" },
] as const;

// ─── Types ───────────────────────────────────────────────────

/**
 * 🎓 A single Q&A exchange in the conversation.
 * Unlike AiChatWindow which has server-persisted sessions,
 * RAG messages live only in React state — ephemeral by design.
 */
interface RagMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Only present on assistant messages — the source evidence cards */
  sources?: RagSourceReference[];
  /** Whether the RAG pipeline found matching vectors */
  hasResults?: boolean;
  /** Token usage for subtle cost indicator */
  totalTokens?: number;
  /**
   * 🎓 When Claude detects the user wants a REPORT (not just asking a question),
   * this carries the structured intent: which report, extracted parameters, and
   * the API endpoint to call. The UI renders a "Generate Report" action card
   * when this is present instead of (or in addition to) the normal text answer.
   *
   * Null/undefined = normal RAG answer (just show text + sources).
   */
  detectedReportIntent?: ReportIntentDetection | null;
  /** Timestamp for display */
  createdAt: string;
}

interface RagSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 🎓 When the user is on a specific entity screen (e.g. a Style detail page),
   * entityType pre-selects the filter chip so RAG queries are scoped to that type.
   */
  entityType?: string;
  entityKey?: string;
}

// ─── Component ───────────────────────────────────────────────

export default function RagSearchPanel({
  isOpen,
  onClose,
  entityType,
}: RagSearchPanelProps) {
  // ── State ──────────────────────────────────────────────

  const [isMinimized, setIsMinimized] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<RagMessage[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /**
   * 🎓 Active entity-type filter for RAG queries.
   * When the user navigates to a Style screen, entityType prop pre-selects "Style".
   * The user can override this by clicking a different filter chip.
   */
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Position & size (draggable / resizable — same pattern as AiChatWindow)
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

  // ── Hooks ──────────────────────────────────────────────

  const ragMutation = useRagQuery();

  // ── Sync entity filter from parent context ─────────────
  // 🎓 When the user navigates to a different entity screen,
  // the entityType prop changes → update the filter chip.

  useEffect(() => {
    if (entityType) {
      const matchingFilter = ENTITY_FILTERS.find(
        (f) => f.value === entityType,
      );
      if (matchingFilter) {
        setActiveFilter(matchingFilter.value);
      }
    }
  }, [entityType]);

  // ── Auto-scroll to latest message ──────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input when panel opens ───────────────────────

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // ── Clear conversation when panel closes ───────────────
  // 🎓 RAG conversations are ephemeral by design — no sessions.

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setQuestion("");
      setIsMinimized(false);
    }
  }, [isOpen]);

  // ── Report PDF generation ───────────────────────────────
  /**
   * 🎓 Opens a report PDF in a new browser tab using AUTHENTICATED request.
   *
   * HOW IT WORKS:
   * The backend PDF endpoints are protected by JWT Bearer token authentication.
   * We CANNOT use window.open() because it doesn't send the Authorization header
   * → results in HTTP 401 Unauthorized.
   *
   * Instead, we use fetchReportPdf() from ai.service.ts which:
   *   1. Uses the authenticated axios client (has JWT interceptor) to GET the PDF
   *   2. Receives the PDF as a binary Blob
   *   3. Creates a temporary blob URL (blob:https://...)
   *   4. Opens that blob URL in a new tab → browser's native PDF viewer
   *   5. Revokes the blob URL after 60s to free memory
   *
   * 🎓 WHY NOT JUST window.open()?
   * window.open() makes a plain browser navigation request with NO custom headers.
   * Our API requires: Authorization: Bearer <jwt_token>
   * Only axios (or fetch with headers) can send that token.
   * So we fetch the binary data WITH auth, wrap it in a Blob URL, then open that.
   */
  const openReportPdf = useCallback(async (intent: ReportIntentDetection) => {
    const blobUrl = await fetchReportPdf(intent.endpointTemplate, intent.parameters);

    if (!blobUrl) {
      // 🎓 If the PDF fetch failed, show an error message in the chat
      // so the user knows something went wrong (network error, 500, etc.)
      const errorMessage: RagMessage = {
        id: `pdf-err-${Date.now()}`,
        role: "assistant",
        content: `Sorry, I couldn't generate the ${intent.displayName}. The report endpoint returned an error. Please check that the parameters are correct and try again.`,
        hasResults: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, []);

  // ── Send question ──────────────────────────────────────

  const handleSend = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed || ragMutation.isPending) return;

    // 🎓 Add the user's question as a message bubble immediately
    // (optimistic UI — the user sees their question right away)
    const userMsgId = `user-${Date.now()}`;
    const userMessage: RagMessage = {
      id: userMsgId,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    // 🎓 Fire the RAG pipeline mutation
    ragMutation.mutate(
      {
        question: trimmed,
        entityTypeFilter: activeFilter,
      },
      {
        onSuccess: (data: RagQueryResponse) => {
          // 🎓 Add the AI's answer as a message bubble with source cards.
          // If Claude detected a report intent, we attach it to the message
          // so the UI can render a "Generate Report" action card below the answer.
          const aiMessage: RagMessage = {
            id: `rag-${Date.now()}`,
            role: "assistant",
            content: data.answer,
            sources: data.sources,
            hasResults: data.hasResults,
            totalTokens: data.totalTokens,
            detectedReportIntent: data.detectedReportIntent ?? null,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);

          /**
           * 🎓 AUTO-TRIGGER PDF FOR HIGH-CONFIDENCE REPORT INTENTS:
           *
           * When confidence >= 0.8, the user's intent is clear ("Generate the trim
           * sheet for ANCHORAGE"), so we open the PDF immediately in a new tab.
           * The text answer STILL appears in the chat as context/confirmation.
           *
           * For confidence 0.5–0.8 (ambiguous), we just show the action card with
           * a "Generate Report" button — the user decides whether to click it.
           *
           * For confidence < 0.5, the backend filters it out (detectedReportIntent = null).
           */
          if (data.detectedReportIntent && data.detectedReportIntent.confidence >= 0.8) {
            openReportPdf(data.detectedReportIntent);
          }
        },
        onError: (error) => {
          // 🎓 Show the error as a system message so the user knows what happened
          const errorMessage: RagMessage = {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `Sorry, something went wrong with the search.\n\n${error.message || "Please try again."}`,
            hasResults: false,
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      },
    );
  }, [question, ragMutation, activeFilter]);

  // ── Keyboard handler ───────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ── Copy handler ───────────────────────────────────────

  const handleCopy = useCallback((msgId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }, []);

  // ── Drag handler (title bar) ───────────────────────────
  // 🎓 Same pattern as AiChatWindow — attach mousemove/mouseup
  // to document so dragging works even when the cursor leaves the panel.

  const handleDragStart = useCallback(
    (e: ReactMouseEvent) => {
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

  // ── Resize handler (top-left corner) ───────────────────

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
        const newW = Math.max(MIN_WIDTH, resizeRef.current.origW - dx);
        const newH = Math.max(MIN_HEIGHT, resizeRef.current.origH - dy);
        const newX =
          resizeRef.current.origX + (resizeRef.current.origW - newW);
        const newY =
          resizeRef.current.origY + (resizeRef.current.origH - newH);
        setSize({ width: newW, height: newH });
        setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
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

  // ── Resize handler (bottom-right corner) ───────────────

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

  // ── Render ─────────────────────────────────────────────

  if (!isOpen) return null;

  // 🎓 Minimized state — collapse to a small pill, same as AiChatWindow
  if (isMinimized) {
    return (
      <Box
        onClick={() => setIsMinimized(false)}
        sx={{
          position: "fixed",
          bottom: 84,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.75,
          borderRadius: "20px",
          backgroundColor: CHAT_COLORS.surface,
          border: `1px solid ${CHAT_COLORS.border}`,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: CHAT_COLORS.copperGlow,
            boxShadow: `0 0 12px ${CHAT_COLORS.copperGlow}`,
          },
        }}
      >
        <SearchIcon sx={{ fontSize: 16, color: CHAT_COLORS.copper }} />
        <Typography
          variant="caption"
          sx={{ color: CHAT_COLORS.text, fontWeight: 500, fontSize: "0.75rem" }}
        >
          RAG Search
        </Typography>
      </Box>
    );
  }

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
        borderRadius: "16px",
        border: `1px solid ${CHAT_COLORS.border}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 1px rgba(0,0,0,0.3)",
        overflow: "hidden",
        // 🎓 Prevent the panel from being selected as text while dragging
        userSelect: "none",
      }}
    >
      {/* ── Resize handle (top-left) ──────────────────── */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 16,
          height: 16,
          cursor: "nw-resize",
          zIndex: 10,
        }}
      />

      {/* ── Title bar (draggable) ─────────────────────── */}
      <Box
        onMouseDown={handleDragStart}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          backgroundColor: CHAT_COLORS.surface,
          borderBottom: `1px solid ${CHAT_COLORS.border}`,
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          flexShrink: 0,
        }}
      >
        {/* Left: icon + title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon sx={{ fontSize: 18, color: CHAT_COLORS.copper }} />
          <Typography
            variant="subtitle2"
            sx={{
              color: CHAT_COLORS.text,
              fontWeight: 600,
              fontSize: "0.82rem",
              letterSpacing: "0.01em",
            }}
          >
            RAG Search
          </Typography>
          {/* 🎓 Subtle indicator showing the active filter */}
          {activeFilter && (
            <Typography
              variant="caption"
              sx={{
                color: CHAT_COLORS.muted,
                fontSize: "0.65rem",
                ml: 0.5,
              }}
            >
              · {activeFilter}
            </Typography>
          )}
        </Box>

        {/* Right: minimize + close */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <IconButton
            size="small"
            onClick={() => setIsMinimized(true)}
            sx={{ color: CHAT_COLORS.muted, p: 0.5 }}
          >
            <MinimizeIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: CHAT_COLORS.muted, p: 0.5 }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Messages area ─────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          py: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          ...SCROLLBAR_SX,
        }}
      >
        {/* 🎓 Welcome state — show when no messages yet */}
        {messages.length === 0 && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: CHAT_COLORS.copperLight,
                border: `1px solid ${CHAT_COLORS.copperGlow}`,
              }}
            >
              <SearchIcon sx={{ fontSize: 24, color: CHAT_COLORS.copper }} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: CHAT_COLORS.text,
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              Search Your Data
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: CHAT_COLORS.muted,
                textAlign: "center",
                maxWidth: 280,
                lineHeight: 1.5,
              }}
            >
              Ask questions about styles, purchase orders, buyers, suppliers, or
              SOPs. Answers are generated from your actual ERP data.
            </Typography>
          </Box>
        )}

        {/* 🎓 Message bubbles — same visual pattern as AiChatWindow */}
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {/* Role indicator (icon + label) */}
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
                <PersonIcon sx={{ fontSize: 14, color: CHAT_COLORS.muted }} />
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

            {/* Message bubble */}
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
                component="div"
                sx={{
                  color: CHAT_COLORS.text,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  fontSize: "0.82rem",
                  wordBreak: "break-word",
                  userSelect: "text",
                  cursor: "text",
                }}
              >
                {msg.content}
              </Typography>
            </Box>

            {/* Copy button + tokens for AI messages */}
            {msg.role === "assistant" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.25,
                  px: 0.5,
                }}
              >
                <Tooltip
                  title={copiedId === msg.id ? "Copied!" : "Copy response"}
                  slotProps={{ popper: { sx: { zIndex: 10000 } } }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(msg.id, msg.content)}
                    sx={{
                      p: 0.25,
                      color:
                        copiedId === msg.id
                          ? CHAT_COLORS.copper
                          : CHAT_COLORS.muted,
                      opacity: copiedId === msg.id ? 1 : 0.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        opacity: 1,
                        color: CHAT_COLORS.copper,
                      },
                    }}
                  >
                    {copiedId === msg.id ? (
                      <CheckIcon sx={{ fontSize: 14 }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Tooltip>
                {msg.totalTokens != null && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: CHAT_COLORS.muted,
                      fontSize: "0.62rem",
                      opacity: 0.7,
                    }}
                  >
                    {msg.totalTokens.toLocaleString()} tokens
                  </Typography>
                )}
              </Box>
            )}

            {/* 🎓 Source evidence cards — only for AI messages with results */}
            {msg.role === "assistant" &&
              msg.hasResults &&
              msg.sources &&
              msg.sources.length > 0 && (
                <Box
                  sx={{
                    mt: 0.75,
                    maxWidth: "88%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: CHAT_COLORS.muted,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      px: 0.5,
                    }}
                  >
                    Sources ({msg.sources.length})
                  </Typography>
                  {msg.sources.map((src, idx) => (
                    <SourceCard key={`${msg.id}-src-${idx}`} source={src} />
                  ))}
                </Box>
              )}

            {/* ─── 🆕 Report Intent Action Card ────────────────────────────
             * 🎓 WHAT IS THIS?
             * When Claude detects the user asked for a REPORT (not just a question),
             * we show a special action card below the text answer. This card:
             *   • Shows the report name and extracted parameters
             *   • Provides a "Generate Report" button to open the PDF
             *   • Visually distinct from source cards (gold/amber vs teal)
             *
             * 🎓 WHEN DOES IT APPEAR?
             * Only when detectedReportIntent is present on the message.
             * For high-confidence intents (>= 0.8), the PDF already opened
             * automatically — but the card still shows so the user can:
             *   • Re-open the PDF if they closed the tab
             *   • See exactly which parameters were extracted
             *   • Verify the intent detection was correct
             *
             * For medium-confidence (0.5–0.8), the card is the ONLY trigger —
             * the user must click the button to generate the PDF.
             */}
            {msg.role === "assistant" && msg.detectedReportIntent && (
              <ReportIntentCard
                intent={msg.detectedReportIntent}
                onGenerate={openReportPdf}
              />
            )}
          </Box>
        ))}

        {/* 🎓 Typing indicator — shown while RAG pipeline is processing */}
        {ragMutation.isPending && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 0.5,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 14, color: CHAT_COLORS.copper }} />
            <CircularProgress
              size={14}
              sx={{ color: CHAT_COLORS.copper }}
            />
            <Typography
              variant="caption"
              sx={{
                color: CHAT_COLORS.muted,
                fontSize: "0.72rem",
                fontStyle: "italic",
              }}
            >
              Searching & generating…
            </Typography>
          </Box>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>

      {/* ── Entity type filter chips ──────────────────── */}
      {/* 🎓 Let the user scope their search to a specific entity type.
          These map to the entityTypeFilter parameter on the backend. */}
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          display: "flex",
          gap: 0.5,
          flexWrap: "wrap",
          borderTop: `1px solid ${CHAT_COLORS.border}`,
          backgroundColor: CHAT_COLORS.surface,
        }}
      >
        {ENTITY_FILTERS.map((filter) => (
          <Chip
            key={filter.label}
            label={filter.label}
            size="small"
            onClick={() => setActiveFilter(filter.value)}
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 500,
              backgroundColor:
                activeFilter === filter.value
                  ? CHAT_COLORS.copperLight
                  : "transparent",
              color:
                activeFilter === filter.value
                  ? CHAT_COLORS.copper
                  : CHAT_COLORS.muted,
              border: `1px solid ${
                activeFilter === filter.value
                  ? CHAT_COLORS.copperGlow
                  : CHAT_COLORS.border
              }`,
              "&:hover": {
                backgroundColor: CHAT_COLORS.copperLight,
                color: CHAT_COLORS.copper,
              },
            }}
          />
        ))}
      </Box>

      {/* ── Input area ────────────────────────────────── */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTop: `1px solid ${CHAT_COLORS.border}`,
          backgroundColor: CHAT_COLORS.surface,
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          flexShrink: 0,
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={3}
          placeholder="Ask about your data…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={ragMutation.isPending}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: CHAT_COLORS.input,
              borderRadius: "10px",
              fontSize: "0.82rem",
              color: CHAT_COLORS.text,
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
            "& .MuiOutlinedInput-input::placeholder": {
              color: CHAT_COLORS.muted,
              opacity: 1,
            },
          }}
        />
        <Tooltip
          title="Search"
          slotProps={{ popper: { sx: { zIndex: 10000 } } }}
        >
          <span>
            <IconButton
              onClick={handleSend}
              disabled={!question.trim() || ragMutation.isPending}
              sx={{
                ...copperGlossButtonSx,
                width: 36,
                height: 36,
                borderRadius: "10px",
                "&.Mui-disabled": {
                  opacity: 0.4,
                },
              }}
            >
              <SendIcon
                sx={{ fontSize: 18, color: "#F3E9D6", position: "relative", zIndex: 1 }}
              />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* ── Resize handle (bottom-right) ──────────────── */}
      <Box
        onMouseDown={handleResizeBRStart}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: "se-resize",
          zIndex: 10,
        }}
      />
    </Box>
  );
}

// ─── Source evidence card sub-component ───────────────────────

/**
 * 🎓 A small card showing one source reference from the RAG pipeline.
 *
 * Displays:
 *   • Entity type badge (e.g. "Style", "Buyer")
 *   • Entity key (the primary key)
 *   • Relevance score as a percentage
 *   • Chunk preview text (first ~150 chars)
 *
 * These are the "citations" that make RAG trustworthy — users can
 * see exactly which records contributed to the AI's answer.
 */
function SourceCard({ source }: { source: RagSourceReference }) {
  /** 🎓 Convert cosine similarity (0–1) to a human-friendly percentage */
  const scorePercent = Math.round(source.score * 100);

  return (
    <Box
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: "8px",
        backgroundColor: CHAT_COLORS.sourceBg,
        border: `1px solid ${CHAT_COLORS.sourceBorder}`,
        transition: "all 0.15s ease",
        "&:hover": {
          borderColor: "rgba(45, 212, 191, 0.4)",
          backgroundColor: "rgba(45, 212, 191, 0.12)",
        },
      }}
    >
      {/* Top row: entity badge + key + score */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.25,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <SourceIcon
            sx={{ fontSize: 12, color: "rgba(45, 212, 191, 0.8)" }}
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "rgba(45, 212, 191, 0.9)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {source.entityType}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              fontWeight: 500,
              color: CHAT_COLORS.text,
            }}
          >
            {source.entityKey}
          </Typography>
        </Box>
        {/* 🎓 Relevance score — visual indicator of match quality */}
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            fontWeight: 600,
            color:
              scorePercent >= 75
                ? "rgba(74, 222, 128, 0.9)"
                : scorePercent >= 50
                  ? "rgba(250, 204, 21, 0.9)"
                  : CHAT_COLORS.muted,
          }}
        >
          {scorePercent}% match
        </Typography>
      </Box>

      {/* Chunk preview text */}
      {source.chunkPreview && (
        <Typography
          variant="caption"
          sx={{
            color: CHAT_COLORS.muted,
            fontSize: "0.65rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {source.chunkPreview}
        </Typography>
      )}
    </Box>
  );
}

// ─── Report Intent Action Card sub-component ────────────────────

/**
 * 🎓 An action card that appears when Claude detects a REPORT request.
 *
 * This is visually distinct from SourceCards (gold/amber vs teal) because
 * it serves a different purpose: it's not a citation, it's an ACTION trigger.
 *
 * The card displays:
 *   • PDF icon + report display name (e.g., "Trim Sheet Report")
 *   • Extracted parameters as tag-like chips (e.g., "Style: ANCHORAGE")
 *   • Confidence indicator
 *   • "Generate Report" button that opens the PDF in a new tab
 *
 * 🎓 WHY A SEPARATE COMPONENT?
 * Same reason as SourceCard — it keeps the main component's JSX clean
 * and makes the report action card independently testable and reusable.
 */
function ReportIntentCard({
  intent,
  onGenerate,
}: {
  intent: ReportIntentDetection;
  onGenerate: (intent: ReportIntentDetection) => void;
}) {
  /** 🎓 Convert confidence (0–1) to a percentage for display */
  const confidencePercent = Math.round(intent.confidence * 100);

  return (
    <Box
      sx={{
        mt: 0.75,
        maxWidth: "88%",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      {/* 🎓 Section label — distinguishes this from the source cards above */}
      <Typography
        variant="caption"
        sx={{
          color: CHAT_COLORS.reportText,
          fontSize: "0.65rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          px: 0.5,
        }}
      >
        Report Available
      </Typography>

      {/* The action card itself */}
      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderRadius: "10px",
          backgroundColor: CHAT_COLORS.reportBg,
          border: `1px solid ${CHAT_COLORS.reportBorder}`,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "rgba(234, 179, 8, 0.45)",
            backgroundColor: "rgba(234, 179, 8, 0.12)",
          },
        }}
      >
        {/* Top row: PDF icon + report name + confidence */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PictureAsPdfIcon
              sx={{ fontSize: 16, color: CHAT_COLORS.reportText }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: CHAT_COLORS.text,
              }}
            >
              {intent.displayName}
            </Typography>
          </Box>
          {/* 🎓 Confidence badge — green for high, amber for medium */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              fontWeight: 600,
              color:
                confidencePercent >= 80
                  ? "rgba(74, 222, 128, 0.9)"
                  : CHAT_COLORS.reportText,
            }}
          >
            {confidencePercent}% confident
          </Typography>
        </Box>

        {/* 🎓 Extracted parameters as small chips/tags
         * These show the user exactly what Claude extracted from their query,
         * so they can verify before generating. For example:
         *   Style: ANCHORAGE | Buyer: 5 | Order: 1017-18 | Type: 1
         */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 0.75,
          }}
        >
          {Object.entries(intent.parameters).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: "4px",
                backgroundColor: "rgba(234, 179, 8, 0.1)",
                border: "1px solid rgba(234, 179, 8, 0.15)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  color: CHAT_COLORS.muted,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    color: CHAT_COLORS.reportText,
                    mr: 0.25,
                    textTransform: "capitalize",
                  }}
                >
                  {/* 🎓 Convert camelCase param keys to readable labels
                   * e.g., "buyerCode" → "Buyer Code", "styleCode" → "Style Code"
                   */}
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </Box>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 🎓 "Generate Report" button
         * Uses the copper gloss style to match the send button, but with
         * a gold/amber tint to match the report intent theme.
         * Opens the PDF endpoint in a new browser tab via openReportPdf().
         */}
        <Box
          onClick={() => onGenerate(intent)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: "6px",
            backgroundColor: "rgba(234, 179, 8, 0.15)",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(234, 179, 8, 0.25)",
              borderColor: "rgba(234, 179, 8, 0.5)",
              boxShadow: "0 0 8px rgba(234, 179, 8, 0.2)",
            },
          }}
        >
          <OpenInNewIcon sx={{ fontSize: 14, color: CHAT_COLORS.reportText }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: CHAT_COLORS.reportText,
              letterSpacing: "0.02em",
            }}
          >
            Generate Report
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
