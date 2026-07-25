import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../interfaces/definitions";
import { useGetSuppliersQuery } from "../../../tanstack-hooks/custom-hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";

import SupplierTable from "./supplier-table.component";
import { Bars } from "react-loading-icons";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import type { Supplier } from "../../../interfaces/references/Supplier";

const Suppliers = () => {
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
    data: supplierPageData,
    isLoading,
    isFetching,
    isError,
  } = useGetSuppliersQuery(paginate);

  // Extract pure items, safely falling back to empty arrays
  const allSuppliers = supplierPageData?.items || [];
  const suppliersTotal = supplierPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: "supplierCode",
        header: "Supplier Code",
      },
      {
        accessorKey: "name",
        header: "Supplier Name",
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
    ],
    [validationErrors],
  );

  return (
    <div className="flex flex-col w-[90%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">SUPPLIERS</Typography>
        </ThemeProvider>
      </div>
      <SupplierTable
        columns={columns}
        data={allSuppliers}
        itemsCount={suppliersTotal}
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

export default Suppliers;
