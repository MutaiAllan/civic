"use client";
import { useState, useEffect } from "react";

export interface AnalyticsData {
  total:       number;
  byStatus:    { status: string;         _count: { id: number } }[];
  bySentiment: { sentimentLabel: string; _count: { id: number } }[];
  byCategory:  { category: string;       _count: { id: number } }[];
}

export function useAnalytics() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
