"use client";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import SentimentBadge from "@/components/ui/SentimentBadge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateShort } from "@/lib/utils";
import type { Complaint } from "@prisma/client";

interface Props {
  initialComplaints: Complaint[];
  userEmail:         string;
}

export default function CitizenDashboard({ initialComplaints, userEmail }: Props) {
  const firstName = userEmail.split("@")[0].split(/[._-]/)[0];
  const name      = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const total    = initialComplaints.length;
  const pending  = initialComplaints.filter(c => c.status === "PENDING").length;
  const progress = initialComplaints.filter(c => c.status === "IN_PROGRESS").length;
  const resolved = initialComplaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="max-w-2xl px-10 py-8">
      {/* Greeting */}
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Good morning, {name}</h1>
      <p className="text-sm text-slate-500 mb-8">Here&apos;s an overview of your civic activity.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total",       value: total,    },
          { label: "Pending",     value: pending,  },
          { label: "In Progress", value: progress, },
          { label: "Resolved",    value: resolved, },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">{s.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Complaints</h2>
          <Link href="/citizen/complaints" className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
            View all
          </Link>
        </div>

        {initialComplaints.length === 0 ? (
          <EmptyState
            title="No complaints yet"
            description="Submit your first complaint and we'll route it to the right department."
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {initialComplaints.slice(0, 5).map(c => (
              <div key={c.id} className="flex justify-between items-start py-3 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm text-slate-800 truncate mb-1">{c.rawText}</p>
                  <p className="text-xs text-slate-400">
                    {c.category} · {c.department} · {formatDateShort(c.createdAt.toString())}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <StatusBadge status={c.status} />
                  {c.sentimentLabel && <SentimentBadge label={c.sentimentLabel} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution progress bar */}
      {total > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Resolution rate</span>
            <span className="font-semibold text-slate-800">{Math.round((resolved / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-800 rounded-full transition-all"
              style={{ width: `${(resolved / total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{resolved} of {total} complaints resolved</p>
        </div>
      )}

      <Link
        href="/citizen/new"
        className="inline-flex items-center gap-2 bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <span>+</span> Submit New Complaint
      </Link>
    </div>
  );
}
