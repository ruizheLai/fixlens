import type { CaseUpdate } from "./case";

export interface InboxItem extends CaseUpdate {
  caseKey: string;
  caseTitle: string;
  title: string;
  actionRequired: boolean;
}
