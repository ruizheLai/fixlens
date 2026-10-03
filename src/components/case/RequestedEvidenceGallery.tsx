import { useEffect, useState } from "react";
import { getRequestedPhotos } from "../../services/requestedEvidence";
import StoredPhotoView from "../capture/StoredPhotoView";
import type { EvidenceRequest, RequestedPhoto } from "../../types/evidence";

export default function RequestedEvidenceGallery({ caseKey, requests }: { caseKey: string; requests: EvidenceRequest[] }) {
  const [photos, setPhotos] = useState<RequestedPhoto[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setState("loading");
    getRequestedPhotos(caseKey, controller.signal).then(items => { if (!controller.signal.aborted) { setPhotos(items); setState("ready"); } })
      .catch(() => { if (!controller.signal.aborted) setState("error"); });
    return () => controller.abort();
  }, [caseKey, attempt]);
  if (state === "loading") return <p role="status">Loading additional evidence…</p>;
  if (state === "error") return <button onClick={() => setAttempt(a => a + 1)}>Additional evidence unavailable · Retry</button>;
  return <section className="flex flex-col gap-3"><p style={{ fontWeight: 600, fontSize: 14 }}>Additional evidence</p>
    {photos.map(p => <div key={p.id} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <p style={{ fontSize: 13, marginBottom: 12 }}>{requests.find(r => r.id === p.requestId)?.instruction}</p>
      <div style={{ height: 240 }}><StoredPhotoView photo={p} label="Requested evidence photo" /></div>
      <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 8 }}>Submitted by you · {requests.find(r => r.id === p.requestId)?.status === "resolved" ? "Evidence reviewed" : "Awaiting review"}</p>
    </div>)}
    {!photos.length && <p style={{ fontSize: 13 }}>No stored additional photo is available.</p>}
  </section>;
}
