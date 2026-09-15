import {
  call,
  type CallEffect,
  put,
  all,
  takeLatest,
  type PutEffect,
} from "redux-saga/effects";
import type { AnyAction } from "redux-saga";

import type { PayloadAction } from "@reduxjs/toolkit";

import type { Bank } from "../../interfaces/references/Bank";

import {
  createBankFailure,
  createBankSuccess,
  deleteBankFailure,
  deleteBankSuccess,
  loadAllBanksFailed,
  loadAllBanksSuccess,
  updateBankFailure,
  updateBankSuccess,
} from "./bank.action";
import {
  loadBanks,
  createNewBank,
  deleteBank,
  updateEditBank,
} from "../../services/references/bank.service";
import type { PaginationData } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { BANK_ACTION_TYPES } from "./bank.types";
import { handleApiError } from "../../utils/errorHandler";
import { toast } from "react-toastify";

export function* LoadAllBanks(
  action: PayloadAction<PaginationData>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;

    const data: PaginationAPIModel<Bank> = (yield call(
      loadBanks,
      payload,
    )) as PaginationAPIModel<Bank>;

    yield put(loadAllBanksSuccess(data));
  } catch (error) {
    yield put(loadAllBanksFailed(error));
  }
}

export function* createBank(
  action: PayloadAction<Bank>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    yield call(createNewBank, payload);
    yield put(createBankSuccess(true));
  } catch (error) {
    yield put(createBankFailure(error));
  }
}

export function* updateBank(
  action: PayloadAction<Bank>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateEditBank, payload.bankCode, payload);

    yield put(updateBankSuccess(true));
  } catch (error) {
    yield put(updateBankFailure(error));
  }
}

export function* deleteBankSaga(
  action: PayloadAction<string>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const bankCode = action.payload;
    if (!bankCode) {
      toast.error("Cannot delete this bank - its code is missing.", {
        position: "top-right",
        autoClose: 5000,
      });
      yield put(deleteBankFailure("Missing bank code"));
      return;
    }

    yield call(deleteBank, bankCode);

    yield put(deleteBankSuccess(bankCode));
    toast.success("Bank deleted successfully", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error) {
    handleApiError(error);
    yield put(deleteBankFailure(error));
  }
}

function* onLoadAllBanks() {
  yield takeLatest(BANK_ACTION_TYPES.LOAD_ALL_BANKS_START, LoadAllBanks);
}

function* onCreateBank() {
  yield takeLatest(BANK_ACTION_TYPES.CREATE_BANK_START, createBank);
}

function* onUpdateBank() {
  yield takeLatest(BANK_ACTION_TYPES.UPDATE_BANK_START, updateBank);
}

function* onDeleteBank() {
  yield takeLatest(BANK_ACTION_TYPES.DELETE_BANK_START, deleteBankSaga);
}

export function* bankSagas() {
  yield all([
    call(onLoadAllBanks),
    call(onCreateBank),
    call(onUpdateBank),
    call(onDeleteBank),
  ]);
}
