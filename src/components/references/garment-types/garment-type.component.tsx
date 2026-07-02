import { useEffect, useMemo, useState } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { Box, ThemeProvider, Typography } from "@mui/material";

import type { PaginationData } from "../../../interfaces/definitions";

import GarmentTypeTable from "./garment-type-table.component";
import {
  SelectAllGarmentTypes,
  SelectGarmentTypesTotal,
} from "../../../sagaStore/garment-type/garment-type.selector";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import { useGetGarmentTypes } from "../../../api/custom-hooks";

import { Bars } from "react-loading-icons";
import { useSelector } from "react-redux";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";

const GarmentTypes = () => {
  const paginate: PaginationData = {
    pageIndex: 0,
    pageSize: 5,
    sortColumn: null,
    sortOrder: null,
    filterColumn: null,
    filterQuery: null,
  };

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  // order is important as below

  // 🚀 THE CORRECT WAY TO EXECUTE SELECTORS:
  // Inside your Currencies.tsx Component body:

  // 🚀 Execute selectors cleanly within the hook to prevent layout re-render loops
  const { isLoading, isError } = useGetGarmentTypes(paginate, pagination);

  const allGarmentTypes = useSelector(SelectAllGarmentTypes);
  const garmentTypesTotal = useSelector(SelectGarmentTypesTotal);

  useEffect(() => {
    console.log("garment types laoded", allGarmentTypes);
  }, [allGarmentTypes]);

  const columns = useMemo<MRT_ColumnDef<GarmentType>[]>(
    () => [
      {
        accessorKey: "typeName",
        header: "Type Name",
        size: 500,
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
            <Typography color="black">Garment Types</Typography>
          </ThemeProvider>
        </div>

        <div className="flex justify-around mt-10">
          <GarmentTypeTable
            columns={columns}
            data={allGarmentTypes}
            itemsCount={garmentTypesTotal}
            setGarmentTypeComponentPaginationState={(
              pageIndex: number,
              pageSize: number,
            ) => {
              setPagination((prevPagination) => {
                const newState = {
                  ...prevPagination,
                  pageIndex: pageIndex,
                  pageSize: pageSize,
                };
                return newState;
              });
            }}
            isError={isError}
            isLoading={isLoading}
            paginate={paginate}
            pagination={pagination}
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

export default GarmentTypes;
