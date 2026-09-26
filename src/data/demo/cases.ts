export const DEMO_CASE_IDS = ["bedroom-window-leak", "hot-water", "kitchen-tap"] as const;
export type DemoCaseId = typeof DEMO_CASE_IDS[number];

export function isDemoCaseId(value: string | undefined): value is DemoCaseId {
  return DEMO_CASE_IDS.some((id) => id === value);
}

export const casePath = (id: string) => `/cases/${encodeURIComponent(id)}`;

// Display references only: these are not database IDs. Evidence and Submitted
// Report remain prototype-backed until their dedicated integration batch.
const CASE_REFERENCES: Record<DemoCaseId, string> = {
  "bedroom-window-leak": "Case #FL-1024", "hot-water": "Case #FL-0987", "kitchen-tap": "Case #FL-1025",
};
export const demoCaseReference = (key: string) => isDemoCaseId(key) ? CASE_REFERENCES[key] : "Case details";
