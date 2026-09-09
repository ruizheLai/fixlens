import { useState, useRef, useEffect } from "react";
import Logo from "./imports/Logo/index";
import FixLensWordmark from "./imports/FixLens/index";

function LogoAvatar({ size = 32 }: { size?: number }) {
  const pad = Math.round(size * 0.14);
  return (
    <div className="shrink-0 rounded-full overflow-hidden flex items-center justify-center" style={{ width: size, height: size, background: "#fff", border: "1px solid #E4E4E1", padding: pad }}>
      <Logo />
    </div>
  );
}

// "Fix" portion is #1C4B88 navy, "Lens" is #2563EB blue — original proportions from Figma asset
// Fix viewBox: 181.352 × 100, Lens viewBox: 251.448 × 94.5455
// Combined wordmark natural width ≈ 181+251 = 432 units, height ≈ 100 units
// At h=26px that's width ≈ 26 * (432/100) ≈ 112px
// FixLens wordmark — grouped asset from Figma (viewBox 446.72 × 101.455)
// Rendered at height 26px → width ≈ 26 * (446.72/101.455) ≈ 115px
function HomeWordmark() {
  return (
    <div style={{ height: 26, width: 26 * (446.72 / 101.455), flexShrink: 0 }}>
      <FixLensWordmark />
    </div>
  );
}

// ─── Image URLs ───────────────────────────────────────────────────────────────
const IMG_BEDROOM_WIDE =
  "https://images.unsplash.com/photo-1780399334745-9d3592d319b2?w=600&h=960&fit=crop&auto=format";
const IMG_BEDROOM_LIGHT =
  "https://images.unsplash.com/photo-1764867269037-90e860fbf571?w=600&h=960&fit=crop&auto=format";
const IMG_DAMAGED_WALL =
  "https://images.unsplash.com/photo-1542407424724-5426773d65a5?w=600&h=960&fit=crop&auto=format";

// ─── App screen type ──────────────────────────────────────────────────────────
type AppScreen =
  | "home"
  | "my-cases"
  | "case-bedroom"
  | "case-kitchen"
  | "case-hotwater"
  | "inbox"
  | "profile"
  | "report-chat"
  | "support-chat"
  | "submitted-report"
  | "ar-overview"
  | "photo-overview"
  | "ar-closeup"
  | "photo-closeup"
  | "video-capture"
  | "video-preview"
  | "success"
  | "k-ar"
  | "k-photo";

const REPORT_AR: AppScreen[] = ["ar-overview","photo-overview","ar-closeup","photo-closeup","video-capture","video-preview"];
const AR_SCREENS: AppScreen[] = [...REPORT_AR, "k-ar", "k-photo"];

// ─── Icons ────────────────────────────────────────────────────────────────────
const IcoHome = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const IcoCases = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M9 9h6M9 13h4"/></svg>;
const IcoChat = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IcoInbox = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>;
const IcoProfile = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoChevLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IcoBell = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcoPlus = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoMic = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>;
const IcoSend = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoAlert = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoX = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoHelp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoUndo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>;
const IcoEdit = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoCheckCircle = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoImg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoVideo = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const IcoUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoMapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoFileText = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcoShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoGallery = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoFlash = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoRedo = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>;
const IcoPencil = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;

// ─── Shared shell + nav ───────────────────────────────────────────────────────

