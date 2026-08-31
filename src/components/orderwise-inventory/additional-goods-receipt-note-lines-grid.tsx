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
      <Table size="small" sx={{ minWidth: 950, border: "1px solid #e0e0e0" }}>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Buyer</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Order</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Item Code / Process</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Receivable</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => (
            <AdditionalGoodsReceiptNoteLineRow
              key={idx}
              row={row}
              buyersList={buyersList}
              onChange={(field, value) => handleUpdateLineCell(idx, field, value)}
              onRemove={() => handleRemoveRow(idx)}
            />
          ))}
        </TableBody>
      </Table>

      {lineItems.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc", borderTop: "none" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            No lines added yet. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
