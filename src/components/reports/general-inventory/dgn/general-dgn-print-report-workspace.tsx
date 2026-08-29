import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralDgnPrintPdfMutation,
  useGetGeneralDgnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-dgn-print-report.hooks";
import type {
  GeneralDgnPrintReportDetails,
  GeneralDgnPrintReportLine,
} from "./general-dgn-print-report.types";

export default function GeneralDgnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralDgnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Damaged",
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
    ],
    [],
  );

  return (
    <NotePrintReportWorkspace<GeneralDgnPrintReportDetails>
      title="Damaged Goods Note (General Inventory) — Print"
      numberLabel="DGN No"
      useDetailsQuery={useGetGeneralDgnPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralDgnPrintPdfMutation}
      getNotFoundMessage={(n) => `DGN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="DGN No" value={details?.header.dgnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="Stores" value={details?.header.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile
            label="Date"
            value={details?.header?.transactionDate && format(parseISO(details.header.transactionDate), "dd-MMM-yyyy")}
            loading={isLoading}
            size={{ xs: 12, sm: 6, md: 3, lg: 12 }}
          />
        </>
      )}
      renderGrid={(details, isLoading, isError) => (
        <NotePrintReportGrid columns={columns} data={details?.lines ?? []} isLoading={isLoading} isError={isError} />
      )}
    />
  );
}
