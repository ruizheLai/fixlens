import { useState, useRef, useEffect } from "react";
import IssueComposer from "./IssueComposer";
import SafetyReportReview from "./SafetyReportReview";
import FinalReportReview from "./FinalReportReview";
import { useReportViewport } from "./useReportViewport";
import { IMMEDIATE_DANGER, SAFETY_GUIDANCE, canSubmitReport, isSafetyReport } from "../../data/reportSafety";
import { contactDisplay } from "../../utils/contactDisplay";
import { createMaintenanceCase } from "../../services/cases";
import { getDemoSessionId } from "../../utils/demoSession";
import type { MaintenanceReportInput, CaseCreationAttempt, CreatedMaintenanceCase } from "../../types/report";
import { useNavigate } from "react-router-dom";
import type { ReportStep } from "../../types/navigation";
import { casePath } from "../../data/demo/cases";
import SuccessScreen from "../../screens/renter/SubmissionSuccessScreen";
import { PhotoPreview } from "../../components/capture/PrototypeCapture";
import LogoAvatar from "../../components/brand/LogoAvatar";
import Btn from "../../components/common/Btn";
import AssistantBubble from "../../components/chat/AssistantBubble";
import UserBubble from "../../components/chat/UserBubble";
import { IcoChevLeft, IcoSend, IcoAlert, IcoCheck, IcoImg } from "../../components/common/icons";
import type { LocalPhoto, PhotoType, PhotoAnnotation } from "../../types/evidence";
import PhotoSource from "../../components/capture/PhotoSource";
import { persistReportPhotos } from "../../services/evidence";
import { useIssueUnderstanding, reportFromUnderstanding } from "./useIssueUnderstanding";
import type { IssueUnderstanding } from "../../types/issueUnderstanding";
import { MAX_DESCRIPTION, MAX_ANSWER, MAX_FOLLOW_UPS } from "../../../supabase/functions/_shared/issueUnderstanding.ts";
import { validateFramingContext, type FramingContext } from "../../../supabase/functions/_shared/captureFraming.ts";
import { newFramingBudget } from "../../components/capture/framingScheduler";
import { demoPersona } from "../../utils/demoPersona";
import { getDemoProperty } from "../../services/demoProperty";
import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";

// ─── Pre-capture chat cards ───────────────────────────────────────────────────

function PropertyCard({ confirmed, onConfirm, sessionId }: { confirmed: boolean; onConfirm: () => void; sessionId: string }) {
  const persona = demoPersona(sessionId);
  const { data: property, error, refresh } = useAuthoritativeRead(getDemoProperty);
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ label: "Name", value: persona.name }, { label: "Address", value: property?.address ?? (error ? "Unavailable" : "Loading…") }, { label: "Contact", value: contactDisplay(persona.email, persona.phone) }, { label: "Property manager", value: property?.manager ? [property.manager.name,property.manager.agency_name].filter(Boolean).join(" · ") : property ? "Not assigned" : "Loading…" }].map((row, i, arr) => (
          <div key={row.label} className="px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</p>
            <p style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{row.value}</p>
          </div>
        ))}
      </div>
      {error && <p role="alert" style={{ fontSize: 13 }}>Property details unavailable. <button onClick={refresh} style={{ color: "var(--color-blue)" }}>Retry</button></p>}
      {confirmed ? (
        <div className="flex items-center gap-2 mt-3 px-1" style={{ color: "var(--color-success)" }}>
          <IcoCheck /><span style={{ fontSize: 13, fontWeight: 600 }}>Details confirmed</span>
        </div>
      ) : (
        <div className="flex gap-2.5 mt-3">
          <div className="flex-1"><Btn disabled={!property || error} onClick={onConfirm}>Confirm</Btn></div>
        </div>
      )}
    </div>
  );
}

function IssueSummaryCard({ description, result, confirmed, onContinue, onEdit }: { description: string; result: IssueUnderstanding | null; confirmed: boolean; onContinue: () => void; onEdit: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ label: "Issue type", value: result?.issue ?? "Maintenance issue" }, { label: "Location", value: result?.location ?? "Not provided" }, { label: "Observed condition", value: result?.observedCondition ?? "Not provided" }, { label: result ? "Summary" : "Your description", value: result?.summary ?? description }].map((row, i, arr) => (
          <div key={row.label} className="px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</p>
            <p style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
          </div>
        ))}
      </div>
      {confirmed ? (
        <div className="flex items-center gap-2 mt-3 px-1" style={{ color: "var(--color-success)" }}>
          <IcoCheck /><span style={{ fontSize: 13, fontWeight: 600 }}>Summary confirmed</span>
        </div>
      ) : (
        <div className="flex gap-2.5 mt-3">
          <div className="flex-1"><Btn variant="secondary" onClick={onEdit}>Edit description</Btn></div>
          <div className="flex-1"><Btn onClick={onContinue}>Looks right</Btn></div>
        </div>
      )}
    </div>
  );
}

