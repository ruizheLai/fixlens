import { useCallback, useEffect, useRef, useState } from "react";

// Refresh in place: a remote update must not unmount a dialog or capture draft.
export function useAuthoritativeRead<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState(false);
  const snapshot = useRef<string | undefined>(undefined);
  const run = useRef<() => void>(() => {});
  const cancel = useRef<() => void>(() => {});
  const refresh = useCallback(() => run.current(), []);
  const replace = useCallback((value: T) => {
    cancel.current();
    snapshot.current = JSON.stringify(value);
    setData(value);
    setError(false);
  }, []);
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | null = null;
    let queued = false;
    setData(undefined);
    snapshot.current = undefined;
    setError(false);
    const stop = () => { controller?.abort(); controller = null; queued = false; };
    const read = () => {
      if (disposed) return;
      if (controller) { queued = true; return; }
      const current = new AbortController();
      controller = current;
      void load(current.signal).then(value => {
        if (!disposed && !current.signal.aborted) {
          const next = JSON.stringify(value);
          // Unchanged reads should not reload private photos or disturb local UI.
          if (snapshot.current !== next) { snapshot.current = next; setData(value); }
          setError(false);
        }
      }).catch(() => {
        if (!disposed && !current.signal.aborted) setError(true);
      }).finally(() => {
        if (controller !== current) return;
        controller = null;
        if (queued && !disposed) { queued = false; read(); }
      });
    };
    run.current = read;
    cancel.current = stop;
    read();
    return () => { disposed = true; stop(); run.current = () => {}; cancel.current = () => {}; };
  }, [load]);
  return { data, error, refresh, replace };
}
