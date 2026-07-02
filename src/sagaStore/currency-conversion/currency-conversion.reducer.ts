import type { PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_STATE } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";
import { CURRENCIES_ACTION_TYPES } from "../currency/currency.types";

const currencyConversionReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<CurrencyConversion>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: payload.data,
      };
    case CURRENCIES_ACTION_TYPES.LOAD_ALL_CURRENCIES_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_START:
      return {
        ...state,
        isLoading: true,
        success: false,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.CREATE_CURRENCY_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_START:
      return {
        ...state,
        isLoading: true,
        success: false,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCIES_ACTION_TYPES.UPDATE_CURRENCY_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    default:
      return state;
  }
};

export { currencyConversionReducer };
