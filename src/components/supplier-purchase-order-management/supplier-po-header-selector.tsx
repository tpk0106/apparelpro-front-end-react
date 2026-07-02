import { useState, useMemo, type SyntheticEvent } from "react";
import {
  Box,
  Card,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  //   CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import {
  useGetBuyersPagedQuery,
  useGetOrdersByBuyerQuery,
  useGetAllCurrenciesQuery,
  useGetSuppliersLookupQuery,
  type CurrencyServiceModel,
  useGetAllGarmentTypesQuery,
  useGetStylesByScopeQuery,
} from "../../services/material-consumption.services";

import type {
  SelectedPOContext,
  SupplierLookupOption,
  //   CurrencyOption,
  StoreCodeOption,
} from "../../interfaces/OrderManagement/purchase-order-types";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { Style } from "../../interfaces/OrderManagement/Style";
import type { GarmentTypeServiceModel } from "../material-consumption/material-consumption.types";

interface HeaderSelectorProps {
  onHeaderContextLock: (context: SelectedPOContext | null) => void;
}

export default function SupplierPOHeaderSelector({
  onHeaderContextLock,
}: HeaderSelectorProps) {
  // 1. ALL CORE STATE VARIABLES FULLY DECLARED HERE
  const [poMode, setPoMode] = useState<"NEW" | "EDIT">("NEW");
  const [purchaseNumber, setPurchaseNumber] = useState<string>(() =>
    String(Math.floor(Math.random() * 90000) + 10000).padStart(6, "0"),
  );
  const [proformaNo, setProformaNo] = useState<string>("");
  const [proformaDate, setProformaDate] = useState<string>("");

  // Dropdown Selection States
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierLookupOption | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreCodeOption | null>(
    null,
  );
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyServiceModel | null>(null);

  // 2. Fetch Master Datasets from your active RTK-Query Service Caches
  const { data: buyerPageData, isLoading: isBuyersLoading } =
    useGetBuyersPagedQuery({
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

  const { data: ordersList = [], isLoading: isOrdersLoading } =
    useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
      skip: !selectedBuyer,
    });

  const { data: globalTypesList = [], isLoading: isTypesLoading } =
    useGetAllGarmentTypesQuery();

  const { data: stylesList = [], isLoading: isStylesLoading } =
    useGetStylesByScopeQuery(
      {
        buyerCode: selectedBuyer?.buyerCode ?? 0,
        order: selectedOrder ?? "",
        typeCode: selectedType?.id ?? 0,
      },
      { skip: !selectedBuyer || !selectedOrder || !selectedType },
    );

  const { data: suppliersList = [], isLoading: isSuppliersLoading } =
    useGetSuppliersLookupQuery();

  const { data: currencyPageData, isLoading: isCurrenciesLoading } =
    useGetAllCurrenciesQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });
  const currenciesList = useMemo<CurrencyServiceModel[]>(
    () => currencyPageData?.items || [],
    [currencyPageData],
  );

  // Static Store/Warehouse Codes initialized in-memory to prevent loop crashes
  const [storesList] = useState<StoreCodeOption[]>([
    { code: "ST1", description: "Main Fabric Store" },
    { code: "ST2", description: "Accessories & Trims Store" },
    { code: "ST3", description: "Finished Goods bonded Warehouse" },
  ]);

  // --- TRANSACTIONAL MANUAL ACTION HANDLERS ---

  const handleModeChange = (newMode: "NEW" | "EDIT") => {
    setPoMode(newMode);
    if (newMode === "NEW") {
      const generatedPo = String(
        Math.floor(Math.random() * 90000) + 10000,
      ).padStart(6, "0");
      setPurchaseNumber(generatedPo);
    } else {
      setPurchaseNumber("");
    }
    setSelectedBuyer(null);
    setSelectedOrder(null);
    setSelectedType(null);
    setSelectedStyle(null);
    setSelectedSupplier(null);
    setSelectedStore(null);
    setSelectedCurrency(null);
    setProformaNo("");
    setProformaDate("");
    onHeaderContextLock(null);
  };

  const verifyAndBroadcastContext = (
    updatedPoNumber = purchaseNumber,
    updatedSupplier = selectedSupplier,
    updatedStore = selectedStore,
    updatedCurrency = selectedCurrency,
    updatedBuyer = selectedBuyer,
    updatedOrder = selectedOrder,
    updatedType = selectedType,
    updatedStyle = selectedStyle,
    updatedProformaNo = proformaNo,
    updatedProformaDate = proformaDate,
  ) => {
    if (
      updatedPoNumber &&
      updatedSupplier &&
      updatedStore &&
      updatedCurrency &&
      updatedBuyer &&
      updatedOrder &&
      updatedType &&
      updatedStyle
    ) {
      onHeaderContextLock({
        purchaseNumber: updatedPoNumber.trim(),
        supplierCode: String(updatedSupplier.supplierCode),
        storeCode: updatedStore.code,
        proformaInvoiceNo: updatedProformaNo.trim(),
        proformaInvoiceDate: updatedProformaDate,
        currencyCode: updatedCurrency.code,
        buyerCode: updatedBuyer.buyerCode,
        orderNumber: updatedOrder,
        typeCode: updatedType.id,
        styleCode: updatedStyle.styleCode,
      });
    } else {
      onHeaderContextLock(null);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 3,
        backgroundColor: "#fafafa",
        borderLeft: "5px solid #1a237e",
      }}
    >
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
          sx={{ fontWeight: "bold", color: "#1a237e" }}
        >
          [ PROCUREMENT MANAGEMENT - SUPPLIER PURCHASE ORDER HEADER ]
        </Typography>

        <RadioGroup
          row
          value={poMode}
          onChange={(e) => handleModeChange(e.target.value as "NEW" | "EDIT")}
        >
          <FormControlLabel
            value="NEW"
            control={<Radio size="small" color="primary" />}
            label="New P/O Entry"
          />
          <FormControlLabel
            value="EDIT"
            control={<Radio size="small" color="secondary" />}
            label="Edit Existing P/O"
          />
        </RadioGroup>
      </Box>

      <Grid container spacing={2}>
        {/* Input 1: P/O Number */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            label="P/O Number"
            size="small"
            fullWidth
            disabled={poMode === "NEW"}
            value={purchaseNumber}
            onChange={(e) => {
              const cleanedVal = e.target.value.toUpperCase();
              setPurchaseNumber(cleanedVal);
              verifyAndBroadcastContext(cleanedVal);
            }}
            slotProps={{
              htmlInput: {
                maxLength: 10,
                style: { fontFamily: "monospace", fontWeight: "bold" },
              },
            }}
          />
        </Grid>

        {/* Input 2: Supplier Selection */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Autocomplete
            options={suppliersList}
            getOptionLabel={(option: SupplierLookupOption) =>
              option.name ? `${option.supplierCode} (${option.name})` : ""
            }
            value={selectedSupplier}
            onChange={(_: SyntheticEvent, val: SupplierLookupOption | null) => {
              setSelectedSupplier(val);
              verifyAndBroadcastContext(purchaseNumber, val);
            }}
            loading={isSuppliersLoading}
            isOptionEqualToValue={(option, value) =>
              option.supplierCode === value?.supplierCode
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Vendor / Supplier"
                size="small"
              />
            )}
          />
        </Grid>

        {/* Input 3: Store/Warehouse Allocation */}
        <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
          <Autocomplete
            options={storesList}
            getOptionLabel={(option: StoreCodeOption) =>
              `${option.code} - ${option.description}`
            }
            value={selectedStore}
            onChange={(_: SyntheticEvent, val: StoreCodeOption | null) => {
              setSelectedStore(val);
              verifyAndBroadcastContext(purchaseNumber, selectedSupplier, val);
            }}
            isOptionEqualToValue={(option, value) =>
              option.code === value?.code
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Allocation Store Code"
                size="small"
              />
            )}
          />
        </Grid>

        {/* Input 4: Purchase Currency */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={currenciesList}
            getOptionLabel={(option: CurrencyServiceModel) =>
              option.code ? `${option.code} (${option.name})` : ""
            }
            value={selectedCurrency}
            onChange={(_: SyntheticEvent, val: CurrencyServiceModel | null) => {
              setSelectedCurrency(val);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                val,
              );
            }}
            loading={isCurrenciesLoading}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Purchase Currency" size="small" />
            )}
          />
        </Grid>

        {/* Input 5: Proforma Invoice No. */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Proforma Invoice No."
            size="small"
            fullWidth
            value={proformaNo}
            onChange={(e) => {
              const cleanedVal = e.target.value.toUpperCase();
              setProformaNo(cleanedVal);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                selectedBuyer,
                selectedOrder,
                selectedType,
                selectedStyle,
                cleanedVal,
              );
            }}
          />
        </Grid>

        {/* Input 6: Proforma Invoice Date */}
        {/* Input 6: Proforma Invoice Date */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Proforma Invoice Date"
            type="date"
            size="small"
            fullWidth
            value={proformaDate}
            onChange={(e) => {
              const cleanedDate = e.target.value;
              setProformaDate(cleanedDate);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                selectedBuyer,
                selectedOrder,
                selectedType,
                selectedStyle,
                proformaNo,
                cleanedDate,
              );
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        {/* Input 7: Buyer Selector */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={buyersList}
            getOptionLabel={(option: Buyer) => option.name || ""}
            value={selectedBuyer}
            onChange={(_: SyntheticEvent, val: Buyer | null) => {
              setSelectedBuyer(val);
              setSelectedOrder(null);
              setSelectedType(null);
              setSelectedStyle(null);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                val,
                null,
                null,
                null,
              );
            }}
            loading={isBuyersLoading}
            isOptionEqualToValue={(option, value) =>
              option.buyerCode === value?.buyerCode
            }
            renderInput={(params) => (
              <TextField {...params} label="Filter Target Buyer" size="small" />
            )}
          />
        </Grid>

        {/* Input 8: Purchase Order Contract Scope Selection */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={ordersList}
            getOptionLabel={(option: string) => option || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_: SyntheticEvent, val: string | null) => {
              setSelectedOrder(val);
              setSelectedType(null);
              setSelectedStyle(null);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                selectedBuyer,
                val,
                null,
                null,
              );
            }}
            loading={isOrdersLoading}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter Target Buyer Order"
                size="small"
              />
            )}
          />
        </Grid>

        {/* Input 9: Garment Type Dropdown */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={globalTypesList}
            getOptionLabel={(option: GarmentTypeServiceModel) =>
              option.typeName || ""
            }
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(
              _: SyntheticEvent,
              val: GarmentTypeServiceModel | null,
            ) => {
              setSelectedType(val);
              setSelectedStyle(null);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                selectedBuyer,
                selectedOrder,
                val,
                null,
              );
            }}
            loading={isTypesLoading}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Garment Type" size="small" />
            )}
          />
        </Grid>

        {/* Input 10: Style Code Selection */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(option: Style) =>
              option.styleCode
                ? `${option.styleCode} (${Number(option.quantity) || 0})`
                : ""
            }
            value={selectedStyle}
            onChange={(_: SyntheticEvent, val: Style | null) => {
              setSelectedStyle(val);
              verifyAndBroadcastContext(
                purchaseNumber,
                selectedSupplier,
                selectedStore,
                selectedCurrency,
                selectedBuyer,
                selectedOrder,
                selectedType,
                val,
              );
            }}
            loading={isStylesLoading}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Active Style" size="small" />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

