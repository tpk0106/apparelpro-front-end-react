import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";

import GarmentTypeTable from "./garment-type-table.component";

// Import your new hooks
import { useGetGarmentTypes } from "../../../tanstack-hooks/custom-hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const GarmentTypes = () => {
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
    data: garmentTypePageData,
    isLoading,
    isError,
  } = useGetGarmentTypes(paginate);

  // // Fetch countries for the dropdown menu (passing pageIndex 0, pageSize 999 to get all)
  // const { data: garmentTypePageData } = useGetGarmentTypes({
  //   pageIndex: 0,
  //   pageSize: 999,
  //   sortColumn: "name",
  //   sortOrder: "asc",
  //   filterColumn: null,
  //   filterQuery: null,
  // });

  // Extract pure items, safely falling back to empty arrays
  const allGarmentTypes = garmentTypePageData?.items || [];
  const garmentTypesTotal = garmentTypePageData?.totalItems || 0;
  //   const garmentTypes = garmentTypePageData?.items || [];

  const columns = useMemo<MRT_ColumnDef<GarmentType>[]>(
    () => [
      {
        accessorKey: "typeName",
        header: "Garment Type Name",
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
    ],
    [validationErrors],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col w-[50%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Garment Types</Typography>
        </ThemeProvider>
      </div>
      <GarmentTypeTable
        columns={columns}
        data={allGarmentTypes}
        itemsCount={garmentTypesTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default GarmentTypes;
