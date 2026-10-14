import { useEffect, useRef, useState } from "react";
import type { EvidenceRequest } from "../../types/evidence";
import ScreenHeader from "../../components/common/ScreenHeader";
import Btn from "../../components/common/Btn";
import { getDemoSessionId } from "../../utils/demoSession";
import { submitWrittenResponse } from "../../services/writtenResponse";
import { MAX_WRITTEN_RESPONSE, validWrittenResponse } from "../../data/evidenceRequestPresentation";

export default function WrittenDetailsWorkflow({ request, caseTitle, onExit, onSubmitted }: { request: EvidenceRequest; caseTitle: string; onExit: () => void; onSubmitted: () => void }) {
  const [text, setText] = useState("");
  const [session] = useState(getDemoSessionId);
  const [pending, setPending] = useState(false), [error, setError] = useState(false);
  const controller = useRef<AbortController | null>(null), frozen = useRef<string | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!validWrittenResponse(text) || controller.current) return;
    frozen.current ??= text;
    const current = new AbortController(); controller.current = current; setPending(true); setError(false);
    try { await submitWrittenResponse(request.id, frozen.current, session, current.signal); if (!current.signal.aborted) onSubmitted(); }
    catch { if (!current.signal.aborted) setError(true); }
    finally { controller.current = null; if (!current.signal.aborted) setPending(false); }
  }
  return <div className="flex flex-col h-full"><ScreenHeader title="More written details requested" onBack={() => { if (!pending) onExit(); }} />
    <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>{caseTitle}</h2><p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.6 }}>{request.instruction}</p>
      <label style={{ fontSize: 14, fontWeight: 600 }}>Your response<textarea required rows={6} maxLength={MAX_WRITTEN_RESPONSE} value={text} disabled={pending || frozen.current !== null} onChange={e => setText(e.target.value)} style={{ display: "block", width: "100%", fontSize: 16, marginTop: 8, padding: 12, border: "1px solid var(--color-border)", borderRadius: 12, background: "var(--color-surface)", resize: "vertical", scrollMarginBottom: 100 }} /></label>
      <p style={{ fontSize: 12, color: "var(--color-muted)" }}>{text.length}/{MAX_WRITTEN_RESPONSE} · Your original report and case status will stay the same.</p>
      {error && <p role="alert">We couldn't confirm submission. Your response is still here. Retry safely without duplicates, or go back and refresh to check whether it was received.</p>}
      <Btn disabled={pending || !validWrittenResponse(text)}>{pending ? "Submitting response…" : error ? "Retry" : "Submit response"}</Btn>
    </form></div>;
}
