import { AddressType } from "../definitions";

export interface SignupFormData {
  knownAs: string;
  email: string;
  password?: string; // Optional during edits
  confirmPassword?: string; // Optional during edits
  gender: number;
  dateOfBirth: string; // Enforced as string for the HTML5 input element
  phoneNumber: string | null;
  userName: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  postCode: string | null;
  countryCode: string | null;
  addressType: number;
  default: boolean;
  photo: string | null;
  address?: {
    addressId: string;
    streetAddress: string;
    city: string;
    postCode: string;
    state: string;
    countryCode: string;
    addressType: AddressType;
    country: string;
  } | null;
}
