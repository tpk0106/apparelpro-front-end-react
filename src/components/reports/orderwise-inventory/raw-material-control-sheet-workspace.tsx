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
  useGetRawMaterialControlSheetHeaderQuery,
  useGetRawMaterialControlSheetLinesQuery,
  useDownloadRawMaterialControlSheetPdfMutation,
} from "../../../tanstack-hooks/orderwise-inventory/raw-material-control-sheet.hooks";
import type { RawMaterialControlSheetLine } from "../../../interfaces/orderwise-inventory/raw-material-control-sheet.types";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { AppError } from "../../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
} from "../../../themes/workspace-theme";

// Replicates IN_RMCON.PRG's "RAW MATERIAL CONTROL SHEET" - per-Buyer/Order material
// consumption (across every style/color/size sharing the same raw-material item)
// vs Order/Received/Issued/Balance quantities.
export default function RawMaterialControlSheetWorkspace() {
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
  } = useGetRawMaterialControlSheetHeaderQuery(searchedParams ?? { buyerCode: 0, order: "" }, isReady);
  const { data: lines = [], isLoading: isLinesLoading } = useGetRawMaterialControlSheetLinesQuery(
    searchedParams ?? { buyerCode: 0, order: "" },
    isReady && !isError,
  );
  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadRawMaterialControlSheetPdfMutation();

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

  const columns = useMemo<MRT_ColumnDef<RawMaterialControlSheetLine>[]>(
    () => [
      { accessorKey: "stockDescription", header: "Stock Type", size: 120 },
      { accessorKey: "itemCode", header: "Item Code", size: 150 },
      { accessorKey: "description", header: "Description", size: 190 },
      { accessorKey: "unit", header: "Unit", size: 55, enableSorting: false, enableColumnFilter: false },
      {
        accessorKey: "totalConsumption",
        header: "Total Consumption",
        size: 100,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "exactConsumption",
        header: "Exact Consumption",
        size: 100,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalOrderQuantity",
        header: "Order Qty",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalReceivedQuantity",
        header: "Received Qty",
        size: 95,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "totalIssuedQuantity",
        header: "Issued Qty",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 90,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 85,
        Cell: ({ cell }) => numericCell(cell.getValue<number>()),
      },
      { accessorKey: "currency", header: "Curr", size: 55, enableSorting: false, enableColumnFilter: false },
    ],
    [],
  );

  const isLoading = isHeaderLoading || isLinesLoading;

  const table = useApparelProTable<RawMaterialControlSheetLine>({
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
            Raw Material Control Sheet (Orderwise Inventory)
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
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
            Select a Buyer and Order, then click Load.
          </Alert>
        ) : isError ? (
          <Alert severity="error" variant="outlined">
            {error?.message ?? "No Material Consumptions for given Buyer/Order."}
          </Alert>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2.5, flexDirection: "row" }} wrap="nowrap">
              <KpiTile label="Buyer / Order" value={header ? `${selectedBuyer?.name ?? header.buyerCode} / ${header.order}` : undefined} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile label="Item" value={header?.itemDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 4, lg: 4 }} />
              <KpiTile
                label="Order Qty"
                value={header ? `${numericCell(header.orderQuantity)} ${header.unit}` : undefined}
                loading={isLoading}
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
              />
              <KpiTile label="Line Items" value={header?.totalLineItems} loading={isLoading} color="#60a5fa" size={{ xs: 12, sm: 6, md: 2, lg: 2 }} />
            </Grid>
            <MaterialReactTable table={table} />
            <Divider sx={{ my: 2 }} />
          </>
        )}
      </Paper>
    </Box>
  );
}
