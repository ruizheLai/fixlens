import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPMDetail, reviewPMCase, type PMDetail } from "../../services/pm";
import { pmSupabase } from "../../services/supabase";
import { caseUpdateTitle } from "../../data/casePresentation";
import { PMReadState, PMStatus, pmDate } from "../../components/pm/PMShared";
import StoredPhotoView from "../../components/capture/StoredPhotoView";
import type { StoredPhoto } from "../../types/evidence";
import type { CaseStatus } from "../../types/case";

const nextAction: Record<CaseStatus, [string, string]> = {
  submitted: ["Review case", "Review the tenant's report and available evidence to begin the case review."],
  under_review: ["Review in progress", "The report is under review. Further workflow actions are not available yet."],
  awaiting_approval: ["Awaiting landlord approval", "The case is awaiting approval. No action is available in this portal yet."],
  arranging_repair: ["Repair arrangement in progress", "Repair arrangements are in progress. No action is available here yet."],
  repair_scheduled: ["Repair scheduled", "See the recorded case timeline for scheduling information."],
  completed: ["Case complete", "No further action."],
};
export default function PMCaseDetail() {
  const { caseKey = "" } = useParams();
  return <LoadedPMDetail key={caseKey} caseKey={caseKey} />;
}
function LoadedPMDetail({ caseKey }: { caseKey: string }) {
  const [detail, setDetail] = useState<PMDetail | null | undefined>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [reviewError, setReviewError] = useState(false);
  const [preview, setPreview] = useState<StoredPhoto | null>(null);
  const reviewController = useRef<AbortController | null>(null);
  useEffect(() => () => reviewController.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController(); setDetail(undefined); setError(false);
    getPMDetail(caseKey, controller.signal).then(data => { if (!controller.signal.aborted) setDetail(data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [caseKey, attempt]);
  async function review() {
    if (reviewController.current) return;
    const controller = new AbortController(); reviewController.current = controller;
    setPending(true); setReviewError(false);
    try {
      await reviewPMCase(caseKey, controller.signal);
      const updated = await getPMDetail(caseKey, controller.signal);
      if (!controller.signal.aborted) setDetail(updated);
    } catch { if (!controller.signal.aborted) setReviewError(true); }
    finally { reviewController.current = null; if (!controller.signal.aborted) setPending(false); }
  }
  if (detail === undefined) return <main className="pm-dashboard"><Link to="/pm">← Back to Dashboard</Link><PMReadState error={error} retry={() => setAttempt(a => a + 1)} /></main>;
  if (detail === null) return <main className="pm-dashboard"><h1>Case not found</h1><p>This case is unavailable.</p><Link to="/pm">Back to Dashboard</Link></main>;
  const c = detail.case;
  const [actionTitle, actionBody] = nextAction[c.status];
  const fields = [["Issue type", c.issueType], ["Location", c.location], ["Occurs", c.condition], ["Safety", c.safetyResponse]];
  return <main className="pm-detail">
    <div className="pm-case-header"><Link className="pm-back" to="/pm">← Back to Dashboard</Link><div className="pm-title-row"><h1>{c.title}</h1><PMStatus status={c.status} /></div>
      <div className="pm-meta"><span className="pm-case-key">{c.caseKey}</span><span>{c.propertyAddress ?? "Property not provided"}</span><span>Tenant: {c.renter?.name ?? "Not provided"}</span><span>Submitted {pmDate(c.createdAt)}</span><span>Updated {pmDate(c.updatedAt)}</span></div>
    </div>
    <div className="pm-detail-scroll"><div className="pm-detail-grid"><div className="pm-detail-main">
      <section className="pm-card"><div className="pm-section-heading"><h2>Issue summary</h2><span className="pm-source">Structured from tenant report</span></div><dl className="pm-fields">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not provided"}</dd></div>)}</dl><blockquote>{c.description}</blockquote></section>
      <section className="pm-card"><h2>Evidence</h2>{detail.photos.length ? <div className="pm-evidence-grid">{detail.photos.map(photo => <div className="pm-photo-card" key={photo.id}><div className="pm-photo-image"><StoredPhotoView photo={photo} label={photo.role === "overview" ? "Overview photo" : "Close-up photo"} client={pmSupabase} /></div><button className="pm-photo-open" onClick={() => setPreview(photo)}>{photo.role === "overview" ? "Overview photo" : "Close-up photo"}<span>View ↗</span></button></div>)}</div> : <p className="pm-muted">No persisted photo evidence is available for this case.</p>}
        <div className="pm-availability"><h3>Evidence received</h3>{[["Overview photo", detail.photos.some(p => p.role === "overview")], ["Close-up photo", detail.photos.some(p => p.role === "closeup")], ["Safety response", Boolean(c.safetyResponse)]].map(([label, provided]) => <div key={String(label)}><span>{label}</span><span>{provided ? "Provided" : "Not provided"}</span></div>)}</div>
      </section>
      {c.evidenceRequests.length > 0 && <section className="pm-card"><h2>Additional evidence requests</h2>{c.evidenceRequests.map(r => <div className="pm-request" key={r.id}><strong>{r.status === "requested" ? "Additional evidence requested" : r.status === "submitted" ? "Evidence submitted" : "Request resolved"}</strong><p>{r.instruction}</p><small>{pmDate(r.createdAt)} · Read only</small></div>)}</section>}
      <details className="pm-card pm-tenant"><summary>Tenant report</summary><dl className="pm-fields"><div><dt>Tenant</dt><dd>{c.renter?.name ?? "Not provided"}</dd></div><div><dt>Submitted</dt><dd>{pmDate(c.createdAt)}</dd></div><div><dt>Email</dt><dd>{c.renter?.email ?? "Not provided"}</dd></div><div><dt>Phone</dt><dd>{c.renter?.phone ?? "Not provided"}</dd></div></dl><h3>Original description</h3><p>{c.description}</p></details>
      <section className="pm-card"><h2>Case timeline</h2>{!detail.updates.length && <p className="pm-muted">No recorded activity.</p>}<ol className="pm-timeline">{detail.updates.map(u => <li key={u.id}><time>{pmDate(u.createdAt)}</time><strong>{caseUpdateTitle(u)}</strong>{u.message && <p>{u.message}</p>}</li>)}</ol></section>
    </div><aside className="pm-next"><section className="pm-card"><h2>Next action</h2><p className="pm-muted">Current workflow</p><div className={`pm-guidance ${c.status === "completed" ? "pm-guidance-complete" : ""}`}><h3>{actionTitle}</h3><p>{actionBody}</p></div>
      {c.status === "submitted" && <button className="pm-button pm-primary" disabled={pending} onClick={review}>{pending ? "Starting review…" : reviewError ? "Retry review" : "Review case"}</button>}
      {reviewError && <p role="alert">Review could not be confirmed. Retry safely; no duplicate activity will be added.</p>}
      {c.evidenceRequests.some(r => r.status === "requested") && <p className="pm-attention">Additional evidence is requested. This is separate from the case status.</p>}
      <div className="pm-handler"><small>Handled by · Property manager</small><strong>{c.handler?.name ?? "Not assigned"}</strong><span>{c.handler?.agency_name}</span></div>
    </section></aside></div></div>
    {preview && <PhotoDialog photo={preview} onClose={() => setPreview(null)} />}
  </main>;
}
function PhotoDialog({ photo, onClose }: { photo: StoredPhoto; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const label = photo.role === "overview" ? "Overview photo" : "Close-up photo";
  return <dialog ref={dialog} className="pm-photo-dialog" onCancel={onClose} onClose={onClose} aria-label={label}><div className="pm-section-heading"><h2>{label}</h2><button className="pm-button" onClick={onClose} autoFocus>Close</button></div><div className="pm-photo-full"><StoredPhotoView photo={photo} label={label} client={pmSupabase} /></div><p>Tenant annotations · Read only</p></dialog>;
}
