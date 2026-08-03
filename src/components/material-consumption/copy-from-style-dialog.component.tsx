import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import type { Style } from "../../interfaces/OrderManagement/Style";
import type { Buyer } from "../../interfaces/references/Buyer";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetAllGarmentTypes,
  useGetStylesByScope,
} from "../../tanstack-hooks/custom-hooks";
import { useCopyMaterialsFromStyleMutation } from "../../tanstack-hooks/material-consumption-entry.hooks";
import type { AppError } from "../../auth/axiosClient";
import type {
  GarmentTypeServiceModel,
  StyleContext,
} from "./material-consumption.types";

interface CopyFromStyleDialogProps {
  open: boolean;
  onClose: () => void;
  // The style currently open in the workspace - materials are copied INTO
  // this style (the "target" in CopyMaterialsFromStyleAsync).
  targetStyleContext: StyleContext;
  // Called after a successful copy so the parent can refetch the ledger grid.
  onCopyComplete: () => void;
}

// Merchandiser-facing dialog for the "Copy all materials from another Style"
// feature: reuses the exact same cascading Buyer -> Purchase Order -> Garment
// Type -> Style Autocomplete pattern already established in
// ConsumptionScopeHeader, scoped to picking a SOURCE style rather than the
// active one. See MaterialConsumptionService.CopyMaterialsFromStyleAsync for
// the backend rules this drives: real Quantity/Price/Currency values are
// copied as-is (not zeroed), Colour/Size are copied as-is with no validation,
// and any item that already exists in the target style is skipped rather
// than overwritten.
export default function CopyFromStyleDialog({
  open,
  onClose,
  targetStyleContext,
  onCopyComplete,
}: CopyFromStyleDialogProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery(
    {
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    },
  );

  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const { data: globalTypesList = [], isLoading: isTypesLoading } =
    useGetAllGarmentTypes();

  const { data: stylesList = [], isLoading: isStylesLoading } =
    useGetStylesByScope(
      {
        buyerCode: selectedBuyer?.buyerCode ?? 0,
        order: selectedOrder ?? "",
        typeCode: selectedType?.id ?? 0,
      },
      !!selectedBuyer && !!selectedOrder && !!selectedType,
    );

  const { mutateAsync: copyMaterials, isPending: isCopying } =
    useCopyMaterialsFromStyleMutation();

  const resetSelections = () => {
    setSelectedBuyer(null);
    setSelectedOrder(null);
    setSelectedType(null);
    setSelectedStyle(null);
  };

  const handleClose = () => {
    if (isCopying) return; // don't allow closing mid-request
    resetSelections();
    onClose();
  };

  const isSourceFullySelected =
    !!selectedBuyer && !!selectedOrder && !!selectedType && !!selectedStyle;

  // A style can't sensibly copy its own materials into itself - every item
  // would just be skipped as "already exists". Block it here rather than
  // relying on the backend to silently skip everything.
  const isSameAsTarget =
    isSourceFullySelected &&
    selectedBuyer!.buyerCode === targetStyleContext.buyerCode &&
    selectedOrder === targetStyleContext.order &&
    selectedType!.id === targetStyleContext.typeCode &&
    selectedStyle!.styleCode === targetStyleContext.styleCode;

  const handleConfirmCopy = async () => {
    if (!isSourceFullySelected || isSameAsTarget) return;

    const toastId = toast.loading(
      `Copying materials from Style ${selectedStyle!.styleCode}...`,
    );

    try {
      const result = await copyMaterials({
        sourceBuyerCode: selectedBuyer!.buyerCode,
        sourceOrder: selectedOrder!,
        sourceTypeCode: selectedType!.id,
        sourceStyleCode: selectedStyle!.styleCode,
        targetBuyerCode: targetStyleContext.buyerCode,
        targetOrder: targetStyleContext.order,
        targetTypeCode: targetStyleContext.typeCode,
        targetStyleCode: targetStyleContext.styleCode,
      });

      const summary =
        result.skippedCount > 0
          ? `✓ Copied ${result.copiedCount} item(s). Skipped ${result.skippedCount} already present in this style.`
          : `✓ Copied ${result.copiedCount} item(s) into this style.`;

      toast.update(toastId, {
        render: summary,
        type: "success",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });

      onCopyComplete();
      resetSelections();
      onClose();
    } catch (err) {
      const appError = err as AppError;
      toast.update(toastId, {
        render: `🛑 Failed to copy materials: ${appError?.message || "Unknown error"}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { backgroundColor: "#141922" } },
      }}
    >
      <DialogTitle sx={{ color: "#F4F6F8" }}>
        Copy Materials from Another Style
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#8B93A1", mb: 2 }}>
          Select the Buyer, Purchase Order, Garment Type and Style to copy
          every material line from. Quantity/Garment, Price and Currency are
          copied exactly as they are on the source style; Colour/Size are
          copied as-is. Any item that already exists in this style is
          skipped, so nothing already entered here gets overwritten.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={12}>
            <Autocomplete
              options={buyersList}
              loading={isBuyersLoading}
              getOptionLabel={(option: Buyer) => option.name || ""}
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
                <TextField {...params} label="Source Buyer" size="small" />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              options={ordersList}
              loading={isOrdersLoading}
              getOptionLabel={(option: string) => option || ""}
              disabled={!selectedBuyer}
              value={selectedOrder}
              onChange={(_, val) => {
                setSelectedOrder(val);
                setSelectedType(null);
                setSelectedStyle(null);
              }}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Source Purchase Order"
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              options={globalTypesList}
              loading={isTypesLoading}
              getOptionLabel={(option: GarmentTypeServiceModel) =>
                option.typeName || ""
              }
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
                  label="Source Garment Type"
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Autocomplete
              options={stylesList}
              loading={isStylesLoading}
              disabled={!selectedType}
              getOptionLabel={(option: Style) =>
                option.styleCode
                  ? `${option.styleCode} (${Number(option.quantity) || 0})`
                  : ""
              }
              value={selectedStyle}
              onChange={(_, val) => setSelectedStyle(val)}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <TextField {...params} label="Source Style" size="small" />
              )}
            />
          </Grid>
        </Grid>

        {isSameAsTarget && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            The selected source style is the same style you have open. Please
            pick a different Buyer/Order/Type/Style to copy from.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          color="primary"
          disabled={isCopying}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirmCopy}
          variant="contained"
          color="primary"
          disabled={!isSourceFullySelected || isSameAsTarget || isCopying}
          startIcon={
            isCopying ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{ minWidth: 100 }}
        >
          {isCopying ? "Copying..." : "Copy Materials"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
