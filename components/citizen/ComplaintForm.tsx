"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

const CATEGORIES = [
  "Infrastructure", "Health", "Sanitation", "Environment",
  "Utilities",      "Education", "Governance",  "Other",
];

const DEPARTMENTS: Record<string, string> = {
  Infrastructure: "Roads & Transport",
  Health:         "Ministry of Health",
  Sanitation:     "Sanitation Authority",
  Environment:    "Environment & Planning",
  Utilities:      "Water & Sewerage",
  Education:      "Ministry of Education",
  Governance:     "Ethics & Integrity",
  Other:          "General Affairs",
};

const MAX_CHARS = 500;
const STEPS     = ["Describe Issue", "Categorize", "Review & Submit"] as const;

export default function ComplaintForm() {
  const router        = useRouter();
  const { show, ToastComponent } = useToast();

  const [step,      setStep]      = useState(0);
  const [rawText,   setRawText]   = useState("");
  const [category,  setCategory]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const department = DEPARTMENTS[category] ?? "General Affairs";

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ rawText, category }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Submission failed");
      }
      
      const complaint = await res.json();
      
      // Fire-and-forget sentiment analysis in the background
      fetch(`/api/sentiment?complaintId=${complaint.id}`).catch(err => {
        console.error("Async sentiment analysis failed:", err);
      });

      setSubmitted(true);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setRawText(""); setCategory(""); setSubmitted(false);
  };

  // ── Success state ─────────────────────────────────────────────────
  if (submitted) return (
    <div className="flex flex-col items-center text-center max-w-sm mx-auto py-24 px-8">
      <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-2xl mb-5">✓</div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Complaint Submitted</h2>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        Routed to <strong className="text-slate-700">{department}</strong>.
        Sentiment analysis will be applied shortly. You can track progress below.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 transition-colors"
        >
          New complaint
        </button>
        <button
          onClick={() => router.push("/citizen/complaints")}
          className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
        >
          View complaints
        </button>
      </div>
    </div>
  );

  // ── Step indicator ────────────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i < step  ? "bg-slate-800 text-white"
            : i === step ? "border-2 border-slate-800 text-slate-800"
            :              "border border-slate-200 text-slate-400"
            }`}>
              {i < step ? "✓" : i + 1}
            </div>
            <p className={`text-xs mt-1 hidden sm:block ${i === step ? "text-slate-800 font-medium" : "text-slate-400"}`}>
              {s}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-3 mb-4 transition-colors ${i < step ? "bg-slate-800" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-lg px-10 py-8">
      {ToastComponent}

      <h1 className="text-xl font-semibold text-slate-900 mb-1">Submit a Complaint</h1>
      <p className="text-sm text-slate-500 mb-7">Help us improve public services by reporting issues.</p>

      <StepBar />

      {/* ── Step 0: Describe ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Describe your issue <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value.slice(0, MAX_CHARS))}
              rows={5}
              placeholder="Describe the problem — location, how long it has been happening, and its impact on residents…"
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg text-slate-900 resize-none focus:border-slate-400 transition-colors"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-400">{rawText.length < 10 && rawText.length > 0 ? "Minimum 10 characters" : ""}</p>
              <p className={`text-xs ${rawText.length >= MAX_CHARS ? "text-red-400" : "text-slate-400"}`}>
                {rawText.length}/{MAX_CHARS}
              </p>
            </div>
          </div>
          <button
            disabled={rawText.trim().length < 10}
            onClick={() => setStep(1)}
            className="bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 1: Categorize ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-xs font-medium text-slate-500">Select the best matching category</p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                  category === cat
                    ? "border-slate-800 bg-slate-50 text-slate-900 font-medium"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {category && (
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-xs text-slate-500 flex items-center gap-2">
              <span>→</span>
              <span>Will be routed to <strong className="text-slate-800">{department}</strong></span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setStep(0)} className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              ← Back
            </button>
            <button
              disabled={!category}
              onClick={() => setStep(2)}
              className="px-6 py-2 text-sm bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
            >
              Review →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Review your complaint</h3>
            <p className="text-sm text-slate-700 leading-relaxed pb-3 border-b border-slate-100">
              {rawText}
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-medium text-slate-800">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-medium text-slate-800">{department}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By submitting, you confirm this information is accurate. Sentiment analysis will be applied automatically and may affect complaint priority.
          </p>

          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60 disabled:cursor-wait transition-colors flex items-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              )}
              {loading ? "Submitting…" : "Submit Complaint"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
