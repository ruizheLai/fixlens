import { IcoHome, IcoCases, IcoInbox, IcoProfile } from "../common/icons";
import type { NavItemId } from "../../types/navigation";
import type * as React from "react";

export default function NavBar({ active, onNav }: { active: NavItemId; onNav?: (id: NavItemId) => void }) {
  const items: { id: NavItemId; label: string; I: () => React.JSX.Element }[] = [
    { id: "home",    label: "Home",    I: IcoHome    },
    { id: "cases",   label: "Cases",   I: IcoCases   },
    { id: "inbox",   label: "Inbox",   I: IcoInbox   },
    { id: "profile", label: "Profile", I: IcoProfile },
  ];
  return (
    <div className="shrink-0 flex items-center justify-around pt-2.5 pb-6 px-2" style={{ borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      {items.map(({ id, label, I }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onNav?.(id)} className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors" style={{ color: isActive ? "var(--color-blue)" : "#AEAEAD", minWidth: 56 }}>
            <I />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 500, letterSpacing: "0.01em" }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
