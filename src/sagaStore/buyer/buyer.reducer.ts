import { INITIAL_STATE } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { BUYERS_ACTION_TYPES } from "./buyer.types";
import type { Buyer } from "../../interfaces/references/Buyer";
import type { PayloadAction } from "@reduxjs/toolkit";

const buyerReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PaginationAPIModel<Buyer>>,
) => {
  const { type, payload } = action;

  switch (type) {
    case BUYERS_ACTION_TYPES.LOAD_ALL_BUYERS_SUCCESS:
      return {
        ...state,
        error: null,
        isLoading: false,
        success: true,
        paginationAPIResult: payload.data,
      };

    case BUYERS_ACTION_TYPES.LOAD_ALL_BUYERS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.UPDATE_BUYER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.UPDATE_BUYER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.UPDATE_BUYER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.CREATE_BUYER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.CREATE_BUYER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.CREATE_BUYER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.DELETE_BUYER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        paginationAPIResult: null,
      };
    case BUYERS_ACTION_TYPES.DELETE_BUYER_FAILURE:
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

export { buyerReducer };
