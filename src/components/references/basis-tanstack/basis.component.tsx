import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import {
  DEFAULT_ADDREES_MAP,
  type PaginationData,
} from "../../../interfaces/definitions";
import BasisTable from "./basis-table.component";

// Import your new hooks
import { useGetBasis } from "../../../tanstack-hooks/custom-hooks";

import type { Basis } from "../../../interfaces/references/Basis";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
// import type { Currency } from "../../../interfaces/references/Currency";

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
  // const currencies = currencyPageData?.items || [];

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
      // {
      //   accessorKey: "valueAdd",
      //   header: "Value Add",
      //   size: 100,
      //   enableEditing: true,
      //   enableSorting: false,

      //   Cell: ({ renderedCellValue }) => (
      //     <Box
      //       sx={{
      //         display: "flex",
      //       }}
      //     >
      //       <span>{renderedCellValue?.toString().toUpperCase()}</span>
      //     </Box>
      //   ),

      //   muiEditTextFieldProps: ({ cell }) => ({
      //     type: "text",
      //     required: true,
      //     error: !!validationErrors?.valueAdd,
      //     style: { textTransform: "uppercase" },

      //     onBlur: (event) => {
      //       const validationError = validationRequired(
      //         event.currentTarget.value,
      //       )
      //         ? "required"
      //         : undefined;
      //       setValidationErrors({
      //         ...validationErrors,
      //         [cell.id]: validationError,
      //       });
      //     },
      //   }),
      // },
    ],
    [validationErrors],
  );

  // ... keep your columns array layout exactly the same as before ...

  return (
    <div className="flex flex-col w-[40%] mx-auto justify-around mt-10">
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
