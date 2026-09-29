import type { LocalPhoto, PhotoMetadata, StoredPhoto } from "../types/evidence";
import { DEMO_BACKEND } from "../config/demoBackend";
import { getDemoSessionId } from "../utils/demoSession";

const BUCKET = "case-evidence";
interface EvidenceRow {
  id: string;
  evidence_type: "overview" | "close_up";
  storage_path: string;
  annotation_data: PhotoMetadata;
}

function checkedMetadata(value: PhotoMetadata): PhotoMetadata {
  if (!value || value.version !== 1 || !Number.isFinite(value.width) || !Number.isFinite(value.height)
    || value.width <= 0 || value.height <= 0 || value.width > 2048 || value.height > 2048
    || !Array.isArray(value.annotations) || value.annotations.length > 50
    || value.annotations.some(item => !item || !["circle", "arrow", "text", "draw"].includes(item.tool)
      || !Array.isArray(item.points) || !item.points.length || item.points.length > 200
      || item.points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1)
      || (item.text !== undefined && (typeof item.text !== "string" || item.text.length > 80)))) {
    throw new Error("Invalid photo metadata");
  }
  return value;
}

export function photoMetadata(photo: LocalPhoto): PhotoMetadata {
  return { version: 1, width: photo.width, height: photo.height, annotations: photo.annotations };
}

// Immutable IDs/paths, no upsert. A lost upload/INSERT response is recovered by
// confirming the existing object/row before trying the next missing operation.
export async function persistReportPhotos(caseKey: string, session: string, photos: LocalPhoto[], signal: AbortSignal) {
  if (getDemoSessionId() !== session) throw new Error("Evidence session changed");
  if (photos.length !== 2 || !photos.some(p => p.role === "overview") || !photos.some(p => p.role === "closeup")) throw new Error("Both photos are required");
  const { supabase } = await import("./supabase");
  const requestSignal = AbortSignal.any([signal, AbortSignal.timeout(120000)]);
  const { data: parent, error: parentError } = await supabase.from("cases").select("id")
    .eq("case_key", caseKey).eq("demo_session_id", session).abortSignal(requestSignal).single<{ id: string }>();
  if (parentError || !parent) throw new Error("Evidence case lookup failed");
  for (const photo of photos) {
    requestSignal.throwIfAborted();
    if (getDemoSessionId() !== session) throw new Error("Evidence session changed");
    const path = `${session}/${parent.id}/${photo.id}.jpg`;
    const metadata = checkedMetadata(photoMetadata(photo));
    const readExisting = async () => {
      const { data, error } = await supabase.from("evidence").select("id,evidence_type,storage_path,annotation_data")
        .eq("case_id", parent.id).eq("id", photo.id).abortSignal(requestSignal).maybeSingle<EvidenceRow>();
      if (error) throw new Error("Evidence confirmation failed");
      if (data && (data.storage_path !== path || data.evidence_type !== (photo.role === "overview" ? "overview" : "close_up"))) throw new Error("Evidence identity mismatch");
      return data;
    };
    if (await readExisting()) continue;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, photo.file, {
      contentType: "image/jpeg", upsert: false, cacheControl: "3600",
    });
    requestSignal.throwIfAborted();
    if (uploadError) {
      // An existing immutable object may be an upload whose reply was lost.
      // Compare bytes before linking it; do not treat every 409/error as success.
      const { data, error } = await supabase.storage.from(BUCKET).download(path, {}, { signal: requestSignal });
      if (error || !data || data.size !== photo.file.size) throw new Error("Photo upload failed");
      const digest = async (blob: Blob) => new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()));
      const [stored, local] = await Promise.all([digest(data), digest(photo.file)]);
      if (!stored.every((value, i) => value === local[i])) throw new Error("Photo upload confirmation failed");
    }
    const { error } = await supabase.from("evidence").insert({ id: photo.id, case_id: parent.id,
      evidence_type: photo.role === "overview" ? "overview" : "close_up", storage_path: path,
      annotation_data: metadata, created_by: DEMO_BACKEND.renterId,
    }).abortSignal(requestSignal);
    if (error && !(await readExisting())) throw new Error("Evidence registration failed");
    if (!error && !(await readExisting())) throw new Error("Evidence confirmation missing");
  }
}

export async function getReportPhotos(caseKey: string, signal: AbortSignal, client?: import("@supabase/supabase-js").SupabaseClient): Promise<StoredPhoto[]> {
  const supabase = client ?? (await import("./supabase")).supabase;
  const { data, error } = await supabase.from("evidence")
    .select("id,evidence_type,storage_path,annotation_data,cases!inner(case_key)")
    .eq("cases.case_key", caseKey).is("evidence_request_id", null).in("evidence_type", ["overview", "close_up"])
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)])).returns<EvidenceRow[]>();
  if (error) throw new Error("Evidence read failed");
  return (data ?? []).map(row => ({ id: row.id, role: row.evidence_type === "overview" ? "overview" as const : "closeup" as const,
    storagePath: row.storage_path, metadata: checkedMetadata(row.annotation_data),
  })).sort((a, b) => Number(a.role === "closeup") - Number(b.role === "closeup"));
}

// Download through the shared session-aware client, never a public URL. Blob
// URLs are local to this document, have no signed-URL expiry, and are revoked by
// the image component. Reloads recheck Storage RLS with the current session.
export async function downloadReportPhoto(path: string, signal: AbortSignal, client?: import("@supabase/supabase-js").SupabaseClient): Promise<Blob> {
  const supabase = client ?? (await import("./supabase")).supabase;
  const { data, error } = await supabase.storage.from(BUCKET).download(path, {}, {
    // Recheck private access when renter or PM identity changes in this browser.
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
  });
  if (error || !data) throw new Error("Photo download failed");
  return data;
}
