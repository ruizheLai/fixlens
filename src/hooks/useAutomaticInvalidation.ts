import { useEffect, useRef } from "react";

// Renter HTTP reads retain the demo-session header. Never use it as WS identity.
// PM receives only private, empty invalidations; authoritative reads decide state.
export function useAutomaticInvalidation(mode: "renter" | "pm", scope: string, onInvalidate: () => void, pollMs = 3000) {
  const callback = useRef(onInvalidate);
  callback.current = onInvalidate;
  useEffect(() => {
    let disposed = false;
    let debounce: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;
    const invalidate = () => {
      if (disposed || document.visibilityState === "hidden") return;
      clearTimeout(debounce);
      debounce = setTimeout(() => { if (!disposed && document.visibilityState !== "hidden") callback.current(); }, 150);
    };
    window.addEventListener("focus", invalidate);
    window.addEventListener("online", invalidate);
    document.addEventListener("visibilitychange", invalidate);
    const poll = mode === "renter" ? setInterval(invalidate, pollMs) : undefined;
    if (mode === "pm") {
      void import("../services/supabase").then(async ({ pmSupabase }) => {
        if (disposed) return;
        const topic = `fixlens:pm:${scope}`;
        // A rapid remount must not reuse a channel still finishing unsubscribe.
        const previous = pmSupabase.getChannels().find(channel => channel.topic === `realtime:${topic}`);
        if (previous) await pmSupabase.removeChannel(previous);
        if (disposed) return;
        const channel = pmSupabase.channel(topic, { config: { private: true } })
          .on("broadcast", { event: "invalidate" }, invalidate)
          .subscribe(status => { if (status === "SUBSCRIBED") invalidate(); });
        unsubscribe = () => { void pmSupabase.removeChannel(channel); };
      }).catch(() => { /* Manual reads and focus refresh remain available. */ });
    }
    return () => {
      disposed = true;
      clearTimeout(debounce);
      clearInterval(poll);
      unsubscribe?.();
      window.removeEventListener("focus", invalidate);
      window.removeEventListener("online", invalidate);
      document.removeEventListener("visibilitychange", invalidate);
    };
  }, [mode, scope, pollMs]);
}
