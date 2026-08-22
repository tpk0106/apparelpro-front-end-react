// Production Control -> Production Progress Graph, PR_PROG.PRG.

export interface ProductionProgressPoint {
  dayNumber: number;
  cumulativeQuantity: number;
}

export interface ProductionProgressReport {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  styleCode: string;
  finalSectionCode: string;
  finalSectionDescription: string;
  estimatedSeries: ProductionProgressPoint[];
  actualSeries: ProductionProgressPoint[];
}
