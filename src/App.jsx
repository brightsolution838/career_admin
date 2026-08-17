import { useState } from "react";
import Sidebar from "./components/Sidebar";
import SessionsPage from "./pages/SessionsPage";
import JobsPage from "./pages/JobsPage";

export default function App() {
  const [page, setPage] = useState("sessions");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={page} onNav={setPage} />
      <div style={{ flex: 1, overflow: "auto" }}>
        {page === "sessions" && <SessionsPage />}
        {page === "jobs"     && <JobsPage />}
      </div>
    </div>
  );
}
