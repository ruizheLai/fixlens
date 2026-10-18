import { Fragment } from "react";
import { caseUpdateTitle, formatActivityTime, formatCaseDate } from "../../data/casePresentation";
import type { CaseUpdate } from "../../types/case";

// The existing two activity treatments, now rendering only recorded updates.
export default function CaseActivity({ updates, completed = false }: { updates: CaseUpdate[]; completed?: boolean }) {
  if (!updates.length) return <p className="px-5 py-4" style={{ fontSize: 13, color: "var(--color-muted)" }}>No activity recorded yet.</p>;
  return <>{updates.map((item, i) => {
    const date = formatCaseDate(item.createdAt, true);
    const newDay = i === 0 || new Date(item.createdAt).toDateString() !== new Date(updates[i - 1].createdAt).toDateString();
    return <Fragment key={item.id}>
      {!completed && newDay && <div className="px-5 py-3" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{date}</p>
      </div>}
      <div className="px-5 py-4" style={{ borderBottom: completed || i < updates.length - 1 ? "1px solid var(--color-border)" : "none" }}>
        <div className="flex items-start gap-3">
          {completed ? <div style={{ minWidth: 60 }}>
            <p className="rv-metadata" style={{ fontSize: 11, color: "var(--color-muted)" }}>{date}</p>
            <p className="rv-metadata" style={{ fontSize: 11, color: "var(--color-muted)" }}>{formatActivityTime(item.createdAt)}</p>
          </div> : <span className="rv-metadata" style={{ fontSize: 12, color: "var(--color-muted)", minWidth: 52, marginTop: 1 }}>{formatActivityTime(item.createdAt)}</span>}
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{caseUpdateTitle(item)}</p>
            {item.message && <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{item.message}</p>}
          </div>
        </div>
      </div>
    </Fragment>;
  })}</>;
}
