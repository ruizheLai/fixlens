import type * as React from "react";

export default function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="user-message-body rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed" style={{ background: "var(--color-blue)", color: "#fff", maxWidth: 260 }}>{children}</div>
    </div>
  );
}
