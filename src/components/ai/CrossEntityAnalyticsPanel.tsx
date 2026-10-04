// ─────────────────────────────────────────────────────────────────────────────
// 🎓 CROSS-ENTITY ANALYTICS PANEL
// Phase 2, Feature 1: Floating panel for running cross-entity AI analytics.
//
// 🎓 WHAT THIS COMPONENT DOES:
// Provides a UI for merchandisers to run AI-powered strategic analysis across
// ALL their data — not just one style, but every style, buyer, supplier, and
// order in the system. The user picks a category (e.g. "Material Consumption"),
// optionally types a follow-up question, and clicks "Run Analysis". The AI
// aggregates data from EF Core, builds a category-specific prompt, and returns
// a markdown-formatted analysis with patterns, outliers, and recommendations.
//
// 🎓 DESIGN DECISIONS:
// - FLOATING WINDOW — matches RagSearchPanel / AiChatWindow pattern. Fixed
//   position, bottom-right, drag handle, minimize pill, resize, close button.
// - Uses the copper theme (copperGlossButtonSx) to visually distinguish
//   AI analytics from other AI features (chat = sky blue, alerts = severity
//   colors, analytics = copper/bronze).
// - Close button in the header — follows the standing rule that every panel
//   must have a close button.
// - Markdown rendering uses dangerouslySetInnerHTML with a simple markdown-
//   to-HTML converter — the content comes from our own AI backend, not user
//   input, so XSS risk is minimal.
//
// 🎓 COMPONENT HIERARCHY:
//   CrossEntityAnalyticsPanel (this file)
//     └─ Drag handle header
//     └─ Category selector dropdown (populated from GET /categories)
//     └─ Optional user query text input
//     └─ "Run Analysis" button (triggers POST /analytics)
//     └─ Results display area (AI-generated analysis + metadata)
//     └─ Token usage footer (provider, model, tokens, cost)
//
// 🎓 REACT HOOKS FIX:
// All hooks (useState, useCallback, useMemo, useQuery, useMutation) are called
// BEFORE any conditional return. The `if (!isOpen) return null;` early exit
// is placed AFTER all hooks — this is required by React's Rules of Hooks.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MinimizeIcon from "@mui/icons-material/Remove";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
// 🎓 NEW: Icons for the Copy to Clipboard and Download as PDF buttons
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { toast } from "react-toastify";

import type {
  AnalyticsCategory,
  CrossEntityAnalyticsResponse,
} from "../../interfaces/ai/cross-entity-analytics.interfaces";
import {
  useAnalyticsCategories,
  useRunAnalytics,
} from "../../tanstack-hooks/ai/cross-entity-analytics.hooks";
import { copperGlossButtonSx, copperTextColor } from "../../themes/button-color-themes";

// ─── Theme tokens ────────────────────────────────────────────
// 🎓 Shared with other AI panels (AiChatWindow, RagSearchPanel).
// Duplicated here so the panel is self-contained. If the design
// system grows, these should move to a shared tokens file.
const PANEL_COLORS = {
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
  scrollTrack: "rgba(255, 255, 255, 0.02)",
  scrollThumb: "rgba(201, 128, 61, 0.3)",
};

// ─── Props ───────────────────────────────────────────────────
// 🎓 Same pattern as RagSearchPanel / AiChatWindow:
//   isOpen: parent controls visibility
//   onClose: called when user clicks close (X) button
interface CrossEntityAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Category icon mapping ───────────────────────────────────
// 🎓 Each category gets a distinctive emoji prefix so the user can
// quickly scan the dropdown and recognise categories at a glance.
const categoryIcons: Record<string, string> = {
  MATERIAL_CONSUMPTION: "🧵",
  SUPPLIER_PERFORMANCE: "🏭",
  BUYER_PORTFOLIO: "💼",
  ORDER_PIPELINE: "📦",
  COST_ANALYSIS: "💰",
};

// ─── Default panel dimensions ────────────────────────────────
// 🎓 The panel starts at a comfortable size for reading analytics.
// Wider than chat/RAG panels because analytics results are longer
// and contain tables/lists that benefit from horizontal space.
const DEFAULT_WIDTH = 520;
const DEFAULT_HEIGHT = 620;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 420;

