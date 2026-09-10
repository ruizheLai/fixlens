import { useState } from "react";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight } from "../../components/common/icons";
import { IMG_BEDROOM_WIDE, IMG_BEDROOM_LIGHT, IMG_DAMAGED_WALL } from "../../data/demo/evidence";

export default function SubmittedReportScreen({ onBack }: { onBack: () => void }) {
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
              <p style={{ fontSize: 14, color: row.green ? "var(--color-success)" : "var(--color-text)", lineHeight: 1.5 }}>{row.value}</p>
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
