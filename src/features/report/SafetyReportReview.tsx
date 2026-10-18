import Btn from "../../components/common/Btn";
import ScreenHeader from "../../components/common/ScreenHeader";
import SafetyNotice from "../../components/common/SafetyNotice";
import { SAFETY_EVIDENCE_NOTE } from "../../data/reportSafety";
import type { MaintenanceReportInput } from "../../types/report";
import { useReportViewport } from "./useReportViewport";
export default function SafetyReportReview({ report, submitting, error, onSubmit, onBack }: { report: MaintenanceReportInput; submitting: boolean; error: string; onSubmit: () => void; onBack?: () => void }) {
  const ref = useReportViewport();
  return <div ref={ref} className="fixlens-visual report-experience flex flex-col h-full min-h-0 min-w-0">
    <ScreenHeader title="Safety Report Review" onBack={!submitting ? onBack : undefined} />
    <div className="report-conversation flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <SafetyNotice response={report.safetyResponse} noPhotos />
      <div className="report-info-card rounded-2xl overflow-hidden shrink-0" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        {[["Issue type",report.issueType],["Location",report.location],["Observed condition / summary",report.condition],["Original description",report.description],["Safety response",report.safetyResponse],["Evidence",SAFETY_EVIDENCE_NOTE]].map(([label,value]) => <div key={label} className="report-field px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)", fontSize: 13, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}><p style={{ color: "var(--color-muted)", fontSize: 11 }}>{label}</p><p>{value || "Not provided"}</p></div>)}
      </div>
      {error && <p role="alert" style={{ fontSize: 13 }}>{error}</p>}
      <div className="shrink-0"><Btn disabled={submitting} onClick={onSubmit}>{submitting ? "Submitting…" : error ? "Retry" : "Submit report"}</Btn></div>
    </div>
  </div>;
}