// import React, { useState, useMemo, SyntheticEvent } from "react";
// import {
//   Box,
//   Card,
//   TextField,
//   Typography,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   CircularProgress,
// } from "@mui/material";
// import Autocomplete from "@mui/material/Autocomplete";
// import Grid from "@mui/material/Grid";

// // Import your existing live master lookup hooks directly from your verified service slices
// import {
//   useGetBuyersPagedQuery,
//   useGetOrdersByBuyerQuery,
//   useGetAllCurrenciesQuery,
//   useGetSuppliersLookupQuery,
//   type CurrencyServiceModel,
// } from "../../services/material-consumption.services";

// import type {
//   SelectedPOContext,
//   SupplierLookupOption,
//   CurrencyOption,
//   StoreCodeOption,
// } from "../../interfaces/OrderManagement/purchase-order-types";
// import type { Buyer } from "../../interfaces/references/Buyer";
// import type { Style } from "../../interfaces/OrderManagement/Style";

// interface HeaderSelectorProps {
//   onHeaderContextLock: (context: SelectedPOContext | null) => void;
// }

// export default function SupplierPOHeaderSelector({
//   onHeaderContextLock,
// }: HeaderSelectorProps) {
//   // 1. Transactional Form States
//   const [poMode, setPoMode] = useState<"NEW" | "EDIT">("NEW");
//   const [purchaseNumber, setPurchaseNumber] = useState<string>(() =>
//     String(Math.floor(Math.random() * 90000) + 10000).padStart(6, "0"),
//   );
//   const [proformaNo, setProformaNo] = useState<string>("");
//   const [proformaDate, setProformaDate] = useState<string>("");

