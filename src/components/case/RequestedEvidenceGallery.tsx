import { useEffect, useState } from "react";
import { getRequestedPhotos } from "../../services/requestedEvidence";
import StoredPhotoView from "../capture/StoredPhotoView";
import type { EvidenceRequest, RequestedPhoto } from "../../types/evidence";

export default function RequestedEvidenceGallery({ caseKey, requests }: { caseKey: string; requests: EvidenceRequest[] }) {
  const [photos, setPhotos] = useState<RequestedPhoto[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const photoRequests = requests.filter(r => r.requestType !== "written_details");
  const requestRevision = photoRequests.filter(r => r.status !== "requested").map(r => r.id).join("|");
  useEffect(() => {
    const controller = new AbortController();
    if (!photoRequests.some(r => r.status !== "requested")) { setPhotos([]); setState("ready"); return () => controller.abort(); }
    getRequestedPhotos(caseKey, controller.signal).then(items => { if (!controller.signal.aborted) { setPhotos(items); setState("ready"); } })
      .catch(() => { if (!controller.signal.aborted) setState("error"); });
    return () => controller.abort();
  }, [caseKey, attempt, requestRevision]);
  return <section className="flex flex-col gap-3"><p style={{ fontWeight: 600, fontSize: 14 }}>Additional information</p>
    {requests.filter(r => r.responseText != null).map(r => <div key={r.id} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}><p style={{ fontWeight: 600 }}>More written details</p><p>{r.instruction}</p><p style={{ marginTop: 12 }}>{r.responseText}</p><small>{r.status === "resolved" ? "Response reviewed" : "Response submitted — awaiting review"}</small></div>)}
    {state === "loading" && <p role="status">Loading additional evidence…</p>}
    {state === "error" && <button onClick={() => setAttempt(a => a + 1)}>Additional evidence unavailable · Retry</button>}
    {photos.map(p => <div key={p.id} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <p style={{ fontSize: 13, marginBottom: 12 }}>{requests.find(r => r.id === p.requestId)?.instruction}</p>
      <div style={{ height: 240 }}><StoredPhotoView photo={p} label="Requested evidence photo" /></div>
      <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 8 }}>Submitted by you · {requests.find(r => r.id === p.requestId)?.status === "resolved" ? "Evidence reviewed" : "Awaiting review"}</p>
    </div>)}
    {state === "ready" && !photos.length && photoRequests.some(r => r.status !== "requested") && <p style={{ fontSize: 13 }}>No stored additional photo is available.</p>}
  </section>;
}
