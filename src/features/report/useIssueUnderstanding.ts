import { useEffect, useRef, useState } from "react";
import { understandIssue } from "../../services/issueUnderstanding";
import type { IssueUnderstanding, UnderstandingInput } from "../../types/issueUnderstanding";
import type { MaintenanceReportInput } from "../../types/report";

export function reportFromUnderstanding(input: UnderstandingInput, result: IssueUnderstanding | null): MaintenanceReportInput {
  return {
    // Keep original wording. Preserve clarification answers verbatim as well as
    // their derived summary, so an omitted model detail cannot lose renter facts.
    description: input.description + input.clarifications.map(item => `\n\n${item.question}\n${item.answer}`).join(""),
    issueType: result?.issue ?? "Maintenance issue",
    location: result?.location ?? null,
    condition: result ? [result.summary, result.observedCondition].filter((value, index, values) => value && values.indexOf(value) === index).join("\n") || null : null,
    safetyResponse: null,
  };
}

export function useIssueUnderstanding() {
  const [input, setInput] = useState<UnderstandingInput>({ description: "", clarifications: [] });
  const [result, setResult] = useState<IssueUnderstanding | null>(null);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); controller.current = null; }, []);
  const analyze = async (next: UnderstandingInput) => {
    if (controller.current && !controller.current.signal.aborted) return;
    const request = new AbortController(); controller.current = request;
    setInput(next); setResult(null); setFailed(false); setPending(true);
    try {
      const response = await understandIssue(next, request.signal);
      if (!request.signal.aborted) setResult(response);
    } catch { if (!request.signal.aborted) setFailed(true); }
    finally { if (controller.current === request) { controller.current = null; setPending(false); } }
  };
  const reset = () => { controller.current?.abort(); controller.current = null; setPending(false); setFailed(false); setResult(null); };
  return { input, result, pending, failed, analyze, reset };
}
