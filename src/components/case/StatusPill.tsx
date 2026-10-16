import type { CaseStatus, StatusPillStatus } from "../../types/case";
import { CASE_STATUS_LABELS } from "../../data/casePresentation";

export default function StatusPill({ status }: { status: StatusPillStatus | CaseStatus }) {
  const map = {
    awaiting: { label: CASE_STATUS_LABELS.awaiting_approval, bg: "var(--color-amber-light)",  color: "var(--color-amber-text)" },
    awaiting_approval: { label: CASE_STATUS_LABELS.awaiting_approval, bg: "var(--color-amber-light)", color: "var(--color-amber-text)" },
    under_review: { label: CASE_STATUS_LABELS.under_review, bg: "var(--color-blue-light)", color: "var(--color-blue)" },
    arranging_repair: { label: CASE_STATUS_LABELS.arranging_repair, bg: "var(--color-blue-light)", color: "var(--color-blue)" },
    repair_scheduled: { label: CASE_STATUS_LABELS.repair_scheduled, bg: "var(--color-blue-light)", color: "var(--color-blue)" },
    action:   { label: "Action required",   bg: "var(--color-danger-light)", color: "var(--color-danger-text)" },
    completed:{ label: CASE_STATUS_LABELS.completed, bg: "var(--color-success-light)", color: "#166534" },
    review:   { label: CASE_STATUS_LABELS.under_review, bg: "var(--color-blue-light)", color: "var(--color-blue)" },
    submitted:{ label: CASE_STATUS_LABELS.submitted, bg: "var(--color-blue-light)", color: "var(--color-blue)" },
  }[status];
  return (
    <span data-status={status} className="rv-status inline-flex items-center px-2.5 py-1 rounded-full font-semibold" style={{ fontSize: 11, letterSpacing: "0.01em", background: map.bg, color: map.color }}>
      {map.label}
    </span>
  );
}
