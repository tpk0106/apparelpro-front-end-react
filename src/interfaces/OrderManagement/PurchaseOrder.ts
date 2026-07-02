export default interface PurchaseOrder {
  buyerCode: number;
  order: string;
  // description: string;
  countryCode: string;
  orderDate: Date;
  garmentType: number;
  unitCode: string;
  totalQuantity: number;
  currencyCode: string;
  season: string;
  basisCode: string;
  basisValue: number;
}
