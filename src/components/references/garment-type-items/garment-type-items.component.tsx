import { useMemo, useState } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ThemeProvider,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import {
  useGetAllGarmentTypes,
  useGetGarmentTypeItems,
  useGetUnits,
} from "../../../tanstack-hooks/custom-hooks";
import { useGetMaterialCatalog } from "../../../tanstack-hooks/material-consumption-entry.hooks";
import type { GarmentTypeItem } from "../../../interfaces/references/GarmentTypeItem";
import type { Unit } from "../../../interfaces/references/Unit";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import GarmentTypeItemsTable from "./garment-type-items-table.component";

// Replicates OD_ITM1.PRG (Update) / OD_ITM2.PRG (List) - Reference Files >
// B. Order Management > G. Type / Item in legacy (RF_MENU.PRG). Global theme
// (useApparelProTable), same as Country / Garment Type / Order Item Feature -
// not the dark mockup theme used for Additional Costs per Garment.
const GarmentTypeItems = () => {
  const [selectedGarmentTypeId, setSelectedGarmentTypeId] = useState<
    number | ""
  >("");

  const { data: garmentTypes } = useGetAllGarmentTypes();

  const garmentTypeId =
    typeof selectedGarmentTypeId === "number" ? selectedGarmentTypeId : 0;

  const {
    data: items,
    isLoading,
    isError,
  } = useGetGarmentTypeItems(garmentTypeId);

  const garmentTypeItems = items || [];

  // Legacy (OD_ITM1.PRG) entered Stock Code / Item Code via an [F1] help lookup
  // against od_itm, not free typing - reuse the same live item catalog already
  // powering the Additional Costs per Garment item picker (od_itm -> OrderItems),
  // so users pick a real Stock/Item combination instead of guessing codes.
  const { data: catalogGroups } = useGetMaterialCatalog(true);

  const catalogItems = useMemo(
    () =>
      (catalogGroups || []).flatMap((group) =>
        group.items.map((item) => ({
          stockCode: group.stockCode,
          stockDescription: group.description,
          itemCode: item.itemCode,
          description: item.description,
        })),
      ),
    [catalogGroups],
  );

  // Unit dropdown, sourced from the Unit reference file - large pageSize to
  // effectively fetch all, same pattern as the Stock Code dropdown on the
  // Order Items Catalog screen.
  const { data: unitPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const units = useMemo<Unit[]>(() => unitPageData?.items || [], [unitPageData?.items]);

  const selectMenuProps = {
    MenuProps: {
      PaperProps: {
        sx: {
          backgroundColor: "#ffffff !important",
          "& .MuiMenuItem-root": {
            color: "#000000 !important",
          },
          "& .Mui-selected": {
            backgroundColor: "#e3f2fd !important",
            color: "#000000 !important",
          },
        },
      },
    },
  };

  // The app's root MUI theme is palette.mode: "dark" - its default OutlinedInput
  // border/label colors assume a dark canvas and are barely visible on this
  // screen's plain white page background. The global MuiTextField style override
  // (in themes.ts) only reaches inputs nested inside a <TextField>, so a
  // standalone <Select>/<FormControl> like this one falls through to that
  // invisible dark-mode default unless explicitly overridden here.
  const formControlSx = {
    "& .MuiInputLabel-root": {
      color: "#5f6b7a",
      "&.Mui-focused": {
        color: "#1d5fb4",
      },
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      color: "#000000",
      "& .MuiSelect-select": {
        color: "#000000",
      },
      "& fieldset": {
        borderColor: "rgba(0, 0, 0, 0.4)",
      },
      "&:hover fieldset": {
        borderColor: "#1d5fb4",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1d5fb4",
        borderWidth: "2px",
      },
    },
    "& .MuiSvgIcon-root": {
      color: "#5f6b7a",
    },
  };

  const columns = useMemo<MRT_ColumnDef<GarmentTypeItem>[]>(
    () => [
      {
        // Synthetic, non-persisted field: legacy OD_AITM1.PRG shows Stock+Item as
        // one combined "St/Item" column in its grid, and the [F1] help for Item
        // Code is always seeked as stock+item together (never independently) -
        // so a single picker sourced from the real od_itm/OrderItems catalog is
        // both simpler and truer to how legacy validates the pair. Previously
        // this was two separate columns wired together by mutating
        // row._valuesCache directly, which material-react-table never re-rendered
        // from (nothing was visibly selected, and Stock Code saved as "-").
        // A single MRT-managed select field (same pattern as Order Item
        // Feature's Feature 1-4 columns) avoids that cross-field state bug
        // entirely - there's only ever one field's value to manage.
        id: "stockItem",
        header: "Stock / Item",
        size: 320,
        enableSorting: false,
        accessorFn: (row) => (row.itemCode ? `${row.stockCode}|${row.itemCode}` : ""),
        // Locked once created, same as Order Item Feature's composite key columns.
        enableEditing: (row) => !row.original.itemCode,
        Cell: ({ row }) => (
          <span>
            {row.original.itemCode
              ? `${row.original.stockCode}/${row.original.itemCode} - ${row.original.itemDescription || ""}`
              : "-"}
          </span>
        ),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          SelectProps: selectMenuProps.MenuProps,
          children: catalogItems.map((item) => (
            <MenuItem
              key={`${item.stockCode}|${item.itemCode}`}
              value={`${item.stockCode}|${item.itemCode}`}
            >
              {item.stockCode}/{item.itemCode} - {item.description}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "itemDescription",
        header: "Item Description",
        size: 220,
        enableSorting: false,
        enableEditing: false,
        Cell: ({ renderedCellValue }) => (
          <span>{renderedCellValue?.toString() || "-"}</span>
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        size: 140,
        enableSorting: false,
        editVariant: "select",
        Cell: ({ renderedCellValue }) => (
          <span>{renderedCellValue?.toString().toUpperCase()}</span>
        ),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          SelectProps: selectMenuProps.MenuProps,
          children: units.map((unit) => (
            <MenuItem key={unit.id} value={unit.code}>
              {unit.code} - {unit.description}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 110,
        enableSorting: false,
        muiEditTextFieldProps: {
          type: "number",
          required: true,
        },
      },
    ],
    [catalogItems, units],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">
            GARMENT TYPE WISE ITEM REQUIREMENTS
          </Typography>
        </ThemeProvider>
      </div>

      <Box sx={{ width: "100%", maxWidth: 420, mx: "auto", mb: 3, mt: 1 }}>
        <FormControl fullWidth size="small" sx={formControlSx}>
          <InputLabel id="garment-type-items-select-label">
            Garment Type
          </InputLabel>
          <Select
            labelId="garment-type-items-select-label"
            label="Garment Type"
            value={selectedGarmentTypeId}
            // MUI v9 moved Menu's PaperProps under slotProps.paper; the
            // shared selectMenuProps object still uses the old shape, so
            // translate it here for this one direct <Select> usage.
            MenuProps={{ slotProps: { paper: selectMenuProps.MenuProps.PaperProps } }}
            onChange={(event: SelectChangeEvent<number | "">) =>
              setSelectedGarmentTypeId(
                event.target.value === "" ? "" : Number(event.target.value),
              )
            }
          >
            {(garmentTypes || []).map((garmentType) => (
              <MenuItem key={garmentType.id} value={garmentType.id}>
                {garmentType.typeName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <GarmentTypeItemsTable
        columns={columns}
        data={garmentTypeItems}
        garmentTypeId={garmentTypeId}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default GarmentTypeItems;
