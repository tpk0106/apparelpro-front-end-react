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
  useGetStockValuationReportHeaderQuery,
  useGetStockValuationReportLinesQuery,
  useDownloadStockValuationReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/stock-valuation-report.hooks";
import type { StockValuationReportLine } from "../../../interfaces/orderwise-inventory/stock-valuation-report.types";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../themes/workspace-theme";

// Replicates IN_SVAL.PRG's "STOCK VALUATION REPORT" - per-Buyer/Order valuation
// grouped by Stock Type, reading OrderwiseStockMaster's live running totals (no
// month/date dimension in legacy, unlike General Inventory's own reports).
export default function StockValuationReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
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
  } = useGetStockValuationReportHeaderQuery(searchedParams ?? { buyerCode: 0, order: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetStockValuationReportLinesQuery(
    searchedParams ?? { buyerCode: 0, order: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadStockValuationReportPdfMutation();

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

  const columns = useMemo<MRT_ColumnDef<StockValuationReportLine>[]>(
    () => [
      {
        id: "label",
        header: "Item / Stock Type",
        size: 200,
        accessorFn: (row) => {
          if (row.rowType === "GrandTotal") return "TOTAL VALUES";
          if (row.rowType === "StockTypeSubtotal") return `${row.stockTypeCode} - ${row.stockTypeDescription} (Total)`;
          return `${row.itemCode} - ${row.description}`;
        },
        Cell: ({ row }) => {
          const line = row.original;
          const bold = line.rowType !== "Item";
          const label =
            line.rowType === "GrandTotal"
              ? "TOTAL VALUES"
              : line.rowType === "StockTypeSubtotal"
                ? `${line.stockTypeCode} - ${line.stockTypeDescription} (Total)`
                : `${line.itemCode} - ${line.description}`;
          return <span style={{ fontWeight: bold ? 700 : 400 }}>{label}</span>;
        },
      },
      { accessorKey: "unit", header: "Unit", size: 50, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "unitPrice",
        header: "U/Price",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "orderedQuantity",
        header: "Order Qty",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedQuantity",
        header: "Rcvd Qty",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "receivedValue",
        header: "Rcvd Value",
        size: 95,
        Cell: ({ row, cell }) => <span style={{ fontWeight: row.original.rowType !== "Item" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>,
      },
      {
        accessorKey: "issuedQuantity",
        header: "Issued Qty",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "issuedValue",
        header: "Issued Value",
        size: 95,
        Cell: ({ row, cell }) => <span style={{ fontWeight: row.original.rowType !== "Item" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>,
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "balanceValue",
        header: "Balance Value",
        size: 100,
        Cell: ({ row, cell }) => <span style={{ fontWeight: row.original.rowType !== "Item" ? 700 : 400 }}>{numericCell(cell.getValue<number>())}</span>,
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<StockValuationReportLine>({
    columns,
    data: lines,
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableColumnResizing: false,
    enableSorting: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    muiTableHeadCellProps: { sx: { whiteSpace: "normal", lineHeight: 1.2 } },
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 25 } },
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: `4px solid ${DASHBOARD_COLORS.accent}`, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Stock Valuation Report (Orderwise Inventory)
          </Typography>
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
            disabled={!isReady || isError || isDownloading}
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>
              {isDownloading ? "Generating..." : "Download PDF"}
            </span>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Order"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
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
              <KpiTile label="Buyer" value={header?.buyerName} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 3 }} />
              <KpiTile label="Order" value={header?.order} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Currency" value={header?.currency} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Received Value"
                value={header ? numericCell(header.totalReceivedValue) : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
              />
              <KpiTile
                label="Balance Value"
                value={header ? numericCell(header.totalBalanceValue) : undefined}
                loading={isLoading}
                color="#60a5fa"
                size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
              />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
