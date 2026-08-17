const NAV = [
  { key: "sessions", icon: "🧑‍💻", label: "Sessions" },
  { key: "jobs",     icon: "💼",    label: "Jobs" },
];

export default function Sidebar({ active, onNav }) {
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
        }}>Admin</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {NAV.map(item => (
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
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 11, color: "#ccc" }}>career-site · admin</div>
      </div>
    </aside>
  );
}
