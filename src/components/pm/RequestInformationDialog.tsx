import { useEffect, useRef, useState } from "react";
import type { InformationRequestType } from "../../types/evidence";
import { INFORMATION_REQUEST_TYPES, canRequestInformation } from "../../data/evidenceRequestPresentation";
import { getPMDetail, requestPMInformation, type PMCase, type PMDetail } from "../../services/pm";

export default function RequestInformationDialog({ caseData, initialType, onClose, onChanged }: {
  caseData: PMCase; initialType: InformationRequestType | null; onClose: () => void; onChanged: (detail: PMDetail | null) => void;
}) {
  const [type, setType] = useState<InformationRequestType | null>(initialType);
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false), [error, setError] = useState("");
  const attempt = useRef<{ id: string; type: InformationRequestType; instruction: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  // A frozen retry may recover an already committed request after invalidation.
  const eligible = canRequestInformation(caseData) || Boolean(attempt.current);
  useEffect(() => {
    const element = dialog.current!; const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = "hidden"; element.showModal();
    return () => { controller.current?.abort(); element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  async function send(event: React.FormEvent) {
    event.preventDefault(); if (!eligible || !type || !instruction.trim() || controller.current) return;
    attempt.current ??= { id: crypto.randomUUID(), type, instruction: instruction.trim() };
    const frozen = attempt.current, current = new AbortController(); controller.current = current;
    setPending(true); setError("");
    try {
      await requestPMInformation(caseData.caseKey, frozen.id, frozen.instruction, frozen.type, current.signal);
      const detail = await getPMDetail(caseData.caseKey, current.signal);
      if (!current.signal.aborted) { onChanged(detail); onClose(); }
    } catch { if (!current.signal.aborted) setError("We couldn't confirm this request. Your instructions are saved here. Retry safely, or cancel and refresh the case to check its current state."); }
    finally { controller.current = null; if (!current.signal.aborted) setPending(false); }
  }
  return <dialog ref={dialog} className="pm-action-dialog pm-information-dialog" aria-label="Request more information" onCancel={e => { e.preventDefault(); if (!pending) onClose(); }}>
    <h2>Request more information</h2><p><strong>{caseData.title}</strong>{caseData.location && ` · ${caseData.location}`}</p>
    <form onSubmit={send}><fieldset disabled={pending || !!attempt.current}><legend>What do you need from the renter?</legend>
      {(["overview_photo", "closeup_photo", "written_details"] as const).map(value => <label className="pm-request-option" key={value}><input type="radio" name="requestType" value={value} required checked={type === value} onChange={() => setType(value)} />{INFORMATION_REQUEST_TYPES[value].label}</label>)}
      <label>Instructions to renter<textarea required maxLength={1000} rows={4} value={instruction} onChange={e => setInstruction(e.target.value)} /></label>
    </fieldset>{!eligible && <p role="alert">This case no longer permits a new request. Cancel and review its latest state.</p>}{error && <p role="alert">{error}</p>}
    <div className="pm-dialog-actions"><button type="button" className="pm-button" disabled={pending} onClick={onClose}>Cancel</button><button className="pm-button pm-primary" disabled={pending || !eligible || !type || !instruction.trim()}>{pending ? "Sending…" : error ? "Retry" : "Send request"}</button></div></form>
  </dialog>;
}
