import { useState } from "react";
import NavBar from "../../../components/navigation/NavBar";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SectionLabel from "../../../components/common/SectionLabel";
import StatusPill from "../../../components/case/StatusPill";
import ProgressTracker from "../../../components/case/ProgressTracker";
import { IcoCheckCircle, IcoImg, IcoVideo, IcoUser, IcoFileText, IcoShield } from "../../../components/common/icons";
import type { NavItemId } from "../../../types/navigation";

export default function CaseDetailBedroom({ onBack, onViewReport, onNav }: { onBack: () => void; onViewReport: () => void; onNav: (id: NavItemId) => void }) {
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
