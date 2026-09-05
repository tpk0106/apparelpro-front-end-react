import { useState } from "react";
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
import type { MRT_PaginationState } from "material-react-table";
import { toast } from "react-toastify";

import StockMovementItemReportGrid from "./stock-movement-item-report-grid";
import KpiTile from "../common/kpi-tile";
import {
  useGetStockMovementItemOptionsQuery,
  useGetStockMovementItemReportHeaderQuery,
  useGetStockMovementItemReportLinesQuery,
  useDownloadStockMovementItemReportPdfMutation,
} from "../../tanstack-hooks/stock-movement-item-report.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceInfoCaptionSx,
} from "../../themes/workspace-theme";

export default function StockMovementItemReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList: Buyer[] = buyerPageData?.items ?? [];

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const { data: itemsList = [], isLoading: isItemsLoading } =
    useGetStockMovementItemOptionsQuery(
      selectedBuyer?.buyerCode ?? 0,
      selectedOrder,
      !!selectedBuyer && !!selectedOrder,
    );

  const isReady = !!selectedBuyer && !!selectedOrder && !!selectedItemCode;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError: isHeaderError,
    error: headerError,
  } = useGetStockMovementItemReportHeaderQuery(
    selectedBuyer?.buyerCode ?? 0,
    selectedOrder,
    selectedItemCode,
    isReady,
  );

  const {
    data: linesPage,
    isLoading: isLinesLoading,
    isError: isLinesError,
  } = useGetStockMovementItemReportLinesQuery(
    {
      buyerCode: selectedBuyer?.buyerCode ?? 0,
      order: selectedOrder,
      itemCode: selectedItemCode,
      pageSize: pagination.pageSize,
      currentPage: pagination.pageIndex + 1,
    },
    isReady && !isHeaderError,
  );

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadStockMovementItemReportPdfMutation();

  const handleBuyerChange = (buyerCode: string) => {
    const buyer = buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setSelectedItemCode("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setSelectedItemCode("");
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleItemChange = (itemCode: string) => {
    setSelectedItemCode(itemCode);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleExportPdf = async () => {
    if (!selectedBuyer || !selectedOrder || !selectedItemCode) return;
    try {
      await downloadPdf({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        itemCode: selectedItemCode,
      });
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF report.");
    }
  };

  return (
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper
        elevation={3}
        sx={{
          px: { xs: 1, sm: 1.5, md: 2 },
          py: 3,
          width: "100%",
          backgroundColor: DASHBOARD_COLORS.pageBg,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Stock Movement — for an Item
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Buyer"
              size="small"
              fullWidth
              value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
              onChange={(e) => handleBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Order"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="Item"
              size="small"
              fullWidth
              value={selectedItemCode}
              onChange={(e) => handleItemChange(e.target.value)}
              disabled={!selectedOrder || isItemsLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {itemsList.map((item) => (
                <MenuItem key={item.itemCode} value={item.itemCode}>
                  {item.itemCode} — {item.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPdf}
            disabled={!isReady || isHeaderError || isDownloading}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Export PDF"}
            </span>
          </Button>
        </Box>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Buyer, Order and Item to load its stock movement history.
          </Alert>
        ) : isHeaderError ? (
          <Alert severity="error" variant="outlined">
            {(headerError as AppError)?.message ??
              "Unable to load this item's stock movement history."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <KpiTile
                label="Description"
                value={header?.description}
                loading={isHeaderLoading}
                size={{ xs: 12, sm: 6, md: 5 }}
              />
              <KpiTile
                label="Unit"
                value={header?.unit}
                loading={isHeaderLoading}
                size={{ xs: 12, sm: 6, md: 1 }}
              />
              <KpiTile
                label="Order Qty"
                value={header?.orderQuantity.toLocaleString()}
                loading={isHeaderLoading}
                size={{ xs: 12, sm: 6, md: 2 }}
              />
              <KpiTile
                label="Transactions"
                value={header?.transactionCount}
                loading={isHeaderLoading}
                size={{ xs: 12, sm: 6, md: 2 }}
              />
              <KpiTile
                label="Closing Balance"
                value={header?.closingBalance.toLocaleString()}
                loading={isHeaderLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 2 }}
              />
            </Grid>

            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 2 }}>
              <LegendItem color="#0ca30c" label="Inbound (GRN / Transfer In / Return / Additional Receipt)" />
              <LegendItem color="#d03b3b" label="Outbound (GIN / Damaged / Transfer Out / Supplier Return)" />
              <LegendItem color="#8b93a1" label="No balance effect (STRN / Stock Adjustment / Additional Issue Note)" />
            </Box>

            <StockMovementItemReportGrid
              data={linesPage?.items ?? []}
              itemsCount={linesPage?.totalItems ?? 0}
              isLoading={isLinesLoading}
              isError={isLinesError}
              pagination={pagination}
              setPagination={setPagination}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" sx={workspaceInfoCaptionSx}>
              * Additional Issue Note (4X) is shown for reference but never affects
              the running balance, and Stock Adjustment Note (3A) sets the balance
              directly rather than adding to it.
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: "3px", backgroundColor: color }} />
      <Typography variant="caption" sx={workspaceInfoCaptionSx}>
        {label}
      </Typography>
    </Box>
  );
}
