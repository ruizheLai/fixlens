import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";
import { useAutomaticInvalidation } from "../../hooks/useAutomaticInvalidation";
import { actionableRequests } from "../../data/evidenceRequestPresentation";
import { getDemoSessionId } from "../../utils/demoSession";

import { getCases } from "../../services/cases";
import { formatCaseDate } from "../../data/casePresentation";

import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight, IcoClock, IcoMapPin } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";

export default function MyCasesScreen({ onCase, onNav }: {
  onCase: (caseKey: string) => void; onNav: (id: NavItemId) => void;
}) {
  const { data, error, refresh } = useAuthoritativeRead(getCases);
  useAutomaticInvalidation("renter", "cases", refresh, 15000);
  const cases = data ?? [];
  const state = data !== undefined ? "ready" : error ? "error" : "loading";
  const active = cases.filter((item) => item.status !== "completed");
  const history = cases.filter((item) => item.status === "completed");
  return (
    <div className="renter-screen flex flex-col h-full">
      <ScreenHeader title="My Cases" topLevel />
      <div className="rv-scroll flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {state === "loading" && <p role="status" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading your cases…</p>}
        {state === "error" && <div role="alert" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load your cases. Please try again.</p>
          <button onClick={refresh} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
        {/* Active */}
        <div>
          <SectionLabel>Active</SectionLabel>
          <div className="flex flex-col gap-3">

            {state === "ready" && active.map((item) => {
              // Current action is independent of the primary lifecycle.
              const actionRequired = actionableRequests(item, getDemoSessionId()).length > 0;
              return (
            <button key={item.caseKey} onClick={() => onCase(item.caseKey)} className="rv-card rv-case-row w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" data-attention={actionRequired || undefined} style={actionRequired ? { background: "var(--color-surface)", border: "1px solid var(--color-action-border)" } : { background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>{item.title}</p>
                  {!item.demoSessionId && <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Shared demo case</p>}
                  <div className="rv-metadata flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>{item.locationLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status={item.status} />
                    {actionRequired && <StatusPill status="action" />}
                    <div className="rv-metadata flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>{formatCaseDate(item.updatedAt, false)}</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>

              );
            })}
            {state === "ready" && active.length === 0 && <p className="rv-metadata" style={{ fontSize: 13, color: "var(--color-muted)" }}>No active cases.</p>}
          </div>
        </div>

        {/* History */}
        <div>
          <SectionLabel>History</SectionLabel>
          <div className="flex flex-col gap-3">
          {state === "ready" && history.map((item) => (
          <button key={item.caseKey} onClick={() => onCase(item.caseKey)} className="rv-card rv-case-row w-full text-left px-5 py-4 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)" }}>{item.title}</p>
                {!item.demoSessionId && <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Shared demo case</p>}
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusPill status="completed" />
                  <span className="rv-metadata" style={{ fontSize: 12, color: "var(--color-muted)" }}>{formatCaseDate(item.updatedAt, true)}</span>
                </div>
              </div>
              <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
            </div>
          </button>
          ))}
          {state === "ready" && history.length === 0 && <p className="rv-metadata" style={{ fontSize: 13, color: "var(--color-muted)" }}>No completed cases.</p>}
          </div>
        </div>
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
