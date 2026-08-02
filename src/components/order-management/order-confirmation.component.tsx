import {
  Autocomplete,
  Backdrop,
  Box,
  Button,
  FormControl,
  TextField,
  ThemeProvider,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import React, { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { asideMenuTitleTypographyTheme } from "../../themes/themes";
import z from "zod";
import SelectList from "../../lib/select-list.component";
import { format, isValid, parse, parseISO } from "date-fns";

import {
  useCreateOrderMutation,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBasis,
  useGetBuyersQuery,
  useGetCountriesQuery,
  useGetCurrenciesQuery,
  useGetGarmentTypes,
  useGetPurchaseOrder,
  useGetUnits,
} from "../../tanstack-hooks/custom-hooks";
import { useNavigate } from "react-router-dom";
import OrderMain from "./order-main.component";
import { Bars } from "react-loading-icons";
import { ValidationErrorDisplay } from "../../utils/validation-error.component";

// Moved outside the component to prevent useless re-creations on every render frame
const poSchema = z.object({
  buyerCode: z.number().int().min(1, "Please select buyer"),
  order: z.coerce.string().min(1, "Order number cannot be blank"),
  garmentType: z.number().min(1, "Please select Type"),
  countryCode: z.coerce.string().min(1, "Please select Country"),
  currencyCode: z.string().min(1, "Please select currency"),
  unitCode: z.string().min(1, "Please select Unit"),
  basisCode: z.string().min(1, "Please select Basis"),
  basisValue: z.number().default(0),
  totalQuantity: z.coerce
    .number()
    .int()
    .gt(0, "Total quantity must be greater than 0"),
  // description: z.coerce.string().default(""),
  season: z.string().default(""),
  orderDate: z.string().min(1, "Order date is required"), // Swapped to string to match your native HTML5 date input format perfectly
});

type PoFormData = z.infer<typeof poSchema>;

// Shared label styling for every SelectList on this form, so its label
// behaves the same way (muted -> filled/blue -> focused/indigo) as the
// plain TextFields already do via the app's theme - scoped to just this
// form via SelectList's optional labelSx prop, not a global change.
const selectLabelSx = {
  color: "#8B93A1",
  "&.MuiInputLabel-shrink": { color: "#005B96", fontWeight: 600 },
  "&.Mui-focused": { color: "#6366F1" },
};

// Dropdown popup styling for every SelectList on this form, matching the
// Order field's Autocomplete dropdown (#0D1117) so every dropdown on this
// screen looks consistent -- passed via SelectList's optional menuSx/
// menuItemSx props, which default to the component's original white/black
// styling everywhere else it's used (e.g. the sign-up form).
const selectMenuSx = {
  backgroundColor: "#0D1117",
  color: "#F4F6F8",
};
const selectMenuItemSx = {
  color: "#F4F6F8",
  "&:hover": { backgroundColor: "rgba(139, 147, 161, 0.12)", color: "#F4F6F8" },
};

// Explicitly pass the schema type
// const treeErrors = z.treeifyError<typeof poSchema>(error);
type PoFormDataErrors = Partial<Record<keyof PoFormData, string[]>>;

const orderFormData: PoFormData = {
  buyerCode: 0,
  order: "",
  countryCode: "",
  currencyCode: "",
  basisCode: "",
  unitCode: "",
  totalQuantity: 0,
  // description: "",
  season: "",
  orderDate: format(new Date(), "yyyy-MM-dd"),
  basisValue: 0,
  garmentType: 0,
};

const OrderConfirmationRoutine = () => {
  const navigate = useNavigate();

  const [poFormData, setPoFormData] = useState<PoFormData>(orderFormData);
  const [errors, setErrors] = useState<PoFormDataErrors>({});

  // const [, setUnit] = useState<string>("");
  // const [, setTotal] = useState<number>(0);

  const validateForm = (data: PoFormData): PoFormDataErrors => {
    const result = poSchema.safeParse(data);
    if (!result.success) {
      //const tree = z.treeifyError(result.error);
      // return tree.properties?.buyerCode;
      const flattened = z.flattenError(result.error);
      return flattened.fieldErrors as PoFormDataErrors;
    }
    return {};
  };

  // 1. Zod Validation Helper
  // const validateForm = (data: poFormData): poFormDataErrors => {
  //   console.log("validating for.......");
  //   try {
  //     poSchema.parse(data);
  //     return {};
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       // Use z.flattenError to extract flat fieldErrors directly
  //       const flattened = z.flattenError(error);
  //       return flattened.fieldErrors as poFormDataErrors;
  //     }
  //     console.log("validating for end.......");
  //     return {};
  //   }
  // };

  // load select list data
  // 2. Network Queries
  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const { data: unitsPageData } = useGetUnits({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const { data: currenciesPageData } = useGetCurrenciesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const { data: basisesPageData } = useGetBasis({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const { data: countriesPageData } = useGetCountriesQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "code",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const { data: garmentTypesPageData } = useGetGarmentTypes({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "typeName",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  // 3. Memos for Options Lookups
  const buyers = useMemo(
    () => buyerPageData?.items || [],
    [buyerPageData?.items],
  );
  const countries = useMemo(
    () => countriesPageData?.items || [],
    [countriesPageData?.items],
  );
  const currencies = useMemo(
    () => currenciesPageData?.items || [],
    [currenciesPageData?.items],
  );
  const basises = useMemo(
    () => basisesPageData?.items || [],
    [basisesPageData?.items],
  );
  const units = useMemo(
    () => unitsPageData?.items || [],
    [unitsPageData?.items],
  );
  const garmentTypes = useMemo(
    () => garmentTypesPageData?.items || [],
    [garmentTypesPageData?.items],
  );

  // Buyer's existing order numbers, for the searchable "PO number" combo below.
  // Backend already returns the buyer's distinct order numbers -- this hook existed but
  // was never wired into this screen (see custom-hooks.ts).
  const { data: buyerOrdersData, isFetching: isFetchingBuyerOrders } =
    useGetAllPurchaseOrdersByBuyerCode(
      poFormData.buyerCode,
      poFormData.buyerCode > 0,
    );
  const orderOptions = useMemo(
    () => buyerOrdersData ?? [],
    [buyerOrdersData],
  );

  // 4. Fetch Existing Order Configuration
  // Only query the API if both keys are filled. Stops network layout spamming.
  // 2. Fetch Existing Order Configuration safely
  // 1. Clear lookup traffic safely using only the allowed "enabled" flag
  const hasValidLookupKeys =
    poFormData.buyerCode > 0 && poFormData.order.trim() !== "";

  const { data: existingPO, isFetching } = useGetPurchaseOrder(
    { buyerCode: poFormData.buyerCode, order: poFormData.order },
    hasValidLookupKeys, // Cleaned up: removed 'select'
  );

  // 2. Synchronize external state with a macro-task macro wrapper
  // ... inside your OrderConfirmationRoutine component ...

  // 1. SAFE DATA RETRIEVAL (Bridges backend strings/dates to frontend yyyy-MM-dd)

  // ... inside your OrderConfirmationRoutine component ...

  // 1. SAFE DATA RETRIEVAL (Bridges backend strings/dates to frontend yyyy-MM-dd)

  // useEffect(() => {
  //   validateForm(poFormData);
  // }, [poFormData]);
  useEffect(() => {
    if (!existingPO) return;

    const timeoutId = setTimeout(() => {
      setPoFormData((prev) => {
        const rawDateValue = String(existingPO.orderDate ?? "").trim();
        let parsedDate = new Date(); // Safe fallback default

        if (rawDateValue.includes("/")) {
          // Fixes: "30/06/2026" formats
          parsedDate = parse(rawDateValue, "dd/MM/yyyy", new Date());
        } else if (rawDateValue.includes("-")) {
          // Fixes: ISO Strings like "2026-06-30T00:00:00" or plain "2026-06-30"
          const cleanIso = rawDateValue.split("T")[0]; // Strip time segment if present
          parsedDate = parseISO(cleanIso);
        }

        // Final validation safeguard before state injection
        const finalStringDate = isValid(parsedDate)
          ? format(parsedDate, "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");

        const updatedState = {
          ...prev,
          ...existingPO,
          orderDate: finalStringDate,
          //   description: existingPO.description ?? "",
          // Legacy Clipper DBF CHAR-field data can carry trailing/leading whitespace that
          // the newer reference-data tables (Currency/Unit/Basis codes) don't have --
          // trimming here means a stray space doesn't break the SelectList's exact string
          // match against its options and leave the control looking empty.
          countryCode: (existingPO.countryCode ?? "").trim(),
          currencyCode: (existingPO.currencyCode ?? "").trim(),
          unitCode: (existingPO.unitCode ?? "").trim(),
          basisCode: (existingPO.basisCode ?? "").trim(),
          season: existingPO.season ?? "",
        };
        // Re-validate now that fields that were blank when Buyer/Order were first
        // selected (garmentType, countryCode, currencyCode, unitCode, basisCode, ...)
        // are populated from the loaded order -- otherwise the "Please select X"
        // messages from that earlier, still-blank validation pass linger on screen
        // even though the fields are now correctly filled in.
        setErrors(validateForm(updatedState));
        return updatedState;
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [existingPO]);

  // 2. CLEANER INPUT HANDLERS (No double-setting state overlaps)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;

    let parsedValue: string | number = value;

    // Direct type detection blueprint for numbers
    if (
      type === "number" ||
      name === "totalQuantity" ||
      name === "basisValue"
    ) {
      parsedValue = value === "" ? "" : Number(value);
    }

    setPoFormData((prev) => {
      const updatedState = {
        ...prev,
        [name]: parsedValue,
        // Ensure key identifiers aren't lost or dropped during typing passes
        // buyerCode: prev.buyerCode || poFormData.buyerCode,
        // order: prev.order || poFormData.order,
      };

      // Validate instantly with the true next state chunk
      setErrors(validateForm(updatedState));
      return updatedState;
    });
  };

  // 5. Input Event Handlers
  const handleSelectedChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "buyerCode" || name === "garmentType" ? Number(value) : value;

    setPoFormData((prev) => {
      // Switching buyers invalidates whatever order/order-details are on screen -- the
      // order list and its details are buyer-scoped, so carrying over a previous buyer's
      // order number here would either mis-lookup or silently mix data between buyers.
      // Reset everything else back to a blank "new order" state.
      const updatedState =
        name === "buyerCode"
          ? { ...orderFormData, buyerCode: parsedValue as number }
          : { ...prev, [name]: parsedValue };
      setErrors(validateForm(updatedState)); // Validate in step with latest state payload
      return updatedState;
    });
  };

  // 5b. Order combo handler (Autocomplete freeSolo -- both typing and picking an
  // existing option from the buyer's order list funnel through here)
  const handleOrderChange = (newValue: string) => {
    setPoFormData((prev) => {
      const updatedState = { ...prev, order: newValue };
      setErrors(validateForm(updatedState));
      return updatedState;
    });
  };

  // const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;

  //   setPoFormData((prev) => {
  //     const updatedState = { ...prev, [name]: value };
  //     setErrors(validateForm(updatedState));
  //     return updatedState;
  //   });
  // };

  // 6. Form Submission Management

  // Extract isPending from your mutation hook
  const {
    mutateAsync: createNewPO,
    isPending: isSubmitting,
    error,
  } = useCreateOrderMutation();

  // Combine both states into a single truth flag
  const isFormBlocked = isFetching || isSubmitting;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(poFormData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      // Transform the flat string data structure into the strict backend model format here
      await createNewPO({
        ...poFormData,
        orderDate: new Date(poFormData.orderDate), // Converts string "yyyy-MM-dd" back into a real Date object
      });
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleCancel = () => {
    // set flag (hasValidLookupKeys) to false so PO hook will not execute
    setPoFormData((prev) => {
      return {
        ...prev,
        ["buyerCode"]: 0,
        ["order"]: "",
      };
    });
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col justify-center w-full m-auto h1-screen h1-1/2 mx-auto my-auto mt-10 mb-5">
        {/* Outer Form Container Wrapper Card */}
        <div className="relative p-6 bg-white rounded-lg shadow-sm">
          {/* Unified Safe Responsive Backdrop Overlay */}
          {isFormBlocked && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[1px] transition-all duration-200">
              <div className="flex flex-col items-center gap-3">
                {/* Your custom Bars layout spinner */}
                <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />

                {/* Dynamic loading label text based on active process flag */}
                <span className="text-xs font-semibold text-blue-400 tracking-wide animate-pulse uppercase">
                  {isSubmitting
                    ? "Saving Order Details..."
                    : "Loading Existing Record..."}
                </span>
              </div>
            </div>
          )}
          <Box
            component="form"
            noValidate
            className={`flex flex-col m-auto border rounded-md border-gray-300 shadow-xl relative space-y-4 transition-opacity duration-200 ${isFetching ? "opacity-40 pointer-events-none" : "opacity-100"}`}
            onSubmit={handleSubmit}
            sx={{ width: "80%", padding: 4 }}
            // className="flex flex-col m-auto border rounded-md border-gray-300 shadow-xl relative"
          >
            <ThemeProvider theme={asideMenuTitleTypographyTheme}>
              <Typography color="blue-gray" className="text-center">
                Order Confirmation Routine
              </Typography>
            </ThemeProvider>
            {/* 1. Global summary display for unexpected field errors */}
            <ValidationErrorDisplay error={error} />
            <Box className="flex flex-col mx-auto w-full mt-4">
              <FormControl
                fullWidth
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex w-full justify-around p-0 m-0">
                  <div className="w-[30%] mt-1">
                    <FormControl fullWidth error>
                      <SelectList
                        data={buyers}
                        name="buyerCode"
                        value={poFormData.buyerCode}
                        label="Buyer"
                        labelKey="name"
                        valueKey="buyerCode"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.buyerCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.buyerCode}
                        </div>
                      )}
                      <ValidationErrorDisplay
                        error={error}
                        fieldName="buyerCode"
                      />
                    </FormControl>
                  </div>
                  <div className="w-[30%] mt-1">
                    <Autocomplete
                      freeSolo
                      disabled={!poFormData.buyerCode}
                      loading={isFetchingBuyerOrders}
                      options={orderOptions}
                      value={poFormData.order}
                      inputValue={poFormData.order}
                      onChange={(_, newValue) =>
                        handleOrderChange(newValue ?? "")
                      }
                      onInputChange={(_, newValue) =>
                        handleOrderChange(newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          name="order"
                          label="PO number"
                          margin="dense"
                          size="small"
                          autoComplete="off"
                          className="w-[95%]"
                          helperText={
                            !poFormData.buyerCode
                              ? "Select a buyer first"
                              : poFormData.order &&
                                  orderOptions.includes(poFormData.order)
                                ? "Existing order"
                                : poFormData.order
                                  ? "New order"
                                  : undefined
                          }
                        />
                      )}
                    />
                    {errors.order && (
                      <div className="text-red-500 text-[.7em] mt-1">
                        {errors.order}
                      </div>
                    )}
                    <ValidationErrorDisplay error={error} fieldName="order" />
                  </div>
                  <div className="w-[30%] mt-1">
                    <FormControl fullWidth error>
                      <SelectList
                        data={garmentTypes}
                        name="garmentType"
                        value={poFormData.garmentType}
                        label="Garment Type"
                        labelKey="typeName"
                        valueKey="id"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.buyerCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.garmentType}
                        </div>
                      )}
                    </FormControl>
                  </div>
                </div>
              </FormControl>
              <FormControl>
                <div className="flex w-full justify-between p-0 m-0 border1-4 border1-red-600">
                  {/* <div className="w-[30%]">
                    <TextField
                      name="description"
                      type="text"
                      margin="normal"
                      size="small"
                      placeholder="description"
                      value={poFormData.description} // 🚀 Reads straight from your flat state!
                      className="w-[95%]"
                      onChange={handleChange}
                    />
                  </div> */}

                  <div className="flex w-[30%] mt-1">
                    <FormControl fullWidth>
                      <SelectList
                        data={countries}
                        name="countryCode"
                        value={poFormData.countryCode}
                        label="Quota Country"
                        labelKey="name"
                        valueKey="code"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.countryCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.countryCode}
                        </div>
                      )}
                    </FormControl>
                  </div>
                  <div className="w-[30%] mt-1">
                    <FormControl fullWidth>
                      <SelectList
                        data={units}
                        name="unitCode"
                        value={poFormData.unitCode}
                        label="Unit"
                        labelKey="description"
                        valueKey="code"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.unitCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.unitCode}
                        </div>
                      )}
                    </FormControl>
                  </div>
                </div>

                <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                  <div className="w-[45%] mt-1">
                    <TextField
                      name="totalQuantity"
                      label="Total Quantity"
                      margin="dense"
                      size="small"
                      value={poFormData.totalQuantity || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-[45%] mt-1">
                    <TextField
                      fullWidth
                      name="orderDate"
                      label="Order Date"
                      margin="dense"
                      size="small"
                      type="date"
                      value={poFormData.orderDate}
                      onChange={handleChange}
                      // This forces the label to stay floating above "dd/mm/yyyy"
                      slotProps={{
                        inputLabel: { shrink: true },
                        formHelperText: { children: errors.orderDate?.[0] },
                      }}
                    />
                  </div>
                </div>

                <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600">
                  <div className="w-[30%] mt-1">
                    <TextField
                      fullWidth
                      name="season"
                      label="Season"
                      margin="dense"
                      size="small"
                      autoComplete="off"
                      value={poFormData.season}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-[30%] mt-1">
                    <FormControl fullWidth>
                      <SelectList
                        data={currencies}
                        name="currencyCode"
                        value={poFormData.currencyCode}
                        label="Currency"
                        labelKey="name"
                        valueKey="code"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.currencyCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.currencyCode}
                        </div>
                      )}
                    </FormControl>
                  </div>
                  <div className="w-[30%] mt-1">
                    <FormControl fullWidth>
                      <SelectList
                        data={basises}
                        name="basisCode"
                        value={poFormData.basisCode}
                        label="Basis"
                        labelKey="description"
                        valueKey="code"
                        handleSelectedChange={handleSelectedChange}
                        size="small"
                        labelSx={selectLabelSx}
                        menuSx={selectMenuSx}
                        menuItemSx={selectMenuItemSx}
                      />
                      {errors.basisCode && (
                        <div className="text-red-500 text-[.7em] mt-1">
                          {errors.basisCode}
                        </div>
                      )}
                    </FormControl>
                  </div>
                </div>

                <div className="flex w-full justify-around p-0 m-0 border1-4 border1-red-600 mt-3">
                  <div className="flex justify-around w-full">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      type="submit"
                      className="mt-8 w-[45%]"
                    >
                      Submit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      type="submit"
                      className="mt-8 w-[45%]"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </FormControl>
            </Box>
            <Backdrop
              open={isFetching}
              sx={{
                position: "absolute", // Locks the block to this component wrapper frame, not the whole screen!
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "rgba(255, 255, 255, 0.5)", // Gentle light frosted overlay
                color: "#60a5fa", // Matches your blue spinner accent color
              }}
            >
              {/* <CircularProgress color="inherit" size={40} /> */}
              {/* <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} /> */}
              {/* Optional small helper text */}
              {/* <span className="text-xs font-medium text-blue-400 animate-pulse">
              Loading Order...
            </span> */}
            </Backdrop>
          </Box>
          {/* {isFetching && (
          <div className="flex justify-around relative1 absolute top-0 left-0 z-60 ml-170 mt-10 bg-1gray-600">
            <Bars stroke="#60a5fa" strokeOpacity={1.0} speed={1.0} />
          </div>
        )} */}

          <div className="flex justify-between mx-auto">
            <OrderMain
              buyerCode={poFormData.buyerCode}
              order={poFormData.order}
              // setUnit={setUnit}
              // setTotal={setTotal}
              mainOrderUnit={poFormData.unitCode || "No Unit"}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationRoutine;