//   // Dropdown Selection States
//   const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
//   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
//   const [selectedSupplier, setSelectedSupplier] =
//     useState<SupplierLookupOption | null>(null);
//   const [selectedStore, setSelectedStore] = useState<StoreCodeOption | null>(
//     null,
//   );
//   const [selectedCurrency, setSelectedCurrency] =
//     useState<CurrencyServiceModel | null>(null);

//   const [selectedStyle, setSelectedStyle] = useState<Style | null>(null); // <-- Note the lowercase "S" in selectedStyle!

//   // 2. Fetch Master Datasets from your active RTK-Query Service Caches
//   const { data: buyerPageData, isLoading: isBuyersLoading } =
//     useGetBuyersPagedQuery({
//       pageIndex: 0,
//       pageSize: 999,
//       sortColumn: "name",
//       sortOrder: "asc",
//       filterColumn: null,
//       filterQuery: null,
//     });
//   const buyersList = useMemo<Buyer[]>(
//     () => buyerPageData?.items || [],
//     [buyerPageData],
//   );

//   const { data: ordersList = [], isLoading: isOrdersLoading } =
//     useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
//       skip: !selectedBuyer,
//     });

//   const { data: suppliersList = [], isLoading: isSuppliersLoading } =
//     useGetSuppliersLookupQuery();

