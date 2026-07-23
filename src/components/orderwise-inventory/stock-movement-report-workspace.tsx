import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type {
  MRT_PaginationState,
  MRT_SortingState,
} from "material-react-table";
import { toast } from "react-toastify";

import StockMovementReportGrid from "./stock-movement-report-grid";
import {
  useGetStockMovementReportHeaderQuery,
  useGetStockMovementReportLinesQuery,
  useDownloadStockMovementReportPdfMutation,
} from "../../tanstack-hooks/stock-movement-report.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

// MRT hands back camelCase accessorKeys (e.g. "itemCode"), but BuildLineQuery's
// OrderByColumn resolves sortColumn via a raw Expression.PropertyOrField lookup
// against StockMovementReportLineServiceModel — it needs the exact PascalCase C#
// property name ("ItemCode"), not the camelCase JSON key. Every column here is a
// simple camelCase property, so a capitalize-first-letter is a correct, exact map.
const toPascalCase = (key: string) =>
  key.charAt(0).toUpperCase() + key.slice(1);

// Only these two are supported server-side (StockMovementReportService.GetStockMovementReportLinesAsync
// switches on filterColumn.ToLowerInvariant()).
const FILTER_TARGETS = [
  { value: "itemCode", label: "Item Code" },
  { value: "description", label: "Description" },
];

export default function StockMovementReportWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [filterTarget, setFilterTarget] = useState<string>("itemCode");
  const [filterQuery, setFilterQuery] = useState<string>("");

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery(
    {
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    },
  );
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items ?? [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const isReady = !!selectedBuyer && !!selectedOrder;

  const { data: header, isLoading: isHeaderLoading } =
    useGetStockMovementReportHeaderQuery(
      selectedBuyer?.buyerCode ?? 0,
      selectedOrder,
      isReady,
    );

  const {
    data: linesPage,
    isLoading: isLinesLoading,
    isError: isLinesError,
  } = useGetStockMovementReportLinesQuery(
    {
      buyerCode: selectedBuyer?.buyerCode ?? 0,
      order: selectedOrder,
      pageSize: pagination.pageSize,
      currentPage: pagination.pageIndex + 1,
      sortColumn: sorting[0] ? toPascalCase(sorting[0].id) : null,
      sortOrder: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : null,
      filterColumn: filterQuery ? filterTarget : null,
      filterQuery: filterQuery ? filterQuery : null,
    },
    isReady,
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadStockMovementReportPdfMutation();

  const handleBuyerChange = (buyerCode: string) => {
    const buyer =
      buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleFilterQueryChange = (value: string) => {
    setFilterQuery(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleExportPdf = async () => {
    if (!selectedBuyer || !selectedOrder) return;
    try {
      await downloadPdf({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
      });
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF report.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderTop: "4px solid #60a5fa",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Stock Movement Report — for an Order
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPdf}
            disabled={!isReady || isDownloading}
          >
            {isDownloading ? "Generating..." : "Export PDF"}
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Buyer"
              size="small"
              fullWidth
              value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
              onChange={(e) => handleBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Order"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
            >
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Search In"
              size="small"
              fullWidth
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              disabled={!isReady}
            >
              {FILTER_TARGETS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              label="Search"
              size="small"
              fullWidth
              value={filterQuery}
              onChange={(e) => handleFilterQueryChange(e.target.value)}
              disabled={!isReady}
            />
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Buyer and Order to load its stock movement history.
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <KpiTile
                label="Line Items"
                value={header?.totalLineItems}
                loading={isHeaderLoading}
              />
              <KpiTile
                label="Fully Received"
                value={
                  header
                    ? `${header.fullyReceivedCount} / ${header.totalLineItems}`
                    : undefined
                }
                loading={isHeaderLoading}
                color="#0ca30c"
              />
              <KpiTile
                label="Items w/ Damage"
                value={header?.damagedItemCount}
                loading={isHeaderLoading}
                color="#fab219"
              />
              <KpiTile
                label="Items w/ Shortfall"
                value={header?.shortfallCount}
                loading={isHeaderLoading}
                color="#d03b3b"
              />
            </Grid>

            <Box
              sx={{
                display: "flex",
                gap: 2.5,
                flexWrap: "wrap",
                mb: 2,
              }}
            >
              <LegendItem
                color="#0ca30c"
                label="Inbound (Received / Transfer In)"
              />
              <LegendItem
                color="#d03b3b"
                label="Outbound (Issued / Transfer Out / Ret. to Supplier)"
              />
              <LegendItem color="#fab219" label="Discrepancy (Damaged)" />
            </Box>

            <StockMovementReportGrid
              data={linesPage?.items ?? []}
              itemsCount={linesPage?.totalItems ?? 0}
              isLoading={isLinesLoading}
              isError={isLinesError}
              pagination={pagination}
              setPagination={setPagination}
              sorting={sorting}
              setSorting={setSorting}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              * Transfer In/Out, Supplier Return and Last Adjustment currently
              always show 0 — Order Wise Inventory doesn't have Stock Transfer,
              Supplier Return or Stock Adjustment Note modules yet. These
              columns start reflecting real figures automatically once those
              modules are built and post their transactions, with no changes
              needed here.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}

function KpiTile({
  label,
  value,
  loading,
  color,
}: {
  label: string;
  value: number | string | undefined;
  loading: boolean;
  color?: string;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
        {/* Same fix as StrnPrintReportWorkspace's InfoTile: this Paper has no
            background override, so it inherits the dark theme's background.paper
            (#141922). color="text.secondary" / the "inherit" default both silently
            resolved to near-black here instead of the theme's actual secondary
            color, so both are hardcoded rather than trusted a second time. */}
        <Typography
          variant="caption"
          sx={{ textTransform: "uppercase", color: "#8B93A1" }}
        >
          {label}
        </Typography>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: color ?? "#F4F6F8" }}
        >
          {loading ? "…" : (value ?? "—")}
        </Typography>
      </Paper>
    </Grid>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "3px",
          backgroundColor: color,
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
