import { useState, type MouseEvent } from "react";
import {
  Box,
  Button,
  Chip,
  Pagination,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useGetOrderPipeline } from "../../tanstack-hooks/dashboard.hooks";
import type { OrderPipelineRow } from "../../interfaces/dashboard/Dashboard";
import { DASHBOARD_COLORS } from "./dashboard-theme";
import { copperTextColor } from "../../themes/button-color-themes";

const STAGE_LABELS = ["Merchandising", "Approval", "Supplier PO", "GRN receipt", "Production", "Shipment", "Complete"];
const PAGE_SIZE = 10;

// Where each stage's action button sends the merchandiser - real routes
// mounted in App.tsx, matching the actual entry screen for that step. Stage
// 5 (Shipment) has no route: Part Shipment's own workspace component exists
// (src/components/part-shipment/part-shipments-grid.tsx) but is not
// currently mounted anywhere in App.tsx, so there's nowhere to send this
// button yet - shown disabled with an explanatory tooltip instead of a dead
// link. None of these deep-link with the row's own Buyer/Order/Style scope
// (unverified whether each destination screen even supports a query-string
// prefill) - v1 just gets the merchandiser to the right screen, not the
// right screen pre-filled.
const STAGE_ACTION_LABELS = ["Open order", "Review trim sheet", "Raise supplier PO", "Open GRN", "Open production", "Plan shipment"];
const STAGE_ROUTES: (string | null)[] = ["/po", "/trim-sheet-approval", "/supplier-po", "/grn", "/daily-production-entry", null];

// Matches the approved mockup exactly: copper for anything still pending/
// outstanding, olive for anything done/complete - not the generic amber/
// teal warning/success pair used elsewhere in the app.
const PENDING_COLOR = copperTextColor;
const DONE_COLOR = DASHBOARD_COLORS.accentStrong;

const numberFmt = (n: number) => Math.round(n).toLocaleString();
const moneyFmt = (n: number, currency?: string) => `${currency ? currency + " " : ""}${Math.round(n).toLocaleString()}`;

