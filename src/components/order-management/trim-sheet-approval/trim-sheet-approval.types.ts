// Types for the "Approve Trim Sheet" feature (Order Management -> Material
// Consumption -> Approve Trim Sheet). This is a deliberately separate,
// self-contained module from stylewise-events/* even though the underlying
// backend endpoint reuses StyleApprovalService.ApproveStyleEventsAsync - see
// the Workflow Conventions doc entry "Order Approval routine - 'Approve Trim
// Sheet' backend" for why the two concepts are being kept as distinct
// screens/entry points rather than merged.

export interface TrimSheetApprovalScopeContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
}

// Mirrors StyleApprovalDetailsAPIModel (GET api/style-approval/details).
// NOTE ON FIELD NAMES: the backend DTO is named EstimateApprovalUserName /
// EstimateApprovalDate for historical reasons (it is shared with an older
// Style-wise report), but the values it actually carries are the real Trim
// Sheet Approval fields (Style.Username / Style.ApprovedDate) - confirmed in
// StyleApprovalService.GetStyleApprovalDetailsAsync. Kept as-is here to match
// the wire shape rather than introducing a translation layer for a naming-only
// mismatch; approvedByUserId/approvedDate below are the normalized aliases
// this module's components should read from.
export interface StyleApprovalDetails {
  estimateApprovalUserName: string | null;
  estimateApprovalDate: string | null;
}

export interface ApproveTrimSheetPayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  approvedByUserId: string;
  approvalDate: string;
}

export interface ApproveTrimSheetResult {
  success: boolean;
  message: string;
}
