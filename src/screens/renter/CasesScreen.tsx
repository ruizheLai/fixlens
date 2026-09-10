import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import StatusPill from "../../components/case/StatusPill";
import { IcoChevRight, IcoClock, IcoMapPin } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";

export default function MyCasesScreen({ onCaseBedroom, onCaseKitchen, onCaseHotwater, onNav }: {
  onCaseBedroom: () => void; onCaseKitchen: () => void; onCaseHotwater: () => void; onNav: (id: NavItemId) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="My Cases" topLevel />
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {/* Active */}
        <div>
          <SectionLabel>Active</SectionLabel>
          <div className="flex flex-col gap-3">

            {/* Bedroom window leak */}
            <button onClick={onCaseBedroom} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>Bedroom window leak</p>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>Bedroom</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status="awaiting" />
                    <div className="flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>2h ago</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>

            {/* Kitchen tap leak — action required, more prominent */}
            <button onClick={onCaseKitchen} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-80 transition-opacity" style={{ background: "#FFF8F8", border: "1.5px solid #FECACA" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--color-text)", marginBottom: 4 }}>Kitchen tap leak</p>
                  <div className="flex items-center gap-1" style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                    <IcoMapPin /><span style={{ fontSize: 12 }}>Kitchen</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusPill status="action" />
                    <div className="flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
                      <IcoClock /><span style={{ fontSize: 11 }}>Yesterday</span>
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--color-muted)", marginTop: 2 }}><IcoChevRight /></span>
              </div>
            </button>
          </div>
        </div>

        {/* History */}
        <div>
          <SectionLabel>History</SectionLabel>
          <button onClick={onCaseHotwater} className="w-full text-left px-5 py-4 rounded-2xl active:opacity-75 transition-opacity" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>Hot water issue</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusPill status="completed" />
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>12 Aug</span>
                </div>
              </div>
              <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
            </div>
          </button>
        </div>
      </div>
      <NavBar active="cases" onNav={onNav} />
    </div>
  );
}
