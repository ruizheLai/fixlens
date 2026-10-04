import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";
import { useAutomaticInvalidation } from "../../hooks/useAutomaticInvalidation";
import { Link, useParams } from "react-router-dom";
import { getPMDetail } from "../../services/pm";
import { pmSupabase } from "../../services/supabase";
import { caseUpdateTitle } from "../../data/casePresentation";
import { PMReadState, PMStatus, pmDate } from "../../components/pm/PMShared";
import StoredPhotoView from "../../components/capture/StoredPhotoView";
import type { StoredPhoto } from "../../types/evidence";
import PMWorkflowActions from "../../components/pm/PMWorkflowActions";

export default function PMCaseDetail() {
  const { caseKey = "" } = useParams();
  return <LoadedPMDetail key={caseKey} caseKey={caseKey} />;
}
function LoadedPMDetail({ caseKey }: { caseKey: string }) {
  const load = useCallback((signal: AbortSignal) => getPMDetail(caseKey, signal), [caseKey]);
  const { data: detail, error, refresh, replace } = useAuthoritativeRead(load);
  useAutomaticInvalidation("pm", `case:${caseKey}`, refresh);
  const [preview, setPreview] = useState<StoredPhoto | null>(null);
  if (detail === undefined) return <main className="pm-dashboard"><Link to="/pm">← Back to Dashboard</Link><PMReadState error={error} retry={refresh} /></main>;
  if (detail === null) return <main className="pm-dashboard"><h1>Case not found</h1><p>This case is unavailable.</p><Link to="/pm">Back to Dashboard</Link></main>;
  const c = detail.case;
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
      {c.evidenceRequests.length > 0 && <section className="pm-card"><h2>Additional evidence requests</h2>{c.evidenceRequests.map(r => <div className="pm-request" key={r.id}><strong>{r.status === "requested" ? "Additional evidence requested" : r.status === "submitted" ? "Evidence submitted" : "Evidence reviewed"}</strong><p>{r.instruction}</p><small>{pmDate(r.createdAt)} · Read only</small>{detail.requestedPhotos.filter(p => p.requestId === r.id).map(photo => <div className="pm-photo-card" key={photo.id}><div className="pm-photo-image"><StoredPhotoView photo={photo} label="Requested evidence photo" client={pmSupabase} /></div><button className="pm-photo-open" onClick={() => setPreview(photo)}>Submitted by renter<span>View ↗</span></button></div>)}</div>)}</section>}
      <details className="pm-card pm-tenant"><summary>Tenant report</summary><dl className="pm-fields"><div><dt>Tenant</dt><dd>{c.renter?.name ?? "Not provided"}</dd></div><div><dt>Submitted</dt><dd>{pmDate(c.createdAt)}</dd></div><div><dt>Email</dt><dd>{c.renter?.email ?? "Not provided"}</dd></div><div><dt>Phone</dt><dd>{c.renter?.phone ?? "Not provided"}</dd></div></dl><h3>Original description</h3><p>{c.description}</p></details>
      <section className="pm-card"><h2>Case timeline</h2>{!detail.updates.length && <p className="pm-muted">No recorded activity.</p>}<ol className="pm-timeline">{detail.updates.map(u => <li key={u.id}><time>{pmDate(u.createdAt)}</time><strong>{caseUpdateTitle(u)}</strong>{u.message && <p>{u.message}</p>}</li>)}</ol></section>
    </div><aside className="pm-next"><PMWorkflowActions caseData={c} onChanged={replace} /></aside></div></div>
    {preview && <PhotoDialog photo={preview} onClose={() => setPreview(null)} />}
  </main>;
}
function PhotoDialog({ photo, onClose }: { photo: StoredPhoto; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  const label = "requestId" in photo ? "Requested evidence photo" : photo.role === "overview" ? "Overview photo" : "Close-up photo";
  return <dialog ref={dialog} className="pm-photo-dialog" onCancel={onClose} onClose={onClose} aria-label={label}><div className="pm-section-heading"><h2>{label}</h2><button className="pm-button" onClick={onClose} autoFocus>Close</button></div><div className="pm-photo-full"><StoredPhotoView photo={photo} label={label} client={pmSupabase} /></div><p>Tenant annotations · Read only</p></dialog>;
}
