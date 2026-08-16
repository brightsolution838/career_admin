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

export default function SessionsPage() {
  const { data, loading, error, reload, lastRefresh } = useStats();
  const [, setTick] = useState(0);

  // Re-render every second so relative timestamps stay current
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data)   return <ErrorState message={error} onRetry={reload} />;
  if (!data)            return <LoadingSpinner />;

  const { sessions } = data;

  console.log(sessions, ">>>>>>>");

  return (
    <div style={{ padding: "40px 40px 80px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Sessions
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>Last 50 candidate sessions — newest first</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "130px 1fr 190px 110px 160px 100px 90px",
          padding: "12px 24px", background: "#F9FAFB",
          borderBottom: "1px solid #f0f0f0",
        }}>
          {["Name", "Role", "Last step", "Status", "IP / Location", "OS", "Last seen"].map(h => (
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
            No sessions recorded yet.
          </div>
        ) : sessions.map((s, i) => (
          <div
            key={s.session_id}
            style={{
              display: "grid",
              gridTemplateColumns: "130px 1fr 190px 110px 160px 100px 90px",
              padding: "14px 24px", alignItems: "center",
              borderBottom: i < sessions.length - 1 ? "1px solid #f8f8f8" : "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {s.first_name || s.last_name ? (
                <span style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>
                  {[s.first_name, s.last_name].filter(Boolean).join(" ")}
                </span>
              ) : (
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#ccc" }} title={s.session_id}>
                  {s.session_id.slice(0, 10)}…
                </span>
              )}
            </div>

            {/* Role */}
            <span style={{ fontSize: 13, color: "#444", paddingRight: 16 }} title={s.role || ""}>
              {s.role
                ? s.role.length > 28 ? s.role.slice(0, 28) + "…" : s.role
                : <span style={{ color: "#ddd" }}>—</span>
              }
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
          </div>
        ))}
      </div>
    </div>
  );
}
