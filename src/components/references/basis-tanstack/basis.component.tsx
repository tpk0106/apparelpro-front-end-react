import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, ThemeProvider, Typography } from "@mui/material";

import { type PaginationData } from "../../../interfaces/definitions";
import BasisTable from "./basis-table.component";
// Import your new hooks
import { useGetBasis } from "../../../tanstack-hooks/custom-hooks";
import type { Basis } from "../../../interfaces/references/Basis";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const Basises = () => {
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
  const { data: BasisPageData, isLoading, isError } = useGetBasis(paginate);

  // Extract pure items, safely falling back to empty arrays
  const allBasises = BasisPageData?.items || [];
  const BasisesTotal = BasisPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Basis>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Description",
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
          error: !!validationErrors?.description,

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
        header: "Basis Code",
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
          // Code is nvarchar(3) in the DB (BasisConfig.cs HasMaxLength(3)) -
          // enforce the same limit here so the input can't be typed past it.
          // NOTE: MUI v9 removed the legacy `inputProps` shorthand from
          // TextField - it's silently ignored now. The current API is
          // `slotProps.htmlInput`, which actually reaches the <input> element.
          slotProps: { htmlInput: { maxLength: 3 } },

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
        accessorKey: "valueAdd",
        header: "Add value ?",
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
    [validationErrors],
  );

  return (
    <div className="flex flex-col w-[50%] min-w-[700px] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Basis</Typography>
        </ThemeProvider>
      </div>
      <BasisTable
        columns={columns}
        data={allBasises}
        itemsCount={BasisesTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default Basises;
