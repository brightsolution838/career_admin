import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;
const POLL_INTERVAL = 5000; // refresh every 5 seconds

export function useStats() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/progress/stats`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
      setLastRefresh(new Date());
    } catch (err) {
      // On silent polls, don't overwrite existing data with an error —
      // just let the stale data stay visible until the server comes back.
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load (shows spinner)
    load(false);

    // Poll silently so the UI doesn't flash a spinner on each tick
    intervalRef.current = setInterval(() => load(true), POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [load]);

  return { data, loading, error, reload: () => load(false), lastRefresh };
}
