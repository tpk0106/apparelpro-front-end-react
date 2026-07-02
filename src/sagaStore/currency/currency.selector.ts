// sagaStore/currency/currency.selector.ts
import { createSelector } from "reselect";
import type { RootState } from "../rootReducer"; // Adjust path to your store config

// 1. Core input selector reads the typed slice cleanly
const selectCurrencySlice = (state: RootState) => state.currency;

// 2. Memoised selector extracts items completely error-free with NO double-casting!
export const SelectAllCurrencies = createSelector(
  [selectCurrencySlice],
  (currencyState) => {
    // TypeScript natively knows currencyState.paginationAPIResult is a PaginationAPIModel!
    return currencyState.paginationAPIResult?.items || [];
  },
);

// 3. Memoised selector to capture row metrics safely
export const SelectCurrenciesTotal = createSelector(
  [selectCurrencySlice],
  (currencyState) => {
    // Adjust totalItems to match the naming convention on your ApiResult interface (e.g. totalItems, totalCount)
    return currencyState.paginationAPIResult?.totalItems || 0;
  },
);
