// Mirrors ApparelPro.WebApi.Reports.Models.PendingEventsReportAPIModel (and its nested
// classes) exactly. ASP.NET Core's default JSON policy lowercases the first letter of
// each C# PascalCase property, so BuyerCode -> buyerCode, etc.
//
// Backed by PendingEventsReportController (api/pending-events-report/details, /pdf),
// which replicates OD_EVPND.PRG's "PENDING EVENTS" report. As Of Date is mandatory,
// matching the legacy screen's own "empty -> exit" check.

export interface PendingEventsReportScopeContext {
  asOfDate: string; // yyyy-MM-dd
}

export interface PendingEventRow {
  eventCode: string;
  description: string;
  scheduledDate: string | null; // ISO date string (nullable on the wire)
  remarks: string | null;
  delayDays: number | null;
}

export interface PendingEventStyleGroup {
  buyerCode: number;
  buyerName: string;
  order: string;
  typeCode: number;
  typeName: string;
  styleCode: string;
  events: PendingEventRow[];
}

export interface PendingEventsReport {
  asOfDate: string;
  groups: PendingEventStyleGroup[];
}
