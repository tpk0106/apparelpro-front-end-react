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

import type { GeneralPoLineItemRow } from "../../interfaces/general-inventory/general-po.types";
import type { GeneralStore } from "../../interfaces/general-inventory/general-inventory.types";
import GeneralPoLineRow from "./general-po-line-row";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { plainTableHeaderRowSx, plainTableHeaderCellSx } from "../../themes/workspace-theme";

interface LinesGridProps {
  storesList: GeneralStore[];
  lineItems: GeneralPoLineItemRow[];
  setLineItems: React.Dispatch<React.SetStateAction<GeneralPoLineItemRow[]>>;
}

export default function GeneralPoLinesGrid({
  storesList,
  lineItems,
  setLineItems,
}: LinesGridProps) {
  const handleUpdateLineCell = (
    index: number,
    field: keyof GeneralPoLineItemRow,
    value: string | number | null,
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
      <Table size="small" sx={{ minWidth: 900, border: `1px solid ${DASHBOARD_COLORS.border}` }}>
        <TableHead>
          <TableRow sx={plainTableHeaderRowSx()}>
            <TableCell sx={plainTableHeaderCellSx()}>Store</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Item Code</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Ref No</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Unit</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Quantity</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Price</TableCell>
            <TableCell sx={plainTableHeaderCellSx()}>Delivery Date</TableCell>
            <TableCell sx={{ ...plainTableHeaderCellSx(), textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lineItems.map((row, idx) => (
            <GeneralPoLineRow
              key={idx}
              row={row}
              index={idx}
              storesList={storesList}
              onChange={(field, value) => handleUpdateLineCell(idx, field, value)}
              onRemove={() => handleRemoveRow(idx)}
            />
          ))}
        </TableBody>
      </Table>

      {lineItems.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc", borderTop: "none" }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            The order list is currently empty. Click "Add Item" above.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
