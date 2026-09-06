import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import { useApparelProTable } from "../../../themes/useApparelProTable";
import KpiTile from "../../common/kpi-tile";
import { useGetGeneralStoresQuery } from "../../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetSuppliersLookup } from "../../../tanstack-hooks/custom-hooks";
import {
  useGetGeneralGrnListingReportHeaderQuery,
  useGetGeneralGrnListingReportLinesQuery,
  useDownloadGeneralGrnListingReportPdfMutation,
} from "../../../tanstack-hooks/general-inventory/general-grn-listing-report.hooks";
import type { GeneralGrnListingReportLine } from "../../../interfaces/general-inventory/general-grn-listing-report.types";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  dateIconFieldSx,
} from "../../../themes/workspace-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";

// Replicates GI_GRN4.PRG ("GRN LISTING - DATE WISE") and GI_GRN5.PRG ("GRN LISTING -
// SUPPLIER WISE") as one flexible report - leave Store/Supplier blank for the
// Date-Wise variant, fill them in for the Supplier-Wise variant.
export default function GeneralGrnListingReportWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } =
    useDropdownTheme();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [storeCode, setStoreCode] = useState<string>("");
  const [supplierCode, setSupplierCode] = useState<string>("");

  const [searchedParams, setSearchedParams] = useState<{
    fromDate: string;
    toDate: string;
    storeCode?: string;
    supplierCode?: string;
  } | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();
  const { data: suppliersList = [], isLoading: isSuppliersLoading } = useGetSuppliersLookup();

  const isReady = !!searchedParams;

  const {
    data: header,
    isLoading: isHeaderLoading,
    isError,
    error,
  } = useGetGeneralGrnListingReportHeaderQuery(searchedParams ?? { fromDate: "", toDate: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetGeneralGrnListingReportLinesQuery(
    searchedParams ?? { fromDate: "", toDate: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGeneralGrnListingReportPdfMutation();

  const handleLoad = () => {
    if (!fromDate || !toDate) return;
    setSearchedParams({
      fromDate,
      toDate,
      storeCode: storeCode || undefined,
      supplierCode: supplierCode || undefined,
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

  const columns = useMemo<MRT_ColumnDef<GeneralGrnListingReportLine>[]>(
    () => [
      { accessorKey: "transactionDate", header: "Date", size: 90 },
      { accessorKey: "grnNumber", header: "GRN No", size: 75 },
      { accessorKey: "invoiceNumber", header: "Invoice No", size: 90, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "poNumber", header: "D/O No", size: 75, Cell: ({ cell }) => cell.getValue<string | null>() ?? "" },
      { accessorKey: "supplierName", header: "Supplier", size: 160 },
      { accessorKey: "storeCode", header: "Store", size: 60 },
      { accessorKey: "itemCode", header: "Item Code", size: 120 },
      { accessorKey: "description", header: "Description", size: 180 },
      { accessorKey: "unit", header: "Unit", size: 50, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>(), 4),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<GeneralGrnListingReportLine>({
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
            GRN Listing (General Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
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
              label="Store (optional)"
              size="small"
              fullWidth
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              disabled={isStoresLoading}
              slotProps={{
                select: {
                  displayEmpty: true,
                  MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } },
                },
                inputLabel: { shrink: true },
              }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">All Stores</MenuItem>
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Supplier (optional)"
              size="small"
              fullWidth
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              disabled={isSuppliersLoading}
              slotProps={{
                select: {
                  displayEmpty: true,
                  MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } },
                },
                inputLabel: { shrink: true },
              }}
              sx={dropdownFieldSx}
            >
              <MenuItem value="">All Suppliers</MenuItem>
              {suppliersList.map((s) => (
                <MenuItem key={s.supplierCode} value={String(s.supplierCode)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleLoad}
              disabled={!fromDate || !toDate}
              fullWidth
              sx={primaryActionButtonSx}
            >
              <span style={themedButtonLabelStyle}>Load</span>
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
            Select a From/To Date (Store and Supplier are optional), then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No transactions to print."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile
                label="Date Range"
                value={header ? `${header.fromDate} to ${header.toDate}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              />
              <KpiTile
                label="Filter"
                value={
                  header?.storeCode || header?.supplierCode
                    ? [header?.storeDescription, header?.supplierName].filter(Boolean).join(" / ")
                    : "All Stores / Suppliers"
                }
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
              />
              <KpiTile label="Transactions" value={header?.totalTransactions} loading={isLoading} size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
              <KpiTile label="Total Value" value={header ? numericCell(header.totalValue) : undefined} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
