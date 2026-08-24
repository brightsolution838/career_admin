import { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const POLL_INTERVAL = 30000; // refresh every 30 seconds (less frequent due to pagination)

function adminHeaders() {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export function useStats(page = 1, limit = 20, adminFilter = "") {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);
  const intervalRef = useRef(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("admin_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (adminFilter) params.set("admin", adminFilter);
      
      const res  = await fetch(`${API}/api/progress/stats?${params}`, { headers });
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
  }, [page, limit, adminFilter]);

  useEffect(() => {
    // Initial load (shows spinner)
    load(false);

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll silently so the UI doesn't flash a spinner on each tick
    intervalRef.current = setInterval(() => load(true), POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [load]);

  // ── Delete single session ───────────────────────────────────────────────────
  async function deleteSession(sessionId) {
    const res = await fetch(`${API}/api/progress/sessions/${sessionId}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to delete session.");

    // Remove from local state if present
    if (data) {
      setData(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.session_id !== sessionId),
        pagination: prev.pagination ? {
          ...prev.pagination,
          totalSessions: prev.pagination.totalSessions - 1,
        } : prev.pagination,
      }));
    }
  }

  // ── Delete multiple sessions ────────────────────────────────────────────────
  async function deleteSessions(sessionIds) {
    const res = await fetch(`${API}/api/progress/sessions/bulk-delete`, {
      method: "DELETE",
      headers: adminHeaders(),
      body: JSON.stringify({ sessionIds }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to delete sessions.");

    // Remove from local state
    if (data) {
      setData(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => !sessionIds.includes(s.session_id)),
        pagination: prev.pagination ? {
          ...prev.pagination,
          totalSessions: Math.max(0, prev.pagination.totalSessions - sessionIds.length),
        } : prev.pagination,
      }));
    }

    return body;
  }

  return { data, loading, error, reload: () => load(false), lastRefresh, deleteSession, deleteSessions };
}
