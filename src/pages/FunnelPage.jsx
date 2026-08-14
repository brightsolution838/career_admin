import { useState, useEffect } from "react";
import { useStats } from "../hooks/useStats";
import { LoadingSpinner, ErrorState } from "../components/StatusState";

const STEP_COLORS = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981"];

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FunnelPage() {
  const { data, loading, error, reload, lastRefresh } = useStats();
  const [, setTick] = useState(0);

  // Re-render every second so "Updated X ago" stays current
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading && !data) return <LoadingSpinner />;
  if (error && !data)   return <ErrorState message={error} onRetry={reload} />;
  if (!data)            return <LoadingSpinner />;

  const { funnel, total, sessions } = data;
  const completedCount = sessions.filter(s => s.completed).length;
  const dropRate = total > 0 ? Math.round((1 - completedCount / total) * 100) : 0;
  const maxReached = funnel[0]?.reached || 1;

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: 860 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
            Application funnel
          </h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>Where candidates drop off during the apply flow</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastRefresh && <span style={{ fontSize: 12, color: "#bbb" }}>Updated {timeAgo(lastRefresh)}</span>}
          <button onClick={reload} disabled={loading} style={{
            padding: "7px 14px", background: loading ? "#f5f5f5" : "#111",
            color: loading ? "#aaa" : "#fff", border: "none", borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total started", value: total,          color: "#2563EB" },
          { label: "Completed",     value: completedCount, color: "#10B981" },
          { label: "Drop-off rate", value: `${dropRate}%`, color: dropRate > 50 ? "#EF4444" : "#F59E0B" },
        ].map(card => (
          <div key={card.label} style={{
            background: "#fff", borderRadius: 12, padding: "20px 22px",
            border: "1px solid #f0f0f0",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel bars */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, padding: "24px 28px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24 }}>
          Step-by-step drop-off
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {funnel.map((row, i) => {
            const pct     = Math.round((row.reached / maxReached) * 100);
            const dropPct = i > 0
              ? Math.round(((funnel[i - 1].reached - row.reached) / (funnel[i - 1].reached || 1)) * 100)
              : null;

            return (
              <div key={row.step}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Step number circle */}
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: STEP_COLORS[i] + "18", color: STEP_COLORS[i],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800,
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{row.label}</span>
                    {dropPct !== null && dropPct > 0 && (
                      <span style={{
                        fontSize: 11, color: "#EF4444", fontWeight: 700,
                        background: "#FEF2F2", padding: "2px 9px", borderRadius: 99,
                      }}>↓ {dropPct}% left here</span>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{row.reached}</span>
                    <span style={{ fontSize: 12, color: "#bbb", marginLeft: 4 }}>users</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 10, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${pct}%`,
                    background: STEP_COLORS[i],
                    transition: "width 0.7s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
