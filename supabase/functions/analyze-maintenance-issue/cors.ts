export const TRUSTED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://fix-lens.app",
];

export function isTrustedOrigin(origin: string, exactOrigins: string[] = TRUSTED_ORIGINS): boolean {
  try {
    const url = new URL(origin);
    // An Origin is only scheme/host/port: reject credentials, paths and lookalikes.
    if (url.origin !== origin || url.username || url.password) return false;
    if (exactOrigins.includes(origin)) return true;
    return url.protocol === "https:" && !url.port && url.hostname.length <= 253
      && url.hostname.split(".")[0].length <= 63
      && /^fixlens-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-brad-s-team2\.vercel\.app$/.test(url.hostname);
  } catch { return false; }
}

export function corsHeaders(origin: string | null, trusted: boolean): Record<string, string> {
  return {
    "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin",
    ...(origin && trusted ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
