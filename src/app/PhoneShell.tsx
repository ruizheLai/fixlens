import type * as React from "react";

export default function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#E8E8E4" }}>
      <div className="relative overflow-hidden flex flex-col" style={{ width: 390, height: 844, background: "var(--color-bg)", borderRadius: 44, boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)", fontFamily: "var(--font-body)" }}>
        <div className="flex items-center justify-between px-8 pt-4 pb-1 shrink-0" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", background: "var(--color-surface)" }}>
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="4" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.3"/><rect x="4.5" y="2.5" width="3" height="8.5" rx="0.5" fill="currentColor" opacity="0.6"/><rect x="9" y="0" width="3" height="11" rx="0.5" fill="currentColor"/><rect x="13.5" y="3.5" width="2" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
            <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.5C9.5 2.5 11.3 3.3 12.6 4.6L14 3.2C12.3 1.5 10 0.5 7.5 0.5S2.7 1.5 1 3.2L2.4 4.6C3.7 3.3 5.5 2.5 7.5 2.5z" fill="currentColor"/><path d="M7.5 5.5C8.7 5.5 9.8 6 10.6 6.8L12 5.4C10.8 4.3 9.2 3.5 7.5 3.5S4.2 4.3 3 5.4L4.4 6.8C5.2 6 6.3 5.5 7.5 5.5z" fill="currentColor"/><circle cx="7.5" cy="9" r="1.5" fill="currentColor"/></svg>
            <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/><rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/><path d="M23 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.4"/></svg>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">{children}</div>
      </div>
    </div>
  );
}
