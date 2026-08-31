import { useMemo, useState } from "react";
import { Alert, Box, Button, Divider, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import { useGetBuyersQuery, useGetAllPurchaseOrdersByBuyerCode } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetStockStatusReportHeaderQuery,
  useGetStockStatusReportLinesQuery,
  useDownloadStockStatusReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/stock-status-report.hooks";
import type { StockStatusReportLine } from "../../../interfaces/orderwise-inventory/stock-status-report.types";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";

// Replicates IN_SSTAT.PRG's "STOCK STATUS REPORT" (Orderwise) - per-Buyer/Order
// current-snapshot listing straight off OrderwiseStock, no date/transaction replay.
export default function StockStatusReportWorkspace() {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [searchedParams, setSearchedParams] = useState<{ buyerCode: number; order: string } | null>(null);

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = buyerPageData?.items ?? [];

  const { data: ordersList = [], isLoading: isOrdersLoading } = useGetAllPurchaseOrdersByBuyerCode(
    selectedBuyer?.buyerCode ?? 0,
    !!selectedBuyer,
  );

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetStockStatusReportHeaderQuery(searchedParams ?? { buyerCode: 0, order: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetStockStatusReportLinesQuery(
    searchedParams ?? { buyerCode: 0, order: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadStockStatusReportPdfMutation();

  const handleBuyerChange = (buyerCode: string) => {
    const buyer = buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
  };

  const handleLoad = () => {
    if (!selectedBuyer || !selectedOrder) return;
    setSearchedParams({ buyerCode: selectedBuyer.buyerCode, order: selectedOrder });
  };

  const handleDownloadPdf = async () => {
    if (!searchedParams) return;
    try {
      await downloadPdf(searchedParams);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  const numericCell = (value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const columns = useMemo<MRT_ColumnDef<StockStatusReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 200 },
      { accessorKey: "unit", header: "Unit", size: 55, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "orderedQuantity",
        header: "Order Qty",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received Qty",
        size: 100,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "balanceToReceive",
        header: "Bal. to Receive",
        size: 105,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "damagedQuantity",
        header: "Damaged Qty",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty in Hand",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "storeCode", header: "Basis", size: 60 },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<StockStatusReportLine>({
    columns,
    data: lines,
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableColumnResizing: false,
    muiTableHeadCellProps: { sx: { whiteSpace: "normal", lineHeight: 1.2 } },
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 15 } },
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${DASHBOARD_COLORS.accent}`, backgroundColor: DASHBOARD_COLORS.cardBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Stock Status Report (Orderwise Inventory)
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || isError || isDownloading}
          >
            {isDownloading ? "Generating..." : "Download PDF"}
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
              onChange={(e) => setSelectedOrder(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
            >
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!selectedBuyer || !selectedOrder}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Select a Buyer and Order, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No Items Assigned to above Order."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Buyer" value={header?.buyerName} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile label="Order" value={header?.order} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
