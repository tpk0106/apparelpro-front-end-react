import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "react-toastify";

import OrderQuotaDetailReportHeader from "./order-quota-detail-report-header";
import OrderQuotaDetailReportDisplay from "./order-quota-detail-report-display";
import {
  useGetOrderQuotaDetailReportDetailsQuery,
  useDownloadOrderQuotaDetailReportPdfMutation,
} from "../../../../tanstack-hooks/order-quota-detail-report.hooks";
import type { AppError } from "../../../../auth/axiosClient";
import type { OrderQuotaDetailReportScopeContext } from "./order-quota-detail-report.types";

const EMPTY_SCOPE: OrderQuotaDetailReportScopeContext = {
  buyerCode: null,
  order: null,
};

export default function OrderQuotaDetailReportWorkspace() {
  const [scope, setScope] = useState<OrderQuotaDetailReportScopeContext>(EMPTY_SCOPE);

  const queryParams = {
    buyerCode: scope.buyerCode ?? undefined,
    order: scope.order ?? undefined,
  };

  const {
    data: report,
    isFetching: isLoading,
    isError,
    error,
  } = useGetOrderQuotaDetailReportDetailsQuery(queryParams, true);

  const { mutateAsync: downloadPdf, isPending: isDownloading } =
    useDownloadOrderQuotaDetailReportPdfMutation();

  const handleDownloadPdf = async () => {
    try {
      await downloadPdf(queryParams);
    } catch (err) {
      const appError = err as AppError;
      toast.error(appError?.message ?? "Failed to generate the PDF.");
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1a237e" }}>
          Order/Quota Detail Report
        </Typography>
        <Button
          variant="contained"
          startIcon={
            isDownloading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
          onClick={handleDownloadPdf}
          disabled={!report || isLoading || isDownloading}
        >
          {isDownloading ? "Generating..." : "Print (PDF)"}
        </Button>
      </Box>

      <OrderQuotaDetailReportHeader onScopeChange={setScope} />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="info" variant="outlined">
          {error?.message ?? "No Order Quota For Printing."}
        </Alert>
      ) : report ? (
        <OrderQuotaDetailReportDisplay report={report} />
      ) : null}
    </Box>
  );
}
