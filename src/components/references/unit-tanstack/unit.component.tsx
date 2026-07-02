import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

// Import your new hooks
import { useGetUnits } from "../../../tanstack-hooks/custom-hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { Unit } from "../../../interfaces/references/Unit";
import UnitTable from "./unit-table.component";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const Units = () => {
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
  const { data: unitPageData, isLoading, isError } = useGetUnits(paginate);

  // Extract pure items, safely falling back to empty arrays
  const allUnits = unitPageData?.items || [];
  const unitsTotal = unitPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Unit Description",
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
          //   required: true,
          style: { textTransform: "uppercase" },
          //   error: !!validationErrors?.code,

          // onBlur: (event) => {
          //   console.log("obBlur : ", event.currentTarget.value);
          //   const validationError = validationRequired(
          //     event.currentTarget.value,
          //   )
          //     ? "required"
          //     : undefined;
          //   setValidationErrors({
          //     ...validationErrors,
          //     [cell.id]: validationError,
          //   });
          // },
        }),
      },
      {
        accessorKey: "code",
        header: "Unit Code",
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
              ? "unnit code required"
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

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col w-[50%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Units</Typography>
        </ThemeProvider>
      </div>
      <UnitTable
        columns={columns}
        data={allUnits}
        itemsCount={unitsTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default Units;
