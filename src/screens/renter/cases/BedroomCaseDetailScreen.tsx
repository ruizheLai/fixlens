import type { CaseDetail } from "../../../types/case";
import { PROTOTYPE_EVIDENCE_COUNTS } from "../../../data/demo/evidence";
import CaseActivity from "../../../components/case/CaseActivity";
import { CASE_STATUS_COPY, CASE_STATUS_LABELS, caseHandlerPresentation, caseStatusMessage, formatCaseDate, formatActivityTime } from "../../../data/casePresentation";
import { demoCaseReference } from "../../../data/demo/cases";
import { useState } from "react";
import NavBar from "../../../components/navigation/NavBar";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SectionLabel from "../../../components/common/SectionLabel";
import StatusPill from "../../../components/case/StatusPill";
import ProgressTracker from "../../../components/case/ProgressTracker";
import { IcoCheckCircle, IcoImg, IcoVideo, IcoUser, IcoFileText, IcoShield } from "../../../components/common/icons";
import type { NavItemId } from "../../../types/navigation";

export default function CaseDetailBedroom({ detail, onBack, onViewReport, onNav }: { detail: CaseDetail; onBack: () => void; onViewReport: () => void; onNav: (id: NavItemId) => void }) {
  const [showFullActivity, setShowFullActivity] = useState(false);
  const copy = CASE_STATUS_COPY[detail.status];
  const handler = caseHandlerPresentation(detail);
  const prototypeEvidence = PROTOTYPE_EVIDENCE_COUNTS[detail.caseKey];
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title={detail.title} subtitle={demoCaseReference(detail.caseKey)} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Status badge */}
        <div className="flex items-center gap-3">
          <StatusPill status={detail.status} />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Updated {formatCaseDate(detail.updatedAt, false)}</span>
        </div>

        {/* Current status card — primary surface with subtle tint */}
        <div className="shrink-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* What's happening */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)", background: detail.status === "awaiting_approval" ? "var(--color-amber-light)" : "var(--color-blue-light)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: detail.status === "awaiting_approval" ? "var(--color-amber-text)" : "var(--color-blue)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What's happening now</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>{copy.title}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 4 }}>{caseStatusMessage(detail)}</p>
          </div>
          {/* Who's handling */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "var(--color-blue-light)", color: "var(--color-blue)" }}><IcoUser /></div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Handled by</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{handler.role}</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 1 }}>{handler.name}</p>
            </div>
          </div>
          {/* Your action */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Your action</p>
            <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
              <IcoCheckCircle />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No action required</p>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>We'll let you know when something changes.</p>
          </div>
          {/* What next */}
          <div className="px-5 py-4">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>{copy.next}</p>
          </div>
        </div>

        {/* Progress tracker */}
        <div>
          <SectionLabel>Case progress</SectionLabel>
          <div className="rounded-2xl px-5 pt-5 pb-2" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <ProgressTracker currentIndex={Object.keys(CASE_STATUS_LABELS).indexOf(detail.status)} submittedLabel={`${formatCaseDate(detail.createdAt, true)} · ${formatActivityTime(detail.createdAt)}`} />
          </div>
        </div>

        {/* Latest activity */}
        <div>
          <SectionLabel>Latest activity</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CaseActivity updates={showFullActivity ? detail.updates : detail.updates.slice(0, 1)} />
            {detail.updates.length > 1 && <button onClick={() => setShowFullActivity(!showFullActivity)} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
              {showFullActivity ? "Hide activity" : "View full activity"}
            </button>}
          </div>
        </div>

        {/* Your report */}
        <div>
          <SectionLabel>Your report</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {[
              { icon: <IcoFileText />, label: "Issue summary", value: [detail.issueType, detail.location].filter(Boolean).join(" · ") },
              { icon: <IcoFileText />, label: "Description", value: detail.description },
              { icon: <IcoImg />, label: "Photos", value: prototypeEvidence ? `${prototypeEvidence.photos} captured` : "No saved evidence" },
              { icon: <IcoVideo />, label: "Video", value: prototypeEvidence ? `${prototypeEvidence.videos} captured` : "No saved evidence" },
              { icon: <IcoShield />, label: "Safety", value: detail.safetyResponse || "Not recorded" },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ color: "var(--color-muted)" }}>{row.icon}</div>
                <div className="flex-1">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text)", marginTop: 1 }}>{row.value}</p>
                </div>
              </div>
            ))}
            <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
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
