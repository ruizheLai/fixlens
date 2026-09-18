import { hasRequestedEvidence } from "../../data/evidenceRequestPresentation";
import { useEffect, useState } from "react";
import { getCases } from "../../services/cases";
import { formatCaseDate } from "../../data/casePresentation";
import type { CaseListItem } from "../../types/case";
import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight, IcoClock, IcoMapPin } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";

export default function MyCasesScreen({ onCase, onNav }: {
  onCase: (caseKey: string) => void; onNav: (id: NavItemId) => void;
}) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    getCases(controller.signal).then((items) => {
      if (controller.signal.aborted) return;
      setCases(items);
      setState("ready");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Cases could not be loaded", error instanceof Error ? error.message : "Unknown read failure");
      setState("error");
    });
    return () => controller.abort();
  }, [attempt]);
  const active = cases.filter((item) => item.status !== "completed");
  const history = cases.filter((item) => item.status === "completed");
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="My Cases" topLevel />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {state === "loading" && <p role="status" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading your cases…</p>}
        {state === "error" && <div role="alert" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load your cases. Please try again.</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
        {/* Active */}
        <div>
          <SectionLabel>Active</SectionLabel>
          <div className="flex flex-col gap-3">

            {state === "ready" && active.map((item) => {
              // Current action is independent of the primary lifecycle.
              const actionRequired = hasRequestedEvidence(item.evidenceRequests);
              return (
            <button key={item.caseKey} onClick={() => onCase(item.caseKey)} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={actionRequired ? { background: "#FFF8F8", border: "1.5px solid #FECACA" } : { background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>{item.title}</p>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>{item.locationLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status={item.status} />
                    {actionRequired && <StatusPill status="action" />}
                    <div className="flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>{formatCaseDate(item.updatedAt, false)}</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>

              );
            })}
            {state === "ready" && active.length === 0 && <p style={{ fontSize: 13, color: "var(--color-muted)" }}>No active cases.</p>}
          </div>
        </div>

        {/* History */}
        <div>
          <SectionLabel>History</SectionLabel>
          {state === "ready" && history.map((item) => (
          <button key={item.caseKey} onClick={() => onCase(item.caseKey)} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>{item.title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusPill status="completed" />
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>{formatCaseDate(item.updatedAt, true)}</span>
                </div>
              </div>
              <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
            </div>
          </button>
          ))}
          {state === "ready" && history.length === 0 && <p style={{ fontSize: 13, color: "var(--color-muted)" }}>No completed cases.</p>}
        </div>
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
