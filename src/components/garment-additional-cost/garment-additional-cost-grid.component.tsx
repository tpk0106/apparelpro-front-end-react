import { useState } from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import ModeEditOutlinedIcon from "@mui/icons-material/ModeEditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import type { SelectedScopeContext } from "../material-consumption/material-consumption.types";
import type { GarmentAdditionalCostRow } from "./garment-additional-cost.types";
import { mockupColors } from "./garment-additional-cost.types";
import { useDeleteGarmentAdditionalCostMutation } from "../../tanstack-hooks/garment-additional-cost.hooks";
import { useDownloadGarmentAdditionalCostReportPdfMutation } from "../../tanstack-hooks/garment-additional-cost.hooks";
import ConfirmDialog from "../common/confirm-dialog";

interface GridProps {
  styleContext: SelectedScopeContext;
  rows: GarmentAdditionalCostRow[];
  isLoading: boolean;
  onEditRowSelect: (row: GarmentAdditionalCostRow) => void;
}

export default function GarmentAdditionalCostGrid({
  styleContext,
  rows,
  isLoading,
  onEditRowSelect,
}: GridProps) {
  const [rowToDelete, setRowToDelete] = useState<GarmentAdditionalCostRow | null>(
    null,
  );

  const { mutateAsync: deleteEntry, isPending: isDeleting } =
    useDeleteGarmentAdditionalCostMutation();
  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadGarmentAdditionalCostReportPdfMutation();

  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;
    await deleteEntry({
      buyerCode: styleContext.buyerCode,
      order: styleContext.order,
      typeCode: styleContext.typeCode,
      styleCode: styleContext.styleCode,
      additionalCostCode: rowToDelete.additionalCostCode,
      itemCode: `${rowToDelete.stockCode}${rowToDelete.itemCode}${rowToDelete.feature1}${rowToDelete.feature2}${rowToDelete.feature3}${rowToDelete.feature4}`,
    });
    setRowToDelete(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: "13px", color: mockupColors.text }}>
          EXISTING ADDITIONAL COST ENTRIES — {styleContext.styleCode}
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadOutlinedIcon />}
          disabled={isDownloading || rows.length === 0}
          onClick={() =>
            downloadPdf({
              buyerCode: styleContext.buyerCode,
              order: styleContext.order,
              typeCode: styleContext.typeCode,
              styleCode: styleContext.styleCode,
            })
          }
          sx={{
            color: mockupColors.accent,
            borderColor: mockupColors.accent,
            textTransform: "none",
          }}
        >
          {isDownloading ? "Generating..." : "Print Report (PDF)"}
        </Button>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
          <thead>
            <tr>
              {[
                "Category",
                "Item Code",
                "Description",
                "Colour",
                "Size",
                "Qty",
                "Basis",
                "Curr.",
                "Cost",
                "",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: "left",
                    color: mockupColors.muted,
                    fontWeight: 600,
                    padding: "8px 10px",
                    borderBottom: `1px solid ${mockupColors.border}`,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={10}
                  style={{ padding: "16px", color: mockupColors.muted }}
                >
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{ padding: "16px", color: mockupColors.muted }}
                >
                  No Additional Cost entries recorded for this style yet.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const compositeItemCode = `${row.stockCode}${row.itemCode}${row.feature1}${row.feature2}${row.feature3}${row.feature4}`;
              return (
                <tr
                  key={`${row.additionalCostCode}-${compositeItemCode}`}
                  style={{ cursor: "default" }}
                >
                  <td style={cellStyle}>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: "rgba(96, 165, 250, 0.12)",
                        color: mockupColors.accent,
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {row.additionalCostCode}
                    </Box>
                  </td>
                  <td style={{ ...cellStyle, fontFamily: "monospace" }}>
                    {compositeItemCode}
                  </td>
                  <td style={cellStyle}>{row.description || "—"}</td>
                  <td style={cellStyle}>{row.color || "—"}</td>
                  <td style={cellStyle}>{row.size || "—"}</td>
                  <td style={cellStyle}>
                    {row.quantity.toFixed(3)} {row.unit}
                  </td>
                  <td style={cellStyle}>{row.storeCode}</td>
                  <td style={cellStyle}>{row.currency}</td>
                  <td style={cellStyle}>{row.cost.toFixed(4)}</td>
                  <td style={cellStyle}>
                    <Box sx={{ display: "flex", gap: "6px" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEditRowSelect(row)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "6px",
                            border: `1px solid ${mockupColors.border}`,
                            backgroundColor: `${mockupColors.input} !important`,
                            color: `${mockupColors.muted} !important`,
                          }}
                        >
                          <ModeEditOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setRowToDelete(row)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "6px",
                            border: `1px solid ${mockupColors.border}`,
                            backgroundColor: `${mockupColors.input} !important`,
                            color: `${mockupColors.danger} !important`,
                          }}
                        >
                          <DeleteForeverOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      <ConfirmDialog
        open={!!rowToDelete}
        title="Delete Additional Cost Entry"
        message={`Are you sure you want to delete "${rowToDelete?.additionalCostCode} - ${rowToDelete?.description}"?`}
        confirmLabel="Delete"
        confirmColor="error"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRowToDelete(null)}
      />
    </Box>
  );
}

const cellStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: `1px solid ${mockupColors.border}`,
  color: mockupColors.text,
};
