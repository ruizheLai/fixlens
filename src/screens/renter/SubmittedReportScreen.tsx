import { Navigate } from "react-router-dom";
import SafetyNotice from "../../components/common/SafetyNotice";
import { isSafetyReport } from "../../data/reportSafety";
import { getCaseByKey } from "../../services/cases";
import type { CaseDetail } from "../../types/case";
import { demoCaseReference } from "../../data/demo/cases";
import { formatActivityTime } from "../../data/casePresentation";
import { useEffect, useState } from "react";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight } from "../../components/common/icons";
import { getReportPhotos } from "../../services/evidence";
import type { StoredPhoto } from "../../types/evidence";
import StoredPhotoView from "../../components/capture/StoredPhotoView";

export default function SubmittedReportScreen({ caseKey, onBack }: { caseKey: string; onBack: () => void }) {
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    Promise.all([getCaseByKey(caseKey, controller.signal), getReportPhotos(caseKey, controller.signal)]).then(([item, evidence]) => {
      if (controller.signal.aborted) return;
      setDetail(item); setPhotos(evidence); setState("ready");
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
  return <SubmittedReportContent key={detail.caseKey} detail={detail} photos={photos} onBack={onBack} />;
}

function SubmittedReportContent({ detail, photos, onBack }: { detail: CaseDetail; photos: StoredPhoto[]; onBack: () => void }) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Submitted Report" subtitle={`${detail.title} · ${demoCaseReference(detail.caseKey)}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <SafetyNotice response={detail.safetyResponse} noPhotos={photos.length === 0} />

        {/* Submitted badge */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status="submitted" />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Submitted {new Date(detail.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })} · {formatActivityTime(detail.createdAt)}</span>
        </div>

        {/* Report fields — read-only */}
        <div className="rounded-2xl overflow-hidden shrink-0" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
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

        <div className="shrink-0">
          <SectionLabel>Evidence</SectionLabel>
          {photos.length === 0 && !isSafetyReport(detail.safetyResponse) && <p style={{ fontSize: 13, color: "var(--color-muted)" }}>No evidence available for this report.</p>}
          {photos.length > 0 && <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {photos.map((photo, i) => {
              const label = photo.role === "overview" ? "Overview photo" : "Close-up photo";
              return <div key={photo.id}>
                <button onClick={() => setExpandedEvidence(expandedEvidence === photo.id ? null : photo.id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left active:opacity-70" style={{ borderBottom: expandedEvidence === photo.id || i < photos.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 52, height: 40, background: "#1a1a2a" }}><StoredPhotoView photo={photo} label={label} thumbnail /></div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{label}</p>
                      <p style={{ fontSize: 12, color: "var(--color-success)" }}>{photo.metadata.annotations.length ? "Annotated" : "Photo"}</p>
                    </div>
                  </div>
                  <IcoChevRight />
                </button>
                {expandedEvidence === photo.id && <div style={{ background: "#000", height: 220 }}><StoredPhotoView photo={photo} label={label + " full image"} /></div>}
              </div>;
            })}
          </div>}
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
