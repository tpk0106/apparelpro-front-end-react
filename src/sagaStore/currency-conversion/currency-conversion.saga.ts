import { Action, PayloadAction } from "@reduxjs/toolkit";
import { PaginationData } from "../../defs/defs";
import { CurrencyConversion } from "../../interfaces/references/CurrencyConversion";
import {
  all,
  call,
  CallEffect,
  put,
  PutEffect,
  takeLatest,
} from "redux-saga/effects";

import { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import {
  createCurrencyConversionFailure,
  createCurrencyConversionSuccess,
  deleteCurrencyConversionFailure,
  deleteCurrencyConversionSuccess,
  loadAllCurrencyConversionsFailure,
  loadAllCurrencyConversionsSuccess,
  updateCurrencyConversionFailure,
  updateCurrencyConversionSuccess,
} from "./currency-conversion.action";
import {
  createNewCurrencyConversion,
  loadCurrencyConversions,
  removeCurrencyConversion,
  updateEditCurrencyConversion,
} from "../../services/currency-conversion.service";
import { CURRENCY_CONVERSIONS_ACTION_TYPES } from "./currency-conversion.types";

export function* loadAllCurrencyConversions(
  action: PayloadAction<PaginationData>,
): Generator<
  CallEffect<PaginationAPIModel<CurrencyConversion>> | PutEffect<Action>,
  void,
  PaginationAPIModel<CurrencyConversion>
> {
  try {
    const { payload } = action;
    const suppliers: PaginationAPIModel<CurrencyConversion> = yield call(
      loadCurrencyConversions,
      payload,
    );

    yield put(
      loadAllCurrencyConversionsSuccess({
        ...suppliers,
        filterColumn: payload.filterColumn,
        filterOrder: payload.filterQuery,
        sortColumn: payload.sortColumn,
        sortOrder: payload.sortOrder,
        currentPage: payload.pageNumber,
      }),
    );
  } catch (error) {
    yield put(loadAllCurrencyConversionsFailure(error));
  }
}

export function* CreateCurrencyConversion(
  action: PayloadAction<CurrencyConversion>,
): Generator<CallEffect | PutEffect, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewCurrencyConversion, payload);
    yield put(createCurrencyConversionSuccess(true));
  } catch (error) {
    yield put(createCurrencyConversionFailure(error));
  }
}

export function* updateCurrencyConversion(
  action: PayloadAction<CurrencyConversion>,
): Generator<CallEffect | PutEffect<Action>, void, void> {
  try {
    const { payload } = action;
    yield call(
      updateEditCurrencyConversion,
      payload.fromCurrency,
      payload.toCurrency,
      payload,
    );
    yield put(updateCurrencyConversionSuccess(true));
  } catch (error) {
    yield put(updateCurrencyConversionFailure(error));
  }
}

type deleteCurrencyConversionParams = {
  fromCurrency: string;
  toCurrency: string;
};

export function* deleteCurrencyConversion(
  action: PayloadAction<deleteCurrencyConversionParams>,
): Generator<CallEffect | PutEffect<Action>, void, boolean> {
  try {
    const { payload } = action;
    const { fromCurrency, toCurrency } = payload;
    yield call(removeCurrencyConversion, fromCurrency, toCurrency);
    yield put(deleteCurrencyConversionSuccess(true));
  } catch (error) {
    yield put(deleteCurrencyConversionFailure(error));
  }
}

export function* onLoadAllCurrencyConversions() {
  yield takeLatest(
    CURRENCY_CONVERSIONS_ACTION_TYPES.LOAD_ALL_CURRENCY_CONVERSIONS_START,
    loadAllCurrencyConversions,
  );
}

export function* onCreateCurrencyConversion() {
  yield takeLatest(
    CURRENCY_CONVERSIONS_ACTION_TYPES.CREATE_CURRENCY_CONVERSION_START,
    CreateCurrencyConversion,
  );
}

export function* onUpdateCurrencyConversion() {
  yield takeLatest(
    CURRENCY_CONVERSIONS_ACTION_TYPES.UPDATE_CURRENCY_CONVERSION_START,
    updateCurrencyConversion,
  );
}

export function* onDeleteCurrencyConversion() {
  yield takeLatest(
    CURRENCY_CONVERSIONS_ACTION_TYPES.DELETE_CURRENCY_CONVERSION_START,
    deleteCurrencyConversion,
  );
}

export function* CurrencyConversionSagas() {
  yield all([
    call(onLoadAllCurrencyConversions),
    call(onCreateCurrencyConversion),
    call(onUpdateCurrencyConversion),
    call(onDeleteCurrencyConversion),
  ]);
}
