import { useMemo, useState } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, ThemeProvider, Typography } from "@mui/material";

import type { PaginationData } from "../../../interfaces/definitions";

import CurrencyTable from "./country-table.component";
import {
  SelectAllCountries,
  SelectCountriesTotal,
} from "../../../sagaStore/country/country.selector";
import type { Country } from "../../../interfaces/references/Country";

import { Bars } from "react-loading-icons";
import { useSelector } from "react-redux";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

import { useGetCountries } from "../../../api/custom-hooks";

const Countries = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const validationRequired = (value: string) => !value?.length;

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

  // order is important as below

  // 🚀 THE CORRECT WAY TO EXECUTE SELECTORS:
  // Inside your Countries.tsx Component body:

  // 🚀 Execute selectors cleanly within the hook to prevent layout re-render loops
  const { isLoading, isError } = useGetCountries(paginate, pagination);
  const allCountries = useSelector(SelectAllCountries);
  const CountriesTotal = useSelector(SelectCountriesTotal);

  // const isError = useSelector(isErrorState);
  // const isLoading = useSelector(isLoadingState);

  // function useGetCountries() {
  //   return useQuery<Country[]>({
  //     queryKey: [
  //       "countries",
  //       pagination.pageSize,
  //       pagination.pageIndex,
  //       // columnFilters,
  //       // sorting,
  //     ],

  //     queryFn: async () => {
  //       //send api request here

  //       // console.log("PAGINATION : ", pagination.pageIndex);
  //       // const sortBy = sorting[0].id;
  //       // const filterBy =
  //       //   columnFilters.length === 0 ? null : columnFilters[0].id;
  //       // const filterValue =
  //       //   columnFilters.length === 0
  //       //     ? null
  //       //     : (columnFilters[0].value as string);

  //       // console.log("final pagination", {
  //       //   ...paginate,
  //       //   pageNumber: pagination.pageIndex,
  //       //   sortColumn: sortBy,
  //       //   filterColumn: filterBy,
  //       //   filterQuery: filterValue,
  //       //   ...pagination,
  //       // });

  //       await dispatch(
  //         loadAllCountriesStart({
  //           ...paginate,
  //           pageNumber: pagination.pageIndex,
  //           // sortColumn: sortBy,
  //           // filterColumn: filterBy ?? null,
  //           // filterQuery: filterValue ?? null,
  //           ...pagination,
  //         }),
  //       );

  //       // setRowCount(countryPaginationAPIModel.totalItems);
  //       //console.log("RETURNED COUNTRIES :", countryPaginationAPIModel.items);
  //       // setCountryData(countryPaginationAPIModel.items);

  //       // https://stackoverflow.com/questions/70425384/redux-toolkit-returns-the-previous-state-when-you-make-a-request-for-data-how-d

  //       //return countryPaginationAPIModel.items;
  //       return [];
  //     },
  //     // staleTime: 3000,
  //     // refetchInterval: 3000,
  //     refetchOnWindowFocus: false,
  //     //   refetchOnWindowFocus: "always",
  //   });
  // }

  //  const {
  //   // data, // data is COMMENTED so countryData is used instead data here.

  //   isError: isLoadingCountriesError,
  //   isFetching: isFetchingCountries,
  //   isLoading: isLoadingCountries,
  // } = useGetCountries();

  const columns = useMemo<MRT_ColumnDef<Country>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Country Name",
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
        header: "Country Code",
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
    [validationErrors],
  );

  return (
    <>
      <div className="">
        <div className="text-center mt-3 mx-2">
          <ThemeProvider theme={asideMenuTitleTypographyTheme}>
            <Typography color="black">Countries</Typography>
          </ThemeProvider>
        </div>

        <div className="flex justify-around mt-10">
          <CurrencyTable
            columns={columns}
            data={allCountries}
            itemsCount={CountriesTotal}
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

export default Countries;
