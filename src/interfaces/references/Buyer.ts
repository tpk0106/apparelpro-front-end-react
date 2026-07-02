import type { Address } from "./Address";

export interface Buyer {
  buyerCode: number;
  status: string;
  name: string;
  telephoneNos: string;
  mobileNos: string;
  fax: string;
  addressId: string;
  cusdec: string;
  addresses: Address[];
}
