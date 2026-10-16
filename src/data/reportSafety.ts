export const IMMEDIATE_DANGER = "Immediate danger reported";
export const SAFETY_EVIDENCE_NOTE = "No photos collected for safety reasons.";
export const SAFETY_GUIDANCE = "Do not approach the affected area or put yourself at risk to take photos. Contact your property manager or emergency maintenance service promptly. For life-threatening emergencies in Australia, call 000. FixLens reporting is not an emergency response service.";
export function isSafetyReport(response: string | null | undefined) { return response === IMMEDIATE_DANGER; }
export function canSubmitReport(response: string | null, hasOverview: boolean, hasCloseup: boolean) {
  return isSafetyReport(response) || (response === "No immediate danger reported" && hasOverview && hasCloseup);
}
