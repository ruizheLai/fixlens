export interface MaintenanceReportInput {
  issueType: string;
  location: string | null;
  description: string;
  condition: string | null;
  safetyResponse: string | null;
}

export interface CaseCreationAttempt extends MaintenanceReportInput {
  caseKey: string;
  demoSessionId: string;
}

export interface CreatedMaintenanceCase {
  caseKey: string;
  title: string;
}
