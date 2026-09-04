import React, { useMemo } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BalanceDeficitWarning from "../common/balance-deficit-warning";

import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import {
  useGetAvailableGeneralStockChoicesQuery,
  useVerifyGeneralStockItemAvailabilityMutation,
} from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetUnits } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";
import { useDropdownTheme } from "../../themes/useDropdownTheme";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import {
  plainTableHeaderRowSx,
  plainTableHeaderCellSx,
  plainTableBodyRowSx,
  deleteRowIconButtonSx,
  numberFieldNoSpinnerSx,
} from "../../themes/workspace-theme";

interface NoteLineBase {
  itemCode: string;
  unit: string;
  quantity: number;
}

type EditableField = "itemCode" | "unit" | "quantity";

interface NoteItemLinesGridProps<TLine extends NoteLineBase> {
  // A General store code - the item picker (STRN's own available-choices endpoint,
  // reused across every note that just needs "items already tracked at this store")
  // is always scoped to it.
  storeCode: string;
  lineItems: TLine[];
  setLineItems: React.Dispatch<React.SetStateAction<TLine[]>>;
  quantityColumnLabel: string;
  emptyStateMessage: string;
  // Omit both to skip the live balance check/badge entirely (e.g. RTN, where a return
  // only ever increases stock so there's no ceiling to check against). Provide both to
  // enable it - shouldCheckBalance (default: always) lets a note narrow which rows get
  // checked, e.g. SRTN only checking Regular-type lines (Damaged has no live-badge
  // endpoint; the server still enforces that ceiling on commit).
  rowStockBalances?: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances?: React.Dispatch<React.SetStateAction<Record<number, GeneralStockItemAvailability>>>;
  shouldCheckBalance?: (line: TLine) => boolean;
  // Extra per-row caption under the item picker, e.g. SRTN's "Checked against Damaged
  // Quantity on save." note for the Damaged path.
  renderExtraItemNote?: (line: TLine) => React.ReactNode;
}

