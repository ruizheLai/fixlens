// Primary lifecycle only; evidence requests and action badges are separate.
export type CaseStatus =
  | "submitted"
  | "under_review"
  | "awaiting_approval"
  | "arranging_repair"
  | "repair_scheduled"
  | "completed";

export type CaseStatusLabel = {
  submitted: "Submitted";
  under_review: "Under review";
  awaiting_approval: "Awaiting approval";
  arranging_repair: "Arranging repair";
  repair_scheduled: "Repair scheduled";
  completed: "Completed";
}[CaseStatus];

// Existing visual variants, not persisted case statuses.
export type StatusPillStatus = "awaiting" | "action" | "completed" | "review" | "submitted";

// Current display-only activity rows; these are not backend CaseUpdate records.
export interface CaseActivityItem {
  time: string;
  title: string;
  desc: string;
  date?: string;
}
