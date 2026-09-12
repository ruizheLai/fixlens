import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error("Supabase configuration missing: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.");
}

// Shared client. Phase 2A intentionally does not import this into renter screens.
export const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
