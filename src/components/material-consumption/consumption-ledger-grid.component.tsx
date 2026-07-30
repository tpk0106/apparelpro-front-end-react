import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, IconButton, Tooltip, Typography, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
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

interface LedgerGridProps {
  styleContext: StyleContext;
  ledgerData: StyleMaterialConsumptionLedgerRow[];
  isLoading: boolean;
  onRefresh: () => void;
  onEditRowSelect: (row: StyleMaterialConsumptionLedgerRow) => void; // 1. Add this prop interface route
}

export default function ConsumptionLedgerGrid({
  styleContext,
  ledgerData,
  isLoading,
  onRefresh,
  onEditRowSelect,
}: LedgerGridProps) {
  // 1. Define the Columns structure matching your exact PascalCase property dictionary names
  const columns = useMemo<MRT_ColumnDef<StyleMaterialConsumptionLedgerRow>[]>(
    () => [
      {
        // Material name/description instead of the raw 4-char ItemCode -
        // ItemCode is still sent to the backend on edit/delete, just not
        // shown as its own column anymore.
        accessorKey: "description",
        header: "Material",
        size: 190,
        muiTableBodyCellProps: {
          sx: { fontWeight: "bold" },
        },
      },
      {
        // Colour + Size merged into one column to save horizontal space.
        header: "Colour / Size",
        size: 130,
        accessorFn: (row) =>
          `${row.color || "ALL COLOURS"} / ${row.size || "ALL SIZES"}`,
      },
      {
        // Combined virtual column replicating the Clipper feature string block row summary display
        header: "Config (Ft1-4)",
        size: 150,
        accessorFn: (row) =>
          `${row.feature1 || "-"}/${row.feature2 || "-"}/${row.feature3 || "-"}/${row.feature4 || "-"}`,
      },
      {
        accessorKey: "consumptionUnit",
        header: "C/Unit",
        size: 65,
      },
      {
        accessorKey: "quantityPerGarment",
        header: "Qty/Garm",
        size: 80,
        type: "number",
        Cell: ({ cell }) => cell.getValue<number>().toFixed(3),
      },
      {
        accessorKey: "percentageAllowance",
        header: "Allow.%",
        size: 60,
        type: "number",
        Cell: ({ cell }) => `${cell.getValue<number>().toFixed(1)}%`,
      },
      {
        accessorKey: "itemUnit",
        header: "F/Unit",
        size: 60,
      },
      {
        accessorKey: "totalConsumption",
        header: "Tot Cons.",
        size: 70,
        type: "number",
        muiTableBodyCellProps: {
          sx: { fontWeight: "normal", color: "#2e7d32", textAlign: "right" },
        },
        Cell: ({ cell }) => cell.getValue<number>().toLocaleString(),
      },
      {
        // Show the resolved supplier name rather than the raw numeric
        // SupplierCode - SupplierCode is still sent to the backend on
        // edit/delete, just not shown as its own column anymore.
        accessorKey: "supplierName",
        header: "Supplier",
        size: 130,
      },
    ],
    [],
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
      <Typography
        variant="subtitle2"
        // sx={{ fontWeight: "bold", mb: 1, color: "#1a237e" }}
        sx={{ fontWeight: "bold", mb: 1, color: "#ffffff" }}
      >
        [ CONSOLIDATED STYLE RUNNING PRODUCTION LEDGER MATRIX ]
      </Typography>

      {ledgerData.length === 0 && !isLoading ? (
        <Alert severity="info" variant="outlined">
          No raw material consumption entries have been logged for Style:{" "}
          <strong>{styleContext.styleCode}</strong> yet. Use the data panels
          above to calculate and add items.
        </Alert>
      ) : (
        <MaterialReactTable table={table} />
      )}

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
