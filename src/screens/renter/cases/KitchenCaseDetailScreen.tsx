import NavBar from "../../../components/navigation/NavBar";
import Btn from "../../../components/common/Btn";
import ScreenHeader from "../../../components/common/ScreenHeader";
import SectionLabel from "../../../components/common/SectionLabel";
import StatusPill from "../../../components/case/StatusPill";
import { IcoAlert, IcoCheckCircle, IcoUser } from "../../../components/common/icons";
import type { NavItemId } from "../../../types/navigation";
import type { CaseActivityItem } from "../../../types/case";

export default function CaseDetailKitchen({ onBack, onAddEvidence, evidenceAdded, onNav }: {
  onBack: () => void; onAddEvidence: () => void; evidenceAdded: boolean; onNav: (id: NavItemId) => void;
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
            ].filter((item): item is CaseActivityItem => Boolean(item)).map((item, i, arr) => (
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
