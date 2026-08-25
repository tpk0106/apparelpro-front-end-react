import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  MenuItem,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AddCircleOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

import OrderGoodsTransferNoteLinesGrid from "./order-goods-transfer-note-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import {
  OrderGtnDirection,
  type OrderGtnDirectionType,
  type OrderGtnLineItemRow,
} from "../../interfaces/general-inventory/general-ogtn.types";
import {
  useCreateOrderGTNMutation,
  useGetOrderGtnTransferableStockQuery,
} from "../../tanstack-hooks/general-inventory/general-ogtn.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import {
  useGetBuyersQuery,
  useGetAllPurchaseOrdersByBuyerCode,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { AppError } from "../../auth/axiosClient";

const DIRECTION_OPTIONS: { value: OrderGtnDirectionType; label: string }[] = [
  { value: OrderGtnDirection.GeneralToOrder, label: "General Stores -> Buyer/Order" },
  { value: OrderGtnDirection.OrderToGeneral, label: "Buyer/Order -> General Stores" },
];

// Replicates GI_OGTN1.PRG's "GOODS TRANSFER NOTE (Orders)" entry screen - the bridge
// between General Inventory and a specific Buyer/Order's Orderwise stock. Direction
// picks which side loses stock; Store is always a General store, since that's the only
// store concept General Inventory has (Orderwise's own stock has no separate store
// master - see useGetGeneralStoresQuery usage below, shared with STRN/GTN(General)).
export default function OrderGoodsTransferNoteWorkspace() {
  const { mutateAsync: commitOGTN, isPending: isSubmitting } =
    useCreateOrderGTNMutation();

  const [direction, setDirection] = useState<OrderGtnDirectionType>(
    OrderGtnDirection.GeneralToOrder,
  );
  const [storeCode, setStoreCode] = useState<string>("");
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [lineItems, setLineItems] = useState<OrderGtnLineItemRow[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(
    null,
  );

  const { data: storesList = [], isLoading: isStoresLoading } =
    useGetGeneralStoresQuery();

  const { data: buyerPageData, isLoading: isBuyersLoading } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items ?? [],
    [buyerPageData],
  );

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetAllPurchaseOrdersByBuyerCode(
      selectedBuyer?.buyerCode ?? 0,
      !!selectedBuyer,
    );

  const isHeaderValid =
    storeCode.trim() !== "" && !!selectedBuyer && selectedOrder.trim() !== "";

  const {
    data: transferableStock = [],
    isFetching: isStockLoading,
  } = useGetOrderGtnTransferableStockQuery(
    {
      direction,
      storeCode,
      buyerCode: selectedBuyer?.buyerCode ?? 0,
      order: selectedOrder,
    },
    isHeaderValid,
  );

  const hasIncompleteLines = lineItems.some((item) => !item.itemCode.trim());
  const hasAnyPositiveQuantity = lineItems.some((item) => item.quantity > 0);
  const hasAnyExceededBalance = lineItems.some((item) => {
    const stock = transferableStock.find((s) => s.itemCode === item.itemCode);
    return stock ? Number(item.quantity) > stock.availableBalance : false;
  });
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.quantity >= 0) &&
    !hasAnyExceededBalance;

  const handleResetForm = () => {
    setStoreCode("");
    setSelectedBuyer(null);
    setSelectedOrder("");
    setLineItems([]);
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setCommitErrorMessage(null);
  };

  const handleDirectionChange = (value: OrderGtnDirectionType) => {
    setDirection(value);
    setLineItems([]);
    setCommitErrorMessage(null);
  };

  const handleBuyerChange = (buyerCode: string) => {
    const buyer = buyersList.find((b) => String(b.buyerCode) === buyerCode) ?? null;
    setSelectedBuyer(buyer);
    setSelectedOrder("");
    setLineItems([]);
    setCommitErrorMessage(null);
  };

  const handleOrderChange = (order: string) => {
    setSelectedOrder(order);
    setLineItems([]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      { storeCode, itemCode: "", unit: "PCS", quantity: 0 },
    ]);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        "Validation Error: Resolve the outstanding line issues (missing items, zero quantities, or over-allocation) before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    if (!selectedBuyer) return;

    const toastId = toast.loading(
      "Posting Goods Transfer Note (Orders), updating stock balances...",
    );

    const payload = {
      header: {
        ogtnNumber: "",
        direction,
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        transactionDate,
      },
      lines: lineItems
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          storeCode: item.storeCode,
          itemCode: item.itemCode,
          unit: item.unit,
          quantity: item.quantity,
        })),
    };

    try {
      const response = await commitOGTN(payload);
      toast.update(toastId, {
        render: response.message || "Goods Transfer Note (Orders) posted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg =
        appError?.message || "Failed to post Goods Transfer Note (Orders).";
      setCommitErrorMessage(serverMsg);
      toast.update(toastId, {
        render: serverMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    }
  };

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper elevation={3} sx={{ p: 3, borderTop: "4px solid #60a5fa", backgroundColor: "#fafafa" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}>
          Goods Transfer Note (Orders) — General Inventory
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="Direction"
              size="small"
              fullWidth
              value={direction}
              onChange={(e) => handleDirectionChange(e.target.value as OrderGtnDirectionType)}
            >
              {DIRECTION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              label="Stores"
              size="small"
              fullWidth
              value={storeCode}
              onChange={(e) => {
                setStoreCode(e.target.value);
                setLineItems([]);
              }}
              disabled={isStoresLoading}
            >
              {storesList.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.description} [{s.code}]
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              select
              label="Buyer"
              size="small"
              fullWidth
              value={selectedBuyer ? String(selectedBuyer.buyerCode) : ""}
              onChange={(e) => handleBuyerChange(e.target.value)}
              disabled={isBuyersLoading}
            >
              {buyersList.map((b) => (
                <MenuItem key={b.buyerCode} value={String(b.buyerCode)}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              label="Order"
              size="small"
              fullWidth
              value={selectedOrder}
              onChange={(e) => handleOrderChange(e.target.value)}
              disabled={!selectedBuyer || isOrdersLoading}
            >
              {ordersList.map((orderStr) => (
                <MenuItem key={orderStr} value={orderStr}>
                  {orderStr}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              type="date"
              label="Transaction Date"
              size="small"
              fullWidth
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {commitErrorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setCommitErrorMessage(null)}
          >
            {commitErrorMessage}
          </Alert>
        )}

        {!isHeaderValid ? (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ m: 2, fontWeight: "bold" }}
          >
            Select a Direction, Store, Buyer and Order to start the transfer
            list.
          </Alert>
        ) : (
          <Box>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
              >
                Transfer Items
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddCircleOutlined />}
                onClick={handleAddBlankRow}
              >
                Add Item
              </Button>
            </Box>

            <OrderGoodsTransferNoteLinesGrid
              storeCode={storeCode}
              transferableStock={transferableStock}
              isStockLoading={isStockLoading}
              lineItems={lineItems}
              setLineItems={setLineItems}
            />
          </Box>
        )}

        <Box
          sx={{
            gap: 2,
            mt: 3,
            pt: 2,
            borderTop: "1px dashed #ccc",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleResetForm}
            disabled={isSubmitting}
          >
            Cancel Note
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SendIcon />}
            onClick={handleRequestCommit}
            disabled={isSubmitting || !isFormValid}
          >
            Post Transfer Note
          </Button>
        </Box>
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Goods Transfer Note (Orders)"
        message="Confirm all entries and post this Goods Transfer Note? This moves stock between the selected General store and the selected Buyer/Order immediately."
        confirmLabel="Confirm & Post"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
