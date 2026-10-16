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
// 🎓 jsPDF — generates real downloadable PDF files client-side.
// Replaces the old window.print() approach that opened a print preview.
// Now triggers an automatic .pdf file download — matching PredictionsDashboard.
import { jsPDF } from "jspdf";

import type {
  AnalyticsCategory,
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

// ─── PDF download helper (jsPDF) ────────────────────────────
// 🎓 REAL PDF GENERATION using jsPDF — replaces the old window.print() approach.
// Matches the same architecture as PredictionsDashboard's downloadAsPdf().
//
// 🎓 KEY FEATURES:
//   1. COLORED DOTS — emoji circles (🔴🟢🟡🟠) are replaced with tokens {R} {G}
//      and rendered as actual colored filled circles via doc.circle().
//   2. WORD WRAPPING — all text is word-wrapped via jsPDF's splitTextToSize().
//   3. MARKDOWN TABLES — detected by | delimiters, rendered as key:value rows.
//   4. BLOCKQUOTES — rendered with copper left bar + indented text.
//   5. AUTO-PAGINATION — new pages added automatically when cursor nears bottom.
function downloadAnalyticsAsPdf(
  analysis: string,
  category: string,
  categoryName: string,
  entityCount: number,
  provider: string,
  model: string,
  totalTokens: number,
  inputTokens: number,
  outputTokens: number,
  estimatedCost: number,
  userQueryText: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let cursorY = marginTop;

  // ── Emoji → dot token replacement ──────────────────────
  // 🎓 Helvetica has no emoji glyphs — they render as garbled boxes.
  // Replace colored circle emojis with {R} {G} {Y} {O} tokens.
  // drawLineWithDots() later renders these as colored filled circles.
  function replaceEmojis(text: string): string {
    return text
      .replace(/\u{1F534}/gu, "{R} ")
      .replace(/\u{1F7E2}/gu, "{G} ")
      .replace(/\u{1F7E1}/gu, "{Y} ")
      .replace(/\u{1F7E0}/gu, "{O} ")
      .replace(/\u{1F7E3}/gu, "{P} ")
      .replace(/\u{1F535}/gu, "{B} ")
      .replace(/✅/g, "{G} ")
      .replace(/❌/g, "{R} ")
      .replace(/⚠️?/g, "{Y} ")
      .replace(/↑/g, "^").replace(/↓/g, "v")
      .replace(/→/g, "->").replace(/←/g, "<-")
      .replace(/\u{1F4CA}/gu, "[CHART]")
      .replace(/\u{1F4C8}/gu, "[UP]")
      .replace(/\u{1F4C9}/gu, "[DOWN]")
      .replace(/\u{1F6A8}/gu, "[ALERT]")
      .replace(/\u{1F50D}/gu, "")
      .replace(/\u{2139}️?/gu, "[i]")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "");
  }

  // ── Dot color map ──────────────────────────────────────
  const DOT_COLORS: Record<string, [number, number, number]> = {
    R: [220, 38, 38],
    G: [22, 163, 74],
    Y: [234, 179, 8],
    O: [234, 88, 12],
    P: [147, 51, 234],
    B: [37, 99, 235],
  };

  // ── Helpers ────────────────────────────────────────────
  function ensureSpace(neededMm: number) {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  }

  function stripMd(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
  }

  function wrapText(text: string, maxWidth: number): string[] {
    return doc.splitTextToSize(text, maxWidth) as string[];
  }

  // 🎓 Draw a single line with inline colored dots.
  // Scans for {R} {G} {Y} etc. tokens and renders filled circles.
  function drawLineWithDots(line: string, x: number, y: number, textR: number, textG: number, textB: number) {
    const dotRegex = /\{([RGYOPB])\}/g;
    let currentX = x;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = dotRegex.exec(line)) !== null) {
      const beforeText = line.slice(lastIdx, match.index);
      if (beforeText) {
        doc.setTextColor(textR, textG, textB);
        doc.text(beforeText, currentX, y);
        currentX += doc.getTextWidth(beforeText);
      }
      const colorKey = match[1];
      const [cr, cg, cb] = DOT_COLORS[colorKey] ?? [100, 100, 100];
      const dotRadius = 1.2;
      doc.setFillColor(cr, cg, cb);
      doc.circle(currentX + dotRadius + 0.3, y - dotRadius * 0.6, dotRadius, "F");
      currentX += dotRadius * 2 + 1.2;
      lastIdx = match.index + match[0].length;
    }

    const remaining = line.slice(lastIdx);
    if (remaining) {
      doc.setTextColor(textR, textG, textB);
      doc.text(remaining, currentX, y);
    }
  }

  // 🎓 Draw a block of text with word-wrapping AND inline colored dots.
  function drawWrappedBlock(text: string, x: number, maxW: number, fontSize: number, lineH: number, r: number, g: number, b: number, style: string = "normal") {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(r, g, b);
    const clean = stripMd(text);
    const lines = wrapText(clean, maxW);
    for (const ln of lines) {
      ensureSpace(lineH);
      drawLineWithDots(ln, x, cursorY, r, g, b);
      cursorY += lineH;
    }
  }

  // ══════════════════════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════════════════════
  doc.setFontSize(10);
  doc.setTextColor(201, 128, 61);
  doc.text("ApparelPro AI", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 8;

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  const titleText = `Cross-Entity Analytics: ${categoryName}`;
  const titleLines = wrapText(titleText, contentWidth - 20);
  for (const tl of titleLines) {
    doc.text(tl, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 8;
  }

  // 🎓 Copper accent line
  doc.setDrawColor(201, 128, 61);
  doc.setLineWidth(0.8);
  doc.line(marginLeft + 20, cursorY, pageWidth - marginRight - 20, cursorY);
  cursorY += 6;

  // 🎓 Subtitle — entity count, date, provider
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const subtitle = `${entityCount} entities analysed  |  ${provider} (${model})  |  ${new Date().toLocaleDateString()}`;
  doc.text(subtitle, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 10;

  // 🎓 User query (if present)
  if (userQueryText.trim()) {
    ensureSpace(12);
    doc.setDrawColor(201, 128, 61);
    doc.setFillColor(201, 128, 61);
    doc.rect(marginLeft, cursorY - 3.5, 1.5, 8, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const queryLines = wrapText(`Question: ${userQueryText.trim()}`, contentWidth - 12);
    for (const ql of queryLines) {
      ensureSpace(5);
      doc.text(ql, marginLeft + 6, cursorY);
      cursorY += 5;
    }
    doc.setFont("helvetica", "normal");
    cursorY += 4;
  }

  // ══════════════════════════════════════════════════════════
  // BODY — Parse and render the markdown analysis
  // ══════════════════════════════════════════════════════════
  const cleanedAnalysis = replaceEmojis(analysis);
  const allLines = cleanedAnalysis.split("\n");

  let inTable = false;
  let tableHeaders: string[] = [];

  for (let li = 0; li < allLines.length; li++) {
    const line = allLines[li].trim();

    if (!line) {
      inTable = false;
      tableHeaders = [];
      cursorY += 3;
      continue;
    }

    // ── Horizontal rule ─────────────────────────────────
    if (/^[-*_]{3,}$/.test(line)) {
      inTable = false;
      ensureSpace(6);
      cursorY += 3;
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
      cursorY += 4;
      continue;
    }

    // ── Markdown table row ──────────────────────────────
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;

      if (!inTable) {
        inTable = true;
        tableHeaders = cells.map((c) => stripMd(c));
        ensureSpace(7);
        cursorY += 2;
        const headerText = tableHeaders.join("  |  ");
        drawWrappedBlock(headerText, marginLeft, contentWidth, 9, 4.5, 201, 128, 61, "bold");
        doc.setDrawColor(201, 128, 61);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
        cursorY += 2;
      } else {
        let rowText: string;
        if (tableHeaders.length > 0 && tableHeaders.length === cells.length) {
          const pairs = cells.map((cell, idx) => `${tableHeaders[idx]}: ${stripMd(cell)}`);
          rowText = pairs.join("  |  ");
        } else {
          rowText = cells.map((c) => stripMd(c)).join("  |  ");
        }
        drawWrappedBlock(rowText, marginLeft + 2, contentWidth - 4, 8.5, 4, 50, 50, 50);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
        cursorY += 1.5;
      }
      continue;
    }

    inTable = false;
    tableHeaders = [];

    // ── Blockquote ──────────────────────────────────────
    if (line.startsWith("> ")) {
      const quoteText = line.slice(2);
      ensureSpace(8);
      const quoteClean = stripMd(quoteText);
      doc.setFontSize(10);
      const quoteLines = wrapText(quoteClean, contentWidth - 12);
      const quoteHeight = quoteLines.length * 5;
      doc.setDrawColor(201, 128, 61);
      doc.setFillColor(201, 128, 61);
      doc.rect(marginLeft, cursorY - 3.5, 1.5, quoteHeight + 1, "F");
      doc.setFont("helvetica", "italic");
      doc.setTextColor(80, 80, 80);
      for (const ql of quoteLines) {
        ensureSpace(5);
        drawLineWithDots(ql, marginLeft + 6, cursorY, 80, 80, 80);
        cursorY += 5;
      }
      doc.setFont("helvetica", "normal");
      cursorY += 2;
      continue;
    }

    // ── Heading ####: h4 ────────────────────────────────
    if (line.startsWith("#### ")) {
      const headingText = stripMd(line.slice(5));
      ensureSpace(8);
      cursorY += 3;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 12, 5.5, 139, 94, 60, "bold");
      cursorY += 2;
      continue;
    }

    // ── Heading ###: h3 ─────────────────────────────────
    if (line.startsWith("### ")) {
      const headingText = stripMd(line.slice(4));
      ensureSpace(10);
      cursorY += 4;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 13, 6, 139, 94, 60, "bold");
      cursorY += 2;
      continue;
    }

    // ── Heading ##: h2 ──────────────────────────────────
    if (line.startsWith("## ")) {
      const headingText = stripMd(line.slice(3));
      ensureSpace(12);
      cursorY += 5;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 15, 7, 201, 128, 61, "bold");
      cursorY += 3;
      continue;
    }

    // ── Heading #: h1 ───────────────────────────────────
    if (line.startsWith("# ")) {
      const headingText = stripMd(line.slice(2));
      ensureSpace(14);
      cursorY += 6;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 16, 7.5, 201, 128, 61, "bold");
      cursorY += 3;
      continue;
    }

    // ── Bullet list item ────────────────────────────────
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const itemText = stripMd(bulletMatch[1]);
      ensureSpace(6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      doc.text("-", marginLeft + 3, cursorY);
      const indentX = marginLeft + 8;
      const indentW = contentWidth - 8;
      const wrapped = wrapText(itemText, indentW);
      for (const wl of wrapped) {
        ensureSpace(5);
        drawLineWithDots(wl, indentX, cursorY, 50, 50, 50);
        cursorY += 5;
      }
      cursorY += 1;
      continue;
    }

    // ── Numbered list item ──────────────────────────────
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const itemText = stripMd(numberedMatch[2]);
      ensureSpace(6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(`${num}.`, marginLeft + 3, cursorY);
      doc.setFont("helvetica", "normal");
      const indentX = marginLeft + 10;
      const indentW = contentWidth - 10;
      const wrapped = wrapText(itemText, indentW);
      for (const wl of wrapped) {
        ensureSpace(5);
        drawLineWithDots(wl, indentX, cursorY, 50, 50, 50);
        cursorY += 5;
      }
      cursorY += 1;
      continue;
    }

    // ── Regular paragraph text ──────────────────────────
    drawWrappedBlock(line, marginLeft, contentWidth, 11, 5, 50, 50, 50);
    cursorY += 2;
  }

  // ══════════════════════════════════════════════════════════
  // FOOTER — token usage + branding
  // ══════════════════════════════════════════════════════════
  ensureSpace(20);
  cursorY += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
  cursorY += 6;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Tokens: ${totalTokens.toLocaleString()} (${inputTokens.toLocaleString()} in / ${outputTokens.toLocaleString()} out)  |  Cost: $${estimatedCost.toFixed(4)}`,
    pageWidth / 2,
    cursorY,
    { align: "center" },
  );
  cursorY += 5;
  doc.text(
    "Generated by ApparelPro AI  |  Cross-Entity Analytics",
    pageWidth / 2,
    cursorY,
    { align: "center" },
  );

  // ══════════════════════════════════════════════════════════
  // SAVE — triggers browser download
  // ══════════════════════════════════════════════════════════
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`ApparelPro_Analytics_${category}_${dateStr}.pdf`);
}

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
  // 🎓 REAL PDF GENERATION using jsPDF — replaces the old window.print() approach.
  // Now triggers an automatic .pdf file download, matching PredictionsDashboard.
  // No more print preview window — the user clicks the PDF button and gets a
  // proper .pdf file saved directly to their Downloads folder.
  const handleDownloadPdf = useCallback(() => {
    if (!analyticsResult) return;
    const catName = selectedCategoryInfo?.name ?? analyticsResult.category;
    downloadAnalyticsAsPdf(
      analyticsResult.analysis,
      analyticsResult.category,
      catName,
      analyticsResult.entityCount,
      analyticsResult.provider,
      analyticsResult.model,
      analyticsResult.totalTokens,
      analyticsResult.inputTokens,
      analyticsResult.outputTokens,
      analyticsResult.estimatedCost,
      userQuery,
    );
    toast.success("PDF downloaded successfully!");
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
                fontSize: 13,
                fontWeight: 500,
                border: "none",
                cursor: !selectedCategory || isAnalysisRunning ? "not-allowed" : "pointer",
                opacity: !selectedCategory || isAnalysisRunning ? 0.4 : 1,
                transition: "all 0.2s ease",
                ...copperGlossButtonSx,
              } as React.CSSProperties}
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
                      Uses jsPDF to generate a real .pdf file and trigger a browser
                      download — no print preview window, no pop-up. Matches the
                      PredictionsDashboard's PDF download approach. */}
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
