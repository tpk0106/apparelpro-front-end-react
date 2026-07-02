import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";
import BankTable from "./bank-table.component";

// Import your new hooks
import {
  useGetBanksQuery,
  useGetCurrenciesQuery,
} from "../../../tanstack-hooks/custom-hooks";

import type { Bank } from "../../../interfaces/references/Bank";
import { Box, MenuItem, Typography } from "@mui/material";
import type { Currency } from "../../../interfaces/references/Currency";

const Banks = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  // 1. Manage localized UI pagination state
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  // 2. Build the dynamic parameters wrapper
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

  // 3. 🚀 FETCH DATA DIRECTLY VIA TANSTACK QUERY
  const { data: bankPageData, isLoading, isError } = useGetBanksQuery(paginate);

  // Fetch countries for the dropdown menu (passing pageIndex 0, pageSize 999 to get all)
  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  // Extract pure items, safely falling back to empty arrays
  const allBanks = bankPageData?.items || [];
  const banksTotal = bankPageData?.totalItems || 0;
  // const currencies = currencyPageData?.items || [];

  // Explicitly memoise the data extraction layer
  const currencies = useMemo<Currency[]>(() => {
    return currencyPageData?.items || [];
  }, [currencyPageData?.items]); // Only recalculates when the actual data payload changes

  const columns = useMemo<MRT_ColumnDef<Bank>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Bank Name",
        size: 400,
        enableEditing: true,
        enableSorting: false,

        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),

        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          style: { textTransform: "uppercase" },
          error: !!validationErrors?.name,

          onBlur: (event) => {
            console.log("obBlur : ", event.currentTarget.value);
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "bankCode",
        header: "Bank Code",
        size: 100,
        enableEditing: true,
        enableSorting: false,

        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),

        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.BankCode,
          style: { textTransform: "uppercase" },

          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "currencyCode",
        header: "Currency",
        size: 50,

        enableEditing: (row) => row.original.currencyCode.length !== -1,
        enableColumnActions: false,
        enableColumnFilter: false,
        editVariant: "select",

        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.currencyCode,
          helperText: validationErrors?.currencyCode,

          // 1. 🎨 FIX DROPDOWN COLORS VIA TARGETED POPUP LAYERS
          // Force the floating dropdown items to follow clean, structured colors
          SelectProps: {
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: "#ffffff !important", // Fixed white menu canvas
                  "& .MuiMenuItem-root": {
                    color: "#000000 !important", // Fixed bold black text
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#e3f2fd !important", // Soft highlighted selection row
                    color: "#000000 !important",
                  },
                },
              },
            },
          },

          //   // method 1
          //   // 2. 🌍 RENDER CUSTOM POPUP MENU OPTIONS DYNAMICALLY WITH FLAGS
          //   // 1. 🚀 MAP YOUR BACKEND OBJECTS INTO MRT COMPATIBLE LABELS/VALUES
          children:
            currencies?.map((currency: Currency) => (
              <MenuItem
                key={currency.id}
                value={currency.code}
                sx={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {/* Render flag if string exists; falls back to universal flag emoji if empty string */}

                <Typography variant="body2" sx={{ color: "#000000" }}>
                  <strong>{currency.code}</strong> - {currency.name}
                </Typography>
              </MenuItem>
            )) || [],

          // or this way method 2 via children prop
          // editSelectOptions:
          //   countries.map((country: Country) => ({
          //     text: country.name,
          //     value: country.code,
          //   })) || [],

          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget?.value,
            )
              ? "required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
        columnFilterModeOptions: ["contains"],
      },
    ],
    [validationErrors, currencies],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex justify-around mt-10">
      <BankTable
        columns={columns}
        data={allBanks}
        itemsCount={banksTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default Banks;
