import { useState, useMemo } from "react";
import { Card, TextField, Typography, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import type { Style } from "../../interfaces/OrderManagement/Style";
import {
  useGetBuyersPagedQuery,
  useGetOrdersByBuyerQuery,
  useGetAllGarmentTypesQuery,
  useGetStylesByScopeQuery,
  // 1. IMPORT your existing live currency endpoint query hook
  useGetAllCurrenciesQuery,
  // Buyer,
} from "../../services/material-consumption.services";

import {
  // type BuyerOption,
  type SelectedScopeContext,
  type GarmentTypeServiceModel,
} from "./material-consumption.types";
import type { Buyer } from "../../interfaces/references/Buyer";

interface ScopeHeaderProps {
  onScopeChange: (context: SelectedScopeContext | null) => void;
}

export default function ConsumptionScopeHeader({
  onScopeChange,
}: ScopeHeaderProps) {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedType, setSelectedType] =
    useState<GarmentTypeServiceModel | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  // 2. Add local state to hold your active currency selection
  const [selectedCurrency, setSelectedCurrency] = useState<any | null>(null);

  // Fetch Buyers Registry
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

  // Fetch Currencies Master Registry mapping your standard pagination variables
  const { data: currencyPageData, isLoading: isCurrenciesLoading } =
    useGetAllCurrenciesQuery({
      pageIndex: 0,
      pageSize: 999,
      sortColumn: "name",
      sortOrder: "asc",
      filterColumn: null,
      filterQuery: null,
    });

  const currenciesList = useMemo<any[]>(
    () => currencyPageData?.items || [],
    [currencyPageData],
  );

  // Cascade Dependent Requests
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

  // --- EVENT HANDLERS ---
  const handleBuyerChange = (buyerObj: Buyer | null) => {
    setSelectedBuyer(buyerObj);
    setSelectedOrder(null);
    setSelectedType(null);
    setSelectedStyle(null);
    setSelectedCurrency(null);
    onScopeChange(null);
  };

  const handleOrderChange = (orderCode: string | null) => {
    setSelectedOrder(orderCode);
    setSelectedType(null);
    setSelectedStyle(null);
    setSelectedCurrency(null);
    onScopeChange(null);
  };

  const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
    setSelectedType(typeObj);
    setSelectedStyle(null);
    setSelectedCurrency(null);
    onScopeChange(null);
  };

  const handleStyleChange = (styleObj: Style | null) => {
    setSelectedStyle(styleObj);
    setSelectedCurrency(null);
    onScopeChange(null);
  };

  // 3. Trigger context confirmation ONLY when currency is selected
  const handleCurrencyChange = (currencyObj: any | null) => {
    setSelectedCurrency(currencyObj);

    if (
      selectedStyle &&
      selectedBuyer &&
      selectedOrder &&
      selectedType &&
      currencyObj
    ) {
      onScopeChange({
        buyerCode: selectedBuyer.buyerCode,
        order: selectedOrder,
        typeCode: selectedType.id,
        styleCode: selectedStyle.styleCode,
        bulkQuantity: Number(selectedStyle.quantity) || 0,
        parentOrderUnit: selectedStyle.unit ?? "PCS",
        currencyCode: currencyObj.code, // <-- PASSES ACTIVE LEDGER CURRENCY CODE UP TO PARENT
      });
    } else {
      onScopeChange(null);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "#fafafa" }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          color: "text.secondary",
          mb: 1,
          display: "block",
        }}
      >
        PRODUCTION LEAD REPRESENTATION CONTEXT SELECTOR
      </Typography>

      {/* Expanded grid spacing wrapper for clean 5-column or double-row rendering */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={buyersList}
            getOptionLabel={(option: Buyer) => option.name || ""}
            value={selectedBuyer}
            onChange={(_, val) => handleBuyerChange(val)}
            isOptionEqualToValue={(option, value) =>
              option.buyerCode === value?.buyerCode
            }
            renderInput={(params) => (
              <TextField {...params} label="Select Buyer" size="small" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={ordersList}
            getOptionLabel={(option: string) => option || ""}
            disabled={!selectedBuyer}
            value={selectedOrder}
            onChange={(_, val) => handleOrderChange(val)}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Purchase Order"
                size="small"
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={globalTypesList}
            getOptionLabel={(option: GarmentTypeServiceModel) =>
              option.typeName || ""
            }
            disabled={!selectedOrder}
            value={selectedType}
            onChange={(_, val) => handleTypeChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Garment Type" size="small" />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={stylesList}
            disabled={!selectedType}
            getOptionLabel={(option: Style) =>
              option.styleCode
                ? `${option.styleCode} (${Number(option.quantity) || 0})`
                : ""
            }
            value={selectedStyle}
            onChange={(_, val) => handleStyleChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Select Active Style" size="small" />
            )}
          />
        </Grid>

        {/* 4. NEW ADDITION: Master Currency Dropdown Field Row */}
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Autocomplete
            options={currenciesList}
            disabled={!selectedStyle} // Remains locked until the style profile context is active
            getOptionLabel={(option: any) =>
              option.code ? `${option.code} (${option.description})` : ""
            }
            value={selectedCurrency}
            onChange={(_, val) => handleCurrencyChange(val)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField {...params} label="Ledger Currency" size="small" />
            )}
          />
        </Grid>
      </Grid>
    </Card>
  );
}

