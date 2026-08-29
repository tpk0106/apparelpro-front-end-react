import React from "react";
import { Typography } from "@mui/material";
import type { GeneralSrtnLineItemRow } from "../../interfaces/general-inventory/general-srtn.types";
import { GeneralSrtnStockType } from "../../interfaces/general-inventory/general-srtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import NoteItemLinesGrid from "./note-item-lines-grid";

interface LinesGridProps {
  storeCode: string;
  stockType: string;
  lineItems: GeneralSrtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralSrtnLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<React.SetStateAction<Record<number, GeneralStockItemAvailability>>>;
}

// Item picker reuses STRN's endpoint (any item tracked at the store). The live balance
// badge (STRN's verify-stock, QtyInHand - ShadowBalance) only applies to Regular returns
// - Damaged returns are checked against DamagedQuantity instead, which has no live-badge
// endpoint yet; the server still enforces that ceiling on commit either way.
export default function SupplierReturnNoteLinesGrid({
  storeCode,
  stockType,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  const isRegular = stockType === GeneralSrtnStockType.Regular;

  return (
    <NoteItemLinesGrid<GeneralSrtnLineItemRow>
      storeCode={storeCode}
      lineItems={lineItems}
      setLineItems={setLineItems}
      rowStockBalances={rowStockBalances}
      setRowStockBalances={setRowStockBalances}
      shouldCheckBalance={() => isRegular}
      quantityColumnLabel="Qty. Returned"
      emptyStateMessage='The return list is currently empty. Click "Add Item" above.'
      renderExtraItemNote={(line) =>
        !isRegular && line.itemCode ? (
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", color: "text.secondary", fontStyle: "italic" }}
          >
            Checked against Damaged Quantity on save.
          </Typography>
        ) : null
      }
    />
  );
}
