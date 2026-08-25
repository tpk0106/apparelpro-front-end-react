// Mirrors ApparelPro.WebApi.APIModels.GeneralInventory.OrderGtn* exactly. ASP.NET Core's
// default JSON policy lowercases the first letter of each C# PascalCase property.

export const OrderGtnDirection = {
  GeneralToOrder: "GeneralToOrder",
  OrderToGeneral: "OrderToGeneral",
} as const;

export type OrderGtnDirectionType =
  (typeof OrderGtnDirection)[keyof typeof OrderGtnDirection];

export interface OrderGtnHeaderModel {
  ogtnNumber: string; // allocated by the C# backend
  direction: OrderGtnDirectionType;
  buyerCode: number;
  order: string;
  transactionDate: string; // ISO date (YYYY-MM-DD)
}

export interface OrderGtnLineItemRow {
  storeCode: string;
  itemCode: string;
  unit: string;
  quantity: number;
}

export interface OrderGtnSubmissionPayload {
  header: OrderGtnHeaderModel;
  lines: OrderGtnLineItemRow[];
}

export interface OrderGtnTransferableStockRow {
  storeCode: string;
  itemCode: string;
  description: string;
  unit: string;
  availableBalance: number;
}
