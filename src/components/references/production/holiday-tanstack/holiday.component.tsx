import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import HolidayTable from "./holiday-table.component";
import { useGetHolidays } from "../../../../tanstack-hooks/production-line-allocation.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { Holiday } from "../../../../interfaces/production/Holiday";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const Holidays = () => {
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const paginate = useMemo<PaginationData>(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sortColumn: "date",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    }),
    [pagination],
  );

  const { data: pageData, isLoading, isError } = useGetHolidays(paginate);

  const allHolidays = pageData?.items || [];
  const holidaysTotal = pageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Holiday>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        size: 130,
        enableEditing: (row) => !row?.original?.date,
        muiEditTextFieldProps: { type: "date" },
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
          <Typography color="black">Production Calendar</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <HolidayTable
          columns={columns}
          data={allHolidays}
          itemsCount={holidaysTotal}
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

export default Holidays;
