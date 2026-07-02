import { createSelector } from "reselect";

import { useGetPurchaseOrder } from "../../data/custom-hooks/apparel-pro.repository.hooks";
import { useSelector } from "react-redux";
import { PurchaseOrder } from "../../interfaces/OrderManagement/PurchaseOrder";
import { PO } from "../../defs/defs";

export const selectOrder = createSelector(
  [(state: { order: { po: PurchaseOrder } }) => state.order],
  (order) => order.po,
);

export const SelectOrder = (po: PO) => {
  console.log("prior to calling useGetPurchaseOrder:----->", po);

  useGetPurchaseOrder({ ...po });
  console.log("after calling selector :----->", po);
  const selector = useSelector(selectOrder);
  console.log("RETURN selector PO", selector);
  return selector;
};
