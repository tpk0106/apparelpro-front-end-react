import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import NonProductiveHourCodeTable from "./non-productive-hour-code-table.component";
import { useGetNonProductiveHourCodes } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { NonProductiveHourCode } from "../../../../interfaces/production/NonProductiveHourCode";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const NonProductiveHourCodes = () => {
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

  const { data: pageData, isLoading, isError } =
    useGetNonProductiveHourCodes(paginate);

  const allCodes = pageData?.items || [];
  const codesTotal = pageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<NonProductiveHourCode>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        size: 100,
        enableEditing: (row) => !row?.original?.code,
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 300,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Non-Productive Nature</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <NonProductiveHourCodeTable
          columns={columns}
          data={allCodes}
          itemsCount={codesTotal}
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

export default NonProductiveHourCodes;
