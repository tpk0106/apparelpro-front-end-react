import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type {
  StyleContext,
  StyleMaterialConsumptionLedgerRow,
} from "./material-consumption.types";

import { toast } from "react-toastify";

// 1. Ensure you import your new hook at the very top of your grid file:
import { useDeleteConsumptionEntryMutation } from "../../tanstack-hooks/material-consumption-entry.hooks";
import type { AppError } from "../../auth/axiosClient";

import EditIcon from "@mui/icons-material/Edit"; // Add this icon import
import { useApparelProTable } from "../../themes/useApparelProTable";
import ConfirmDialog from "../common/confirm-dialog";
import CopyFromStyleDialog from "./copy-from-style-dialog.component";

interface LedgerGridProps {
  styleContext: StyleContext;
  ledgerData: StyleMaterialConsumptionLedgerRow[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditRowSelect: (row: StyleMaterialConsumptionLedgerRow) => void; // 1. Add this prop interface route
  editingRow: StyleMaterialConsumptionLedgerRow | null; // Highlights the row currently loaded in the form
}

export default function ConsumptionLedgerGrid({
  styleContext,
  ledgerData,
  isLoading,
  onRefresh,
  onEditRowSelect,
  editingRow,
}: LedgerGridProps) {
  // Shared match check for "is this the row currently loaded into the edit
  // form" - used both for the row-level highlight and, since a column's own
  // muiTableBodyCellProps completely replaces (not merges with) the
  // table-level default, for the two columns below that define their own
  // cell props (otherwise those two columns' cells would never pick up the
  // highlight while every other column's cell did).
  const isEditingRowMatch = (
    row: StyleMaterialConsumptionLedgerRow,
  ): boolean =>
    !!editingRow &&
    row.stockCode === editingRow.stockCode &&
    row.itemCode === editingRow.itemCode &&
    (row.color || "") === (editingRow.color || "") &&
    (row.size || "") === (editingRow.size || "") &&
    row.feature1 === editingRow.feature1 &&
    row.feature2 === editingRow.feature2 &&
    row.feature3 === editingRow.feature3 &&
    row.feature4 === editingRow.feature4;

  // 1. Define the Columns structure matching your exact PascalCase property dictionary names
  const columns = useMemo<MRT_ColumnDef<StyleMaterialConsumptionLedgerRow>[]>(
    () => [
      {
        // Material name/description instead of the raw 4-char ItemCode -
        // ItemCode is still sent to the backend on edit/delete, just not
        // shown as its own column anymore. Wraps onto multiple lines instead
        // of forcing horizontal scroll when the description is long.
        accessorKey: "description",
        header: "Material",
        size: 150,
        muiTableBodyCellProps: ({ row }) => ({
          sx: {
            fontWeight: "bold",
            fontSize: "0.78rem",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.3,
            ...(isEditingRowMatch(row.original) && {
              backgroundColor: "#ffca28 !important",
              color: "#3e2723 !important",
            }),
          },
        }),
      },
      {
        // Colour + Size merged into one column to save horizontal space.
        header: "Colour / Size",
        size: 100,
        accessorFn: (row) =>
          `${row.color || "ALL COLOURS"} / ${row.size || "ALL SIZES"}`,
      },
      {
        // Combined virtual column replicating the Clipper feature string block row summary display
        header: "Config (Ft1-4)",
        size: 110,
        accessorFn: (row) =>
          `${row.feature1 || "-"}/${row.feature2 || "-"}/${row.feature3 || "-"}/${row.feature4 || "-"}`,
      },
      {
        accessorKey: "consumptionUnit",
        header: "C/Unit",
        size: 55,
      },
      {
        accessorKey: "quantityPerGarment",
        header: "Qty/Garm",
        size: 70,
        type: "number",
        Cell: ({ cell }) => cell.getValue<number>().toFixed(3),
      },
      {
        accessorKey: "percentageAllowance",
        header: "Allow.%",
        size: 55,
        type: "number",
        Cell: ({ cell }) => `${cell.getValue<number>().toFixed(1)}%`,
      },
      {
        accessorKey: "itemUnit",
        header: "F/Unit",
        size: 55,
      },
      {
        accessorKey: "totalConsumption",
        header: "Tot Cons.",
        size: 65,
        type: "number",
        muiTableBodyCellProps: ({ row }) => ({
          sx: {
            fontWeight: "normal",
            fontSize: "0.78rem",
            color: "#2e7d32",
            textAlign: "right",
            ...(isEditingRowMatch(row.original) && {
              backgroundColor: "#ffca28 !important",
              color: "#3e2723 !important",
              fontWeight: "bold",
            }),
          },
        }),
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        // Show the resolved supplier name rather than the raw numeric
        // SupplierCode - SupplierCode is still sent to the backend on
        // edit/delete, just not shown as its own column anymore.
        accessorKey: "supplierName",
        header: "Supplier",
        size: 100,
      },
    ],
    [editingRow],
  );

  // ... Inside your main MaterialConsumptionGrid function component body:
  const { mutateAsync: deleteLineItem } = useDeleteConsumptionEntryMutation();

  // 2. Enforce the strict Clipper Cascading Delete Verification Guard Hook -
  // now via the shared ConfirmDialog instead of window.confirm(), per project
  // convention (no native browser alert/confirm boxes). The IconButton just
  // stages the row; the dialog's Confirm button runs the actual delete.
  const [rowPendingDelete, setRowPendingDelete] =
    useState<StyleMaterialConsumptionLedgerRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // "Copy all materials from another Style" dialog state
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  const handleRequestDelete = (row: StyleMaterialConsumptionLedgerRow) => {
    setRowPendingDelete(row);
  };

  const handleConfirmDelete = async () => {
    if (!rowPendingDelete) return;
    const row = rowPendingDelete;

    setIsDeleting(true);
    // Initialise your standard loading toaster
    const toastId = toast.loading("Processing record removal, please wait...");

    try {
      // 2. DISPATCH VIA RTK QUERY: Type-safely handles your parameters through your Redux store!
      await deleteLineItem({
        buyerCode: row.buyerCode,
        order: row.order,
        typeCode: row.typeCode,
        styleCode: row.styleCode,
        stockCode: row.stockCode,
        itemCode: row.itemCode,
        color: row.color || "",
        size: row.size || "",
      });

      toast.update(toastId, {
        render:
          "✓ Ledger line record removed and quantities adjusted successfully.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      onRefresh(); // BUG FIX: grid never refreshed after a successful delete
    } catch (err) {
      // Gracefully intercepts bad requests from the C# backend if a PO has already been raised
      const appError = err as AppError;
      const errorMsg =
        appError?.message || "Failed to complete record deletion.";

      toast.update(toastId, {
        render: `🛑 Deletion Aborted: ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsDeleting(false);
      setRowPendingDelete(null);
    }
  };

  const table = useApparelProTable<StyleMaterialConsumptionLedgerRow>({
    columns,
    data: ledgerData,
    state: { isLoading },
    enablePagination: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    initialState: {
      pagination: { pageSize: 5, pageIndex: 0 },
      density: "compact",
    },
    // Highlight whichever ledger row is currently loaded into the form for
    // editing - mirrors the same amber-highlight convention already used for
    // the active selection in the left Raw Material item table.
    muiTableBodyRowProps: ({ row }) => {
      const isSelected = isEditingRowMatch(row.original);
      return {
        sx: isSelected
          ? {
              backgroundColor: "#ffca28 !important",
              borderLeft: "4px solid #e65100 !important",
              "& td": { color: "#3e2723 !important", fontWeight: "bold" },
            }
          : {},
      };
    },
    // Fluid grid layout: columns scale to fit the container width instead of
    // the default fixed-pixel layout, which forced horizontal scrolling once
    // the column sizes summed past the page's available width.
    layoutMode: "grid",
    muiTableContainerProps: {
      sx: { maxWidth: "100%" },
    },
    // Smaller default text so more columns comfortably fit without
    // scrolling; the Material/Tot Cons. columns set their own matching size
    // via muiTableBodyCellProps above since a column-level override replaces
    // rather than merges with this table-level default.
    muiTableHeadCellProps: {
      sx: { fontSize: "0.72rem", fontWeight: 700 },
    },
    muiTableBodyCellProps: ({ row }) => ({
      sx: {
        fontSize: "0.78rem",
        ...(isEditingRowMatch(row.original) && {
          backgroundColor: "#ffca28 !important",
          color: "#3e2723 !important",
          fontWeight: "bold",
        }),
      },
    }),

    renderRowActions: ({ row }) => (
      <Box
        sx={{
          display: "flex",
          gap: 1,
        }}
      >
        {/* Edit Action Button Trigger */}
        <Tooltip title="Load this row record back up into form parameters for modification">
          <IconButton
            color="primary"
            onClick={() => onEditRowSelect(row.original)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete entry line and adjust inventory totals">
          <IconButton
            color="error"
            onClick={() => handleRequestDelete(row.original)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", color: "#ffffff" }}
        >
          [ CONSOLIDATED STYLE RUNNING PRODUCTION LEDGER MATRIX ]
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<ContentCopyIcon />}
          onClick={() => setIsCopyDialogOpen(true)}
        >
          Copy all materials from another Style
        </Button>
      </Box>

      {ledgerData.length === 0 && !isLoading ? (
        <Alert severity="info" variant="outlined">
          No raw material consumption entries have been logged for Style:{" "}
          <strong>{styleContext.styleCode}</strong> yet. Use the data panels
          above to calculate and add items.
        </Alert>
      ) : (
        <MaterialReactTable table={table} />
      )}

      <CopyFromStyleDialog
        open={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        targetStyleContext={styleContext}
        onCopyComplete={onRefresh}
      />

      <ConfirmDialog
        open={!!rowPendingDelete}
        title="Delete Consumption Ledger Entry"
        message={
          rowPendingDelete ? (
            <>
              Are you sure you want to delete this consumption assignment
              ledger entry for <strong>{rowPendingDelete.description}</strong>{" "}
              (Item {rowPendingDelete.itemCode})? This action cannot be
              undone.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowPendingDelete(null)}
      />
    </Box>
  );
}
