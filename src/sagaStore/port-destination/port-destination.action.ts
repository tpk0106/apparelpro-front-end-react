import type { PaginationData } from "../../interfaces/definitions";
import type { PortDestination } from "../../interfaces/references/PortDestination";
import type { PaginationAPIModel } from "../../interfaces/references/ApiResult";
import { createAction } from "../../utils/reducer/reducer.utils";
import { PORT_DESTINATION_ACTION_TYPES } from "./port-destination.types";

// load
const loadAllPortDestinationsStart = ({ ...pagination }: PaginationData) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_START,
    pagination,
  );
};

const loadAllPortDestinationsSuccess = (
  portDestinations: PaginationAPIModel<PortDestination>,
) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_SUCCESS,
    portDestinations,
  );
};

const loadAllPortDestinationsFailure = (error: unknown) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.LOAD_ALL_PORT_DESTINATIONS_FAILURE,
    error,
  );
};

// create

const createPortDestinationStart = (portDestination: PortDestination) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.CREATE_PORT_DESTINATION_START,
    portDestination,
  );
};

const createPortDestinationsSuccess = (success: boolean) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.CREATE_PORT_DESTINATION_SUCCESS,
    success,
  );
};

const createPortDestinationFailure = (error: unknown) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.CREATE_PORT_DESTINATION_FAILURE,
    error,
  );
};

// update

const updatePortDestinationStart = (portDestinationToEdit: PortDestination) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_START,
    portDestinationToEdit,
  );
};

const updatePortDestinationSuccess = (success: boolean) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_SUCCESS,
    success,
  );
};

const updatePortDestinationFailure = (error: unknown) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.UPDATE_PORT_DESTINATION_FAILURE,
    error,
  );
};

// delete

const deletePortDestinationStart = (id: number, countryCode: string) => {
  //console.log("action :", id, countryCode);
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.DELETE_PORT_DESTINATION_START,
    { id, countryCode },
  );
};

const deletePortDestinationSuccess = (success: boolean) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.DELETE_PORT_DESTINATION_SUCCESS,
    success,
  );
};

const deletePortDestinationFailure = (error: unknown) => {
  return createAction(
    PORT_DESTINATION_ACTION_TYPES.DELETE_PORT_DESTINATION_FAILURE,
    error,
  );
};

export {
  loadAllPortDestinationsStart,
  loadAllPortDestinationsSuccess,
  loadAllPortDestinationsFailure,
  createPortDestinationStart,
  createPortDestinationsSuccess,
  createPortDestinationFailure,
  updatePortDestinationStart,
  updatePortDestinationSuccess,
  updatePortDestinationFailure,
  deletePortDestinationStart,
  deletePortDestinationSuccess,
  deletePortDestinationFailure,
};
