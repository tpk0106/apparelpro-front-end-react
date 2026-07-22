import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useApparelProTable } from "../../themes/useApparelProTable";
import type { StrnPrintReportLine } from "./strn-print-report.types";

interface Props {
  data: StrnPrintReportLine[];
  isLoading: boolean;
  isError: boolean;
}

export default function StrnPrintReportGrid({
  data,
  isLoading,
  isError,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<StrnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 130 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Issued",
        size: 130,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      { accessorKey: "storeCode", header: "Store", size: 100 },
    ],
    [],
  );

  // Deliberately client-side, NOT server-paginated: unlike the Stock Movement Report's
  // open-ended transaction ledger, this grid always renders the complete, fixed set of
  // lines belonging to one already-committed STRN document — exactly what the PDF export
  // prints. Paginating it here would let the on-screen preview show a different subset of
  // rows than the generated PDF, which defeats the purpose of a print preview.
  const table = useApparelProTable<StrnPrintReportLine>({
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
