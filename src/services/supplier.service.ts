import { client } from "../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { PaginationData } from "../interfaces/definitions";
import type { Supplier } from "../interfaces/references/Supplier";
import type { SupplierServiceModel } from "../tanstack-hooks/interfaces";

const loadSuppliersLookup = async () => {
  return await client.get<SupplierServiceModel[]>(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.SUPPLIERS_LOOKUP,
  );
};

const loadSuppliers = async (data: PaginationData) => {
  return await client.get(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.GET_BY_PAGINATION,
    {
      params: {
        pageNumber: data.pageIndex,
        pageSize: data.pageSize,
        sortColumn: data.sortColumn,
        sortOrder: data.sortOrder,
        filterColumn: data.filterColumn,
        filterQuery: data.filterQuery,
      },
    },
  );
};

const createNewSupplier = async (newSupplier: Supplier) => {
  return await client.post(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.POST,
    newSupplier,
  );
};

const updateEditSupplier = async (
  supplierCode: number,
  existingSupplier: Supplier,
) => {
  return await client.put(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.PUT,
    existingSupplier,
    {
      params: {
        supplierCode: supplierCode,
      },
    },
  );
};

const removeSupplier = async (supplierCode: number) => {
  return await client.delete(
    APPARELPRO_ENDPOINTS.REFERENCE_SECTION.SUPPLIER.DELETE + supplierCode, // buyercode pass by route
  );
};

export {
  loadSuppliers,
  loadSuppliersLookup,
  createNewSupplier,
  updateEditSupplier,
  removeSupplier,
};
