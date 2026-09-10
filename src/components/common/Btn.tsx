import type * as React from "react";

export default function Btn({ children, variant = "primary", onClick, fullWidth = true, small = false }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void; fullWidth?: boolean; small?: boolean;
}) {
  const s: Record<string, React.CSSProperties> = {
    primary: { background: "var(--color-blue)", color: "#fff" },
    secondary: { background: "var(--color-surface)", color: "var(--color-text)", border: "1.5px solid var(--color-border)" },
    ghost: { background: "transparent", color: "var(--color-blue)" },
  };
  return (
    <button onClick={onClick} className={`${small ? "py-2.5 px-4 text-xs" : "py-3.5 px-5 text-sm"} rounded-2xl font-semibold active:opacity-75 transition-opacity ${fullWidth ? "w-full" : ""}`} style={{ fontFamily: "var(--font-display)", ...s[variant] }}>
      {children}
    </button>
  );
}
