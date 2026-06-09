"use client";
import { useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import SentimentBadge from "@/components/ui/SentimentBadge";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

type Tab = "overview" | "complaints" | "analytics";

interface Props {
  complaints: any[];
  analytics: { byStatus: any[]; bySentiment: any[]; byCategory: any[] };
  defaultTab?: Tab;
}

export default function AdminDashboard({ complaints, analytics, defaultTab = "overview" }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCat, setFilterCat] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const total      = complaints.length;
  const pending    = complaints.filter(c => c.status === "PENDING").length;
  const inProgress = complaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolved   = complaints.filter(c => c.status === "RESOLVED").length;

  const sentimentTotals = analytics.bySentiment.reduce<Record<string, number>>(
    (acc, row: any) => ({ ...acc, [row.sentimentLabel]: row._count.id }),
    {}
  );

  const filtered = complaints.filter(c => {
    const matchSearch =
      c.rawText.toLowerCase().includes(search.toLowerCase()) ||
      (c.department ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.user?.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchCat    = filterCat    === "ALL" || c.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    // Optimistic update without full reload — in production use SWR/React Query
    setUpdatingId(null);
    window.location.reload();
  };

  const regenerateSentiment = async (id: string) => {
    setRegeneratingId(id);
    try {
      const res = await fetch(`/api/sentiment?complaintId=${id}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to regenerate");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate sentiment");
    } finally {
      setRegeneratingId(null);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview",    label: "Overview"       },
    { id: "complaints",  label: "All Complaints" },
    { id: "analytics",   label: "Analytics"      },
  ];

  return (
    <div className="max-w-5xl px-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">System-wide complaint management</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                tab === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total",       value: total      },
              { label: "Pending",     value: pending    },
              { label: "In Progress", value: inProgress },
              { label: "Resolved",    value: resolved   },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-5 border border-black/5">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">{s.label}</p>
                <p className="text-3xl font-semibold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Dynamic Mood Radar (Pie) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-[300px] flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Mood Radar</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Positive", value: sentimentTotals["POSITIVE"] ?? 0, color: "#22c55e" },
                        { name: "Neutral",  value: sentimentTotals["NEUTRAL"]  ?? 0, color: "#94a3b8" },
                        { name: "Negative", value: sentimentTotals["NEGATIVE"] ?? 0, color: "#ef4444" },
                      ].filter(d => d.value > 0)}
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {[
                        { name: "Positive", color: "#22c55e" },
                        { name: "Neutral",  color: "#94a3b8" },
                        { name: "Negative", color: "#ef4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-2 pt-3 border-t border-slate-100">
                AI analysis updated after each submission
              </p>
            </div>

            {/* Dynamic Category Breakdown (Bar) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-[300px] flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Category Breakdown</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byCategory.slice(0, 5)} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="_count.id" fill="#1e293b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Alert */}
          {(sentimentTotals["NEGATIVE"] ?? 0) / total > 0.4 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-sm font-medium text-red-800 mb-1">High negative sentiment detected</p>
              <p className="text-xs text-red-600 leading-relaxed">
                {Math.round((sentimentTotals["NEGATIVE"] ?? 0) / total * 100)}% of complaints carry
                negative sentiment. Infrastructure and Governance categories require immediate attention.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── COMPLAINTS TABLE ── */}
      {tab === "complaints" && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-3 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search text, department, email..."
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-900 focus:border-slate-400"
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white"
            >
              <option value="ALL">All categories</option>
              {["Infrastructure","Health","Sanitation","Environment","Utilities","Education","Governance","Other"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-400 mb-3">{filtered.length} of {complaints.length} complaints</p>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Description", "Category", "Department", "Submitted by", "Sentiment", "Status", "Date", "Action"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-xs text-slate-700 truncate" title={c.rawText}>{c.rawText}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{c.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{c.department}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{c.user?.email ?? "—"}</td>
                      <td className="px-4 py-3"><SentimentBadge label={c.sentimentLabel} /></td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={c.status}
                          disabled={updatingId === c.id}
                          onChange={e => updateStatus(c.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 disabled:opacity-50"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={regeneratingId === c.id}
                          onClick={() => regenerateSentiment(c.id)}
                          className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          {regeneratingId === c.id ? "..." : "Regenerate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No complaints match your filters.</p>
            )}
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4">
            {(["POSITIVE", "NEGATIVE", "NEUTRAL"] as const).map(label => {
              const count = sentimentTotals[label] ?? 0;
              const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
              const colors: Record<string, { bg: string; text: string }> = {
                POSITIVE: { bg: "bg-green-50",  text: "text-green-800"  },
                NEGATIVE: { bg: "bg-red-50",    text: "text-red-800"    },
                NEUTRAL:  { bg: "bg-slate-100", text: "text-slate-600"  },
              };
              const c = colors[label];
              return (
                <div key={label} className={`${c.bg} rounded-xl p-5 border border-black/5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${c.text}`}>{label.toLowerCase()}</p>
                  <p className={`text-3xl font-semibold ${c.text}`}>{pct}%</p>
                  <p className={`text-xs mt-1 ${c.text} opacity-70`}>{count} of {total} complaints</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Sentiment Pie Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-[350px] flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Sentiment Distribution</h3>
              <p className="text-xs text-slate-400 mb-4">Real-time analysis of citizen feedback</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Positive", value: sentimentTotals["POSITIVE"] ?? 0, color: "#22c55e" },
                        { name: "Neutral",  value: sentimentTotals["NEUTRAL"]  ?? 0, color: "#94a3b8" },
                        { name: "Negative", value: sentimentTotals["NEGATIVE"] ?? 0, color: "#ef4444" },
                      ].filter(d => d.value > 0)}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Positive", color: "#22c55e" },
                        { name: "Negative", color: "#ef4444" },
                        { name: "Neutral",  color: "#94a3b8" },
                        
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Histogram */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-[350px] flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Top Issue Categories</h3>
              <p className="text-xs text-slate-400 mb-4">Distribution across infrastructure & services</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byCategory.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="category" 
                      type="category" 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      width={80}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="_count.id" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Submission Volume</h3>
            <p className="text-xs text-slate-400 mb-6">Total complaints per day (last 7 recorded days)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={Object.entries(
                    complaints.reduce((acc: any, c) => {
                      const date = new Date(c.createdAt).toLocaleDateString("en-KE", { day: 'numeric', month: 'short' });
                      acc[date] = (acc[date] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([date, count]) => ({ date, count })).reverse().slice(-7)}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#1e293b" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
