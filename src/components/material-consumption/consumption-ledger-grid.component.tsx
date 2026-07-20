import { useMemo } from "react";
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
        accessorKey: "supplierCode",
        header: "Supplier",
        size: 90,
      },
    ],
    [],
  );

  // ... Inside your main MaterialConsumptionGrid function component body:
  const { mutateAsync: deleteLineItem } = useDeleteConsumptionEntryMutation();

  // 2. Enforce the strict Clipper Cascading Delete Verification Guard Hook

  const handleDeleteEntry = async (row: StyleMaterialConsumptionLedgerRow) => {
    const confirmation = window.confirm(
      `Are you sure you want to delete this consumption assignment ledger entry for [${row.description}] (Item ${row.itemCode})?`,
    );
    if (!confirmation) return;

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
    }
  };
  // const handleDeleteEntry = async (row: StyleMaterialConsumptionLedgerRow) => {
  //   const confirmation = window.confirm(
  //     `Are you sure you want to delete this consumption assignment ledger entry for item [${row.itemCode}]?`,
  //   );
  //   if (!confirmation) return;

  //   try {
  //     // Build the verification query scope URL string matching your exact transactional constraints
  //     const deleteUrl = `api/material-consumption/delete-entry?buyerCode=${row.buyerCode}&order=${encodeURIComponent(row.order)}&typeCode=${row.typeCode}&styleCode=${encodeURIComponent(row.styleCode)}&stockCode=${row.stockCode}&itemCode=${row.itemCode}&color=${encodeURIComponent(row.color)}&size=${encodeURIComponent(row.size)}`;

  //     const response = await fetch(deleteUrl, { method: "DELETE" });

  //     if (response.status === 400) {
  //       // Handle PO already raised error state safely from C# backend interception rules
  //       const errorJson = await response.json();
  //       alert(
  //         `Deletion Aborted: ${errorJson.message || "A Purchase Order has already been raised for this material line item. Modifications are blocked."}`,
  //       );
  //       return;
  //     }

  //     if (!response.ok) throw new Error("Network transaction failed.");

  //     alert(
  //       "Ledger line record removed and quantities adjusted downstream successfully.",
  //     );
  //     onRefresh(); // Re-trigger the RTK Cache query invalidate to update the bottom screen rows instantly
  //   } catch (err: unknown) {
  //     alert(
  //       "Failed to complete the record delete transaction request on SQL Server.",
  //     );
  //   }
  // };

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
            onClick={() => handleDeleteEntry(row.original)}
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
    </Box>
  );
}
