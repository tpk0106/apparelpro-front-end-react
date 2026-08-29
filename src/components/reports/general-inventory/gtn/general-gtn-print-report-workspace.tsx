import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralGtnPrintPdfMutation,
  useGetGeneralGtnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-gtn-print-report.hooks";
import type {
  GeneralGtnPrintReportDetails,
  GeneralGtnPrintReportLine,
} from "./general-gtn-print-report.types";

export default function GeneralGtnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralGtnPrintReportLine>[]>(
    () => [
      { accessorKey: "itemCode", header: "Item Code", size: 210 },
      { accessorKey: "description", header: "Description", size: 260 },
      { accessorKey: "unit", header: "Unit", size: 70, enableSorting: false },
      {
        accessorKey: "quantity",
        header: "Quantity",
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
    <NotePrintReportWorkspace<GeneralGtnPrintReportDetails>
      title="Goods Transfer Note (General Inventory) — Print"
      numberLabel="GTN No"
      useDetailsQuery={useGetGeneralGtnPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralGtnPrintPdfMutation}
      getNotFoundMessage={(n) => `GTN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="GTN No" value={details?.header.gtnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="From Stores" value={details?.header.fromStoreDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="To Stores" value={details?.header.toStoreDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
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
