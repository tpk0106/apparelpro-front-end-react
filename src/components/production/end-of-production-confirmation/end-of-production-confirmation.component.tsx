import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import type { Buyer } from "../../../interfaces/references/Buyer";
import type { GarmentType } from "../../../interfaces/references/GarmentType";
import type { Style } from "../../../interfaces/order-management/Style";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../../tanstack-hooks/custom-hooks";
import {
  useGetEndOfProductionStatus,
  useConfirmEndOfProductionMutation,
} from "../../../tanstack-hooks/end-of-production-confirmation.hooks";
import { asideMenuTitleTypographyTheme } from "../../../themes/themes";
import ConfirmDialog from "../../common/confirm-dialog";

const today = () => new Date().toISOString().slice(0, 10);

const selectFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
};

const dateFieldSx = {
  "& .MuiOutlinedInput-input": { color: "#F4F6F8" },
  "& input::-webkit-calendar-picker-indicator": { filter: "invert(1)" },
};

const EndOfProductionConfirmation = () => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<GarmentType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [endDate, setEndDate] = useState(today());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [] } = useGetAllPurchaseOrdersByBuyerCode(
    selectedBuyer?.buyerCode ?? 0,
    !!selectedBuyer,
  );
  const { data: globalTypesList = [] } = useGetAllGarmentTypes();
  const { data: stylesList = [] } = useGetStylesByScope(
    {
      buyerCode: selectedBuyer?.buyerCode ?? 0,
      order: selectedOrder ?? "",
      typeCode: selectedType?.id ?? 0,
    },
    !!selectedBuyer && !!selectedOrder && !!selectedType,
  );

  const scope =
    selectedBuyer && selectedOrder && selectedType && selectedStyle
      ? {
          buyerCode: selectedBuyer.buyerCode,
          order: selectedOrder,
          typeCode: selectedType.id,
          styleCode: selectedStyle.styleCode,
        }
      : null;

  const {
    data: status,
    isLoading,
    isError,
    error,
  } = useGetEndOfProductionStatus(scope);
  const { mutateAsync: confirmEndOfProduction, isPending: isConfirming } =
    useConfirmEndOfProductionMutation();

  useEffect(() => {
    if (status) {
      setEndDate(status.currentProductionEndDate ?? today());
    }
  }, [status]);

  const handleConfirm = async () => {
    if (!scope) return;
    await confirmEndOfProduction({ ...scope, endDate });
    setConfirmOpen(false);
  };

  return (
    <div className="flex flex-col w-[80%] mx-auto justify-around mt-10 mb-12">
      <div className="text-center mt-3 mx-2">
        <ThemeProvider theme={asideMenuTitleTypographyTheme}>
          <Typography color="black">End of Production Confirmation</Typography>
        </ThemeProvider>
      </div>

      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={buyersList}
              getOptionLabel={(option) => option.name || ""}
              value={selectedBuyer}
              onChange={(_, val) => {
                setSelectedBuyer(val);
                setSelectedOrder(null);
                setSelectedType(null);
                setSelectedStyle(null);
              }}
              isOptionEqualToValue={(option, value) =>
                option.buyerCode === value?.buyerCode
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buyer"
                  size="small"
                  sx={selectFieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={ordersList}
              disabled={!selectedBuyer}
              value={selectedOrder}
              onChange={(_, val) => {
                setSelectedOrder(val);
                setSelectedType(null);
                setSelectedStyle(null);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Order"
                  size="small"
                  sx={selectFieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={globalTypesList}
              getOptionLabel={(option) => option.typeName.toUpperCase() || ""}
              disabled={!selectedOrder}
              value={selectedType}
              onChange={(_, val) => {
                setSelectedType(val);
                setSelectedStyle(null);
              }}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Garment Type"
                  size="small"
                  sx={selectFieldSx}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Autocomplete
              options={stylesList}
              disabled={!selectedType}
              getOptionLabel={(option) => option.styleCode || ""}
              value={selectedStyle}
              onChange={(_, val) => setSelectedStyle(val)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Style"
                  size="small"
                  sx={selectFieldSx}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Alert severity="info">{error.message}</Alert>}

      {status && (
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography sx={{ mb: 1, color: "#F4F6F8" }}>
            Current End of Production Date:{" "}
            {status.currentProductionEndDate ?? "Not set"}
          </Typography>

          {!status.hasProductionEntries && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No Daily Production Entries available for this style.
            </Alert>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              label="End Date of Production"
              type="date"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={dateFieldSx}
            />
            <Button
              variant="contained"
              disabled={!status.hasProductionEntries || !endDate}
              onClick={() => setConfirmOpen(true)}
            >
              Confirm End of Production
            </Button>
          </Box>
        </Card>
      )}

      {!isLoading && !isError && !status && (
        <Typography color="text.secondary">
          Select a Buyer, Order, Type and Style to confirm end of production.
        </Typography>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm End of Production...?"
        message={`This will set the End of Production date for ${scope?.styleCode} to ${endDate}.`}
        confirmLabel="Yes"
        cancelLabel="No"
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default EndOfProductionConfirmation;
