import type { StatusPillStatus } from "../../types/case";

export default function StatusPill({ status }: { status: StatusPillStatus }) {
  const map = {
    awaiting: { label: "Awaiting approval", bg: "var(--color-amber-light)",  color: "var(--color-amber-text)" },
    action:   { label: "Action required",   bg: "var(--color-danger-light)", color: "var(--color-danger-text)" },
    completed:{ label: "Completed",         bg: "var(--color-success-light)", color: "#166534" },
    review:   { label: "Under review",      bg: "var(--color-blue-light)",   color: "var(--color-blue)" },
    submitted:{ label: "Submitted",         bg: "var(--color-blue-light)",   color: "var(--color-blue)" },
  }[status];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-semibold" style={{ fontSize: 11, letterSpacing: "0.01em", background: map.bg, color: map.color }}>
      {map.label}
    </span>
  );
}
