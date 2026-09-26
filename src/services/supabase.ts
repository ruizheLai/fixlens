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
      return fetch(input, { ...init, headers });
    },
  },
});
