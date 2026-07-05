import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { POParameters } from "../interfaces/definitions";
import type PurchaseOrder from "../interfaces/OrderManagement/PurchaseOrder";

const loadPurchaseOrdersByBuyerCode = async (buyerCode: number) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PO.GET_ALL_POS_BY_BUYER_CODE,
    {
      params: {
        buyerCode: buyerCode,
      },
    },
  );
};

const loadPurchaseOrder = async (po: POParameters) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PO.GET_PO_BY_BUYER_AND_ORDER,
    {
      params: {
        buyer: po.buyerCode,
        order: po.order,
      },
    },
  );
};

const createNewPO = async (newPO: PurchaseOrder) => {
  console.log("po service :", newPO);

  const res = await client.post(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.PO.POST,
    newPO,
  );
  console.log(res);
  return res;
};

export { loadPurchaseOrder, createNewPO, loadPurchaseOrdersByBuyerCode };
