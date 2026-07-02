import type { AddressType } from "../definitions";
import type { Address } from "../references/Address";

export interface User {
  knownAs: string;
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  gender: number;
  dateOfBirth: Date;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  postCode: string | null;
  state: string | null;
  addressType: AddressType;
  countryCode: string | null;
  default: boolean;
  profilePhoto: BinaryType | null;
  address: Address | null;
}
