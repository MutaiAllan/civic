import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import SentimentBadge from "@/components/ui/SentimentBadge";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils";
import Chatbot from "@/components/citizen/Chatbot";

export default async function MyComplaintsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const complaints = await prisma.complaint.findMany({
    where:   { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    all:        complaints.length,
    pending:    complaints.filter((c: any) => c.status === "PENDING").length,
    inProgress: complaints.filter((c: any) => c.status === "IN_PROGRESS").length,
    resolved:   complaints.filter((c: any) => c.status === "RESOLVED").length,
  };

  return (
    <>
      <div className="max-w-3xl px-10 py-8">
        <PageHeader
          title="My Complaints"
          subtitle={`${counts.all} total · ${counts.pending} pending · ${counts.resolved} resolved`}
          action={
            <Link
              href="/citizen/new"
              className="bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              + New Complaint
            </Link>
          }
        />

        {complaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <EmptyState
              title="No complaints yet"
              description="When you submit a complaint it will appear here with live status updates."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {complaints.map((c: any) => (
              <div
                key={c.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 leading-relaxed mb-2">{c.rawText}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {c.category   && <span>{c.category}</span>}
                      {c.department && <span>→ {c.department}</span>}
                      <span>{formatDate(c.createdAt.toString())}</span>
                    </div>
                  </div>
                  {/* Right */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={c.status} />
                    <SentimentBadge label={c.sentimentLabel} />
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-0">
                    {(["PENDING", "IN_PROGRESS", "RESOLVED"] as const).map((s, i) => {
                      const reached = ["PENDING","IN_PROGRESS","RESOLVED"].indexOf(c.status) >= i;
                      const labels: Record<string,string> = { PENDING:"Submitted", IN_PROGRESS:"In Progress", RESOLVED:"Resolved" };
                      return (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full transition-colors ${reached ? "bg-slate-800" : "bg-slate-200"}`} />
                            <p className={`text-xs mt-1 whitespace-nowrap ${reached ? "text-slate-600" : "text-slate-300"}`}>
                              {labels[s]}
                            </p>
                          </div>
                          {i < 2 && <div className={`flex-1 h-px mx-2 mb-4 ${reached && c.status !== s ? "bg-slate-800" : "bg-slate-200"}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Chatbot />
    </>
  );
}
