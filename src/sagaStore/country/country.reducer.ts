import type { PayloadAction } from "@reduxjs/toolkit";
import type { Country } from "../../interfaces/references/Country";
import type { CountryState } from "../redux-reducer-interfaces";
import { COUNTRIES_ACTION_TYPES } from "./country.types";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

const INITIAL_STATE: CountryState = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

// Strongly type the action parameter by allowing a union of valid payloads
type CountryAction =
  | PayloadAction<
      PaginationAPIModel<Country>,
      typeof COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_SUCCESS
    >
  | PayloadAction<
      Error | string | unknown,
      | typeof COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_FAILURE
      | typeof COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_FAILURE
      | typeof COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_FAILURE
    >
  | PayloadAction<
      Country,
      | typeof COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_START
      | typeof COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_START
    >
  | PayloadAction<
      boolean,
      | typeof COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_SUCCESS
      | typeof COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_SUCCESS
    >;

const countryReducer = (
  state = INITIAL_STATE,
  action: CountryAction,
): CountryState => {
  const { type, payload } = action;

  switch (type) {
    case COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_SUCCESS:
      console.log(
        "countrty reducer success : ",
        payload as PaginationAPIModel<Country>,
      );
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        // Using Type Casting safely because we validated the switch type
        paginationAPIResult: payload as PaginationAPIModel<Country>,
      };

    case COUNTRIES_ACTION_TYPES.LOAD_ALL_COUNTRIES_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_START:
    case COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        // ✅ PROTECTED: Leave paginationAPIResult out so it stays preserved in state
        // paginationAPIResult: null,
      };
    case COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_SUCCESS:
    case COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        // ✅ PROTECTED: Leave paginationAPIResult out so it stays preserved in state
        // paginationAPIResult: null,
      };
    case COUNTRIES_ACTION_TYPES.CREATE_COUNTRY_FAILURE:
    case COUNTRIES_ACTION_TYPES.UPDATE_COUNTRY_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        // ✅ PROTECTED: Leave paginationAPIResult out so it stays preserved in state
        // paginationAPIResult: null,
      };

    default:
      return state;
  }
};

export { countryReducer };
