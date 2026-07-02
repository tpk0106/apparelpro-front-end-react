import type { PayloadAction } from "@reduxjs/toolkit";
import type { PaginationData } from "../../interfaces/definitions";
import {
  all,
  call,
  put,
  takeLatest,
  type CallEffect,
  type PutEffect,
} from "redux-saga/effects";

import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { AnyAction } from "redux-saga";
import type { Basis } from "../../interfaces/references/Basis";
import {
  createBasisFailure,
  createBasisSuccess,
  deleteBasisFailure,
  deleteBasisSuccess,
  loadAllBasisesFailure,
  loadAllBasisesSuccess,
  updateBasisFailure,
  updateBasisSuccess,
} from "./basis.action";
import { BASISES_ACTION_TYPES } from "./basis.types";
import {
  createNewBasis,
  loadBasises,
  removeBasis,
  updateEditBasis,
} from "../../services/basis.service";

export function* loadAllBasises(
  action: PayloadAction<PaginationData>,
): Generator<
  CallEffect | PutEffect<AnyAction>,
  void,
  PaginationAPIModel<Basis>
> {
  try {
    const { payload } = action;
    const basises: PaginationAPIModel<Basis> = (yield call(
      loadBasises,
      payload,
    )) as PaginationAPIModel<Basis>;

    yield put(
      loadAllBasisesSuccess({
        ...basises,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(loadAllBasisesFailure(error));
  }
}

export function* createBasis(
  action: PayloadAction<Basis>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewBasis, payload);
    yield put(createBasisSuccess(true));
  } catch (error) {
    yield put(createBasisFailure(error));
  }
}

export function* updateBasis(
  action: PayloadAction<Basis>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditBasis, payload.id, payload);
    yield put(updateBasisSuccess(true));
  } catch (error) {
    yield put(updateBasisFailure(error));
  }
}

export function* deleteBasis(
  action: PayloadAction<number>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    const id = payload;
    yield call(removeBasis, id);
    yield put(deleteBasisSuccess(true));
  } catch (error) {
    yield put(deleteBasisFailure(error));
  }
}

export function* onLoadAllBasises() {
  yield takeLatest(BASISES_ACTION_TYPES.LOAD_ALL_BASISES_START, loadAllBasises);
}

function* onCreateBasis() {
  yield takeLatest(BASISES_ACTION_TYPES.CREATE_BASIS_START, createBasis);
}

function* onUpdateBasis() {
  yield takeLatest(BASISES_ACTION_TYPES.UPDATE_BASIS_START, updateBasis);
}

function* onDeleteBasis() {
  yield takeLatest(BASISES_ACTION_TYPES.DELETE_BASIS_START, deleteBasis);
}

export function* basisSagas() {
  yield all([
    call(onLoadAllBasises),
    call(onCreateBasis),
    call(onUpdateBasis),
    call(onDeleteBasis),
  ]);
}
