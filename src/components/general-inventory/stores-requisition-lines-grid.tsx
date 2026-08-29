import React from "react";
import type { GeneralRequisitionLineItemRow, GeneralStockItemAvailability } from "../../interfaces/general-inventory/general-inventory.types";
import NoteItemLinesGrid from "./note-item-lines-grid";

interface LinesGridProps {
  storeCode: string;
  lineItems: GeneralRequisitionLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralRequisitionLineItemRow[]>>;
  rowStockBalances: Record<number, GeneralStockItemAvailability>;
  setRowStockBalances: React.Dispatch<React.SetStateAction<Record<number, GeneralStockItemAvailability>>>;
}

export default function StoresRequisitionLinesGrid({
  storeCode,
  lineItems,
  setLineItems,
  rowStockBalances,
  setRowStockBalances,
}: LinesGridProps) {
  return (
    <NoteItemLinesGrid<GeneralRequisitionLineItemRow>
      storeCode={storeCode}
      lineItems={lineItems}
      setLineItems={setLineItems}
      rowStockBalances={rowStockBalances}
      setRowStockBalances={setRowStockBalances}
      quantityColumnLabel="Requested Qty"
      emptyStateMessage='The requisition list is currently empty. Click "Add Item" above.'
    />
  );
}
