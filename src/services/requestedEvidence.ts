import type { LocalPhoto, PhotoMetadata, RequestedPhoto } from "../types/evidence";
import { checkedMetadata, photoMetadata } from "./evidence";
import { getDemoSessionId } from "../utils/demoSession";

export async function getRequestedPhotos(caseKey: string, signal: AbortSignal, client?: import("@supabase/supabase-js").SupabaseClient): Promise<RequestedPhoto[]> {
  const db = client ?? (await import("./supabase")).supabase;
  const { data, error } = await db.from("evidence")
    .select("id,evidence_request_id,storage_path,annotation_data,cases!inner(case_key)")
    .eq("cases.case_key", caseKey).eq("evidence_type", "requested_photo").not("evidence_request_id", "is", null)
    .order("created_at").abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)]))
    .returns<{ id: string; evidence_request_id: string; storage_path: string; annotation_data: PhotoMetadata }[]>();
  if (error) throw new Error("Requested photo read failed");
  return (data ?? []).map(p => ({ id: p.id, requestId: p.evidence_request_id, role: "closeup", storagePath: p.storage_path, metadata: checkedMetadata(p.annotation_data) }));
}

// The caller freezes this photo/ID/metadata once submission begins. Upload is
// immutable; the RPC commits the evidence row, request state and activity together.
export async function submitRequestedPhoto(caseKey: string, requestId: string, session: string, photo: LocalPhoto, signal: AbortSignal) {
  const { supabase: db } = await import("./supabase");
  const bounded = AbortSignal.any([signal, AbortSignal.timeout(120000)]);
  const sameSession = () => { bounded.throwIfAborted(); if (getDemoSessionId() !== session) throw new Error("Evidence session changed"); };
  sameSession();
  const metadata = checkedMetadata(photoMetadata(photo));
  const { data: parent, error } = await db.from("cases").select("id").eq("case_key", caseKey).eq("demo_session_id", session).abortSignal(bounded).single<{ id: string }>();
  if (error || !parent) throw new Error("This request is not available for your visitor session.");
  const { data: request, error: requestError } = await db.from("evidence_requests").select("status").eq("id", requestId).eq("case_id", parent.id).abortSignal(bounded).single<{ status: string }>();
  if (requestError || !request) throw new Error("Evidence request unavailable");
  const path = `${session}/${parent.id}/${photo.id}.jpg`;
  const finalize = async () => {
    sameSession();
    const result = await db.rpc("submit_requested_evidence", { p_request_id: requestId, p_evidence_id: photo.id, p_metadata: metadata }).abortSignal(bounded);
    if (result.error || !["submitted", "already_submitted"].includes(result.data?.outcome)) throw new Error("Evidence submission could not be confirmed");
  };
  // Recover committed success before attempting another upload.
  if (request.status !== "requested") { await finalize(); return; }
  sameSession();
  const { error: uploadError } = await db.storage.from("case-evidence").upload(path, photo.file, { contentType: "image/jpeg", upsert: false, cacheControl: "3600" });
  sameSession();
  if (uploadError) {
    const { data, error: readError } = await db.storage.from("case-evidence").download(path, {}, { signal: bounded });
    if (readError || !data || data.size !== photo.file.size) throw new Error("Photo upload failed");
    const digest = async (blob: Blob) => new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()));
    const [stored, local] = await Promise.all([digest(data), digest(photo.file)]);
    if (!stored.every((value, i) => value === local[i])) throw new Error("Photo upload confirmation failed");
  }
  await finalize();
}