function PhoneShell({ children }: { children: React.ReactNode }) {
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

function NavBar({ active, onNav }: { active: string; onNav?: (id: string) => void }) {
  const items = [
    { id: "home",    label: "Home",    I: IcoHome    },
    { id: "cases",   label: "Cases",   I: IcoCases   },
    { id: "inbox",   label: "Inbox",   I: IcoInbox   },
    { id: "profile", label: "Profile", I: IcoProfile },
  ];
  return (
    <div className="shrink-0 flex items-center justify-around pt-2.5 pb-6 px-2" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      {items.map(({ id, label, I }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onNav?.(id)} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors" style={{ color: isActive ? "var(--color-blue)" : "#AEAEAD", minWidth: 56 }}>
            <I />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: "0.01em" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, fullWidth = true, small = false }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void; fullWidth?: boolean; small?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-blue)", color: "#fff" },
    secondary: { background: "var(--color-surface)", color: "var(--color-text)", border: "1.5px solid var(--color-border)" },
    ghost: { background: "transparent", color: "var(--color-blue)" },
  };
  return (
    <button onClick={onClick} className={`${small ? "py-2.5 px-4 text-xs" : "py-3.5 px-5 text-sm"} rounded-2xl font-semibold active:opacity-75 transition-opacity ${fullWidth ? "w-full" : ""}`} style={{ fontFamily: "var(--font-display)", ...s[variant] }}>
      {children}
    </button>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 items-start">
      <LogoAvatar size={32} />
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)", maxWidth: 268 }}>{children}</div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed" style={{ background: "var(--color-blue)", color: "#fff", maxWidth: 260 }}>{children}</div>
    </div>
  );
}

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

  const reportRows = [
    { label: "Issue type", value: "Water leak" },
    { label: "Location", value: "Bedroom window" },
    { label: "Occurs", value: "When it rains" },
    { label: "Description", value: "Water leaking from the top of the bedroom window, dripping down the wall." },
    { label: "Safety", value: "No immediate danger reported", green: true },
  ];

  const mediaItems = [
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
                    <p style={{ fontSize: 13, color: (row as any).green ? "var(--color-success)" : "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
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

function PhotoPreview({ photoType, onRetake, onUse }: { photoType: "overview" | "closeup"; onRetake: () => void; onUse: () => void }) {
  const [activeTool, setActiveTool] = useState<string | null>(null);
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

// ─── Shared components for new screens ────────────────────────────────────────

function ScreenHeader({ title, subtitle, onBack, topLevel = false }: { title: string; subtitle?: string; onBack?: () => void; topLevel?: boolean }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-5" style={{
      paddingTop: topLevel ? 20 : 14,
      paddingBottom: topLevel ? 16 : 14,
      borderBottom: topLevel ? "none" : "1px solid var(--color-border)",
      background: "var(--color-surface)",
    }}>
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 rounded-lg active:bg-gray-100"><IcoChevLeft /></button>
      )}
      <div className="flex-1">
        <p style={{ fontFamily: "var(--font-display)", fontWeight: topLevel ? 700 : 600, fontSize: topLevel ? 22 : 17, color: "var(--color-text)" }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "awaiting" | "action" | "completed" | "review" | "submitted" }) {
  const map = {
    awaiting: { label: "Awaiting approval", bg: "var(--color-amber-light)",  color: "var(--color-amber-text)" },
    action:   { label: "Action required",   bg: "var(--color-danger-light)", color: "var(--color-danger-text)" },
    completed:{ label: "Completed",         bg: "var(--color-success-light)", color: "#166534" },
    review:   { label: "Under review",      bg: "var(--color-blue-light)",   color: "var(--color-blue)" },
    submitted:{ label: "Submitted",         bg: "var(--color-blue-light)",   color: "var(--color-blue)" },
  }[status];
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full font-semibold" style={{ fontSize: 11, letterSpacing: "0.01em", background: map.bg, color: map.color }}>
      {map.label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{children}</p>;
}

// ─── Home screen ──────────────────────────────────────────────────────────────

function HomeScreen({ onReport, onMyCases, onCaseDetail, onInbox, onSupportChat, onNav }: {
  onReport: () => void; onMyCases: () => void; onCaseDetail: () => void; onInbox: () => void; onSupportChat: () => void; onNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* White header: wordmark + bell */}
      <div className="shrink-0 px-6 pt-5 pb-4" style={{ background: "var(--color-surface)" }}>
        <div className="flex items-center justify-between">
          <HomeWordmark />
          <button onClick={onInbox} className="relative p-2 rounded-full" style={{ background: "#FFFFFF", border: "1px solid var(--color-border)" }}>
            <IcoBell />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#DC2626" }} />
          </button>
        </div>
      </div>
      {/* Content area on normal page background */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-6" style={{ paddingTop: 22 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, marginBottom: 6 }}>Hi, Brad!</h1>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>What can we help you with today?</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {/* Primary CTA — dominant */}
          <button onClick={onReport} className="flex items-center justify-between px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={{ background: "var(--color-blue)", color: "#fff", boxShadow: "0 2px 12px rgba(37,99,235,0.22)" }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IcoPlus /></div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>Report an issue</span>
            </div>
            <IcoChevRight />
          </button>
          {/* Secondary actions — quieter */}
          <button onClick={onMyCases} className="flex items-center justify-between px-5 py-3.5 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>
            <div className="flex items-center gap-3" style={{ color: "var(--color-text-secondary)" }}><IcoCases /><span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "var(--color-text)" }}>My cases</span></div>
            <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
          </button>
          <button onClick={onSupportChat} className="flex items-center justify-between px-5 py-3.5 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>
            <div className="flex items-center gap-3" style={{ color: "var(--color-text-secondary)" }}><IcoChat /><span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "var(--color-text)" }}>Other questions</span></div>
            <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
          </button>
        </div>
        <div>
          <SectionLabel>Recent case</SectionLabel>
          <button onClick={onCaseDetail} className="w-full flex items-start justify-between px-5 py-4 rounded-2xl text-left active:opacity-80 transition-opacity" style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div className="flex-1">
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 6 }}>Bedroom window leak</p>
              <StatusPill status="awaiting" />
              <div className="flex items-center gap-1 mt-2.5" style={{ color: "var(--color-muted)" }}>
                <IcoClock /><span style={{ fontSize: 12 }}>Updated 2 hours ago</span>
              </div>
            </div>
            <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
          </button>
        </div>
      </div>
      <NavBar active="home" onNav={onNav} />
    </div>
  );
}

