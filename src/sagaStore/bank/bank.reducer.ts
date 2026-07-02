import type { PayloadAction } from "@reduxjs/toolkit";
//import { INITIAL_STATE } from "../../defs/defs";
import { BANK_ACTION_TYPES } from "./bank.types";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Bank } from "../../interfaces/references/Bank";

const INITIAL_STATE = {
  paginationAPIResult: null,
  error: null,
  isLoading: false,
  success: false,
};

export const bankReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<Bank>>,
) => {
  const { type, payload } = action;
  switch (type) {
    case BANK_ACTION_TYPES.LOAD_ALL_BANKS_SUCCESS:
      return {
        ...state,
        paginationAPIResult: payload.data,
        error: null,
        success: true,
        isLoading: false,
      };
    case BANK_ACTION_TYPES.LOAD_ALL_BANKS_FAILURE:
      return {
        ...state,
        paginationAPIResult: null,
        error: payload,
        isLoading: false,
        success: false,
      };
    case BANK_ACTION_TYPES.UPDATE_BANK_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BANK_ACTION_TYPES.UPDATE_BANK_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BANK_ACTION_TYPES.UPDATE_BANK_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BANK_ACTION_TYPES.CREATE_BANK_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BANK_ACTION_TYPES.CREATE_BANK_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BANK_ACTION_TYPES.CREATE_BANK_FAILURE:
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