// import { useState, useMemo, type SyntheticEvent, useEffect } from "react";
// import { Card, TextField, Typography } from "@mui/material";
// import Autocomplete from "@mui/material/Autocomplete";
// import Grid from "@mui/material/Grid";
// import type { Style } from "../../interfaces/OrderManagement/Style";
// import {
//   useGetBuyersPagedQuery,
//   useGetOrdersByBuyerQuery,
//   useGetAllGarmentTypesQuery,
//   useGetStylesByScopeQuery,
// } from "../../services/material-consumption.services";

// import {
//   // type BuyerOption,
//   type SelectedScopeContext,
//   type GarmentTypeServiceModel,
// } from "./material-consumption.types";
// import type { Buyer } from "../../interfaces/references/Buyer";

// interface ScopeHeaderProps {
//   onScopeChange: (context: SelectedScopeContext | null) => void;
// }

// export default function ConsumptionScopeHeader({
//   onScopeChange,
// }: ScopeHeaderProps) {
//   // Selected dropdown choices state control variables
//   const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
//   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
//   const [selectedType, setSelectedType] =
//     useState<GarmentTypeServiceModel | null>(null);
//   const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

//   // Fetch Buyers Registry
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

//   // Cascade Dependent Requests
//   const { data: ordersList = [], isLoading: isOrdersLoading } =
//     useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
//       skip: !selectedBuyer,
//     });

//   const { data: globalTypesList = [], isLoading: isTypesLoading } =
//     useGetAllGarmentTypesQuery();

//   const { data: stylesList = [], isLoading: isStylesLoading } =
//     useGetStylesByScopeQuery(
//       {
//         buyerCode: selectedBuyer?.buyerCode ?? 0,
//         order: selectedOrder ?? "",
//         typeCode: selectedType?.id ?? 0,
//       },
//       { skip: !selectedBuyer || !selectedOrder || !selectedType },
//     );

//   useEffect(() => {
//     console.log("styles :", stylesList);
//   }, [stylesList]);

//   // --- EVENT HANDLERS ---
//   const handleBuyerChange = (buyerObj: Buyer | null) => {
//     setSelectedBuyer(buyerObj);
//     setSelectedOrder(null);
//     setSelectedType(null);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleOrderChange = (orderCode: string | null) => {
//     setSelectedOrder(orderCode);
//     setSelectedType(null);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
//     setSelectedType(typeObj);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleStyleChange = (styleObj: Style | null) => {
//     setSelectedStyle(styleObj);

//     if (styleObj && selectedBuyer && selectedOrder && selectedType) {
//       onScopeChange({
//         buyerCode: selectedBuyer.buyerCode,
//         order: selectedOrder,
//         typeCode: selectedType.id,
//         styleCode: styleObj.styleCode,
//         bulkQuantity: Number(styleObj.quantity) || 0,
//         parentOrderUnit: styleObj.unit ?? "PCS",
//       });
//     } else {
//       onScopeChange(null);
//     }
//   };

//   return (
//     <Card variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "#fafafa" }}>
//       <Typography
//         variant="caption"
//         sx={{
//           fontWeight: "bold",
//           color: "text.secondary",
//           mb: 1,
//           displayL: "block",
//         }}
//       >
//         PRODUCTION LEAD REPRESENTATION CONTEXT SELECTOR
//       </Typography>

