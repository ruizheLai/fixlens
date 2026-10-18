import type * as React from "react";
import LogoAvatar from "../brand/LogoAvatar";

export default function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="assistant-message flex gap-2.5 items-start">
      <LogoAvatar size={32} />
      <div className="assistant-message-body rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", maxWidth: 268 }}>{children}</div>
    </div>
  );
}
