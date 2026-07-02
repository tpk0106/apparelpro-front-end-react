import type { PayloadAction } from "@reduxjs/toolkit";
import { INITIAL_STATE } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

import { CURRENCY_EXCHANGES_ACTION_TYPES } from "./currency-exchange.types";
import type { CurrencyExchange } from "../../interfaces/references/CurrencyExchange";

const currencyExchangeReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<CurrencyExchange>>,
) => {
  const { payload, type } = action;

  switch (type) {
    case CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: payload.data,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.LOAD_ALL_CURRENCY_EXCHANGES_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_START:
      return {
        ...state,
        isLoading: true,
        success: false,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.CREATE_CURRENCY_EXCHANGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_START:
      return {
        ...state,
        isLoading: true,
        success: false,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.UPDATE_CURRENCY_EXCHANGE_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_START:
      return {
        ...state,
        isLoading: true,
        success: false,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        paginationAPIResult: null,
      };
    case CURRENCY_EXCHANGES_ACTION_TYPES.DELETE_CURRENCY_EXCHANGE_FAILURE:
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

export { currencyExchangeReducer };
