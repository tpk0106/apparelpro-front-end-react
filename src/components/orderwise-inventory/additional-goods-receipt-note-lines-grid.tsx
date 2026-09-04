import React from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";

import type { ArnLineItemRow } from "./additional-goods-receipt-note.types";
import type { Buyer } from "../../interfaces/references/Buyer";
import AdditionalGoodsReceiptNoteLineRow from "./additional-goods-receipt-note-line-row";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { plainTableHeaderCellSx, plainTableHeaderRowSx } from "../../themes/workspace-theme";

interface LinesGridProps {
  buyersList: Buyer[];
  lineItems: ArnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<ArnLineItemRow[]>>;
}

export default function AdditionalGoodsReceiptNoteLinesGrid({
  buyersList,
  lineItems,
  setLineItems,
}: LinesGridProps) {
  const handleUpdateLineCell = (
    index: number,
    field: keyof ArnLineItemRow,
    value: string | number | boolean | null,
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRow = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto", mt: 2 }}>
      <Table size="small" sx={{ minWidth: 950, border: `1px solid ${DASHBOARD_COLORS.border}` }}>
        {/* plainTableHeaderRowSx uses "&&&" to beat themes.ts's global
            MuiTableRow ":nth-of-type" override, which otherwise paints this
            (and every body) row blue with !important regardless of the
            TableHead's own background - see workspace-theme.ts. */}
        <TableHead>
          <TableRow sx={plainTableHeaderRowSx()}>
            <TableCell sx={plainTableHeaderCellSx()}>Buyer</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Order</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Item Code / Process</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Receivable</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Quantity</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Price</TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => (
            <AdditionalGoodsReceiptNoteLineRow
              key={idx}
              row={row}
              index={idx}
              buyersList={buyersList}
              onChange={(field, value) => handleUpdateLineCell(idx, field, value)}
              onRemove={() => handleRemoveRow(idx)}
            />
          ))}
        </TableBody>
      </Table>

      {lineItems.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center", border: `1px dashed ${DASHBOARD_COLORS.border}`, borderTop: "none" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            No lines added yet. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
