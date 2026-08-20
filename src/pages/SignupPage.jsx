import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function SignupPage({ onGoToLogin }) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Signup failed."); return; }
      setSuccess(true);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.title}>Request Sent</h2>
          <p style={styles.subtitle}>
            Your account is <strong>pending approval</strong> by a super admin.
            You'll be able to sign in once it's approved.
          </p>
          <button onClick={onGoToLogin} style={styles.button}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Request Admin Access</h2>
        <p style={styles.subtitle}>
          Submit your details. A super admin will approve your account.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            style={styles.input}
            placeholder="Your full name"
          />

          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={styles.input}
            placeholder="Min. 8 characters"
          />

          <label style={styles.label}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            style={styles.input}
            placeholder="Repeat your password"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Submitting…" : "Request Access"}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <button onClick={onGoToLogin} style={styles.link}>
            Sign in
          </button>
        </p>
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
  successIcon: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    margin: "0 0 6px",
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 20px",
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.5,
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
    width: "100%",
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
