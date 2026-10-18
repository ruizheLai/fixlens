import Btn from "../../components/common/Btn";
import StatusPill from "../../components/case/StatusPill";

export default function SuccessScreen({ title, onViewCase, onHome }: { title: string; onViewCase: () => void; onHome: () => void }) {
  return (
    <div className="fixlens-visual report-experience report-success flex flex-col h-full">
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
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)", marginTop: 2 }}>{title}</p>
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
