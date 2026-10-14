import { useState, useRef, useEffect } from "react";
import LogoAvatar from "../../components/brand/LogoAvatar";
import AssistantBubble from "../../components/chat/AssistantBubble";
import UserBubble from "../../components/chat/UserBubble";
import { IcoChevLeft, IcoMic, IcoSend } from "../../components/common/icons";
import type { ChatMessage } from "../../types/chat";

const SUPPORT_CHIPS = [
  "What counts as urgent?",
  "How long does maintenance usually take?",
  "Why do I need to upload photos?",
  "How do I contact my property manager?",
];

const SUPPORT_REPLIES: Record<string, string> = {
  "What counts as urgent?": "Urgent issues are those that pose a risk to health, safety, or significant property damage — such as flooding, exposed wiring, gas leaks, or no heating in winter.",
  "How long does maintenance usually take?": "Most repairs are arranged within 5–10 business days. Urgent issues are typically addressed within 24 hours.",
  "Why do I need to upload photos?": "Photos help your property manager understand the issue clearly and give your landlord the evidence needed to approve the repair.",
  "How do I contact my property manager?": "Your property manager is listed on your Profile. Contact details are usually in your tenancy agreement.",
};

export default function SupportChatScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
  }, []);
  const scrollDown = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const sendChip = (chip: string) => {
    const reply = SUPPORT_REPLIES[chip] || "Thanks for your question. We'll look into this and follow up.";
    setMessages((m) => [...m, { from: "user", text: chip }, { from: "assistant", text: reply }]);
    scrollDown();
  };
  const sendInput = () => {
    if (!inputVal.trim()) return;
    setMessages((m) => [...m, { from: "user", text: inputVal.trim() }, { from: "assistant", text: "Thanks for reaching out. Your property manager has been notified and will follow up shortly." }]);
    setInputVal("");
    scrollDown();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <button onClick={onBack} className="p-1 -ml-1 rounded-lg active:bg-gray-100"><IcoChevLeft /></button>
        <div className="flex-1">
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--color-text)" }}>Support</p>
          <p style={{ fontSize: 12, color: "var(--color-muted)" }}>FixLens Assistant</p>
        </div>
        <LogoAvatar size={32} />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        <AssistantBubble>What can I help you with today?</AssistantBubble>

        {messages.length === 0 && (
          <div className="ml-9 flex flex-col gap-2">
            {SUPPORT_CHIPS.map((chip) => (
              <button key={chip} onClick={() => sendChip(chip)} className="text-left px-4 py-3 rounded-2xl active:opacity-80" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: 13, color: "var(--color-blue)", fontWeight: 500 }}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          msg.from === "user"
            ? <UserBubble key={i}>{msg.text}</UserBubble>
            : <AssistantBubble key={i}>{msg.text}</AssistantBubble>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: "#fff", border: "1px solid var(--color-blue-mid)" }}>
          <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendInput(); }}
            placeholder="Ask a question…" className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--color-text)" }} />
        </div>
        <button className="p-2.5 rounded-full" style={{ color: "var(--color-muted)" }}><IcoMic /></button>
        <button onClick={sendInput} className="p-2.5 rounded-full" style={{ background: "var(--color-blue)", color: "#fff" }}><IcoSend /></button>
      </div>
    </div>
  );
}
