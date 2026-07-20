import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ExpandedState,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type {
  MaterialCatalogGroup,
  MaterialCatalogItem,
  MaterialSelection,
} from "./material-consumption.types";

interface MaterialMasterListProps {
  catalogGroups: MaterialCatalogGroup[];
  isLoading: boolean;
  selectedMaterial: MaterialSelection | null;
  onSelectMaterial: (material: MaterialSelection) => void;
}

export default function MaterialMasterList({
  catalogGroups,
  isLoading,
  selectedMaterial,
  onSelectMaterial,
}: MaterialMasterListProps) {
  // Expanded state is owned here explicitly (rather than left to MRT's
  // internal uncontrolled state) so that selecting an item in the nested
  // table - which triggers a parent re-render via onSelectMaterial - can
  // never cause the category row to collapse out from under the click.
  const [expanded, setExpanded] = useState<MRT_ExpandedState>({});

  // Belt-and-braces: whenever the active selection changes, make sure that
  // material's category is (and stays) expanded.
  useEffect(() => {
    if (!selectedMaterial?.stockCode) return;
    setExpanded((prev) => {
      if (prev === true) return prev;
      if ((prev as Record<string, boolean>)[selectedMaterial.stockCode]) {
        return prev;
      }
      return { ...(prev as Record<string, boolean>), [selectedMaterial.stockCode]: true };
    });
  }, [selectedMaterial?.stockCode]);

  // Parent table: one row per Stock category. StockCode itself is intentionally
  // not rendered as a column - only its Description is shown. Expanding a row
  // reveals that category's items in a nested table below it.
  const columns = useMemo<MRT_ColumnDef<MaterialCatalogGroup>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Material Category",
      },
    ],
    [],
  );

  const table = useApparelProTable<MaterialCatalogGroup>({
    columns,
    data: catalogGroups,
    state: { isLoading, expanded },
    onExpandedChange: setExpanded,
    enableExpanding: true,
    enableEditing: false,
    enablePagination: false,
    enableRowSelection: false,
    enableColumnActions: false,
    enableSorting: true,
    enableTopToolbar: true,
    enableBottomToolbar: false,
    initialState: { density: "compact" },
    getRowId: (row) => row.stockCode,

    // Hide the expand affordance for categories with no cataloged items.
    // row.original can be undefined for MRT's internal synthetic rows (e.g.
    // loading-skeleton placeholders), so this is defensive on purpose.
    muiExpandButtonProps: ({ row }) => ({
      sx: {
        visibility: (row.original?.items?.length ?? 0) === 0 ? "hidden" : "visible",
      },
    }),

    // Let a click anywhere on the category row toggle expansion, not just the icon.
    // Rows that have items (and therefore show a nested table when expanded)
    // get a subtle neutral hover instead of the shared theme's black/blue
    // hover - the black hover clashes with the nested table shown underneath.
    // Rows with no items keep the default shared hover styling untouched.
    muiTableBodyRowProps: ({ row }) => {
      const itemCount = row.original?.items?.length ?? 0;
      const hasChildTable = itemCount > 0;
      return {
        onClick: () => row.toggleExpanded(),
        sx: {
          cursor: hasChildTable ? "pointer" : "default",
          ...(hasChildTable && {
            "&:hover td": {
              backgroundColor: "#e8eaf6 !important",
              color: "#1a237e !important",
              borderTop: "1px solid rgba(0, 0, 0, 0.1) !important",
              borderBottom: "1px solid rgba(0, 0, 0, 0.1) !important",
            },
          }),
        },
      };
    },

    renderDetailPanel: ({ row }) =>
      (row.original?.items?.length ?? 0) === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary", p: 1 }}>
          No items catalogued under this category yet.
        </Typography>
      ) : (
        <MaterialCatalogItemsTable
          stockCode={row.original.stockCode}
          items={row.original.items}
          selectedMaterial={selectedMaterial}
          onSelectMaterial={onSelectMaterial}
        />
      ),
  });

  return <MaterialReactTable table={table} />;
}

interface MaterialCatalogItemsTableProps {
  stockCode: string;
  items: MaterialCatalogItem[];
  selectedMaterial: MaterialSelection | null;
  onSelectMaterial: (material: MaterialSelection) => void;
}

// Nested table shown inside an expanded Stock category row. Clicking an item
// row selects it, which resets/opens the consumption entry form for that
// StockCode+ItemCode (mirrors legacy OD_TPDT1.PRG's Enter-to-select pattern).
function MaterialCatalogItemsTable({
  stockCode,
  items,
  selectedMaterial,
  onSelectMaterial,
}: MaterialCatalogItemsTableProps) {
  const columns = useMemo<MRT_ColumnDef<MaterialCatalogItem>[]>(
    () => [
      {
        accessorKey: "itemCode",
        header: "Item",
        size: 90,
        muiTableBodyCellProps: {
          sx: { fontFamily: "monospace", color: "#1a237e", fontWeight: "bold" },
        },
      },
      {
        accessorKey: "description",
        header: "Material Name / Description",
        size: 220,
      },
    ],
    [],
  );

  const table = useApparelProTable<MaterialCatalogItem>({
    columns,
    data: items,
    enableEditing: false,
    enablePagination: false,
    enableRowSelection: false,
    enableColumnActions: false,
    enableSorting: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    initialState: { density: "compact" },
    getRowId: (row) => row.itemCode,
    muiTableBodyRowProps: ({ row }) => {
      const isSelected =
        selectedMaterial?.stockCode === stockCode &&
        selectedMaterial?.itemCode === row.original?.itemCode;
      return {
        onClick: () => {
          if (!row.original) return;
          onSelectMaterial({
            stockCode,
            itemCode: row.original.itemCode,
            description: row.original.description,
          });
        },
        sx: {
          cursor: "pointer",
          // Persistent highlight for the actively selected row only - no custom
          // hover override here, so hover falls back to the shared hook's own
          // default black-bg/blue-text styling, identical to any non-nested
          // useApparelProTable table (e.g. the ledger grid).
          // A saturated amber + left border is used instead of a pale tint so
          // the highlight stays visible regardless of which alternating-row
          // shade (#4B9CD3 / #7CB9E8) the shared theme put underneath it.
          ...(isSelected && {
            backgroundColor: "#ffca28 !important",
            borderLeft: "4px solid #e65100 !important",
            "& td": { color: "#3e2723 !important", fontWeight: "bold" },
          }),
        },
      };
    },
  });

  return (
    <Box sx={{ pl: 4, pr: 1, py: 1 }}>
      <MaterialReactTable table={table} />
    </Box>
  );
}
