import { useEffect, useRef, useState } from "react";
import { advancePMCase, getPMDetail, PMStateConflict, requestPMEvidence, resolvePMEvidence, reviewPMCase, type PMCase, type PMDetail, type PMWorkflowAction } from "../../services/pm";
import type { CaseStatus } from "../../types/case";

const actions = {
  request_approval: { title: "Request landlord approval", confirm: "Request approval", explanation: "Record that landlord approval has been requested for this maintenance case. No external email is sent.", success: "Approval request recorded." },
  record_approval: { title: "Record approval received", confirm: "Record approval", explanation: "Confirm that landlord approval has been received. This is a manual record and starts repair arrangement.", success: "Approval recorded." },
  schedule_repair: { title: "Mark repair scheduled", confirm: "Mark repair scheduled", explanation: "Record that the repair has been scheduled. No contractor or appointment details are created.", success: "Repair schedule recorded." },
  complete_repair: { title: "Mark completed", confirm: "Mark completed", explanation: "Confirm that the repair is complete. This case will have no further workflow action.", success: "Repair marked completed." },
  evidence: { title: "Request more evidence", confirm: "Send request", explanation: "Create a FixLens request for the renter. No external email is sent.", success: "Evidence request recorded." },
  resolve: { title: "Mark evidence reviewed", confirm: "Mark reviewed", explanation: "Confirm that you have reviewed the additional evidence provided for this request. This does not approve a repair or change the case status.", success: "Additional evidence reviewed." },
};
type ModalAction = PMWorkflowAction | "evidence" | "resolve";
const guidance: Record<CaseStatus, { title: string; body: string; action?: PMWorkflowAction }> = {
  submitted: { title: "Review case", body: "Review the tenant's report and available evidence to begin the case review." },
  under_review: { title: "Request landlord approval", body: "Record the approval request when you have finished reviewing the report.", action: "request_approval" },
  awaiting_approval: { title: "Await landlord approval", body: "Record approval when it has been received.", action: "record_approval" },
  arranging_repair: { title: "Schedule repair", body: "Record when the repair has been scheduled.", action: "schedule_repair" },
  repair_scheduled: { title: "Complete repair", body: "Mark the case completed once the repair is complete.", action: "complete_repair" },
  completed: { title: "Case complete", body: "No further action required." },
};

