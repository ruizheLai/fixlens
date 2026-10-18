import type * as React from "react";

export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="rv-section-label" style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{children}</p>;
}