// ─── My Cases screen ──────────────────────────────────────────────────────────

function MyCasesScreen({ onCaseBedroom, onCaseKitchen, onCaseHotwater, onNav }: {
  onCaseBedroom: () => void; onCaseKitchen: () => void; onCaseHotwater: () => void; onNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="My Cases" topLevel />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {/* Active */}
        <div>
          <SectionLabel>Active</SectionLabel>
          <div className="flex flex-col gap-3">

            {/* Bedroom window leak */}
            <button onClick={onCaseBedroom} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>Bedroom window leak</p>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>Bedroom</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status="awaiting" />
                    <div className="flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>2h ago</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>

            {/* Kitchen tap leak — action required, more prominent */}
            <button onClick={onCaseKitchen} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={{ background: "#FFF8F8", border: "1.5px solid #FECACA" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>Kitchen tap leak</p>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>Kitchen</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status="action" />
                    <div className="flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>Yesterday</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>
          </div>
        </div>

        {/* History */}
        <div>
          <SectionLabel>History</SectionLabel>
          <button onClick={onCaseHotwater} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>Hot water issue</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusPill status="completed" />
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>12 Aug</span>
                </div>
              </div>
              <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
            </div>
          </button>
        </div>
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}

// ─── Progress Tracker ─────────────────────────────────────────────────────────

const REPAIR_STAGES = ["Submitted","Under review","Awaiting approval","Arranging repair","Repair scheduled","Completed"];

function ProgressTracker({ currentIndex, completedAll = false }: { currentIndex: number; completedAll?: boolean }) {
  return (
    <div className="flex flex-col">
      {REPAIR_STAGES.map((stage, i) => {
        const done = completedAll || i < currentIndex;
        const current = !completedAll && i === currentIndex;
        const future = !completedAll && i > currentIndex;
        return (
          <div key={stage} className="flex items-start gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center" style={{ width: 20 }}>
              <div className="rounded-full flex items-center justify-center shrink-0" style={{
                width: current ? 20 : 16,
                height: current ? 20 : 16,
                marginTop: current ? 0 : 2,
                background: done ? "var(--color-blue)" : current ? "var(--color-blue)" : "var(--color-bg)",
                border: future ? "2px solid var(--color-border)" : done || current ? "none" : "none",
                boxShadow: current ? "0 0 0 4px var(--color-blue-light)" : "none",
              }}>
                {done && <IcoCheck />}
                {current && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              {i < REPAIR_STAGES.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? "var(--color-blue)" : "var(--color-border)", marginTop: 2, marginBottom: 2 }} />
              )}
            </div>
            {/* Label */}
            <div className="pb-5">
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: current ? 700 : done ? 500 : 400,
                color: future ? "var(--color-muted)" : "var(--color-text)", marginTop: current ? 0 : 1,
              }}>{stage}</p>
              {current && <p style={{ fontSize: 12, color: "var(--color-blue)", fontWeight: 500, marginTop: 2 }}>Current</p>}
              {done && i === 0 && <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>Yesterday · 10:30 AM</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Case Detail — Bedroom window leak (Awaiting approval) ────────────────────

function CaseDetailBedroom({ onBack, onViewReport, onNav }: { onBack: () => void; onViewReport: () => void; onNav: (id: string) => void }) {
  const [showFullActivity, setShowFullActivity] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Bedroom window leak" subtitle="Case #FL-1024" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Status badge */}
        <div className="flex items-center gap-3">
          <StatusPill status="awaiting" />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Updated 2 hours ago</span>
        </div>

        {/* Current status card — primary surface with subtle tint */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          {/* What's happening */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)", background: "var(--color-amber-light)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-amber-text)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What's happening now</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>Awaiting landlord approval</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 4 }}>Your property manager has reviewed the report and requested approval from the landlord.</p>
          </div>
          {/* Who's handling */}
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "var(--color-blue-light)", color: "var(--color-blue)" }}><IcoUser /></div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Handled by</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Property manager</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 1 }}>Sarah Chen · Apex Rentals</p>
            </div>
          </div>
          {/* Your action */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Your action</p>
            <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
              <IcoCheckCircle />
              <p style={{ fontSize: 14, fontWeight: 600 }}>No action required</p>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 4 }}>We'll let you know when something changes.</p>
          </div>
          {/* What next */}
          <div className="px-5 py-4">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>Once approval is received, your property manager will begin arranging the repair.</p>
          </div>
        </div>

        {/* Progress tracker */}
        <div>
          <SectionLabel>Case progress</SectionLabel>
          <div className="rounded-2xl px-5 pt-5 pb-2" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <ProgressTracker currentIndex={2} />
          </div>
        </div>

        {/* Latest activity */}
        <div>
          <SectionLabel>Latest activity</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="px-5 py-3" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Today</p>
            </div>
            {[
              { time: "3:20 PM", title: "Approval requested", desc: "Your property manager sent the repair request to the landlord." },
              { time: "1:45 PM", title: "Report reviewed", desc: "The property manager has enough information to continue." },
            ].map((item, i, arr) => (
              <div key={item.time} className="px-5 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 12, color: "var(--color-muted)", minWidth: 52, marginTop: 1 }}>{item.time}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            {showFullActivity && (
              <>
                <div className="px-5 py-3" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Yesterday</p>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: 12, color: "var(--color-muted)", minWidth: 52, marginTop: 1 }}>10:30 AM</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Report submitted</p>
                      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>Your report and evidence were received.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            <button onClick={() => setShowFullActivity(!showFullActivity)} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
              {showFullActivity ? "Hide activity" : "View full activity"}
            </button>
          </div>
        </div>

        {/* Your report */}
        <div>
          <SectionLabel>Your report</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {[
              { icon: <IcoFileText />, label: "Issue summary", value: "Water leak · Bedroom window" },
              { icon: <IcoImg />, label: "Photos", value: "2 captured" },
              { icon: <IcoVideo />, label: "Video", value: "1 captured" },
              { icon: <IcoShield />, label: "Safety", value: "No immediate danger reported" },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ color: "var(--color-muted)" }}>{row.icon}</div>
                <div className="flex-1">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text)", marginTop: 1 }}>{row.value}</p>
                </div>
              </div>
            ))}
            <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
              View submitted report
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}

