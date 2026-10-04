// Provider-neutral contract shared by the Edge Function, UI and evaluation tests.
export const MAX_DESCRIPTION = 4000;
export const MAX_ANSWER = 1000;
export const MAX_FOLLOW_UPS = 2;
export interface Clarification { question: string; answer: string }
export interface UnderstandingInput { description: string; clarifications: Clarification[] }
export interface IssueUnderstanding {
  status: "sufficient" | "needs_follow_up" | "multiple_issues" | "not_maintenance";
  issue: string | null;
  location: string | null;
  observedCondition: string | null;
  summary: string | null;
  followUpQuestions: string[];
}
const fields = ["status", "issue", "location", "observedCondition", "summary", "followUpQuestions"];
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const bounded = (value: unknown, max: number): value is string => typeof value === "string" && !!value.trim() && value.length <= max;
export function validateInput(value: unknown): UnderstandingInput {
  if (!object(value) || Object.keys(value).some(key => !["description", "clarifications"].includes(key)) || !bounded(value.description, MAX_DESCRIPTION) || !Array.isArray(value.clarifications) || value.clarifications.length > MAX_FOLLOW_UPS) throw new Error("Invalid understanding input");
  const clarifications = value.clarifications.map(item => {
    if (!object(item) || Object.keys(item).length !== 2 || !bounded(item.question, 240) || !bounded(item.answer, MAX_ANSWER)) throw new Error("Invalid clarification");
    return { question: item.question, answer: item.answer };
  });
  return { description: value.description, clarifications };
}
export function validateUnderstanding(value: unknown, answered = 0): IssueUnderstanding {
  if (!object(value) || Object.keys(value).length !== fields.length || fields.some(key => !(key in value)) || !["sufficient", "needs_follow_up", "multiple_issues", "not_maintenance"].includes(value.status as string)) throw new Error("Invalid understanding result");
  for (const key of ["issue", "location", "observedCondition", "summary"]) {
    if (value[key] !== null && !bounded(value[key], key === "summary" || key === "observedCondition" ? 2000 : 160)) throw new Error("Invalid summary field");
  }
  if (!Array.isArray(value.followUpQuestions) || value.followUpQuestions.length > 1 || value.followUpQuestions.some(q => !bounded(q, 240))) throw new Error("Invalid follow-up questions");
  const result = value as unknown as IssueUnderstanding;
  if (result.status === "sufficient" && (!result.issue || !result.location || !result.summary || result.followUpQuestions.length)) throw new Error("Incomplete sufficient result");
  if (result.status === "not_maintenance" && (result.followUpQuestions.length || result.issue || result.location || result.summary || result.observedCondition)) throw new Error("Invalid off-topic result");
  // Never let a model's extra question extend the bounded application flow.
  if (answered >= MAX_FOLLOW_UPS) return { ...result, followUpQuestions: [] };
  if (["needs_follow_up", "multiple_issues"].includes(result.status) && result.followUpQuestions.length !== 1) throw new Error("Missing clarification question");
  return result;
}
export const understandingSchema = {
  type: "object", additionalProperties: false, required: fields,
  properties: {
    status: { type: "string", enum: ["sufficient", "needs_follow_up", "multiple_issues", "not_maintenance"] },
    issue: { type: ["string", "null"] }, location: { type: ["string", "null"] },
    observedCondition: { type: ["string", "null"] }, summary: { type: ["string", "null"] },
    followUpQuestions: { type: "array", items: { type: "string" } },
  },
};
