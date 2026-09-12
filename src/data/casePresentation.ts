import type { CaseStatus, CaseStatusLabel } from "../types/case";

export const CASE_STATUS_LABELS: Record<CaseStatus, CaseStatusLabel> = {
  submitted: "Submitted",
  under_review: "Under review",
  awaiting_approval: "Awaiting approval",
  arranging_repair: "Arranging repair",
  repair_scheduled: "Repair scheduled",
  completed: "Completed",
};

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
