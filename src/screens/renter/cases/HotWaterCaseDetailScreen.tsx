import SafetyNotice from "../../../components/common/SafetyNotice";
import { isSafetyReport, SAFETY_EVIDENCE_NOTE } from "../../../data/reportSafety";
import type { CaseDetail } from "../../../types/case";
import CaseActivity from "../../../components/case/CaseActivity";
import RequestedEvidenceGallery from "../../../components/case/RequestedEvidenceGallery";
import { caseStatusMessage, formatCaseDate } from "../../../data/casePresentation";
import { renterCaseSubtitle } from "../../../data/caseIdentity";
import { useState } from "react";
import NavBar from "../../../components/navigation/NavBar";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SectionLabel from "../../../components/common/SectionLabel";
import StatusPill from "../../../components/case/StatusPill";
import { IcoCheckCircle, IcoImg, IcoFileText, IcoShield } from "../../../components/common/icons";
import type { NavItemId } from "../../../types/navigation";

export default function CaseDetailHotwater({ detail, onBack, onViewReport, onNav }: { detail: CaseDetail; onBack: () => void; onViewReport: () => void; onNav: (id: NavItemId) => void }) {
  const [showPrevActivity, setShowPrevActivity] = useState(false);
  return (
    <div className="renter-screen flex flex-col h-full">
      <ScreenHeader title={detail.title} subtitle={renterCaseSubtitle(detail)} onBack={onBack} />
      <div className="rv-scroll flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        <SafetyNotice response={detail.safetyResponse} noPhotos />

        <div className="flex items-center gap-3">
          <StatusPill status={detail.status} />
          <span className="rv-metadata" style={{ fontSize: 12, color: "var(--color-muted)" }}>Completed {formatCaseDate(detail.updatedAt, true)}</span>
        </div>

        {/* Resolved summary — quiet, light */}
        <div className="rv-card shrink-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Final update</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Repair completed</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 4 }}>{caseStatusMessage(detail)}</p>
          </div>
          <div className="px-5 py-3.5">
            <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
              <IcoCheckCircle /><p style={{ fontSize: 14, fontWeight: 600 }}>No action required</p>
            </div>
          </div>
        </div>

        {detail.evidenceRequests.some(r => r.status !== "requested") && <RequestedEvidenceGallery caseKey={detail.caseKey} requests={detail.evidenceRequests} />}
        {/* Activity — collapsed by default */}
        <div>
          <SectionLabel>Case activity</SectionLabel>
          <div className="rv-card rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CaseActivity completed updates={showPrevActivity ? detail.updates : detail.updates.slice(0, 1)} />
            {detail.updates.length > 1 && <button onClick={() => setShowPrevActivity(!showPrevActivity)} className="rv-metadata w-full px-5 py-3.5 text-left" style={{ color: "var(--color-muted)", fontSize: 14, fontWeight: 500 }}>
              {showPrevActivity ? "Hide previous activity" : "View previous activity"}
            </button>}
          </div>
        </div>

        {/* Report */}
        <div>
          <SectionLabel>Your report</SectionLabel>
          <div className="rv-card rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {[
              { icon: <IcoFileText />, label: "Issue summary", value: [detail.issueType, detail.location].filter(Boolean).join(" · ") },
              { icon: <IcoImg />, label: "Photos", value: isSafetyReport(detail.safetyResponse) ? SAFETY_EVIDENCE_NOTE : "2 captured" },
              { icon: <IcoShield />, label: "Safety", value: detail.safetyResponse || "Not recorded" },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ color: "var(--color-muted)" }}>{row.icon}</div>
                <div className="flex-1">
                  <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ fontSize: 14, color: "var(--color-text)", marginTop: 1 }}>{row.value}</p>
                </div>
              </div>
            ))}
            <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 14, fontWeight: 600 }}>
              View submitted report
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
