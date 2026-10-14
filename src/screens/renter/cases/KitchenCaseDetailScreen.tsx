import { currentEvidenceRequest, EVIDENCE_REQUEST_STATE, requestPresentation } from "../../../data/evidenceRequestPresentation";
import type { CaseDetail } from "../../../types/case";
import CaseActivity from "../../../components/case/CaseActivity";
import RequestedEvidenceGallery from "../../../components/case/RequestedEvidenceGallery";
import { CASE_STATUS_COPY, caseHandlerPresentation, caseStatusMessage } from "../../../data/casePresentation";
import { demoCaseReference } from "../../../data/demo/cases";
import NavBar from "../../../components/navigation/NavBar";
import Btn from "../../../components/common/Btn";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SectionLabel from "../../../components/common/SectionLabel";
import StatusPill from "../../../components/case/StatusPill";
import { IcoAlert, IcoCheckCircle, IcoUser } from "../../../components/common/icons";
import type { NavItemId } from "../../../types/navigation";

// Request state and submitted evidence are read from the backend.
export default function CaseDetailKitchen({ detail, onBack, onAddEvidence, onViewReport, onNav }: {
  detail: CaseDetail; onBack: () => void; onViewReport: () => void; onAddEvidence: (requestId: string) => void; onNav: (id: NavItemId) => void;
}) {
  const handler = caseHandlerPresentation(detail);
  const request = currentEvidenceRequest(detail.evidenceRequests);
  const requestState = request ? EVIDENCE_REQUEST_STATE[request.status] : null;
  const actionRequired = requestState?.actionRequired ?? false;
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title={detail.title} subtitle={demoCaseReference(detail.caseKey)} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Action required banner — top priority */}
        {actionRequired && request ? (
          <div className="rounded-2xl px-5 py-4" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "#DC2626" }}>
              <IcoAlert />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Action required</p>
            </div>
            <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.55, marginBottom: 14, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>{requestPresentation(request).requested}</strong>
              {request.instruction}
            </p>
            <Btn onClick={() => onAddEvidence(request.id)}>{requestPresentation(request).action}</Btn>
          </div>
        ) : (
          <div className="rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <div style={{ color: "#16A34A" }}><IcoCheckCircle /></div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16A34A" }}>{requestState?.label ?? "No action required"}</p>
              <p style={{ fontSize: 13, color: "#166534" }}>{request?.status === "submitted" ? "Your additional evidence has been sent for review." : request?.status === "resolved" ? "Your property manager has reviewed this evidence. No further response is needed for this request." : request?.instruction}</p>
            </div>
          </div>
        )}
        {/* Current status card */}
        <div className="shrink-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)", background: detail.status === "awaiting_approval" ? "var(--color-amber-light)" : "var(--color-blue-light)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, color: detail.status === "awaiting_approval" ? "var(--color-amber-text)" : "var(--color-blue)" }}>Current status</p>
            <div style={{ marginBottom: 6 }}><StatusPill status={detail.status} /></div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {caseStatusMessage(detail)}
            </p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "var(--color-blue-light)", color: "var(--color-blue)" }}><IcoUser /></div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Handled by</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{handler.role}</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 1 }}>{handler.name}</p>
            </div>
          </div>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Your action</p>
            {actionRequired && request ? (
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-danger)" }}>{request.instruction}</p>
            ) : (
              <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
                <IcoCheckCircle /><p style={{ fontSize: 14, fontWeight: 600 }}>{requestState?.label ?? "No action required"}</p>
              </div>
            )}
          </div>
          <div className="px-5 py-4">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
              {actionRequired ? "Once the requested evidence is submitted, the property manager can continue reviewing the case." : request?.status === "submitted" ? "Your property manager will review the additional evidence." : CASE_STATUS_COPY[detail.status].next}
            </p>
          </div>
        </div>

        {detail.evidenceRequests.some(r => r.status !== "requested") && <RequestedEvidenceGallery caseKey={detail.caseKey} requests={detail.evidenceRequests} />}
        {/* Latest activity */}
        <div>
          <SectionLabel>Latest activity</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CaseActivity updates={detail.updates} />
          </div>
        </div>

        <div className="shrink-0 rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
            View submitted report
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
