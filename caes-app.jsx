import { useState, useEffect, useRef } from "react";

const MOCK_COMPLAINTS = [
  { id: "c001", user_id: "u1", raw_text: "The road on Kimathi Street has large potholes causing accidents.", category: "Infrastructure", sentiment_label: "Negative", status: "Pending", department: "Roads & Transport", created_at: "2025-05-01T08:22:00Z" },
  { id: "c002", user_id: "u1", raw_text: "Public health clinic ran out of malaria medication again.", category: "Health", sentiment_label: "Negative", status: "In Progress", department: "Ministry of Health", created_at: "2025-05-03T10:14:00Z" },
  { id: "c003", user_id: "u1", raw_text: "The new community park in Westlands is well maintained. Thank you.", category: "Environment", sentiment_label: "Positive", status: "Resolved", department: "Parks & Recreation", created_at: "2025-05-05T13:45:00Z" },
  { id: "c004", user_id: "u2", raw_text: "Garbage collection in Eastleigh has not happened in two weeks.", category: "Sanitation", sentiment_label: "Negative", status: "Pending", department: "Sanitation Authority", created_at: "2025-05-06T09:00:00Z" },
  { id: "c005", user_id: "u2", raw_text: "Water supply was restored quickly after the outage. Good response.", category: "Utilities", sentiment_label: "Positive", status: "Resolved", department: "Water & Sewerage", created_at: "2025-05-07T16:30:00Z" },
  { id: "c006", user_id: "u3", raw_text: "Street lights along Ngong Road have been broken for a month.", category: "Infrastructure", sentiment_label: "Negative", status: "In Progress", department: "Roads & Transport", created_at: "2025-05-08T11:20:00Z" },
  { id: "c007", user_id: "u3", raw_text: "The noise from the construction site near CBD is unbearable.", category: "Environment", sentiment_label: "Negative", status: "Pending", department: "Environment & Planning", created_at: "2025-05-09T14:10:00Z" },
  { id: "c008", user_id: "u4", raw_text: "School feeding program is working well in Mathare North.", category: "Education", sentiment_label: "Positive", status: "Resolved", department: "Ministry of Education", created_at: "2025-05-10T08:55:00Z" },
  { id: "c009", user_id: "u4", raw_text: "Bribery demand at city council licensing office.", category: "Governance", sentiment_label: "Negative", status: "In Progress", department: "Ethics & Integrity", created_at: "2025-05-11T15:00:00Z" },
  { id: "c010", user_id: "u1", raw_text: "Traffic management around the CBD is somewhat better now.", category: "Infrastructure", sentiment_label: "Neutral", status: "Resolved", department: "Roads & Transport", created_at: "2025-05-12T07:30:00Z" },
];

const CATEGORIES = ["Infrastructure", "Health", "Sanitation", "Environment", "Utilities", "Education", "Governance", "Other"];
const DEPARTMENTS = { Infrastructure: "Roads & Transport", Health: "Ministry of Health", Sanitation: "Sanitation Authority", Environment: "Environment & Planning", Utilities: "Water & Sewerage", Education: "Ministry of Education", Governance: "Ethics & Integrity", Other: "General Affairs" };
const STATUS_COLORS = { Pending: { bg: "#fef3c7", text: "#92400e", dot: "#d97706" }, "In Progress": { bg: "#dbeafe", text: "#1e3a8a", dot: "#3b82f6" }, Resolved: { bg: "#dcfce7", text: "#14532d", dot: "#22c55e" } };
const SENTIMENT_COLORS = { Positive: "#16a34a", Negative: "#dc2626", Neutral: "#6b7280" };

const MOCK_SENTIMENT = { Positive: 28, Negative: 54, Neutral: 18 };
const MOCK_CATEGORIES = { Infrastructure: 32, Health: 18, Sanitation: 14, Environment: 12, Utilities: 9, Education: 8, Governance: 7 };

