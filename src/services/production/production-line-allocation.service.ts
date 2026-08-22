import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type {
  ManualAllocateProductionLine,
  AutomaticAllocateProductionLine,
} from "../../interfaces/production/ProductionLineAllocation";

const loadAllocationsByShipment = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
  shipmentOrder: string,
) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE_ALLOCATION.GET_BY_SHIPMENT,
    { params: { buyerCode, order, typeCode, styleCode, shipmentOrder } },
  );
};

const loadAllocationsByLine = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
  lineCode: string,
) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE_ALLOCATION.GET_BY_LINE,
    { params: { buyerCode, order, typeCode, styleCode, lineCode } },
  );
};

const manualAllocate = async (payload: ManualAllocateProductionLine) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE_ALLOCATION.MANUAL,
    payload,
  );
};

const automaticAllocate = async (payload: AutomaticAllocateProductionLine) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE_ALLOCATION.AUTOMATIC,
    payload,
  );
};

const deleteAllocation = async (
  buyerCode: number,
  order: string,
  typeCode: number,
  styleCode: string,
  shipmentOrder: string,
  lineCode: string,
) => {
  return await client.delete(APPARELPRO_ENDPOINTS.REFERENCE_SECTION.PRODUCTION_LINE_ALLOCATION.DELETE, {
    params: { buyerCode, order, typeCode, styleCode, shipmentOrder, lineCode },
  });
};

export { loadAllocationsByShipment, loadAllocationsByLine, manualAllocate, automaticAllocate, deleteAllocation };
