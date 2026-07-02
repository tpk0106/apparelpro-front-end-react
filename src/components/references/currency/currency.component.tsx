import { useEffect, useMemo, useState } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, MenuItem, ThemeProvider, Typography } from "@mui/material";

import type { PaginationData } from "../../../interfaces/definitions";

import CurrencyTable from "./currency-table.component";
import {
  SelectAllCurrencies,
  SelectCurrenciesTotal,
} from "../../../sagaStore/currency/currency.selector";
import type { Currency } from "../../../interfaces/references/Currency";
import { useGetCurrencies } from "../../../api/custom-hooks";

import { SelectAllCountries } from "../../../sagaStore/country/country.selector";
import { Bars } from "react-loading-icons";
import { useDispatch, useSelector } from "react-redux";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import type { Country } from "../../../interfaces/references/Country";

import { loadAllCountriesStart } from "../../../sagaStore/country/country.action";

const Currencies = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const validationRequired = (value: string) => !value?.length;

  const dispatch = useDispatch();

  // 🚀 THE FIX: Make your API input object watch your active state changes!
  const paginate = useMemo<PaginationData>(
    () => ({
      pageIndex: pagination.pageIndex, // Dynamically maps the current view index
      pageSize: pagination.pageSize, // Dynamically maps row counts (5, 10, 20)
      sortColumn: null,
      sortOrder: null,
      filterColumn: null,
      filterQuery: null,
    }),
    [pagination],
  );

  // // 1. Define a static query payload to fetch all countries for the dropdown menu
  // const allCountriesPayload: PaginationData = {
  //   pageNumber: 0,
  //   pageSize: 999, // 👈 Large number to bypass functional paging layout limits
  //   sortColumn: "name", // Optional: automatically sorts your dropdown alphabetized
  //   sortOrder: "asc",
  //   filterColumn: null,
  //   filterQuery: null,
  // };

  // Method 1 Dispatch the load start action once when the component mounts
  // this method is another way to use against using currency action which is better
  // useEffect(() => {
  //   dispatch({
  //     type: COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_START,
  //     payload: allCountriesPayload,
  //   });
  // }, [dispatch]);

  // Method 2 best way
  useEffect(() => {
    // ✅ Clean action creator call with static unpaged parameters
    dispatch(
      loadAllCountriesStart({
        pageIndex: 0,
        pageSize: 999,
        sortColumn: "name", // Optional: keeps dropdown entries alphabetical
        sortOrder: "asc",
        filterColumn: null,
        filterQuery: null,
      }),
    );
  }, [dispatch]); // 🚀 Only runs once on mount, preventing infinite state re-renders

  // const paginate: PaginationData = {
  //   pageIndex: 0,
  //   pageSize: 5,
  //   sortColumn: null,
  //   sortOrder: null,
  //   filterColumn: null,
  //   filterQuery: null,
  // };

  // order is important as below
  const { isLoading, isError } = useGetCurrencies(paginate, pagination);

  // 🚀 THE CORRECT WAY TO EXECUTE SELECTORS:
  // Inside your Currencies.tsx Component body:

  // 🚀 Execute selectors cleanly within the hook to prevent layout re-render loops

  // get all currenccies for table page
  const allCurrencies = useSelector(SelectAllCurrencies);
  const selectCurrenciesTotal = useSelector(SelectCurrenciesTotal);

  // get all countries
  const countries = useSelector(SelectAllCountries);

  // Dedicated debug log hook (Safe from loops)
  useEffect(() => {
    console.log("Loaded countries list payload:", countries);
  }, [countries]);

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

        enableEditing: (row) => row.original.countryCode?.length == 0,
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
          error: !!validationErrors?.state,
          helperText: validationErrors?.state,
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

  return (
    <>
      <div className="">
        <div className="text-center mt-3 mx-2">
          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
            <Typography color="black">Currencies</Typography>
          </ThemeProvider>
        </div>

        <div className="flex justify-around mt-10">
          <CurrencyTable
            columns={columns}
            data={allCurrencies}
            itemsCount={selectCurrenciesTotal}
            // 🚀 THE FIX: Pass your state hook dispatcher directly to the child table
            pagination={pagination}
            paginate={paginate}
            setPagination={setPagination}
            isError={isError}
            isLoading={isLoading}
          />
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-170 mt-10 bg-1gray-600">
          {/* <Puff stroke="#60a5fa" /> */}
          <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}
    </>
  );
};

export default Currencies;
