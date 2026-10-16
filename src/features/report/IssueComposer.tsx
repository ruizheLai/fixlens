import { useLayoutEffect, useRef } from "react";
export default function IssueComposer({ value, onChange, disabled, maxLength, label, placeholder }: {
  value: string; onChange: (value: string) => void; disabled: boolean; maxLength: number; label: string; placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.style.height = "24px";
    input.style.height = `${Math.min(120, input.scrollHeight)}px`;
    input.style.overflowY = input.scrollHeight > 120 ? "auto" : "hidden";
  }, [value]);
  return <textarea ref={ref} rows={1} aria-label={label} maxLength={maxLength} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    className="block flex-1 min-w-0 w-full bg-transparent outline-none resize-none"
    style={{ fontSize: 16, lineHeight: "24px", maxHeight: 120, color: "var(--color-text)", opacity: disabled ? 0.4 : 1, overflowWrap: "anywhere" }} />;
}