function SafetyCard({ answered, safe, onSafe, onDanger }: { answered: boolean; safe: boolean | null; onSafe: () => void; onDanger: () => void }) {
  return (
    <div className="ml-9 flex flex-col gap-2.5">
      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.6 }}>Examples: fire, exposed electricity, major flooding, or unsafe structure.</p>
      </div>
      {answered ? (
        <div className="flex items-center gap-2 px-1" style={{ color: "var(--color-success)" }}>
          <IcoCheck /><span style={{ fontSize: 13, fontWeight: 600 }}>No immediate danger</span>
        </div>
      ) : (
        <>
          <Btn onClick={onSafe}>No, safe to continue</Btn>
          <Btn variant="secondary" onClick={onDanger}>Yes, there may be danger</Btn>
        </>
      )}
    </div>
  );
}

function DangerCard({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl px-4 py-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
        <div className="shrink-0 mt-0.5" style={{ color: "#DC2626" }}><IcoAlert /></div>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#DC2626", marginBottom: 6 }}>Potential immediate danger</p>
          <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.6 }}>{SAFETY_GUIDANCE}</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Use the emergency maintenance contact provided in your tenancy agreement.</p>
        </div>
      </div>
      <div className="mt-3"><Btn onClick={onContinue}>Continue without photos</Btn></div>
      <button onClick={onBack} className="mt-3 min-h-11" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-blue)" }}>Return to safety question</button>
    </div>
  );
}

function CapturePlanCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ n: "1", I: IcoImg, label: "Overview photo · Required", desc: "Show the whole area" }, { n: "2", I: IcoImg, label: "Close-up photo · Required", desc: "Show the affected area" }].map((item, i, arr) => (
          <div key={item.n} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 30, height: 30, background: "var(--color-blue-light)", color: "var(--color-blue)" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>{item.n}</span>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text)" }}>{item.label}</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3"><Btn onClick={onStart}>Start guided capture</Btn></div>
    </div>
  );
}

// ─── Pre-capture chat stage ───────────────────────────────────────────────────

type ChatStage =
  | "confirming-details"
  | "describing-issue"
  | "reviewing-summary"
  | "safety-check"
  | "safety-danger"
  | "capture-expectation";

