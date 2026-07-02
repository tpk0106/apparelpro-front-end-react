import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import {
  ADDRESS_TYPE,
  DEFAULT_ADDREES_MAP,
  type PaginationData,
} from "../../../interfaces/definitions";

import {
  useGetBuyerAddressesByBuyerCode,
  useGetCountriesQuery,
} from "../../../tanstack-hooks/custom-hooks"; // Assume you make a similar hook for countries

import {
  Box,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import type { Country } from "../../../interfaces/references/Country";
import BuyerAddressesTable from "./buyer-address-table.component";
import type { Address } from "../../../interfaces/references/Address";
import { Bars } from "react-loading-icons";

interface BuyerAddressProps {
  buyerCode: number;
}

const BuyerAddresses = ({ buyerCode }: BuyerAddressProps) => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

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
    data: buyerAddresssesPageData,
    isLoading,
    isFetching,
    isError,
  } = useGetBuyerAddressesByBuyerCode(buyerCode, paginate);

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
  const allBuyerAddresses = buyerAddresssesPageData?.items || [];
  const BuyerAddressesTotal = buyerAddresssesPageData?.totalItems || 0;

  // Explicitly memoise the data extraction layer
  const countries = useMemo<Country[]>(() => {
    return countryPageData?.items || [];
  }, [countryPageData?.items]); // Only recalculates when the actual data payload changes

  // const valueMap: Record<string, number> = {
  //   Residential: 1,
  //   Postal: 2,
  //   Corporate: 3,
  //   Billing: 4,
  //   Delivery: 5,
  // };

  const validationRequired = (value: string) => !value?.length;
  const validationRequiredForAddressType = (value: number) => value > 0;

  const columns = useMemo<MRT_ColumnDef<Address>[]>(
    () => [
      {
        accessorKey: "streetAddress",
        header: "Street Address",
        size: 200,
        enableResizing: true,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "city",
        header: "City",
        size: 100,
        enableResizing: true,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "postCode",
        header: "Post Code",
        size: 15,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        // enableColumnFilterModes: false,
        // enableSorting: false,
      },
      {
        accessorKey: "state",
        header: "State",
        size: 20,
        enableColumnActions: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "countryCode",
        header: "Country",
        size: 10,
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

          // 1. 🎨 FIX DROPDOWN COLORS VIA TARGETED POPUP LAYERS
          // Force the floating dropdown items to follow clean, structured colors
          selectprops: {
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
        accessorKey: "addressType",
        header: "Type",
        size: 30,
        enableEditing: true,
        editVariant: "select",
        editSelectOptions: ADDRESS_TYPE,
        // editSelectOptions: [
        //   { label: "Residential", value: 1 },
        //   { label: "Postal", value: 2 },
        //   { label: "Corporate", value: 3 },
        //   { label: "Billing", value: 4 },
        //   { label: "Delivery", value: 5 },
        // ],

        enableColumnFilterModes: true,
        enableColumnFilter: true,
        enableSorting: false,
        Cell: ({ cell }) => {
          const valueMap = {
            1: "Residential",
            2: "Postal",
            3: "Corporate",
            4: "Billing",
            5: "Delivery",
          };
          // const valueMap: Record<string, number> = {
          //   Residential: 1,
          //   Postal: 2,
          //   Corporate: 3,
          //   Billing: 4,
          //   Delivery: 5,
          // };
          const rawValue = cell.getValue();

          return (
            <Box
              sx={{
                display: "flex",
              }}
            >
              <span>
                {valueMap[rawValue as keyof typeof valueMap] || "unknown"}
              </span>
            </Box>
          );
        },
        muiEditTextFieldProps: ({ cell }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.addressType,
          helperText: validationErrors?.addressType,

          value: cell.getValue() ?? "",

          onChange: (event) => {
            console.log("target :", event.target.value);
            const newValue = +event.target.value;

            const validationError = validationRequiredForAddressType(newValue)
              ? "required"
              : undefined; //event.target.value;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
        columnFilterModeOptions: ["contains"],
      },
      {
        accessorKey: "default",
        header: "Default Address ?",
        size: 50,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          console.log("Radio button Values : ", cell.getValue());
          const value = cell.getValue() ? "Yes" : "No";
          console.log("Radio button Values : ", value);
          return (
            <Box
              sx={{
                display: "flex",
              }}
            >
              <span
                className={value === "Yes" ? "text-red-400" : "text-green-400"}
              >
                {value}
              </span>
            </Box>
          );
        },
        muiEditTextFieldProps: ({ cell }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.default,
          helperText: validationErrors?.default,

          children: (
            <Box>
              <RadioGroup
                row
                // name={
                //   cell.getValue() === DEFAULT_ADDREES_MAP["Yes"] ? "Yes" : "No"
                // }
                value={
                  cell.getValue() === DEFAULT_ADDREES_MAP["Yes"] ? "Yes" : "No"
                }
                className="flex justify-around rounded-md"
              >
                <FormControlLabel
                  value={"Yes"}
                  control={<Radio />}
                  label="Yes"
                  className={"p-1"}
                />
                <FormControlLabel
                  value={"No"}
                  control={<Radio />}
                  label="No"
                  className={"p-1"}
                />
              </RadioGroup>
            </Box>
          ),

          onChange: (event) => {
            const rawRadioValue = event.target.value;

            console.log("radio value :", rawRadioValue);
            console.log("event value :", event.target.value);
          },

          // onChange: (event) => {
          //   const rawRadioValue = cell.getValue(),
          //   event.currentTarget?.value,
          // },

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
      },
    ],
    [validationErrors, countries],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <>
      <div className="flex justify-around mt-10">
        <BuyerAddressesTable
          columns={columns}
          data={allBuyerAddresses}
          itemsCount={BuyerAddressesTotal}
          pagination={pagination}
          paginate={paginate}
          setPagination={setPagination}
          isLoading={isLoading}
          isError={isError}
          buyerCode={buyerCode}
        />
      </div>
      {isFetching && (
        <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-120 mt-10 bg-1gray-600">
          {/* <Puff stroke="#60a5fa" /> */}
          <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}
    </>
  );
};

export default BuyerAddresses;
