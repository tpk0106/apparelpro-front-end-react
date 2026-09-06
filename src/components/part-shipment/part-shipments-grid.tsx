import { useCallback, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  //   Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

// 1. Ensure you import MRT_Row at the very top of PartShipmentsGrid.tsx:
import {
  type MRT_Row,
  MaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import DeleteIcon from "@mui/icons-material/Delete";
// import AddCircleIcon from "@mui/icons-material/AddCircle";
import PostAddIcon from "@mui/icons-material/PostAdd";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { PartShipmentRow } from "./part-shipments.types";
import {
  useSavePartShipmentLineMutation,
  useDeletePartShipmentLineMutation,
} from "../../services/order-management/part-shipment.service";
import { useApparelProTable } from "../../themes/useApparelProTable";
import { DASHBOARD_COLORS } from "../dashboard/dashboard-theme";
import { dateIconFieldSx, primaryActionButtonSx, themedButtonLabelStyle, numberFieldNoSpinnerSx } from "../../themes/workspace-theme";
import { useDropdownTheme } from "../../themes/useDropdownTheme";

// Import your existing live master lookup hook for units reference validation
import { useGetUnits, useGetDestinations } from "../../tanstack-hooks/custom-hooks";
import type { Unit } from "../../interfaces/references/Unit";
import type { PortDestination } from "../../interfaces/references/PortDestination";

// import { type MRT_Row, MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from "material-react-table";

interface GridProps {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  shipmentsData: PartShipmentRow[];
  isLoading: boolean;
}

// Helper Type Guard to safely extract error strings out of backend network errors without 'any' overrides
function extractErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) return "An unexpected network communication anomaly occurred.";
  if (
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "Error" in error.data
  ) {
    return String((error.data as { Error: string }).Error);
  }
  if ("message" in error && error.message) return error.message;
  return "Failed to process logistics transaction on the C# database server.";
}