//   const { data: currencyPageData, isLoading: isCurrenciesLoading } =
//     useGetAllCurrenciesQuery({
//       pageIndex: 0,
//       pageSize: 999,
//       sortColumn: "name",
//       sortOrder: "asc",
//       filterColumn: null,
//       filterQuery: null,
//     });
//   const currenciesList = useMemo<CurrencyServiceModel[]>(
//     () => currencyPageData?.items || [],
//     [currencyPageData],
//   );

//   // Static Store/Warehouse Codes initialized in-memory to prevent useEffect loop crashes
//   const [storesList] = useState<StoreCodeOption[]>([
//     { code: "ST1", description: "Main Fabric Store" },
//     { code: "ST2", description: "Accessories & Trims Store" },
//     { code: "ST3", description: "Finished Goods bonded Warehouse" },
//   ]);

//   // --- TRANSACTIONAL MANUAL ACTION HANDLERS ---

//   const handleModeChange = (newMode: "NEW" | "EDIT") => {
//     setPoMode(newMode);

//     if (newMode === "NEW") {
//       const generatedPo = String(
//         Math.floor(Math.random() * 90000) + 10000,
//       ).padStart(6, "0");
//       setPurchaseNumber(generatedPo);
//     } else {
//       setPurchaseNumber("");
//     }

//     // Reset everything immediately inside the transaction handler to prevent state collision anomalies
//     setSelectedBuyer(null);
//     setSelectedOrder(null);
//     setSelectedSupplier(null);
//     setSelectedStore(null);
//     setSelectedCurrency(null);
//     setProformaNo("");
//     setProformaDate("");
//     onHeaderContextLock(null); // Notify parent layout synchronously inside a click event macro task frame
//   };

//   const verifyAndBroadcastContext = (
//     updatedPoNumber = purchaseNumber,
//     updatedSupplier = selectedSupplier,
//     updatedStore = selectedStore,
//     updatedCurrency = selectedCurrency,
//     updatedBuyer = selectedBuyer,
//     updatedOrder = selectedOrder,
//     updatedProformaNo = proformaNo,
//     updatedProformaDate = proformaDate,
//   ) => {
//     if (
//       updatedPoNumber &&
//       updatedSupplier &&
//       updatedStore &&
//       updatedCurrency &&
//       updatedBuyer &&
//       updatedOrder &&
//       selectedType &&
//       selectedStyle // Verified lowercase state variable key matches perfectly
//     ) {
//       onHeaderContextLock({
//         purchaseNumber: updatedPoNumber.trim(),
//         supplierCode: String(updatedSupplier.supplierCode),
//         storeCode: updatedStore.code,
//         proformaInvoiceNo: updatedProformaNo.trim(),
//         proformaInvoiceDate: updatedProformaDate,
//         currencyCode: updatedCurrency.code,
//         buyerCode: updatedBuyer.buyerCode,
//         orderNumber: updatedOrder,

//         // FIXED: Switched from selectedStyle.StyleCode to your exact lowercase selectedStyle.StyleCode parameter!
//         typeCode: selectedType.id,
//         styleCode: selectedStyle.StyleCode,
//       });
//     } else {
//       onHeaderContextLock(null);
//     }
//   };

//   return (
//     <Card
//       variant="outlined"
//       sx={{
//         p: 2.5,
//         mb: 3,
//         backgroundColor: "#fafafa",
//         borderLeft: "5px solid #1a237e",
//       }}
//     >
//       <Box
//         sx={{
//           mb: 2,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Typography
//           variant="subtitle2"
//           sx={{ fontWeight: "bold", color: "#1a237e" }}
//         >
//           [ PROCUREMENT MANAGEMENT - SUPPLIER PURCHASE ORDER HEADER ]
//         </Typography>

//         {/* New PO vs Edit PO Mode Controller - Explicit Event Routing */}
//         <RadioGroup
//           row
//           value={poMode}
//           onChange={(e) => handleModeChange(e.target.value as "NEW" | "EDIT")}
//         >
//           <FormControlLabel
//             value="NEW"
//             control={<Radio size="small" color="primary" />}
//             label="New P/O Entry"
//           />
//           <FormControlLabel
//             value="EDIT"
//             control={<Radio size="small" color="secondary" />}
//             label="Edit Existing P/O"
//           />
//         </RadioGroup>
//       </Box>

