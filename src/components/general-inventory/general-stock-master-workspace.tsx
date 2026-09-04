import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Alert,
  Divider,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import { toast } from "react-toastify";

import ConfirmDialog from "../common/confirm-dialog";
import { useApparelProTable } from "../../themes/useApparelProTable";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import {
  useGetMaterialCatalog,
  useGetDynamicFeatureHeaders,
} from "../../tanstack-hooks/material-consumption-entry.hooks";
import { useGetUnits, useGetCurrenciesQuery } from "../../tanstack-hooks/custom-hooks";
import {
  useCreateGeneralStockMasterMutation,
  useUpdateGeneralStockMasterMutation,
  useGetGeneralStockMastersByStoreQuery,
  useDeleteGeneralStockMasterMutation,
} from "../../tanstack-hooks/general-inventory/general-stock-master.hooks";
import type { Unit } from "../../interfaces/references/Unit";
import type { GeneralStockMasterRow } from "../../interfaces/general-inventory/general-stock-master.types";
import type { AppError } from "../../auth/axiosClient";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import {
  primaryActionButtonSx,
  themedButtonLabelStyle,
  workspaceHeadingSx,
  workspaceSectionLabelSx,
  noteTableHeadCellUppercaseSx,
  selectedRowHighlightSx,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";

// Replicates GI_TPDT1.PRG's "GENERAL STOCK MASTER CREATION" entry screen - the one
// screen that actually creates a GeneralStockMaster row (every other General Inventory
// note validates against it but never auto-creates). Stock/Item/Feature picking reuses
// Order Management's own material catalog (same StockItems/OrderItemFeatures/
// ItemFeatures tables), since General Inventory items share that catalog.
//
// Editing an existing row (row action below) deliberately skips the Stock/Item/Feature
// picker entirely and goes straight to a metadata-only update - see
// IGeneralStockMasterService.UpdateGeneralStockMasterAsync for why: rows bulk-imported
// from legacy gi_stmst.dbf data may have no matching StockItems catalog entry at all,
// so re-running them through the catalog-validated create path would reject them.
export default function GeneralStockMasterWorkspace() {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };
  const { mutateAsync: commitEntry, isPending: isSubmitting } =
    useCreateGeneralStockMasterMutation();
  const { mutateAsync: updateEntry, isPending: isUpdating } =
    useUpdateGeneralStockMasterMutation();
  const { mutateAsync: deleteEntry, isPending: isDeleting } =
    useDeleteGeneralStockMasterMutation();

  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedStockCode, setSelectedStockCode] = useState<string>("");
  const [selectedItemCode, setSelectedItemCode] = useState<string>("");
  const [feature1, setFeature1] = useState<string>("");
  const [feature2, setFeature2] = useState<string>("");
  const [feature3, setFeature3] = useState<string>("");
  const [feature4, setFeature4] = useState<string>("");

  const [description, setDescription] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [currencyCode, setCurrencyCode] = useState<string>("");
  const [reorderLevel, setReorderLevel] = useState<number>(0);
  const [reorderQuantity, setReorderQuantity] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [maxStock, setMaxStock] = useState<number>(0);

  // Non-null while editing an existing row - holds the composite ItemCode being
  // edited, so the Stock/Item/Feature picker section can be hidden and Save routes to
  // the update mutation instead of create.
  const [editTarget, setEditTarget] = useState<GeneralStockMasterRow | null>(null);
  const isEditing = !!editTarget;

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ itemCode: string; description: string } | null>(null);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();
  const { data: catalog = [], isLoading: isCatalogLoading } = useGetMaterialCatalog(!isEditing);
  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const systemUnits = useMemo(() => unitsPageData?.items || [], [unitsPageData]);

  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const currenciesList = useMemo(() => currencyPageData?.items ?? [], [currencyPageData]);

  const { data: featureHeaders } = useGetDynamicFeatureHeaders({
    stockCode: selectedStockCode,
    itemCode: selectedItemCode,
  });

  const { data: existingItems = [], isFetching: isExistingLoading } =
    useGetGeneralStockMastersByStoreQuery(selectedStore, !!selectedStore);

  const itemsForSelectedStock = useMemo(
    () => catalog.find((g) => g.stockCode === selectedStockCode)?.items ?? [],
    [catalog, selectedStockCode],
  );

  const hasAnyFeatureDefined =
    !isEditing &&
    !!featureHeaders &&
    (featureHeaders.feature1 || featureHeaders.feature2 || featureHeaders.feature3 || featureHeaders.feature4);

  const isHeaderValid =
    isEditing || (selectedStore.trim() !== "" && selectedStockCode.trim() !== "" && selectedItemCode.trim() !== "");
  const isFormValid =
    isHeaderValid &&
    description.trim() !== "" &&
    unit.trim() !== "" &&
    currencyCode.trim() !== "" &&
    (!hasAnyFeatureDefined ||
      [
        [featureHeaders?.feature1, feature1],
        [featureHeaders?.feature2, feature2],
        [featureHeaders?.feature3, feature3],
        [featureHeaders?.feature4, feature4],
      ].every(([label, value]) => !label || (value ?? "").trim() !== ""));

  const handleResetLine = () => {
    setEditTarget(null);
    setSelectedStockCode("");
    setSelectedItemCode("");
    setFeature1("");
    setFeature2("");
    setFeature3("");
    setFeature4("");
    setDescription("");
    setUnit("");
    setCurrencyCode("");
    setReorderLevel(0);
    setReorderQuantity(0);
    setMinStock(0);
    setMaxStock(0);
    setCommitErrorMessage(null);
  };

  const handleStartEdit = (row: GeneralStockMasterRow) => {
    setEditTarget(row);
    setSelectedStockCode("");
    setSelectedItemCode("");
    setFeature1("");
    setFeature2("");
    setFeature3("");
    setFeature4("");
    setDescription(row.description);
    setUnit(row.unit);
    setCurrencyCode(row.currency);
    setReorderLevel(row.reorderLevel);
    setReorderQuantity(row.reorderQuantity);
    setMinStock(row.minStock);
    setMaxStock(row.maxStock);
    setCommitErrorMessage(null);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        isEditing
          ? "Validation Error: Description, Unit and Currency are required before saving."
          : "Validation Error: Complete the Stock/Item selection, all defined Feature values, Description, Unit and Currency before saving.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);

    const toastId = toast.loading(isEditing ? "Updating Stock Master entry..." : "Saving Stock Master entry...");

    try {
      if (isEditing && editTarget) {
        await updateEntry({
          storeCode: editTarget.storeCode,
          itemCode: editTarget.itemCode,
          description,
          unit,
          currencyCode,
          reorderLevel,
          reorderQuantity,
          minStock,
          maxStock,
        });
      } else {
        await commitEntry({
          storeCode: selectedStore,
          stockCode: selectedStockCode,
          itemCode: selectedItemCode,
          feature1: featureHeaders?.feature1 ? feature1 : null,
          feature2: featureHeaders?.feature2 ? feature2 : null,
          feature3: featureHeaders?.feature3 ? feature3 : null,
          feature4: featureHeaders?.feature4 ? feature4 : null,
          description,
          unit,
          currencyCode,
          reorderLevel,
          reorderQuantity,
          minStock,
          maxStock,
        });
      }
      toast.update(toastId, {
        render: isEditing ? "Stock Master entry updated successfully!" : "Stock Master entry saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetLine();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg = appError?.message || "Failed to save Stock Master entry.";
      setCommitErrorMessage(serverMsg);
      toast.update(toastId, {
        render: serverMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  const handleRequestDelete = (itemCode: string, itemDescription: string) => {
    setDeleteTarget({ itemCode, description: itemDescription });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEntry({ storeCode: selectedStore, itemCode: deleteTarget.itemCode });
      toast.success("Stock Master item deleted successfully!");
      if (editTarget?.itemCode === deleteTarget.itemCode) handleResetLine();
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to delete item.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<MRT_ColumnDef<GeneralStockMasterRow>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      { accessorKey: "currency", header: "Curr", size: 70, enableSorting: false },
      {
        accessorKey: "qtyInHand",
        header: "Qty In Hand",
        size: 160,
        Cell: ({ cell }) => <span>{cell.getValue<number>().toLocaleString()}</span>,
      },
    ],
    [],
  );

  const table = useApparelProTable<GeneralStockMasterRow>({
    muiTableHeadCellProps: noteTableHeadCellUppercaseSx,
    columns,
    data: existingItems,
    enableEditing: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableRowActions: true,
    positionActionsColumn: "last",
    // "grid" sizes columns to their declared `size` instead of auto-stretching
    // to fill the parent Paper's full width - combined with the fit-content
    // Paper width below, the table shrinks to its actual content width
    // instead of leaving a wide empty gap after the last column.
    layoutMode: "grid",
    // fit-content shrinks the Paper to the columns' actual total width; mx:
    // "auto" then centers that narrower block in the page instead of leaving
    // it flush against the left edge (nothing else sits beside this table).
    muiTablePaperProps: { sx: { width: "fit-content", maxWidth: "100%", mx: "auto", boxShadow: "none" } },
    displayColumnDefOptions: {
      "mrt-row-actions": { header: "Action", size: 90 },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: selectedRowHighlightSx(row.original.itemCode === editTarget?.itemCode),
    }),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton color="primary" size="small" onClick={() => handleStartEdit(row.original)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          size="small"
          disabled={isDeleting || row.original.qtyInHand > 0}
          onClick={() => handleRequestDelete(row.original.itemCode, row.original.description)}
          sx={deleteRowIconButtonSx}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    ),
    initialState: { density: "compact", pagination: { pageIndex: 0, pageSize: 15 } },
    state: {
      isLoading: isExistingLoading,
      showProgressBars: isExistingLoading,
    },
  });

  return (
    <Box sx={{ width: "100%", py: 1, px: 3 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: DASHBOARD_COLORS.pageBg }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={workspaceHeadingSx}>
            Stock Master Entry (General Inventory)
          </Typography>
          {isEditing && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutlinedIcon />}
              onClick={handleResetLine}
            >
              New Item
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Stores"
              size="small"
              fullWidth
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                handleResetLine();
              }}
              disabled={isStoresLoading}
              sx={dropdownFieldSx}
              slotProps={dropdownMenuSlotProps}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {isEditing ? (
            <Grid size={{ xs: 12, sm: 8, md: 9 }}>
              <Alert severity="info" variant="outlined" sx={{ py: 0.5, color: DASHBOARD_COLORS.textPrimary }}>
                Editing <strong>{editTarget?.itemCode}</strong> — {editTarget?.description}
              </Alert>
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  select
                  label="Stock Category"
                  size="small"
                  fullWidth
                  value={selectedStockCode}
                  onChange={(e) => {
                    setSelectedStockCode(e.target.value);
                    setSelectedItemCode("");
                  }}
                  disabled={isCatalogLoading}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {catalog.map((g) => (
                    <MenuItem key={g.stockCode} value={g.stockCode}>
                      {g.description} [{g.stockCode}]
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <TextField
                  select
                  label="Item Code"
                  size="small"
                  fullWidth
                  value={selectedItemCode}
                  onChange={(e) => setSelectedItemCode(e.target.value)}
                  disabled={!selectedStockCode}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {itemsForSelectedStock.map((item) => (
                    <MenuItem key={item.itemCode} value={item.itemCode}>
                      {item.description} [{item.itemCode}]
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {commitErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommitErrorMessage(null)}>
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderValid ? (
          <Alert severity="info" variant="outlined" sx={{ m: 2, fontWeight: "bold", color: DASHBOARD_COLORS.textPrimary }}>
            Select a Store, Stock Category and Item Code to continue.
          </Alert>
        ) : (
          <>
            <Grid container spacing={2}>
              {!isEditing && featureHeaders?.feature1 && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label={featureHeaders.feature1}
                    size="small"
                    fullWidth
                    value={feature1}
                    onChange={(e) => setFeature1(e.target.value.toUpperCase())}
                    slotProps={{ htmlInput: { maxLength: 4 } }}
                    sx={dropdownFieldSx}
                  />
                </Grid>
              )}
              {!isEditing && featureHeaders?.feature2 && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label={featureHeaders.feature2}
                    size="small"
                    fullWidth
                    value={feature2}
                    onChange={(e) => setFeature2(e.target.value.toUpperCase())}
                    slotProps={{ htmlInput: { maxLength: 4 } }}
                    sx={dropdownFieldSx}
                  />
                </Grid>
              )}
              {!isEditing && featureHeaders?.feature3 && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label={featureHeaders.feature3}
                    size="small"
                    fullWidth
                    value={feature3}
                    onChange={(e) => setFeature3(e.target.value.toUpperCase())}
                    slotProps={{ htmlInput: { maxLength: 4 } }}
                    sx={dropdownFieldSx}
                  />
                </Grid>
              )}
              {!isEditing && featureHeaders?.feature4 && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label={featureHeaders.feature4}
                    size="small"
                    fullWidth
                    value={feature4}
                    onChange={(e) => setFeature4(e.target.value.toUpperCase())}
                    slotProps={{ htmlInput: { maxLength: 4 } }}
                    sx={dropdownFieldSx}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={dropdownFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Unit"
                  size="small"
                  fullWidth
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {systemUnits.map((u: Unit) => (
                    <MenuItem key={u.id} value={u.code}>
                      {u.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Currency"
                  size="small"
                  fullWidth
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  sx={dropdownFieldSx}
                  slotProps={dropdownMenuSlotProps}
                >
                  {currenciesList.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  type="number"
                  label="Re-order Level"
                  size="small"
                  fullWidth
                  value={reorderLevel === 0 ? "" : reorderLevel}
                  onChange={(e) => setReorderLevel(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  type="number"
                  label="Re-order Quantity"
                  size="small"
                  fullWidth
                  value={reorderQuantity === 0 ? "" : reorderQuantity}
                  onChange={(e) => setReorderQuantity(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  type="number"
                  label="Min. Stock"
                  size="small"
                  fullWidth
                  value={minStock === 0 ? "" : minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  type="number"
                  label="Max. Stock"
                  size="small"
                  fullWidth
                  value={maxStock === 0 ? "" : maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                gap: 2,
                mt: 3,
                pt: 2,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleResetLine}
                disabled={isSubmitting || isUpdating}
                sx={{ minWidth: 190, height: 32, color: "#8B93A1", borderColor: "#8B93A1" }}
              >
                {isEditing ? "Cancel" : "Clear"}
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || isUpdating || !isFormValid}
                sx={{
                  ...primaryActionButtonSx,
                  minWidth: 190,
                  height: 32,
                  "&.Mui-disabled": {
                    background: "rgba(139,147,161,0.15)",
                    color: "#8B93A1",
                    border: "1px solid rgba(139,147,161,0.4)",
                    boxShadow: "none",
                  },
                }}
              >
                <span style={themedButtonLabelStyle}>
                  {isEditing ? "Update Stock Master" : "Save Stock Master"}
                </span>
              </Button>
            </Box>
          </>
        )}

        {selectedStore && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle2" sx={{ ...workspaceSectionLabelSx, mb: 1 }}>
              Existing Items at {selectedStore}
            </Typography>
            <MaterialReactTable table={table} />
          </>
        )}
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title={isEditing ? "Confirm Stock Master Update" : "Confirm Stock Master Entry"}
        message={isEditing ? "Update this Stock Master item?" : "Save this Stock Master entry?"}
        confirmLabel={isEditing ? "Confirm & Update" : "Confirm & Save"}
        confirmColor="primary"
        isConfirming={isSubmitting || isUpdating}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Stock Master Item"
        message={`Delete '${deleteTarget?.description}' from Store '${selectedStore}'? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
