import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { ADDRESS_TYPE, type PaginationData } from "../../../interfaces/definitions";

import {
  useGetBankAddressesByBankCode,
  useGetCountriesQuery,
} from "../../../tanstack-hooks/custom-hooks";

import { Box, MenuItem, Typography } from "@mui/material";
import type { Country } from "../../../interfaces/references/Country";
import BankAddressesTable from "./bank-address-table.component";
import type { Address } from "../../../interfaces/references/Address";
import { Bars } from "react-loading-icons";

interface BankAddressProps {
  bankCode: string;
}

const BankAddresses = ({ bankCode }: BankAddressProps) => {
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
    data: bankAddresssesPageData,
    isLoading,
    isFetching,
    isError,
  } = useGetBankAddressesByBankCode(bankCode, paginate);

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
  const allBankAddresses = bankAddresssesPageData?.items || [];
  const bankAddressesTotal = bankAddresssesPageData?.totalItems || 0;

  // Explicitly memoise the data extraction layer
  const countries = useMemo<Country[]>(() => {
    return countryPageData?.items || [];
  }, [countryPageData?.items]); // Only recalculates when the actual data payload changes

  const validationRequired = (value: string) => !value?.length;
  const validationRequiredForAddressType = (value: number) => value > 0;

  const columns = useMemo<MRT_ColumnDef<Address>[]>(
    () => [
      {
        accessorKey: "addressId",
        header: "AddressId",
      },
      {
        accessorKey: "streetAddress",
        header: "Street Address",
        size: 250,
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

          // Force the floating dropdown items to follow clean, structured colors
          selectprops: {
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
          },

          children:
            countries?.map((country: Country) => (
              <MenuItem
                key={country.id}
                value={country.code}
                sx={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
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
            const newValue = +event.target.value;

            const validationError = validationRequiredForAddressType(newValue)
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
        accessorKey: "default",
        header: "Default Address ?",
        size: 50,
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        editVariant: "select",
        editSelectOptions: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
        Cell: ({ cell }) => {
          const value = cell.getValue() ? "Yes" : "No";
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
        muiEditTextFieldProps: {
          select: true,
        },
      },
    ],
    [validationErrors, countries],
  );

  return (
    <>
      <div className="flex justify-around mt-10 w-full">
        <BankAddressesTable
          columns={columns}
          data={allBankAddresses}
          itemsCount={bankAddressesTotal}
          pagination={pagination}
          paginate={paginate}
          setPagination={setPagination}
          isLoading={isLoading}
          isError={isError}
          bankCode={bankCode}
        />
      </div>
      {isFetching && (
        <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-120 mt-10 bg-1gray-600">
          <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
        </div>
      )}
    </>
  );
};

export default BankAddresses;