//       {/* MUI v6 Responsive Data Entry Grid Structure */}
//       <Grid container spacing={2}>
//         {/* Input 1: P/O Number Field */}
//         <Grid size={{ xs: 12, sm: 6, md: 2 }}>
//           <TextField
//             label="P/O Number"
//             size="small"
//             fullWidth
//             disabled={poMode === "NEW"}
//             value={purchaseNumber}
//             onChange={(e) => {
//               const cleanedVal = e.target.value.toUpperCase();
//               setPurchaseNumber(cleanedVal);
//               verifyAndBroadcastContext(cleanedVal);
//             }}
//             slotProps={{
//               htmlInput: {
//                 maxLength: 10,
//                 style: { fontFamily: "monospace", fontWeight: "bold" },
//               },
//             }}
//           />
//         </Grid>

//         {/* Input 2: Supplier Selection Dropdown */}
//         <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
//           <Autocomplete
//             options={suppliersList}
//             getOptionLabel={(option: SupplierLookupOption) =>
//               option.name ? `${option.supplierCode} (${option.name})` : ""
//             }
//             value={selectedSupplier}
//             onChange={(_: SyntheticEvent, val: SupplierLookupOption | null) => {
//               setSelectedSupplier(val);
//               verifyAndBroadcastContext(purchaseNumber, val);
//             }}
//             loading={isSuppliersLoading}
//             isOptionEqualToValue={(option, value) =>
//               option.supplierCode === value?.supplierCode
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Vendor / Supplier"
//                 size="small"
//               />
//             )}
//           />
//         </Grid>

//         {/* Input 3: Store/Warehouse Allocation Code */}
//         <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
//           <Autocomplete
//             options={storesList}
//             getOptionLabel={(option: StoreCodeOption) =>
//               `${option.code} - ${option.description}`
//             }
//             value={selectedStore}
//             onChange={(_: SyntheticEvent, val: StoreCodeOption | null) => {
//               setSelectedStore(val);
//               verifyAndBroadcastContext(purchaseNumber, selectedSupplier, val);
//             }}
//             isOptionEqualToValue={(option, value) =>
//               option.code === value?.code
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Allocation Store Code"
//                 size="small"
//               />
//             )}
//           />
//         </Grid>

//         {/* Input 4: Master Ledger Currency Dropdown */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={currenciesList}
//             // FIXED: Switched from option.description to your real model parameter option.name!
//             getOptionLabel={(option: CurrencyServiceModel) =>
//               option.code ? `${option.code} (${option.name})` : ""
//             }
//             value={selectedCurrency}
//             onChange={(_, val: CurrencyServiceModel | null) => {
//               setSelectedCurrency(val);
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 val, // Passes the updated live currency object seamlessly
//               );
//             }}
//             loading={isCurrenciesLoading}
//             isOptionEqualToValue={(option, value) => option.id === value?.id}
//             renderInput={(params) => (
//               <TextField {...params} label="Purchase Currency" size="small" />
//             )}
//           />
//           {/* <Autocomplete
//             options={currenciesList}
//             getOptionLabel={(option: CurrencyServiceModel) =>
//               option.code ? `${option.code} (${option.name})` : ""
//             }
//             value={selectedCurrency}
//             onChange={(_: SyntheticEvent, val: CurrencyOption | null) => {
//               setSelectedCurrency(val);
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 val,
//               );
//             }} */}
//           {/* loading={isCurrenciesLoading}
//             isOptionEqualToValue={(option, value) => option.id === value?.id}
//             renderInput={(params) => (
//               <TextField {...params} label="Purchase Currency" size="small" />
//             )} */}
//           {/* /> */}
//         </Grid>

//         {/* Input 5: Proforma Invoice String Number */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <TextField
//             label="Proforma Invoice No."
//             size="small"
//             fullWidth
//             value={proformaNo}
//             onChange={(e) => {
//               const cleanedVal = e.target.value.toUpperCase();
//               setProformaNo(cleanedVal);
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 selectedCurrency,
//                 selectedBuyer,
//                 selectedOrder,
//                 cleanedVal,
//               );
//             }}
//           />
//         </Grid>

//         {/* Input 6: Proforma Invoice Date Picker */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <TextField
//             label="Proforma Invoice Date"
//             type="date"
//             size="small"
//             fullWidth
//             value={proformaDate}
//             onChange={(e) => {
//               const cleanedDate = e.target.value;
//               setProformaDate(cleanedDate);
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 selectedCurrency,
//                 selectedBuyer,
//                 selectedOrder,
//                 proformaNo,
//                 cleanedDate,
//               );
//             }}
//             slotProps={{ inputLabel: { shrink: true } }}
//           />
//         </Grid>

//         {/* Input 7: Buyer Selector */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={buyersList}
//             getOptionLabel={(option: Buyer) => option.name || ""}
//             value={selectedBuyer}
//             onChange={(_: SyntheticEvent, val: Buyer | null) => {
//               setSelectedBuyer(val);
//               setSelectedOrder(null); // Clear dependent grandchild parameters safely
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 selectedCurrency,
//                 val,
//                 null,
//               );
//             }}
//             loading={isBuyersLoading}
//             isOptionEqualToValue={(option, value) =>
//               option.buyerCode === value?.buyerCode
//             }
//             renderInput={(params) => (
//               <TextField {...params} label="Filter Target Buyer" size="small" />
//             )}
//           />
//         </Grid>