function PreCaptureChat({ onReport, onFramingContext, onSafeResponse, onDangerResponse, onSafetyReview, onBack, onStartCapture, sessionId }: { onReport: (value: MaintenanceReportInput) => void; onFramingContext: (value: FramingContext | null) => void; onSafeResponse: () => void; onDangerResponse: () => void; onSafetyReview: () => void; onBack: () => void; onStartCapture: () => void; sessionId: string }) {
  const viewportRef = useReportViewport();
  const [stage, setStage] = useState<ChatStage>("confirming-details");
  const [propConfirmed, setPropConfirmed] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [safetyAnswered, setSafetyAnswered] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const understanding = useIssueUnderstanding();
  const [fallback, setFallback] = useState(false);
  const result = fallback ? null : understanding.result;
  const question = !fallback && understanding.input.clarifications.length < MAX_FOLLOW_UPS ? result?.followUpQuestions[0] : undefined;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    return () => clearTimeout(timer);
  }, [stage, propConfirmed, issueText, summaryConfirmed, safetyAnswered, understanding.pending, understanding.result, understanding.failed, fallback]);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  const advance = (next: ChatStage) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => setStage(next), 350);
  };

  const handleConfirm = () => { setPropConfirmed(true); advance("describing-issue"); };
  const handleIssueSend = () => {
    if (!inputActive || !inputVal.trim() || understanding.pending) return;
    const next = question
      ? { ...understanding.input, clarifications: [...understanding.input.clarifications, { question, answer: inputVal }] }
      : { description: inputVal, clarifications: [] };
    setIssueText(next.description);
    setFallback(false);
    setInputVal("");
    setStage("describing-issue");
    void understanding.analyze(next);
  };
  const handleSummaryConfirm = () => {
    onReport(reportFromUnderstanding(understanding.input, result));
    // Only confirmed structured fields. Raw-description fallback never enters vision.
    try { onFramingContext(validateFramingContext({ issue: result?.issue, location: result?.location, observedCondition: result?.observedCondition, summary: result?.summary })); }
    catch { onFramingContext(null); }
    setSummaryConfirmed(true); advance("safety-check");
  };
  const editDescription = () => {
    understanding.reset(); setFallback(false); setSummaryConfirmed(false); setSafetyAnswered(false);
    setInputVal(understanding.input.description); setStage("describing-issue");
  };
  const handleSafe = () => { onSafeResponse(); setSafetyAnswered(true); advance("capture-expectation"); };
  const handleDanger = () => { onDangerResponse(); setSafetyAnswered(false); setStage("safety-danger"); };
  const handleDangerBack = () => setStage("safety-check");

  const afterSummary: ChatStage[] = ["safety-check", "safety-danger", "capture-expectation"];
  const afterSafety: ChatStage[] = ["capture-expectation"];

  const summaryReady = fallback || result?.status === "sufficient";
  const inputActive = stage === "describing-issue" && !understanding.pending && !summaryReady && !understanding.failed && (!result || !!question || result.status === "not_maintenance");

  return (
    <div ref={viewportRef} className="flex flex-col h-full min-h-0 min-w-0">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <button onClick={onBack} className="p-1 -ml-1 rounded-lg active:bg-gray-100"><IcoChevLeft /></button>
        <div className="flex-1">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--color-text)" }}>Report an Issue</p>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>FixLens Assistant</p>
        </div>
        <LogoAvatar size={32} />
      </div>

      {/* Conversation */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Confirm details */}
        <AssistantBubble>Let's start by confirming your property and contact details.</AssistantBubble>
        <PropertyCard sessionId={sessionId} confirmed={propConfirmed} onConfirm={handleConfirm} />

        {/* Describe issue */}
        {(stage !== "confirming-details" || propConfirmed) && (["describing-issue", "reviewing-summary", ...afterSummary] as ChatStage[]).includes(stage) && (
          <AssistantBubble>Now describe the issue in your own words — what's happening, where it is, and when it occurs.</AssistantBubble>
        )}
        {issueText && <UserBubble>{issueText}</UserBubble>}
        {understanding.input.clarifications.map((item, index) => <div key={index} className="flex flex-col gap-4"><AssistantBubble>{item.question}</AssistantBubble><UserBubble>{item.answer}</UserBubble></div>)}
        {understanding.pending && <AssistantBubble><span role="status">Understanding your report…</span></AssistantBubble>}
        {question && stage === "describing-issue" && <AssistantBubble>{question}</AssistantBubble>}
        {result?.status === "not_maintenance" && <AssistantBubble>This report is for maintenance issues. Tell me what needs repair or attention at the property.</AssistantBubble>}
        {(understanding.failed && !fallback || result && !summaryReady && !question && result.status !== "not_maintenance") && stage === "describing-issue" && <>
          <AssistantBubble>{understanding.failed ? "I couldn't structure that description right now. Your words are still here." : "Let's keep the details you've provided. You can edit your description or continue without an automatic summary."}</AssistantBubble>
          <div className="ml-9 flex flex-col gap-2">
            {understanding.failed && <Btn onClick={() => void understanding.analyze(understanding.input)}>Retry</Btn>}
            <Btn variant="secondary" onClick={() => { setFallback(true); setStage("reviewing-summary"); }}>Continue with my description</Btn>
            <Btn variant="secondary" onClick={editDescription}>Edit description</Btn>
          </div>
        </>}

        {/* Issue summary */}
        {summaryReady && issueText && (
          <>
            <AssistantBubble>{fallback ? "Review your description before continuing." : "Here's what I understood — does this look right?"}</AssistantBubble>
            <IssueSummaryCard description={reportFromUnderstanding(understanding.input, null).description} result={result} confirmed={summaryConfirmed} onContinue={handleSummaryConfirm} onEdit={editDescription} />
          </>
        )}

        {/* Safety */}
        {afterSummary.includes(stage) && (
          <>
            <AssistantBubble>Is there any immediate danger to you or anyone else?</AssistantBubble>
            {stage === "safety-danger"
              ? <DangerCard onBack={handleDangerBack} onContinue={onSafetyReview} />
              : <SafetyCard answered={safetyAnswered} safe={safetyAnswered ? true : null} onSafe={handleSafe} onDanger={handleDanger} />
            }
          </>
        )}

        {/* Capture expectation */}
        {afterSafety.includes(stage) && safetyAnswered && (
          <>
            <AssistantBubble>Great. Next, I'll guide you through capturing the evidence.</AssistantBubble>
            <CapturePlanCard onStart={onStartCapture} />
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl" style={{ background: inputActive ? "#fff" : "var(--color-bg)", border: `1px solid ${inputActive ? "var(--color-blue-mid)" : "var(--color-border)"}`, transition: "border-color 0.2s" }}>
          <IssueComposer
            label={question ? "Your answer" : "Describe the issue"}
            maxLength={question ? MAX_ANSWER : MAX_DESCRIPTION}
            value={inputVal}
            onChange={setInputVal}
            placeholder={inputActive ? "Describe the issue…" : "Message…"}
            disabled={!inputActive}
          />
        </div>
        <button aria-label="Send description" onClick={handleIssueSend} disabled={!inputActive || !inputVal.trim()} className="shrink-0 p-2.5 rounded-full" style={{ background: inputActive ? "var(--color-blue)" : "var(--color-border)", color: "#fff", opacity: inputActive ? 1 : 0.5 }}>
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

export default function ReportWorkflow() {
  const [reportSessionId] = useState(getDemoSessionId);
  const [framingContext, setFramingContext] = useState<FramingContext | null>(null);
  const [framingBudgets] = useState(() => ({ overview: newFramingBudget(), closeup: newFramingBudget() }));
  const [step, setStep] = useState<ReportStep>("report-chat");
  const [postCapture, setPostCapture] = useState(false);
  const [safetyReview, setSafetyReview] = useState(false);
  const [report, setReport] = useState<MaintenanceReportInput>({ issueType: "Maintenance issue", location: null, condition: null, description: "", safetyResponse: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Partial<Record<PhotoType, LocalPhoto>>>({});
  const photoRef = useRef(photos);
  const [replacing,setReplacing] = useState<PhotoType|null>(null);
  const [candidate,setCandidate] = useState<LocalPhoto|null>(null);
  const candidateRef = useRef<LocalPhoto|null>(null);
  const clearCandidate = () => { if(candidateRef.current) URL.revokeObjectURL(candidateRef.current.previewUrl); candidateRef.current=null;setCandidate(null) };
  const cancelReplacement = () => { clearCandidate();setReplacing(null);setStep("report-chat") };
  const useReplacement = () => {
    const next=candidateRef.current;if(!next)return;
    const old=photoRef.current[next.role];if(old)URL.revokeObjectURL(old.previewUrl);
    photoRef.current={...photoRef.current,[next.role]:next};setPhotos(photoRef.current);
    candidateRef.current=null;setCandidate(null);setReplacing(null);setStep("report-chat");
  };
  const retake = (role: PhotoType) => {
    if(replacing){clearCandidate();setStep(role === "overview" ? "ar-overview" : "ar-closeup");return}
    const old = photoRef.current[role];
    if (old) URL.revokeObjectURL(old.previewUrl);
    const next = { ...photoRef.current }; delete next[role];
    photoRef.current = next; setPhotos(next);
    setStep(role === "overview" ? "ar-overview" : "ar-closeup");
  };
  useEffect(() => () => { Object.values(photoRef.current).forEach(photo => URL.revokeObjectURL(photo.previewUrl)); if(candidateRef.current)URL.revokeObjectURL(candidateRef.current.previewUrl); }, []);
  const acceptPhoto = (photo: LocalPhoto) => {
    if(replacing){clearCandidate();candidateRef.current=photo;setCandidate(photo);setStep(photo.role === "overview" ? "photo-overview" : "photo-closeup");return}
    const old = photoRef.current[photo.role];
    if (old) URL.revokeObjectURL(old.previewUrl);
    photoRef.current = { ...photoRef.current, [photo.role]: photo };
    setPhotos(photoRef.current);
    setStep(photo.role === "overview" ? "photo-overview" : "photo-closeup");
  };
  const annotate = (role: PhotoType, annotations: PhotoAnnotation[]) => {
    if(replacing&&candidateRef.current){candidateRef.current={...candidateRef.current,annotations};setCandidate(candidateRef.current);return}
    const photo = photoRef.current[role]; if (!photo) return;
    photoRef.current = { ...photoRef.current, [role]: { ...photo, annotations } };
    setPhotos(photoRef.current);
  };
  const [createdCase, setCreatedCase] = useState<CreatedMaintenanceCase | null>(null);
  const submission = useRef<CaseCreationAttempt | null>(null);
  const pending = useRef(false);
  const submitController = useRef<AbortController | null>(null);
  useEffect(() => () => submitController.current?.abort(), []);
  const submit = async () => {
    if (pending.current || !canSubmitReport(report.safetyResponse, !!photos.overview, !!photos.closeup)) return;
    if (safetyReview !== isSafetyReport(report.safetyResponse)) return;
    pending.current = true;
    setSubmitting(true); setSubmitError(""); setUploading(false);
    const controller = new AbortController();
    submitController.current = controller;
    try {
      submission.current ??= { ...report, demoSessionId: reportSessionId, caseKey: `demo-${crypto.randomUUID()}` };
      const result = await createMaintenanceCase(submission.current, controller.signal);
      if (controller.signal.aborted) return;
      setCreatedCase(result);
      if (!isSafetyReport(submission.current.safetyResponse)) {
        if (!photos.overview || !photos.closeup) throw new Error("Required photos missing");
        setUploading(true);
        await persistReportPhotos(result.caseKey, submission.current.demoSessionId, [photos.overview, photos.closeup], controller.signal);
      }
      if (controller.signal.aborted) return;
      setStep("success");
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      // Service errors contain status/code only; never log input or credentials.
      console.error("Report submission could not be confirmed", error instanceof Error && /^(Case submission|Submission lookup) failed \(HTTP/.test(error.message) ? error.message : "Submission unavailable");
      setSubmitError(isSafetyReport(report.safetyResponse) ? "We couldn't confirm your submission. Your report and safety response are still here. Try again." : "We couldn't finish your submission and photo upload. Your report is still here. Try again.");
    } finally {
      pending.current = false;
      if (!controller.signal.aborted) setSubmitting(false);
    }
  };
  const navigate = useNavigate();
  const inCapture = step !== "report-chat" && step !== "success";

  return (
    <>
      {step === "success" && createdCase && <SuccessScreen title={createdCase.title} onViewCase={() => navigate(casePath(createdCase.caseKey))} onHome={() => navigate("/")} />}
      {/* Preserve the conversation while capture overlays are shown. */}
      {step !== "success" && (
        <div className="absolute inset-0 flex flex-col" style={{ visibility: inCapture ? "hidden" : "visible", pointerEvents: inCapture ? "none" : "auto" }}>
          {safetyReview && <SafetyReportReview report={report} submitting={submitting} error={submitError} onSubmit={submit} onBack={!submission.current ? () => setSafetyReview(false) : undefined} />}
          <div className="h-full" style={{ display: safetyReview ? "none" : undefined }}>{postCapture
            ? <FinalReportReview report={report} photos={photos} submitting={submitting} error={submitError} uploading={uploading} locked={!!submission.current} onEdit={value=>{if(!submission.current)setReport(value)}} onSubmit={submit} onReplace={role => { if(submission.current)return;clearCandidate();setReplacing(role); setStep(role === "overview" ? "ar-overview" : "ar-closeup"); }} />
            : <PreCaptureChat sessionId={reportSessionId} onReport={setReport} onFramingContext={setFramingContext} onSafeResponse={() => setReport((current) => ({ ...current, safetyResponse: "No immediate danger reported" }))} onDangerResponse={() => setReport(current => ({ ...current, safetyResponse: IMMEDIATE_DANGER }))} onSafetyReview={() => setSafetyReview(true)} onBack={() => navigate("/")} onStartCapture={() => setStep("ar-overview")} />}</div>
        </div>
      )}
      {step === "ar-overview" && <PhotoSource role="overview" framingContext={framingContext} framingBudget={framingBudgets.overview} onPhoto={acceptPhoto} onClose={replacing?cancelReplacement:()=>setStep("report-chat")} />}
      {step === "photo-overview" && <PhotoPreview key={(replacing?candidate:photos.overview)?.id} photoType="overview" photo={replacing?candidate??undefined:photos.overview} onAnnotations={items => annotate("overview", items)} onRetake={() => retake("overview")} onCancel={replacing?cancelReplacement:undefined} onUse={replacing?useReplacement:()=>setStep("ar-closeup")} />}
      {step === "ar-closeup" && <PhotoSource role="closeup" framingContext={framingContext} framingBudget={framingBudgets.closeup} onPhoto={acceptPhoto} onClose={replacing?cancelReplacement:()=>setStep("report-chat")} />}
      {step === "photo-closeup" && <PhotoPreview key={(replacing?candidate:photos.closeup)?.id} photoType="closeup" photo={replacing?candidate??undefined:photos.closeup} onAnnotations={items => annotate("closeup", items)} onRetake={() => retake("closeup")} onCancel={replacing?cancelReplacement:undefined} onUse={replacing?useReplacement:()=>{setPostCapture(true);setStep("report-chat")}} />}
    </>
  );
}
