import { useState, useEffect } from "react";
import { useStats } from "../hooks/useStats";
import { LoadingSpinner, ErrorState } from "../components/StatusState";

const STEP_NAMES  = ["Your info", "Experience", "Final details", "Review"];
const STEP_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StepBadge({ step }) {
  const color = STEP_COLORS[step];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: color + "18", color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      Step {step + 1} — {STEP_NAMES[step]}
    </span>
  );
}

function LocationCell({ ip, country, city }) {
  if (!ip) return <span style={{ color: "#ddd" }}>—</span>;

  const geo = [city, country].filter(Boolean).join(", ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* IP address */}
      <span style={{
        fontSize: 11, fontFamily: "monospace", color: "#555",
        background: "#F3F4F6", borderRadius: 4, padding: "1px 6px",
        display: "inline-block", width: "fit-content",
      }}>
        {ip}
      </span>
      {/* City, Country */}
      {geo ? (
        <span style={{ fontSize: 11, color: "#888" }}>📍 {geo}</span>
      ) : (
        <span style={{ fontSize: 11, color: "#ccc" }}>Unknown location</span>
      )}
    </div>
  );
}

const OS_ICONS = {
  Windows: "🪟",
  macOS:   "🍎",
  iOS:     "📱",
  Android: "🤖",
  Linux:   "🐧",
  Unknown: "❓",
};

function OSBadge({ os }) {
  if (!os) return <span style={{ color: "#ddd" }}>—</span>;
  const icon = OS_ICONS[os] || "💻";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99,
      background: "#F3F4F6", color: "#444",
    }}>
      {icon} {os}
    </span>
  );
}

// ── Delete confirm dialog (single session) ──────────────────────────────────
function DeleteSessionConfirm({ session, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErr("");
    try {
      await onConfirm();
    } catch (e) {
      setErr(e.message);
      setDeleting(false);
    }
  }

  const displayName = session.first_name || session.last_name
    ? `${session.first_name} ${session.last_name}`.trim()
    : session.session_id.slice(0, 10) + "…";

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
        maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Delete session?</h2>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
          Session for <strong>{displayName}</strong> will be permanently removed. This cannot be undone.
        </p>
        {err && (
          <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 14 }}>{err}</div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555",
          }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{
            padding: "8px 18px", borderRadius: 8, border: "none",
            background: deleting ? "#FCA5A5" : "#EF4444", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: deleting ? "default" : "pointer",
          }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm dialog (multiple sessions) ───────────────────────────────
