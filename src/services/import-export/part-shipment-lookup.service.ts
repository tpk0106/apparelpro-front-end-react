import { client } from "../../auth/axiosClient";

// Backs the Commercial Invoice line picker (legacy ie_coin1's od_part
// selection list) - every open (undelivered) part shipment balance for a
// buyer, across every order/style. Kept separate from
// order-management/part-shipment.service.ts since that file uses RTK Query,
// while this Import/Export module uses TanStack Query throughout.
const loadOpenPartShipmentsByBuyer = async (buyerCode: number) => {
  return await client.get(`api/part-shipment/open-by-buyer/${buyerCode}`);
};

export { loadOpenPartShipmentsByBuyer };
