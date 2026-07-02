import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../interfaces/definitions";

import {
  useGetGarmentTypes,
  useGetStyles,
  useGetUnits,
} from "../../tanstack-hooks/custom-hooks";

import { MenuItem, ThemeProvider, Typography } from "@mui/material";
import StyleTable from "./styles-table.component";
import type { Style } from "../../interfaces/OrderManagement/Style";
import type { Unit } from "../../interfaces/references/Unit";
import type { GarmentType } from "../../interfaces/references/GarmentType";
import { asideMenuTitleTypographyTheme } from "../../themes/themes";

interface styleProps {
  buyerCode: number;
  order: string;
  setUnit?: React.Dispatch<React.SetStateAction<string>>;
  setTotal?: React.Dispatch<React.SetStateAction<number>>;
  mainOrderUnit: string;
  // 1. Add the selection trigger function prop to the component signature
  onSelectStyleForBreakdown: (style: Style) => void;
  activeSelectedStyle: Style | null;
}

const Styles = ({
  buyerCode,
  order,
  mainOrderUnit,
  onSelectStyleForBreakdown,
  activeSelectedStyle,
  // setUnit,
  // setTotal,
}: styleProps) => {
  // Fix 2: Initialize your state object to support smooth updates
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const validationRequired = (value: string) => !value || !value?.trim().length;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // const [unit, setUnit] = useState<string>(null);
  // const [total, setTotal] = useState<number>(0);

  const paginate = useMemo<PaginationData>(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortColumn: null,
      sortOrder: null,
      filterColumn: null,
      filterQuery: null,
    }),
    [pagination],
  );

  const { data: stylePageData, isLoading, isError } = useGetStyles(paginate);
  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const { data: garmentTypesPageData } = useGetGarmentTypes({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "typeName",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const allStyles = stylePageData?.items || [];
  const StylesTotal = stylePageData?.totalItems || 0;

  const units = useMemo<Unit[]>(
    () => unitsPageData?.items || [],
    [unitsPageData?.items],
  );

  const garmentTypes = useMemo<GarmentType[]>(() => {
    // Fix 3: Log before the return statement
    // console.log("garment types database stream:", garmentTypesPageData?.items);
    return garmentTypesPageData?.items || [];
  }, [garmentTypesPageData?.items]);

  const columns = useMemo<MRT_ColumnDef<Style>[]>(
    () => [
      {
        accessorKey: "typeCode", // Strictly tracks the number ID (e.g. 1, 2, 3)
        header: "Type",
        size: 50,
        enableEditing: (row) => row.original.typeCode !== 0,
        enableColumnActions: false,
        enableColumnFilter: false,
        editVariant: "select",

        // 1. CLEAN READABLE RENDERING (Translates ID "1" to "Ladies Jacket" instantly)
        Cell: ({ cell }) => {
          const rawValue = cell.getValue<number>();
          const matchingType = garmentTypes.find(
            (gt) => gt.id === Number(rawValue),
          );
          console.log("type:", matchingType);
          return <span>{matchingType ? matchingType.typeName : rawValue}</span>;
        },

        muiEditTextFieldProps: ({ cell }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.typeCode,
          helperText: validationErrors?.typeCode,

          // Explicitly bind the active field value to the tracking row state database ID
          defaultValue: cell.getValue<number>() || "",

          SelectProps: {
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#ffffff !important",
                  "& .MuiMenuItem-root": { color: "#000000 !important" },
                  "& .Mui-selected": {
                    backgroundColor: "#e3f2fd !important",
                    color: "#000000 !important",
                  },
                },
              },
            },
          },

          // 2. HIDDEN KEY STRATEGY: Pass the ID as the value, but render the name as the layout text
          children: garmentTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              <Typography
                variant="body2"
                sx={{ color: "#000000", fontWeight: 600 }}
              >
                {type.typeName}
              </Typography>
            </MenuItem>
          )),

          // SAFE TYPE-SAFE SELECTION: Let the input naturally bubble up the event
          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedId = Number(event.target.value);
            const isInvalid = !selectedId || selectedId <= 0;

            setValidationErrors((prev) => ({
              ...prev,
              typeCode: isInvalid ? "Garment type required" : undefined,
            }));
          },

          onBlur: (event) => {
            const selectedId = Number(event.target.value);
            const isInvalid = !selectedId || selectedId <= 0;
            setValidationErrors((prev) => ({
              ...prev,
              typeCode: isInvalid ? "Garment type required" : undefined,
            }));
          },
        }),
      },
      {
        accessorKey: "styleCode",
        header: "Style",
        size: 100,
        enableEditing: true,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => (
          <span>{renderedCellValue?.toString().toUpperCase()}</span>
        ),
        muiEditTextFieldProps: () => ({
          type: "text",
          required: true,
          error: !!validationErrors?.styleCode,
          helperText: validationErrors?.styleCode,
          inputProps: { style: { textTransform: "uppercase" } }, // Target HTML element casing context directly
          onBlur: (event) => {
            const isValid = !validationRequired(event.target.value);
            setValidationErrors((prev) => ({
              ...prev,
              // Fix 2: Explicit property tracking key reference alignment
              styleCode: isValid ? undefined : "Style code required",
            }));
          },
        }),
      },
      {
        accessorKey: "unit", // Successfully changed from unitCode to unit to match API models
        header: "Unit",
        size: 50,
        // ✅ FIX: Allow editing if it's a completely brand new row OR if the existing value is populated
        enableEditing: (row) => row.index === -1 || row.original.unit !== "",
        enableColumnActions: false,
        enableColumnFilter: false,
        editVariant: "select",

        // Translates abbreviation codes ("PCS") into clean descriptive text layout displays ("Pieces")
        Cell: ({ cell }) => {
          const rawValue = cell.getValue<string>();
          const matchingUnit = units.find((u) => u.code === rawValue);
          return (
            <span>{matchingUnit ? matchingUnit.description : rawValue}</span>
          );
        },

        muiEditTextFieldProps: () => ({
          select: true,
          required: true,
          // Explicitly bind the active field value to the tracking row state database ID
          // defaultValue: cell.getValue<string>() || "",
          error: !!validationErrors?.unit,
          helperText: validationErrors?.unit,
          SelectProps: {
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#ffffff !important",
                  "& .MuiMenuItem-root": { color: "#000000 !important" },
                  "& .Mui-selected": {
                    backgroundColor: "#e3f2fd !important",
                    color: "#000000 !important",
                  },
                },
              },
            },
          },

          // Keeps key code cached in state values, while giving the user a descriptive layout label string
          children: units.map((u) => (
            <MenuItem key={u.code} value={u.code}>
              <Typography variant="body2" sx={{ color: "#000000" }}>
                <strong>{u.code}</strong> - {u.description}
              </Typography>
            </MenuItem>
          )),

          onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
            const selectedValue = event.target.value;
            const isInvalid = !selectedValue || !selectedValue.trim().length;

            setValidationErrors((prev) => ({
              ...prev,
              unit: isInvalid ? "Unit selection required" : undefined,
            }));
          },
        }),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        size: 100,
        enableEditing: true,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => <span>{renderedCellValue}</span>,
        muiEditTextFieldProps: () => ({
          type: "number", // Forces standard numeric keyboard layout
          required: true,
          error: !!validationErrors?.quantity,
          helperText: validationErrors?.quantity,
          // Prevent typing negative numbers or floats via native HTML inputs
          slotProps: {
            htmlInput: { min: 1, step: 1 },
          },
          onBlur: (event) => {
            const val = Number(event.target.value);
            // Clearer domain-specific business validation rules
            const isInvalid = !event.target.value || isNaN(val) || val <= 0;

            setValidationErrors((prev) => ({
              ...prev,
              quantity: isInvalid
                ? "Quantity must be greater than 0"
                : undefined,
            }));
          },
        }),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        size: 100,
        enableEditing: true,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => <span>{renderedCellValue}</span>,
        muiEditTextFieldProps: () => ({
          type: "number",
          required: true,
          error: !!validationErrors?.unitPrice,
          helperText: validationErrors?.unitPrice,
          // Support decimal currency floats cleanly
          slotProps: {
            htmlInput: { min: 0.01, step: 0.01 },
          },
          onBlur: (event) => {
            // const val = Float32Array; // Simple float fallback rule check
            const parsedVal = parseFloat(event.target.value);
            const isInvalid =
              !event.target.value || isNaN(parsedVal) || parsedVal <= 0;

            setValidationErrors((prev) => ({
              ...prev,
              unitPrice: isInvalid
                ? "Unit price must be greater than 0"
                : undefined,
            }));
          },
        }),
      },
    ],
    [validationErrors, units, garmentTypes],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col justify-around mt-10 w-full">
      <div>
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="blue-gray" className="text-center flex flex-col">
            <span>UNIT : {mainOrderUnit}</span>
            <span>TOTAL</span>
          </Typography>
        </ThemeProvider>
      </div>
      <StyleTable
        columns={columns}
        data={allStyles}
        itemsCount={StylesTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
        buyerCode={buyerCode}
        order={order}
        mainOrderUnit={mainOrderUnit}
        // ✅ PASS THE STATE DOWN AS PROPS HERE:
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
        onSelectStyleForBreakdown={onSelectStyleForBreakdown}
        activeSelectedStyle={activeSelectedStyle}

        // setUnit={setUnit}
        // setTotal={setTotal}
      />
    </div>
  );
};

export default Styles;
