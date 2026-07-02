import { AddressType } from "../definitions";

export interface Address {
  addressId: string;
  id: number;
  streetAddress: string | null;
  city: string | null;
  postCode: string | null;
  state: string | null;
  countryCode: string | null;
  // country: string | null;
  addressType: AddressType;
  default: boolean;
  buyerCode: number;
}
