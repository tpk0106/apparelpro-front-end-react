import { MaterialReactTable, type MRT_ColumnDef, type MRT_RowData } from "material-react-table";
import { useApparelProTable } from "../../../themes/useApparelProTable";

interface NotePrintReportGridProps<TLine extends MRT_RowData> {
  columns: MRT_ColumnDef<TLine>[];
  data: TLine[];
  isLoading: boolean;
  isError: boolean;
}

// Every note print report's line-item grid (General Inventory and Orderwise Inventory
// alike) is the same read-only, non-paginated MaterialReactTable shell - only the
// columns and data differ per note. Previously duplicated independently in each
// *-print-report-grid.tsx file before this extraction.
export default function NotePrintReportGrid<TLine extends MRT_RowData>({
  columns,
  data,
  isLoading,
  isError,
}: NotePrintReportGridProps<TLine>) {
  const table = useApparelProTable<TLine>({
    columns,
    data,
    initialState: { density: "compact" },
    enableEditing: false,
    enableColumnActions: false,
    enableRowActions: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    enableSorting: false,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
  });

  return <MaterialReactTable table={table} />;
}
