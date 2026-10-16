import { useState, useRef, useEffect } from "react";
import { IcoX, IcoHelp, IcoGallery, IcoFlash } from "../../components/common/icons";
import { IMG_BEDROOM_WIDE, IMG_BEDROOM_LIGHT, IMG_DAMAGED_WALL } from "../../data/demo/evidence";

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
  bgSrc, dimOpacity, step, label, tipText, onClose, children, shutterSlot, belowProgress, onGallery,
}: {
  bgSrc: string; dimOpacity: number; step: number; label: string; tipText: string;
  onClose: () => void; children?: React.ReactNode; shutterSlot: React.ReactNode;
  belowProgress?: React.ReactNode;
  onGallery?: () => void;
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
        <button aria-label="Choose from photos" onClick={onGallery} style={{ color: "rgba(255,255,255,0.8)", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      aria-label="Capture photo"
      style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      className="active:scale-95 transition-transform"
    >
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fff", border: "3px solid #111" }} />
    </button>
  );
}

export function AROverviewScreen({ onCapture, onClose, onGallery, realPhoto }: { onCapture: () => void; onClose: () => void; onGallery?: () => void; realPhoto?: boolean }) {
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
      onGallery={onGallery}
      belowProgress={realPhoto && <span style={{ color: "#fff", fontSize: 12, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 8 }}>Example framing · Tap capture to take a photo</span>}
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

export function ARCloseupScreen({ onCapture, onClose, onGallery, realPhoto }: { onCapture: () => void; onClose: () => void; onGallery?: () => void; realPhoto?: boolean }) {
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
      onGallery={onGallery}
      belowProgress={realPhoto && <span style={{ color: "#fff", fontSize: 12, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 8 }}>Example framing · Tap capture to take a photo</span>}
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

export function ARVideoScreen({ onCapture, onClose }: { onCapture: () => void; onClose: () => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const completion = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleRecord = () => {
    if (recording) return;
    setRecording(true);
    iv.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    completion.current = setTimeout(() => { setRecording(false); if (iv.current) clearInterval(iv.current); onCapture(); }, 4000);
  };
  useEffect(() => () => {
    if (iv.current) clearInterval(iv.current);
    if (completion.current) clearTimeout(completion.current);
  }, []);
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
      tipText="Demo video step only. Video is not recorded or uploaded."
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

export { default as PhotoPreview } from "./PhotoAnnotationEditor";

export function VideoPreview({ onRetake, onUse }: { onRetake: () => void; onUse: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", overflow: "hidden" }}>
      <img src={IMG_BEDROOM_LIGHT} alt="Video preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
      {/* Play overlay */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Demo only · Video is not uploaded</p>
      </div>
      {/* Duration badge */}
      <div style={{ position: "absolute", top: 80, right: 20, padding: "4px 10px", borderRadius: 99, background: "rgba(0,0,0,0.6)" }}>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>0:04</p>
      </div>
      {/* Top strip */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "14px 20px 10px", background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onRetake} style={{ color: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-display)", background: "rgba(0,0,0,0.4)", padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer" }}>Retake</button>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Video — Optional</p>
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
