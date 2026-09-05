import { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";

import type { GtnPrintReportLine } from "./gtn-print-report.types";
import { useApparelProTable } from "../../../../themes/useApparelProTable";

interface Props {
  data: GtnPrintReportLine[];
  isLoading: boolean;
  isError: boolean;
}

export default function GtnPrintReportGrid({
  data,
  isLoading,
  isError,
}: Props) {
  const columns = useMemo<MRT_ColumnDef<GtnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Transferred",
        size: 150,
        Cell: ({ cell }) => (
          <span>
            {cell.getValue<number>().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      { accessorKey: "storeCode", header: "Basis", size: 100 },
    ],
    [],
  );

  // Deliberately client-side, NOT server-paginated: this grid always renders the
  // complete, fixed set of lines belonging to one already-committed GTN document —
  // exactly what the PDF export prints. Paginating it here would let the on-screen
  // preview show a different subset of rows than the generated PDF, which defeats
  // the purpose of a print preview.
  const table = useApparelProTable<GtnPrintReportLine>({
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
