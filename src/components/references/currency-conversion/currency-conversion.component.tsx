import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import {
  useGetCurrencyConversions,
  useGetCurrenciesQuery,
} from "../../../tanstack-hooks/custom-hooks";

import { MenuItem, ThemeProvider, Typography } from "@mui/material";
import type { CurrencyConversion } from "../../../interfaces/references/CurrencyConversion";
import type { Currency } from "../../../interfaces/references/Currency";

import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import CurrencyConversionTable from "./currency-conversion-table.component";

// Currency Conversion (od_conv-style flat From/To rate table) - Reference Data >
// General > Currency Conversion. Backend rebuilt 2026-08-09 (was previously a
// broken shell - empty service models, NotImplementedException on every write,
// a controller that always returned an empty 200 OK). Global theme
// (useApparelProTable), same as Stock Reference / Order Items Catalog.
const CurrencyConversionPage = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

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

  const {
    data: currencyConversionPageData,
    isLoading,
    isError,
  } = useGetCurrencyConversions(paginate);

  const allCurrencyConversions = currencyConversionPageData?.items || [];
  const currencyConversionTotal = currencyConversionPageData?.totalItems || 0;

  // Fetch every Currency master code for the From/To dropdowns - large pageSize
  // to effectively get all, same pattern the Stock Code dropdown uses on Order
  // Items Catalog.
  const { data: currencyPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const currencies = useMemo<Currency[]>(() => {
    return currencyPageData?.items || [];
  }, [currencyPageData?.items]);

  const currencySelectMenuProps = {
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

  const columns = useMemo<MRT_ColumnDef<CurrencyConversion>[]>(
    () => [
      {
        accessorKey: "fromCurrency",
        header: "From Currency",
        size: 200,
        enableSorting: false,
        editVariant: "select",
        // Locked once created - identity field, same convention as Order Items
        // Catalog's Stock Code column.
        enableEditing: (row) => !row.original.fromCurrency,
        Cell: ({ row }) => (
          <span>
            {row.original.fromCurrency
              ? `${row.original.fromCurrency} - ${row.original.fromCurrencyName || ""}`
              : "-"}
          </span>
        ),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.fromCurrency,
          SelectProps: currencySelectMenuProps.MenuProps,
          children: currencies.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "toCurrency",
        header: "To Currency",
        size: 200,
        enableSorting: false,
        editVariant: "select",
        enableEditing: (row) => !row.original.toCurrency,
        Cell: ({ row }) => (
          <span>
            {row.original.toCurrency
              ? `${row.original.toCurrency} - ${row.original.toCurrencyName || ""}`
              : "-"}
          </span>
        ),
        muiEditTextFieldProps: {
          select: true,
          required: true,
          error: !!validationErrors?.toCurrency,
          SelectProps: currencySelectMenuProps.MenuProps,
          children: currencies.map((currency) => (
            <MenuItem key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </MenuItem>
          )),
        },
      },
      {
        accessorKey: "value",
        header: "Rate",
        size: 150,
        enableSorting: false,
        muiEditTextFieldProps: ({ cell }) => ({
          type: "number",
          required: true,
          error: !!validationErrors?.value,
          onBlur: (event) => {
            const numericValue = Number(event.currentTarget.value);
            const validationError =
              validationRequired(event.currentTarget.value) || numericValue <= 0
                ? "Rate must be greater than zero"
                : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
    ],
    [validationErrors, currencies],
  );

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">CURRENCY CONVERSION</Typography>
        </ThemeProvider>
      </div>
      <CurrencyConversionTable
        columns={columns}
        data={allCurrencyConversions}
        itemsCount={currencyConversionTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default CurrencyConversionPage;
