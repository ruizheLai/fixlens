import { useEffect, useState } from "react";
import type { StoredPhoto } from "../../types/evidence";
import { downloadReportPhoto } from "../../services/evidence";
import AnnotatedPhoto from "./AnnotatedPhoto";

export default function StoredPhotoView({ photo, label, thumbnail = false }: { photo: StoredPhoto; label: string; thumbnail?: boolean }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    setUrl(""); setError(false);
    downloadReportPhoto(photo.storagePath, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [photo.storagePath, attempt]);
  if (error && thumbnail) return <span style={{ color: "#fff", fontSize: 10 }}>Unavailable</span>;
  if (error) return <button onClick={() => setAttempt(value => value + 1)} style={{ color: "var(--color-blue)", fontSize: 12, padding: 8 }}>Photo unavailable · Retry</button>;
  if (!url) return <span role="status" style={{ color: "var(--color-muted)", fontSize: 11 }}>Loading photo…</span>;
  return <AnnotatedPhoto src={url} metadata={photo.metadata} label={label} />;
}
