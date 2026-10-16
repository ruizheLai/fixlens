import { isSafetyReport, SAFETY_GUIDANCE, SAFETY_EVIDENCE_NOTE } from "../../data/reportSafety";

export default function SafetyNotice({ response, noPhotos = false }: { response: string | null; noPhotos?: boolean }) {
  if (!isSafetyReport(response)) return null;
  return <section className="shrink-0 rounded-2xl px-4 py-4" style={{ background: "var(--color-danger-light)", border: "1px solid #FECACA", color: "var(--color-danger-text)", fontSize: 13, lineHeight: 1.6 }}>
    <strong>Immediate danger reported</strong>
    {noPhotos && <p>{SAFETY_EVIDENCE_NOTE} The renter indicated that approaching the affected area may be unsafe.</p>}
    <p>{SAFETY_GUIDANCE}</p>
  </section>;
}
