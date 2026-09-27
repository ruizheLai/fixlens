import { createClient } from "@supabase/supabase-js";
import { getDemoSessionId } from "../utils/demoSession";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Supabase configuration missing: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.");
}

// Read storage on each request so clearing it also changes the demo identity.
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (typeof window !== "undefined") headers.set("x-fixlens-demo-session", getDemoSessionId());
      // Storage upload() currently has no AbortSignal option. Bound its network
      // wait as well as reads; caller signals still cancel supported operations.
      const signal = init?.signal ?? (input instanceof Request ? input.signal : null);
      const timeout = AbortSignal.timeout(90000);
      return fetch(input, { ...init, headers, signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    },
  },
});
