import { useMemo, useState } from "react";
import {
  useGetAllGarmentTypes,
  useGetAllPurchaseOrdersByBuyerCode,
  useGetBuyersQuery,
} from "../../tanstack-hooks/custom-hooks";
import type { Buyer } from "../../interfaces/references/Buyer";

const useGetStyleData = () => {
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  // Fetch Buyers Registry
  const { data: buyerPageData } = useGetBuyersQuery({
    pageIndex: 0,
    pageSize: 999,
    sortColumn: "name",
    sortOrder: "asc",
    filterColumn: null,
    filterQuery: null,
  });

  const buyersList = useMemo<Buyer[]>(
    () => buyerPageData?.items || [],
    [buyerPageData],
  );

  // Cascade Dependent Requests
  const { data: ordersList = [] } = useGetAllPurchaseOrdersByBuyerCode(
    selectedBuyer?.buyerCode ?? 0,
    !!selectedBuyer,
  );

  const { data: globalTypesList = [] } = useGetAllGarmentTypes();

  return {
    buyerPageData,
    buyersList,
    ordersList,
    globalTypesList,
  };
};

export default useGetStyleData;
