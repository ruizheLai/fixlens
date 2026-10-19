export const MAX_QUESTION = 1200;
export const MAX_HISTORY = 6;
export const MAX_ANSWER = 1600;
export const SUPPORT_OPENING = "Hi! I can help you understand rental maintenance reporting, photo evidence and case updates. What would you like to know?";
export const SUPPORT_SUGGESTIONS = ["How do I report a maintenance issue?", "What photos should I include?", "What does Awaiting Approval mean?"];
export const BOUNDARY = "I'm here to help with rental maintenance, reporting issues, photo evidence and case updates. You can ask me about those topics.";
export const CLARIFICATION = "Are you asking about a maintenance issue, reporting it, photo evidence or a case update? Tell me a little more about what you need help with.";
export const SAFETY = "Keep away from the hazard and do not try to repair it or approach it for photos. Use the property manager or emergency maintenance contact in your tenancy agreement. For an immediate life-threatening emergency in Australia, call 000. FixLens supports reporting immediate danger without photographs: in Report an issue, indicate immediate danger at the safety check, then choose Continue without photos to reach Safety Report Review. FixLens is not an emergency response service and does not notify anyone through this chat.";
export const LEGAL = "I can explain maintenance reporting in general, but cannot give definitive legal advice or determine your rights, liability or deadlines. Check authoritative tenancy information for your state or territory, or a qualified tenancy adviser. You can still document the issue and track it in Cases.";
export const CASE_BOUNDARY = "I cannot inspect your case or property records in this conversation. Open Cases, then the relevant Case Detail to see its current status, handler and next step. This chat does not contact your property manager.";
export const LEGAL_CASE_BOUNDARY = `${CASE_BOUNDARY} ${LEGAL}`;
export type SupportTurn = { role: "user" | "assistant"; text: string };
export interface SupportInput { question: string; history: SupportTurn[] }
export type Scope = "in_scope" | "out_of_scope" | "needs_clarification" | "safety_sensitive";
export const FAQ_TOPICS = ["evidence", "statuses", "information_requests", "annotations", "capabilities", "smell"] as const;
export const SUPPORT_BOUNDARIES = ["none", "legal", "case_specific", "legal_and_case_specific"] as const;
export interface Classification { scope: Scope; maintenanceQuestion: string | null; mixed: boolean; boundary: typeof SUPPORT_BOUNDARIES[number]; faq: typeof FAQ_TOPICS[number] | null }
export interface SupportAnswer { scope: Scope; answer: string }
function record(v: unknown): asserts v is Record<string, unknown> { if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("Invalid object"); }
function text(v: unknown, max: number): v is string { return typeof v === "string" && v.trim().length > 0 && v.length <= max; }
export function validateSupportInput(value: unknown): SupportInput {
  record(value);
  if (Object.keys(value).some(k => !["question", "history"].includes(k)) || !text(value.question, MAX_QUESTION) || !Array.isArray(value.history) || value.history.length > MAX_HISTORY) throw new Error("Invalid support request");
  const history = value.history.map(item => { record(item); if (Object.keys(item).some(k => !["role", "text"].includes(k)) || !["user", "assistant"].includes(item.role as string) || !text(item.text, MAX_ANSWER)) throw new Error("Invalid history"); return { role: item.role as SupportTurn["role"], text: item.text as string }; });
  return { question: value.question.trim(), history };
}
export function validateClassification(value: unknown): Classification {
  record(value);
  if (Object.keys(value).sort().join() !== "boundary,faq,maintenanceQuestion,mixed,scope" || !["in_scope", "out_of_scope", "needs_clarification", "safety_sensitive"].includes(value.scope as string) || !SUPPORT_BOUNDARIES.includes(value.boundary as typeof SUPPORT_BOUNDARIES[number]) || !(value.faq === null || FAQ_TOPICS.includes(value.faq as typeof FAQ_TOPICS[number])) || typeof value.mixed !== "boolean" || !(value.maintenanceQuestion === null || text(value.maintenanceQuestion, MAX_QUESTION))) throw new Error("Invalid classification");
  if (value.scope === "in_scope" && !text(value.maintenanceQuestion, MAX_QUESTION)) throw new Error("Missing scoped question");
  return value as unknown as Classification;
}
export function validateSupportAnswer(value: unknown): SupportAnswer {
  record(value);
  if (Object.keys(value).sort().join() !== "answer,scope" || !["in_scope", "out_of_scope", "needs_clarification", "safety_sensitive"].includes(value.scope as string) || !text(value.answer, MAX_ANSWER)) throw new Error("Invalid support answer");
  return value as unknown as SupportAnswer;
}
