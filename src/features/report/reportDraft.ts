import type { MaintenanceReportInput } from "../../types/report";
export type ReportDetails = Pick<MaintenanceReportInput,"issueType"|"location"|"condition"|"description">;
export function approvedDetails(report: MaintenanceReportInput, edit: ReportDetails): MaintenanceReportInput {
  if(!edit.issueType.trim()||!edit.description.trim()) throw new Error("Issue type and original description are required.");
  // The displayed condition/summary is one renter-approved field, not a second
  // stale AI summary. Preserve wording and the explicit safety answer.
  const interpretationChanged = edit.description !== report.description || edit.issueType !== report.issueType || edit.location !== report.location;
  const condition = interpretationChanged && edit.condition === report.condition ? null : edit.condition?.trim() || null;
  return {...report,issueType:edit.issueType.trim(),location:edit.location?.trim()||null,condition,description:edit.description};
}