export default function PMWorkflowActions({ caseData: c, onChanged }: { caseData: PMCase; onChanged: (detail: PMDetail | null) => void }) {
  const [modal, setModal] = useState<ModalAction | null>(null);
  const [instruction, setInstruction] = useState("");
  const requestAttempt = useRef<{ id: string; instruction: string } | null>(null);
  const resolveAttempt = useRef<{ id: string; instruction: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const requested = c.evidenceRequests.find(r => r.status === "requested");
  const submitted = c.evidenceRequests.filter(r => r.status === "submitted").sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))[0];
  const waiting = c.status === "under_review" && Boolean(requested);
  const unexpected = c.status !== "under_review" && c.status !== "completed" && Boolean(requested || submitted);
  const next = c.status === "completed" ? guidance.completed : unexpected ? { title: "Evidence request needs attention", body: "An unresolved request is outside the review stage. Refresh the case before continuing.", action: undefined } : waiting ? { title: "Waiting for requested evidence", body: "Additional evidence has been requested from the renter.", action: undefined } : submitted ? { title: "Additional evidence submitted", body: "The renter has provided the requested evidence. Review it before continuing the case.", action: undefined } : guidance[c.status];
  function open(action: ModalAction) {
    if (action === "resolve") { if (!submitted) return; resolveAttempt.current = { id: submitted.id, instruction: submitted.instruction }; }
    setError(""); setNotice(""); setInstruction(""); requestAttempt.current = null; setModal(action);
  }
  function close() { if (!controller.current) { setModal(null); setError(""); } }
  async function run(action: ModalAction | "review") {
    if (controller.current) return;
    const current = new AbortController(); controller.current = current;
    setPending(true); setError(""); setNotice("");
    try {
      let outcome = "applied";
      if (action === "review") await reviewPMCase(c.caseKey, current.signal);
      else if (action === "evidence") {
        requestAttempt.current ??= { id: crypto.randomUUID(), instruction: instruction.trim() };
        const attempt = requestAttempt.current;
        outcome = (await requestPMEvidence(c.caseKey, attempt.id, attempt.instruction, current.signal)).outcome;
      } else if (action === "resolve") {
        if (!resolveAttempt.current) throw new Error("Evidence request unavailable");
        outcome = (await resolvePMEvidence(c.caseKey, resolveAttempt.current.id, current.signal)).outcome;
      } else outcome = (await advancePMCase(c.caseKey, action, current.signal)).outcome;
      const updated = await getPMDetail(c.caseKey, current.signal);
      if (current.signal.aborted) return;
      onChanged(updated); setModal(null);
      setNotice(outcome === "existing_request" ? "An evidence request is already pending." : outcome === "already_applied" ? "This action was already recorded. Latest case loaded." : action === "review" ? "Review started." : actions[action].success);
    } catch (failure) {
      if (current.signal.aborted) return;
      if (failure instanceof PMStateConflict) {
        try {
          const updated = await getPMDetail(c.caseKey, current.signal);
          if (!current.signal.aborted) { onChanged(updated); setModal(null); setNotice("The case changed. Latest state loaded; review the available next action."); }
        } catch { if (!current.signal.aborted) setError("The case changed, but could not be refreshed. Retry to load its current state."); }
      } else setError("This action could not be confirmed. Retry safely; duplicate activity will not be added.");
    } finally { controller.current = null; if (!current.signal.aborted) setPending(false); }
  }
  return <section className="pm-card"><h2>Next action</h2><p className="pm-muted">Current workflow</p>
    <div className={`pm-guidance ${c.status === "completed" ? "pm-guidance-complete" : ""}`}><h3>{next.title}</h3><p>{next.body}</p></div>
    {c.status === "submitted" && !unexpected && <button className="pm-button pm-primary" disabled={pending} onClick={() => run("review")}>{pending ? "Starting review…" : error ? "Retry review" : "Review case"}</button>}
    {c.status === "under_review" && !waiting && submitted && <><p className="pm-attention">{submitted.instruction}</p><button className="pm-button pm-primary" disabled={pending} onClick={() => open("resolve")}>Mark evidence reviewed</button></>}
    {next.action && <button className="pm-button pm-primary" disabled={pending} onClick={() => open(next.action!)}>{actions[next.action].title}</button>}
    {c.status === "under_review" && !waiting && !submitted && <button className="pm-button pm-secondary-action" disabled={pending} onClick={() => open("evidence")}>Request more evidence</button>}
    {requested && <p className="pm-attention">{requested.instruction}</p>}
    {error && !modal && <p role="alert">{error}</p>}
    {notice && <div className="pm-toast" role="status">{notice}</div>}
    <div className="pm-handler"><small>Handled by · Property manager</small><strong>{c.handler?.name ?? "Not assigned"}</strong><span>{c.handler?.agency_name}</span></div>
    {modal && <ActionDialog title={actions[modal].title} pending={pending} onClose={close}>
      <form onSubmit={event => { event.preventDefault(); void run(modal); }}>
        <p><strong>{c.title}</strong></p><p className="pm-case-key">{c.caseKey}</p><p>{actions[modal].explanation}</p>
        {modal === "resolve" && <p className="pm-attention">{resolveAttempt.current?.instruction}</p>}
        {modal === "evidence" && <label>Request instruction<textarea autoFocus required maxLength={1000} rows={4} value={instruction} disabled={pending || Boolean(requestAttempt.current)} onChange={e => setInstruction(e.target.value)} /></label>}
        {error && <p role="alert">{error}</p>}
        <div className="pm-dialog-actions"><button type="button" className="pm-button" disabled={pending} onClick={close}>Cancel</button><button className="pm-button pm-primary" disabled={pending || (modal === "evidence" && !instruction.trim())}>{pending ? "Saving…" : error ? "Retry" : actions[modal].confirm}</button></div>
      </form>
    </ActionDialog>}
  </section>;
}
function ActionDialog({ title, pending, onClose, children }: { title: string; pending: boolean; onClose: () => void; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="pm-action-dialog" aria-label={title} onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}><h2>{title}</h2>{children}</dialog>;
}
