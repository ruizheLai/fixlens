import HomeWordmark from "../../components/brand/HomeWordmark";
import NavBar from "../../components/navigation/NavBar";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoCases, IcoChat, IcoChevRight, IcoBell, IcoPlus, IcoClock } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";
import { getCases } from "../../services/cases";
import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";
import { useAutomaticInvalidation } from "../../hooks/useAutomaticInvalidation";
import { homeCases } from "../../data/homeCases";
import { requestPresentation } from "../../data/evidenceRequestPresentation";
import { formatCaseDate, formatActivityTime } from "../../data/casePresentation";
import { getDemoSessionId } from "../../utils/demoSession";
import { demoPersona } from "../../utils/demoPersona";

export default function HomeScreen({ onReport, onMyCases, onCaseDetail, onRequest, onInbox, onSupportChat, onNav }: {
  onReport: () => void; onMyCases: () => void; onCaseDetail: (caseKey: string) => void; onRequest: (caseKey: string, requestId: string) => void; onInbox: () => void; onSupportChat: () => void; onNav: (id: NavItemId) => void;
}) {
  const sessionId = getDemoSessionId(), persona = demoPersona(sessionId);
  const { data, error, refresh } = useAuthoritativeRead(getCases);
  useAutomaticInvalidation("renter", "home", refresh, 15000);
  const { recent, actions } = homeCases(data ?? [], sessionId);
  const action = !error ? actions[0] : undefined;
  const combined = recent?.caseKey === action?.case.caseKey;
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
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, marginBottom: 6 }}>Hi, {persona.firstName}!</h1>
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
        {data === undefined && !error && <p role="status" style={{ fontSize: 13 }}>Loading your cases…</p>}
        {error && <div role="alert" style={{ fontSize: 13 }}><p>We couldn't refresh your cases.</p><button onClick={refresh} style={{ color: "var(--color-blue)", marginTop: 6 }}>Retry</button></div>}
        {action && <section>
          <SectionLabel>Action required</SectionLabel>
          <div className="relative rounded-2xl px-5 py-4" style={{ background: "var(--color-surface)", border: "1px solid #FECACA", overflowWrap: "anywhere" }}>
            <button type="button" aria-label={`View case details: ${action.case.title}`} onClick={() => onCaseDetail(action.case.caseKey)} className="absolute inset-0 z-10 rounded-2xl hover:bg-blue-50/20 active:bg-blue-50/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" />
            {combined && <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 6 }}>Recent case</p>}
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{action.case.title}</p>
            <div className="flex flex-wrap gap-2"><StatusPill status={action.case.status}/><StatusPill status="action"/></div>
            <p style={{ fontSize: 13, marginTop: 12, color: "var(--color-text-secondary)" }}>{requestPresentation(action.request).requested}</p>
            <p style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{action.request.instruction}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <button type="button" onClick={() => onRequest(action.case.caseKey, action.request.id)} className="relative z-20 min-h-11 max-w-full px-5 py-3.5 rounded-2xl text-sm font-semibold hover:brightness-95 active:opacity-75 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "var(--color-blue)", color: "#fff", fontFamily: "var(--font-display)" }}>{requestPresentation(action.request).action}</button>
            </div>
            {combined && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 8 }}>Updated {formatCaseDate(action.case.updatedAt, true)} · {formatActivityTime(action.case.updatedAt)}</p>}
          </div>
          {actions.length > 1 && <button onClick={onMyCases} style={{ color: "var(--color-blue)", fontSize: 13, marginTop: 8, minHeight: 44 }}>{actions.length - 1} more {actions.length === 2 ? "case needs" : "cases need"} attention · View cases</button>}
        </section>}
        {recent && !combined && <div>
          <SectionLabel>Recent case</SectionLabel>
          <button onClick={() => onCaseDetail(recent.caseKey)} className="w-full flex items-start justify-between px-5 py-4 rounded-2xl text-left active:opacity-80 transition-opacity" style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <div className="flex-1 min-w-0" style={{ overflowWrap: "anywhere" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 6 }}>{recent.title}</p>
              {!recent.demoSessionId && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Shared demo case</p>}
              <StatusPill status={recent.status} />
              <div className="flex items-center gap-1 mt-2.5" style={{ color: "var(--color-muted)" }}>
                <IcoClock /><span style={{ fontSize: 12 }}>Updated {formatCaseDate(recent.updatedAt, true)} · {formatActivityTime(recent.updatedAt)}</span>
              </div>
            </div>
            <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
          </button>
        </div>}
      </div>
      <NavBar active="home" onNav={onNav} />
    </div>
  );
}
