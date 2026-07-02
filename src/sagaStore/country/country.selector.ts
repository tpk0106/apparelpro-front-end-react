import { createSelector } from "reselect";
// import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
// import type { Country } from "../../interfaces/references/Country";
import type { RootState } from "../rootReducer";
// import type { Country } from "../../interfaces/references/Country";

// export const selectAllCountries = (state: {
//   country: { paginationAPIResult: PaginationAPIModel<Country> };
// }): PaginationAPIModel<Country> => state.country.paginationAPIResult;

//  export const isLoading = (state: { country: { isLoading: boolean } }) =>
//    state.country.isLoading;

// export const selectAllCountryCodes = (state: {
//   country: { paginationAPIResult: PaginationAPIModel<Country> };
// }): string[] =>
//   state.country.paginationAPIResult?.items.map((country) => country.code);

// export const isError = (state: RootState) => state.country.error;

const selectCountrySlice = (state: RootState) => state.country;

// 2. Memoised selector extracts items completely error-free with NO double-casting!
export const SelectAllCountries = createSelector(
  [selectCountrySlice],
  (countryState) => {
    // TypeScript natively knows currencyState.paginationAPIResult is a PaginationAPIModel!
    return countryState.paginationAPIResult?.items || [];
  },
);

export const SelectCountriesTotal = createSelector(
  [selectCountrySlice],
  (countryState) => {
    // Adjust totalItems to match the naming convention on your ApiResult interface (e.g. totalItems, totalCount)
    return countryState.paginationAPIResult?.totalItems || 0;
  },
);

//export const isLoading = (state: RootState) => state.country;
export const isLoadingState = createSelector(
  [selectCountrySlice],
  (countryState) => {
    // TypeScript natively knows currencyState.paginationAPIResult is a PaginationAPIModel!
    return countryState.isLoading;
  },
);

export const isErrorState = createSelector(
  [selectCountrySlice],
  (countryState) => {
    // TypeScript natively knows currencyState.paginationAPIResult is a PaginationAPIModel!
    return !countryState.success;
  },
);
