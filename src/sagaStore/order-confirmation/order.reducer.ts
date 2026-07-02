import type PurchaseOrder from "../../interfaces/OrderManagement/PurchaseOrder";

import { ORDERS_ACTION_TYPES } from "./order.types";
import type { PayloadAction } from "@reduxjs/toolkit";

const INITIAL_STATE = {
  po: null,
  error: null,
  isLoading: false,
  success: false,
};

const orderReducer = (
  state = INITIAL_STATE,
  action: PayloadAction<PurchaseOrder, string>, //<payload type, action type>
) => {
  const { payload, type } = action;

  switch (type) {
    case ORDERS_ACTION_TYPES.LOAD_ORDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        success: true,
        error: null,
        po: payload,
      };
    case ORDERS_ACTION_TYPES.LOAD_ORDER_FAILURE:
      return {
        ...state,
        isLoading: false,
        success: false,
        error: payload,
        po: null,
      };
    case ORDERS_ACTION_TYPES.CREATE_ORDER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        po: null,
      };
    case ORDERS_ACTION_TYPES.CREATE_ORDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        po: null,
      };
    case ORDERS_ACTION_TYPES.CREATE_ORDER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        po: null,
      };
    case ORDERS_ACTION_TYPES.UPDATE_ORDER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        po: null,
      };
    case ORDERS_ACTION_TYPES.UPDATE_ORDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        po: null,
      };
    case ORDERS_ACTION_TYPES.UPDATE_ORDER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        po: null,
      };
    case ORDERS_ACTION_TYPES.DELETE_ORDER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
        success: false,
        po: null,
      };
    case ORDERS_ACTION_TYPES.DELETE_ORDER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        success: true,
        po: null,
      };
    case ORDERS_ACTION_TYPES.DELETE_ORDER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: payload,
        success: false,
        po: null,
      };
    default:
      return state;
  }
};

export { orderReducer };
