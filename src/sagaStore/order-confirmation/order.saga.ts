import type { PayloadAction } from "@reduxjs/toolkit";

import {
  all,
  call,
  type CallEffect,
  put,
  type PutEffect,
  takeLatest,
} from "redux-saga/effects";

import type { AnyAction } from "redux-saga";
import type PurchaseOrder from "../../interfaces/OrderManagement/PurchaseOrder";
import { loadOrderFailure, loadOrderSuccess } from "./order.action";
import { ORDERS_ACTION_TYPES } from "./order.types";
import { loadPurchaseOrder } from "../../services/poService";
import type { POParameters } from "../../interfaces/definitions";

export function* loadPO(
  action: PayloadAction<POParameters>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    const po: PurchaseOrder = (yield call(
      loadPurchaseOrder,
      payload,
    )) as PurchaseOrder;

    yield put(loadOrderSuccess(po));
  } catch (error) {
    yield put(loadOrderFailure(error));
  }
}

// export function* createOrder(
//   action: PayloadAction<Order>
// ): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
//   try {
//     const { payload } = action;
//     yield call(createNewOrder, payload);
//     yield put(createOrderSuccess(true));
//   } catch (error) {
//     yield put(createOrderFailure(error));
//   }
// }

// export function* updateOrder(
//   action: PayloadAction<Order>
// ): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
//   try {
//     const { payload } = action;
//     yield call(updateEditOrder, payload.id, payload);
//     yield put(updateOrderSuccess(true));
//   } catch (error) {
//     yield put(updateOrderFailure(error));
//   }
// }

// export function* deleteOrder(
//   action: PayloadAction<number>
// ): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
//   try {
//     const { payload } = action;
//     const id = payload;
//     yield call(removeOrder, id);
//     yield put(deleteOrderSuccess(true));
//   } catch (error) {
//     yield put(deleteOrderFailure(error));
//   }
// }

export function* onLoadPO() {
  yield takeLatest(ORDERS_ACTION_TYPES.LOAD_ORDER_START, loadPO);
}

// export function* onLoadAllOrders() {
//   yield takeLatest(ORDERS_ACTION_TYPES.LOAD_ORDER_START, loadPO);
// }

// function* onCreateOrder() {
//   yield takeLatest(ORDERS_ACTION_TYPES.CREATE_UNIT_START, createOrder);
// }

// function* onUpdateOrder() {
//   yield takeLatest(ORDERS_ACTION_TYPES.UPDATE_UNIT_START, updateOrder);
// }

// function* onDeleteOrder() {
//   yield takeLatest(ORDERS_ACTION_TYPES.DELETE_UNIT_START, deleteOrder);
// }

export function* orderSagas() {
  yield all([
    call(onLoadPO),
    // call(onCreateOrder),
    // call(onUpdateOrder),
    // call(onDeleteOrder),
  ]);
}
