import { useMemo, useState } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import {
  useGetCountriesQuery,
  useGetDestinations,
} from "../../../tanstack-hooks/custom-hooks";

import { Box, MenuItem, Typography } from "@mui/material";
import type { PortDestination } from "../../../interfaces/references/PortDestination";
import type { Country } from "../../../interfaces/references/Country";

import PortDestinationTable from "./port-destination-table.component";
import { DASHBOARD_COLORS } from "../../dashboard/dashboard-theme";
import { workspaceHeadingSx } from "../../../themes/workspace-theme";
import { useDropdownTheme } from "../../../themes/useDropdownTheme";

const PortDestinations = () => {
  const { listboxSx: dropdownListboxSx } = useDropdownTheme();
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
    data: portDestinationPageData,
    isLoading,
    isError,
  } = useGetDestinations(paginate);

  // Fetch countries for the Country dropdown (large pageSize to effectively get all)
  const { data: countryPageData } = useGetCountriesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const allPortDestinations = portDestinationPageData?.items || [];
  const portDestinationsTotal = portDestinationPageData?.totalItems || 0;

  const countries = useMemo<Country[]>(() => {
    return countryPageData?.items || [];
  }, [countryPageData?.items]);

  const countrySelectMenuProps = {
    MenuProps: { slotProps: { paper: { sx: dropdownListboxSx } } },
  };

  const renderCountryOptions = () =>
    countries.map((country) => (
      <MenuItem key={country.code} value={country.code}>
        <Typography variant="body2" sx={{ color: DASHBOARD_COLORS.textPrimary }}>
          <strong>{country.code}</strong> - {country.name}
        </Typography>
      </MenuItem>
    ));

  const columns = useMemo<MRT_ColumnDef<PortDestination>[]>(
    () => [
      {
        accessorKey: "countryCode",
        header: "Country",
        size: 180,
        enableSorting: false,
        editVariant: "select",
        enableEditing: (row) => !row.original.countryCode,
        Cell: ({ row }) => {
          const country = countries.find(
            (c) => c.code === row.original.countryCode,
          );
          return (
            <Box sx={{ display: "flex" }}>
              <span>
                {country ? `${country.code} - ${country.name}` : row.original.countryCode}
              </span>
            </Box>
          );
        },
        muiEditTextFieldProps: ({ cell }) => ({
          select: true,
          required: true,
          error: !!validationErrors?.countryCode,
          helperText: validationErrors?.countryCode,
          SelectProps: countrySelectMenuProps,
          children: renderCountryOptions(),
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget?.value,
            )
              ? "Country required"
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
        header: "Port/Dest. Code",
        size: 140,
        enableSorting: false,
        enableEditing: (row) => !row.original.code,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.code,
          helperText: validationErrors?.code,
          style: { textTransform: "uppercase" },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Code required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "destinationName",
        header: "Destination / Port Name",
        size: 300,
        enableSorting: false,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.destinationName,
          helperText: validationErrors?.destinationName,
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Destination Name required"
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
    <div
      className="flex flex-col w-[80%] mx-auto justify-around mt-10"
      style={{
        backgroundColor: DASHBOARD_COLORS.pageBg,
        borderRadius: 16,
        padding: "1.5rem",
      }}
    >
      <div className="text-center mt-3 mx-2">
        <Typography variant="h5" sx={workspaceHeadingSx}>
          COUNTRY WISE DESTINATION / PORT
        </Typography>
      </div>
      <PortDestinationTable
        columns={columns}
        data={allPortDestinations}
        itemsCount={portDestinationsTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default PortDestinations;
