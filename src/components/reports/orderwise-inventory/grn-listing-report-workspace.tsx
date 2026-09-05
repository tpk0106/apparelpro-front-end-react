import { useMemo, useState } from "react";
import { Alert, Box, Button, Divider, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBasis,
  useGetSuppliersLookup,
} from "../../../tanstack-hooks/custom-hooks";
import {
  useGetGrnListingReportHeaderQuery,
  useGetGrnListingReportLinesQuery,
  useDownloadGrnListingReportPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/grn-listing-report.hooks";
import type { GrnListingReportLine } from "../../../interfaces/orderwise-inventory/grn-listing-report.types";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";

// Unifies legacy IN_GRN3.PRG ("GRN LISTING - DATE WISE", optional Basis filter) and
// IN_GRN4.PRG ("BUYER/ORDER GRN's LISTING", optional Supplier filter) into one
// flexible report - fill in a Date Range for the Date-Wise variant, or a Buyer/Order
// for the Buyer/Order-Wise variant (both can be combined too).
export default function GrnListingReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [storeCode, setStoreCode] = useState<string>("");
  const [supplierCode, setSupplierCode] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    fromDate?: string;
    toDate?: string;
    buyerCode?: number;
    order?: string;
    storeCode?: string;
    supplierCode?: string;
  } | null>(null);

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

  const { data: basisPage, isLoading: isBasisLoading } = useGetBasis({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "description",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const basisList = basisPage?.items ?? [];

  const { data: suppliersList = [], isLoading: isSuppliersLoading } = useGetSuppliersLookup();

  const isReady = !!searchedParams;
  const hasDateRange = !!fromDate && !!toDate;
  const hasBuyerOrder = !!selectedBuyer && !!selectedOrder;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGrnListingReportHeaderQuery(searchedParams ?? {}, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGrnListingReportLinesQuery(
    searchedParams ?? {},
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadGrnListingReportPdfMutation();

  const handleBuyerChange = (buyerCode: string) => {
    const buyer = buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
  };

  const handleLoad = () => {
    if (!hasDateRange && !hasBuyerOrder) return;
    setSearchedParams({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      buyerCode: selectedBuyer?.buyerCode,
      order: selectedOrder || undefined,
      storeCode: storeCode.trim() || undefined,
      supplierCode: supplierCode.trim() || undefined,
    });
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

  const numericCell = (value: number, digits = 2) => value.toLocaleString(undefined, { minimumFractionDigits: digits });

  const columns = useMemo<MRT_ColumnDef<GrnListingReportLine>[]>(
    () => [
      { accessorKey: "transactionDate", header: "Date", size: 90 },
      { accessorKey: "grnNumber", header: "GRN No", size: 75 },
      { accessorKey: "invoiceNumber", header: "Invoice No", size: 90, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "poNumber", header: "PO No", size: 75, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "lcNumber", header: "LC No", size: 90, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "storeCode", header: "Basis", size: 60 },
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "description", header: "Description", size: 180 },
      {
        accessorKey: "quantity",
        header: "Qty",
        size: 80,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "unit", header: "Unit", size: 50, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>(), 4),
      },
      {
        accessorKey: "value",
        header: "Value",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "currency", header: "Curr", size: 55, enableSorting: false },
      { accessorKey: "supplierName", header: "Supplier", size: 160 },
      {
        accessorKey: "buyerCode",
        header: "Buyer",
        size: 130,
        Cell: ({ cell }) => {
          const code = cell.getValue<number>();
          return buyersList.find((b) => b.buyerCode === code)?.name ?? code;
        },
      },
      { accessorKey: "order", header: "Order", size: 90 },
    ],
    [buyersList],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GrnListingReportLine>({
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
    <Box sx={{ width: "95%", mx: "auto", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            GRN Listing (Orderwise Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 1, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="date"
              label="From Date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="date"
              label="To Date"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ ...dropdownFieldSx, ...(dateIconFieldSx as Record<string, unknown>) }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Basis (optional)"
              size="small"
              fullWidth
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              disabled={isBasisLoading}
              slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } }, inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">None</MenuItem>
              {basisList.map((b) => (
                <MenuItem key={b.code} value={b.code}>
                  {b.code} - {b.description}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Buyer (optional)"
              size="small"
              fullWidth
              value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
              onChange={(e) => handleBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
              slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } }, inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">None</MenuItem>
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
              label="Order (optional)"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
              slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } }, inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">None</MenuItem>
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Supplier (optional)"
              size="small"
              fullWidth
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              disabled={isSuppliersLoading}
              slotProps={{ select: { displayEmpty: true, MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } }, inputLabel: { shrink: true } }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">None</MenuItem>
              {suppliersList.map((s) => (
                <MenuItem key={s.supplierCode} value={String(s.supplierCode)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!hasDateRange && !hasBuyerOrder}
              fullWidth
            >
              Load
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
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

        {!isReady ? (
          <Alert severity="info" variant="outlined">
            Enter a Date Range, or select a Buyer/Order (Basis and Supplier are always optional filters), then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No transactions to print."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile
                label="Scope"
                value={
                  header?.fromDate && header?.toDate
                    ? `${header.fromDate} to ${header.toDate}`
                    : header?.buyerCode
                      ? `${header.buyerCode} / ${header.order}`
                      : undefined
                }
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              />
              <KpiTile label="Filter" value={[header?.storeCode, header?.supplierName].filter(Boolean).join(" / ") || "None"} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 3 }} />
              <KpiTile label="Transactions" value={header?.totalTransactions} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile
                label="Total"
                value={header?.totalValueCurrency ? `${numericCell(header.totalValue)} ${header.totalValueCurrency}` : undefined}
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
