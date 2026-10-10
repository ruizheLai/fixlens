import type { FramingGuide } from "./framingRules";
export default function FramingOverlay({ closeUp, guide }: { closeUp: boolean; guide: FramingGuide | null }) {
  const arrows = { aim: "", left: "←", right: "→", up: "↑", down: "↓", back: "↔", closer: "→←", good: "" };
  return <div className="camera-framing" data-mode={closeUp ? "close-up" : "overview"} data-cue={guide?.cue ?? "none"}>
    <div className="camera-framing-zone" aria-hidden="true"><i /><i /><i /><i /></div>
    {guide && <p className="camera-framing-message" role="status" aria-live="polite"><span aria-hidden="true">{arrows[guide.cue]}</span>{guide.message}</p>}
  </div>;
}
