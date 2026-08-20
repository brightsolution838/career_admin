import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function LoginPage({ onLogin, onGoToSignup }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      onLogin(data.token, data.role);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
            placeholder="admin@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={styles.input}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {onGoToSignup && (
          <p style={styles.switchText}>
            Need an account?{" "}
            <button onClick={onGoToSignup} style={styles.link}>
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
  },
  title: {
    margin: "0 0 24px",
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 2,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    marginTop: 8,
    padding: "11px 0",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
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
    marginBottom: 12,
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    padding: 0,
  },
};
