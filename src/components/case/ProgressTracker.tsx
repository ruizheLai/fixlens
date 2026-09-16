import { IcoCheck } from "../common/icons";
import { CASE_STATUS_LABELS } from "../../data/casePresentation";

const REPAIR_STAGES = Object.values(CASE_STATUS_LABELS);

export default function ProgressTracker({ currentIndex, completedAll = false, submittedLabel }: { currentIndex: number; completedAll?: boolean; submittedLabel?: string }) {
  return (
    <div className="flex flex-col">
      {REPAIR_STAGES.map((stage, i) => {
        const done = completedAll || i < currentIndex;
        const current = !completedAll && i === currentIndex;
        const future = !completedAll && i > currentIndex;
        return (
          <div key={stage} className="flex items-start gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center" style={{ width: 20 }}>
              <div className="rounded-full flex items-center justify-center shrink-0" style={{
                width: current ? 20 : 16,
                height: current ? 20 : 16,
                marginTop: current ? 0 : 2,
                background: done ? "var(--color-blue)" : current ? "var(--color-blue)" : "var(--color-bg)",
                border: future ? "2px solid var(--color-border)" : done || current ? "none" : "none",
                boxShadow: current ? "0 0 0 4px var(--color-blue-light)" : "none",
              }}>
                {done && <IcoCheck />}
                {current && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              {i < REPAIR_STAGES.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 20, background: done ? "var(--color-blue)" : "var(--color-border)", marginTop: 2, marginBottom: 2 }} />
              )}
            </div>
            {/* Label */}
            <div className="pb-5">
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 14, fontWeight: current ? 700 : done ? 500 : 400,
                color: future ? "var(--color-muted)" : "var(--color-text)", marginTop: current ? 0 : 1,
              }}>{stage}</p>
              {current && <p style={{ fontSize: 12, color: "var(--color-blue)", fontWeight: 500, marginTop: 2 }}>Current</p>}
              {done && i === 0 && submittedLabel && <p style={{ fontSize: 11, color: "var(--color-muted)", marginTop: 1 }}>{submittedLabel}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
