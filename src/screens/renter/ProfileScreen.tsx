import NavBar from "../../components/navigation/NavBar";
import ScreenHeader from "../../components/common/ScreenHeader";
import SectionLabel from "../../components/common/SectionLabel";
import { IcoChevRight } from "../../components/common/icons";
import type { NavItemId } from "../../types/navigation";
import { demoPersona } from "../../utils/demoPersona";
import { getDemoSessionId } from "../../utils/demoSession";
import { getDemoProperty } from "../../services/demoProperty";
import { useAuthoritativeRead } from "../../hooks/useAuthoritativeRead";

export default function ProfileScreen({ onNav }: { onNav: (id: NavItemId) => void }) {
  const persona = demoPersona(getDemoSessionId());
  const { data: property, error, refresh } = useAuthoritativeRead(getDemoProperty);
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Profile" topLevel />
      <div className="flex-1 overflow-y-auto">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 px-5 py-5" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 52, height: 52, background: "var(--color-blue-light)", color: "var(--color-blue)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
            {persona.initials}
          </div>
          <div className="min-w-0" style={{ overflowWrap: "anywhere" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--color-text)" }}>{persona.name}</p>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 2 }}>Demo profile · Tenant</p>
          </div>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* My Details */}
          <div>
            <SectionLabel>My Details</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {[
                { label: "Name",  value: persona.name },
                { label: "Email", value: persona.email },
                { label: "Phone", value: persona.phone },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                  <div className="min-w-0" style={{ overflowWrap: "anywhere" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{row.label}</p>
                    <p style={{ fontSize: 14, color: "var(--color-text)" }}>{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Property */}
          <div>
            <SectionLabel>Rental Property</SectionLabel>
            {error && <p role="alert">Property details unavailable. <button onClick={refresh} style={{ color: "var(--color-blue)" }}>Retry</button></p>}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Property address</p>
                <p style={{ fontSize: 14, color: "var(--color-text)", overflowWrap: "anywhere" }}>{property?.address ?? (error ? "Unavailable" : "Loading…")}</p>
              </div>
              <div className="px-5 py-3">
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Property manager</p>
                <p style={{ fontSize: 14, color: "var(--color-text)", overflowWrap: "anywhere" }}>{property?.manager ? [property.manager.name, property.manager.agency_name].filter(Boolean).join(" · ") : property ? "Not assigned" : error ? "Unavailable" : "Loading…"}</p>
              </div>
            </div>
          </div>

          {/* Preferences + Support — grouped lighter */}
          <div>
            <SectionLabel>Preferences</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center justify-between px-5 py-3.5">
                <p style={{ fontSize: 14, color: "var(--color-text)" }}>Notifications</p>
                <div style={{ width: 44, height: 26, borderRadius: 13, background: "var(--color-blue)", display: "flex", alignItems: "center", padding: "0 3px", justifyContent: "flex-end" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Support</SectionLabel>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {[
                { label: "Help & FAQs" },
                { label: "Contact property manager" },
              ].map((row, i, arr) => (
                <button key={row.label} className="w-full flex items-center justify-between px-5 py-3.5 text-left active:opacity-70 transition-opacity" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border-subtle)" : "none" }}>
                  <p style={{ fontSize: 14, color: "var(--color-text)" }}>{row.label}</p>
                  <span style={{ color: "var(--color-muted)" }}><IcoChevRight /></span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer links */}
          <div className="flex justify-center gap-6 pb-2">
            {["Privacy", "Terms"].map((t) => (
              <button key={t} style={{ fontSize: 12, color: "var(--color-muted)" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <NavBar active="profile" onNav={onNav} />
    </div>
  );
}