//         {/* Input 8: Target Purchase Order Contract Scope Selection */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={ordersList}
//             getOptionLabel={(option: string) => option || ""}
//             disabled={!selectedBuyer}
//             value={selectedOrder}
//             onChange={(_: SyntheticEvent, val: string | null) => {
//               setSelectedOrder(val);
//               verifyAndBroadcastContext(
//                 purchaseNumber,
//                 selectedSupplier,
//                 selectedStore,
//                 selectedCurrency,
//                 selectedBuyer,
//                 val,
//               );
//             }}
//             loading={isOrdersLoading}
//             isOptionEqualToValue={(option, value) => option === value}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Filter Target Buyer Order"
//                 size="small"
//               />
//             )}
//           />
//         </Grid>
//       </Grid>
//     </Card>
//   );
// }

// // import React, { useState, useMemo, SyntheticEvent } from "react";
// // import {
// //   Card,
// //   TextField,
// //   Typography,
// //   RadioGroup,
// //   FormControlLabel,
// //   Radio,
// //   CircularProgress,
// // } from "@mui/material";
// // import Autocomplete from "@mui/material/Autocomplete";
// // import Grid from "@mui/material/Grid";

// // // Import your existing live master lookup hooks directly from your verified service slices
// // import {
// //   useGetBuyersPagedQuery,
// //   useGetOrdersByBuyerQuery,
// //   useGetAllCurrenciesQuery,
// //   useGetSuppliersLookupQuery,
// //   type CurrencyServiceModel,
// // } from "../../services/material-consumption.services";

// // import type {
// //   SelectedPOContext,
// //   SupplierLookupOption,
// //   CurrencyOption,
// //   StoreCodeOption,
// // } from "../../interfaces/OrderManagement/purchase-order-types";
// // import type { Buyer } from "../../interfaces/references/Buyer";

// // interface HeaderSelectorProps {
// //   onHeaderContextLock: (context: SelectedPOContext | null) => void;
// // }

// // export default function SupplierPOHeaderSelector({
// //   onHeaderContextLock,
// // }: HeaderSelectorProps) {
// //   // 1. Transactional Form States
// //   const [poMode, setPoMode] = useState<"NEW" | "EDIT">("NEW");
// //   const [purchaseNumber, setPurchaseNumber] = useState<string>("");
// //   const [proformaNo, setProformaNo] = useState<string>("");
// //   const [proformaDate, setProformaDate] = useState<string>("");

// //   // Dropdown Selection States
// //   const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
// //   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
// //   const [selectedSupplier, setSelectedSupplier] =
// //     useState<SupplierLookupOption | null>(null);
// //   const [selectedStore, setSelectedStore] = useState<StoreCodeOption | null>(
// //     null,
// //   );
// //   const [selectedCurrency, setSelectedCurrency] =
// //     useState<CurrencyOption | null>(null);

// //   // 2. Fetch Master Datasets from your active RTK-Query Service Caches
// //   const { data: buyerPageData, isLoading: isBuyersLoading } =
// //     useGetBuyersPagedQuery({
// //       pageIndex: 0,
// //       pageSize: 999,
// //       sortColumn: "name",
// //       sortOrder: "asc",
// //       filterColumn: null,
// //       filterQuery: null,
// //     });
// //   const buyersList = useMemo<Buyer[]>(
// //     () => buyerPageData?.items || [],
// //     [buyerPageData],
// //   );

// //   const { data: ordersList = [], isLoading: isOrdersLoading } =
// //     useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
// //       skip: !selectedBuyer,
// //     });

// //   const { data: suppliersList = [], isLoading: isSuppliersLoading } =
// //     useGetSuppliersLookupQuery();

// //   const { data: currencyPageData, isLoading: isCurrenciesLoading } =
// //     useGetAllCurrenciesQuery({
// //       pageIndex: 0,
// //       pageSize: 999,
// //       sortColumn: "name",
// //       sortOrder: "asc",
// //       filterColumn: null,
// //       filterQuery: null,
// //     });
// //   const currenciesList = useMemo<CurrencyServiceModel[]>(
// //     () => currencyPageData?.items || [],
// //     [currencyPageData],
// //   );

// //   // Static Store/Warehouse Codes initialized in-memory to prevent useEffect loop crashes
// //   const [storesList] = useState<StoreCodeOption[]>([
// //     { code: "ST1", description: "Main Fabric Store" },
// //     { code: "ST2", description: "Accessories & Trims Store" },
// //     { code: "ST3", description: "Finished Goods bonded Warehouse" },
// //   ]);

