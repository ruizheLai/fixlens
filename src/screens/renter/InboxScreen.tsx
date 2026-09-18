import { Fragment, useEffect, useState } from "react";
import { getInboxItems } from "../../services/inbox";
import { formatActivityTime } from "../../data/casePresentation";
import type { InboxItem } from "../../types/inbox";
import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import { IcoAlert } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";

export default function InboxScreen({ onCase, onNav }: {
  onCase: (caseKey: string) => void; onNav: (id: NavItemId) => void;
}) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    getInboxItems(controller.signal).then((data) => {
      if (controller.signal.aborted) return;
      setItems(data); setState("ready");
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error("Inbox could not be loaded", error instanceof Error ? error.message : "Unknown read failure");
      setState("error");
    });
    return () => controller.abort();
  }, [attempt]);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Inbox" topLevel />
      <div className="flex-1 overflow-y-auto">

        {state === "loading" && <p role="status" className="px-5 py-5" style={{ fontSize: 13, color: "var(--color-muted)" }}>Loading your updates…</p>}
        {state === "error" && <div role="alert" className="px-5 py-5" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          <p>We couldn't load your updates. Please try again.</p>
          <button onClick={() => setAttempt((value) => value + 1)} className="mt-2 font-semibold" style={{ color: "var(--color-blue)" }}>Retry</button>
        </div>}
        {state === "ready" && items.length === 0 && <p className="px-5 py-5" style={{ fontSize: 13, color: "var(--color-muted)" }}>No updates yet.</p>}
        {state === "ready" && items.map((item, index) => {
          const day = new Date(item.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
          const previousDay = index ? new Date(items[index - 1].createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : null;
          // Latest-event emphasis is presentation only, not a persisted unread flag.
          const prominent = index === 0 || item.actionRequired;
          return <Fragment key={item.id}>
            {day !== previousDay && <div className="px-5 pt-5 pb-2"><p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{day}</p></div>}
            <button onClick={() => onCase(item.caseKey)} className="w-full text-left px-5 py-4 active:opacity-80 transition-opacity" style={{ borderBottom: "1px solid var(--color-border)", background: item.actionRequired ? "#FFF8F8" : prominent ? "#FAFBFF" : "var(--color-surface)" }}>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: item.actionRequired ? "#DC2626" : prominent ? "var(--color-blue)" : "transparent", border: prominent ? undefined : "1.5px solid var(--color-border)", marginTop: 6 }} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ fontSize: 14, fontWeight: prominent ? 700 : 600, color: prominent ? "var(--color-text)" : "var(--color-text-secondary)" }}>{item.title}</p>
                    <span style={{ fontSize: 11, color: "var(--color-muted)", whiteSpace: "nowrap", marginTop: 1 }}>{formatActivityTime(item.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-muted)", marginTop: 2 }}>{item.caseTitle}</p>
                  {item.message && <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginTop: 5 }}>{item.message}</p>}
                  {item.actionRequired && <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full" style={{ background: "var(--color-danger-light)" }}>
                    <span style={{ color: "var(--color-danger-text)" }}><IcoAlert /></span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-danger-text)" }}>Action required</span>
                  </div>}
                </div>
              </div>
            </button>
          </Fragment>;
        })}

      </div>
      <NavBar active="inbox" onNav={onNav} />
    </div>
  );
}