// ─── Case Detail — Kitchen tap leak (Action required) ─────────────────────────

function CaseDetailKitchen({ onBack, onAddEvidence, evidenceAdded, onNav }: {
  onBack: () => void; onAddEvidence: () => void; evidenceAdded: boolean; onNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Kitchen tap leak" subtitle="Case #FL-1025" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        {/* Action required banner — top priority */}
        {!evidenceAdded ? (
          <div className="rounded-2xl px-5 py-4" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: "#DC2626" }}>
              <IcoAlert />
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Action required</p>
            </div>
            <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.55, marginBottom: 14 }}>
              Your property manager needs one clearer photo showing the area beneath the tap.
            </p>
            <Btn onClick={onAddEvidence}>Add requested evidence</Btn>
          </div>
        ) : (
          <div className="rounded-2xl px-5 py-4 flex items-center gap-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <div style={{ color: "#16A34A" }}><IcoCheckCircle /></div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#16A34A" }}>Evidence submitted</p>
              <p style={{ fontSize: 13, color: "#166534" }}>Your photo has been added to the case.</p>
            </div>
          </div>
        )}

        {/* Current status card */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)", background: evidenceAdded ? "var(--color-blue-light)" : "var(--color-danger-light)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, color: evidenceAdded ? "var(--color-blue)" : "var(--color-danger-text)" }}>Current status</p>
            <div style={{ marginBottom: 6 }}><StatusPill status={evidenceAdded ? "review" : "action"} /></div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              {evidenceAdded ? "Your property manager is reviewing the submitted evidence." : "More information is needed before the review can continue."}
            </p>
          </div>
          <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: "var(--color-blue-light)", color: "var(--color-blue)" }}><IcoUser /></div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Handled by</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Property manager</p>
              <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 1 }}>Sarah Chen · Apex Rentals</p>
            </div>
          </div>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Your action</p>
            {!evidenceAdded ? (
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-danger)" }}>Upload one additional photo</p>
            ) : (
              <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
                <IcoCheckCircle /><p style={{ fontSize: 14, fontWeight: 600 }}>No action required</p>
              </div>
            )}
          </div>
          <div className="px-5 py-4">
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
              {evidenceAdded
                ? "The property manager will continue reviewing the case with the new evidence."
                : "Once the new evidence is submitted, the property manager can continue reviewing the case."}
            </p>
          </div>
        </div>

        {/* Latest activity */}
        <div>
          <SectionLabel>Latest activity</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="px-5 py-3" style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Yesterday</p>
            </div>
            {[
              evidenceAdded && { time: "Just now", title: "Evidence submitted", desc: "Your additional photo has been added to the case." },
              { time: "2:15 PM", title: "More information requested", desc: "A clearer photo of the area beneath the tap is needed." },
              { time: "10:00 AM", title: "Report submitted", desc: "Your report and evidence were received." },
            ].filter(Boolean).map((item: any, i, arr) => (
              <div key={item.time} className="px-5 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 12, color: "var(--color-muted)", minWidth: 52, marginTop: 1 }}>{item.time}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}

// ─── Case Detail — Hot water issue (Completed) ────────────────────────────────

function CaseDetailHotwater({ onBack, onViewReport, onNav }: { onBack: () => void; onViewReport: () => void; onNav: (id: string) => void }) {
  const [showPrevActivity, setShowPrevActivity] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Hot water issue" subtitle="Case #FL-0987" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

        <div className="flex items-center gap-3">
          <StatusPill status="completed" />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Completed 12 Aug</span>
        </div>

        {/* Resolved summary — quiet, light */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", opacity: 0.85 }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Final update</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Repair completed</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 4 }}>Repair completed on 12 Aug. Hot water has been restored.</p>
          </div>
          <div className="px-5 py-3.5">
            <div className="flex items-center gap-2" style={{ color: "var(--color-success)" }}>
              <IcoCheckCircle /><p style={{ fontSize: 13, fontWeight: 600 }}>No action required</p>
            </div>
          </div>
        </div>

        {/* Activity — collapsed by default */}
        <div>
          <SectionLabel>Case activity</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", opacity: 0.85 }}>
            {/* Final update always visible */}
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="flex items-start gap-3">
                <div style={{ minWidth: 60 }}>
                  <p style={{ fontSize: 11, color: "var(--color-muted)" }}>12 Aug</p>
                  <p style={{ fontSize: 11, color: "var(--color-muted)" }}>2:00 PM</p>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Repair completed</p>
                  <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>Hot water restored. Case closed.</p>
                </div>
              </div>
            </div>

            {showPrevActivity && [
              { date: "10 Aug", time: "9:00 AM", title: "Repair scheduled", desc: "Technician visit confirmed for 12 Aug." },
              { date: "5 Aug",  time: "3:30 PM", title: "Repair approved",  desc: "Landlord approved. Repair arranged." },
              { date: "4 Aug",  time: "11:00 AM", title: "Report submitted", desc: "Report and evidence received." },
            ].map((item) => (
              <div key={item.title} className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div className="flex items-start gap-3">
                  <div style={{ minWidth: 60 }}>
                    <p style={{ fontSize: 11, color: "var(--color-muted)" }}>{item.date}</p>
                    <p style={{ fontSize: 11, color: "var(--color-muted)" }}>{item.time}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setShowPrevActivity(!showPrevActivity)} className="w-full px-5 py-3.5 text-left" style={{ color: "var(--color-muted)", fontSize: 13, fontWeight: 500 }}>
              {showPrevActivity ? "Hide previous activity" : "View previous activity"}
            </button>
          </div>
        </div>

        {/* Report */}
        <div>
          <SectionLabel>Your report</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", opacity: 0.85 }}>
            {[
              { icon: <IcoFileText />, label: "Issue summary", value: "Hot water system failure · Bathroom" },
              { icon: <IcoImg />, label: "Photos", value: "2 captured" },
              { icon: <IcoShield />, label: "Safety", value: "No immediate danger reported" },
            ].map((row, i, arr) => (
              <div key={row.label} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <div style={{ color: "var(--color-muted)" }}>{row.icon}</div>
                <div className="flex-1">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{row.label}</p>
                  <p style={{ fontSize: 13, color: "var(--color-text)", marginTop: 1 }}>{row.value}</p>
                </div>
              </div>
            ))}
            <button onClick={onViewReport} className="w-full px-5 py-3.5 text-left" style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-blue)", fontSize: 13, fontWeight: 600 }}>
              View submitted report
            </button>
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}

// ─── Inbox screen ─────────────────────────────────────────────────────────────

function InboxScreen({ onNotifBedroom, onNotifKitchen, onNav }: {
  onNotifBedroom: () => void; onNotifKitchen: () => void; onNav: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Inbox" topLevel />
      <div className="flex-1 overflow-y-auto">

        {/* Today */}
        <div className="px-5 pt-5 pb-2">
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Today</p>
        </div>

        {/* Unread — stronger background */}
        <button onClick={onNotifBedroom} className="w-full text-left px-5 py-4 active:opacity-80 transition-opacity" style={{ borderBottom: "1px solid var(--color-border)", background: "#FAFBFF" }}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "var(--color-blue)", marginTop: 6 }} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>Approval requested</p>
                <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap", marginTop: 1 }}>2h ago</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginTop: 2 }}>Bedroom window leak</p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 5 }}>Your property manager is waiting for landlord approval.</p>
            </div>
          </div>
        </button>

        {/* Read — quieter */}
        <button onClick={onNotifBedroom} className="w-full text-left px-5 py-4 active:opacity-80 transition-opacity" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: "transparent", border: "1.5px solid var(--color-border)", marginTop: 6 }} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-secondary)" }}>Report reviewed</p>
                <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap", marginTop: 1 }}>4h ago</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginTop: 2 }}>Bedroom window leak</p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 5 }}>Your report has been reviewed. No additional information is needed.</p>
            </div>
          </div>
        </button>

        {/* Yesterday */}
        <div className="px-5 pt-5 pb-2" style={{ background: "var(--color-bg)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Yesterday</p>
        </div>

        {/* Action required — most prominent */}
        <button onClick={onNotifKitchen} className="w-full text-left px-5 py-4 active:opacity-80 transition-opacity" style={{ borderBottom: "1px solid var(--color-border)", background: "#FFF8F8" }}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: "#DC2626", marginTop: 6 }} />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)" }}>More information requested</p>
                <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap", marginTop: 1 }}>Yesterday</span>
              </div>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginTop: 2 }}>Kitchen tap leak</p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 5 }}>One clearer photo is needed before the review can continue.</p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full" style={{ background: "var(--color-danger-light)" }}>
                <span style={{ color: "var(--color-danger-text)" }}><IcoAlert /></span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-danger-text)" }}>Action required</span>
              </div>
            </div>
          </div>
        </button>

      </div>
      <NavBar active="inbox" onNav={onNav} />
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

