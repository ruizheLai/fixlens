import { useState, useRef, useEffect } from "react";
import { createMaintenanceCase } from "../../services/cases";
import { getDemoSessionId } from "../../utils/demoSession";
import type { MaintenanceReportInput, CaseCreationAttempt, CreatedMaintenanceCase } from "../../types/report";
import { useNavigate } from "react-router-dom";
import type { ReportStep } from "../../types/navigation";
import { casePath } from "../../data/demo/cases";
import SuccessScreen from "../../screens/renter/SubmissionSuccessScreen";
import { ARVideoScreen, PhotoPreview, VideoPreview } from "../../components/capture/PrototypeCapture";
import LogoAvatar from "../../components/brand/LogoAvatar";
import Btn from "../../components/common/Btn";
import AssistantBubble from "../../components/chat/AssistantBubble";
import UserBubble from "../../components/chat/UserBubble";
import { IcoChevLeft, IcoMic, IcoSend, IcoAlert, IcoEdit, IcoCheck, IcoCheckCircle, IcoImg, IcoVideo } from "../../components/common/icons";
import type { DemoEvidence, LocalPhoto, PhotoType, PhotoAnnotation } from "../../types/evidence";
import type { ReportFieldRow } from "../../types/presentation";
import PhotoSource from "../../components/capture/PhotoSource";
import { persistReportPhotos } from "../../services/evidence";
import { useIssueUnderstanding, reportFromUnderstanding } from "./useIssueUnderstanding";
import type { IssueUnderstanding } from "../../types/issueUnderstanding";
import { MAX_DESCRIPTION, MAX_ANSWER, MAX_FOLLOW_UPS } from "../../../supabase/functions/_shared/issueUnderstanding.ts";
import { validateFramingContext, type FramingContext } from "../../../supabase/functions/_shared/captureFraming.ts";
import { newFramingBudget } from "../../components/capture/framingScheduler";

// ─── Pre-capture chat cards ───────────────────────────────────────────────────

function PropertyCard({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ label: "Name", value: "Brad Lai" }, { label: "Address", value: "12 Thornton St, Apt 4B\nMelbourne VIC 3000" }, { label: "Contact", value: "0412 345 678 · brad.m@email.com" }, { label: "Property manager", value: "Sarah Chen — Apex Rentals" }].map((row, i, arr) => (
          <div key={row.label} className="px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</p>
            <p style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.5, whiteSpace: "pre-line" }}>{row.value}</p>
          </div>
        ))}
      </div>
      {confirmed ? (
        <div className="flex items-center gap-2 mt-3 px-1" style={{ color: "var(--color-success)" }}>
          <IcoCheck /><span style={{ fontSize: 13, fontWeight: 600 }}>Details confirmed</span>
        </div>
      ) : (
        <div className="flex gap-2.5 mt-3">
          <div className="flex-1"><Btn variant="secondary">Edit</Btn></div>
          <div className="flex-1"><Btn onClick={onConfirm}>Confirm</Btn></div>
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

function DangerCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl px-4 py-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
        <div className="shrink-0 mt-0.5" style={{ color: "#DC2626" }}><IcoAlert /></div>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#DC2626", marginBottom: 6 }}>Do not approach the affected area</p>
          <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.6 }}>Contact your property manager or emergency maintenance immediately. Call 000 for life-threatening emergencies.</p>
          <button onClick={onBack} className="mt-3" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-blue)" }}>Go back</button>
        </div>
      </div>
    </div>
  );
}

function CapturePlanCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ n: "1", I: IcoImg, label: "Overview photo · Required", desc: "Show the whole area" }, { n: "2", I: IcoImg, label: "Close-up photo · Required", desc: "Show the affected area" }, { n: "3", I: IcoVideo, label: "Short video · Optional", desc: "You can skip this step" }].map((item, i, arr) => (
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

// ─── Post-capture view ────────────────────────────────────────────────────────

function PostCaptureView({ report, photos, videoIncluded, submitting, error, uploading, locked, onSubmit, onReplace }: { report: MaintenanceReportInput; photos: Partial<Record<PhotoType, LocalPhoto>>; videoIncluded: boolean; submitting: boolean; error: string; uploading: boolean; locked: boolean; onSubmit: () => void; onReplace: (role: PhotoType) => void }) {
  const [showReview, setShowReview] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showReview) return;
    const timer = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    return () => clearTimeout(timer);
  }, [showReview]);

  const reportRows: ReportFieldRow[] = [
    { label: "Issue type", value: report.issueType },
    { label: "Location", value: report.location || "Not provided" },
    { label: "Observed details", value: report.condition || "Not provided" },
    { label: "Description", value: report.description },
    { label: "Safety", value: report.safetyResponse || "Not provided", green: true },
  ];

  const mediaItems: DemoEvidence[] = [
    { label: "Overview photo", note: photos.overview?.annotations.length ? "Annotated" : "Captured", src: photos.overview?.previewUrl ?? null, type: "photo" },
    { label: "Close-up photo", note: photos.closeup?.annotations.length ? "Annotated" : "Captured", src: photos.closeup?.previewUrl ?? null, type: "photo" },
    ...(videoIncluded ? [{ label: "Short video", note: "Demo only · Not uploaded", src: null, type: "video" as const }] : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex-1">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--color-text)" }}>Report an Issue</p>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>FixLens Assistant</p>
        </div>
        <LogoAvatar size={32} />
      </div>

      {/* Continuity cue */}
      <div className="shrink-0 flex items-center gap-2 px-5 py-2.5" style={{ background: "var(--color-blue-light)", borderBottom: "1px solid var(--color-blue-mid)" }}>
        <div style={{ color: "var(--color-blue)" }}><IcoCheckCircle /></div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-blue)" }}>{report.issueType} · Draft</p>
      </div>

      {/* Scrollable conversation */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Evidence captured */}
        <AssistantBubble>Your photos are ready to review. {videoIncluded ? "Video is a local demo only." : "Optional video skipped."}</AssistantBubble>

        {/* Evidence completion card */}
        <div className="ml-9">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            {[
              { label: "Overview photo", thumb: photos.overview?.previewUrl, type: "photo" },
              { label: "Close-up photo", thumb: photos.closeup?.previewUrl, type: "photo" },
              ...(videoIncluded ? [{ label: "Short video · Demo only", thumb: null, type: "video" }] : []),
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div className="rounded-lg overflow-hidden shrink-0" style={{ width: 40, height: 32, background: "#1a1a2a" }}>
                  {item.type === "photo" && item.thumb
                    ? <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                  }
                </div>
                <p style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "var(--color-text)" }}>{item.label}</p>
                <div style={{ color: "var(--color-success)" }}><IcoCheck /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt to review */}
        <AssistantBubble>Your report is ready to review. Check the details below and make any changes before submitting.</AssistantBubble>

        {/* Review report action (before expanded) */}
        {!showReview && (
          <div className="ml-9">
            <Btn onClick={() => setShowReview(true)}>Review report</Btn>
          </div>
        )}

        {/* Full report review card */}
        {showReview && (
          <div className="ml-9">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              {/* Details rows */}
              {reportRows.map((row) => (
                <div key={row.label} className="flex items-start justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex-1">
                    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{row.label}</p>
                    <p style={{ fontSize: 13, color: row.green ? "var(--color-success)" : "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
                  </div>
                  <button style={{ color: "var(--color-blue)", marginLeft: 10, marginTop: 1, flexShrink: 0, fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 6, background: "var(--color-blue-light)", border: "none", cursor: "pointer" }}>
                    <IcoEdit /><span>Edit</span>
                  </button>
                </div>
              ))}

              {/* Media rows */}
              {mediaItems.map((m, index) => (
                <div key={m.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 52, height: 40, background: "#1a1a2a" }}>
                      {m.type === "photo" && m.src
                        ? <img src={m.src} alt={m.label} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>{m.label}</p>
                      <p style={{ fontSize: 11, color: "var(--color-success)" }}>{m.note}</p>
                    </div>
                  </div>
                  <button disabled={locked || m.type === "video"} aria-label={`Replace ${m.label}`} onClick={() => onReplace(index === 0 ? "overview" : "closeup")} style={{ opacity: locked || m.type === "video" ? 0.4 : 1, color: "var(--color-blue)", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", flexShrink: 0, padding: "2px 8px", borderRadius: 6, background: "var(--color-blue-light)", border: "none", cursor: "pointer" }}>
                    Replace
                  </button>
                </div>
              ))}

              {/* Ready indicator */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ color: "var(--color-success)" }}>
                <IcoCheckCircle />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Ready for initial review</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="mt-3">
              {error && <p role="alert" className="mb-3" style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{error}</p>}
              <Btn disabled={submitting || !photos.overview || !photos.closeup} onClick={onSubmit}>{submitting ? uploading ? "Uploading photos…" : "Submitting…" : error ? "Retry" : "Submit report"}</Btn>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Inert input bar */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex-1 flex items-center px-4 py-2.5 rounded-full" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 14, color: "var(--color-muted)" }}>Message…</span>
        </div>
        <button className="p-2.5 rounded-full" style={{ color: "var(--color-muted)" }}><IcoMic /></button>
        <button className="p-2.5 rounded-full" style={{ background: "var(--color-border)", color: "#fff", opacity: 0.5 }}><IcoSend /></button>
      </div>
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

function PreCaptureChat({ onReport, onFramingContext, onSafeResponse, onBack, onStartCapture }: { onReport: (value: MaintenanceReportInput) => void; onFramingContext: (value: FramingContext | null) => void; onSafeResponse: () => void; onBack: () => void; onStartCapture: () => void }) {
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
  const handleDanger = () => setStage("safety-danger");
  const handleDangerBack = () => setStage("safety-check");

  const afterSummary: ChatStage[] = ["safety-check", "safety-danger", "capture-expectation"];
  const afterSafety: ChatStage[] = ["capture-expectation"];

  const summaryReady = fallback || result?.status === "sufficient";
  const inputActive = stage === "describing-issue" && !understanding.pending && !summaryReady && !understanding.failed && (!result || !!question || result.status === "not_maintenance");

  return (
    <div className="flex flex-col h-full">
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
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Confirm details */}
        <AssistantBubble>Let's start by confirming your property and contact details.</AssistantBubble>
        <PropertyCard confirmed={propConfirmed} onConfirm={handleConfirm} />

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
              ? <DangerCard onBack={handleDangerBack} />
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
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: inputActive ? "#fff" : "var(--color-bg)", border: `1px solid ${inputActive ? "var(--color-blue-mid)" : "var(--color-border)"}`, transition: "border-color 0.2s" }}>
          <input
            aria-label={question ? "Your answer" : "Describe the issue"}
            maxLength={question ? MAX_ANSWER : MAX_DESCRIPTION}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleIssueSend(); }}
            placeholder={inputActive ? "Describe the issue…" : "Message…"}
            disabled={!inputActive}
            className="flex-1 min-w-0 w-full bg-transparent outline-none text-sm"
            style={{ color: "var(--color-text)", opacity: inputActive ? 1 : 0.4 }}
          />
        </div>
        <button className="p-2.5 rounded-full" style={{ color: "var(--color-muted)" }}><IcoMic /></button>
        <button aria-label="Send description" onClick={handleIssueSend} disabled={!inputActive || !inputVal.trim()} className="p-2.5 rounded-full" style={{ background: inputActive ? "var(--color-blue)" : "var(--color-border)", color: "#fff", opacity: inputActive ? 1 : 0.5 }}>
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

export default function ReportWorkflow() {
  const [framingContext, setFramingContext] = useState<FramingContext | null>(null);
  const [framingBudgets] = useState(() => ({ overview: newFramingBudget(), closeup: newFramingBudget() }));
  const [step, setStep] = useState<ReportStep>("report-chat");
  const [postCapture, setPostCapture] = useState(false);
  const [videoIncluded, setVideoIncluded] = useState(false);
  const [report, setReport] = useState<MaintenanceReportInput>({ issueType: "Maintenance issue", location: null, condition: null, description: "", safetyResponse: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Partial<Record<PhotoType, LocalPhoto>>>({});
  const photoRef = useRef(photos);
  const retake = (role: PhotoType) => {
    const old = photoRef.current[role];
    if (old) URL.revokeObjectURL(old.previewUrl);
    const next = { ...photoRef.current }; delete next[role];
    photoRef.current = next; setPhotos(next);
    setStep(role === "overview" ? "ar-overview" : "ar-closeup");
  };
  const [replacing, setReplacing] = useState(false);
  useEffect(() => () => { Object.values(photoRef.current).forEach(photo => URL.revokeObjectURL(photo.previewUrl)); }, []);
  const acceptPhoto = (photo: LocalPhoto) => {
    const old = photoRef.current[photo.role];
    if (old) URL.revokeObjectURL(old.previewUrl);
    photoRef.current = { ...photoRef.current, [photo.role]: photo };
    setPhotos(photoRef.current);
    setStep(photo.role === "overview" ? "photo-overview" : "photo-closeup");
  };
  const annotate = (role: PhotoType, annotations: PhotoAnnotation[]) => {
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
    if (pending.current || !photos.overview || !photos.closeup) return;
    pending.current = true;
    setSubmitting(true); setSubmitError(""); setUploading(false);
    const controller = new AbortController();
    submitController.current = controller;
    try {
      submission.current ??= { ...report, demoSessionId: getDemoSessionId(), caseKey: `demo-${crypto.randomUUID()}` };
      const result = await createMaintenanceCase(submission.current, controller.signal);
      if (controller.signal.aborted) return;
      setCreatedCase(result); setUploading(true);
      await persistReportPhotos(result.caseKey, submission.current.demoSessionId, [photos.overview, photos.closeup], controller.signal);
      if (controller.signal.aborted) return;
      setStep("success");
    } catch (error: unknown) {
      if (controller.signal.aborted) return;
      // Service errors contain status/code only; never log input or credentials.
      console.error("Report submission could not be confirmed", error instanceof Error && /^(Case submission|Submission lookup) failed \(HTTP/.test(error.message) ? error.message : "Submission unavailable");
      setSubmitError("We couldn't finish your submission and photo upload. Your report is still here. Try again.");
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
          {postCapture
            ? <PostCaptureView report={report} photos={photos} videoIncluded={videoIncluded} submitting={submitting} error={submitError} uploading={uploading} locked={!!submission.current} onSubmit={submit} onReplace={role => { setReplacing(true); setStep(role === "overview" ? "ar-overview" : "ar-closeup"); }} />
            : <PreCaptureChat onReport={setReport} onFramingContext={setFramingContext} onSafeResponse={() => setReport((current) => ({ ...current, safetyResponse: "No immediate danger reported" }))} onBack={() => navigate("/")} onStartCapture={() => setStep("ar-overview")} />}
        </div>
      )}
      {step === "ar-overview" && <PhotoSource role="overview" framingContext={framingContext} framingBudget={framingBudgets.overview} onPhoto={acceptPhoto} onClose={() => setStep("report-chat")} />}
      {step === "photo-overview" && <PhotoPreview key={photos.overview?.id} photoType="overview" photo={photos.overview} onAnnotations={items => annotate("overview", items)} onRetake={() => retake("overview")} onUse={() => setStep(replacing ? "report-chat" : "ar-closeup")} />}
      {step === "ar-closeup" && <PhotoSource role="closeup" framingContext={framingContext} framingBudget={framingBudgets.closeup} onPhoto={acceptPhoto} onClose={() => setStep("report-chat")} />}
      {step === "photo-closeup" && <PhotoPreview key={photos.closeup?.id} photoType="closeup" photo={photos.closeup} onAnnotations={items => annotate("closeup", items)} onRetake={() => retake("closeup")} onUse={() => setStep(replacing ? "report-chat" : "video-option")} />}
      {step === "video-option" && <div className="absolute inset-0 flex flex-col gap-4 px-5 py-5" style={{ background: "var(--color-surface)" }}>
        <button aria-label="Back to close-up" className="self-start" onClick={() => setStep("photo-closeup")}><IcoChevLeft /></button>
        <AssistantBubble>Your two photos are ready. You can add a short video if movement or sound helps show the issue, or skip for now.</AssistantBubble>
        <p className="ml-9" style={{ fontSize: 12, color: "var(--color-muted)" }}>Video is a demo simulation and is not uploaded.</p>
        <div className="ml-9 flex flex-col gap-3"><Btn onClick={() => setStep("video-capture")}>Add video</Btn><Btn variant="secondary" onClick={() => { setVideoIncluded(false); setPostCapture(true); setStep("report-chat"); }}>Skip for now</Btn></div>
      </div>}
      {step === "video-capture" && <ARVideoScreen onCapture={() => setStep("video-preview")} onClose={() => setStep("video-option")} />}
      {step === "video-preview" && <VideoPreview onRetake={() => setStep("video-capture")} onUse={() => { setVideoIncluded(true); setPostCapture(true); setStep("report-chat"); }} />}
    </>
  );
}