function DeleteSessionsConfirm({ count, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErr("");
    try {
      await onConfirm();
    } catch (e) {
      setErr(e.message);
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
        maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Delete {count} sessions?</h2>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
          {count} {count === 1 ? "session will" : "sessions will"} be permanently removed. This cannot be undone.
        </p>
        {err && (
          <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 14 }}>{err}</div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555",
          }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{
            padding: "8px 18px", borderRadius: 8, border: "none",
            background: deleting ? "#FCA5A5" : "#EF4444", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: deleting ? "default" : "pointer",
          }}>
            {deleting ? "Deleting…" : "Delete all"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Checkbox component ──────────────────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      style={{
        width: 18, height: 18, cursor: "pointer", margin: 0, marginRight: 8,
        flexShrink: 0,
      }}
    />
  );
}

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const [adminFilter, setAdminFilter] = useState("");
  const [, setTick] = useState(0);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const [toDeleteSingle, setToDeleteSingle] = useState(null);
  const [toDeleteMultiple, setToDeleteMultiple] = useState(false);

  const { data, loading, error, reload, lastRefresh, deleteSession, deleteSessions } = useStats(page, 20, adminFilter);

  // Re-render every second so relative timestamps stay current
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (page !== 1) setPage(1);
  }, [adminFilter]);

  // Clear selection when data changes
  useEffect(() => {
    setSelectedSessions(new Set());
  }, [data]);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data)   return <ErrorState message={error} onRetry={reload} />;
  if (!data)            return <LoadingSpinner />;

  const { sessions, pagination, availableAdmins } = data;

  function toggleSession(sessionId) {
    setSelectedSessions(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  }

  function toggleAllSessions() {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(sessions.map(s => s.session_id)));
    }
  }

  async function handleDeleteSingle(sessionId) {
    await deleteSession(sessionId);
    setToDeleteSingle(null);
  }

  async function handleDeleteMultiple() {
    const ids = Array.from(selectedSessions);
    await deleteSessions(ids);
    setSelectedSessions(new Set());
    setToDeleteMultiple(false);
  }

  return (
    <div style={{ padding: "40px 40px 80px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Sessions
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            {pagination ? `${pagination.totalSessions} total sessions` : "Candidate sessions"} — newest first
            {adminFilter && ` — filtered by ${adminFilter}`}
            {selectedSessions.size > 0 && ` — ${selectedSessions.size} selected`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Admin Filter */}
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb",
              fontSize: 12, background: "#fff", color: "#374151",
              minWidth: 140
            }}
          >
            <option value="">All admins</option>
            {availableAdmins?.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>

          {lastRefresh && (
            <span style={{ fontSize: 12, color: "#bbb" }}>Updated {timeAgo(lastRefresh)}</span>
          )}
          <button onClick={reload} disabled={loading} style={{
            padding: "7px 14px", background: loading ? "#f5f5f5" : "#111",
            color: loading ? "#aaa" : "#fff", border: "none", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>

          {/* Bulk delete button */}
          {selectedSessions.size > 0 && (
            <button onClick={() => setToDeleteMultiple(true)} style={{
              padding: "7px 16px", background: "#EF4444", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer",
            }}>
              🗑 Delete ({selectedSessions.size})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 160px 1fr 120px 190px 110px 160px 100px 90px 60px",
          padding: "12px 24px", background: "#F9FAFB",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={selectedSessions.size === sessions.length && sessions.length > 0}
              onChange={toggleAllSessions}
            />
          </div>
          {["Applicant", "Role", "Admin", "Last step", "Status", "IP / Location", "OS", "Last seen", "Action"].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#bbb",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {sessions.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
            {adminFilter ? `No sessions found for admin "${adminFilter}".` : "No sessions recorded yet."}
          </div>
        ) : sessions.map((s, i) => (
          <div
            key={s.session_id}
            style={{
              display: "grid",
              gridTemplateColumns: "40px 160px 1fr 120px 190px 110px 160px 100px 90px 60px",
              padding: "14px 24px", alignItems: "center",
              borderBottom: i < sessions.length - 1 ? "1px solid #f8f8f8" : "none",
              transition: "background 0.1s",
              background: selectedSessions.has(s.session_id) ? "#F3F4F6" : "transparent",
            }}
            onMouseEnter={e => !selectedSessions.has(s.session_id) && (e.currentTarget.style.background = "#FAFAFA")}
            onMouseLeave={e => !selectedSessions.has(s.session_id) && (e.currentTarget.style.background = "transparent")}
          >
            {/* Checkbox */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={selectedSessions.has(s.session_id)}
                onChange={() => toggleSession(s.session_id)}
              />
            </div>

            {/* Applicant — photo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Photo avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: "#F3F4F6", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, border: "1px solid #e8e8e8",
              }}>
                {s.photo_url
                  ? <img src={s.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : "🧑"
                }
              </div>
              {/* Name or session ID */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                {s.first_name || s.last_name ? (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {[s.first_name, s.last_name].filter(Boolean).join(" ")}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#ccc" }} title={s.session_id}>
                    {s.session_id.slice(0, 10)}…
                  </span>
                )}
              </div>
            </div>

            {/* Role */}
            <span style={{ fontSize: 13, color: "#444", paddingRight: 16 }} title={s.role || ""}>
              {s.role
                ? s.role.length > 28 ? s.role.slice(0, 28) + "…" : s.role
                : <span style={{ color: "#ddd" }}>—</span>
              }
            </span>

            {/* Admin name */}
            <span style={{ fontSize: 12, color: "#666" }}>
              {s.owner_name || <span style={{ color: "#ddd" }}>—</span>}
            </span>

            {/* Step badge */}
            <div><StepBadge step={s.current_step} /></div>

            {/* Status pill */}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px",
              borderRadius: 99, display: "inline-block",
              color:      s.completed ? "#166534" : "#92400E",
              background: s.completed ? "#F0FDF4" : "#FFFBEB",
            }}>
              {s.completed ? "✓ Done" : "In progress"}
            </span>

            {/* IP + Location */}
            <LocationCell ip={s.ip_address} country={s.country} city={s.city} />

            {/* OS */}
            <OSBadge os={s.os_name} />

            {/* Last seen */}
            <span style={{ fontSize: 12, color: "#bbb" }}>
              {timeAgo(s.updated_at)}
            </span>

            {/* Delete button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setToDeleteSingle(s)}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #FECACA",
                  background: "#FEF2F2", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", color: "#EF4444",
                }}
              >Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 24,
          padding: "16px 0"
        }}>
          <div style={{ fontSize: 13, color: "#666" }}>
            Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, pagination.totalSessions)} of {pagination.totalSessions} sessions
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrev}
              style={{
                padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
                background: pagination.hasPrev ? "#fff" : "#f9fafb",
                color: pagination.hasPrev ? "#374151" : "#9ca3af",
                cursor: pagination.hasPrev ? "pointer" : "not-allowed",
                fontSize: 12, fontWeight: 500
              }}
            >
              ← Previous
            </button>

            <span style={{ fontSize: 13, color: "#666", padding: "0 12px" }}>
              Page {page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNext}
              style={{
                padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6,
                background: pagination.hasNext ? "#fff" : "#f9fafb",
                color: pagination.hasNext ? "#374151" : "#9ca3af",
                cursor: pagination.hasNext ? "pointer" : "not-allowed",
                fontSize: 12, fontWeight: 500
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Delete single session confirmation */}
      {toDeleteSingle && (
        <DeleteSessionConfirm
          session={toDeleteSingle}
          onConfirm={async () => { await handleDeleteSingle(toDeleteSingle.session_id); }}
          onCancel={() => setToDeleteSingle(null)}
        />
      )}

      {/* Delete multiple sessions confirmation */}
      {toDeleteMultiple && (
        <DeleteSessionsConfirm
          count={selectedSessions.size}
          onConfirm={handleDeleteMultiple}
          onCancel={() => setToDeleteMultiple(false)}
        />
      )}
    </div>
  );
}