// ─── Support chat screen ──────────────────────────────────────────────────────

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
  "How do I contact my property manager?": "You can reach your property manager Sarah Chen at Apex Rentals. Contact details are usually in your tenancy agreement.",
};

function SupportChatScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ from: "assistant" | "user"; text: string }[]>([]);
  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

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

function SuccessScreen({ onViewCase, onHome }: { onViewCase: () => void; onHome: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="rounded-full flex items-center justify-center" style={{ width: 80, height: 80, background: "#F0FDF4", color: "#16A34A" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div className="text-center">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--color-text)", marginBottom: 12 }}>Report submitted</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>Your property manager can now review your report. Follow future updates in My Cases.</p>
        </div>
        <div className="w-full rounded-2xl px-5 py-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Case</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginTop: 2 }}>Bedroom window leak</p>
            </div>
            <StatusPill status="submitted" />
          </div>
        </div>
        <div className="w-full flex flex-col gap-3">
          <Btn onClick={onViewCase}>View case</Btn>
          <Btn variant="secondary" onClick={onHome}>Back to home</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Profile screen ───────────────────────────────────────────────────────────

function ProfileScreen({ onNav }: { onNav: (id: string) => void }) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Profile" topLevel />
      <div className="flex-1 overflow-y-auto">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-5 py-5" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 52, height: 52, background: "var(--color-blue-light)", color: "var(--color-blue)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
            BL
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--color-text)" }}>Brad Lai</p>
            <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 2 }}>Tenant · 12 Birchwood Ave</p>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* My Details */}
          <div>
            <SectionLabel>My Details</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {[
                { label: "Name",  value: "Brad Lai" },
                { label: "Email", value: "brad.lai@email.com" },
                { label: "Phone", value: "+61 400 000 000" },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{row.label}</p>
                    <p style={{ fontSize: 14, color: "var(--color-text)" }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Property */}
          <div>
            <SectionLabel>Rental Property</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Property address</p>
                <p style={{ fontSize: 14, color: "var(--color-text)" }}>12 Birchwood Ave, Fitzroy VIC 3065</p>
              </div>
              <div className="px-5 py-3">
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Property manager</p>
                <p style={{ fontSize: 14, color: "var(--color-text)" }}>Sarah Chen · Apex Rentals</p>
              </div>
            </div>
          </div>

          {/* Preferences + Support — grouped lighter */}
          <div>
            <SectionLabel>Preferences</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between px-5 py-3.5">
                <p style={{ fontSize: 14, color: "var(--color-text)" }}>Notifications</p>
                <div style={{ width: 44, height: 26, borderRadius: 13, background: "var(--color-blue)", display: "flex", alignItems: "center", padding: "0 3px", justifyContent: "flex-end" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Support</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {[
                { label: "Help & FAQs" },
                { label: "Contact property manager" },
              ].map((row, i, arr) => (
                <button key={row.label} className="w-full flex items-center justify-between px-5 py-3.5 text-left active:opacity-70 transition-opacity" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                  <p style={{ fontSize: 14, color: "var(--color-text)" }}>{row.label}</p>
                  <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className="flex justify-center gap-6 pb-2">
            {["Privacy", "Terms"].map((t) => (
              <button key={t} style={{ fontSize: 12, color: "var(--color-muted)" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <NavBar active="profile" onNav={onNav} />
    </div>
  );
}

// ─── Submitted report screen ──────────────────────────────────────────────────

function SubmittedReportScreen({ onBack }: { onBack: () => void }) {
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Submitted Report" subtitle="Bedroom window leak · Case #FL-1024" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

        {/* Submitted badge */}
        <div className="flex items-center gap-2">
          <StatusPill status="submitted" />
          <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Submitted Yesterday · 10:30 AM</span>
        </div>

        {/* Report fields — read-only */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          {[
            { label: "Issue type",        value: "Water leak" },
            { label: "Location",          value: "Bedroom window" },
            { label: "Condition",         value: "When it rains" },
            { label: "Brief description", value: "Water is leaking from the top of the bedroom window and dripping down the wall.", wide: true },
            { label: "Safety",            value: "No immediate danger reported", green: true },
          ].map((row, i, arr) => (
            <div key={row.label} className="px-5 py-3.5" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{row.label}</p>
              <p style={{ fontSize: 14, color: (row as any).green ? "var(--color-success)" : "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* Evidence */}
        <div>
          <SectionLabel>Evidence</SectionLabel>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {[
              { id: "overview",  label: "Overview photo",              note: "Annotated — Leak point marked", src: IMG_BEDROOM_WIDE,  type: "photo" },
              { id: "closeup",   label: "Close-up photo",              note: "Annotated",                     src: IMG_DAMAGED_WALL, type: "photo" },
              { id: "video",     label: "Short video",                 note: "0:04",                          src: IMG_BEDROOM_LIGHT, type: "video" },
            ].map((item, i, arr) => (
              <div key={item.id}>
                <button onClick={() => setExpandedEvidence(expandedEvidence === item.id ? null : item.id)} className="w-full flex items-center justify-between px-5 py-3.5 text-left active:opacity-70" style={{ borderBottom: expandedEvidence === item.id || i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 52, height: 40, background: "#1a1a2a" }}>
                      {item.type !== "video"
                        ? <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--color-success)" }}>{item.note}</p>
                    </div>
                  </div>
                  <IcoChevRight />
                </button>
                {expandedEvidence === item.id && (
                  <div style={{ background: "#000" }}>
                    <img src={item.src} alt={item.label} className="w-full" style={{ maxHeight: 220, objectFit: "cover", opacity: item.type === "video" ? 0.75 : 1 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

// ─── Floating chat button ─────────────────────────────────────────────────────

function FloatingChatBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "absolute", bottom: 82, right: 18, zIndex: 40,
        width: 52, height: 52, borderRadius: "50%",
        background: "var(--color-blue)",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(37,99,235,0.40)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", cursor: "pointer",
      }}
      className="active:scale-95 transition-transform"
    >
      <IcoChat />
    </button>
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

  function handleNav(id: string) {
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
