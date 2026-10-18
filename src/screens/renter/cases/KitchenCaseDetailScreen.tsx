import SafetyNotice from "../../../components/common/SafetyNotice";
import { currentEvidenceRequest, EVIDENCE_REQUEST_STATE, requestPresentation, canRespondToRequest } from "../../../data/evidenceRequestPresentation";
import { getDemoSessionId } from "../../../utils/demoSession";
import type { CaseDetail } from "../../../types/case";
import CaseActivity from "../../../components/case/CaseActivity";
import RequestedEvidenceGallery from "../../../components/case/RequestedEvidenceGallery";
import { CASE_STATUS_COPY, caseHandlerPresentation, caseStatusMessage } from "../../../data/casePresentation";
import { renterCaseSubtitle } from "../../../data/caseIdentity";
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
  const actionRequired = request ? canRespondToRequest(detail, request, getDemoSessionId()) : false;
  const requestLabel = request?.status === "requested" && !actionRequired ? "Demo request · Read only" : requestState?.label;
  return (
    <div className="renter-screen flex flex-col h-full">
      <ScreenHeader title={detail.title} subtitle={renterCaseSubtitle(detail)} onBack={onBack} />
      <div className="rv-scroll flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        <SafetyNotice response={detail.safetyResponse} noPhotos />

        {/* Action required banner — top priority */}
        {actionRequired && request ? (
          <div className="rv-card rv-request rounded-2xl px-5 py-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-action-border)" }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "var(--color-action-text)" }}>
              <IcoAlert />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Action required</p>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.55, marginBottom: 14, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              <strong style={{ display: "block", marginBottom: 6 }}>{requestPresentation(request).requested}</strong>
              {request.instruction}
            </p>
            <Btn onClick={() => onAddEvidence(request.id)}>{requestPresentation(request).action}</Btn>
          </div>
        ) : (
          <div className="rv-card rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <div style={{ color: "var(--color-success)" }}><IcoCheckCircle /></div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--color-success)" }}>{requestLabel ?? "No action required"}</p>
              <p style={{ fontSize: 14, color: "#166534" }}>{request?.status === "submitted" ? "Your additional evidence has been sent for review." : request?.status === "resolved" ? "Your property manager has reviewed this evidence. No further response is needed for this request." : request?.instruction}</p>
            </div>
          </div>
        )}
        {/* Current status card */}
        <div className="rv-card shrink-0 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)", background: detail.status === "awaiting_approval" ? "var(--color-amber-light)" : "var(--color-blue-light)" }}>
            <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, color: detail.status === "awaiting_approval" ? "var(--color-amber-text)" : "var(--color-blue)" }}>Current status</p>
            <div style={{ marginBottom: 6 }}><StatusPill status={detail.status} /></div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {caseStatusMessage(detail)}
            </p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "var(--color-blue-light)", color: "var(--color-blue)" }}><IcoUser /></div>
            <div>
              <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Handled by</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{handler.role}</p>
              <p className="rv-metadata" style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 1 }}>{handler.name}</p>
            </div>
          </div>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Your action</p>
            {actionRequired && request ? (
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-action-text)" }}>{request.instruction}</p>
            ) : (
              <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
                <IcoCheckCircle /><p style={{ fontSize: 14, fontWeight: 600 }}>{requestLabel ?? "No action required"}</p>
              </div>
            )}
          </div>
          <div className="px-5 py-4">
            <p className="rv-field-label" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
              {actionRequired ? "Once the requested evidence is submitted, the property manager can continue reviewing the case." : request?.status === "submitted" ? "Your property manager will review the additional evidence." : CASE_STATUS_COPY[detail.status].next}
            </p>
          </div>
        </div>

        {detail.evidenceRequests.some(r => r.status !== "requested") && <RequestedEvidenceGallery caseKey={detail.caseKey} requests={detail.evidenceRequests} />}
        {/* Latest activity */}
        <div>
          <SectionLabel>Latest activity</SectionLabel>
          <div className="rv-card rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CaseActivity updates={detail.updates} />
          </div>
        </div>

        <div className="rv-card shrink-0 rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ color: "var(--color-blue)", fontSize: 14, fontWeight: 600 }}>
            View submitted report
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
