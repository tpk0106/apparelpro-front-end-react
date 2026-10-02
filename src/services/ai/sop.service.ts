// ═══════════════════════════════════════════════════════════════════════════
//  sop.service.ts — Axios Service Functions for SOP Admin CRUD
//  Location: src/services/ai/sop.service.ts
// ═══════════════════════════════════════════════════════════════════════════
//
// 🎓 WHAT IS THIS FILE?
// Axios HTTP functions for the SOP Admin CRUD feature.
// These call the SopController endpoints on the backend.
//
// 🎓 PATTERN:
// Follows the same pattern as bank.service.ts:
//   • Each function wraps a single HTTP call using the authenticated `client`
//   • Uses APPARELPRO_ENDPOINTS constants for URL paths
//   • Returns raw AxiosResponse — TanStack hooks unwrap .data
//
// 🎓 WHY A SEPARATE SERVICE FILE?
// Separation of Concerns (SoC) from the clipper-migration skill:
//   • Service layer → HTTP calls (this file)
//   • TanStack hooks → cache management, mutations, loading states
//   • Component layer → UI rendering
// ═══════════════════════════════════════════════════════════════════════════

import { client } from "../../auth/axiosClient";
import { APPARELPRO_ENDPOINTS } from "../../api/api-configurations";
import type { PaginationData } from "../../interfaces/definitions";

// ─────────────────────────────────────────────────────────────────────
//  TypeScript Interfaces (matching SopAPIModel.cs on the backend)
// ─────────────────────────────────────────────────────────────────────

// 🎓 Read model — returned by GET endpoints.
// Matches SopAPIModel in ApparelPro.WebApi/APIModels/AI/SopAPIModel.cs
export interface SopApiModel {
  sopId: number;
  sopCode: string;
  title: string;
  description: string;
  fullText: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  effectiveFrom: string; // 🎓 ISO date string from JSON serialisation
  effectiveTo: string | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  sopApplicabilities: SopApplicabilityApiModel[];
}

// 🎓 Read model for applicability rules — nested inside SopApiModel.
export interface SopApplicabilityApiModel {
  sopApplicabilityId: number;
  sopId: number;
  applicabilityType: string;
  applicabilityKey: string;
  isExcluded: boolean;
}

// 🎓 Create model — sent in POST /api/sop.
// Matches CreateSopAPIModel on the backend.
// No sopId (auto-generated), no audit fields (server sets them).
export interface CreateSopApiModel {
  sopCode: string;
  title: string;
  description: string;
  fullText: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  sopApplicabilities: CreateSopApplicabilityApiModel[];
}

// 🎓 Child create model for applicability rules.
export interface CreateSopApplicabilityApiModel {
  applicabilityType: string;
  applicabilityKey: string;
  isExcluded: boolean;
}

// 🎓 Update model — sent in PUT /api/sop.
// Matches UpdateSopAPIModel on the backend.
// Includes sopId for identification.
export interface UpdateSopApiModel {
  sopId: number;
  sopCode: string;
  title: string;
  description: string;
  fullText: string;
  category: string;
  isActive: boolean;
  displayOrder: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  sopApplicabilities: CreateSopApplicabilityApiModel[];
}

// ─────────────────────────────────────────────────────────────────────
//  Service Functions
// ─────────────────────────────────────────────────────────────────────

// 🎓 GET /api/sop/list — paginated list of SOPs.
// Uses the same PaginationData pattern as bank.service.ts.
const loadSops = async (data: PaginationData) => {
  return await client.get(APPARELPRO_ENDPOINTS.AI.SOP.LIST, {
    params: {
      pageNumber: data.pageIndex,
      pageSize: data.pageSize,
      sortColumn: data.sortColumn,
      sortOrder: data.sortOrder,
      filterColumn: data.filterColumn,
      filterQuery: data.filterQuery,
    },
  });
};

// 🎓 GET /api/sop/{id} — single SOP with nested applicability rules.
const loadSopById = async (sopId: number) => {
  return await client.get<SopApiModel>(
    `${APPARELPRO_ENDPOINTS.AI.SOP.BASE}/${sopId}`,
  );
};

// 🎓 POST /api/sop — create a new SOP + applicability rules.
// CreatedBy is set server-side from the JWT token.
const createSop = async (newSop: CreateSopApiModel) => {
  return await client.post(APPARELPRO_ENDPOINTS.AI.SOP.BASE, newSop);
};

// 🎓 PUT /api/sop — update an existing SOP + replace applicability rules.
// ModifiedBy is set server-side from the JWT token.
const updateSop = async (updatedSop: UpdateSopApiModel) => {
  return await client.put(APPARELPRO_ENDPOINTS.AI.SOP.BASE, updatedSop);
};

// 🎓 DELETE /api/sop/{id} — soft delete (sets IsActive = false).
const deleteSop = async (sopId: number) => {
  return await client.delete(`${APPARELPRO_ENDPOINTS.AI.SOP.BASE}/${sopId}`);
};

export { loadSops, loadSopById, createSop, updateSop, deleteSop };
