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
import type { GarmentType } from "../../interfaces/references/GarmentType";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { AnyAction } from "redux-saga";
import {
  createGarmentTypeFailure,
  createGarmentTypeSuccess,
  deleteGarmentTypeFailure,
  deleteGarmentTypeSuccess,
  loadAllGarmentTypesFailure,
  loadAllGarmentTypesSuccess,
  updateGarmentTypeFailure,
  updateGarmentTypeSuccess,
} from "./garment-type.action";
import { GARMENT_TYPES_ACTION_TYPES } from "./garment-type.types";
import {
  createNewGarmentType,
  loadGarmentTypes,
  removeGarmentType,
  updateEditGarmentType,
} from "../../services/garment-type.service";

export function* loadAllGarmentTypes(
  action: PayloadAction<PaginationData>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;
    const garmentTypes: PaginationAPIModel<GarmentType> = (yield call(
      loadGarmentTypes,
      payload,
    )) as PaginationAPIModel<GarmentType>;

    console.log("garment type ", garmentTypes);

    yield put(
      loadAllGarmentTypesSuccess({
        ...garmentTypes,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(loadAllGarmentTypesFailure(error));
  }
}

export function* createGarmentType(
  action: PayloadAction<GarmentType>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewGarmentType, payload);
    yield put(createGarmentTypeSuccess(true));
  } catch (error) {
    yield put(createGarmentTypeFailure(error));
  }
}

export function* updateGarmentType(
  action: PayloadAction<GarmentType>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditGarmentType, payload.id, payload);
    yield put(updateGarmentTypeSuccess(true));
  } catch (error) {
    yield put(updateGarmentTypeFailure(error));
  }
}

export function* deleteGarmentType(
  action: PayloadAction<number>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    const id = payload;
    yield call(removeGarmentType, id);
    yield put(deleteGarmentTypeSuccess(true));
  } catch (error) {
    yield put(deleteGarmentTypeFailure(error));
  }
}

export function* onLoadAllGarmentTypes() {
  yield takeLatest(
    GARMENT_TYPES_ACTION_TYPES.LOAD_ALL_GARMENT_TYPES_START,
    loadAllGarmentTypes,
  );
}

function* onCreateGarmentType() {
  yield takeLatest(
    GARMENT_TYPES_ACTION_TYPES.CREATE_GARMENT_TYPE_START,
    createGarmentType,
  );
}

function* onUpdateGarmentType() {
  yield takeLatest(
    GARMENT_TYPES_ACTION_TYPES.UPDATE_GARMENT_TYPE_START,
    updateGarmentType,
  );
}

function* onDeleteGarmentType() {
  yield takeLatest(
    GARMENT_TYPES_ACTION_TYPES.DELETE_GARMENT_TYPE_START,
    deleteGarmentType,
  );
}

export function* garmentTypeSagas() {
  yield all([
    call(onLoadAllGarmentTypes),
    call(onCreateGarmentType),
    call(onUpdateGarmentType),
    call(onDeleteGarmentType),
  ]);
}
