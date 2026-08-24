// Mirrors ApparelPro.WebApi.Reports.Models.PostOrderCostSheetReportAPIModel exactly.
// Backed by PostOrderCostSheetReportController (api/post-order-cost-sheet-report/details,
// /pdf), which replicates OD_PCOST.PRG's "POST ORDER COST SHEET" report. Buyer and Order
// are both mandatory (legacy exits the screen if either is left empty) - same "scope lock"
// pattern as Cost of Production Report. Percent/Freight/ActualShippedDate mirror legacy's
// own print-time prompts for these values.

export interface PostOrderCostSheetReportScopeContext {
  buyerCode: number;
  order: string;
  percentOfTotalValue: number;
  freightCharges: number;
  actualShippedDate: string | null;
}

export interface PostOrderCostSheetStyle {
  typeCode: number;
  typeName: string;
  styleCode: string;
  unit: string;
  unitPrice: number;
  quantity: number;
}

export interface PostOrderCostSheetSectionQuantity {
  sectionCode: string;
  sectionDescription: string;
  isFinal: boolean;
  quantity: number;
}

export interface PostOrderCostSheetMaterialGroup {
  stockCategoryCode: string;
  stockCategoryDescription: string;
  perPieceCost: number;
  perDozenCost: number;
  totalValue: number;
}

export interface PostOrderCostSheetAdditionalCostGroup {
  additionalCostCode: string;
  additionalCostDescription: string;
  perPieceCost: number;
  perDozenCost: number;
  totalValue: number;
}

export interface PostOrderCostSheetReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  currencyCode: string;
  basisCode: string;
  orderDate: string;
  totalOrderQuantity: number;
  styles: PostOrderCostSheetStyle[];
  averageUnitPrice: number;

  percentOfTotalValue: number;
  freightCharges: number;
  actualShippedDate: string | null;

  deliveryOnDocumentDate: string | null;
  productionStartDate: string | null;

  sectionQuantities: PostOrderCostSheetSectionQuantity[];
  finalSectionQuantity: number;
  totalValueOfSales: number;

  materialGroups: PostOrderCostSheetMaterialGroup[];
  materialsPerPieceCost: number;
  materialsPerDozenCost: number;
  materialsTotalValue: number;

  productionCostPerPiece: number;
  productionCostPerDozen: number;
  productionCostTotalValue: number;

  additionalCostGroups: PostOrderCostSheetAdditionalCostGroup[];
  additionalCostPerPiece: number;
  additionalCostPerDozen: number;
  additionalCostTotalValue: number;

  subContractPerPiece: number;
  subContractPerDozen: number;
  subContractTotalValue: number;

  productionTotalPerPiece: number;
  productionTotalPerDozen: number;
  productionTotalValue: number;

  grandTotalPerPiece: number;
  grandTotalPerDozen: number;
  grandTotalValue: number;

  grossProfit: number;
  financeCharges: number;

  daysUtilised: number;
  averageDayProduction: number;

  netProfit: number;
  netProfitOnSalesPercent: number;
}