// Small donut chart for Production/Shipment - actual vs target as a single
// glance-able ring, same visual language as CompletionRing elsewhere on this
// dashboard, just sized to fit inside a 280px-wide popover. Copper while the
// stage is still open, olive once it's done (>= 100%).
function MiniPercentRing({ pct, done }: { pct: number; done: boolean }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circumference * (1 - clamped / 100);
  const color = done ? DONE_COLOR : PENDING_COLOR;
  return (
    <svg width={76} height={76} viewBox="0 0 76 76" style={{ flexShrink: 0 }}>
      <circle cx={38} cy={38} r={radius} fill="none" stroke="rgba(191,168,90,0.16)" strokeWidth={8} />
      <circle
        cx={38} cy={38} r={radius} fill="none" stroke={color} strokeWidth={8}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 38 38)"
      />
      <text x={38} y={43} textAnchor="middle" fontSize={15} fontWeight={600} fill={DASHBOARD_COLORS.textPrimary}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// Renders one stage's summary content inside the Popover - shape differs
// per stage since what actually matters differs (a checklist for
// Merchandising, quantities/values for the rest). See each *StageDetail
// backend service model's own comment for exactly what "done" means and
// what data backs it.
//
// isDone = this stage has already been fully cleared for this order (either
// the order has moved past it, or the whole order is complete) - controls
// whether the plain info values (not the explicit outstanding/pending ones,
// which are always self-colored) read as copper (still open) or neutral
// (settled), per the user's request to make an open stage's values read as
// copper throughout, not just its "still outstanding" line.
function StageDetailContent({ stage, row, isDone }: { stage: number; row: OrderPipelineRow; isDone: boolean }) {
  const rowLabel = { color: DASHBOARD_COLORS.textSecondary, fontSize: 12.5 };
  const rowValue = { fontFamily: "monospace", fontSize: 12.5 };
  const neutralValue = { ...rowValue, color: isDone ? DONE_COLOR : PENDING_COLOR };

  if (stage === 0) {
    const items: [string, boolean][] = [
      ["Style details saved", row.merchandising.styleSaved],
      ["Colour/size breakdown", row.merchandising.breakdownDone],
      ["Material consumption", row.merchandising.consumptionDone],
    ];
    return (
      <>
        {items.map(([label, done]) => (
          <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>{label}</Typography>
            <Typography sx={{ ...rowValue, color: done ? DONE_COLOR : PENDING_COLOR }}>
              {done ? "Done" : "Pending"}
            </Typography>
          </Box>
        ))}
      </>
    );
  }

  if (stage === 1) {
    const a = row.approval;
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Status</Typography>
          <Typography sx={{ ...rowValue, color: a.isApproved ? DONE_COLOR : PENDING_COLOR }}>
            {a.isApproved ? "Approved" : "Pending approval"}
          </Typography>
        </Box>
        {a.isApproved && (
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>Approved by</Typography>
            <Typography sx={neutralValue}>{a.approvedBy} · {a.approvedDate}</Typography>
          </Box>
        )}
      </>
    );
  }

  if (stage === 2) {
    const p = row.supplierPo;
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Raised so far</Typography>
          <Typography sx={neutralValue}>{numberFmt(p.raisedQuantity)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Raised value</Typography>
          <Typography sx={neutralValue}>{moneyFmt(p.raisedValue, p.currency)}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Still to raise (qty)</Typography>
          <Typography sx={{ ...rowValue, color: p.outstandingQuantity > 0 ? PENDING_COLOR : DONE_COLOR }}>
            {numberFmt(p.outstandingQuantity)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Still to raise (value)</Typography>
          <Typography sx={{ ...rowValue, color: p.outstandingValue > 0 ? PENDING_COLOR : DONE_COLOR }}>
            {moneyFmt(p.outstandingValue, p.currency)}
          </Typography>
        </Box>
      </>
    );
  }

  if (stage === 3) {
    const g = row.grn;
    const pendingQty = g.orderedQuantity - g.receivedQuantity;
    const pendingValue = g.orderedValue - g.receivedValue;
    const pct = g.orderedQuantity > 0 ? Math.round((g.receivedQuantity / g.orderedQuantity) * 100) : 0;
    return (
      <>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Received / ordered qty</Typography>
          <Typography sx={neutralValue}>{numberFmt(g.receivedQuantity)} / {numberFmt(g.orderedQuantity)} ({pct}%)</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Qty still to receive</Typography>
          <Typography sx={{ ...rowValue, color: pendingQty > 0 ? PENDING_COLOR : DONE_COLOR }}>
            {numberFmt(pendingQty)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
          <Typography sx={rowLabel}>Amount still to receive</Typography>
          <Typography sx={{ ...rowValue, color: pendingValue > 0 ? PENDING_COLOR : DONE_COLOR }}>
            {moneyFmt(pendingValue)}
          </Typography>
        </Box>
      </>
    );
  }

  if (stage === 4) {
    const p = row.production;
    const pct = p.targetQuantity > 0 ? (p.actualQuantity / p.targetQuantity) * 100 : 0;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <MiniPercentRing pct={pct} done={isDone} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>Produced</Typography>
            <Typography sx={neutralValue}>{numberFmt(p.actualQuantity)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>Target</Typography>
            <Typography sx={neutralValue}>{numberFmt(p.targetQuantity)}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  const s = row.shipment;
  const pendingQty = s.targetQuantity - s.scheduledQuantity;
  const pendingValue = s.targetValue - s.scheduledValue;
  const pct = s.targetQuantity > 0 ? (s.scheduledQuantity / s.targetQuantity) * 100 : 0;
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
        <MiniPercentRing pct={pct} done={isDone} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>Shipped</Typography>
            <Typography sx={neutralValue}>{numberFmt(s.scheduledQuantity)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
            <Typography sx={rowLabel}>Total</Typography>
            <Typography sx={neutralValue}>{numberFmt(s.targetQuantity)}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
        <Typography sx={rowLabel}>Qty still to ship</Typography>
        <Typography sx={{ ...rowValue, color: pendingQty > 0 ? PENDING_COLOR : DONE_COLOR }}>
          {numberFmt(pendingQty)}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5 }}>
        <Typography sx={rowLabel}>Value still to ship</Typography>
        <Typography sx={{ ...rowValue, color: pendingValue > 0 ? PENDING_COLOR : DONE_COLOR }}>
          {moneyFmt(pendingValue)}
        </Typography>
      </Box>
    </>
  );
}

function StageTracker({ row, onStepClick }: { row: OrderPipelineRow; onStepClick: (e: MouseEvent<HTMLElement>, stage: number) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", overflowX: "auto", pb: 0.5 }}>
      {STAGE_LABELS.slice(0, 6).map((label, i) => {
        const done = i < row.stage || row.stage >= 6;
        const current = i === row.stage;
        return (
          <Box key={label} sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 60, position: "relative" }}>
            {i > 0 && (
              <Box sx={{
                position: "absolute", top: 8, left: "-50%", width: "100%", height: 2,
                backgroundColor: done ? DASHBOARD_COLORS.accent : "rgba(191,168,90,0.16)",
              }} />
            )}
            <Box
              onClick={(e) => onStepClick(e, i)}
              sx={{
                width: 17, height: 17, borderRadius: "50%", zIndex: 1, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700, color: DASHBOARD_COLORS.pageBg,
                backgroundColor: done ? DASHBOARD_COLORS.accent : (current ? DASHBOARD_COLORS.pageBg : "rgba(191,168,90,0.16)"),
                border: current ? `2px solid ${PENDING_COLOR}` : "2px solid transparent",
                boxShadow: current ? `0 0 0 3px rgba(201,128,61,0.22)` : "none",
              }}
            >
              {done ? "✓" : ""}
            </Box>
            <Typography sx={{
              fontSize: 10.5, mt: 0.75, textAlign: "center", lineHeight: 1.25, maxWidth: 70,
              color: current ? PENDING_COLOR : DASHBOARD_COLORS.textSecondary,
              fontWeight: current ? 500 : 400,
            }}>
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export default function OrderPipelinePanel() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [popover, setPopover] = useState<{ anchor: HTMLElement; stage: number; row: OrderPipelineRow } | null>(null);

  const { data, isLoading } = useGetOrderPipeline({
    pageNumber: page,
    pageSize: PAGE_SIZE,
    stage: stageFilter,
    search: search.trim() || null,
    overdueOnly: overdueOnly || null,
  });

  const items = data?.items ?? [];
  const stageCounts = data?.stageCounts ?? [0, 0, 0, 0, 0, 0, 0];
  const totalPages = data ? Math.max(1, Math.ceil(data.totalItems / PAGE_SIZE)) : 1;

  const handleStepClick = (e: MouseEvent<HTMLElement>, stage: number, row: OrderPipelineRow) => {
    e.stopPropagation();
    setPopover({ anchor: e.currentTarget, stage, row });
  };

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ color: DASHBOARD_COLORS.textPrimary, fontWeight: 500 }}>
          Order pipeline
        </Typography>
        <TextField
          size="small"
          placeholder="Search buyer, order or style"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          sx={{
            width: 240,
            "& .MuiOutlinedInput-root": { backgroundColor: "#0D1117", color: DASHBOARD_COLORS.textPrimary },
            "& fieldset": { borderColor: DASHBOARD_COLORS.border },
          }}
        />
      </Box>

      {!!data?.overdueCount && (
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, px: 2, py: 1.25,
          borderRadius: 2, backgroundColor: "rgba(201,128,61,0.1)", border: `1px solid rgba(201,128,61,0.32)`,
        }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: PENDING_COLOR, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 13, color: DASHBOARD_COLORS.textPrimary }}>
            <b>{data.overdueCount}</b> {data.overdueCount === 1 ? "order has" : "orders have"} been sitting in the same stage for over {"7"} days.
          </Typography>
          <Button
            size="small"
            onClick={() => { setOverdueOnly((v) => !v); setStageFilter(null); setPage(1); }}
            sx={{ ml: "auto", color: PENDING_COLOR, border: `1px solid rgba(201,128,61,0.4)` }}
          >
            {overdueOnly ? "Show all" : "Show overdue"}
          </Button>
        </Box>
      )}

      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        {STAGE_LABELS.map((label, i) => {
          const active = stageFilter === i;
          return (
            <Grid key={label} size={{ xs: 6, sm: 3, md: 12 / 7 }}>
              <Box
                onClick={() => { setStageFilter(active ? null : i); setPage(1); }}
                sx={{
                  cursor: "pointer", borderRadius: 2, p: 1.25,
                  backgroundColor: active ? "rgba(147,168,60,0.14)" : DASHBOARD_COLORS.cardBg,
                  border: `1px solid ${active ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.border}`,
                }}
              >
                <Typography sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, color: DASHBOARD_COLORS.textSecondary, mb: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: 20, fontWeight: 500, color: DASHBOARD_COLORS.textPrimary }}>
                  {stageCounts[i] ?? 0}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {isLoading ? (
        <Typography sx={{ color: DASHBOARD_COLORS.textSecondary, py: 2 }}>Loading order pipeline...</Typography>
      ) : items.length === 0 ? (
        <Typography sx={{ color: DASHBOARD_COLORS.textSecondary, py: 2 }}>No running orders match this filter.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((row) => (
            <Box
              key={`${row.buyerCode}-${row.order}-${row.typeCode}-${row.styleCode}`}
              sx={{
                display: "grid", gridTemplateColumns: "1.7fr 2.6fr 1fr", gap: 2, alignItems: "center",
                p: 1.75, borderRadius: 2, backgroundColor: DASHBOARD_COLORS.cardBg,
                border: `1px solid ${DASHBOARD_COLORS.border}`,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: DASHBOARD_COLORS.textPrimary }}>{row.buyerName}</Typography>
                <Typography sx={{ fontSize: 12, color: DASHBOARD_COLORS.textSecondary, fontFamily: "monospace" }}>{row.order}</Typography>
                <Typography sx={{ fontSize: 12, color: DASHBOARD_COLORS.textSecondary }}>{row.styleCode}</Typography>
                {row.isOverdue && (
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.75,
                    fontSize: 11, color: PENDING_COLOR, bgcolor: "rgba(201,128,61,0.12)",
                    px: 1, py: 0.25, borderRadius: 1, border: "1px solid rgba(201,128,61,0.28)",
                  }}>
                    ● {row.daysInStage} days in stage
                  </Box>
                )}
              </Box>
              <StageTracker row={row} onStepClick={(e, stage) => handleStepClick(e, stage, row)} />
              <Box sx={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.75 }}>
                {row.stage >= 6 ? (
                  <Chip size="small" label="Fully shipped" sx={{ bgcolor: "rgba(147,168,60,0.16)", color: DONE_COLOR }} />
                ) : (
                  <>
                    <Typography sx={{ fontSize: 12, color: PENDING_COLOR, fontWeight: 500 }}>
                      Currently: {STAGE_LABELS[row.stage]}
                    </Typography>
                    {STAGE_ROUTES[row.stage] ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(STAGE_ROUTES[row.stage]!)}
                        sx={{
                          bgcolor: PENDING_COLOR, color: "#241605", fontSize: 11.5, py: 0.4,
                          "&:hover": { bgcolor: "#E2A756" },
                        }}
                      >
                        {STAGE_ACTION_LABELS[row.stage]}
                      </Button>
                    ) : (
                      <Tooltip title="Part Shipment isn't wired into navigation yet">
                        <span>
                          <Button size="small" variant="outlined" disabled sx={{ fontSize: 11.5, py: 0.4 }}>
                            {STAGE_ACTION_LABELS[row.stage]}
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            sx={{ "& .MuiPaginationItem-root": { color: DASHBOARD_COLORS.textSecondary } }}
          />
        </Box>
      )}

      <Popover
        open={!!popover}
        anchorEl={popover?.anchor ?? null}
        onClose={() => setPopover(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{ paper: { sx: { backgroundColor: "#181f14", border: `1px solid ${DASHBOARD_COLORS.borderStrong}`, borderRadius: 2, p: 1.75, width: 300 } } }}
      >
        {popover && (
          <>
            <Typography sx={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4, color: DASHBOARD_COLORS.accentStrong, mb: 1 }}>
              {STAGE_LABELS[popover.stage]}
            </Typography>
            <StageDetailContent
              stage={popover.stage}
              row={popover.row}
              isDone={popover.stage < popover.row.stage || popover.row.stage >= 6}
            />
          </>
        )}
      </Popover>

      {!isLoading && (stageFilter !== null || search || overdueOnly) && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => { setStageFilter(null); setSearch(""); setOverdueOnly(false); setPage(1); }}
            sx={{
              color: PENDING_COLOR,
              borderColor: PENDING_COLOR,
              "&:hover": { borderColor: PENDING_COLOR, backgroundColor: "rgba(201,128,61,0.1)" },
            }}
          >
            Clear filters
          </Button>
        </Box>
      )}
    </Box>
  );
}
