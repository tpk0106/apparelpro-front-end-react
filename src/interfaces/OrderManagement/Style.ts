export interface Style {
  id: number;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  orderDate: Date;
  unit: string;
  quantity: number;
  unitPrice: number;
  sizeRatio: string;
  colorRatio: string;
  exportBalance: number;
  supplierReturn: number;
  customerReturn: number;
  username: string;
  approvedDate: Date | null;
  productionEndDate: Date | null;
  estimateApprovalDate: Date | null;
  estimateApprovalUserName: string;
  exported: boolean;
}
