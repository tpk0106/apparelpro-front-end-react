import type { PaginationData } from "../../interfaces/definitions";
import type { CreateBuyerAPIModel } from "../../interfaces/definitions";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import type { Buyer } from "../../interfaces/references/Buyer";
import { createAction } from "../../utils/reducer/reducer.utils";
import { BUYERS_ACTION_TYPES } from "./buyer.types";

const loadAllBuyersStart = ({ ...pagination }: PaginationData) => {
  return createAction(BUYERS_ACTION_TYPES.LOAD_ALL_BUYERS_START, pagination);
};

const loadAllBuyersSuccess = (buyers: PaginationAPIModel<Buyer>) => {
  return createAction(BUYERS_ACTION_TYPES.LOAD_ALL_BUYERS_SUCCESS, buyers);
};

const loadAllBuyersFailure = (error: unknown) => {
  return createAction(BUYERS_ACTION_TYPES.LOAD_ALL_BUYERS_FAILURE, error);
};

const updateBuyerStart = (buyerToEdit: Buyer) => {
  return createAction(BUYERS_ACTION_TYPES.UPDATE_BUYER_START, buyerToEdit);
};

const updateBuyerSuccess = (success: boolean) => {
  return createAction(BUYERS_ACTION_TYPES.UPDATE_BUYER_SUCCESS, success);
};

const updateBuyerFailure = (error: unknown) => {
  return createAction(BUYERS_ACTION_TYPES.UPDATE_BUYER_FAILURE, error);
};

const createBuyerStart = ({ ...createBuyerAPIModel }: CreateBuyerAPIModel) => {
  return createAction(
    BUYERS_ACTION_TYPES.CREATE_BUYER_START,
    createBuyerAPIModel,
  );
};

const createBuyerSuccess = (success: boolean) => {
  return createAction(BUYERS_ACTION_TYPES.CREATE_BUYER_SUCCESS, success);
};

const createBuyerFailure = (error: unknown) => {
  return createAction(BUYERS_ACTION_TYPES.CREATE_BUYER_FAILURE, error);
};

const deleteBuyerStart = (buyerCode: number) => {
  return createAction(BUYERS_ACTION_TYPES.DELETE_BUYER_START, buyerCode);
};

const deleteBuyerSuccess = (success: boolean) => {
  return createAction(BUYERS_ACTION_TYPES.DELETE_BUYER_SUCCESS, success);
};

const deleteBuyerFailure = (error: unknown) => {
  return createAction(BUYERS_ACTION_TYPES.DELETE_BUYER_FAILURE, error);
};

export {
  loadAllBuyersStart,
  loadAllBuyersSuccess,
  loadAllBuyersFailure,
  updateBuyerStart,
  updateBuyerSuccess,
  updateBuyerFailure,
  createBuyerStart,
  createBuyerSuccess,
  createBuyerFailure,
  deleteBuyerStart,
  deleteBuyerSuccess,
  deleteBuyerFailure,
};
