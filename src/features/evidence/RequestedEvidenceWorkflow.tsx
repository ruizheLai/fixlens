import { useEffect, useRef, useState } from "react";
import SafetyNotice from "../../components/common/SafetyNotice";
import { isSafetyReport } from "../../data/reportSafety";
import type { EvidenceRequest, LocalPhoto } from "../../types/evidence";
import PhotoSource from "../../components/capture/PhotoSource";
import { PhotoPreview } from "../../components/capture/PrototypeCapture";
import AnnotatedPhoto from "../../components/capture/AnnotatedPhoto";
import ScreenHeader from "../../components/common/ScreenHeader";
import Btn from "../../components/common/Btn";
import { getDemoSessionId } from "../../utils/demoSession";
import { submitRequestedPhoto } from "../../services/requestedEvidence";
import { requestPresentation } from "../../data/evidenceRequestPresentation";

export default function RequestedEvidenceWorkflow({ request, onExit, onSubmitted, safetyResponse = null }: { request: EvidenceRequest; onExit: () => void; onSubmitted: () => void; safetyResponse?: string | null }) {
  const role = requestPresentation(request).role ?? "closeup";
  const [step, setStep] = useState<"safety" | "capture" | "preview" | "review">(isSafetyReport(safetyResponse) ? "safety" : "capture");
  const [photo, setPhoto] = useState<LocalPhoto | null>(null);
  const latest = useRef<LocalPhoto | null>(null);
  function retake() {
    if (latest.current) URL.revokeObjectURL(latest.current.previewUrl);
    latest.current = null; setPhoto(null); setStep("capture");
  }
  const [session] = useState(getDemoSessionId);
  const controller = useRef<AbortController | null>(null);
  const frozen = useRef<LocalPhoto | null>(null);
  const [pending, setPending] = useState(false), [error, setError] = useState(false);
  useEffect(() => () => { controller.current?.abort(); if (latest.current) URL.revokeObjectURL(latest.current.previewUrl); }, []);
  function accept(value: LocalPhoto) {
    if (latest.current && latest.current.previewUrl !== value.previewUrl) URL.revokeObjectURL(latest.current.previewUrl);
    latest.current = value; setPhoto(value);
  }
  async function submit() {
    if (!photo || controller.current) return;
    frozen.current ??= photo;
    const current = new AbortController(); controller.current = current;
    setPending(true); setError(false);
    try {
      await submitRequestedPhoto(request.caseKey, request.id, session, frozen.current, current.signal);
      if (!current.signal.aborted) onSubmitted();
    } catch { if (!current.signal.aborted) setError(true); }
    finally { controller.current = null; if (!current.signal.aborted) setPending(false); }
  }
  if (step === "safety") return <div className="flex flex-col h-full"><ScreenHeader title="Requested photo" onBack={onExit} /><div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"><SafetyNotice response={safetyResponse} /><p>Only provide a photo if you can do so safely. If the area remains unsafe, contact your property manager using your tenancy agreement.</p><Btn onClick={onExit}>Return to case</Btn><Btn variant="secondary" onClick={() => setStep("capture")}>It is safe to provide a photo</Btn></div></div>;
  if (step === "capture") return <PhotoSource role={role} requestInstruction={request.instruction} onClose={onExit} onPhoto={p => { accept(p); setStep("preview"); }} />;
  if (step === "preview" && photo) return <PhotoPreview key={photo.id} title="Requested photo" photoType={role} photo={photo}
    onAnnotations={annotations => accept({ ...photo, annotations })} onRetake={retake} onUse={() => setStep("review")} />;
  return <div className="flex flex-col h-full">
    <ScreenHeader title="Review requested evidence" onBack={() => { if (!pending) { if (frozen.current) onExit(); else setStep("preview"); } }} />
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
      <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{request.instruction}</p>
      {photo && <div style={{ height: 280, flexShrink: 0 }}><AnnotatedPhoto src={photo.previewUrl} metadata={photo} label="Requested photo review" /></div>}
      {!frozen.current && <Btn onClick={() => setStep("capture")}>Choose another photo</Btn>}
      <p style={{ fontSize: 13, color: "var(--color-muted)" }}>This photo will be added to your case for review. Your case status will stay the same.</p>
      {error && <p role="alert" style={{ fontSize: 13, color: "var(--color-danger)" }}>We couldn't confirm submission. Your photo is still here. Retry safely to finish without duplicates.</p>}
      <Btn disabled={pending || !photo} onClick={submit}>{pending ? "Submitting evidence…" : error ? "Retry" : "Submit evidence"}</Btn>
    </div>
  </div>;
}
