import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import { IcoAlert } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";

export default function InboxScreen({ onNotifBedroom, onNotifKitchen, onNav }: {
  onNotifBedroom: () => void; onNotifKitchen: () => void; onNav: (id: NavItemId) => void;
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
