// Mirrors ApparelPro.WebApi.Reports.Models.CostOfProductionReportAPIModel (and its
// nested classes) exactly. ASP.NET Core's default JSON policy lowercases the first
// letter of each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by CostOfProductionReportController (api/cost-of-production-report/details,
// /pdf), which replicates OD_FCOST.PRG's "COST OF PRODUCTION" Estimated vs Actual
// profitability analysis. Buyer and Order are both mandatory, matching the legacy
// screen's own "empty -> exit" checks.

export interface CostOfProductionReportScopeContext {
  buyerCode: number;
  order: string;
}

export interface CostOfProductionMaterialLine {
  itemCode: string;
  stockCategoryCode: string;
  stockCategoryDescription: string;
  description: string;
  unit: string;
  quantity: number;
  price: number;
  value: number;
}

export interface CostOfProductionAdditionalCostLine {
  itemCode: string;
  description: string;
  quantityPerGarment: number;
  receivedQuantity: number;
  unit: string;
  pricePerUnit: number;
  cost: number;
}

export interface CostOfProductionAdditionalCostGroup {
  additionalCostCode: string;
  additionalCostDescription: string;
  lines: CostOfProductionAdditionalCostLine[];
  totalCost: number;
}

export interface CostOfProductionSubContractLine {
  subContractorCode: string;
  subContractorName: string;
  costPerGarment: number;
  quantity: number;
  unit: string;
  cost: number;
}

export interface CostOfProductionStyleRevenue {
  typeCode: number;
  styleCode: string;
  unitPrice: number;
  unit: string;
  estimatedQuantity: number;
  estimatedValue: number;
  actualProducedQuantity: number;
  actualProducedValue: number;
  subContractReceivedQuantity: number;
  subContractReceivedValue: number;
}

export interface CostOfProductionLineCost {
  typeCode: number;
  styleCode: string;
  lineCode: string;
  lineDescription: string;
  costPerDay: number;
  estimatedDays: number;
  estimatedCost: number;
  actualDays: number;
  actualCost: number;
}

export interface CostOfProductionReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  currencyCode: string;
  totalOrderQuantity: number;
  unit: string;

  materials: CostOfProductionMaterialLine[];
  totalMaterialsValue: number;
  estimatedMaterialsValue: number;

  additionalCostGroups: CostOfProductionAdditionalCostGroup[];
  totalAdditionalCostValue: number;
  estimatedAdditionalCostValue: number;

  subContracts: CostOfProductionSubContractLine[];
  totalSubContractValue: number;

  styleRevenues: CostOfProductionStyleRevenue[];
  lineCosts: CostOfProductionLineCost[];

  estimatedProfitMargin: number;
  actualProfitMargin: number;
}
