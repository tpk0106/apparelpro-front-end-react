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
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

import GeneralPoLinesGrid from "./general-po-lines-grid";
import ConfirmDialog from "../common/confirm-dialog";
import type { GeneralPoLineItemRow } from "../../interfaces/general-inventory/general-po.types";
import {
  useCreateGeneralPOMutation,
  useGetGeneralPurchaseOrderQuery,
} from "../../tanstack-hooks/general-inventory/general-po.hooks";
import { useGetGeneralStoresQuery } from "../../tanstack-hooks/general-inventory/general-inventory-strn.hooks";
import { useGetSuppliersQuery, useGetBasis, useGetCurrenciesQuery } from "../../tanstack-hooks/custom-hooks";
import type { Supplier } from "../../interfaces/references/Supplier";
import type { AppError } from "../../auth/axiosClient";

// Replicates GI_PORD1.PRG's "PURCHASE ORDER ENTRY (General)" entry screen - a
// master-detail upsert. New/Existing choice mirrors legacy's "New Purchase Order...?
// Yes/No" prompt: Existing looks up a P/O by number and lets its lines be edited/added,
// same as legacy's edit flow.
export default function GeneralPoWorkspace() {
  const { mutateAsync: commitPO, isPending: isSubmitting } =
    useCreateGeneralPOMutation();

  const [isNewPO, setIsNewPO] = useState(true);
  const [poNumberInput, setPoNumberInput] = useState<string>("");
  const [loadedPoNumber, setLoadedPoNumber] = useState<string>("");

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [basisCode, setBasisCode] = useState<string>("");
  const [currencyCode, setCurrencyCode] = useState<string>("");
  const [proformaInvoiceNo, setProformaInvoiceNo] = useState<string>("");
  const [proformaInvoiceDate, setProformaInvoiceDate] = useState<string>("");

  const [lineItems, setLineItems] = useState<GeneralPoLineItemRow[]>([]);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [commitErrorMessage, setCommitErrorMessage] = useState<string | null>(null);

  const { data: storesList = [], isLoading: isStoresLoading } = useGetGeneralStoresQuery();

  const { data: supplierPageData, isLoading: isSuppliersLoading } = useGetSuppliersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const suppliersList = useMemo<Supplier[]>(() => supplierPageData?.items ?? [], [supplierPageData]);

  const { data: basisPageData, isLoading: isBasisLoading } = useGetBasis({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const basisList = useMemo(() => basisPageData?.items ?? [], [basisPageData]);

  const { data: currencyPageData, isLoading: isCurrenciesLoading } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });
  const currenciesList = useMemo(() => currencyPageData?.items ?? [], [currencyPageData]);

  const { data: loadedPO, isFetching: isLoadingPO, isError: isLoadPOError, error: loadPOError } =
    useGetGeneralPurchaseOrderQuery(loadedPoNumber, !!loadedPoNumber);

  const [syncedPO, setSyncedPO] = useState(loadedPO);
  if (loadedPO !== syncedPO) {
    setSyncedPO(loadedPO);
    if (loadedPO) {
      const buyer = suppliersList.find((s) => String(s.supplierCode) === loadedPO.header.supplierCode);
      setSelectedSupplier(buyer ?? null);
      setOrderDate(loadedPO.header.orderDate);
      setBasisCode(loadedPO.header.basisCode);
      setCurrencyCode(loadedPO.header.currencyCode);
      setProformaInvoiceNo(loadedPO.header.proformaInvoiceNo ?? "");
      setProformaInvoiceDate(loadedPO.header.proformaInvoiceDate ?? "");
      setLineItems(loadedPO.lines);
    }
  }

  const handleLoadExisting = () => {
    const trimmed = poNumberInput.trim();
    if (!trimmed) return;
    setLoadedPoNumber(trimmed);
  };

  const isHeaderValid =
    !!selectedSupplier &&
    basisCode.trim() !== "" &&
    currencyCode.trim() !== "" &&
    (isNewPO || loadedPoNumber !== "");

  const hasIncompleteLines = lineItems.some(
    (item) => !item.storeCode.trim() || !item.itemCode.trim(),
  );
  const hasAnyPositiveQuantity = lineItems.some((item) => item.orderedQuantity > 0);
  const isFormValid =
    isHeaderValid &&
    lineItems.length > 0 &&
    !hasIncompleteLines &&
    hasAnyPositiveQuantity &&
    lineItems.every((item) => item.orderedQuantity >= 0);

  const handleResetForm = () => {
    setIsNewPO(true);
    setPoNumberInput("");
    setLoadedPoNumber("");
    setSelectedSupplier(null);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setBasisCode("");
    setCurrencyCode("");
    setProformaInvoiceNo("");
    setProformaInvoiceDate("");
    setLineItems([]);
    setCommitErrorMessage(null);
  };

  const handleAddBlankRow = () => {
    setLineItems((prev) => [
      ...prev,
      {
        storeCode: "",
        itemCode: "",
        refNo: "",
        unit: "PCS",
        orderedQuantity: 0,
        price: 0,
        expectedDate: null,
      },
    ]);
  };

  const handleRequestCommit = () => {
    if (!isFormValid) {
      toast.warning(
        "Validation Error: Resolve the outstanding line issues (missing store/item or zero quantities) before confirming.",
      );
      return;
    }
    setCommitErrorMessage(null);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCommit = async () => {
    setIsConfirmDialogOpen(false);
    if (!selectedSupplier) return;

    const toastId = toast.loading("Posting Purchase Order...");

    const payload = {
      header: {
        poNumber: isNewPO ? "" : loadedPoNumber,
        isNewPurchaseOrder: isNewPO,
        supplierCode: String(selectedSupplier.supplierCode),
        orderDate,
        basisCode,
        currencyCode,
        proformaInvoiceNo: proformaInvoiceNo.trim() || null,
        proformaInvoiceDate: proformaInvoiceDate || null,
      },
      lines: lineItems
        .filter((item) => item.orderedQuantity > 0)
        .map((item) => ({
          storeCode: item.storeCode,
          itemCode: item.itemCode,
          refNo: item.refNo,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          price: item.price,
          expectedDate: item.expectedDate,
        })),
    };

    try {
      const response = await commitPO(payload);
      toast.update(toastId, {
        render: `Purchase Order ${response.poNumber} saved successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      if (response.warnings.length > 0) {
        response.warnings.forEach((w) => toast.warning(w, { autoClose: 8000 }));
      }
      handleResetForm();
    } catch (err) {
      const appError = err as AppError;
      const serverMsg = appError?.message || "Failed to post Purchase Order.";
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
          Purchase Order Entry (General Inventory)
        </Typography>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              label="P/O Type"
              size="small"
              fullWidth
              value={isNewPO ? "new" : "existing"}
              onChange={(e) => {
                const newFlag = e.target.value === "new";
                setIsNewPO(newFlag);
                setLoadedPoNumber("");
                setPoNumberInput("");
                if (newFlag) {
                  setSelectedSupplier(null);
                  setBasisCode("");
                  setCurrencyCode("");
                  setProformaInvoiceNo("");
                  setProformaInvoiceDate("");
                  setLineItems([]);
                }
              }}
            >
              <MenuItem value="new">New Purchase Order</MenuItem>
              <MenuItem value="existing">Existing Purchase Order</MenuItem>
            </TextField>
          </Grid>

          {!isNewPO && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="P/O No"
                  size="small"
                  fullWidth
                  value={poNumberInput}
                  onChange={(e) => setPoNumberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLoadExisting();
                  }}
                  placeholder="e.g. 000001"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={handleLoadExisting}
                  disabled={!poNumberInput.trim() || isLoadingPO}
                  fullWidth
                >
                  Load
                </Button>
              </Grid>
            </>
          )}
        </Grid>

        {!isNewPO && isLoadPOError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loadPOError?.message ?? `P/O No '${loadedPoNumber}' not found.`}
          </Alert>
        )}

        {(isNewPO || !!loadedPO) && (
          <>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  label="Supplier"
                  size="small"
                  fullWidth
                  value={selectedSupplier ? String(selectedSupplier.supplierCode) : ""}
                  onChange={(e) => {
                    const supplier = suppliersList.find((s) => String(s.supplierCode) === e.target.value) ?? null;
                    setSelectedSupplier(supplier);
                  }}
                  disabled={isSuppliersLoading}
                >
                  {suppliersList.map((s) => (
                    <MenuItem key={s.supplierCode} value={String(s.supplierCode)}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  type="date"
                  label="Date"
                  size="small"
                  fullWidth
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  select
                  label="Basis"
                  size="small"
                  fullWidth
                  value={basisCode}
                  onChange={(e) => setBasisCode(e.target.value)}
                  disabled={isBasisLoading}
                >
                  {basisList.map((b) => (
                    <MenuItem key={b.code} value={b.code}>
                      {b.description} [{b.code}]
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  select
                  label="Currency"
                  size="small"
                  fullWidth
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  disabled={isCurrenciesLoading}
                >
                  {currenciesList.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Proforma Invoice No"
                  size="small"
                  fullWidth
                  value={proformaInvoiceNo}
                  onChange={(e) => setProformaInvoiceNo(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  type="date"
                  label="Proforma Invoice Date"
                  size="small"
                  fullWidth
                  value={proformaInvoiceDate}
                  onChange={(e) => setProformaInvoiceDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {commitErrorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCommitErrorMessage(null)}>
                {commitErrorMessage}
              </Alert>
            )}

            {!isHeaderValid ? (
              <Alert severity="info" variant="outlined" sx={{ m: 2, fontWeight: "bold" }}>
                Select a Supplier, Basis and Currency to start the order list.
              </Alert>
            ) : (
              <Box>
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    Order Items
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AddCircleOutlined />}
                    onClick={handleAddBlankRow}
                    disabled={isStoresLoading}
                  >
                    Add Item
                  </Button>
                </Box>

                <GeneralPoLinesGrid
                  storesList={storesList}
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
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SendIcon />}
                onClick={handleRequestCommit}
                disabled={isSubmitting || !isFormValid}
              >
                Save Purchase Order
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <ConfirmDialog
        open={isConfirmDialogOpen}
        title="Confirm Purchase Order"
        message="Confirm all entries and save this Purchase Order?"
        confirmLabel="Confirm & Save"
        confirmColor="primary"
        isConfirming={isSubmitting}
        onConfirm={handleConfirmCommit}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </Box>
  );
}
