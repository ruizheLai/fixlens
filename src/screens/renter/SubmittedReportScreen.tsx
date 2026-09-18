import { Navigate } from "react-router-dom";
import { getCaseByKey } from "../../services/cases";
import type { CaseDetail } from "../../types/case";
import { demoCaseReference } from "../../data/demo/cases";
import { formatActivityTime } from "../../data/casePresentation";
import { useEffect, useState } from "react";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight } from "../../components/common/icons";
import { IMG_BEDROOM_WIDE, IMG_BEDROOM_LIGHT, IMG_DAMAGED_WALL } from "../../data/demo/evidence";

export default function SubmittedReportScreen({ caseKey, onBack }: { caseKey: string; onBack: () => void }) {
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    getCaseByKey(caseKey, controller.signal).then((item) => {
      if (controller.signal.aborted) return;
      setDetail(item); setState("ready");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Submitted report could not be loaded", error instanceof Error ? error.message : "Unknown read failure");
      setState("error");
    });
    return () => controller.abort();
  }, [caseKey, attempt]);
  if (state === "ready" && !detail) return <Navigate to="/cases" replace />;
  if (state !== "ready" || !detail) return <div className="flex flex-col h-full">
    <ScreenHeader title="Submitted Report" onBack={onBack} />
    <div className="flex-1 overflow-y-auto px-5 py-5">
      {state === "loading" ? <p role="status" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading submitted report…</p> :
        <div role="alert" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load this report. Please try again.</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
    </div>
  </div>;
  return <SubmittedReportContent key={detail.caseKey} detail={detail} onBack={onBack} />;
}

function SubmittedReportContent({ detail, onBack }: { detail: CaseDetail; onBack: () => void }) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Submitted Report" subtitle={`${detail.title} · ${demoCaseReference(detail.caseKey)}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Submitted badge */}
        <div className="flex items-center gap-2">
          <StatusPill status="submitted" />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Submitted {new Date(detail.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })} · {formatActivityTime(detail.createdAt)}</span>
        </div>

        {/* Report fields — read-only */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          {[
            { label: "Issue type",        value: detail.issueType },
            { label: "Location",          value: detail.location || "Not provided" },
            { label: "Condition",         value: detail.condition || "Not provided" },
            { label: "Brief description", value: detail.description },
            { label: "Safety",            value: detail.safetyResponse || "Not provided", green: detail.safetyResponse === "No immediate danger reported" },
          ].map((row, i, arr) => (
            <div key={row.label} className="px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{row.label}</p>
              <p style={{ fontSize: 14, color: row.green ? "var(--color-success)" : "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* Bedroom-only prototype imagery, never Supabase evidence records. */}
        <div>
          <SectionLabel>Evidence</SectionLabel>
          {detail.caseKey !== "bedroom-window-leak" && <p style={{ fontSize: 13, color: "var(--color-muted)" }}>No evidence available for this report.</p>}
          {detail.caseKey === "bedroom-window-leak" && <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {[
              { id: "overview",  label: "Overview photo",              note: "Annotated — Leak point marked", src: IMG_BEDROOM_WIDE,  type: "photo" },
              { id: "closeup",   label: "Close-up photo",              note: "Annotated",                     src: IMG_DAMAGED_WALL, type: "photo" },
              { id: "video",     label: "Short video",                 note: "0:04",                          src: IMG_BEDROOM_LIGHT, type: "video" },
            ].map((item, i, arr) => (
              <div key={item.id}>
                <button onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left active:opacity-70" style={{ borderBottom: expandedEvidence === item.id || i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 52, height: 40, background: "#1a1a2a" }}>
                      {item.type !== "video"
                        ? <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--color-success)" }}>{item.note}</p>
                    </div>
                  </div>
                  <IcoChevRight />
                </button>
                {expandedEvidence === item.id && (
                  <div style={{ background: "#000" }}>
                    <img src={item.src} alt={item.label} className="w-full" style={{ maxHeight: 220, objectFit: "cover", opacity: item.type === "video" ? 0.75 : 1 }} />
                  </div>
                )}
              </div>
            ))}
          </div>}
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
