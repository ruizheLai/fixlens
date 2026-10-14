import { useEffect, useRef, useState } from "react";
import type { StoredPhoto } from "../../types/evidence";
import { downloadReportPhoto } from "../../services/evidence";
import { pmSupabase } from "../../services/supabase";
import AnnotatedPhoto from "../capture/AnnotatedPhoto";

// One private download per mounted photo/path, shared by thumbnail and viewer.
// Metadata updates from authoritative refreshes do not fetch the image again.
export default function PMEvidencePhoto({ photo, label }: { photo: StoredPhoto; label: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    setUrl(""); setError(false);
    downloadReportPhoto(photo.storagePath, controller.signal, pmSupabase).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [photo.storagePath, attempt]);
  const image = url ? <AnnotatedPhoto src={url} metadata={photo.metadata} label={label} />
    : error ? <button className="pm-button" onClick={() => setAttempt(n => n + 1)}>Photo unavailable · Retry</button>
    : <span role="status" className="pm-muted">Loading photo…</span>;
  return <article className="pm-photo-card">
    <div className="pm-photo-image">{image}</div>
    <div className="pm-photo-info"><h3>{label}</h3><span className="pm-photo-state">Provided</span><p>Tenant photo · Annotations read only</p>
      <button className="pm-button pm-photo-open" disabled={!url} onClick={() => setOpen(true)}>View full photo</button>
    </div>
    {open && <PMImageViewer photo={photo} label={label} onClose={() => setOpen(false)}>{image}</PMImageViewer>}
  </article>;
}

function PMImageViewer({ photo, label, onClose, children }: { photo: StoredPhoto; label: string; onClose: () => void; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const ratio = (photo.metadata.width || 1) / (photo.metadata.height || 1);
  return <dialog ref={dialog} className="pm-photo-dialog" aria-label={label} onCancel={e => { e.preventDefault(); onClose(); }}
    style={{ width: `min(1100px, calc(100vw - 32px), calc((100dvh - 160px) * ${ratio}))` }}>
    <header className="pm-viewer-heading"><h2>{label}</h2><button className="pm-button" onClick={onClose} autoFocus>Close</button></header>
    <div className="pm-photo-full" style={{ aspectRatio: ratio }}>{children}</div>
    <p>Tenant annotations · Read only</p>
  </dialog>;
}