// //   // 3. Automated Code Generation Wrapper (Simulating Clipper's autogen('po_no') hook)
// //   React.useEffect(() => {
// //     if (poMode === "NEW") {
// //       // Automatically generates a padded string PO code (e.g. "000024")
// //       const simulatedNextPo = String(
// //         Math.floor(Math.random() * 90000) + 10000,
// //       ).padStart(6, "0");
// //       setPurchaseNumber(simulatedNextPo);
// //     } else {
// //       setPurchaseNumber(""); // Leave empty for manual entry during edit modes
// //     }
// //     handleResetDownstream();
// //   }, [poMode]);

// //   // --- CASCADING RESET PASSES & BROADCAST TRIPS ---

// //   const handleResetDownstream = () => {
// //     setSelectedBuyer(null);
// //     setSelectedOrder(null);
// //     setSelectedSupplier(null);
// //     setSelectedStore(null);
// //     setSelectedCurrency(null);
// //     setProformaNo("");
// //     setProformaDate("");
// //     onHeaderContextLock(null); // Notify workspace matrix that the scope context is open
// //   };

// //   const verifyAndBroadcastContext = (
// //     updatedSupplier = selectedSupplier,
// //     updatedStore = selectedStore,
// //     updatedCurrency = selectedCurrency,
// //     updatedBuyer = selectedBuyer,
// //     updatedOrder = selectedOrder,
// //   ) => {
// //     if (
// //       purchaseNumber &&
// //       updatedSupplier &&
// //       updatedStore &&
// //       updatedCurrency &&
// //       updatedBuyer &&
// //       updatedOrder
// //     ) {
// //       // Compile and broadcast the unified SelectedPOContext payload up to the workspace container
// //       onHeaderContextLock({
// //         purchaseNumber: purchaseNumber.trim(),
// //         supplierCode: String(updatedSupplier.supplierCode),
// //         storeCode: updatedStore.code,
// //         proformaInvoiceNo: proformaNo.trim(),
// //         proformaInvoiceDate: proformaDate,
// //         currencyCode: updatedCurrency.code,
// //         buyerCode: updatedBuyer.buyerCode,
// //         orderNumber: updatedOrder,
// //       });
// //     } else {
// //       onHeaderContextLock(null);
// //     }
// //   };

// //   return (
// //     <Card
// //       variant="outlined"
// //       sx={{
// //         p: 2.5,
// //         mb: 3,
// //         backgroundColor: "#fafafa",
// //         borderLeft: "5px solid #1a237e",
// //       }}
// //     >
// //       <Box
// //         display="flex"
// //         justifyContent="space-between"
// //         alignItems="center"
// //         sx={{ mb: 2 }}
// //       >
// //         <Typography
// //           variant="subtitle2"
// //           sx={{ fontWeight: "bold", color: "#1a237e" }}
// //         >
// //           [ PROCUREMENT MANAGEMENT - SUPPLIER PURCHASE ORDER HEADER ]
// //         </Typography>

// //         {/* New PO vs Edit PO Mode Controller */}
// //         <RadioGroup
// //           row
// //           value={poMode}
// //           onChange={(e) => setPoMode(e.target.value as "NEW" | "EDIT")}
// //         >
// //           <FormControlLabel
// //             value="NEW"
// //             control={<Radio size="small" color="primary" />}
// //             label="New P/O Entry"
// //           />
// //           <FormControlLabel
// //             value="EDIT"
// //             control={<Radio size="small" color="secondary" />}
// //             label="Edit Existing P/O"
// //           />
// //         </RadioGroup>
// //       </Box>

// //       {/* MUI v6 Responsive Data Entry Grid Structure */}
// //       <Grid container spacing={2}>
// //         {/* Input 1: P/O Number Field */}
// //         <Grid size={{ xs: 12, sm: 6, md: 2 }}>
// //           <TextField
// //             label="P/O Number"
// //             size="small"
// //             fullWidth
// //             disabled={poMode === "NEW"} // Auto-locked in new mode to preserve clean sequential counts
// //             value={purchaseNumber}
// //             onChange={(e) => {
// //               setPurchaseNumber(e.target.value.toUpperCase());
// //               verifyAndBroadcastContext();
// //             }}
// //             slotProps={{
// //               htmlInput: {
// //                 maxLength: 10,
// //                 style: { fontFamily: "monospace", fontWeight: "bold" },
// //               },
// //             }}
// //           />
// //         </Grid>

// //         {/* Input 2: Supplier Selection Dropdown */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
// //           <Autocomplete
// //             options={suppliersList}
// //             getOptionLabel={(option: SupplierLookupOption) =>
// //               option.name ? `${option.supplierCode} (${option.name})` : ""
// //             }
// //             value={selectedSupplier}
// //             onChange={(_: SyntheticEvent, val: SupplierLookupOption | null) => {
// //               setSelectedSupplier(val);
// //               verifyAndBroadcastContext(val);
// //             }}
// //             loading={isSuppliersLoading}
// //             isOptionEqualToValue={(option, value) =>
// //               option.supplierCode === value?.supplierCode
// //             }
// //             renderInput={(params) => (
// //               <TextField
// //                 {...params}
// //                 label="Select Vendor / Supplier"
// //                 size="small"
// //               />
// //             )}
// //           />
// //         </Grid>

