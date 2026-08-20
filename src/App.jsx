import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import SessionsPage from "./pages/SessionsPage";
import JobsPage from "./pages/JobsPage";
import AdminsPage from "./pages/AdminsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [token, setToken]       = useState(() => localStorage.getItem("admin_token") || "");
  const [role, setRole]         = useState(() => localStorage.getItem("admin_role") || "");
  const [authPage, setAuthPage] = useState("login"); // "login" | "signup"
  const [page, setPage]         = useState("sessions");
  const [checking, setChecking] = useState(!!localStorage.getItem("admin_token"));

  // Verify stored token on mount
  useEffect(() => {
    const stored = localStorage.getItem("admin_token");
    if (!stored) { setChecking(false); return; }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("invalid");
        const data = await r.json();
        setRole(data.role || "admin");
        localStorage.setItem("admin_role", data.role || "admin");
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_role");
        setToken("");
        setRole("");
      })
      .finally(() => setChecking(false));
  }, []);

  function handleLogin(t, r) {
    localStorage.setItem("admin_token", t);
    localStorage.setItem("admin_role", r || "admin");
    setToken(t);
    setRole(r || "admin");
  }

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
    setToken("");
    setRole("");
    setAuthPage("login");
    setPage("sessions");
  }

  if (checking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f3f4f6" }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  if (!token) {
    if (authPage === "signup") {
      return (
        <SignupPage onGoToLogin={() => setAuthPage("login")} />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onGoToSignup={() => setAuthPage("signup")}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={page} onNav={setPage} onLogout={handleLogout} role={role} />
      <div style={{ flex: 1, overflow: "auto" }}>
        {page === "sessions" && <SessionsPage />}
        {page === "jobs"     && <JobsPage />}
        {page === "admins"   && role === "super_admin" && <AdminsPage />}
      </div>
    </div>
  );
}
