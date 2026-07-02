import type {
  PaginationData,
  POParameters,
} from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";

import { createAction } from "../../utils/reducer/reducer.utils";
import { ORDERS_ACTION_TYPES } from "./order.types";
import type PurchaseOrder from "../../interfaces/OrderManagement/PurchaseOrder";

// load one order by buyer and po
const loadOrderStart = ({ ...order }: POParameters) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ORDER_START, order);
};

const loadOrderSuccess = (order: PurchaseOrder) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ORDER_SUCCESS, order);
};

const loadOrderFailure = (error: unknown) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ORDER_FAILURE, error);
};

// load all orders
const loadAllOrdersStart = ({ ...pagination }: PaginationData) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ALL_ORDERS_START, pagination);
};

const loadAllOrdersSuccess = (suppliers: PaginationAPIModel<PurchaseOrder>) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ALL_ORDERS_SUCCESS, suppliers);
};

const loadAllOrdersFailure = (error: unknown) => {
  return createAction(ORDERS_ACTION_TYPES.LOAD_ALL_ORDERS_FAILURE, error);
};

// create
const createOrderStart = (supplier: PurchaseOrder) => {
  return createAction(ORDERS_ACTION_TYPES.CREATE_ORDER_START, supplier);
};

const createOrderSuccess = (success: boolean) => {
  return createAction(ORDERS_ACTION_TYPES.CREATE_ORDER_SUCCESS, success);
};

const createOrderFailure = (error: unknown) => {
  return createAction(ORDERS_ACTION_TYPES.CREATE_ORDER_FAILURE, error);
};

// update
const updateOrderStart = (supplierToEdit: PurchaseOrder) => {
  return createAction(ORDERS_ACTION_TYPES.UPDATE_ORDER_START, supplierToEdit);
};

const updateOrderSuccess = (success: boolean) => {
  return createAction(ORDERS_ACTION_TYPES.UPDATE_ORDER_SUCCESS, success);
};

const updateOrderFailure = (error: unknown) => {
  return createAction(ORDERS_ACTION_TYPES.UPDATE_ORDER_FAILURE, error);
};

// delete
const deleteOrderStart = (supplierCode: number) => {
  return createAction(ORDERS_ACTION_TYPES.DELETE_ORDER_START, supplierCode);
};

const deleteOrderSuccess = (success: boolean) => {
  return createAction(ORDERS_ACTION_TYPES.DELETE_ORDER_SUCCESS, success);
};

const deleteOrderFailure = (error: unknown) => {
  return createAction(ORDERS_ACTION_TYPES.DELETE_ORDER_FAILURE, error);
};

export {
  loadOrderStart,
  loadOrderSuccess,
  loadOrderFailure,
  loadAllOrdersStart,
  loadAllOrdersSuccess,
  loadAllOrdersFailure,
  createOrderStart,
  createOrderSuccess,
  createOrderFailure,
  updateOrderStart,
  updateOrderSuccess,
  updateOrderFailure,
  deleteOrderStart,
  deleteOrderSuccess,
  deleteOrderFailure,
};
