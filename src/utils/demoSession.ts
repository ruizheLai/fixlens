const STORAGE_KEY = "fixlens_demo_session_id";

// Infrastructure only: no current screen calls this or filters data by this ID.
// This identifier is not authentication or proof of ownership.
export function getDemoSessionId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
