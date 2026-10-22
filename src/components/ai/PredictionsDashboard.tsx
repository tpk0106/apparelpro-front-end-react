// ─────────────────────────────────────────────────────────────────────────────
// 🎓 PREDICTIONS DASHBOARD
// Phase 5: Full-page dashboard for Predictive & Prescriptive AI.
//
// 🎓 HOW THIS DIFFERS FROM CrossEntityAnalyticsPanel:
// - CrossEntityAnalyticsPanel is a FLOATING WINDOW toggled from the FAB group.
//   It looks like a chat panel — compact, overlay-style, bottom-right.
// - PredictionsDashboard is a FULL PAGE at the /ai-predictions route.
//   It's a proper dashboard with category cards, a time horizon slider,
//   and a results area — designed for strategic planning, not quick queries.
//
// 🎓 PAGE LAYOUT:
//   ┌─────────────────────────────────────────────────────────────┐
//   │  Header: "Predictive & Prescriptive AI" + close button     │
//   ├─────────────────────────────────────────────────────────────┤
//   │  Category Cards (4 across)                                 │
//   │  [Demand] [Material] [Supplier] [Cost]                     │
//   ├─────────────────────────────────────────────────────────────┤
//   │  Controls: Time Horizon Slider (1-12 months) + Query input │
//   │  [Run Prediction] button                                   │
//   ├─────────────────────────────────────────────────────────────┤
//   │  Results: AI predictions + prescriptive action plans        │
//   │  (causality chains, priority scores, decision matrices)     │
//   │  Token usage footer                                        │
//   └─────────────────────────────────────────────────────────────┘
//
// 🎓 COMPONENT FEATURES:
//   - Category cards fetched from GET /api/ai/predictions/categories
//   - MUI icon mapping from backend iconHint strings
//   - Time horizon slider (1-12 months) with value labels
//   - Optional user query text input
//   - Copy to clipboard + Download as PDF buttons on results
//   - Token usage transparency (provider, model, cost)
//   - Close button in header (standing rule: every panel/page must have one)
//
// 🎓 REACT RULES:
// All hooks are called unconditionally at the top level.
// No conditional returns before hooks.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Slider,
} from "@mui/material";
// 🎓 MUI Icons — one per prediction category (mapped from backend iconHint)
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShieldIcon from "@mui/icons-material/Shield";
import SavingsIcon from "@mui/icons-material/Savings";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { toast } from "react-toastify";
// 🎓 jsPDF — generates real downloadable PDF files client-side.
// Unlike the old approach (HTML blob + window.open), this creates an actual
// .pdf binary that triggers a browser download dialog. No more "looks like a web page" issue.
import { jsPDF } from "jspdf";

import type {
  PredictionCategory,
  PredictionCategoryInfo,
} from "../../interfaces/ai/predictive-ai.interfaces";
import {
  usePredictionCategories,
  useRunPrediction,
} from "../../tanstack-hooks/ai/predictive-ai.hooks";
import {
  copperGlossButtonSx,
  copperTextColor,
} from "../../themes/button-color-themes";

// ─── Theme tokens ────────────────────────────────────────────
// 🎓 Same dark palette as CrossEntityAnalyticsPanel and other AI components.
// Duplicated here so the component is self-contained.
const COLORS = {
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

// ─── Icon mapping ────────────────────────────────────────────
// 🎓 Maps the backend's iconHint string to the corresponding MUI icon.
// The backend sends hints like "TrendingUp", "Shield" — we resolve them
// to actual React components here. This keeps the backend icon-agnostic
// while giving the frontend full control over rendering.
const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUpIcon sx={{ fontSize: 28, color: COLORS.copper }} />,
  WarningAmber: <WarningAmberIcon sx={{ fontSize: 28, color: "#F59E0B" }} />,
  Shield: <ShieldIcon sx={{ fontSize: 28, color: "#EF4444" }} />,
  Savings: <SavingsIcon sx={{ fontSize: 28, color: "#10B981" }} />,
};

// 🎓 Category accent colors — each category gets a distinct color for its
// card border and glow effects. This visual differentiation helps the user
// quickly identify which prediction type they're looking at.
const CATEGORY_COLORS: Record<string, string> = {
  DEMAND_FORECASTING: COLORS.copper,
  MATERIAL_SHORTAGE: "#F59E0B",
  SUPPLIER_RISK: "#EF4444",
  COST_OPTIMIZATION: "#10B981",
};

// ─── Slider marks ────────────────────────────────────────────
// 🎓 Marks for the time horizon slider at key business-relevant points.
// Quarterly boundaries (3, 6, 9, 12) plus month 1 as the minimum.
const SLIDER_MARKS = [
  { value: 1, label: "1m" },
  { value: 3, label: "3m" },
  { value: 6, label: "6m" },
  { value: 9, label: "9m" },
  { value: 12, label: "12m" },
];

// ─── Simple markdown → HTML converter ────────────────────────
// 🎓 Same converter used in CrossEntityAnalyticsPanel.
// Converts markdown headings, bold, lists, and code blocks to HTML.
// Content comes from our own AI backend, not user input, so XSS risk is minimal.
function simpleMarkdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 style="color:#C9803D;margin:18px 0 8px;font-size:15px;font-weight:600">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#C9803D;margin:22px 0 10px;font-size:17px;font-weight:700">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#C9803D;margin:24px 0 12px;font-size:20px;font-weight:700">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:rgba(201,128,61,0.12);padding:2px 6px;border-radius:3px;font-size:13px">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$2</li>');
  // 🎓 Wrap consecutive <li> tags in <ul> for proper list rendering
  html = html.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul style="margin:8px 0;padding-left:20px">$1</ul>');
  // 🎓 Wrap remaining plain text lines in <p> tags
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<li") || trimmed.startsWith("<code")) return trimmed;
      return `<p style="margin:6px 0;line-height:1.6">${trimmed}</p>`;
    })
    .join("\n");
  return html;
}

