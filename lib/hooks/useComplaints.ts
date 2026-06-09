"use client";
import { useState, useEffect, useCallback } from "react";

export interface Complaint {
  id:             string;
  userId:         string;
  rawText:        string;
  category:       string | null;
  sentimentLabel: string | null;
  status:         string;
  department:     string | null;
  createdAt:      string;
}

interface Options {
  status?:   string;
  category?: string;
  search?:   string;
}

export function useComplaints(opts: Options = {}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (opts.status)   p.set("status",   opts.status);
      if (opts.category) p.set("category", opts.category);
      if (opts.search)   p.set("search",   opts.search);
      const res = await fetch(`/api/complaints?${p}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setComplaints(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [opts.status, opts.category, opts.search]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const submitComplaint = async (data: { rawText: string; category: string }) => {
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit");
    const created = await res.json();
    setComplaints(prev => [created, ...prev]);
    return created;
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update");
    const updated = await res.json();
    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status: updated.status } : c)));
    return updated;
  };

  return { complaints, loading, error, refetch: fetchComplaints, submitComplaint, updateStatus };
}
