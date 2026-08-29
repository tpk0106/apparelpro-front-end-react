import { client } from "../../auth/axiosClient";

export interface NotePrintReportEndpointConfig {
  print: string;
  printPdf: string;
  // The backend controller's own [FromQuery] parameter name (e.g. "ginNumber",
  // "poNumber") - differs per note, so it's supplied here rather than assumed.
  paramName: string;
}

// Every note print report (General Inventory and Orderwise Inventory alike) fetches
// its printable details by document number and downloads a PDF the same way - only
// the endpoint URLs and query param name differ. Previously each note duplicated this
// exact pair of functions independently (see e.g. general-gin-print-report.service.ts
// before this extraction).
export function createNotePrintReportService<TDetails>(config: NotePrintReportEndpointConfig) {
  const getPrintDetails = async (documentNumber: string) => {
    return await client.get<TDetails>(config.print, {
      params: { [config.paramName]: documentNumber },
    });
  };

  const downloadPrintPdf = async (documentNumber: string) => {
    return await client.get<Blob>(config.printPdf, {
      params: { [config.paramName]: documentNumber },
      responseType: "blob",
    });
  };

  return { getPrintDetails, downloadPrintPdf };
}