// ─── PDF download helper ─────────────────────────────────────
// 🎓 REAL PDF GENERATION using jsPDF (v2).
//
// 🎓 KEY DESIGN DECISIONS:
//   1. COLORED DOTS — jsPDF's Helvetica font has NO emoji glyphs.
//      Unicode emoji circles (🔴🟢🟡🟠) render as garbled boxes.
//      We replace them with short tokens {R} {G} {Y} {O} during pre-processing,
//      then at RENDER time, drawLineWithDots() detects these tokens and draws
//      actual COLORED FILLED CIRCLES via doc.circle() + doc.setFillColor().
//      Result: the user sees a red dot ● next to "CRITICAL" — instant visual.
//
//   2. WORD WRAPPING — Every line is word-wrapped via jsPDF's splitTextToSize()
//      BEFORE drawing. Tokens {R} etc. occupy ~5mm in the width calculation,
//      and the rendered dot takes ~3mm — so lines are always within margins.
//
//   3. MARKDOWN TABLES — Detected by lines starting with |. Cells are extracted,
//      separator rows (|---|) are skipped, and each data row is rendered as a
//      compact key:value block that fits within margins.
//
//   4. BLOCKQUOTES — Lines starting with > are rendered with a copper left bar
//      and indented text.
//
//   5. HORIZONTAL RULES — Lines that are just --- or *** become a thin grey line.
//
// 🎓 HOW IT WORKS:
//   - Pre-process the entire text: replace emojis → dot tokens {R} {G} {Y} {O}
//   - Split into lines and classify each line by its markdown prefix
//   - For each line: strip formatting, word-wrap to fit, draw with inline dots
//   - Auto-add pages when cursor nears bottom margin
function downloadAsPdf(prediction: string, category: string, horizon: number) {
  // 🎓 Create an A4-sized PDF in portrait orientation.
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // 🎓 Page dimensions and margins (mm)
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight; // 170mm usable

  // 🎓 Cursor Y — tracks vertical position. Reset on each new page.
  let cursorY = marginTop;

  // ══════════════════════════════════════════════════════════
  // PRE-PROCESS: Replace emoji characters with dot tokens
  // ══════════════════════════════════════════════════════════
  // 🎓 Helvetica has NO emoji glyphs — they render as garbled boxes.
  // We replace colored circle emojis with SHORT TOKENS {R} {G} {Y} {O}
  // that act as placeholders. At render time, drawLineWithDots() detects
  // these tokens and draws actual COLORED FILLED CIRCLES in their place.
  //
  // 🎓 WHY TOKENS AND NOT TEXT LABELS?
  // The old "[CRITICAL]" text approach worked but wasn't visual enough.
  // With tokens, the PDF shows: ● CRITICAL (red dot) ● OK (green dot)
  // — the user can scan severity levels at a glance, just like the emoji
  // version on screen.
  //
  // 🎓 COLOR MAP (applied by drawLineWithDots):
  //   {R} → Red    (#DC2626) — Critical / High risk
  //   {G} → Green  (#16A34A) — OK / Low risk / Confirmed
  //   {Y} → Yellow (#EAB308) — Medium / Monitor / Warning
  //   {O} → Orange (#EA580C) — High / Elevated
  //   {P} → Purple (#9333EA) — Note / Info
  //   {B} → Blue   (#2563EB) — Info / Reference
  function replaceEmojis(text: string): string {
    return text
      // 🎓 Colored circle emojis → dot tokens for inline colored rendering
      .replace(/\u{1F534}/gu, "{R} ")          // 🔴 Red circle → red dot
      .replace(/\u{1F7E2}/gu, "{G} ")          // 🟢 Green circle → green dot
      .replace(/\u{1F7E1}/gu, "{Y} ")          // 🟡 Yellow circle → yellow dot
      .replace(/\u{1F7E0}/gu, "{O} ")          // 🟠 Orange circle → orange dot
      .replace(/\u{1F7E3}/gu, "{P} ")          // 🟣 Purple circle → purple dot
      .replace(/\u{1F535}/gu, "{B} ")          // 🔵 Blue circle → blue dot
      // 🎓 Status indicators → dot tokens (checkmark=green, cross=red)
      .replace(/✅/g, "{G} ")              // ✅ Check mark → green dot
      .replace(/❌/g, "{R} ")              // ❌ Cross mark → red dot
      .replace(/⚠️?/g, "{Y} ")       // ⚠️ Warning → yellow dot
      // 🎓 Arrow indicators → simple ASCII (no dot needed)
      .replace(/↑/g, "^")                 // ↑ Up arrow
      .replace(/↓/g, "v")                 // ↓ Down arrow
      .replace(/→/g, "->")               // → Right arrow
      .replace(/←/g, "<-")               // ← Left arrow
      // 🎓 Misc symbols → text labels (no colored dot equivalent)
      .replace(/\u{1F4CA}/gu, "[CHART]")       // 📊 Bar chart
      .replace(/\u{1F4C8}/gu, "[UP]")          // 📈 Chart up
      .replace(/\u{1F4C9}/gu, "[DOWN]")        // 📉 Chart down
      .replace(/\u{1F6A8}/gu, "[ALERT]")       // 🚨 Rotating light
      .replace(/\u{1F50D}/gu, "")              // 🔍 Magnifying glass (decorative)
      .replace(/\u{2139}️?/gu, "[i]")     // ℹ️ Info
      // 🎓 Catch-all: remove any remaining emoji that would render as boxes
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "");
  }

  // ══════════════════════════════════════════════════════════
  // DOT COLOR MAP — maps token letters to RGB fill colors
  // ══════════════════════════════════════════════════════════
  // 🎓 Used by drawLineWithDots() to pick the circle fill color.
  // Each key is the single letter inside the curly braces: {R} → "R"
  const DOT_COLORS: Record<string, [number, number, number]> = {
    R: [220, 38, 38],    // 🎓 Red — Critical severity / unsourced / high risk
    G: [22, 163, 74],    // 🎓 Green — OK / confirmed / low risk
    Y: [234, 179, 8],    // 🎓 Yellow — Medium / monitor / warning
    O: [234, 88, 12],    // 🎓 Orange — High / elevated / sole-sourced
    P: [147, 51, 234],   // 🎓 Purple — Note / informational
    B: [37, 99, 235],    // 🎓 Blue — Info / reference
  };

  // ══════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════

  // 🎓 Check if we need a new page before drawing an element.
  function ensureSpace(neededMm: number) {
    if (cursorY + neededMm > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }
  }

  // 🎓 Strip markdown bold/italic markers for accurate text measurement.
  // jsPDF measures the literal characters ** when calculating width,
  // so we must remove them before calling splitTextToSize().
  function stripMd(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
  }

  // 🎓 CUSTOM WORD-WRAP using doc.getTextWidth() — the ACTUAL rendered width.
  //
  // WHY NOT splitTextToSize()?
  // jsPDF's splitTextToSize() uses an internal font-metric table that is
  // APPROXIMATE. It consistently UNDERESTIMATES rendered widths — especially
  // for bold text, mixed-case strings, and punctuation-heavy lines. The error
  // accumulates per character: over a 50+ char line at 13pt bold, the total
  // underestimation can reach 10–15mm, pushing the last few words off the
  // right edge of the page. After multiple failed attempts to patch this with
  // safety buffers (3mm, 5mm, 15mm), the only reliable fix is to MEASURE
  // each word's actual rendered width with getTextWidth() and build lines
  // manually. getTextWidth() queries the same font engine that DRAWS the text,
  // so its measurement matches what appears on the page — no guessing.
  //
  // HOW IT WORKS:
  // 1. Split text into words by spaces
  // 2. For each word, measure its actual rendered width with getTextWidth()
  // 3. If adding this word would exceed maxWidth, start a new line
  // 4. A single word longer than maxWidth gets its own line (won't infinite-loop)
  // 5. A 2mm safety margin absorbs sub-pixel rounding at PDF render time
  function wrapText(text: string, maxWidth: number): string[] {
    const safeMax = maxWidth - 2; // 🎓 2mm margin for sub-pixel rounding
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if (currentLine === "") {
        // 🎓 First word on a new line — always accept it even if it's too wide
        // (a single word wider than the column can't be split further)
        currentLine = word;
      } else {
        // 🎓 Measure the line WITH this word appended — using getTextWidth()
        // which returns the ACTUAL rendered width in mm for the current font
        const testLine = currentLine + " " + word;
        const testWidth = doc.getTextWidth(testLine);
        if (testWidth <= safeMax) {
          currentLine = testLine;
        } else {
          // 🎓 Adding this word would overflow — push the current line and
          // start a new one with this word
          lines.push(currentLine);
          currentLine = word;
        }
      }
    }
    // 🎓 Don't forget the last line being built
    if (currentLine !== "") {
      lines.push(currentLine);
    }
    return lines;
  }

  // 🎓 Draw a SINGLE LINE with inline colored dots.
  // Scans the line for dot tokens like {R}, {G}, {Y}, {O}.
  // For each token found, it draws the text before it, then draws a small
  // colored filled circle, then continues with the remaining text.
  //
  // 🎓 HOW THE DOT IS DRAWN:
  //   doc.setFillColor(r, g, b) → sets the dot color
  //   doc.circle(x, y, radius, "F") → draws a filled circle ("F" = fill)
  //   The dot is 1.2mm radius (~2.4mm diameter) — visible but not intrusive.
  //   It's positioned vertically centred on the text baseline.
  //
  // 🎓 WHY THIS IS SAFE:
  //   This function is called AFTER word-wrapping, so each line is already
  //   guaranteed to fit within the page width. The dot tokens {R} occupy
  //   ~5mm in the wrapped width calculation, and the rendered dot + gap
  //   takes ~3mm — so lines are always shorter than measured, never longer.
  function drawLineWithDots(line: string, x: number, y: number, textR: number, textG: number, textB: number) {
    // 🎓 Regex matches dot tokens: {R}, {G}, {Y}, {O}, {P}, {B}
    const dotRegex = /\{([RGYOPB])\}/g;
    let currentX = x;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = dotRegex.exec(line)) !== null) {
      // 🎓 Draw the text BEFORE this dot token
      const beforeText = line.slice(lastIdx, match.index);
      if (beforeText) {
        doc.setTextColor(textR, textG, textB);
        doc.text(beforeText, currentX, y);
        currentX += doc.getTextWidth(beforeText);
      }

      // 🎓 Draw the COLORED FILLED CIRCLE
      const colorKey = match[1]; // "R", "G", "Y", "O", "P", or "B"
      const [cr, cg, cb] = DOT_COLORS[colorKey] ?? [100, 100, 100];
      const dotRadius = 1.2; // mm — ~2.4mm diameter, clear and visible
      doc.setFillColor(cr, cg, cb);
      // 🎓 Position: slightly right of currentX, vertically centred on text.
      // The y - dotRadius * 0.6 centres the dot against the text baseline.
      doc.circle(currentX + dotRadius + 0.3, y - dotRadius * 0.6, dotRadius, "F");
      // 🎓 Advance X past the dot + a small gap
      currentX += dotRadius * 2 + 1.2;

      lastIdx = match.index + match[0].length;
    }

    // 🎓 Draw any remaining text AFTER the last dot (or the whole line if no dots)
    const remaining = line.slice(lastIdx);
    if (remaining) {
      doc.setTextColor(textR, textG, textB);
      doc.text(remaining, currentX, y);
    }
  }

  // 🎓 Draw a block of text with word-wrapping AND inline colored dots.
  // This is the main rendering function for ALL body text in the PDF.
  //
  // 🎓 FLOW:
  //   1. Strip markdown formatting (**, *, `) for accurate width measurement
  //   2. Word-wrap the stripped text to fit within maxW
  //   3. For each wrapped sub-line, call drawLineWithDots() which handles
  //      both regular text AND colored dot tokens in one pass
  function drawWrappedBlock(text: string, x: number, maxW: number, fontSize: number, lineH: number, r: number, g: number, b: number, style: string = "normal") {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.setTextColor(r, g, b);
    const clean = stripMd(text);
    const lines = wrapText(clean, maxW);
    for (const ln of lines) {
      ensureSpace(lineH);
      // 🎓 Use drawLineWithDots instead of plain doc.text()
      // This renders any {R} {G} {Y} {O} tokens as colored filled circles
      drawLineWithDots(ln, x, cursorY, r, g, b);
      cursorY += lineH;
    }
  }

  // ══════════════════════════════════════════════════════════
  // HEADER — Title bar with copper accent line
  // ══════════════════════════════════════════════════════════

  // 🎓 "ApparelPro" brand text — small, copper
  doc.setFontSize(10);
  doc.setTextColor(201, 128, 61);
  doc.text("ApparelPro AI", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 8;

  // 🎓 Main title — large, bold, dark
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  const titleText = `AI Prediction: ${category.replace(/_/g, " ")}`;
  // 🎓 Word-wrap the title too — long category names could overflow
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

  // 🎓 Subtitle — time horizon and date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const subtitle = `Time Horizon: ${horizon} month${horizon !== 1 ? "s" : ""}  |  Generated: ${new Date().toLocaleDateString()}`;
  doc.text(subtitle, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 12;

  // ══════════════════════════════════════════════════════════
  // BODY — Parse and render the markdown prediction
  // ══════════════════════════════════════════════════════════

  // 🎓 STEP 1: Replace all emoji BEFORE splitting into lines.
  // This ensures no emoji character reaches jsPDF's text renderer.
  const cleanedPrediction = replaceEmojis(prediction);
  const allLines = cleanedPrediction.split("\n");

  // 🎓 Track whether we're inside a table block (consecutive | lines)
  let inTable = false;
  let tableHeaders: string[] = [];

  for (let li = 0; li < allLines.length; li++) {
    const line = allLines[li].trim();

    // ── Empty line: small gap ────────────────────────
    if (!line) {
      inTable = false;
      tableHeaders = [];
      cursorY += 3;
      continue;
    }

    // ── Horizontal rule: --- or *** or ___ ───────────
    // 🎓 Renders as a thin grey line spanning the content area.
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

    // ── Markdown table row: |...|...|...| ────────────
    // 🎓 Tables are the trickiest part. jsPDF has no table renderer,
    // and trying to draw aligned columns is fragile with variable text.
    // Instead we extract cells and render each data row as:
    //   "ColumnHeader: value | ColumnHeader: value | ..."
    // This fits within margins and is readable in the PDF.
    if (line.startsWith("|") && line.endsWith("|")) {
      // 🎓 Extract cells: split by |, trim, remove empty edge cells
      const cells = line.split("|").map((c) => c.trim()).filter((c) => c.length > 0);

      // 🎓 Skip separator rows like |---|---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        // 🎓 First row of the table = header row. Store column names.
        inTable = true;
        tableHeaders = cells.map((c) => stripMd(c));
        // 🎓 Draw header row in bold copper
        ensureSpace(7);
        cursorY += 2;
        const headerText = tableHeaders.join("  |  ");
        drawWrappedBlock(headerText, marginLeft, contentWidth, 9, 4.5, 201, 128, 61, "bold");
        // 🎓 Thin copper underline below the table header row.
        //
        //    GAP BEFORE LINE (2mm):
        //    drawWrappedBlock leaves cursorY at (last baseline + lineH).
        //    Text descenders (g, y, p, q) extend ~1mm below the baseline,
        //    so they sit at roughly cursorY - lineH + 1mm = cursorY - 3.5mm.
        //    A 2mm gap ensures the line clears all descenders comfortably.
        //
        //    GAP AFTER LINE (3.5mm):
        //    The NEXT row's text is drawn at cursorY (the baseline), but the
        //    TOP of capital letters / ascenders (b, d, h, k) rises ~2.2mm
        //    ABOVE the baseline. Without enough gap, text tops poke above
        //    the line — the "no top margin" bug. 3.5mm gives ~1.3mm visual
        //    clearance above the tallest characters.
        cursorY += 2;
        doc.setDrawColor(201, 128, 61);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
        cursorY += 3.5;
      } else {
        // 🎓 Data row — pair each cell with its header for readability.
        // If we have headers, format as "Header: Value". If not, just join.
        let rowText: string;
        if (tableHeaders.length > 0 && tableHeaders.length === cells.length) {
          // 🎓 Pair headers with values for a readable key:value format
          const pairs = cells.map((cell, idx) => `${tableHeaders[idx]}: ${stripMd(cell)}`);
          rowText = pairs.join("  |  ");
        } else {
          rowText = cells.map((c) => stripMd(c)).join("  |  ");
        }
        // 🎓 Data row: indented 2mm from left margin, wrap width reduced by
        //    4mm to account for the indent. The universal 3mm safety buffer
        //    in wrapText() handles font metric imprecision separately.
        drawWrappedBlock(rowText, marginLeft + 2, contentWidth - 4, 8.5, 4, 50, 50, 50);
        // 🎓 Faint separator between table rows.
        //
        //    GAP BEFORE LINE (2mm):
        //    drawWrappedBlock leaves cursorY at (last baseline + lineH = 4mm).
        //    Descenders extend ~1mm below the baseline, sitting at about
        //    cursorY - 3mm. A 2mm gap keeps the line well below descenders
        //    (total distance from descender to line ≈ 5mm).
        //
        //    GAP AFTER LINE (3.5mm):
        //    The NEXT data row's text baseline is drawn at cursorY, but
        //    ascenders (capital letters, b/d/h/k) rise ~2.2mm ABOVE baseline.
        //    With only 1.5mm gap (old code), text tops sat 0.7mm ABOVE the
        //    separator — the "no top margin from top border" bug.
        //    3.5mm gap → text top sits 1.3mm BELOW the line = clean visual margin.
        cursorY += 2;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);
        cursorY += 3.5;
      }
      continue;
    }

    // 🎓 If we reach a non-table line, reset table state
    inTable = false;
    tableHeaders = [];

    // ── Blockquote: > text ──────────────────────────
    // 🎓 Renders with a copper left bar and indented italic text.
    if (line.startsWith("> ")) {
      const quoteText = line.slice(2);
      ensureSpace(8);
      // 🎓 Draw copper left bar (3px wide, spanning the quote height)
      const quoteClean = stripMd(quoteText);
      doc.setFontSize(10);
      const quoteLines = wrapText(quoteClean, contentWidth - 12);
      const quoteHeight = quoteLines.length * 5;
      doc.setDrawColor(201, 128, 61);
      doc.setFillColor(201, 128, 61);
      doc.rect(marginLeft, cursorY - 3.5, 1.5, quoteHeight + 1, "F");
      // 🎓 Draw quote text indented past the bar
      // 🎓 Uses drawLineWithDots so {G}, {R}, {Y} etc. render as colored circles
      //    even inside blockquotes (e.g. "PREDICTION ({G} HIGH CONFIDENCE)")
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

    // ── Heading ####: h4 ─────────────────────────────
    if (line.startsWith("#### ")) {
      const headingText = stripMd(line.slice(5));
      ensureSpace(8);
      cursorY += 3;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 12, 5.5, 139, 94, 60, "bold");
      cursorY += 2;
      continue;
    }

    // ── Heading ###: h3 ──────────────────────────────
    if (line.startsWith("### ")) {
      const headingText = stripMd(line.slice(4));
      ensureSpace(10);
      cursorY += 4;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 13, 6, 139, 94, 60, "bold");
      cursorY += 2;
      continue;
    }

    // ── Heading ##: h2 ───────────────────────────────
    if (line.startsWith("## ")) {
      const headingText = stripMd(line.slice(3));
      ensureSpace(12);
      cursorY += 5;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 15, 7, 201, 128, 61, "bold");
      cursorY += 3;
      continue;
    }

    // ── Heading #: h1 ────────────────────────────────
    if (line.startsWith("# ")) {
      const headingText = stripMd(line.slice(2));
      ensureSpace(14);
      cursorY += 6;
      drawWrappedBlock(headingText, marginLeft, contentWidth, 16, 7.5, 201, 128, 61, "bold");
      cursorY += 3;
      continue;
    }

    // ── Bullet list item: - or * ─────────────────────
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      const itemText = stripMd(bulletMatch[1]);
      ensureSpace(6);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      // 🎓 Draw bullet dot at fixed position
      doc.text("-", marginLeft + 3, cursorY);
      // 🎓 Word-wrap the item text within the indented area
      // 🎓 Uses drawLineWithDots so dot tokens render as colored circles in bullets
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

    // ── Numbered list item: 1. 2. 3. ─────────────────
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
      // 🎓 Uses drawLineWithDots so dot tokens render as colored circles in numbered lists
      for (const wl of wrapped) {
        ensureSpace(5);
        drawLineWithDots(wl, indentX, cursorY, 50, 50, 50);
        cursorY += 5;
      }
      cursorY += 1;
      continue;
    }

    // ── Regular paragraph text ───────────────────────
    // 🎓 Default: body text at 11pt. Strip markdown, wrap, draw.
    // NO drawRichLine — all text goes through wrapText first to
    // guarantee it stays within the page margins.
    drawWrappedBlock(line, marginLeft, contentWidth, 11, 5, 50, 50, 50);
    cursorY += 2;
  }

  // ══════════════════════════════════════════════════════════
  // FOOTER — branding line at the bottom
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
    "Generated by ApparelPro AI  |  Predictive & Prescriptive Analytics",
    pageWidth / 2,
    cursorY,
    { align: "center" },
  );

  // ══════════════════════════════════════════════════════════
  // SAVE — triggers browser download with descriptive filename
  // ══════════════════════════════════════════════════════════
  const dateStr = new Date().toISOString().split("T")[0];
  doc.save(`ApparelPro_Prediction_${category}_${dateStr}.pdf`);
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function PredictionsDashboard() {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | null>(null);
  const [timeHorizon, setTimeHorizon] = useState<number>(3); // 🎓 Default 3 months
  const [userQuery, setUserQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // 🎓 Ref to the results container for auto-scrolling
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── TanStack hooks ─────────────────────────────────────────
  // 🎓 Fetch categories from backend (GET /api/ai/predictions/categories)
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = usePredictionCategories();

  // 🎓 Mutation for running predictions (POST /api/ai/predictions)
  const {
    mutate: runPrediction,
    data: predictionResult,
    isPending: isPredictionLoading,
    isError: isPredictionError,
    error: predictionError,
    reset: resetPrediction,
  } = useRunPrediction();

  // ── Handlers ───────────────────────────────────────────────

  // 🎓 Select a category card — sets the active category and resets
  // any previous prediction result so the UI is clean for the new run.
  const handleSelectCategory = useCallback(
    (category: PredictionCategory) => {
      setSelectedCategory(category);
      resetPrediction();
    },
    [resetPrediction],
  );

  // 🎓 Run the prediction — fires the POST mutation.
  // Only runs if a category is selected (button is disabled otherwise).
  const handleRunPrediction = useCallback(() => {
    if (!selectedCategory) return;
    runPrediction(
      {
        category: selectedCategory,
        userQuery: userQuery.trim() || undefined,
        timeHorizonMonths: timeHorizon,
      },
      {
        // 🎓 Auto-scroll to results when the prediction completes
        onSuccess: () => {
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        },
      },
    );
  }, [selectedCategory, userQuery, timeHorizon, runPrediction]);

  // 🎓 Copy prediction text to clipboard
  const handleCopy = useCallback(async () => {
    if (!predictionResult?.prediction) return;
    try {
      await navigator.clipboard.writeText(predictionResult.prediction);
      setIsCopied(true);
      toast.success("Prediction copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [predictionResult]);

  // 🎓 Download prediction as real PDF file (jsPDF direct download)
  const handleDownloadPdf = useCallback(() => {
    if (!predictionResult?.prediction) return;
    downloadAsPdf(
      predictionResult.prediction,
      predictionResult.category,
      predictionResult.timeHorizonMonths,
    );
  }, [predictionResult]);

  // 🎓 Close button — navigates back to the previous page.
  // Uses navigate(-1) so the user goes back to wherever they came from
  // (could be the dashboard, could be a style details page, etc.)
  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 🎓 Slider change handler — typed for MUI Slider's onChange signature.
  const handleSliderChange = useCallback(
    (_event: Event, newValue: number | number[]) => {
      setTimeHorizon(newValue as number);
    },
    [],
  );

  // ── Memoized values ────────────────────────────────────────

  // 🎓 The currently selected category's info (for display in results header)
  const selectedCategoryInfo = useMemo(
    () => categories?.find((c) => c.key === selectedCategory) ?? null,
    [categories, selectedCategory],
  );

  // 🎓 Rendered prediction HTML (memoized to avoid re-parsing on every render)
  const renderedPredictionHtml = useMemo(
    () => (predictionResult?.prediction ? simpleMarkdownToHtml(predictionResult.prediction) : ""),
    [predictionResult?.prediction],
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: COLORS.canvas,
        color: COLORS.text,
        padding: { xs: "16px", md: "32px" },
        paddingBottom: "80px", // 🎓 Space for the FAB
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 28, color: COLORS.copper }} />
          <Box>
            <Box
              component="h1"
              sx={{
                fontSize: "22px",
                fontWeight: 700,
                color: COLORS.text,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Predictive & Prescriptive AI
            </Box>
            <Box
              sx={{
                fontSize: "13px",
                color: COLORS.muted,
                marginTop: "2px",
              }}
            >
              Forecasts with actionable plans, priorities & decision matrices
            </Box>
          </Box>
        </Box>

        {/* 🎓 Close button — standing rule: every panel/page must have one */}
        <Tooltip title="Close">
          <IconButton onClick={handleClose} sx={{ color: COLORS.muted, "&:hover": { color: COLORS.text } }}>
            <CancelOutlinedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Category Cards ─────────────────────────────────── */}
      {isCategoriesLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <CircularProgress size={32} sx={{ color: COLORS.copper }} />
        </Box>
      )}

      {isCategoriesError && (
        <Box
          sx={{
            padding: "16px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#FCA5A5",
            fontSize: "14px",
          }}
        >
          Failed to load prediction categories. Check your network connection.
        </Box>
      )}

      {categories && (
        <Box
          sx={{
            display: "grid",
            // 🎓 Responsive grid: 1 column on mobile, 2 on tablet, 4 on desktop.
            // Each card is a self-contained unit showing the category name,
            // description, and icon.
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {categories.map((cat: PredictionCategoryInfo) => {
            const isSelected = selectedCategory === cat.key;
            const accentColor = CATEGORY_COLORS[cat.key] ?? COLORS.copper;

            return (
              <Box
                key={cat.key}
                onClick={() => handleSelectCategory(cat.key)}
                sx={{
                  padding: "20px",
                  borderRadius: "10px",
                  backgroundColor: isSelected
                    ? `${accentColor}12` // 🎓 Subtle tint when selected
                    : COLORS.surface,
                  border: `1px solid ${isSelected ? accentColor : COLORS.border}`,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}0A`,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 16px ${accentColor}20`,
                  },
                  // 🎓 Glow ring when selected — makes the active card pop
                  ...(isSelected && {
                    boxShadow: `0 0 0 1px ${accentColor}, 0 4px 16px ${accentColor}30`,
                  }),
                }}
              >
                {/* 🎓 Icon + category name */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, marginBottom: "10px" }}>
                  {ICON_MAP[cat.iconHint] ?? (
                    <AutoAwesomeIcon sx={{ fontSize: 28, color: accentColor }} />
                  )}
                  <Box sx={{ fontSize: "15px", fontWeight: 600, color: COLORS.text }}>
                    {cat.name}
                  </Box>
                </Box>
                {/* 🎓 Description */}
                <Box sx={{ fontSize: "13px", color: COLORS.muted, lineHeight: 1.5 }}>
                  {cat.description}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── Controls: Time Horizon Slider + Query Input ──── */}
      {selectedCategory && (
        <Box
          sx={{
            padding: "24px",
            borderRadius: "10px",
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            marginBottom: "24px",
          }}
        >
          {/* 🎓 Time Horizon Slider */}
          <Box sx={{ marginBottom: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ fontSize: "14px", fontWeight: 600, color: COLORS.text }}>
                  Forecast Horizon
                </Box>
                <Tooltip title="How far ahead the AI should predict. Shorter horizons are more accurate; longer horizons reveal strategic trends.">
                  <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.muted, cursor: "help" }} />
                </Tooltip>
              </Box>
              {/* 🎓 Current value badge — shows the selected months prominently */}
              <Box
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: COLORS.copper,
                  backgroundColor: COLORS.copperLight,
                  padding: "4px 12px",
                  borderRadius: "6px",
                }}
              >
                {timeHorizon} month{timeHorizon !== 1 ? "s" : ""}
              </Box>
            </Box>

            {/* 🎓 The MUI Slider — copper-themed to match the design system.
                Marks at business-relevant quarterly boundaries (1, 3, 6, 9, 12).
                Step = 1 so the user can pick any month. */}
            {/* 🎓 SLIDER VISIBILITY FIX:
                The original slider used rgba(255,255,255,0.08) for the rail
                which was nearly invisible on the #141922 surface. Changes:
                  - Rail: increased to rgba(255,255,255,0.25) — clearly visible
                  - Track height: 8px → thicker, more prominent
                  - Thumb: 22px → larger, easier to grab
                  - Marks: 3px wide, 12px tall → clearly visible notches
                  - Mark labels: 12px font, brighter color
                  - Rail has a subtle copper tint for cohesion
            */}
            <Slider
              value={timeHorizon}
              onChange={handleSliderChange}
              min={1}
              max={12}
              step={1}
              marks={SLIDER_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}m`}
              sx={{
                color: COLORS.copper,
                // 🎓 Increased from 6 → 8 for better visibility on dark background
                height: 8,
                "& .MuiSlider-thumb": {
                  // 🎓 Increased from 18 → 22 for easier grabbing and visibility
                  width: 22,
                  height: 22,
                  backgroundColor: COLORS.copper,
                  border: "3px solid #0A0E14",
                  // 🎓 Copper glow on hover makes it pop even more
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: `0 0 0 8px ${COLORS.copperGlow}`,
                  },
                  // 🎓 Subtle inner highlight for a "polished" look
                  "&::before": {
                    content: '""',
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                  },
                },
                "& .MuiSlider-track": {
                  backgroundColor: COLORS.copper,
                  border: "none",
                  // 🎓 Subtle glow along the filled track for visibility
                  boxShadow: "0 0 8px rgba(201, 128, 61, 0.3)",
                },
                "& .MuiSlider-rail": {
                  // 🎓 FIX: Increased from 0.08 → 0.25 opacity — the key visibility fix
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                },
                "& .MuiSlider-mark": {
                  // 🎓 Larger marks: 3px wide, 12px tall (was 2px × 8px)
                  backgroundColor: "rgba(255, 255, 255, 0.35)",
                  width: 3,
                  height: 12,
                  borderRadius: "1px",
                },
                "& .MuiSlider-markActive": {
                  backgroundColor: COLORS.copper,
                  // 🎓 Active marks glow to show "filled" range
                  boxShadow: "0 0 4px rgba(201, 128, 61, 0.4)",
                },
                "& .MuiSlider-markLabel": {
                  // 🎓 Brighter label text (was COLORS.muted / #8B93A1)
                  color: "#B0B8C4",
                  fontSize: "12px",
                  fontWeight: 500,
                },
                "& .MuiSlider-valueLabel": {
                  backgroundColor: COLORS.copper,
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                },
              }}
            />
          </Box>

          {/* 🎓 Optional user query input — same pattern as CrossEntityAnalyticsPanel */}
          <Box sx={{ marginBottom: "16px" }}>
            <Box sx={{ fontSize: "14px", fontWeight: 600, color: COLORS.text, marginBottom: "8px" }}>
              Focus Query{" "}
              <Box component="span" sx={{ fontWeight: 400, color: COLORS.muted, fontSize: "12px" }}>
                (optional)
              </Box>
            </Box>
            <Box
              component="textarea"
              value={userQuery}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserQuery(e.target.value)}
              placeholder="e.g. Focus on buyer ALPHA's demand for next quarter..."
              rows={2}
              sx={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.input,
                color: COLORS.text,
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "vertical" as const,
                outline: "none",
                transition: "border-color 0.2s",
                "&:focus": {
                  borderColor: COLORS.copper,
                },
                "&::placeholder": {
                  color: COLORS.muted,
                  opacity: 0.7,
                },
              }}
            />
          </Box>

          {/* 🎓 Run Prediction button — copper gloss style */}
          <Box
            component="button"
            onClick={handleRunPrediction}
            disabled={isPredictionLoading}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100%",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: isPredictionLoading ? "wait" : "pointer",
              opacity: isPredictionLoading ? 0.7 : 1,
              border: "none",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              ...copperGlossButtonSx,
              borderRadius: "8px",
            } as React.CSSProperties}
          >
            {isPredictionLoading ? (
              <>
                <CircularProgress size={16} sx={{ color: "#F3E9D6" }} />
                Generating prediction…
              </>
            ) : (
              <>
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                Run Prediction
              </>
            )}
          </Box>
        </Box>
      )}

      {/* ── Error state ───────────────────────────────────── */}
      {isPredictionError && (
        <Box
          sx={{
            padding: "16px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#FCA5A5",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {/* 🎓 Show the actual error message from the backend if available */}
          {predictionError?.message ?? "Prediction request failed. The AI provider may be temporarily unavailable."}
        </Box>
      )}

      {/* ── Results ───────────────────────────────────────── */}
      {predictionResult && (
        <Box
          ref={resultsRef}
          sx={{
            borderRadius: "10px",
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          {/* Results header — category name + action buttons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.copperLight,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* 🎓 Show the category's icon in the results header */}
              {selectedCategoryInfo && ICON_MAP[selectedCategoryInfo.iconHint]}
              <Box>
                <Box sx={{ fontSize: "15px", fontWeight: 600, color: COLORS.text }}>
                  {selectedCategoryInfo?.name ?? predictionResult.category}
                </Box>
                <Box sx={{ fontSize: "12px", color: COLORS.muted }}>
                  {predictionResult.entityCount} entities analysed · {predictionResult.timeHorizonMonths}-month horizon
                </Box>
              </Box>
            </Box>

            {/* 🎓 Action buttons — Copy + PDF */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title={isCopied ? "Copied!" : "Copy to clipboard"}>
                <IconButton onClick={handleCopy} size="small" sx={{ color: COLORS.muted, "&:hover": { color: COLORS.text } }}>
                  {isCopied ? <CheckIcon sx={{ fontSize: 18 }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Download as PDF">
                <IconButton onClick={handleDownloadPdf} size="small" sx={{ color: COLORS.muted, "&:hover": { color: COLORS.text } }}>
                  <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* 🎓 Prediction content — rendered markdown */}
          <Box
            sx={{
              padding: "20px 24px",
              maxHeight: "60vh",
              overflowY: "auto",
              fontSize: "14px",
              lineHeight: 1.7,
              color: COLORS.text,
              // 🎓 Custom scrollbar matching the dark theme
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: COLORS.scrollTrack },
              "&::-webkit-scrollbar-thumb": {
                background: COLORS.scrollThumb,
                borderRadius: "3px",
              },
            }}
            dangerouslySetInnerHTML={{ __html: renderedPredictionHtml }}
          />

          {/* 🎓 Token usage footer — transparency for cost tracking */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              padding: "12px 20px",
              borderTop: `1px solid ${COLORS.border}`,
              fontSize: "11px",
              color: COLORS.muted,
            }}
          >
            <Box>
              Provider: <Box component="span" sx={{ color: copperTextColor }}>{predictionResult.provider}</Box>
            </Box>
            <Box>
              Model: <Box component="span" sx={{ color: copperTextColor }}>{predictionResult.model}</Box>
            </Box>
            <Box>
              Tokens: <Box component="span" sx={{ color: copperTextColor }}>
                {predictionResult.inputTokens.toLocaleString()} in · {predictionResult.outputTokens.toLocaleString()} out
              </Box>
            </Box>
            <Box>
              Cost: <Box component="span" sx={{ color: copperTextColor }}>
                ${predictionResult.estimatedCost.toFixed(4)}
              </Box>
            </Box>
            <Box>
              Generated: <Box component="span" sx={{ color: copperTextColor }}>
                {new Date(predictionResult.generatedAt).toLocaleString()}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Empty state — shown when no category is selected yet ── */}
      {!selectedCategory && !isCategoriesLoading && categories && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 24px",
            color: COLORS.muted,
            textAlign: "center",
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 48, color: COLORS.copperGlow, marginBottom: "16px" }} />
          <Box sx={{ fontSize: "16px", fontWeight: 600, color: COLORS.text, marginBottom: "8px" }}>
            Select a prediction category
          </Box>
          <Box sx={{ fontSize: "13px", maxWidth: "400px", lineHeight: 1.5 }}>
            Choose one of the prediction categories above to generate forward-looking
            AI forecasts based on your historical ERP data.
          </Box>
        </Box>
      )}
    </Box>
  );
}
