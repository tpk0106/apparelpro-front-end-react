import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import OperationTable from "./operation-table.component";
import { useGetOperations } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { Operation } from "../../../../interfaces/production/Operation";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const Operations = () => {
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

  const { data: operationPageData, isLoading, isError } =
    useGetOperations(paginate);

  const allOperations = operationPageData?.items || [];
  const operationsTotal = operationPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Operation>[]>(
    () => [
      {
        accessorKey: "operationCode",
        header: "Operation Code",
        size: 150,
        enableEditing: (row) => !row?.original?.operationCode,
      },
      {
        accessorKey: "description",
        header: "Operation",
        size: 300,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Operation Reference</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <OperationTable
          columns={columns}
          data={allOperations}
          itemsCount={operationsTotal}
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

export default Operations;
