import { useMemo, useState } from "react";
import type { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { ThemeProvider, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import type { PaginationData } from "../../../interfaces/definitions";
import type { SubContractor } from "../../../interfaces/references/SubContractor";
import { useGetSubContractors } from "../../../tanstack-hooks/custom-hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import SubContractorTable from "./sub-contractor-table.component";

// Standard reference-data screen (Code+Name), matching the Basis/Unit template -
// NOT the scoped dark "mockup" theme used by additional-cost.component.tsx (that
// experiment is explicitly file-scoped to those two files only, see its header
// comment). This screen uses the shared useApparelProTable hook + ConfirmDialog,
// which is the actual project-wide default.
const SubContractors = () => {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

  const validationRequired = (value: string) => !value?.length;

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 5,
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
    data: subContractorPageData,
    isLoading,
    isError,
  } = useGetSubContractors(paginate);

  const allSubContractors = subContractorPageData?.items || [];
  const subContractorsTotal = subContractorPageData?.totalItems || 0;

  const columns = useMemo<MRT_ColumnDef<SubContractor>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        size: 100,
        enableSorting: false,
        enableEditing: (row) => !row.original.code,
        Cell: ({ renderedCellValue }) => (
          <Box sx={{ display: "flex" }}>
            <span>{renderedCellValue?.toString().toUpperCase()}</span>
          </Box>
        ),
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.code,
          style: { textTransform: "uppercase" },
          // Code is varchar(6) in the DB (SubContractorConfig.cs) - enforce the
          // same limit here so the input can't be typed past it.
          slotProps: { htmlInput: { maxLength: 6 } },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Code required"
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
          },
        }),
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 260,
        enableSorting: false,
        muiEditTextFieldProps: ({ cell }) => ({
          type: "text",
          required: true,
          error: !!validationErrors?.name,
          // Name is varchar(40) in the DB (SubContractorConfig.cs).
          slotProps: { htmlInput: { maxLength: 40 } },
          onBlur: (event) => {
            const validationError = validationRequired(
              event.currentTarget.value,
            )
              ? "Name required"
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
    <div className="flex flex-col w-[50%] min-w-[700px] mx-auto justify-around mt-10">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">Sub Contractor</Typography>
        </ThemeProvider>
      </div>
      <SubContractorTable
        columns={columns}
        data={allSubContractors}
        itemsCount={subContractorsTotal}
        pagination={pagination}
        paginate={paginate}
        setPagination={setPagination}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
};

export default SubContractors;
