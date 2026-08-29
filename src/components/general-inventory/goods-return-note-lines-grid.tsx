import React from "react";
import type { GeneralRtnLineItemRow } from "../../interfaces/general-inventory/general-rtn.types";
import NoteItemLinesGrid from "./note-item-lines-grid";

interface LinesGridProps {
  storeCode: string;
  lineItems: GeneralRtnLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralRtnLineItemRow[]>>;
}

// A return only ever increases stock, so unlike STRN/GIN/GTN there's no balance ceiling
// to check against here - the item just needs to already be tracked at the target Store.
export default function GoodsReturnNoteLinesGrid({ storeCode, lineItems, setLineItems }: LinesGridProps) {
  return (
    <NoteItemLinesGrid<GeneralRtnLineItemRow>
      storeCode={storeCode}
      lineItems={lineItems}
      setLineItems={setLineItems}
      quantityColumnLabel="Qty. Returned"
      emptyStateMessage='The return list is currently empty. Click "Add Item" above.'
    />
  );
}