// ─── Simple markdown → HTML converter ────────────────────────
// 🎓 WHY NOT USE A LIBRARY (react-markdown, marked)?
// The AI response uses basic markdown only: headers, bold, lists, and
// occasionally tables. A full markdown library would add ~40KB to the
// bundle for features we don't use. This lightweight converter handles
// the subset the AI actually produces.
//
// 🎓 SECURITY: The content comes from our own AI backend (Claude/GPT),
// not from user input, so XSS risk is minimal. We still sanitise
// angle brackets as a defence-in-depth measure.
const simpleMarkdownToHtml = (md: string): string => {
  return md
    // 🎓 Sanitise angle brackets (defence-in-depth)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // 🎓 Headers: ### → h3, ## → h2, # → h1
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-[#F4F6F8] mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-[#F4F6F8] mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-[#F4F6F8] mt-6 mb-2">$1</h1>')
    // 🎓 Bold: **text** → <strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#F4F6F8]">$1</strong>')
    // 🎓 Italic: *text* → <em>
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // 🎓 Unordered list items: - item → <li>
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[#C0C7D1]">$1</li>')
    // 🎓 Ordered list items: 1. item → <li>
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[#C0C7D1]">$1</li>')
    // 🎓 Horizontal rules: --- → <hr>
    .replace(/^---$/gm, '<hr class="border-[#2A3040] my-3" />')
    // 🎓 Line breaks: double newline → paragraph break
    .replace(/\n\n/g, '<div class="h-3"></div>')
    // 🎓 Single newlines → <br>
    .replace(/\n/g, "<br />");
};

// ─── PDF-friendly markdown → HTML converter ─────────────────
// 🎓 Similar to simpleMarkdownToHtml but uses print-friendly styles
// (black text, no dark-theme classes). Used by the PDF download handler
// to generate a clean, paper-ready HTML document.
const simpleMarkdownToHtmlForPdf = (md: string): string => {
  return md
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n\n/g, "<br /><br />")
    .replace(/\n/g, "<br />");
};

// ─── Main component ──────────────────────────────────────────

const CrossEntityAnalyticsPanel: React.FC<CrossEntityAnalyticsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  // ══════════════════════════════════════════════════════════════
  // 🎓 ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN!
  // React's Rules of Hooks require hooks to be called in the same
  // order on every render. Placing `if (!isOpen) return null;`
  // before hooks would cause them to be skipped on closed renders,
  // which crashes React with "Rendered fewer hooks than expected".
  // ══════════════════════════════════════════════════════════════

  // ── Local UI state ──────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<AnalyticsCategory | "">("");
  const [userQuery, setUserQuery] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  // 🎓 NEW: Copy button feedback — shows a ✓ check icon briefly after a
  // successful copy, then reverts back to the clipboard icon.
  const [isCopied, setIsCopied] = useState(false);

  // ── Drag state ──────────────────────────────────────────────
  // 🎓 The panel can be dragged by its header bar, matching
  // RagSearchPanel and AiChatWindow behaviour.
  const [position, setPosition] = useState({
    x: window.innerWidth - DEFAULT_WIDTH - 80,
    y: window.innerHeight - DEFAULT_HEIGHT - 80,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // ── Resize state ────────────────────────────────────────────
  // 🎓 IMPROVED RESIZE: Now tracks WHICH edge/corner is being dragged so
  // we can resize from any direction. The `resizeDirection` tells the
  // mousemove handler which axes to adjust and which panel edge to anchor.
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  // 🎓 Which edge(s) are being dragged: "n", "s", "e", "w", "nw", "ne", "sw", "se"
  const resizeDirection = useRef("");

  // ── TanStack hooks ──────────────────────────────────────────
  // 🎓 useAnalyticsCategories: fetches the category list once (5-min stale time)
  // 🎓 useRunAnalytics: mutation that triggers the AI analysis on demand
  const {
    data: categories,
    isLoading: isCategoriesLoading,
  } = useAnalyticsCategories(isOpen);

  const {
    mutate: runAnalyticsMutation,
    data: analyticsResult,
    isPending: isAnalysisRunning,
    isError: isAnalysisError,
    error: analysisError,
    reset: resetAnalysis,
  } = useRunAnalytics();

  // ── Derived state ───────────────────────────────────────────
  // 🎓 Find the selected category's info for displaying its description
  const selectedCategoryInfo = useMemo(() => {
    if (!selectedCategory || !categories) return null;
    return categories.find((c) => c.key === selectedCategory) ?? null;
  }, [selectedCategory, categories]);

  // ── Handlers ────────────────────────────────────────────────

  // 🎓 handleRunAnalysis: validates selection, triggers the mutation.
  const handleRunAnalysis = useCallback(() => {
    if (!selectedCategory) {
      toast.warning("Please select an analytics category first.");
      return;
    }
    resetAnalysis();
    runAnalyticsMutation(
      {
        category: selectedCategory,
        userQuery: userQuery.trim() || undefined,
      },
      {
        onError: (err) => {
          toast.error(`Analytics failed: ${err.message || "Unknown error"}`);
        },
      },
    );
  }, [selectedCategory, userQuery, runAnalyticsMutation, resetAnalysis]);

  // 🎓 handleCategoryChange: when the user picks a different category,
  // clear any previous result so stale data doesn't linger.
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value as AnalyticsCategory | "");
      resetAnalysis();
    },
    [resetAnalysis],
  );

  // ── Copy to clipboard handler ────────────────────────────────
  // 🎓 NEW: Copies the raw AI analysis markdown to the system clipboard.
  // Uses navigator.clipboard.writeText() (available in all modern browsers).
  // Shows a brief ✓ check icon for 2 seconds as visual feedback.
  const handleCopyToClipboard = useCallback(async () => {
    if (!analyticsResult) return;
    try {
      await navigator.clipboard.writeText(analyticsResult.analysis);
      setIsCopied(true);
      toast.success("Analysis copied to clipboard!");
      // 🎓 Revert the icon back to clipboard after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // 🎓 Fallback for older browsers or restricted contexts:
      // create a temporary textarea, select it, and exec copy.
      try {
        const textarea = document.createElement("textarea");
        textarea.value = analyticsResult.analysis;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setIsCopied(true);
        toast.success("Analysis copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        toast.error("Failed to copy. Please select the text manually.");
      }
    }
  }, [analyticsResult]);

  // ── Download as PDF handler ────────────────────────────────
  // 🎓 NEW: Opens a styled print preview window with the formatted analysis.
  // The user can then "Save as PDF" or print directly. This approach is
  // zero-dependency — no jsPDF or html2canvas needed. The print window
  // uses clean styling optimised for paper/PDF output.
  //
  // 🎓 WHY NOT jsPDF?
  // Adding jsPDF + html2canvas would add ~200KB to the bundle. The browser's
  // native print-to-PDF produces better quality output with proper text
  // selection, links, and pagination. Every modern browser supports this.
  const handleDownloadPdf = useCallback(() => {
    if (!analyticsResult) return;

    // 🎓 Build a standalone HTML document with the analysis content,
    // styled for clean PDF output (white background, readable fonts).
    const categoryName = selectedCategoryInfo?.name ?? analyticsResult.category;
    const generatedDate = new Date(analyticsResult.generatedAt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${categoryName} — Cross-Entity Analytics</title>
        <style>
          /* 🎓 PDF-optimised styling: clean, professional, printable */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #1a1a1a;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 { font-size: 20px; margin-bottom: 4px; color: #111; }
          h2 { font-size: 16px; margin-top: 20px; margin-bottom: 8px; color: #222; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
          h3 { font-size: 14px; margin-top: 16px; margin-bottom: 6px; color: #333; }
          p { margin-bottom: 8px; }
          ul, ol { margin-left: 20px; margin-bottom: 8px; }
          li { margin-bottom: 4px; }
          hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
          strong { color: #111; }
          .header { border-bottom: 2px solid #C9803D; padding-bottom: 12px; margin-bottom: 20px; }
          .header .category { color: #C9803D; font-weight: 600; font-size: 14px; }
          .header .meta { font-size: 11px; color: #666; margin-top: 6px; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #888; }
          .user-query { background: #f8f4ef; border-left: 3px solid #C9803D; padding: 8px 12px; margin-bottom: 16px; font-style: italic; color: #555; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 11px; }
          th { background: #f5f5f5; font-weight: 600; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${categoryIcons[analyticsResult.category] ?? "📊"} ${categoryName}</h1>
          <div class="category">Cross-Entity Analytics Report</div>
          <div class="meta">
            ${analyticsResult.entityCount} entities analysed &nbsp;|&nbsp;
            Generated: ${generatedDate} &nbsp;|&nbsp;
            Provider: ${analyticsResult.provider} (${analyticsResult.model})
          </div>
        </div>
        ${userQuery.trim() ? `<div class="user-query"><strong>Question:</strong> ${userQuery.trim()}</div>` : ""}
        <div class="content">${simpleMarkdownToHtmlForPdf(analyticsResult.analysis)}</div>
        <div class="footer">
          Tokens: ${analyticsResult.totalTokens.toLocaleString()} (${analyticsResult.inputTokens.toLocaleString()} in / ${analyticsResult.outputTokens.toLocaleString()} out)
          &nbsp;|&nbsp; Estimated cost: $${analyticsResult.estimatedCost.toFixed(4)}
          &nbsp;|&nbsp; ApparelPro Cross-Entity Analytics
        </div>
      </body>
      </html>
    `;

    // 🎓 Open a new window, write the HTML, and trigger the print dialog.
    // The user sees "Save as PDF" in the print dialog on all modern browsers.
    const printWindow = window.open("", "_blank", "width=850,height=700");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // 🎓 Small delay to let the DOM render before triggering print
      setTimeout(() => printWindow.print(), 400);
    } else {
      toast.error("Pop-up blocked. Please allow pop-ups for this site to download PDF.");
    }
  }, [analyticsResult, selectedCategoryInfo, userQuery]);

  // ── Drag handlers ───────────────────────────────────────────
  // 🎓 Matches AiChatWindow / RagSearchPanel drag-handle pattern.
  const handleDragStart = useCallback(
    (e: ReactMouseEvent) => {
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    },
    [position],
  );

  // ── Resize handlers ─────────────────────────────────────────
  // 🎓 IMPROVED: Now accepts a `direction` string so each edge/corner
  // can initiate resize independently. The direction is stored in a ref
  // and read by the mousemove handler to determine which axes to adjust.
  const handleResizeStart = useCallback(
    (direction: string) => (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeDirection.current = direction;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: size.width,
        h: size.height,
        px: position.x,
        py: position.y,
      };
    },
    [size, position],
  );

  // 🎓 Global mouse listeners for drag and resize — attached/detached
  // via useEffect so we clean up properly and avoid memory leaks.
  //
  // 🎓 IMPROVED RESIZE LOGIC:
  // Now supports 8 resize directions (n, s, e, w, nw, ne, sw, se).
  // Each direction adjusts the relevant axis and repositions the panel
  // so the OPPOSITE edge stays anchored (e.g. dragging "se" grows the
  // panel downward-right while the top-left corner stays fixed).
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 100)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 60)),
        });
      }
      if (isResizing) {
        const dir = resizeDirection.current;
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;

        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.px;
        let newY = resizeStart.current.py;

        // 🎓 East edge: width grows with mouse movement, position stays
        if (dir.includes("e")) {
          newW = Math.max(MIN_WIDTH, resizeStart.current.w + dx);
        }
        // 🎓 West edge: width grows OPPOSITE to mouse, position shifts left
        if (dir.includes("w")) {
          newW = Math.max(MIN_WIDTH, resizeStart.current.w - dx);
          newX = resizeStart.current.px + (resizeStart.current.w - newW);
        }
        // 🎓 South edge: height grows with mouse movement, position stays
        if (dir === "s" || dir === "se" || dir === "sw") {
          newH = Math.max(MIN_HEIGHT, resizeStart.current.h + dy);
        }
        // 🎓 North edge: height grows OPPOSITE to mouse, position shifts up
        if (dir === "n" || dir === "nw" || dir === "ne") {
          newH = Math.max(MIN_HEIGHT, resizeStart.current.h - dy);
          newY = resizeStart.current.py + (resizeStart.current.h - newH);
        }

        setSize({ width: newW, height: newH });
        setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      resizeDirection.current = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  // ══════════════════════════════════════════════════════════════
  // 🎓 CONDITIONAL RETURN — placed AFTER all hooks (React Rules)
  // ══════════════════════════════════════════════════════════════
  if (!isOpen) return null;

  // ── Minimized pill ──────────────────────────────────────────
  // 🎓 When minimized, show a small pill at the bottom-right that
  // the user can click to restore. Matches RAG/Chat pattern.
  if (isMinimized) {
    return (
      <Box
        onClick={() => setIsMinimized(false)}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: "20px",
          cursor: "pointer",
          backgroundColor: PANEL_COLORS.surface,
          border: `1px solid ${PANEL_COLORS.copperGlow}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 12px ${PANEL_COLORS.copperGlow}`,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: `0 6px 24px rgba(0,0,0,0.6), 0 0 18px ${PANEL_COLORS.copperGlow}`,
          },
        }}
      >
        <AnalyticsOutlinedIcon sx={{ fontSize: 18, color: PANEL_COLORS.copper }} />
        <span style={{ color: PANEL_COLORS.text, fontSize: 13, fontWeight: 500 }}>
          Analytics
        </span>
        {/* 🎓 Show a running indicator if analysis is in progress while minimized */}
        {isAnalysisRunning && (
          <CircularProgress size={14} sx={{ color: PANEL_COLORS.copper, ml: 0.5 }} />
        )}
      </Box>
    );
  }

  // ── Full panel render ───────────────────────────────────────
  return (
    <Box
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: PANEL_COLORS.canvas,
        border: `1px solid ${PANEL_COLORS.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 1px ${PANEL_COLORS.copperGlow}`,
        // 🎓 Disable text selection while dragging/resizing
        userSelect: isDragging || isResizing ? "none" : "auto",
      }}
    >
      {/* ── Edge resize handles (all 4 edges + 4 corners) ────── */}
      {/* 🎓 IMPROVED RESIZE: Invisible hotspots on every edge and corner.
          Each one is a 6px strip (edges) or 12×12 square (corners) that
          shows the correct resize cursor on hover and initiates resize
          in the appropriate direction when dragged. This makes the panel
          resizable from ANY side — the standard window resize UX users expect. */}
      {/* North edge */}
      <Box onMouseDown={handleResizeStart("n")} sx={{ position: "absolute", top: 0, left: 12, right: 12, height: 6, cursor: "n-resize", zIndex: 10 }} />
      {/* South edge */}
      <Box onMouseDown={handleResizeStart("s")} sx={{ position: "absolute", bottom: 0, left: 12, right: 12, height: 6, cursor: "s-resize", zIndex: 10 }} />
      {/* West edge */}
      <Box onMouseDown={handleResizeStart("w")} sx={{ position: "absolute", top: 12, bottom: 12, left: 0, width: 6, cursor: "w-resize", zIndex: 10 }} />
      {/* East edge */}
      <Box onMouseDown={handleResizeStart("e")} sx={{ position: "absolute", top: 12, bottom: 12, right: 0, width: 6, cursor: "e-resize", zIndex: 10 }} />
      {/* NW corner */}
      <Box onMouseDown={handleResizeStart("nw")} sx={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, cursor: "nw-resize", zIndex: 11 }} />
      {/* NE corner */}
      <Box onMouseDown={handleResizeStart("ne")} sx={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, cursor: "ne-resize", zIndex: 11 }} />
      {/* SW corner */}
      <Box onMouseDown={handleResizeStart("sw")} sx={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, cursor: "sw-resize", zIndex: 11 }} />
      {/* SE corner — VISIBLE grip indicator */}
      {/* 🎓 The bottom-right corner gets a visible triangular grip so
          users can discover that the panel is resizable. This is the
          standard resize affordance (like browser textarea grips).
          Three small diagonal lines form the grip visual. */}
      <Box
        onMouseDown={handleResizeStart("se")}
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 20,
          height: 20,
          cursor: "se-resize",
          zIndex: 11,
          // 🎓 Three diagonal lines — classic resize grip indicator
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 12,
            height: 12,
            borderRight: `2px solid ${PANEL_COLORS.copperGlow}`,
            borderBottom: `2px solid ${PANEL_COLORS.copperGlow}`,
            borderRadius: "0 0 4px 0",
            opacity: 0.7,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 3,
            right: 3,
            width: 6,
            height: 6,
            borderRight: `2px solid ${PANEL_COLORS.copperGlow}`,
            borderBottom: `2px solid ${PANEL_COLORS.copperGlow}`,
            opacity: 0.7,
          },
          "&:hover::before, &:hover::after": {
            borderColor: PANEL_COLORS.copper,
            opacity: 1,
          },
        }}
      />

      {/* ── Header / drag bar ────────────────────────────────── */}
      {/* 🎓 Draggable header bar — matches AiChatWindow / RagSearchPanel.
          Contains: drag indicator, title, minimize & close buttons. */}
      <Box
        onMouseDown={handleDragStart}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.2,
          cursor: isDragging ? "grabbing" : "grab",
          backgroundColor: PANEL_COLORS.surface,
          borderBottom: `1px solid ${PANEL_COLORS.border}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* 🎓 Drag indicator — visual hint that the header is draggable */}
          <DragIndicatorIcon sx={{ fontSize: 16, color: PANEL_COLORS.muted, opacity: 0.5 }} />
          <AnalyticsOutlinedIcon sx={{ color: copperTextColor, fontSize: 20 }} />
          <span style={{ color: copperTextColor, fontSize: 14, fontWeight: 600 }}>
            Cross-Entity Analytics
          </span>
          <span style={{ color: PANEL_COLORS.muted, fontSize: 11, marginLeft: 4 }}>
            AI-Powered
          </span>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
          {/* 🎓 MINIMIZE BUTTON — shrinks panel to a pill */}
          <Tooltip title="Minimize">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              size="small"
              sx={{ color: PANEL_COLORS.muted, "&:hover": { color: PANEL_COLORS.text } }}
            >
              <MinimizeIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* 🎓 CLOSE BUTTON — standing rule: every panel must have one */}
          <Tooltip title="Close analytics panel">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              size="small"
              sx={{ color: PANEL_COLORS.muted, "&:hover": { color: "#ef4444" } }}
            >
              <CancelOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Body ─────────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: 2,
          gap: 2,
        }}
      >
        {/* ── Category selector + query input ────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexShrink: 0 }}>
          {/* Row 1: Category + Run button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* 🎓 Category dropdown — populated from GET /api/ai/analytics/categories */}
            <Box sx={{ flex: 1 }}>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={isCategoriesLoading || isAnalysisRunning}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  outline: "none",
                  backgroundColor: PANEL_COLORS.input,
                  color: selectedCategory ? PANEL_COLORS.text : PANEL_COLORS.muted,
                  border: `1px solid ${selectedCategory ? copperTextColor : "#2A3040"}`,
                  cursor: isCategoriesLoading ? "wait" : "pointer",
                }}
              >
                <option value="" disabled>
                  {isCategoriesLoading
                    ? "Loading categories..."
                    : "Select an analytics category"}
                </option>
                {categories?.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {categoryIcons[cat.key] ?? "📊"} {cat.name}
                  </option>
                ))}
              </select>
            </Box>

            {/* 🎓 Run Analysis button — copper glass-bottle style */}
            <button
              onClick={handleRunAnalysis}
              disabled={!selectedCategory || isAnalysisRunning}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: !selectedCategory || isAnalysisRunning ? "not-allowed" : "pointer",
                opacity: !selectedCategory || isAnalysisRunning ? 0.4 : 1,
                transition: "all 0.2s ease",
                ...copperGlossButtonSx,
              }}
            >
              {isAnalysisRunning ? (
                <>
                  <CircularProgress size={14} sx={{ color: "#F3E9D6" }} />
                  <span>Analysing...</span>
                </>
              ) : (
                <>
                  <AutoAwesomeIcon sx={{ fontSize: 14 }} />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </Box>

          {/* 🎓 Category description — shows what the selected category analyses */}
          {selectedCategoryInfo && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "8px",
                backgroundColor: PANEL_COLORS.copperLight,
                border: `1px solid ${PANEL_COLORS.copperGlow}`,
              }}
            >
              <InfoOutlinedIcon
                sx={{ color: copperTextColor, fontSize: 14, mt: "2px" }}
              />
              <span style={{ fontSize: 11, color: PANEL_COLORS.muted }}>
                {selectedCategoryInfo.description}
              </span>
            </Box>
          )}

          {/* Row 2: Optional user query */}
          <Box sx={{ position: "relative" }}>
            <SearchIcon
              sx={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: PANEL_COLORS.muted,
                fontSize: 16,
              }}
            />
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                // 🎓 Enter key triggers analysis — same UX as the chat window
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleRunAnalysis();
                }
              }}
              disabled={isAnalysisRunning}
              placeholder="Optional: Ask a specific question..."
              style={{
                width: "100%",
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
                backgroundColor: PANEL_COLORS.input,
                color: PANEL_COLORS.text,
                border: "1px solid #2A3040",
                boxSizing: "border-box",
              }}
            />
          </Box>
        </Box>

        {/* ── Results area ───────────────────────────────────── */}
        {/* 🎓 Four states: empty, loading, error, result */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            borderRadius: "12px",
            p: 2,
            backgroundColor: PANEL_COLORS.surface,
            // 🎓 Custom scrollbar matching other panels
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-track": { background: PANEL_COLORS.scrollTrack },
            "&::-webkit-scrollbar-thumb": {
              background: PANEL_COLORS.scrollThumb,
              borderRadius: 3,
            },
          }}
        >
          {/* State 1: Empty — no result yet */}
          {!analyticsResult && !isAnalysisRunning && !isAnalysisError && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1.5,
                color: PANEL_COLORS.muted,
              }}
            >
              <AnalyticsOutlinedIcon sx={{ fontSize: 48, opacity: 0.2 }} />
              <p style={{ fontSize: 13, textAlign: "center", maxWidth: 280 }}>
                Select a category and click{" "}
                <strong style={{ color: copperTextColor }}>Run Analysis</strong> to
                generate AI-powered strategic insights across your entire dataset.
              </p>
              <p style={{ fontSize: 11, opacity: 0.5 }}>
                Analysis covers all active styles, orders, buyers, and suppliers.
              </p>
            </Box>
          )}

          {/* State 2: Loading — analysis in progress */}
          {isAnalysisRunning && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress size={36} sx={{ color: copperTextColor }} />
              <Box sx={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, color: PANEL_COLORS.text }}>
                  Running {selectedCategoryInfo?.name ?? "analytics"}...
                </p>
                <p style={{ fontSize: 11, color: PANEL_COLORS.muted, marginTop: 4 }}>
                  Aggregating data and generating AI analysis. This may take 10-20 seconds.
                </p>
              </Box>
            </Box>
          )}

          {/* State 3: Error — analysis failed */}
          {isAnalysisError && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 1.5,
              }}
            >
              <Box sx={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>
                <p style={{ fontWeight: 600 }}>Analysis failed</p>
                <p style={{ fontSize: 11, color: PANEL_COLORS.muted, marginTop: 4 }}>
                  {analysisError?.message || "An unexpected error occurred. Please try again."}
                </p>
              </Box>
              <button
                onClick={handleRunAnalysis}
                style={{
                  fontSize: 12,
                  padding: "6px 14px",
                  borderRadius: 6,
                  backgroundColor: PANEL_COLORS.input,
                  color: copperTextColor,
                  border: `1px solid ${copperTextColor}40`,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </Box>
          )}

          {/* State 4: Result — AI analysis rendered */}
          {analyticsResult && !isAnalysisRunning && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* 🎓 Result header — category name + action buttons + entity count badge */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span style={{ fontSize: 16 }}>
                    {categoryIcons[analyticsResult.category] ?? "📊"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: PANEL_COLORS.text }}>
                    {selectedCategoryInfo?.name ?? analyticsResult.category}
                  </span>
                </Box>

                {/* 🎓 NEW: Action buttons row — Copy + PDF + entity count badge */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {/* 🎓 COPY TO CLIPBOARD BUTTON
                      Copies the raw markdown analysis to the system clipboard.
                      Shows a ✓ check icon for 2 seconds after a successful copy
                      to give the user visual confirmation that it worked. */}
                  <Tooltip title={isCopied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                      onClick={handleCopyToClipboard}
                      size="small"
                      sx={{
                        color: isCopied ? "#22c55e" : PANEL_COLORS.muted,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          color: isCopied ? "#22c55e" : copperTextColor,
                          backgroundColor: "rgba(201, 128, 61, 0.1)",
                        },
                      }}
                    >
                      {isCopied ? (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {/* 🎓 DOWNLOAD AS PDF BUTTON
                      Opens a styled print preview window with the formatted analysis.
                      The user clicks "Save as PDF" in the browser's print dialog.
                      Zero dependencies — uses the browser's native print engine. */}
                  <Tooltip title="Download as PDF">
                    <IconButton
                      onClick={handleDownloadPdf}
                      size="small"
                      sx={{
                        color: PANEL_COLORS.muted,
                        "&:hover": {
                          color: copperTextColor,
                          backgroundColor: "rgba(201, 128, 61, 0.1)",
                        },
                      }}
                    >
                      <PictureAsPdfOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>

                  {/* 🎓 Entity count badge */}
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 10px",
                      borderRadius: 12,
                      backgroundColor: `${copperTextColor}20`,
                      color: copperTextColor,
                      marginLeft: 4,
                    }}
                  >
                    {analyticsResult.entityCount} entities analysed
                  </span>
                </Box>
              </Box>

              {/* 🎓 User's question (if they typed one) */}
              {userQuery.trim() && (
                <Box
                  sx={{
                    fontSize: 11,
                    px: 1.5,
                    py: 1,
                    borderRadius: "8px",
                    backgroundColor: PANEL_COLORS.copperLight,
                    border: `1px solid #2A3040`,
                    color: PANEL_COLORS.muted,
                  }}
                >
                  <span style={{ color: copperTextColor }}>Q:</span>{" "}
                  {userQuery.trim()}
                </Box>
              )}

              {/* 🎓 AI-generated analysis — rendered as HTML from markdown */}
              <div
                className="text-sm text-[#C0C7D1] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: simpleMarkdownToHtml(analyticsResult.analysis),
                }}
              />

              {/* 🎓 Token usage footer — AI provider, model, cost */}
              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "8px 16px",
                  fontSize: 10,
                  color: PANEL_COLORS.muted,
                  borderTop: "1px solid #2A3040",
                }}
              >
                <span>
                  Provider: <strong style={{ color: "#C0C7D1" }}>{analyticsResult.provider}</strong>
                </span>
                <span>
                  Model: <strong style={{ color: "#C0C7D1" }}>{analyticsResult.model}</strong>
                </span>
                <span>
                  Tokens: <strong style={{ color: "#C0C7D1" }}>
                    {analyticsResult.totalTokens.toLocaleString()}
                  </strong>{" "}
                  ({analyticsResult.inputTokens.toLocaleString()} in /{" "}
                  {analyticsResult.outputTokens.toLocaleString()} out)
                </span>
                <span>
                  Cost: <strong style={{ color: "#C0C7D1" }}>
                    ${analyticsResult.estimatedCost.toFixed(4)}
                  </strong>
                </span>
                <span>
                  Generated: <strong style={{ color: "#C0C7D1" }}>
                    {new Date(analyticsResult.generatedAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </span>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CrossEntityAnalyticsPanel;
