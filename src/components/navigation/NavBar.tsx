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
    <nav className="renter-navigation" aria-label="Renter navigation">
      {items.map(({ id, label, I }) => {
        const isActive = active === id;
        return (
          <button key={id} aria-current={isActive ? "page" : undefined} onClick={() => onNav?.(id)}>
            <I />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