const BOT_RESPONSES = [
  "To submit a new complaint, click 'New Complaint' in the sidebar and follow the steps.",
  "You can track the status of your complaint in the 'My Complaints' section.",
  "Complaints are automatically routed to the relevant department based on category.",
  "Typical resolution time is 5–14 working days depending on complexity.",
  "If your complaint has been 'In Progress' for over 2 weeks, you may escalate via the options menu.",
  "Sentiment analysis is performed automatically to help prioritize urgent issues.",
];

function cn(...classes) { return classes.filter(Boolean).join(" "); }

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function SentimentBadge({ label }) {
  const colors = { Positive: { bg: "#dcfce7", text: "#14532d" }, Negative: { bg: "#fee2e2", text: "#7f1d1d" }, Neutral: { bg: "#f1f5f9", text: "#334155" } };
  const c = colors[label] || colors.Neutral;
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>{label}</span>;
}

function Avatar({ name, size = 32 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 500, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Sidebar({ view, setView, role, setRole }) {
  const citizenNav = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "new-complaint", icon: "+", label: "New Complaint" },
    { id: "my-complaints", icon: "≡", label: "My Complaints" },
  ];
  const adminNav = [
    { id: "admin-overview", icon: "⊞", label: "Overview" },
    { id: "admin-complaints", icon: "≡", label: "All Complaints" },
    { id: "admin-analytics", icon: "◈", label: "Analytics" },
  ];
  const nav = role === "citizen" ? citizenNav : adminNav;

  return (
    <aside style={{ width: 220, minHeight: "100vh", background: "#f8fafc", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, background: "#1e293b", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>C</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", letterSpacing: "-0.01em" }}>CAES</span>
        </div>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Civic Engagement System</p>
      </div>

      <div style={{ padding: "16px 12px 8px", flex: 1 }}>
        <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "0 8px 8px" }}>
          {role === "citizen" ? "Citizen" : "Admin"}
        </p>
        {nav.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} style={{ width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: view === item.id ? 500 : 400, background: view === item.id ? "#e2e8f0" : "transparent", color: view === item.id ? "#0f172a" : "#64748b", marginBottom: 2, transition: "all 0.1s" }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 8px" }}>Switch role</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["citizen", "admin"].map(r => (
            <button key={r} onClick={() => { setRole(r); setView(r === "citizen" ? "dashboard" : "admin-overview"); }} style={{ flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 500, border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", background: role === r ? "#1e293b" : "#fff", color: role === r ? "#fff" : "#64748b", textTransform: "capitalize", transition: "all 0.15s" }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Avatar name={role === "citizen" ? "Jane Wanjiru" : "Admin User"} size={28} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: "#0f172a", margin: 0 }}>{role === "citizen" ? "Jane Wanjiru" : "Admin User"}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function CitizenDashboard({ setView }) {
  const myComplaints = MOCK_COMPLAINTS.filter(c => c.user_id === "u1");
  const stats = { total: myComplaints.length, pending: myComplaints.filter(c => c.status === "Pending").length, resolved: myComplaints.filter(c => c.status === "Resolved").length };

  return (
    <div style={{ maxWidth: 760, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Good morning, Jane</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 32px" }}>Here's an overview of your civic activity.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[{ label: "Total Complaints", value: stats.total, icon: "📋" }, { label: "Pending Review", value: stats.pending, icon: "⏳" }, { label: "Resolved", value: stats.resolved, icon: "✓" }].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 20px" }}>
            <p style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, margin: "0 0 8px" }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>Recent Complaints</h2>
          <button onClick={() => setView("my-complaints")} style={{ fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>View all</button>
        </div>
        {myComplaints.slice(0, 3).map(c => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: "#0f172a", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16 }}>{c.raw_text}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{c.category} · {new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
        ))}
      </div>

      <button onClick={() => setView("new-complaint")} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em" }}>
        + Submit New Complaint
      </button>
    </div>
  );
}

function NewComplaintForm({ setView, addComplaint }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ raw_text: "", category: "", department: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (cat) => setForm(f => ({ ...f, category: cat, department: DEPARTMENTS[cat] || "" }));

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      addComplaint({ ...form, status: "Pending", sentiment_label: "Neutral", created_at: new Date().toISOString(), id: "c0" + Math.random().toString(36).slice(2, 6), user_id: "u1" });
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  if (submitted) return (
    <div style={{ maxWidth: 520, padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>✓</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>Complaint Submitted</h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>Your complaint has been received and assigned to the <strong>{form.department}</strong>. You'll receive updates as it progresses.</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => { setSubmitted(false); setStep(1); setForm({ raw_text: "", category: "", department: "" }); }} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Submit Another</button>
        <button onClick={() => setView("my-complaints")} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>View My Complaints</button>
      </div>
    </div>
  );

  const steps = ["Describe Issue", "Categorize", "Review & Submit"];

  return (
    <div style={{ maxWidth: 580, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Submit a Complaint</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 28px" }}>Help us improve public services by reporting issues in your area.</p>

      <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              {i > 0 && <div style={{ flex: 1, height: 1, background: i < step ? "#1e293b" : "#e2e8f0" }} />}
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: i + 1 <= step ? "#1e293b" : "#e2e8f0", color: i + 1 <= step ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i + 1 < step ? "#1e293b" : "#e2e8f0" }} />}
            </div>
            <p style={{ fontSize: 10, color: i + 1 === step ? "#0f172a" : "#94a3b8", fontWeight: i + 1 === step ? 600 : 400, marginTop: 6, textAlign: "center" }}>{s}</p>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 8 }}>Describe your issue</label>
          <textarea value={form.raw_text} onChange={e => setForm(f => ({ ...f, raw_text: e.target.value }))} rows={5} placeholder="Describe the problem in detail — location, duration, and impact..." style={{ width: "100%", padding: "12px 14px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, resize: "vertical", fontFamily: "inherit", color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 24px" }}>{form.raw_text.length}/500 characters</p>
          <button disabled={form.raw_text.trim().length < 10} onClick={() => setStep(2)} style={{ background: form.raw_text.trim().length < 10 ? "#f1f5f9" : "#1e293b", color: form.raw_text.trim().length < 10 ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: form.raw_text.trim().length < 10 ? "not-allowed" : "pointer" }}>
            Continue →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 12 }}>Select a category</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${form.category === cat ? "#1e293b" : "#e2e8f0"}`, background: form.category === cat ? "#f8fafc" : "#fff", color: form.category === cat ? "#0f172a" : "#64748b", fontSize: 13, fontWeight: form.category === cat ? 500 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.1s" }}>
                {cat}
              </button>
            ))}
          </div>
          {form.category && (
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#64748b" }}>
              Will be routed to: <strong style={{ color: "#0f172a" }}>{form.department}</strong>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>← Back</button>
            <button disabled={!form.category} onClick={() => setStep(3)} style={{ background: !form.category ? "#f1f5f9" : "#1e293b", color: !form.category ? "#94a3b8" : "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: !form.category ? "not-allowed" : "pointer" }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px", marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Review your complaint</h3>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>{form.raw_text}</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
              <span><span style={{ color: "#94a3b8" }}>Category:</span> <strong style={{ color: "#0f172a" }}>{form.category}</strong></span>
              <span><span style={{ color: "#94a3b8" }}>Department:</span> <strong style={{ color: "#0f172a" }}>{form.department}</strong></span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }}>By submitting, you confirm this information is accurate. Sentiment analysis will be applied automatically.</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>← Back</button>
            <button onClick={handleSubmit} disabled={loading} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MyComplaints({ complaints }) {
  const myComplaints = complaints.filter(c => c.user_id === "u1");
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? myComplaints : myComplaints.filter(c => c.status === filter);

  return (
    <div style={{ maxWidth: 800, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>My Complaints</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>{myComplaints.length} total complaints submitted</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {["All", "Pending", "In Progress", "Resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: filter === f ? 600 : 400, background: filter === f ? "#1e293b" : "#fff", color: filter === f ? "#fff" : "#64748b", cursor: "pointer", transition: "all 0.1s" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(c => (
          <div key={c.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                <p style={{ fontSize: 13, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.5 }}>{c.raw_text}</p>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                  <span>{c.category}</span>
                  <span>→ {c.department}</span>
                  <span>{new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <StatusBadge status={c.status} />
                <SentimentBadge label={c.sentiment_label} />
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>No complaints with status "{filter}"</div>
        )}
      </div>
    </div>
  );
}

function AdminOverview({ complaints }) {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const negPct = Math.round(complaints.filter(c => c.sentiment_label === "Negative").length / total * 100);

  return (
    <div style={{ maxWidth: 860, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Admin Overview</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 28px" }}>System-wide complaint metrics — last 30 days</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[{ label: "Total", value: total, sub: "complaints" }, { label: "Pending", value: pending, sub: "awaiting action" }, { label: "In Progress", value: inProgress, sub: "being handled" }, { label: "Resolved", value: resolved, sub: "completed" }].map(s => (
          <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "18px 16px" }}>
            <p style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 600, color: "#0f172a", margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <MoodRadar />
        <CategoryBreakdown complaints={complaints} />
      </div>

      <div style={{ marginTop: 20, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", margin: "0 0 12px" }}>Alert: High negative sentiment</h3>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
          <span style={{ color: "#dc2626", fontWeight: 500 }}>{negPct}%</span> of complaints carry negative sentiment. Infrastructure and Governance categories require immediate attention.
        </p>
      </div>
    </div>
  );
}

function MoodRadar() {
  const data = MOCK_SENTIMENT;
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = { Positive: "#16a34a", Negative: "#dc2626", Neutral: "#6b7280" };
  const bg = { Positive: "#dcfce7", Negative: "#fee2e2", Neutral: "#f1f5f9" };

  let cumulative = 0;
  const slices = Object.entries(data).map(([key, val]) => {
    const pct = val / total;
    const start = cumulative;
    cumulative += pct;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const r = 70;
    const cx = 90, cy = 90;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;
    return { key, val, pct, d, color: colors[key] };
  });

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Mood Radar</h3>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <svg width={180} height={180} viewBox="0 0 180 180">
          {slices.map(s => <path key={s.key} d={s.d} fill={s.color} stroke="#fff" strokeWidth={2} />)}
          <circle cx={90} cy={90} r={40} fill="#fff" />
        </svg>
        <div style={{ flex: 1 }}>
          {Object.entries(data).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[key] }} />
                <span style={{ fontSize: 12, color: "#475569" }}>{key}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 80, height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{ width: `${val}%`, height: "100%", background: colors[key], borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", minWidth: 28, textAlign: "right" }}>{val}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", margin: "12px 0 0", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>Powered by mock NLP API · Updated hourly</p>
    </div>
  );
}

function CategoryBreakdown({ complaints }) {
  const cats = {};
  complaints.forEach(c => { cats[c.category] = (cats[c.category] || 0) + 1; });
  const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Category Breakdown</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(([cat, count]) => (
          <div key={cat}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "#475569" }}>{cat}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>{count}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
              <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: "#334155", borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminComplaints({ complaints }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat, setFilterCat] = useState("All");

  const filtered = complaints.filter(c => {
    const matchSearch = c.raw_text.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    const matchCat = filterCat === "All" || c.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div style={{ maxWidth: 1000, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>All Complaints</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>{filtered.length} of {complaints.length} complaints</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints, departments..." style={{ flex: "1 1 220px", padding: "8px 12px", fontSize: 13, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", color: "#0f172a" }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", background: "#fff" }}>
          {["All", "Pending", "In Progress", "Resolved"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, color: "#475569", background: "#fff" }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["ID", "Description", "Category", "Department", "Sentiment", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "10px 14px", color: "#94a3b8", fontFamily: "monospace", fontSize: 11 }}>{c.id}</td>
                <td style={{ padding: "10px 14px", color: "#374151", maxWidth: 200 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{c.raw_text}</div>
                </td>
                <td style={{ padding: "10px 14px", color: "#475569" }}>{c.category}</td>
                <td style={{ padding: "10px 14px", color: "#475569", fontSize: 11 }}>{c.department}</td>
                <td style={{ padding: "10px 14px" }}><SentimentBadge label={c.sentiment_label} /></td>
                <td style={{ padding: "10px 14px" }}><StatusBadge status={c.status} /></td>
                <td style={{ padding: "10px 14px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: 13 }}>No complaints match your filters</div>
        )}
      </div>
    </div>
  );
}

function AdminAnalytics({ complaints }) {
  const sentimentData = { ...MOCK_SENTIMENT };
  const catData = { ...MOCK_CATEGORIES };

  return (
    <div style={{ maxWidth: 860, padding: "32px 40px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Analytics</h1>
      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 28px" }}>AI-driven sentiment and category analysis · Mock NLP API</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <MoodRadar />
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>Department Load</h3>
          {["Roads & Transport", "Ministry of Health", "Sanitation Authority", "Ethics & Integrity", "Water & Sewerage"].map(dep => {
            const count = complaints.filter(c => c.department === dep).length;
            const pct = Math.round((count / complaints.length) * 100);
            return (
              <div key={dep} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#475569" }}>{dep}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{count} cases</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9" }}>
                  <div style={{ width: `${pct * 3}%`, maxWidth: "100%", height: "100%", background: pct > 25 ? "#dc2626" : "#334155", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Category Distribution</h3>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 16px" }}>Based on mock NLP categorization</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(catData).sort((a, b) => b[1] - a[1]).map(([cat, pct]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "#475569", width: 110, flexShrink: 0 }}>{cat}</span>
              <div style={{ flex: 1, height: 20, borderRadius: 4, background: "#f8fafc", overflow: "hidden", position: "relative" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#334155", borderRadius: 4 }} />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: pct > 40 ? "#fff" : "#94a3b8", fontWeight: 600 }}>{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>Mock API Response Preview</h3>
        <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px" }}>This is the structure your Python NLP endpoint should return:</p>
        <pre style={{ fontSize: 10, color: "#334155", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 14, overflow: "auto", margin: 0, lineHeight: 1.6 }}>{JSON.stringify({ complaint_id: "c001", sentiment_label: "Negative", sentiment_score: 0.82, category: "Infrastructure", department: "Roads & Transport", keywords: ["potholes", "accident", "road"] }, null, 2)}</pre>
      </div>
    </div>
  );
}

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hello! I'm CAES Assistant. How can I help you navigate the civic portal today?" }]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setTimeout(() => {
      const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
      setMessages(m => [...m, { role: "bot", text: response }]);
    }, 600);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {open && (
        <div style={{ width: 320, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, marginBottom: 10, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ background: "#1e293b", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0 }}>CAES Assistant</p>
              <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>Citizen guidance bot</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ height: 240, overflowY: "auto", padding: "14px 14px 0" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: m.role === "user" ? "#1e293b" : "#f1f5f9", color: m.role === "user" ? "#fff" : "#374151", fontSize: 12, lineHeight: 1.5 }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div style={{ padding: "10px 14px 14px", display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask something..." style={{ flex: 1, padding: "7px 10px", fontSize: 12, border: "1px solid #e2e8f0", borderRadius: 8, outline: "none", color: "#0f172a" }} />
            <button onClick={send} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontSize: 12, cursor: "pointer" }}>→</button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{ width: 48, height: 48, borderRadius: "50%", background: "#1e293b", color: "#fff", border: "none", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState("citizen");
  const [view, setView] = useState("dashboard");
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);

  const addComplaint = (c) => setComplaints(prev => [c, ...prev]);

  const renderView = () => {
    if (role === "citizen") {
      if (view === "dashboard") return <CitizenDashboard setView={setView} />;
      if (view === "new-complaint") return <NewComplaintForm setView={setView} addComplaint={addComplaint} />;
      if (view === "my-complaints") return <MyComplaints complaints={complaints} />;
    } else {
      if (view === "admin-overview") return <AdminOverview complaints={complaints} />;
      if (view === "admin-complaints") return <AdminComplaints complaints={complaints} />;
      if (view === "admin-analytics") return <AdminAnalytics complaints={complaints} />;
    }
    return null;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Sidebar view={view} setView={setView} role={role} setRole={setRole} />
      <main style={{ flex: 1, overflowY: "auto", background: "#fafafa" }}>
        {renderView()}
      </main>
      {role === "citizen" && <Chatbot />}
    </div>
  );
}