// //         {/* Input 3: Store/Warehouse Allocation Code */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
// //           <Autocomplete
// //             options={storesList}
// //             getOptionLabel={(option: StoreCodeOption) =>
// //               `${option.code} - ${option.description}`
// //             }
// //             value={selectedStore}
// //             onChange={(_: SyntheticEvent, val: StoreCodeOption | null) => {
// //               setSelectedStore(val);
// //               verifyAndBroadcastContext(selectedSupplier, val);
// //             }}
// //             isOptionEqualToValue={(option, value) =>
// //               option.code === value?.code
// //             }
// //             renderInput={(params) => (
// //               <TextField
// //                 {...params}
// //                 label="Allocation Store Code"
// //                 size="small"
// //               />
// //             )}
// //           />
// //         </Grid>

// //         {/* Input 4: Master Ledger Currency Dropdown */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //           <Autocomplete
// //             options={currenciesList}
// //             getOptionLabel={(option: CurrencyOption) =>
// //               option.code ? `${option.code} (${option.description})` : ""
// //             }
// //             value={selectedCurrency}
// //             onChange={(_: SyntheticEvent, val: CurrencyOption | null) => {
// //               setSelectedCurrency(val);
// //               verifyAndBroadcastContext(selectedSupplier, selectedStore, val);
// //             }}
// //             loading={isCurrenciesLoading}
// //             isOptionEqualToValue={(option, value) => option.id === value?.id}
// //             renderInput={(params) => (
// //               <TextField {...params} label="Purchase Currency" size="small" />
// //             )}
// //           />
// //         </Grid>

// //         {/* Input 5: Proforma Invoice String Number */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //           <TextField
// //             label="Proforma Invoice No."
// //             size="small"
// //             fullWidth
// //             value={proformaNo}
// //             onChange={(e) => {
// //               setProformaNo(e.target.value.toUpperCase());
// //               // Immediate evaluation pass triggers contextual bindings smoothly
// //               setTimeout(() => verifyAndBroadcastContext(), 0);
// //             }}
// //           />
// //         </Grid>

// //         {/* Input 6: Proforma Invoice Date Picker */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //           <TextField
// //             label="Proforma Invoice Date"
// //             type="date"
// //             size="small"
// //             fullWidth
// //             value={proformaDate}
// //             onChange={(e) => {
// //               setProformaDate(e.target.value);
// //               setTimeout(() => verifyAndBroadcastContext(), 0);
// //             }}
// //             slotProps={{ inputLabel: { shrink: true } }}
// //           />
// //         </Grid>

// //         {/* Input 7: Buyer Selector (Cascades downstream to limit visible budget orders) */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //           <Autocomplete
// //             options={buyersList}
// //             getOptionLabel={(option: Buyer) => option.name || ""}
// //             value={selectedBuyer}
// //             onChange={(_: SyntheticEvent, val: Buyer | null) => {
// //               setSelectedBuyer(val);
// //               setSelectedOrder(null);
// //               verifyAndBroadcastContext(
// //                 selectedSupplier,
// //                 selectedStore,
// //                 selectedCurrency,
// //                 val,
// //                 null,
// //               );
// //             }}
// //             loading={isBuyersLoading}
// //             isOptionEqualToValue={(option, value) =>
// //               option.buyerCode === value?.buyerCode
// //             }
// //             renderInput={(params) => (
// //               <TextField {...params} label="Filter Target Buyer" size="small" />
// //             )}
// //           />
// //         </Grid>

// //         {/* Input 8: Target Purchase Order Contract Scope Selection */}
// //         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //           <Autocomplete
// //             options={ordersList}
// //             getOptionLabel={(option: string) => option || ""}
// //             disabled={!selectedBuyer}
// //             value={selectedOrder}
// //             onChange={(_: SyntheticEvent, val: string | null) => {
// //               setSelectedOrder(val);
// //               verifyAndBroadcastContext(
// //                 selectedSupplier,
// //                 selectedStore,
// //                 selectedCurrency,
// //                 selectedBuyer,
// //                 val,
// //               );
// //             }}
// //             loading={isOrdersLoading}
// //             isOptionEqualToValue={(option, value) => option === value}
// //             renderInput={(params) => (
// //               <TextField
// //                 {...params}
// //                 label="Filter Target Buyer Order"
// //                 size="small"
// //               />
// //             )}
// //           />
// //         </Grid>
// //       </Grid>
// //     </Card>
// //   );
// // }
