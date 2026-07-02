// sagaStore/currency/currency.reducer.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Currency } from "../../interfaces/references/Currency";
import { CURRENCIES_ACTION_TYPES } from "./currency.types";
import type { CurrencyState } from "../redux-reducer-interfaces";

// 1. Strict interface for this specific reducer slice

// 2. Enforce the interface right at the initialization step
const INITIAL_STATE: CurrencyState = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

// 1. Create a Type Guard to check if an object has the expected data payload wrapper
function isDataWrapper(
  payload: unknown,
): payload is { data: PaginationAPIModel<Currency> } {
  return typeof payload === "object" && payload !== null && "data" in payload;
}

// 3. FIX: Change action payload type to allow the object wrapper containing '.data'
const currencyReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<unknown>, // 🚀 Accepts the envelope wrapper cleanly
): CurrencyState => {
  const { type, payload } = action;

  switch (type) {
    case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_SUCCESS: {
      let dataResult: PaginationAPIModel<Currency> | null;

      // 🚀 Use the Type Guard to safely check and extract the data structure
      if (isDataWrapper(payload)) {
        dataResult = payload.data;
      } else {
        // If the payload itself is the pagination object directly
        dataResult = payload as PaginationAPIModel<Currency>;
      }

      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        paginationAPIResult: dataResult,
      };
    }

    case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload, // Safe because error state allows any/unknown error structures
        success: false,
        paginationAPIResult: null,
      };

    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_START:
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };

    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_SUCCESS:
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };

    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_FAILURE:
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };

    default:
      return state;
  }
};

export { currencyReducer };

// import type { PayloadAction } from "@reduxjs/toolkit";
// import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
// import type { Currency } from "../../interfaces/references/Currency";
// import { CURRENCIES_ACTION_TYPES } from "./currency.types";
// import type { CurrencyState } from "../redux-reducer-interfaces";

// // 🚀 1. Create a strict interface for this specific reducer slice
// // 🚀 2. Enforce the interface right at the initialization step
// const INITIAL_STATE: CurrencyState = {
//   paginationAPIResult: null,
//   error: null,
//   isLoading: false,
//   success: false,
// };

// // 🚀 3. Add explicit types to your reducer function signatures
// const currencyReducer = (
//   state = INITIAL_STATE,
//   action: PayloadAction<PaginationAPIModel<Currency>>,
// ): CurrencyState => {
//   const { type, payload } = action;

//   switch (type) {
//     case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_SUCCESS:
//       console.log(payload.data);
//       return {
//         ...state,
//         error: null,
//         isLoading: false,
//         success: true,
//         // Ensure payload matches what your saga outputs (either payload or payload.data)

//         paginationAPIResult: payload.data ?? payload.data,
//       };

//     case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_FAILURE:
//     case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_START:
//     case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_SUCCESS:
//     case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_FAILURE:
//     case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_START:
//     case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_SUCCESS:
//     case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_FAILURE:
//       return {
//         ...state,
//         isLoading: false,
//         error: type.includes("FAILURE") ? payload : null,
//         success: type.includes("SUCCESS"),
//         paginationAPIResult: null,
//       };
//     default:
//       return state;
//   }
// };

// export { currencyReducer };
