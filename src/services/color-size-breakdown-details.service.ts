import type { AxiosResponse } from "axios";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import { client } from "../auth/axiosClient";
import type {
  BulkSaveResponse,
  ColorSizeBreakdownDetailsParams,
} from "../interfaces/definitions";
import type ColorSizeBreakdownDetails from "../interfaces/OrderManagement/ColorSizeDetails";

const loadColorSizeBreakdownDetailsByStyle = async (
  data: ColorSizeBreakdownDetailsParams,
) => {
  console.log("color size details service started ", data);
  return await client.get(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS
      .GET_COLOR_SIZE_DETAILS_BY_BUYER_AND_ORDER_AND_TYPE_AND_STYLE,
    {
      // use via query
      params: {
        buyerCode: data.buyerCode,
        order: data.order,
        typeCode: data.typeCode,
        styleCode: data.styleCode,
      },
    },
  );
};

const createNewColorSizeBreakdownDetails = async (
  params: ColorSizeBreakdownDetailsParams,
  payload: ColorSizeBreakdownDetails[],
): Promise<AxiosResponse<BulkSaveResponse>> => {
  return await client.post<BulkSaveResponse>(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS.POST,
    payload,
    {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};

// const createNewColorSizeBreakdownDetails = async (
//   params: ColorSizeBreakdownDetailsParams,
//   payload: ColorSizeBreakdownDetails[], //ColorSizeBreakdownDetails[],
// ):Promise<AxiosResponse<{ message: string }>> => {
//   // Ensure we are passing a pure, unwrapped array
//   // If your backend doesn't automatically convert camelCase to PascalCase:
//   // Map fields here if your .NET backend requires strict PascalCase

//   // 1. Runtime check: extract array if wrapped inside an object { payload: [...] }
//   const rawArray = Array.isArray(payload)
//     ? payload
//     : payload && Array.isArray(payload.payload)
//       ? payload.payload
//       : null;

//   if (!rawArray) {
//     console.error("Payload is missing or not an array! Received:", payload);
//     throw new Error("Invalid payload format: Expected an array.");
//   }
//   const cleanPayload = rawArray.map((item: any) => ({
//     BuyerCode: item.buyerCode,
//     Order: item.order,
//     TypeCode: item.typeCode,
//     StyleCode: item.styleCode,
//     Color: item.color,
//     Size: item.size,
//     Ratio: item.ratio,
//     Quantity: item.quantity,
//   }));

//   console.log("AT Services Params: ", params);
//   console.log("AT Services Payload: ", payload);
//   console.log("AT Services cleanedPayload: ", cleanPayload);
//   console.log("AT Services rawArray : ", rawArray);

//   return await client.post(
//     APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS.POST,
//     cleanPayload, // Strictly pass the array raw

//     {
//       params: params,
//       // Forces headers to confirm it is clean JSON
//       headers: {
//         "Content-Type": "application/json",
//       },
//     },
//   );

const deleteColorSizeBreakdownDetails = async (
  colorSizeBreakdownDetailsPayload: ColorSizeBreakdownDetailsParams,
) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.COLOR_SIZE_DETAILS.DELETE,
    {
      params: colorSizeBreakdownDetailsPayload,
    },
  );
};

// const updateEditStyle = async (styleCode: string, existingStyle: Style) => {
//   return await client.put(
//     APPARELPRO_ENDPOINTS.ORDER_MANAGEMENT.STYLE_DETAILS.PUT,
//     existingStyle,
//     {
//       params: {
//         styleCode: styleCode,
//       },
//     },
//   );
// };
export {
  loadColorSizeBreakdownDetailsByStyle,
  createNewColorSizeBreakdownDetails,
  deleteColorSizeBreakdownDetails,
};
