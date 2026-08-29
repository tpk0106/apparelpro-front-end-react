import React from "react";
import type { GeneralGtnLineItemRow } from "../../interfaces/general-inventory/general-gtn.types";
import type { GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import NoteItemLinesGrid from "./note-item-lines-grid";

interface LinesGridProps {
  fromStoreCode: string;
  lineItems: GeneralGtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralGtnLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<React.SetStateAction<Record<number, GeneralStockItemAvailability>>>;
}

// Item picker and live balance check reuse the STRN endpoints - the "available
// balance" GTN needs to respect (QtyInHand - ShadowBalance on the From Stores)
// is exactly what STRN's own reservation check already computes.
export default function GoodsTransferNoteLinesGrid({
  fromStoreCode,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  return (
    <NoteItemLinesGrid<GeneralGtnLineItemRow>
      storeCode={fromStoreCode}
      lineItems={lineItems}
      setLineItems={setLineItems}
      rowStockBalances={rowStockBalances}
      setRowStockBalances={setRowStockBalances}
      quantityColumnLabel="Transfer Qty"
      emptyStateMessage='The transfer list is currently empty. Click "Add Item" above.'
    />
  );
}
