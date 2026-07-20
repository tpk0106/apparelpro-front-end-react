import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import { client } from "../auth/axiosClient";
import type { PaginationData } from "../interfaces/definitions";
import type { Style } from "../interfaces/OrderManagement/Style";
import type { PaginationAPIModel } from "../interfaces/references/ApiResult";

const loadStylesByScope = async (params: {
  buyerCode: number;
  order: string;
  typeCode: number;
}) => {
  return await client.get<Style[]>(
    `${APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.GET_STYLE_DETAILS_BY_BUYER_AND_ORDER_AND_TYPE}/${params.buyerCode}/${params.order}/${params.typeCode}`,
  );
};

// Styles scoped to buyer/order (matches legacy OD_STY1.PRG: seek xbuy_cd+xord_no,
// copy whil buyer+order = xbuy_cd+xord_no). Used by the Order Confirmation Styles grid.
const loadStylesByBuyerOrder = async (
  buyerCode: number,
  order: string,
  data: PaginationData,
) => {
  return await client.get<PaginationAPIModel<Style>>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS
      .GET_STYLE_DETAILS_BY_BUYER_AND_ORDER,
    {
      params: {
        buyerCode,
        order,
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const loadStyles = async (data: PaginationData) => {
  console.log("bank service started ", data);
  return await client.get(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.GET_BY_PAGINATION,
    {
      params: {
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const createNewStyle = async (newStyle: Style) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.POST,
    newStyle,
  );
};

const deleteStyle = async (styleCode: string) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.DELETE,
    {
      params: { styleCode: styleCode },
    },
  );
};

const updateEditStyle = async (styleCode: string, existingStyle: Style) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.PUT,
    existingStyle,
    {
      params: {
        styleCode: styleCode,
      },
    },
  );
};
export {
  loadStyles,
  loadStylesByScope,
  loadStylesByBuyerOrder,
  createNewStyle,
  updateEditStyle,
  deleteStyle,
};