//       <Grid container spacing={2}>
//         {/* Dropdown 1: Buyer */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={buyersList}
//             getOptionLabel={(option: Buyer) => option.name || ""}
//             value={selectedBuyer}
//             onChange={(_: SyntheticEvent, val: Buyer | null) =>
//               handleBuyerChange(val)
//             }
//             loading={isBuyersLoading}
//             isOptionEqualToValue={(option: Buyer, value: Buyer | null) =>
//               option.buyerCode === value?.buyerCode
//             }
//             renderInput={(params) => (
//               <TextField {...params} label="Select Buyer" size="small" />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 2: Purchase Order */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={ordersList}
//             getOptionLabel={(option: string) => option || ""}
//             disabled={!selectedBuyer}
//             value={selectedOrder}
//             onChange={(_: SyntheticEvent, val: string | null) =>
//               handleOrderChange(val)
//             }
//             loading={isOrdersLoading}
//             isOptionEqualToValue={(option: string, value: string | null) =>
//               option === value
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Purchase Order"
//                 size="small"
//               />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 3: Garment Type */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={globalTypesList}
//             getOptionLabel={(option: GarmentTypeServiceModel) =>
//               option.typeName || ""
//             }
//             disabled={!selectedOrder}
//             value={selectedType}
//             onChange={(
//               _: SyntheticEvent,
//               val: GarmentTypeServiceModel | null,
//             ) => handleTypeChange(val)}
//             loading={isTypesLoading}
//             isOptionEqualToValue={(
//               option: GarmentTypeServiceModel,
//               value: GarmentTypeServiceModel | null,
//             ) => option.id === value?.id}
//             renderInput={(params) => (
//               <TextField {...params} label="Select Garment Type" size="small" />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 4: Style Code */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={stylesList}
//             disabled={!selectedType}
//             getOptionLabel={(option: Style) =>
//               option.styleCode
//                 ? `${option.styleCode} (${Number(option.quantity) || 0} ${option.unit || "PCS"})`
//                 : ""
//             }
//             value={selectedStyle}
//             onChange={(_: SyntheticEvent, val: Style | null) =>
//               handleStyleChange(val)
//             }
//             loading={isStylesLoading}
//             isOptionEqualToValue={(option: Style, value: Style | null) =>
//               option.id === value?.id
//             }
//             renderInput={(params) => (
//               <TextField {...params} label="Select Active Style" size="small" />
//             )}
//           />
//         </Grid>
//       </Grid>
//     </Card>
//   );
// }

// import React, { useState, useMemo } from "react";
// import { Card, TextField, Typography, CircularProgress } from "@mui/material";
// import Autocomplete from "@mui/material/Autocomplete";
// import Grid from "@mui/material/Grid";
// import type { Style } from "../../interfaces/OrderManagement/Style";

// import {
//   // type BuyerOption,
//   type SelectedScopeContext,
//   type GarmentTypeServiceModel,
// } from "./material-consumption.types";
// import {
//   useGetBuyersPagedQuery,
//   useGetOrdersByBuyerQuery,
//   useGetAllGarmentTypesQuery,
//   useGetStylesByScopeQuery,
//   // Buyer,
//   // SelectedScopeContext,
// } from "../../services/material-consumption.services";
// import type { Buyer } from "../../interfaces/references/Buyer";

// interface ScopeHeaderProps {
//   onScopeChange: (context: SelectedScopeContext | null) => void;
// }

// export default function ConsumptionScopeHeader({
//   onScopeChange,
// }: ScopeHeaderProps) {
//   // Selected dropdown choices state control variables
//   const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
//   const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
//   const [selectedType, setSelectedType] =
//     useState<GarmentTypeServiceModel | null>(null);
//   const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

//   // 1. Fetch Buyers Registry via your live service pagination setup
//   const { data: buyerPageData, isLoading: isBuyersLoading } =
//     useGetBuyersPagedQuery({
//       pageIndex: 0,
//       pageSize: 999,
//       sortColumn: "name",
//       sortOrder: "asc",
//       filterColumn: null,
//       filterQuery: null,
//     });

//   // Extract the items array from your real C# PaginationAPIModel payload wrapper
//   const buyersList = useMemo<Buyer[]>(
//     () => buyerPageData?.items || [],
//     [buyerPageData],
//   );

//   // 2. Cascade Dependent Requests using your live endpoints
//   const { data: ordersList = [], isLoading: isOrdersLoading } =
//     useGetOrdersByBuyerQuery(selectedBuyer?.buyerCode ?? 0, {
//       skip: !selectedBuyer,
//     });

//   const { data: globalTypesList = [], isLoading: isTypesLoading } =
//     useGetAllGarmentTypesQuery();

//   const { data: stylesList = [], isLoading: isStylesLoading } =
//     useGetStylesByScopeQuery(
//       {
//         buyerCode: selectedBuyer?.buyerCode ?? 0,
//         order: selectedOrder ?? "",
//         typeCode: selectedType?.id ?? 0, // Note your garment types model utilizes lowercase id
//       },
//       { skip: !selectedBuyer || !selectedOrder || !selectedType },
//     );

//   // --- EVENT HANDLERS WITH CASCADING RESET PASSES ---

