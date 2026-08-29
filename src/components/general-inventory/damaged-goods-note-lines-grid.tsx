import React from "react";
import type { GeneralDgnLineItemRow } from "../../interfaces/general-inventory/general-dgn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import NoteItemLinesGrid from "./note-item-lines-grid";

interface LinesGridProps {
  storeCode: string;
  lineItems: GeneralDgnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralDgnLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<React.SetStateAction<Record<number, GeneralStockItemAvailability>>>;
}

// Item picker and live balance check reuse the STRN endpoints - a write-off can never
// exceed the store's own balance, same ceiling as a requisition.
export default function DamagedGoodsNoteLinesGrid({
  storeCode,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  return (
    <NoteItemLinesGrid<GeneralDgnLineItemRow>
      storeCode={storeCode}
      lineItems={lineItems}
      setLineItems={setLineItems}
      rowStockBalances={rowStockBalances}
      setRowStockBalances={setRowStockBalances}
      quantityColumnLabel="Qty. Damaged"
      emptyStateMessage='The write-off list is currently empty. Click "Add Item" above.'
    />
  );
}
