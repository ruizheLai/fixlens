import type { CaseDetail, CaseStatus, CaseStatusLabel, CaseUpdate } from "../types/case";

export const CASE_STATUS_LABELS: Record<CaseStatus, CaseStatusLabel> = {
  submitted: "Submitted",
  under_review: "Under review",
  awaiting_approval: "Awaiting approval",
  arranging_repair: "Arranging repair",
  repair_scheduled: "Repair scheduled",
  completed: "Completed",
};

export const CASE_STATUS_COPY: Record<CaseStatus, { title: string; description: string; next: string }> = {
  submitted: { title: "Report submitted", description: "Your report has been received for initial review.", next: "Your property manager will review the report and let you know if more information is needed." },
  under_review: { title: "Under review", description: "Your property manager is reviewing the report.", next: "Your property manager will update the case after reviewing the available information." },
  awaiting_approval: { title: "Awaiting landlord approval", description: "Your property manager has reviewed the report and requested approval from the landlord.", next: "Once approval is received, your property manager will begin arranging the repair." },
  arranging_repair: { title: "Arranging repair", description: "Your property manager is arranging the repair.", next: "Your property manager will share scheduling details when available." },
  repair_scheduled: { title: "Repair scheduled", description: "A repair has been scheduled. Check the case activity for details.", next: "Your property manager will update the case after the repair visit." },
  completed: { title: "Repair completed", description: "The repair has been marked as completed.", next: "No action required." },
};

export function caseHandlerPresentation(detail: CaseDetail) {
  return {
    role: detail.handler?.role === "property_manager" ? "Property manager" : detail.handler?.role === "renter" ? "Renter" : "Case handler",
    name: detail.handler ? [detail.handler.name, detail.handler.agencyName].filter(Boolean).join(" · ") : "Not yet assigned",
  };
}

export function formatActivityTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(timestamp)).toUpperCase();
}

export function caseUpdateTitle(update: CaseUpdate): string {
  const labels: Record<string, string> = {
    submitted: "Report submitted", status_changed: "Status updated", completed: "Repair completed",
    evidence_requested: "More information requested", evidence_submitted: "Evidence submitted",
    review_started: "Review started", repair_scheduled: "Repair scheduled", message: "Case update",
    note: "Case update",
  };
  return labels[update.updateType] ?? "Case update";
}

export function caseStatusMessage(detail: CaseDetail): string {
  // Historical submission/completion text must not override a different current lifecycle.
  const latest = detail.updates[0];
  const relevant = latest && (
    (latest.updateType === "submitted" && detail.status === "submitted") ||
    (latest.updateType === "completed" && detail.status === "completed") ||
    (latest.updateType === "status_changed" && Date.parse(latest.createdAt) === Date.parse(detail.updatedAt))
  );
  return (relevant && latest.message) || CASE_STATUS_COPY[detail.status].description;
}

export function formatCaseDate(timestamp: string, completed: boolean, now = new Date()): string {
  const date = new Date(timestamp);
  const elapsed = now.getTime() - date.getTime();
  if (!completed && elapsed >= 0) {
    if (elapsed < 3600000) return "Just now";
    if (elapsed < 86400000 && date.toDateString() === now.toDateString()) return `${Math.floor(elapsed / 3600000)}h ago`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  }
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(date);
}