//   const handleBuyerChange = (buyerObj: Buyer | null) => {
//     setSelectedBuyer(buyerObj);
//     setSelectedOrder(null);
//     setSelectedType(null);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleOrderChange = (orderCode: string | null) => {
//     setSelectedOrder(orderCode);
//     setSelectedType(null);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleTypeChange = (typeObj: GarmentTypeServiceModel | null) => {
//     setSelectedType(typeObj);
//     setSelectedStyle(null);
//     onScopeChange(null);
//   };

//   const handleStyleChange = (styleObj: Style | null) => {
//     setSelectedStyle(styleObj);

//     if (styleObj && selectedBuyer && selectedOrder && selectedType) {
//       onScopeChange({
//         buyerCode: selectedBuyer.buyerCode,
//         order: selectedOrder,
//         typeCode: selectedType.id, // Binds your local garment type code integer
//         styleCode: styleObj.styleCode,
//         bulkQuantity: Number(styleObj.quantity) || 0,
//         parentOrderUnit: styleObj.unit ?? "PCS",
//       });
//     } else {
//       onScopeChange(null);
//     }
//   };

//   return (
//     <Card variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "#fafafa" }}>
//       <Typography
//         variant="caption"
//         sx={{
//           fontWeight: "bold",
//           color: "text.secondary",
//           mb: 1,
//           display: "block",
//         }}
//       >
//         PRODUCTION LEAD REPRESENTATION CONTEXT SELECTOR
//       </Typography>

//       <Grid container spacing={2}>
//         {/* Dropdown 1: Buyer */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={buyersList}
//             getOptionLabel={(option) => option.name || ""}
//             value={selectedBuyer}
//             onChange={(_, val) => handleBuyerChange(val)}
//             loading={isBuyersLoading}
//             // CRITICAL IDENTITY LOCK: Enforce strict primary key matching based on buyerCode
//             isOptionEqualToValue={(option, value) =>
//               option.buyerCode === value?.buyerCode
//             }
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Buyer"
//                 size="small"
//                 slotProps={{
//                   input: {
//                     ...params.slotProps.input,
//                     endAdornment: (
//                       <>
//                         {isBuyersLoading ? (
//                           <CircularProgress color="inherit" size={20} />
//                         ) : null}
//                         {params.slotProps.input.endAdornment}
//                       </>
//                     ),
//                   },
//                 }}
//               />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 2: Purchase Order */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={ordersList}
//             getOptionLabel={(option) => option || ""}
//             disabled={!selectedBuyer}
//             value={selectedOrder}
//             onChange={(_, val) => handleOrderChange(val)}
//             loading={isOrdersLoading}
//             isOptionEqualToValue={(option, value) => option === value}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Purchase Order"
//                 size="small"
//                 slotProps={{
//                   input: {
//                     ...params.slotProps.input,
//                     endAdornment: (
//                       <>
//                         {isOrdersLoading ? (
//                           <CircularProgress color="inherit" size={20} />
//                         ) : null}
//                         {params.slotProps.input.endAdornment}
//                       </>
//                     ),
//                   },
//                 }}
//               />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 3: Garment Type */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={globalTypesList}
//             getOptionLabel={(option) => option.typeName || ""}
//             disabled={!selectedOrder}
//             value={selectedType}
//             onChange={(_, val) => handleTypeChange(val)}
//             loading={isTypesLoading}
//             // Enforce strict matching based on your garment type id key property
//             isOptionEqualToValue={(option, value) => option.id === value?.id}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Garment Type"
//                 size="small"
//                 slotProps={{
//                   input: {
//                     ...params.slotProps.input,
//                     endAdornment: (
//                       <>
//                         {isTypesLoading ? (
//                           <CircularProgress color="inherit" size={20} />
//                         ) : null}
//                         {params.slotProps.input.endAdornment}
//                       </>
//                     ),
//                   },
//                 }}
//               />
//             )}
//           />
//         </Grid>

//         {/* Dropdown 4: Style Code */}
//         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//           <Autocomplete
//             options={stylesList}
//             disabled={!selectedType}
//             getOptionLabel={(option) =>
//               option.styleCode
//                 ? `${option.styleCode} (${Number(option.quantity) || 0} ${option.unit || "PCS"})`
//                 : ""
//             }
//             value={selectedStyle}
//             onChange={(_, val) => handleStyleChange(val)}
//             loading={isStylesLoading}
//             isOptionEqualToValue={(option, value) => option.id === value?.id}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Select Active Style"
//                 size="small"
//                 slotProps={{
//                   input: {
//                     ...params.slotProps.input,
//                     endAdornment: (
//                       <>
//                         {isStylesLoading ? (
//                           <CircularProgress color="inherit" size={20} />
//                         ) : null}
//                         {params.slotProps.input.endAdornment}
//                       </>
//                     ),
//                   },
//                 }}
//               />
//             )}
//           />
//         </Grid>
//       </Grid>
//     </Card>
//   );
// }
