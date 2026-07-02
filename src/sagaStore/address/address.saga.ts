import {
  call,
  takeLatest,
  type CallEffect,
  type PutEffect,
  put,
  all,
} from "redux-saga/effects";
import { ADDRESS_ACTION_TYPES } from "./address.types";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  createNewBuyerAddress,
  // loadAllAddressesForBuyer,
  removeBuyerAddress,
  updateAddress,
} from "../../services/address.serice";
import type { AnyAction } from "redux-saga";

import type { Address } from "../../interfaces/references/Address";
import {
  createBuyerAddressFailure,
  createBuyerAddressSuccess,
  deleteBuyerAddressFailure,
  deleteBuyerAddressSuccess,
  loadAllAddressesForBuyerFailure,
  loadAllAddressesForBuyerSuccess,
  updateBuyerAddressFailure,
  updateBuyerAddressSuccess,
} from "./address.action";
import type { CreateAddressAPIModel } from "../../interfaces/definitions";

//import { CreateAddressAPIModel } from "../../defs/defs";

export function* LoadAllAddressesByAddressId(
  action: PayloadAction<string>,
): Generator<CallEffect | PutEffect<AnyAction>, void, unknown> {
  try {
    const { payload } = action;

    const addresses: Address[] = (yield call(
      loadAllAddressesForBuyer,
      payload,
    )) as Address[];

    yield put(loadAllAddressesForBuyerSuccess(addresses));
  } catch (error) {
    yield put(loadAllAddressesForBuyerFailure(error));
  }
}

function* onLoadAllAddressesByAddressId() {
  yield takeLatest(
    ADDRESS_ACTION_TYPES.LOAD_ADDRESSES_BY_ADDRESSID_START,
    LoadAllAddressesByAddressId,
  );
}

export function* createBuyerAddress(
  action: PayloadAction<CreateAddressAPIModel>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    const { payload } = action;
    //console.log("createBuyerAddress", payload);
    yield call(createNewBuyerAddress, payload);
    yield put(createBuyerAddressSuccess(true));
  } catch (error) {
    yield put(createBuyerAddressFailure(error));
  }
}

export function* updateBuyerAddress(
  action: PayloadAction<Address>,
): Generator<CallEffect | PutEffect<AnyAction>, void, void> {
  try {
    const { payload } = action;
    yield call(updateAddress, payload.addressId, payload);

    yield put(updateBuyerAddressSuccess(true));
  } catch (error) {
    yield put(updateBuyerAddressFailure(error));
  }
}

function* onCreateBuyerAddress() {
  yield takeLatest(
    ADDRESS_ACTION_TYPES.CREATE_ADDRESS_START,
    createBuyerAddress,
  );
}

function* onUpdateBuyerAddress() {
  yield takeLatest(
    ADDRESS_ACTION_TYPES.UPDATE_ADDRESS_START,
    updateBuyerAddress,
  );
}

type deleteBuyerAddressPara = {
  id: number;
  addressId: string;
};

export function* deleteBuyerAddress(
  action: PayloadAction<deleteBuyerAddressPara>,
): Generator<CallEffect | PutEffect<AnyAction>, void, boolean> {
  try {
    console.log("deleteBuyerAddress saga....", action.payload);
    const { id, addressId } = action.payload;
    yield call(removeBuyerAddress, id, addressId);
    yield put(deleteBuyerAddressSuccess(true));
  } catch (error) {
    yield put(deleteBuyerAddressFailure(error));
  }
}

export function* onDeleteBuyerAddress() {
  yield takeLatest(
    ADDRESS_ACTION_TYPES.DELETE_ADDRESS_START,
    deleteBuyerAddress,
  );
}

export function* addressSagas() {
  yield all([
    call(onLoadAllAddressesByAddressId),
    call(onUpdateBuyerAddress),
    call(onCreateBuyerAddress),
    call(onDeleteBuyerAddress),
  ]);
}
