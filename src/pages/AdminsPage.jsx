import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function AdminsPage() {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [busy, setBusy]       = useState({}); // { [id]: true } while an action is in flight

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/api/auth/admins`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to load admins."); return; }
      setAdmins(data);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  async function approve(id) {
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res  = await fetch(`${API}/api/auth/admins/${id}/approve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not approve."); return; }
      setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, approved: true } : a));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  async function deleteAdmin(id, email) {
    if (!confirm(`Delete admin "${email}"? This cannot be undone.`)) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res  = await fetch(`${API}/api/auth/admins/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Could not delete."); return; }
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  const pending  = admins.filter((a) => !a.approved);
  const approved = admins.filter((a) => a.approved);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Management</h1>
        <button onClick={fetchAdmins} style={styles.refreshBtn}>↻ Refresh</button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {loading ? (
        <p style={styles.muted}>Loading…</p>
      ) : (
        <>
          {/* Pending approvals */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Pending Approval
              {pending.length > 0 && (
                <span style={styles.badge}>{pending.length}</span>
              )}
            </h2>
            {pending.length === 0 ? (
              <p style={styles.muted}>No pending requests.</p>
            ) : (
              <div style={styles.list}>
                {pending.map((admin) => (
                  <div key={admin.id} style={styles.card}>
                    <div style={styles.cardInfo}>
                      <div>
                        <div style={styles.email}>{admin.email}</div>
                        {admin.name && (
                          <div style={styles.name}>{admin.name}</div>
                        )}
                      </div>
                      <span style={{ ...styles.pill, ...styles.pillPending }}>Pending</span>
                    </div>
                    <div style={styles.cardActions}>
                      <span style={styles.date}>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </span>
                      <button
                        disabled={busy[admin.id]}
                        onClick={() => approve(admin.id)}
                        style={styles.approveBtn}
                      >
                        {busy[admin.id] ? "…" : "Approve"}
                      </button>
                      <button
                        disabled={busy[admin.id]}
                        onClick={() => deleteAdmin(admin.id, admin.email)}
                        style={styles.deleteBtn}
                      >
                        {busy[admin.id] ? "…" : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active admins */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Active Admins</h2>
            {approved.length === 0 ? (
              <p style={styles.muted}>No active admins.</p>
            ) : (
              <div style={styles.list}>
                {approved.map((admin) => (
                  <div key={admin.id} style={styles.card}>
                    <div style={styles.cardInfo}>
                      <div>
                        <div style={styles.email}>{admin.email}</div>
                        {admin.name && (
                          <div style={styles.name}>{admin.name}</div>
                        )}
                      </div>
                      <span style={{
                        ...styles.pill,
                        ...(admin.role === "super_admin" ? styles.pillSuper : styles.pillActive),
                      }}>
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </div>
                    <div style={styles.cardActions}>
                      <span style={styles.date}>
                        {new Date(admin.created_at).toLocaleDateString()}
                      </span>
                      {admin.role !== "super_admin" && (
                        <button
                          disabled={busy[admin.id]}
                          onClick={() => deleteAdmin(admin.id, admin.email)}
                          style={styles.deleteBtn}
                        >
                          {busy[admin.id] ? "…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "32px 36px",
    maxWidth: 720,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  refreshBtn: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 13,
    cursor: "pointer",
    color: "#374151",
    fontWeight: 600,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    background: "#f59e0b",
    color: "#fff",
    borderRadius: 999,
    padding: "1px 8px",
    fontSize: 11,
    fontWeight: 700,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  email: {
    fontSize: 14,
    fontWeight: 500,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  name: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  pill: {
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  pillPending: {
    background: "#fef3c7",
    color: "#92400e",
  },
  pillActive: {
    background: "#d1fae5",
    color: "#065f46",
  },
  pillSuper: {
    background: "#ede9fe",
    color: "#5b21b6",
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  date: {
    fontSize: 12,
    color: "#9ca3af",
  },
  approveBtn: {
    padding: "6px 14px",
    borderRadius: 7,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "6px 14px",
    borderRadius: 7,
    border: "none",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    marginBottom: 16,
  },
  muted: {
    fontSize: 13,
    color: "#9ca3af",
  },
};
