import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function adminHeaders() {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

/**
 * Fetches jobs for the admin dashboard.
 * - Super admins: see all jobs (active + inactive)
 * - Regular admins: see only their own jobs (active + inactive)
 * Exposes create / update / remove helpers that optimistically update state.
 */
export function useJobs() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/jobs?all=1`, { headers: adminHeaders() });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load jobs.");
      setJobs(body);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Create ──────────────────────────────────────────────────────────────────
  async function createJob(payload) {
    const res  = await fetch(`${API}/api/jobs`, {
      method:  "POST",
      headers: adminHeaders(),
      body:    JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to create job.");
    setJobs(prev => [...prev, body]);
    return body;
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  async function updateJob(id, patch) {
    const res  = await fetch(`${API}/api/jobs/${id}`, {
      method:  "PATCH",
      headers: adminHeaders(),
      body:    JSON.stringify(patch),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to update job.");
    setJobs(prev => prev.map(j => j.id === id ? body : j));
    return body;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function removeJob(id) {
    const res  = await fetch(`${API}/api/jobs/${id}`, {
      method:  "DELETE",
      headers: adminHeaders(),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Failed to delete job.");
    setJobs(prev => prev.filter(j => j.id !== id));
  }

  return { jobs, loading, error, reload: load, createJob, updateJob, removeJob };
}
