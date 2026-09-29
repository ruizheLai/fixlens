import { CASE_STATUS_LABELS } from "../../data/casePresentation";
import type { CaseStatus } from "../../types/case";

export function PMStatus({ status }: { status: CaseStatus }) {
  return <span className={`pm-status pm-status-${status}`}><span aria-hidden="true">●</span> {CASE_STATUS_LABELS[status]}</span>;
}
export function pmDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
export function PMReadState({ error, retry }: { error: boolean; retry: () => void }) {
  return <div className="pm-card pm-read-state" role={error ? "alert" : "status"}>{error ? <><p>We couldn't load this information. Please try again.</p><button className="pm-button" onClick={retry}>Retry</button></> : "Loading cases…"}</div>;
}
