import { IcoChevLeft } from "../common/icons";

export default function ScreenHeader({ title, subtitle, onBack, topLevel = false }: { title: string; subtitle?: string; onBack?: () => void; topLevel?: boolean }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-5" style={{
      paddingTop: topLevel ? 20 : 14,
      paddingBottom: topLevel ? 16 : 14,
      borderBottom: topLevel ? "none" : "1px solid var(--color-border)",
      background: "var(--color-surface)",
    }}>
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 rounded-lg active:bg-gray-100"><IcoChevLeft /></button>
      )}
      <div className="flex-1">
        <p style={{ fontFamily: "var(--font-display)", fontWeight: topLevel ? 700 : 600, fontSize: topLevel ? 22 : 17, color: "var(--color-text)" }}>{title}</p>
        {subtitle && <p style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}
