import { useState, useMemo } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import type { PaginationData } from "../../../../interfaces/definitions";

import EmployeeTable from "./employee-table.component";
import { useGetEmployees } from "../../../../tanstack-hooks/production-reference.hooks";

import { Box, ThemeProvider, Typography } from "@mui/material";
import type { Employee } from "../../../../interfaces/production/Employee";
import { asideMenuTitleTypographyTheme } from "../../../../themes/themes";

const Employees = () => {
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

  const { data: pageData, isLoading, isError } = useGetEmployees(paginate);

  const allEmployees = pageData?.items || [];
  const employeesTotal = pageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "employeeCode",
        header: "Employee No.",
        size: 130,
        enableEditing: (row) => !row?.original?.employeeCode,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 300,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col w-[60%] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Employee Reference</Typography>
        </ThemeProvider>
      </div>
      <Box>
        <EmployeeTable
          columns={columns}
          data={allEmployees}
          itemsCount={employeesTotal}
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

export default Employees;
