export interface StylewiseEventRow {
  id: number;
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventCode: string;
  description: string;
  scheduledDate: string | null; // Transported as ISO string dates or null
  actualDate: string | null;
  remarks: string | null;
  milestoneStatus: string; // "No Scheduled Date", "Actual Date Pending", or "** OK **"

  // ADD THESE TWO OPTIONAL PROPERTIES TO PROPERLY MATCH THE BACKEND:
  approvedByUserId?: string | null;
  approvedDate?: string | null;
}

export interface UpdateEventLinePayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventCode: string;
  scheduledDate: string | null;
  actualDate: string | null;
  remarks: string | null;
}

export interface AddCustomEventLinePayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventCode: string;
  scheduledDate: string | null;
  actualDate: string | null;
  remarks: string | null;
}

export interface DeleteEventLineParams {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  eventCode: string;
}

// Open stylewise-events.types.ts and append this explicit mapping schema context contract:
export interface SelectedHeaderContext {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  currentUser?: string;
}

// Append this payload contract definition right alongside your existing milestone types
export interface StyleApprovalPayload {
  buyerCode: number;
  order: string;
  typeCode: number;
  styleCode: string;
  approvedByUserId: string;
  approvalDate: string; // ISO Date string format (YYYY-MM-DD)
}

// export interface StyleEventsChecklistResponse {
//   isApproved: boolean;
//   approvedByUserId: string | null;
//   approvedDate: string | null;
//   items: StylewiseEventRow[];
// }

// Your existing definitions for StylewiseEventRow, UpdateEventLinePayload, etc., continue perfectly unchanged!
