import { useState, useRef, useEffect } from "react";
import LogoAvatar from "./components/brand/LogoAvatar";
import PhoneShell from "./app/PhoneShell";
import FloatingChatBtn from "./components/navigation/FloatingChatBtn";
import Btn from "./components/common/Btn";
import AssistantBubble from "./components/chat/AssistantBubble";
import UserBubble from "./components/chat/UserBubble";
import { IcoChevLeft, IcoMic, IcoSend, IcoAlert, IcoX, IcoHelp, IcoUndo, IcoEdit, IcoCheck, IcoCheckCircle, IcoImg, IcoVideo, IcoGallery, IcoFlash, IcoRedo, IcoPencil } from "./components/common/icons";
import type { AppScreen, NavItemId } from "./types/navigation";
import type { AnnotationTool, DemoEvidence, PhotoType } from "./types/evidence";
import type { ReportFieldRow } from "./types/presentation";
import HomeScreen from "./screens/renter/HomeScreen";
import ProfileScreen from "./screens/renter/ProfileScreen";
import InboxScreen from "./screens/renter/InboxScreen";
import SupportChatScreen from "./screens/renter/SupportChatScreen";
import SuccessScreen from "./screens/renter/SubmissionSuccessScreen";
import MyCasesScreen from "./screens/renter/CasesScreen";
import CaseDetailBedroom from "./screens/renter/cases/BedroomCaseDetailScreen";
import CaseDetailHotwater from "./screens/renter/cases/HotWaterCaseDetailScreen";
import CaseDetailKitchen from "./screens/renter/cases/KitchenCaseDetailScreen";
import SubmittedReportScreen from "./screens/renter/SubmittedReportScreen";

import { IMG_BEDROOM_WIDE, IMG_BEDROOM_LIGHT, IMG_DAMAGED_WALL } from "./data/demo/evidence";

// ─── App screen type ──────────────────────────────────────────────────────────

const REPORT_AR: AppScreen[] = ["ar-overview","photo-overview","ar-closeup","photo-closeup","video-capture","video-preview"];
const AR_SCREENS: AppScreen[] = [...REPORT_AR, "k-ar", "k-photo"];

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