export default function PartShipmentsGrid({
  buyerCode,
  order,
  typeCode,
  styleCode,
  shipmentsData,
  isLoading,
}: GridProps) {
  // Same dark field theme the Order Confirmation form uses, applied to this
  // modal's TextFields/Selects so it matches the app's form look instead of
  // MUI's default light styling.
  const { theme: dropdownTheme, fieldSx: dropdownFieldSx } = useDropdownTheme();
  const modalSelectMenuProps = {
    slotProps: {
      paper: {
        sx: {
          backgroundColor: `${dropdownTheme.panelBg} !important`,
          border: `1px solid ${dropdownTheme.panelBorder}`,
        },
      },
    },
  };
  const modalMenuItemSx = {
    color: `${dropdownTheme.optionText} !important`,
    "&:hover": { backgroundColor: `${dropdownTheme.optionHoverBg} !important` },
    "&.Mui-selected": {
      backgroundColor: `${dropdownTheme.optionSelectedBg} !important`,
      color: `${dropdownTheme.optionSelectedText} !important`,
    },
  };
  // Shared filter that tints the native date-picker's black calendar icon to
  // match the dropdown arrow color - see dateIconFieldSx in workspace-theme.ts.
  const dateIconSx = dateIconFieldSx;

  // 1. Central Mutation Tracking Hooks
  const [saveLine] = useSavePartShipmentLineMutation();
  const [deleteLine] = useDeletePartShipmentLineMutation();

  // 2. Modals State Management for New Manifest Injections
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newForm, setNewForm] = useState({
    subContractFlag: "N",
    newOrder: "",
    destinationCode: "",
    shipDate: "",
    unit: "PCS",
    quantity: 0,
    shippingMode: "SEA",
    quotaCountry: "",
    quotaStatus: "N",
    quotaCategory: "",
    quotaType: "",
    fromYearMonth: "",
    toYearMonth: "",
  });

  // Fetch master system units to drive cell and modal dropdown selectors
  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const systemUnits = useMemo(
    () => unitsPageData?.items || [],
    [unitsPageData],
  );

  // Fetch master Destinations to drive cell and modal dropdown selectors -
  // Part B fix: DestinationCode used to be free text with no master data
  // behind it at all, now it's a real FK against Destinations.Code.
  const { data: destinationsPageData } = useGetDestinations({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const systemDestinations = useMemo(
    () => destinationsPageData?.items || [],
    [destinationsPageData],
  );

  // --- TRANS-ACTION WORKFLOW INTERCEPTORS ---

  // 2. FIXED SIGNATURE: Changed row: any over to strict MRT_Row type tracking maps!
  // 2. Wrap your entire blur method inside a locked useCallback reference scope container:
  const handleCellEditBlur = useCallback(
    async (
      row: MRT_Row<PartShipmentRow>,
      columnId: string,
      value: string | number | null,
    ) => {
      const original = row.original;
      const payload: Partial<PartShipmentRow> = {
        id: original.id,
        buyerCode,
        order,
        typeCode,
        styleCode,
        subContractFlag:
          columnId === "subContractFlag"
            ? (value as "Y" | "N")
            : original.subContractFlag,
        newOrder: columnId === "newOrder" ? String(value) : original.newOrder,
        destinationCode:
          columnId === "destinationCode"
            ? String(value)
            : original.destinationCode,
        shipDate: columnId === "shipDate" ? String(value) : original.shipDate,
        unit: columnId === "unit" ? String(value) : original.unit,
        quantity: columnId === "quantity" ? Number(value) : original.quantity,
        shippingMode:
          columnId === "shippingMode"
            ? (value as "SEA" | "AIR")
            : original.shippingMode,
        quotaCountry:
          columnId === "quotaCountry" ? String(value) : original.quotaCountry,
        quotaStatus:
          columnId === "quotaStatus" ? String(value) : original.quotaStatus,
        quotaCategory:
          columnId === "quotaCategory" ? String(value) : original.quotaCategory,
        quotaType:
          columnId === "quotaType" ? String(value) : original.quotaType,
        fromYearMonth:
          columnId === "fromYearMonth" ? String(value) : original.fromYearMonth,
        toYearMonth:
          columnId === "toYearMonth" ? String(value) : original.toYearMonth,
      };

      try {
        const response = await saveLine(payload).unwrap();
        if (!response.success) alert(response.message);
      } catch (err) {
        alert(
          extractErrorMessage(err as FetchBaseQueryError | SerializedError),
        );
      }
    },
    [buyerCode, order, typeCode, styleCode, saveLine],
  ); // List external bounds variables here safely!

  const handleDeleteRow = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this partial shipment entry? Associated quota blocks will be reversed automatically.",
      )
    )
      return;
    try {
      await deleteLine(id).unwrap();
    } catch (err) {
      alert(extractErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  const handleNewFormSubmit = async () => {
    if (
      !newForm.newOrder.trim() ||
      !newForm.destinationCode.trim() ||
      !newForm.shipDate
    ) {
      alert(
        "Validation Error: Please fill out Split Order, Destination, and Shipping Date parameters.",
      );
      return;
    }

    try {
      await saveLine({
        buyerCode,
        order,
        typeCode,
        styleCode,
        ...newForm,
        subContractFlag: newForm.subContractFlag as "Y" | "N",
        shippingMode: newForm.shippingMode as "SEA" | "AIR",
      }).unwrap();

      setOpenModal(false);
      setNewForm({
        subContractFlag: "N",
        newOrder: "",
        destinationCode: "",
        shipDate: "",
        unit: "PCS",
        quantity: 0,
        shippingMode: "SEA",
        quotaCountry: "",
        quotaStatus: "N",
        quotaCategory: "",
        quotaType: "",
        fromYearMonth: "",
        toYearMonth: "",
      });
    } catch (err) {
      alert(extractErrorMessage(err as FetchBaseQueryError | SerializedError));
    }
  };

  // --- MATERIAL REACT TABLE 12-COLUMN BLUEPRINTS DEFINITIONS ---
  // 3. Now add the locked reference key straight into your columns useMemo dependencies array:
  const columns = useMemo<MRT_ColumnDef<PartShipmentRow>[]>(
    () => [
      {
        accessorKey: "subContractFlag",
        header: "Sub Contract",
        size: 70,
        editSelectOptions: ["N", "Y"],
        editVariant: "select",
        Cell: ({ cell }) => (cell.getValue() === "Y" ? "YES [Y]" : "NO [N]"),
      },
      {
        accessorKey: "newOrder",
        header: "Order No.",
        size: 80,
        Edit: ({ cell, row }) => (
          <TextField
            size="small"
            variant="standard"
            defaultValue={cell.getValue() || ""}
            onBlur={(e) =>
              handleCellEditBlur(row, "newOrder", e.target.value.toUpperCase())
            }
            slotProps={{
              htmlInput: {
                style: { fontSize: "13px", textTransform: "uppercase" },
              },
            }}
          />
        ),
      },
      {
        accessorKey: "destinationCode",
        header: "Dest.",
        size: 60,
        Edit: ({ cell, row }) => (
          <TextField
            select
            size="small"
            variant="standard"
            fullWidth
            defaultValue={cell.getValue() || ""}
            onChange={(e) =>
              handleCellEditBlur(row, "destinationCode", e.target.value)
            }
          >
            {systemDestinations.map((d: PortDestination) => (
              <MenuItem key={`${d.countryCode}-${d.code}`} value={d.code}>
                {d.code} - {d.destinationName}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        accessorKey: "shipDate",
        header: "Shp.Date",
        size: 85,
        Cell: ({ cell }) =>
          cell.getValue() ? String(cell.getValue()).split("T")[0] : "",
        Edit: ({ cell, row }) => (
          <TextField
            type="date"
            size="small"
            variant="standard"
            defaultValue={
              cell.getValue() ? String(cell.getValue()).split("T")[0] : ""
            }
            onBlur={(e) =>
              handleCellEditBlur(row, "shipDate", e.target.value || null)
            }
            slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
            sx={dateIconSx}
          />
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 55,
        Edit: ({ cell, row }) => (
          <TextField
            select
            size="small"
            variant="standard"
            fullWidth
            defaultValue={cell.getValue() || "PCS"}
            onChange={(e) => handleCellEditBlur(row, "unit", e.target.value)}
          >
            {systemUnits.map((u: Unit) => (
              <MenuItem key={u.id} value={u.code}>
                {u.code}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Qty.",
        size: 80,
        Cell: ({ cell }) =>
          Number(cell.getValue()).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          }),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            size="small"
            variant="standard"
            defaultValue={cell.getValue() ?? 0}
            onBlur={(e) =>
              handleCellEditBlur(row, "quantity", Number(e.target.value))
            }
            slotProps={{
              htmlInput: {
                style: { fontSize: "13px", fontFamily: "monospace" },
              },
            }}
            sx={numberFieldNoSpinnerSx}
          />
        ),
      },
      {
        accessorKey: "shippingMode",
        header: "Shp.Mode",
        size: 70,
        editSelectOptions: ["SEA", "AIR"],
        editVariant: "select",
      },
      {
        accessorKey: "quotaCountry",
        header: "Quota Country",
        size: 85,
        Edit: ({ cell, row }) => (
          <TextField
            size="small"
            variant="standard"
            defaultValue={cell.getValue() || ""}
            disabled={row.original.subContractFlag === "Y"}
            onBlur={(e) =>
              handleCellEditBlur(
                row,
                "quotaCountry",
                e.target.value.toUpperCase(),
              )
            }
            slotProps={{
              htmlInput: {
                style: { fontSize: "13px", textTransform: "uppercase" },
              },
            }}
          />
        ),
      },
      {
        accessorKey: "quotaStatus",
        header: "Qta.;Stat",
        size: 65,
        editSelectOptions: ["N", "Q"],
        editVariant: "select",
      },
      {
        accessorKey: "fromYearMonth",
        header: "From YYMM",
        size: 70,
        Edit: ({ cell, row }) => (
          <TextField
            size="small"
            variant="standard"
            placeholder="94/07"
            defaultValue={cell.getValue() || ""}
            disabled={row.original.quotaStatus === "N"}
            onBlur={(e) =>
              handleCellEditBlur(row, "fromYearMonth", e.target.value)
            }
            slotProps={{ htmlInput: { style: { fontSize: "13px" } } }}
          />
        ),
      },
      {
        accessorKey: "quotaCategory",
        header: "Qta.;Cat.",
        size: 70,
        Edit: ({ cell, row }) => (
          <TextField
            size="small"
            variant="standard"
            defaultValue={cell.getValue() || ""}
            disabled={row.original.quotaStatus === "N"}
            onBlur={(e) =>
              handleCellEditBlur(
                row,
                "quotaCategory",
                e.target.value.toUpperCase(),
              )
            }
            slotProps={{
              htmlInput: {
                style: { fontSize: "13px", textTransform: "uppercase" },
              },
            }}
          />
        ),
      },
      {
        accessorKey: "quotaType",
        header: "Cat.;Type",
        size: 65,
        editSelectOptions: ["", "OR", "AD", "PL"],
        editVariant: "select",
      },
    ],
    [handleCellEditBlur, systemUnits],
  );

  const table = useApparelProTable<PartShipmentRow>({
    columns,
    data: shipmentsData,
    state: { isLoading },
    enableEditing: true,
    editDisplayMode: "cell", // Tab-and-type speed matching data entry terminals
    enablePagination: false,
    enableRowActions: true,
    enableTopToolbar: true,
    // Column sizes above were trimmed to fit without horizontal scrolling -
    // table-layout: fixed makes those declared widths authoritative instead
    // of the browser expanding columns to fit cell content (same fix as
    // SizeBreakdownTable's SIZE DIMENSION column).
    enableColumnResizing: false,
    muiTableProps: {
      sx: { tableLayout: "fixed" },
    },
    // Column header still sorts on click - this only removes the kebab
    // menu's other actions (filter, hide, pin, drag-reorder), matching the
    // Colour/Size tables' convention.
    enableColumnActions: false,
    initialState: { density: "compact" },
    renderRowActions: ({ row }) => (
      <IconButton
        color="error"
        onClick={() => handleDeleteRow(row.original.id)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        size="small"
        startIcon={<PostAddIcon />}
        onClick={() => setOpenModal(true)}
        sx={primaryActionButtonSx}
      >
        <span style={themedButtonLabelStyle}>
          Create Split Shipment Delivery Manifest
        </span>
      </Button>
    ),
  });

  return (
    <Box sx={{ mt: 1 }}>
      <MaterialReactTable table={table} />

      {/* Dynamic Pop-up Modal Form Prompt matching Clipper [Ins] manual insertion layout actions */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: DASHBOARD_COLORS.cardBg,
              border: `1px solid ${DASHBOARD_COLORS.border}`,
              boxShadow: "0 10px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: DASHBOARD_COLORS.accentStrong,
            fontSize: "16px",
            textTransform: "uppercase",
          }}
        >
          New Shipment Delivery Manifest Entry
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: DASHBOARD_COLORS.border }}>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              <TextField
                select
                label="Sub Contract"
                size="small"
                fullWidth
                value={newForm.subContractFlag}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, subContractFlag: e.target.value }))
                }
                sx={dropdownFieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
              >
                <MenuItem value="N" sx={modalMenuItemSx}>NO [N]</MenuItem>
                <MenuItem value="Y" sx={modalMenuItemSx}>YES [Y]</MenuItem>
              </TextField>
              <TextField
                label="Split Order No."
                size="small"
                fullWidth
                value={newForm.newOrder}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    newOrder: e.target.value.toUpperCase(),
                  }))
                }
                sx={dropdownFieldSx}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              <TextField
                select
                label="Dest Code"
                size="small"
                fullWidth
                value={newForm.destinationCode}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    destinationCode: e.target.value,
                  }))
                }
                sx={dropdownFieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
              >
                {systemDestinations.map((d: PortDestination) => (
                  <MenuItem
                    key={`${d.countryCode}-${d.code}`}
                    value={d.code}
                    sx={modalMenuItemSx}
                  >
                    {d.code} - {d.destinationName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Shipping Date"
                size="small"
                fullWidth
                value={newForm.shipDate}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, shipDate: e.target.value }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{
                  ...(dropdownFieldSx as Record<string, unknown>),
                  ...(dateIconSx as Record<string, unknown>),
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              <TextField
                select
                label="Unit"
                size="small"
                fullWidth
                value={newForm.unit}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, unit: e.target.value }))
                }
                sx={dropdownFieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
              >
                {systemUnits.map((u: Unit) => (
                  <MenuItem key={u.id} value={u.code} sx={modalMenuItemSx}>
                    {u.code}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Manifest Qty"
                size="small"
                fullWidth
                value={newForm.quantity}
                onChange={(e) =>
                  setNewForm((p) => ({
                    ...p,
                    quantity: Number(e.target.value),
                  }))
                }
                sx={{ ...dropdownFieldSx, ...numberFieldNoSpinnerSx }}
              />
              <TextField
                select
                label="Shipping Mode"
                size="small"
                fullWidth
                value={newForm.shippingMode}
                onChange={(e) =>
                  setNewForm((p) => ({ ...p, shippingMode: e.target.value }))
                }
                sx={dropdownFieldSx}
                slotProps={{ select: { MenuProps: modalSelectMenuProps } }}
              >
                <MenuItem value="SEA" sx={modalMenuItemSx}>SEA</MenuItem>
                <MenuItem value="AIR" sx={modalMenuItemSx}>AIR</MenuItem>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenModal(false)}
            type="button"
            variant="contained"
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>Cancel</span>
          </Button>
          <Button
            onClick={handleNewFormSubmit}
            variant="contained"
            sx={primaryActionButtonSx}
          >
            <span style={themedButtonLabelStyle}>Save</span>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
