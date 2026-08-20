import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

const BASE_NAV = [
  { key: "sessions", icon: "🧑‍💻", label: "Sessions" },
  { key: "jobs",     icon: "💼",    label: "Jobs" },
];

export default function Sidebar({ active, onNav, onLogout, role }) {
  const isSuperAdmin = role === "super_admin";
  const [pendingCount, setPendingCount] = useState(0);

  // Poll for pending signups so the badge stays fresh
  useEffect(() => {
    if (!isSuperAdmin) return;

    async function fetchPending() {
      try {
        const token = localStorage.getItem("admin_token");
        const res   = await fetch(`${API}/api/auth/admins`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setPendingCount(data.filter((a) => !a.approved).length);
      } catch { /* ignore */ }
    }

    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, [isSuperAdmin]);

  const nav = isSuperAdmin
    ? [...BASE_NAV, { key: "admins", icon: "👥", label: "Admins", badge: pendingCount }]
    : BASE_NAV;

  return (
    <aside style={{
      width: 220, background: "#fff", borderRight: "1px solid #f0f0f0",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em" }}>Arclight</div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#bbb", marginTop: 2,
        }}>
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {nav.map((item) => (
          <button
            key={item.key}
            onClick={() => onNav(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              marginBottom: 2, transition: "all 0.12s",
              background: active === item.key ? "#EFF6FF" : "transparent",
              color:      active === item.key ? "#2563EB" : "#555",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span style={{
                marginLeft: "auto",
                background: "#f59e0b",
                color: "#fff",
                borderRadius: 999,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 700,
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10 }}>career-site · admin</div>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: "transparent", color: "#ef4444", transition: "background 0.12s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            🚪 Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
