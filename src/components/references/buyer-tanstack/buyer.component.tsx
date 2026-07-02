import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

// Import your new hooks
import {
  useGetBuyersQuery,
  //   useGetCountriesQuery,
} from "../../../tanstack-hooks/custom-hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";

import BuyerTable from "./buyer-table.component";
import type { Buyer } from "../../../interfaces/references/Buyer";
import { Bars } from "react-loading-icons";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
// import type { Country } from "../../../interfaces/references/Country";

const Buyers = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  // 1. Manage localized UI pagination state
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  //   // 2. Build the dynamic parameters wrapper
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

  //   // 3. 🚀 FETCH DATA DIRECTLY VIA TANSTACK QUERY
  const {
    data: buyerPageData,
    isLoading,
    isFetching,
    isError,
  } = useGetBuyersQuery(paginate);

  //Fetch countries for the dropdown menu (passing pageIndex 0, pageSize 999 to get all)
  //   const { data: countryPageData } = useGetCountriesQuery({
  //     pageIndex: 0,
  //     pageSize: 999,
  //     sortColumn: "name",
  //     sortOrder: "asc",
  //     filterColumn: null,
  //     filterQuery: null,
  //   });

  // Extract pure items, safely falling back to empty arrays
  const allBuyers = buyerPageData?.items || [];
  const BuyersTotal = buyerPageData?.totalItems || 0;

  //   const countries = useMemo<Country[]>(() => {
  //     return countryPageData?.items || [];
  //   }, [countryPageData?.items]); // Only recalculates when the actual data payload changes

  const columns = useMemo<MRT_ColumnDef<Buyer>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Buyer Name",
        size: 300,
        enableEditing: true,
        enableSorting: false,

        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue?.toString().toUpperCase()}</span>,
          </Box>
        ),

        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          style: { textTransform: "uppercase" },
          //   onChange: handleChange,
          //   value: val,
          // onKeyUpCapture: (e) => {
          //   cell.renderValue(e.target.value.toUpperCase());
          //   console.log("key up", e.target.value);
          // },
          //  slotProps: { textTransform: "upperCase" },
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
        accessorKey: "status",
        header: "Status",
        size: 30,
        enableEditing: true,
        editVariant: "select",
        editSelectOptions: ["BO", "BC", "NP", "AG"],
        enableColumnFilterModes: true,
        enableColumnFilter: true,
        enableSorting: false,
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
          //  children,

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
        accessorKey: "telephoneNos",
        header: "Tel.",
        size: 150,
        enableEditing: true,
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: "mobileNos",
        header: "Mobile.",
        size: 150,
        enableEditing: true,
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: "fax",
        header: "Fax",
        size: 150,
        enableEditing: true,
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
      {
        accessorKey: "cusdec",
        header: "CUSDEC",
        size: 30,
        enableEditing: true,
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        enableSorting: false,
        enableColumnActions: false,

        Cell: ({ renderedCellValue }) => (
          <Box
            sx={{
              display: "flex",
            }}
          >
            <span>{renderedCellValue}</span>
          </Box>
        ),
      },
    ],
    [validationErrors],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col w-[80%] mx-auto  justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Buyers</Typography>
        </ThemeProvider>
      </div>
      <BuyerTable
        columns={columns}
        data={allBuyers}
        itemsCount={BuyersTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
      {isFetching && (
        <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-170 mt-10 bg-1gray-600">
          {/* <Puff stroke="#60a5fa" /> */}
          <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
          {/* <Puff stroke="#98ff98" strokeOpacity={1.0} speed={0.75} /> */}
        </div>
      )}
    </div>
  );
};

export default Buyers;