// Shared shape behind StoresRequisitionLinesGrid / GoodsReturnNoteLinesGrid /
// DamagedGoodsNoteLinesGrid / GoodsTransferNoteLinesGrid / SupplierReturnNoteLinesGrid -
// an item picker scoped to one General store, a Unit picker, an editable Quantity cell,
// and (for every note except a plain return) a live balance badge/over-balance error
// sourced from STRN's own verify-stock endpoint. Only the quantity column's label, the
// empty-state copy, and whether/when the balance check runs actually differ per note.
export default function NoteItemLinesGrid<TLine extends NoteLineBase>({
  storeCode,
  lineItems,
  setLineItems,
  quantityColumnLabel,
  emptyStateMessage,
  rowStockBalances,
  setRowStockBalances,
  shouldCheckBalance = () => true,
  renderExtraItemNote,
}: NoteItemLinesGridProps<TLine>) {
  const { fieldSx: dropdownFieldSx, listboxSx: dropdownListboxSx } = useDropdownTheme();
  const dropdownMenuSlotProps = { select: { MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } } } };

  const balanceCheckEnabled = !!rowStockBalances && !!setRowStockBalances;

  const { mutateAsync: triggerStockCheck } =
    useVerifyGeneralStockItemAvailabilityMutation();

  const { data: stockChoicesList = [], isLoading: isStockLoading } =
    useGetAvailableGeneralStockChoicesQuery(storeCode, !!storeCode);

  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const systemUnits = useMemo(() => unitsPageData?.items || [], [unitsPageData]);

  const usedItemCodes = useMemo(
    () =>
      new Set(
        lineItems.map((item) => item.itemCode).filter((code) => code.trim() !== ""),
      ),
    [lineItems],
  );

  const handleUpdateLineCell = (index: number, field: EditableField, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
    setRowStockBalances?.((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleExecuteCellBlurCheck = async (index: number, currentLine: TLine) => {
    if (!balanceCheckEnabled || !shouldCheckBalance(currentLine)) return;
    const itemCode = currentLine.itemCode.trim();
    const currentUnit = currentLine.unit.trim().toUpperCase();
    if (!itemCode || !storeCode) return;

    try {
      const stockDetails = await triggerStockCheck({
        storeCode,
        itemCode,
        targetUnit: currentUnit,
      });
      if (stockDetails) {
        setRowStockBalances?.((prev) => ({ ...prev, [index]: stockDetails }));
      }
    } catch {
      // Item not tracked, or the balance check failed - no live badge for this row.
    }
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
      <Table size="small" sx={{ minWidth: 550, border: `1px solid ${DASHBOARD_COLORS.border}` }}>
        {/* plainTableHeaderRowSx uses "&&&" to beat themes.ts's global
            MuiTableRow ":nth-of-type" override, which otherwise paints this
            (and every body) row blue with !important regardless of the
            TableHead's own background - see workspace-theme.ts. */}
        <TableHead>
          <TableRow sx={plainTableHeaderRowSx()}>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: balanceCheckEnabled ? "35%" : "45%" }}>Item Code</TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "15%" }}>Unit</TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "20%" }}>{quantityColumnLabel}</TableCell>
            {balanceCheckEnabled && (
              <TableCell sx={{ ...plainTableHeaderCellSx(), width: "15%", textAlign: "center" }}>
                Available
              </TableCell>
            )}
            <TableCell sx={{ ...plainTableHeaderCellSx(), width: "10%", textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => {
            const balanceMetrics =
              balanceCheckEnabled && shouldCheckBalance(row) ? rowStockBalances![idx] : undefined;
            const hasExceededBalance =
              balanceMetrics &&
              Number(row.quantity) > 0 &&
              Number(row.quantity) > balanceMetrics.netAvailableBalance;

            const availableChoicesForRow = stockChoicesList.filter(
              (item) => item.itemCode === row.itemCode || !usedItemCodes.has(item.itemCode),
            );

            return (
              <TableRow key={idx} sx={plainTableBodyRowSx(idx, !!hasExceededBalance)}>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={dropdownFieldSx}
                    slotProps={dropdownMenuSlotProps}
                    value={row.itemCode}
                    disabled={isStockLoading || availableChoicesForRow.length === 0}
                    onChange={(e) => {
                      const selectedItemCode = e.target.value;
                      const matchedItem = stockChoicesList.find(
                        (opt) => opt.itemCode === selectedItemCode,
                      );
                      if (matchedItem) {
                        handleUpdateLineCell(idx, "itemCode", matchedItem.itemCode);
                        handleUpdateLineCell(idx, "unit", matchedItem.unit || "PCS");
                        handleExecuteCellBlurCheck(idx, {
                          ...row,
                          itemCode: matchedItem.itemCode,
                          unit: matchedItem.unit || "PCS",
                        });
                      }
                    }}
                  >
                    {availableChoicesForRow.map((item) => (
                      <MenuItem key={item.itemCode} value={item.itemCode}>
                        {item.description} [{item.itemCode}]
                      </MenuItem>
                    ))}
                  </TextField>

                  {renderExtraItemNote?.(row)}
                </TableCell>

                <TableCell>
                  <TextField
                    select
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={dropdownFieldSx}
                    slotProps={dropdownMenuSlotProps}
                    value={row.unit}
                    onChange={(e) => {
                      handleUpdateLineCell(idx, "unit", e.target.value);
                      handleExecuteCellBlurCheck(idx, { ...row, unit: e.target.value });
                    }}
                  >
                    {systemUnits.map((u: Unit) => (
                      <MenuItem key={u.id} value={u.code}>
                        {u.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    variant="standard"
                    fullWidth
                    sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
                    value={row.quantity === 0 ? "" : row.quantity}
                    onChange={(e) => handleUpdateLineCell(idx, "quantity", Number(e.target.value))}
                    error={Boolean(hasExceededBalance)}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                  {hasExceededBalance && (
                    <BalanceDeficitWarning message="Allocation Deficit: Attempt to exceed balance quantity!" />
                  )}
                </TableCell>

                {balanceCheckEnabled && (
                  <TableCell sx={{ textAlign: "center" }}>
                    {balanceMetrics && (
                      <Chip
                        size="small"
                        variant="filled"
                        color={hasExceededBalance ? "error" : "primary"}
                        label={`${balanceMetrics.netAvailableBalance.toLocaleString()} ${balanceMetrics.unit}`}
                        sx={{
                          border: "1px solid #FFFFFF",
                          "& .MuiChip-label": { color: "#FFFFFF" },
                        }}
                      />
                    )}
                  </TableCell>
                )}

                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton color="error" size="small" onClick={() => handleRemoveRow(idx)} sx={deleteRowIconButtonSx}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {lineItems.length === 0 && (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            border: `1px dashed ${DASHBOARD_COLORS.border}`,
            borderTop: "none",
            color: DASHBOARD_COLORS.textSecondary,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {emptyStateMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
