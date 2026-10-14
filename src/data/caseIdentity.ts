import type { CaseDetail } from "../types/case";
import { demoCaseReference } from "./demo/cases";
export function renterCaseSubtitle(detail: CaseDetail) {
  return [demoCaseReference(detail.caseKey), detail.demoSessionId ? detail.renter?.name : `Shared demo · ${detail.renter?.name ?? "Demo tenant"}`, detail.propertyAddress].filter(Boolean).join(" · ");
}
