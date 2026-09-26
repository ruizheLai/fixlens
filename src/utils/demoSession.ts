const STORAGE_KEY = "fixlens_demo_session_id";

// This identifier is not authentication or proof of ownership.
export function getDemoSessionId(): string {
  if (typeof window === "undefined") throw new Error("Demo session requires a browser");
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
