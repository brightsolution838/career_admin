export function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 36, height: 36, border: "3px solid #e0e0e0",
          borderTopColor: "#2563EB", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
        }} />
        <p style={{ fontSize: 13, color: "#aaa" }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontSize: 14, color: "#EF4444", marginBottom: 20 }}>{message}</p>
        <button onClick={onRetry} style={{
          padding: "9px 20px", background: "#111", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Try again</button>
      </div>
    </div>
  );
}