function IssueSummaryCard({ confirmed, onContinue }: { confirmed: boolean; onContinue: () => void }) {
  return (
    <div className="ml-9">
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        {[{ label: "Issue type", value: "Water leak" }, { label: "Location", value: "Bedroom window" }, { label: "Occurs", value: "When it rains" }, { label: "Description", value: "Water leaking from the top of the bedroom window, dripping down the wall." }].map((row, i, arr) => (
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
          <div className="flex-1"><Btn variant="secondary">Edit</Btn></div>
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
        {[{ n: "1", I: IcoImg, label: "Overview photo", desc: "Show the whole area" }, { n: "2", I: IcoImg, label: "Close-up photo", desc: "Show the affected area" }, { n: "3", I: IcoVideo, label: "Short video", desc: "Issue and surrounding context" }].map((item, i, arr) => (
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

function PostCaptureView({ onSubmit }: { onSubmit: () => void }) {
  const [showReview, setShowReview] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showReview) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [showReview]);

  const reportRows: ReportFieldRow[] = [
    { label: "Issue type", value: "Water leak" },
    { label: "Location", value: "Bedroom window" },
    { label: "Occurs", value: "When it rains" },
    { label: "Description", value: "Water leaking from the top of the bedroom window, dripping down the wall." },
    { label: "Safety", value: "No immediate danger reported", green: true },
  ];

  const mediaItems: DemoEvidence[] = [
    { label: "Overview photo", note: "Annotated — Leak point marked", src: IMG_BEDROOM_WIDE, type: "photo" },
    { label: "Close-up photo", note: "Captured", src: IMG_DAMAGED_WALL, type: "photo" },
    { label: "Short video", note: "0:04 · Captured", src: null, type: "video" },
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
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--color-blue)" }}>Bedroom window leak · Draft</p>
      </div>

      {/* Scrollable conversation */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Evidence captured */}
        <AssistantBubble>Great — your evidence has been captured.</AssistantBubble>

        {/* Evidence completion card */}
        <div className="ml-9">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            {[
              { label: "Overview photo", thumb: IMG_BEDROOM_WIDE, type: "photo" },
              { label: "Close-up photo", thumb: IMG_DAMAGED_WALL, type: "photo" },
              { label: "Short video", thumb: null, type: "video" },
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
              {mediaItems.map((m) => (
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
                  <button style={{ color: "var(--color-blue)", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-display)", flexShrink: 0, padding: "2px 8px", borderRadius: 6, background: "var(--color-blue-light)", border: "none", cursor: "pointer" }}>
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
              <Btn onClick={onSubmit}>Submit report</Btn>
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

function PreCaptureChat({ onBack, onStartCapture }: { onBack: () => void; onStartCapture: () => void }) {
  const [stage, setStage] = useState<ChatStage>("confirming-details");
  const [propConfirmed, setPropConfirmed] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [summaryConfirmed, setSummaryConfirmed] = useState(false);
  const [safetyAnswered, setSafetyAnswered] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

  useEffect(() => { scrollDown(); }, [stage, propConfirmed, issueText, summaryConfirmed, safetyAnswered]);

  const advance = (next: ChatStage) => { setTimeout(() => setStage(next), 350); };

  const handleConfirm = () => { setPropConfirmed(true); advance("describing-issue"); };
  const handleIssueSend = () => {
    if (!inputVal.trim()) return;
    setIssueText(inputVal.trim());
    setInputVal("");
    advance("reviewing-summary");
  };
  const handleSummaryConfirm = () => { setSummaryConfirmed(true); advance("safety-check"); };
  const handleSafe = () => { setSafetyAnswered(true); advance("capture-expectation"); };
  const handleDanger = () => setStage("safety-danger");
  const handleDangerBack = () => setStage("safety-check");

  const afterSummary: ChatStage[] = ["safety-check", "safety-danger", "capture-expectation"];
  const afterSafety: ChatStage[] = ["capture-expectation"];

  const inputActive = stage === "describing-issue";

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

        {/* Issue summary */}
        {(["reviewing-summary", ...afterSummary] as ChatStage[]).includes(stage) && issueText && (
          <>
            <AssistantBubble>Thanks! Here's what I got — does this look right?</AssistantBubble>
            <IssueSummaryCard confirmed={summaryConfirmed} onContinue={handleSummaryConfirm} />
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
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleIssueSend(); }}
            placeholder={inputActive ? "Describe the issue…" : "Message…"}
            disabled={!inputActive}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--color-text)", opacity: inputActive ? 1 : 0.4 }}
          />
        </div>
        <button className="p-2.5 rounded-full" style={{ color: "var(--color-muted)" }}><IcoMic /></button>
        <button onClick={handleIssueSend} disabled={!inputActive} className="p-2.5 rounded-full" style={{ background: inputActive ? "var(--color-blue)" : "var(--color-border)", color: "#fff", opacity: inputActive ? 1 : 0.5 }}>
          <IcoSend />
        </button>
      </div>
    </div>
  );
}

// ─── AR + Photo screens ───────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="rounded-full" style={{ width: current === s ? 28 : 8, height: 8, background: current === s ? "#fff" : s < current ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)", transition: "all 0.2s" }} />
      ))}
    </div>
  );
}

// Shared AR layout: camera fills full screen, UI overlaid absolutely
// Top strip anchored to top:0, shutter strip anchored to bottom:0 — no flex math involved.

const SHUTTER_H = 110;

function ARShell({
  bgSrc, dimOpacity, step, label, tipText, onClose, children, shutterSlot, belowProgress,
}: {
  bgSrc: string; dimOpacity: number; step: number; label: string; tipText: string;
  onClose: () => void; children?: React.ReactNode; shutterSlot: React.ReactNode;
  belowProgress?: React.ReactNode;
}) {
  const [tipVisible, setTipVisible] = useState(true);
  useEffect(() => {
    setTipVisible(true);
    const t = setTimeout(() => setTipVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const iconBtn: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <img src={bgSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${dimOpacity})` }} />

      {/* AR guides */}
      <div style={{ position: "absolute", inset: 0, bottom: SHUTTER_H }}>{children}</div>

      {/* Top strip: X | title | ? then progress below */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px 10px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onClose} style={iconBtn}><IcoX /></button>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{label}</p>
          <button onClick={() => setTipVisible(true)} style={iconBtn}><IcoHelp /></button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <StepDots current={step} />
        </div>
        {belowProgress && <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>{belowProgress}</div>}
      </div>

      {/* Floating guidance tip */}
      {tipVisible && (
        <div style={{ position: "absolute", bottom: SHUTTER_H + 16, left: 16, right: 16, zIndex: 20 }}>
          <div style={{ borderRadius: 14, padding: "12px 14px", background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <p style={{ flex: 1, color: "#fff", fontSize: 13, lineHeight: 1.5 }}>{tipText}</p>
            <button onClick={() => setTipVisible(false)} style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, marginTop: 1, border: "none", background: "none", cursor: "pointer", padding: 2 }}>
              <IcoX />
            </button>
          </div>
        </div>
      )}

      {/* Shutter strip — icon-only library / shutter / flash */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: SHUTTER_H, zIndex: 10, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" }}>
        <button style={{ color: "rgba(255,255,255,0.8)", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcoGallery />
        </button>
        {shutterSlot}
        <button style={{ color: "rgba(255,255,255,0.8)", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcoFlash />
        </button>
      </div>
    </div>
  );
}

function ShutterCircle({ onCapture }: { onCapture: () => void }) {
  return (
    <button
      onClick={onCapture}
      style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      className="active:scale-95 transition-transform"
    >
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fff", border: "3px solid #111" }} />
    </button>
  );
}

function AROverviewScreen({ onCapture, onClose }: { onCapture: () => void; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <ARShell
      bgSrc={IMG_BEDROOM_WIDE}
      dimOpacity={0.18}
      step={1}
      label="Overview"
      tipText="Capture an overview of the issue. Try to include the whole window, surrounding wall, and nearby affected area."
      onClose={onClose}
      shutterSlot={<ShutterCircle onCapture={onCapture} />}
    >
      {/* AR framing guides */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 620" preserveAspectRatio="xMidYMid meet">
        {/* Outer context dashes */}
        <rect x="16" y="16" width="358" height="588" rx="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="6,4"/>
        {/* Window-aligned frame */}
        <rect x="70" y="60" width="250" height="320" rx="6" fill="none" stroke={ready ? "#34D399" : "rgba(255,255,255,0.75)"} strokeWidth="2" style={{ transition: "stroke 0.5s" }}/>
        {/* Corner accents */}
        {([[70,60],[320,60],[70,380],[320,380]] as [number,number][]).map(([cx, cy], i) => {
          const dx = cx < 195 ? 1 : -1; const dy = cy < 300 ? 1 : -1;
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={cx+dx*22} y2={cy} stroke={ready ? "#34D399" : "#fff"} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "stroke 0.5s" }}/>
              <line x1={cx} y1={cy} x2={cx} y2={cy+dy*22} stroke={ready ? "#34D399" : "#fff"} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "stroke 0.5s" }}/>
            </g>
          );
        })}
        {/* Step-back arrow */}
        {!ready && (
          <>
            <defs><marker id="aw" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.8)"/></marker></defs>
            <path d="M195 460 L195 500" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#aw)"/>
            <text x="205" y="496" fill="rgba(255,255,255,0.65)" fontSize="11" fontFamily="Inter,sans-serif">Step back</text>
          </>
        )}
      </svg>
      {/* Feedback pill — above shutter strip */}
    </ARShell>
  );
}

function ARCloseupScreen({ onCapture, onClose }: { onCapture: () => void; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 2000); return () => clearTimeout(t); }, []);
  return (
    <ARShell
      bgSrc={IMG_DAMAGED_WALL}
      dimOpacity={0.25}
      step={2}
      label="Close-up"
      tipText="Move closer and clearly show the affected area."
      onClose={onClose}
      shutterSlot={<ShutterCircle onCapture={onCapture} />}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 620" preserveAspectRatio="xMidYMid meet">
        <ellipse cx="195" cy="300" rx="120" ry="150" fill={ready ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.04)"} stroke={ready ? "#34D399" : "rgba(255,255,255,0.6)"} strokeWidth="2" strokeDasharray={ready ? undefined : "6,4"} style={{ transition: "all 0.5s" }}/>
        {/* Crosshair */}
        <line x1="188" y1="297" x2="202" y2="297" stroke={ready ? "#34D399" : "rgba(255,255,255,0.8)"} strokeWidth="2" style={{ transition: "stroke 0.5s" }}/>
        <line x1="195" y1="290" x2="195" y2="304" stroke={ready ? "#34D399" : "rgba(255,255,255,0.8)"} strokeWidth="2" style={{ transition: "stroke 0.5s" }}/>
        {ready && (
          <>
            <line x1="315" y1="220" x2="280" y2="268" stroke="#34D399" strokeWidth="1.2"/>
            <rect x="304" y="202" width="80" height="22" rx="4" fill="rgba(0,0,0,0.65)"/>
            <text x="344" y="217" textAnchor="middle" fill="#34D399" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="600">Damage area</text>
          </>
        )}
      </svg>
    </ARShell>
  );
}

function ARVideoScreen({ onCapture, onClose }: { onCapture: () => void; onClose: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    iv.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    setTimeout(() => { setRecording(false); if (iv.current) clearInterval(iv.current); onCapture(); }, 4000);
  };
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const videoShutter = (
    <button
      onClick={handleRecord}
      style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      className="active:scale-95 transition-transform"
    >
      <div style={{ width: recording ? 22 : 28, height: recording ? 22 : 28, background: "#DC2626", borderRadius: recording ? 4 : 14, transition: "all 0.2s" }} />
    </button>
  );

  const timerSlot = recording ? (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "rgba(220,38,38,0.85)", backdropFilter: "blur(6px)" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} className="animate-pulse" />
      <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em" }}>{fmt(seconds)}</span>
    </div>
  ) : undefined;

  return (
    <ARShell
      bgSrc={IMG_BEDROOM_LIGHT}
      dimOpacity={0.22}
      step={3}
      label="Video"
      tipText="Record a short video showing the issue and surrounding context."
      onClose={onClose}
      shutterSlot={videoShutter}
      belowProgress={timerSlot}
    >
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 620" preserveAspectRatio="xMidYMid meet">
        {!recording && (
          <>
            <path d="M70 180 Q195 120 320 190 Q320 370 195 430 Q100 470 70 530" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="6,4"/>
            <polygon points="64,528 70,542 76,528" fill="rgba(255,255,255,0.5)"/>
            <text x="84" y="542" fill="rgba(255,255,255,0.6)" fontSize="11" fontFamily="Inter,sans-serif">Pan slowly</text>
          </>
        )}
        {recording && <rect x="10" y="10" width="370" height="600" rx="8" fill="none" stroke="rgba(220,38,38,0.75)" strokeWidth="2.5"/>}
      </svg>
    </ARShell>
  );
}

const PREVIEW_BOTTOM_H = 88;

const ANNO_TOOLS = [
  { id: "circle" as const, label: "Circle", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg> },
  { id: "arrow" as const, label: "Arrow", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg> },
  { id: "text" as const, label: "Text", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> },
  { id: "draw" as const, label: "Draw", icon: <IcoPencil /> },
];

function PhotoPreview({ photoType, onRetake, onUse }: { photoType: PhotoType; onRetake: () => void; onUse: () => void }) {
  const [activeTool, setActiveTool] = useState<AnnotationTool | null>(null);
  const [tipVisible, setTipVisible] = useState(photoType === "overview");
  const src = photoType === "overview" ? IMG_BEDROOM_WIDE : IMG_DAMAGED_WALL;
  const title = photoType === "overview" ? "Overview — 1 of 3" : "Close-up — 2 of 3";

  useEffect(() => {
    if (photoType !== "overview") return;
    setTipVisible(true);
    const t = setTimeout(() => setTipVisible(false), 5000);
    return () => clearTimeout(t);
  }, [photoType]);

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      {/* Full-bleed image */}
      <img src={src} alt={photoType} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Annotation overlay */}
      {photoType === "overview" && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 844" preserveAspectRatio="none">
          <ellipse cx="195" cy="280" rx="60" ry="54" fill="none" stroke="#F59E0B" strokeWidth="2.5"/>
          <line x1="255" y1="258" x2="295" y2="228" stroke="#F59E0B" strokeWidth="1.8"/>
          <rect x="283" y="213" width="72" height="22" rx="4" fill="rgba(0,0,0,0.7)"/>
          <text x="319" y="228" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600">Leak point</text>
        </svg>
      )}
      {photoType === "closeup" && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 844" preserveAspectRatio="none">
          <ellipse cx="195" cy="430" rx="80" ry="90" fill="rgba(251,191,36,0.08)" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,3"/>
        </svg>
      )}

      {/* Top strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px 10px", background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onRetake} style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", background: "rgba(0,0,0,0.4)", padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer" }}>Retake</button>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{title}</p>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Undo — left arrow */}
            <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <IcoUndo />
            </button>
            {/* Redo — right arrow */}
            <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
              <IcoRedo />
            </button>
          </div>
        </div>
      </div>

      {/* Annotation tip — overview only */}
      {tipVisible && (
        <div style={{ position: "absolute", bottom: PREVIEW_BOTTOM_H + 16, left: 16, right: 16, zIndex: 20 }}>
          <div style={{ borderRadius: 14, padding: "12px 14px", background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <p style={{ flex: 1, color: "#fff", fontSize: 13, lineHeight: 1.5 }}>You can add simple annotations to help explain the issue more clearly.</p>
            <button onClick={() => setTipVisible(false)} style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0, marginTop: 1, border: "none", background: "none", cursor: "pointer", padding: 2 }}>
              <IcoX />
            </button>
          </div>
        </div>
      )}

      {/* Bottom strip */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: PREVIEW_BOTTOM_H, zIndex: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", padding: "0 20px", gap: 8 }}>
        {/* Annotation tools — individual lightweight icons, no grouped container */}
        {ANNO_TOOLS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setActiveTool(activeTool === id ? null : id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 0", background: "none", border: "none", cursor: "pointer", color: activeTool === id ? "#F59E0B" : "rgba(255,255,255,0.65)" }}>
            {icon}
            <span style={{ fontSize: 9, fontWeight: 500 }}>{label}</span>
          </button>
        ))}
        {/* Separator */}
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
        {/* Use photo */}
        <button onClick={onUse} style={{ flexShrink: 0, background: "var(--color-blue)", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", padding: "12px 18px", borderRadius: 14, border: "none", cursor: "pointer" }}>
          Use photo
        </button>
      </div>
    </div>
  );
}

function VideoPreview({ onRetake, onUse }: { onRetake: () => void; onUse: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      <img src={IMG_BEDROOM_LIGHT} alt="Video preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
      {/* Play overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Tap to preview</p>
      </div>
      {/* Duration badge */}
      <div style={{ position: "absolute", top: 80, right: 20, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,0.6)" }}>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>0:04</p>
      </div>
      {/* Top strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px 10px", background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onRetake} style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", background: "rgba(0,0,0,0.4)", padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer" }}>Retake</button>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Video — 3 of 3</p>
          <div style={{ width: 80 }} />
        </div>
      </div>
      {/* Bottom strip */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: PREVIEW_BOTTOM_H, zIndex: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 20px", gap: 12 }}>
        <button onClick={onRetake} style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer" }}>Retake</button>
        <button onClick={onUse} style={{ background: "var(--color-blue)", color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)", padding: "12px 24px", borderRadius: 14, border: "none", cursor: "pointer" }}>Use video</button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [postCapture, setPostCapture] = useState(false);
  const [kitchenEvidenceAdded, setKitchenEvidenceAdded] = useState(false);
  // track where "submitted-report" came from so back goes to the right case
  const [reportBackScreen, setReportBackScreen] = useState<AppScreen>("case-bedroom");

  const inAR = AR_SCREENS.includes(screen);

  const FLOAT_SCREENS: AppScreen[] = ["home","my-cases","inbox","profile","case-bedroom","case-kitchen","case-hotwater"];
  const showFloat = FLOAT_SCREENS.includes(screen);

  function handleNav(id: NavItemId) {
    if (id === "home")    setScreen("home");
    else if (id === "cases")   setScreen("my-cases");
    else if (id === "inbox")   setScreen("inbox");
    else if (id === "profile") setScreen("profile");
  }

  function goReport(from: AppScreen) {
    setReportBackScreen(from);
    setScreen("submitted-report");
  }

  return (
    <PhoneShell>
      {/* Home */}
      {screen === "home" && (
        <HomeScreen
          onReport={() => { setPostCapture(false); setScreen("report-chat"); }}
          onMyCases={() => setScreen("my-cases")}
          onCaseDetail={() => setScreen("case-bedroom")}
          onInbox={() => setScreen("inbox")}
          onSupportChat={() => setScreen("support-chat")}
          onNav={handleNav}
        />
      )}

      {/* Support chat */}
      {screen === "support-chat" && <SupportChatScreen onBack={() => setScreen("home")} />}

      {/* My Cases */}
      {screen === "my-cases" && (
        <MyCasesScreen
          onCaseBedroom={() => setScreen("case-bedroom")}
          onCaseKitchen={() => setScreen("case-kitchen")}
          onCaseHotwater={() => setScreen("case-hotwater")}
          onNav={handleNav}
        />
      )}

      {/* Case Detail — Bedroom */}
      {screen === "case-bedroom" && (
        <CaseDetailBedroom
          onBack={() => setScreen("my-cases")}
          onViewReport={() => goReport("case-bedroom")}
          onNav={handleNav}
        />
      )}

      {/* Case Detail — Kitchen */}
      {screen === "case-kitchen" && (
        <CaseDetailKitchen
          onBack={() => setScreen("my-cases")}
          onAddEvidence={() => setScreen("k-ar")}
          evidenceAdded={kitchenEvidenceAdded}
          onNav={handleNav}
        />
      )}

      {/* Case Detail — Hot water */}
      {screen === "case-hotwater" && (
        <CaseDetailHotwater
          onBack={() => setScreen("my-cases")}
          onViewReport={() => goReport("case-hotwater")}
          onNav={handleNav}
        />
      )}

      {/* Inbox */}
      {screen === "inbox" && (
        <InboxScreen
          onNotifBedroom={() => setScreen("case-bedroom")}
          onNotifKitchen={() => setScreen("case-kitchen")}
          onNav={handleNav}
        />
      )}

      {/* Profile */}
      {screen === "profile" && <ProfileScreen onNav={handleNav} />}

      {/* Submitted report */}
      {screen === "submitted-report" && <SubmittedReportScreen onBack={() => setScreen(reportBackScreen)} />}

      {/* Success */}
      {screen === "success" && <SuccessScreen onViewCase={() => setScreen("case-bedroom")} onHome={() => setScreen("home")} />}

      {/* Floating chat button */}
      {showFloat && <FloatingChatBtn onClick={() => setScreen("support-chat")} />}

      {/* Report chat layer — always rendered when in report or AR flow, hidden during AR */}
      {(screen === "report-chat" || (inAR && REPORT_AR.includes(screen))) && (
        <div
          className="absolute inset-0 flex flex-col"
          style={{ visibility: REPORT_AR.includes(screen) ? "hidden" : "visible", pointerEvents: REPORT_AR.includes(screen) ? "none" : "auto" }}
        >
          {postCapture
            ? <PostCaptureView onSubmit={() => setScreen("success")} />
            : <PreCaptureChat onBack={() => setScreen("home")} onStartCapture={() => setScreen("ar-overview")} />
          }
        </div>
      )}

      {/* Main report AR screens */}
      {screen === "ar-overview" && <AROverviewScreen onCapture={() => setScreen("photo-overview")} onClose={() => setScreen("report-chat")} />}
      {screen === "photo-overview" && <PhotoPreview photoType="overview" onRetake={() => setScreen("ar-overview")} onUse={() => setScreen("ar-closeup")} />}
      {screen === "ar-closeup" && <ARCloseupScreen onCapture={() => setScreen("photo-closeup")} onClose={() => setScreen("report-chat")} />}
      {screen === "photo-closeup" && <PhotoPreview photoType="closeup" onRetake={() => setScreen("ar-closeup")} onUse={() => setScreen("video-capture")} />}
      {screen === "video-capture" && <ARVideoScreen onCapture={() => setScreen("video-preview")} onClose={() => setScreen("report-chat")} />}
      {screen === "video-preview" && (
        <VideoPreview
          onRetake={() => setScreen("video-capture")}
          onUse={() => { setPostCapture(true); setScreen("report-chat"); }}
        />
      )}

      {/* Kitchen evidence add-on AR flow */}
      {screen === "k-ar" && <ARCloseupScreen onCapture={() => setScreen("k-photo")} onClose={() => setScreen("case-kitchen")} />}
      {screen === "k-photo" && (
        <PhotoPreview
          photoType="closeup"
          onRetake={() => setScreen("k-ar")}
          onUse={() => { setKitchenEvidenceAdded(true); setScreen("case-kitchen"); }}
        />
      )}
    </PhoneShell>
  );
}
