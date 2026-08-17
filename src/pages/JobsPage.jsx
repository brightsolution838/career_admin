import { useState } from "react";
import { useJobs } from "../hooks/useJobs";
import { LoadingSpinner, ErrorState } from "../components/StatusState";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPTS = ["Engineering", "Product", "Design", "Marketing", "Operations"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const DEPT_COLORS = {
  Engineering: { bg: "#EEF2FF", text: "#3730A3" },
  Product:     { bg: "#F0FDF4", text: "#166534" },
  Design:      { bg: "#FFF7ED", text: "#9A3412" },
  Marketing:   { bg: "#FDF4FF", text: "#6B21A8" },
  Operations:  { bg: "#F0F9FF", text: "#075985" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function arrToText(arr) {
  return Array.isArray(arr) ? arr.join("\n") : (arr || "");
}
function textToArr(str) {
  return (str || "").split("\n").map(s => s.trim()).filter(Boolean);
}

const EMPTY_FORM = {
  title:            "",
  dept:             DEPTS[0],
  location:         "Remote",
  type:             "Full-time",
  is_active:        true,
  summary:          "",
  responsibilities: "",
  requirements:     "",
  nice_to_have:     "",
};

function formFromJob(job) {
  return {
    title:            job.title,
    dept:             job.dept,
    location:         job.location,
    type:             job.type,
    is_active:        job.is_active,
    summary:          job.summary          || "",
    responsibilities: arrToText(job.responsibilities),
    requirements:     arrToText(job.requirements),
    nice_to_have:     arrToText(job.nice_to_have),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DeptBadge({ dept }) {
  const c = DEPT_COLORS[dept] || { bg: "#F3F4F6", text: "#555" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px",
      borderRadius: 99, background: c.bg, color: c.text,
    }}>{dept}</span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: "relative",
          background: checked ? "#2563EB" : "#D1D5DB",
          transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 2,
          left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
      <span style={{ fontSize: 13, color: "#555" }}>{label}</span>
    </label>
  );
}

// Form field helpers
function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#555" }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb",
  fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
  fontFamily: "inherit", background: "#fff", color: "#111",
};
const textareaStyle = { ...inputStyle, resize: "vertical", lineHeight: 1.6 };
const selectStyle   = { ...inputStyle, cursor: "pointer" };

// ─── Job Modal (add / edit) ───────────────────────────────────────────────────
function JobModal({ job, onSave, onClose }) {
  const isEdit = Boolean(job);
  const [form, setForm]       = useState(isEdit ? formFromJob(job) : EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState("");

  function set(key, value) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    if (!form.dept)          { setFormError("Department is required."); return; }
    setFormError("");
    setSaving(true);
    try {
      await onSave({
        title:            form.title.trim(),
        dept:             form.dept,
        location:         form.location.trim() || "Remote",
        type:             form.type,
        is_active:        form.is_active,
        summary:          form.summary.trim() || null,
        responsibilities: textToArr(form.responsibilities),
        requirements:     textToArr(form.requirements),
        nice_to_have:     textToArr(form.nice_to_have),
      });
      onClose();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px 40px", overflowY: "auto", zIndex: 100,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "32px 32px 28px",
        width: "100%", maxWidth: 600, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {isEdit ? "Edit job" : "Add new job"}
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 20, color: "#aaa", lineHeight: 1, padding: 4,
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Title */}
          <Field label="Job title *">
            <input
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              style={inputStyle}
            />
          </Field>

          {/* Dept + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Department *">
              <select value={form.dept} onChange={e => set("dept", e.target.value)} style={selectStyle}>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={e => set("type", e.target.value)} style={selectStyle}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          {/* Location + Active */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }}>
            <Field label="Location">
              <input
                value={form.location}
                onChange={e => set("location", e.target.value)}
                placeholder="Remote"
                style={inputStyle}
              />
            </Field>
            <div style={{ paddingBottom: 9 }}>
              <Toggle
                checked={form.is_active}
                onChange={v => set("is_active", v)}
                label="Active"
              />
            </div>
          </div>

          {/* Summary */}
          <Field label="Summary" hint="(shown on job detail page)">
            <textarea
              value={form.summary}
              onChange={e => set("summary", e.target.value)}
              rows={3}
              placeholder="A short description of the role…"
              style={textareaStyle}
            />
          </Field>

          {/* Responsibilities */}
          <Field label="What you'll do" hint="(one item per line)">
            <textarea
              value={form.responsibilities}
              onChange={e => set("responsibilities", e.target.value)}
              rows={5}
              placeholder={"Design and build high-throughput APIs\nOwn reliability and performance…"}
              style={textareaStyle}
            />
          </Field>

          {/* Requirements */}
          <Field label="What we're looking for" hint="(one item per line)">
            <textarea
              value={form.requirements}
              onChange={e => set("requirements", e.target.value)}
              rows={5}
              placeholder={"5+ years of backend experience\nDeep expertise in Go or Node.js…"}
              style={textareaStyle}
            />
          </Field>

          {/* Nice to have */}
          <Field label="Nice to have" hint="(one item per line)">
            <textarea
              value={form.nice_to_have}
              onChange={e => set("nice_to_have", e.target.value)}
              rows={3}
              placeholder={"Kubernetes experience\nOpen source contributions…"}
              style={textareaStyle}
            />
          </Field>

          {formError && (
            <div style={{ fontSize: 13, color: "#EF4444", background: "#FEF2F2", borderRadius: 8, padding: "10px 14px" }}>
              {formError}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb",
              background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555",
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: saving ? "#93C5FD" : "#2563EB", color: "#fff",
              fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
            }}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteConfirm({ job, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr]           = useState("");

  async function handleDelete() {
    setDeleting(true);
    setErr("");
    try {
      await onConfirm();
    } catch (e) {
      setErr(e.message);
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 28px 24px",
        maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Delete job?</h2>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
          <strong>{job.title}</strong> will be permanently removed. This cannot be undone.
        </p>
        {err && (
          <div style={{ fontSize: 13, color: "#EF4444", marginBottom: 14 }}>{err}</div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{
            padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555",
          }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{
            padding: "8px 18px", borderRadius: 8, border: "none",
            background: deleting ? "#FCA5A5" : "#EF4444", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: deleting ? "default" : "pointer",
          }}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { jobs, loading, error, reload, createJob, updateJob, removeJob } = useJobs();

  const [modal, setModal]   = useState(null); // null | { mode: "add" } | { mode: "edit", job }
  const [toDelete, setToDelete] = useState(null); // job to delete | null

  if (loading && jobs.length === 0) return <LoadingSpinner />;
  if (error   && jobs.length === 0) return <ErrorState message={error} onRetry={reload} />;

  const active   = jobs.filter(j => j.is_active);
  const inactive = jobs.filter(j => !j.is_active);

  return (
    <div style={{ padding: "40px 40px 80px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>Jobs</h1>
          <p style={{ fontSize: 13, color: "#aaa" }}>
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={reload} disabled={loading} style={{
            padding: "7px 14px", background: "#F3F4F6",
            border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: loading ? "default" : "pointer", color: "#555",
          }}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button onClick={() => setModal({ mode: "add" })} style={{
            padding: "7px 16px", background: "#111", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            + Add job
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 160px 120px 100px 90px 100px",
          padding: "12px 24px", background: "#F9FAFB", borderBottom: "1px solid #f0f0f0",
        }}>
          {["Title", "Department", "Location", "Type", "Status", "Actions"].map(h => (
            <span key={h} style={{
              fontSize: 11, fontWeight: 700, color: "#bbb",
              textTransform: "uppercase", letterSpacing: "0.07em",
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {jobs.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#bbb", fontSize: 13 }}>
            No jobs yet. Click "+ Add job" to create one.
          </div>
        ) : jobs.map((job, i) => (
          <div
            key={job.id}
            style={{
              display: "grid", gridTemplateColumns: "1fr 160px 120px 100px 90px 100px",
              padding: "14px 24px", alignItems: "center",
              borderBottom: i < jobs.length - 1 ? "1px solid #f8f8f8" : "none",
              transition: "background 0.1s",
              opacity: job.is_active ? 1 : 0.55,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Title */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                {job.title}
              </div>
              {job.summary && (
                <div style={{ fontSize: 11, color: "#aaa", maxWidth: 380, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {job.summary}
                </div>
              )}
            </div>

            {/* Dept */}
            <DeptBadge dept={job.dept} />

            {/* Location */}
            <span style={{ fontSize: 12, color: "#666" }}>{job.location}</span>

            {/* Type */}
            <span style={{ fontSize: 12, color: "#666" }}>{job.type}</span>

            {/* Status */}
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
              display: "inline-block",
              color:      job.is_active ? "#166534" : "#92400E",
              background: job.is_active ? "#F0FDF4" : "#FFFBEB",
            }}>
              {job.is_active ? "Active" : "Hidden"}
            </span>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setModal({ mode: "edit", job })}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #e5e7eb",
                  background: "#fff", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", color: "#555",
                }}
              >Edit</button>
              <button
                onClick={() => setToDelete(job)}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #FECACA",
                  background: "#FEF2F2", fontSize: 11, fontWeight: 600,
                  cursor: "pointer", color: "#EF4444",
                }}
              >Del</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <JobModal
          job={modal.mode === "edit" ? modal.job : null}
          onSave={modal.mode === "edit"
            ? patch => updateJob(modal.job.id, patch)
            : patch => createJob(patch)
          }
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {toDelete && (
        <DeleteConfirm
          job={toDelete}
          onConfirm={async () => { await removeJob(toDelete.id); setToDelete(null); }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
