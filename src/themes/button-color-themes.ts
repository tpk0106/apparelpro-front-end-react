// Glossy "glass bottle" button treatment: a highlight gathers top-left and
// fades out, the fill deepens toward the bottom-right corner, and a lift
// shadow sits underneath - no flat drop shadow. Variant 1 (charcoal depth).
//
// Deliberately untyped (no `: SxProps<Theme>` annotation) - that union type
// includes an array/function variant that TypeScript won't let you spread
// inside a NESTED selector object (e.g. "&.Mui-selected": { ...thisConst }),
// even though it spreads fine as a top-level `sx` prop value. Leaving these
// as inferred plain objects keeps both usages working.
export const copperGlossButtonSx = {
  position: "relative",
  overflow: "hidden",
  textTransform: "none",
  color: "#F3E9D6",
  borderTop: "1px solid #0D0A08",
  borderLeft: "1px solid #0D0A08",
  // A copper edge on the bottom-right corner instead of the same dark
  // border all around - reads as a deliberate trim, so the corner shadow
  // above doesn't look like it's just cutting the button off.
  borderRight: "1px solid #C9803D",
  borderBottom: "1px solid #C9803D",
  borderRadius: "6px",
  background:
    "linear-gradient(135deg, #E8A868 0%, #B87333 38%, #6B4420 72%, #0D0A08 100%)",
  boxShadow: "0 6px 14px rgba(0,0,0,0.55), 0 1px 0 rgba(243,233,214,0.2) inset",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(255,244,224,0.55) 0%, rgba(232,168,104,0.2) 22%, transparent 42%)",
    pointerEvents: "none",
  },
  // Tucked into the actual corner (100% 100%, tight falloff) instead of
  // centered further in toward the middle - the old 78%/84% position with a
  // wide 55% falloff put a large black patch over a good chunk of the
  // button, which read as the copper fill being narrower on the right than
  // the left (an optical illusion, not a real width difference).
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.45) 0%, transparent 38%)",
    pointerEvents: "none",
  },
  "&:hover": {
    background:
      "linear-gradient(135deg, #F0B378 0%, #C9803D 38%, #74491F 72%, #120D0A 100%)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.6), 0 1px 0 rgba(243,233,214,0.25) inset",
  },
};

// Variant 2 - deeper contrast, the depth pool runs to true black instead of
// charcoal. Used for small/square controls (e.g. the selected pagination
// page number) where a punchier corner reads better at a tiny size.
export const copperGlossButtonDeepSx = {
  position: "relative",
  overflow: "hidden",
  color: "#F3E9D6",
  borderTop: "1px solid #000",
  borderLeft: "1px solid #000",
  borderRight: "1px solid #C9803D",
  borderBottom: "1px solid #C9803D",
  background:
    "linear-gradient(135deg, #C98B4A 0%, #8A5223 30%, #2A1A0C 62%, #000000 100%)",
  boxShadow: "0 4px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(243,233,214,0.2) inset",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(255,244,224,0.5) 0%, rgba(232,168,104,0.15) 18%, transparent 38%)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.55) 0%, transparent 38%)",
    pointerEvents: "none",
  },
  "&:hover": {
    background:
      "linear-gradient(135deg, #D89C5B 0%, #9C6329 30%, #351F0F 62%, #000000 100%)",
  },
};

// Plain copper text - for labels/accents that just need the hue, no gloss.
export const copperTextColor = "#C9803D";

// Same glass-bottle gloss construction as copperGlossButtonSx, in the olive
// "Heritage" palette from the Olive Table Palette artifact - for
// tab-bar/button surfaces that want the olive family instead of copper.
// base #6C7A38, highlight #9FAE5E, depth #2B2426, text #F3EADF.
export const oliveGlossSx = {
  position: "relative",
  overflow: "hidden",
  textTransform: "none",
  color: "#F3EADF",
  borderTop: "1px solid #2B2426",
  borderLeft: "1px solid #2B2426",
  borderRight: "1px solid #9FAE5E",
  borderBottom: "1px solid #9FAE5E",
  background:
    "linear-gradient(135deg, #9FAE5E 0%, #6C7A38 42%, #46531F 74%, #2B2426 100%)",
  boxShadow: "0 6px 14px rgba(0,0,0,0.5), 0 1px 0 rgba(243,234,223,0.2) inset",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(243,234,223,0.5) 0%, rgba(159,174,94,0.2) 22%, transparent 42%)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.45) 0%, transparent 38%)",
    pointerEvents: "none",
  },
};
