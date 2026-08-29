import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralSanPrintPdfMutation,
  useGetGeneralSanPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-san-print-report.hooks";
import type {
  GeneralSanPrintReportDetails,
  GeneralSanPrintReportLine,
} from "./general-san-print-report.types";

export default function GeneralSanPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralSanPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Qty. Adjusted",
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
    <NotePrintReportWorkspace<GeneralSanPrintReportDetails>
      title="Stock Adjustment Note (General Inventory) — Print"
      numberLabel="SAN No"
      useDetailsQuery={useGetGeneralSanPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralSanPrintPdfMutation}
      getNotFoundMessage={(n) => `SAN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="SAN No" value={details?.header.sanNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
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
