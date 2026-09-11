export const DEMO_CASE_IDS = ["bedroom-window-leak", "hot-water", "kitchen-tap"] as const;
export type DemoCaseId = typeof DEMO_CASE_IDS[number];

export function isDemoCaseId(value: string | undefined): value is DemoCaseId {
  return DEMO_CASE_IDS.some((id) => id === value);
}

export const casePath = (id: DemoCaseId) => `/cases/${id}`;
