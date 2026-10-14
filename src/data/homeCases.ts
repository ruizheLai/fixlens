import type { CaseListItem } from "../types/case";
import { actionableRequests } from "./evidenceRequestPresentation.ts";

export function homeCases(cases: CaseListItem[], sessionId: string) {
  const visible = cases.filter(c => !c.demoSessionId || c.demoSessionId === sessionId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.caseKey.localeCompare(b.caseKey));
  const own = visible.filter(c => c.demoSessionId === sessionId);
  const actions = visible.flatMap(c => {
    const request = actionableRequests(c, sessionId).sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt) || a.id.localeCompare(b.id))[0];
    return request ? [{ case: c, request }] : [];
  });
  return { recent: own[0] ?? visible[0] ?? null, actions };
}
