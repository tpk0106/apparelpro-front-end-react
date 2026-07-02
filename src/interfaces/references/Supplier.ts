import { Address } from "./Address";

export type Supplier = {
  supplierCode: number;
  name: string;
  telephoneNos: string;
  mobileNos: string;
  fax: string;
  addressId: string;
  addresses: Address[];
};
