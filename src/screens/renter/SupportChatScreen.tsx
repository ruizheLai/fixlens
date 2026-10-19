import { useEffect, useRef, useState } from "react";
import LogoAvatar from "../../components/brand/LogoAvatar";
import AssistantBubble from "../../components/chat/AssistantBubble";
import UserBubble from "../../components/chat/UserBubble";
import IssueComposer from "../../features/report/IssueComposer";
import { useReportViewport } from "../../features/report/useReportViewport";
import { IcoChevLeft, IcoSend } from "../../components/common/icons";
import { answerMaintenanceQuestion, SupportError } from "../../services/support";
import { MAX_HISTORY, MAX_QUESTION, SUPPORT_OPENING, SUPPORT_SUGGESTIONS, type SupportTurn } from "../../../supabase/functions/_shared/support.ts";

interface Attempt { question: string; history: SupportTurn[] }
export default function SupportChatScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<SupportTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState<Attempt | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const viewport = useReportViewport();
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const timer = setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 80);
    return () => clearTimeout(timer);
  }, [messages, pending, error]);
  useEffect(() => {
    if (!retryAt) return;
    const timer = setTimeout(() => setRetryAt(0), Math.max(0, retryAt - Date.now()));
    return () => clearTimeout(timer);
  }, [retryAt]);
  async function send(question = input, retry?: Attempt) {
    if (!question.trim() || question.length > MAX_QUESTION || controller.current || retryAt > Date.now()) return;
    const attempt = retry ?? { question: question.trim(), history: messages.slice(-MAX_HISTORY) };
    const active = new AbortController(); controller.current = active;
    setPending(true); setError(""); setFailed(null);
    if (!retry) { setMessages(m => [...m, { role: "user", text: attempt.question }].slice(-40) as SupportTurn[]); setInput(""); }
    try {
      const reply = await answerMaintenanceQuestion(attempt.question, attempt.history, active.signal);
      if (!active.signal.aborted) setMessages(m => [...m, { role: "assistant", text: reply.answer }].slice(-40) as SupportTurn[]);
    } catch (failure) {
      if (!active.signal.aborted) {
        setFailed(attempt);
        setError(failure instanceof SupportError ? failure.message : "I couldn't answer right now. Your question is still here. Please retry.");
        if (failure instanceof SupportError && failure.retryAfter) setRetryAt(Date.now() + failure.retryAfter * 1000);
      }
    } finally { if (controller.current === active) controller.current = null; if (!active.signal.aborted) setPending(false); }
  }
  return <div ref={viewport} className="fixlens-visual report-experience support-experience flex flex-col h-full min-h-0 min-w-0">
    <div className="report-header shrink-0 flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <button aria-label="Back" onClick={onBack} className="rounded-lg"><IcoChevLeft /></button>
      <div className="flex-1"><h1 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>FixLens Assistant</h1><p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Maintenance support</p></div>
      <LogoAvatar size={32} />
    </div>
    <div className="report-conversation flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <AssistantBubble>{SUPPORT_OPENING}</AssistantBubble>
      <div role="log" aria-label="Maintenance support conversation" aria-live="polite" aria-relevant="additions" className="flex flex-col gap-4">
        {messages.map((message, i) => message.role === "user" ? <UserBubble key={i}>{message.text}</UserBubble> : <AssistantBubble key={i}>{message.text}</AssistantBubble>)}
      </div>
      {pending && <AssistantBubble><span role="status">Thinking about your question…</span></AssistantBubble>}
      {error && <div role="alert" className="ml-9"><p>{error}</p>{retryAt > 0 && <p style={{ fontSize: 12 }}>Available to retry after {new Date(retryAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</p>}<button disabled={pending || retryAt > Date.now()} className="w-full mt-3 font-semibold" onClick={() => failed && void send(failed.question, failed)}>Retry question</button></div>}
      <div className="ml-9 flex flex-col gap-2" aria-label="Suggested questions">
        {SUPPORT_SUGGESTIONS.map(question => <button key={question} disabled={pending || retryAt > Date.now()} onClick={() => void send(question)} className="text-left px-4 py-3 rounded-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13 }}>{question}</button>)}
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>General maintenance support. This chat cannot inspect your cases or contact your property manager.</p>
      <div ref={bottom} />
    </div>
    <div className="report-composer shrink-0 flex items-center gap-2 px-4 py-3" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
      <div className="flex-1 min-w-0 px-4 py-2.5" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}><IssueComposer value={input} onChange={setInput} disabled={pending} maxLength={MAX_QUESTION} label="Maintenance question" placeholder="Ask a maintenance question…" /></div>
      <button aria-label="Send question" disabled={pending || retryAt > Date.now() || !input.trim()} onClick={() => void send()} style={{ background: "var(--color-blue)", color: "#fff" }}><IcoSend /></button>
    </div>
  </div>;
}
