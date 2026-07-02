import type { Style } from "../interfaces/OrderManagement/Style";
import type { Address } from "../interfaces/references/Address";
import type { Basis } from "../interfaces/references/Basis";

interface DeleteAddressPayload {
  buyerCode: number;
  addressId: string;
}

interface UpdateAddressPayload {
  buyerCode: number;
  addressId: string;
  addressToUpdate: Address;
}

interface UpdateBasisPayload {
  code: string;
  basisToUpdate: Basis;
}

interface DeleteBasisPayload {
  code: string;
}

interface UpdateStylePayload {
  styleCode: string;
  styleToUpdate: Style;
}

interface DeleteStylePayload {
  styleCode: string;
}

interface PurchaseOrderPayload {
  buyerCode: number;
  order: string;
}

interface SupplierServiceModel {
  supplierCode: number;
  name: string;
}

export type {
  DeleteAddressPayload,
  UpdateAddressPayload,
  UpdateBasisPayload,
  DeleteBasisPayload,
  DeleteStylePayload,
  UpdateStylePayload,
  PurchaseOrderPayload,
  SupplierServiceModel,
};
