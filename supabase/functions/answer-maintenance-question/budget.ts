export interface Budget { allowed: boolean; retry_after: number }
export function limit(value: string | undefined, fallback: number, max: number) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > max) throw new Error("Invalid support budget configuration");
  return Number(value);
}
export function createBudget(url: string | undefined, serviceKey: string | undefined, minute: number, day: number, request: typeof fetch = fetch) {
  return async (signal: AbortSignal): Promise<Budget> => {
    if (!url || !serviceKey) throw new Error("Budget unavailable");
    const response = await request(`${url}/rest/v1/rpc/consume_support_budget`, { method: "POST", signal: AbortSignal.any([signal, AbortSignal.timeout(4000)]), headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_minute_limit: minute, p_day_limit: day }) });
    if (!response.ok) throw new Error("Budget unavailable");
    const value = await response.json();
    if (!value || typeof value.allowed !== "boolean" || !Number.isInteger(value.retry_after) || value.retry_after < 0 || value.retry_after > 86400 || (value.allowed && value.retry_after !== 0) || (!value.allowed && value.retry_after < 1)) throw new Error("Invalid budget response");
    return { allowed: value.allowed, retry_after: value.retry_after };
  };
}
