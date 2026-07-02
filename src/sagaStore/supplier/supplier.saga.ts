import type { PayloadAction } from "@reduxjs/toolkit";
import type { PaginationData } from "../../interfaces/definitions";
import {
  all,
  call,
  type CallEffect,
  put,
  type PutEffect,
  takeLatest,
} from "redux-saga/effects";
import type { Supplier } from "../../interfaces/references/Supplier";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { AnyAction } from "redux-saga";
import {
  createSupplierFailure,
  createSupplierSuccess,
  deleteSupplierFailure,
  deleteSupplierSuccess,
  loadAllSuppliersFailure,
  loadAllSuppliersSuccess,
  updateSupplierFailure,
  updateSupplierSuccess,
} from "./supplier.action";
import {
  createNewSupplier,
  loadSuppliers,
  removeSupplier,
  updateEditSupplier,
} from "../../services/supplier.service";
import { SUPPLIERS_ACTION_TYPES } from "./supplier.types";

export function* loadAllSuppliers(
  action: PayloadAction<PaginationData>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    const suppliers: PaginationAPIModel<Supplier> = (yield call(
      loadSuppliers,
      payload,
    )) as PaginationAPIModel<Supplier>;

    yield put(
      loadAllSuppliersSuccess({
        ...suppliers,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(loadAllSuppliersFailure(error));
  }
}

export function* createSupplier(
  action: PayloadAction<Supplier>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewSupplier, payload);
    yield put(createSupplierSuccess(true));
  } catch (error) {
    yield put(createSupplierFailure(error));
  }
}

export function* updateSupplier(
  action: PayloadAction<Supplier>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditSupplier, payload.supplierCode, payload);
    yield put(updateSupplierSuccess(true));
  } catch (error) {
    yield put(updateSupplierFailure(error));
  }
}

export function* deleteSupplier(
  action: PayloadAction<number>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    const supplierCode = payload;
    yield call(removeSupplier, supplierCode);
    yield put(deleteSupplierSuccess(true));
  } catch (error) {
    yield put(deleteSupplierFailure(error));
  }
}

export function* onLoadAllSuppliers() {
  yield takeLatest(
    SUPPLIERS_ACTION_TYPES.LOAD_ALL_SUPPLIERS_START,
    loadAllSuppliers,
  );
}

function* onCreateSupplier() {
  yield takeLatest(
    SUPPLIERS_ACTION_TYPES.CREATE_SUPPLIER_START,
    createSupplier,
  );
}

function* onUpdateSupplier() {
  yield takeLatest(
    SUPPLIERS_ACTION_TYPES.UPDATE_SUPPLIER_START,
    updateSupplier,
  );
}

function* onDeleteSupplier() {
  yield takeLatest(
    SUPPLIERS_ACTION_TYPES.DELETE_SUPPLIER_START,
    deleteSupplier,
  );
}

export function* supplierSagas() {
  yield all([
    call(onLoadAllSuppliers),
    call(onCreateSupplier),
    call(onUpdateSupplier),
    call(onDeleteSupplier),
  ]);
}
