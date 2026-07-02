import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";
import CurrencyTable from "./currency-table.component";

// Import your new hooks
import { useGetCurrenciesQuery } from "../../../tanstack-hooks/custom-hooks";
import { useGetCountriesQuery } from "../../../tanstack-hooks/custom-hooks"; // Assume you make a similar hook for countries
import type { Currency } from "../../../interfaces/references/Currency";
import { Box, MenuItem, ThemeProvider, Typography } from "@mui/material";
import type { Country } from "../../../interfaces/references/Country";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const Currencies = () => {
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
  const {
    data: currencyPageData,
    isLoading,
    isError,
  } = useGetCurrenciesQuery(paginate);

  // Fetch countries for the dropdown menu (passing pageIndex 0, pageSize 999 to get all)
  const { data: countryPageData } = useGetCountriesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  // Extract pure items, safely falling back to empty arrays
  const allCurrencies = currencyPageData?.items || [];
  const currenciesTotal = currencyPageData?.totalItems || 0;
  //const countries = countryPageData?.items || [];

  // Explicitly memoise the data extraction layer
  const countries = useMemo<Country[]>(() => {
    return countryPageData?.items || [];
  }, [countryPageData?.items]); // Only recalculates when the actual data payload changes

  const columns = useMemo<MRT_ColumnDef<Currency>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Currency Name",
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
        accessorKey: "code",
        header: "Currency Code",
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
          error: !!validationErrors?.code,
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
        accessorKey: "countryCode",
        header: "Country",
        size: 50,

        enableEditing: (row) => row.original.countryCode?.length === 0,
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
          error: !!validationErrors?.countryCode,
          helperText: validationErrors?.countryCode,
          //children,

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

          // method 1
          // 2. 🌍 RENDER CUSTOM POPUP MENU OPTIONS DYNAMICALLY WITH FLAGS
          // 1. 🚀 MAP YOUR BACKEND OBJECTS INTO MRT COMPATIBLE LABELS/VALUES
          children:
            countries?.map((country: Country) => (
              <MenuItem
                key={country.id}
                value={country.code}
                sx={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {/* Render flag if string exists; falls back to universal flag emoji if empty string */}
                <span>{country.flag ? country.flag : "🏳️"}</span>
                <Typography variant="body2" sx={{ color: "#000000" }}>
                  <strong>{country.code}</strong> - {country.name}
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
      {
        accessorKey: "minor",
        header: "Minor",
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
    ],
    [validationErrors, countries],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">CURRENCIES</Typography>
        </ThemeProvider>
      </div>
      <CurrencyTable
        columns={columns}
        data={allCurrencies}
        itemsCount={currenciesTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default Currencies;
