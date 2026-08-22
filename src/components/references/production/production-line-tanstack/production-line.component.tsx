import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import ProductionLineTable from "./production-line-table.component";
import { useGetProductionLines } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { ProductionLine } from "../../../../interfaces/production/ProductionLine";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const ProductionLines = () => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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
    data: productionLinePageData,
    isLoading,
    isError,
  } = useGetProductionLines(paginate);

  const allProductionLines = productionLinePageData?.items || [];
  const productionLinesTotal = productionLinePageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<ProductionLine>[]>(
    () => [
      {
        accessorKey: "lineCode",
        header: "Line Code",
        size: 100,
        enableEditing: (row) => !row?.original?.lineCode,
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 200,
      },
      {
        accessorKey: "numberOfMachines",
        header: "Machines",
        size: 100,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "currencyCode",
        header: "Currency",
        size: 100,
      },
      {
        accessorKey: "lineCostPerDay",
        header: "Line Cost / Day",
        size: 150,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "minimumProductionPerOrder",
        header: "Min. Production / Order",
        size: 180,
        muiEditTextFieldProps: { type: "number" },
      },
      {
        accessorKey: "unitCode",
        header: "Unit",
        size: 100,
      },
      {
        accessorKey: "nextAllocationDate",
        header: "Next Allocation",
        size: 150,
        muiEditTextFieldProps: { type: "date" },
      },
      {
        accessorKey: "estimatedNextAllocationDate",
        header: "Est. Next Allocation",
        size: 150,
        muiEditTextFieldProps: { type: "date" },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[85%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Production Lines</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <ProductionLineTable
          columns={columns}
          data={allProductionLines}
          itemsCount={productionLinesTotal}
          pagination={pagination}
          paginate={paginate}
          setPagination={setPagination}
          isLoading={isLoading}
          isError={isError}
        />
      </Box>
    </div>
  );
};

export default ProductionLines;
