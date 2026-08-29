import { useMemo } from "react";
import type { MRT_ColumnDef } from "material-react-table";
import { format, parseISO } from "date-fns";

import NotePrintReportWorkspace from "../../common/note-print-report-workspace";
import NotePrintReportGrid from "../../common/note-print-report-grid";
import KpiTile from "../../../common/kpi-tile";
import {
  useDownloadGeneralStrnPrintPdfMutation,
  useGetGeneralStrnPrintDetailsQuery,
} from "../../../../tanstack-hooks/general-inventory/general-strn-print-report.hooks";
import type {
  GeneralStrnPrintReportDetails,
  GeneralStrnPrintReportLine,
} from "./general-strn-print-report.types";

export default function GeneralStrnPrintReportWorkspace() {
  const columns = useMemo<MRT_ColumnDef<GeneralStrnPrintReportLine>[]>(
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
    <NotePrintReportWorkspace<GeneralStrnPrintReportDetails>
      title="Stores Requisition Note (General Inventory) — Print"
      numberLabel="SRN No"
      useDetailsQuery={useGetGeneralStrnPrintDetailsQuery}
      useDownloadMutation={useDownloadGeneralStrnPrintPdfMutation}
      getNotFoundMessage={(n) => `SRN No '${n}' not found.`}
      renderKpiTiles={(details, isLoading) => (
        <>
          <KpiTile label="SRN No" value={details?.header.srnNumber} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="From Stores" value={details?.header.storeDescription} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
          <KpiTile label="To Department" value={details?.header.departmentCode} loading={isLoading} size={{ xs: 12, sm: 6, md: 3, lg: 12 }} />
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
