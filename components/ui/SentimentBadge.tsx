const CONFIG = {
  POSITIVE: { label: "Positive", bg: "bg-green-50",  text: "text-green-700" },
  NEGATIVE: { label: "Negative", bg: "bg-red-50",    text: "text-red-700"   },
  NEUTRAL:  { label: "Neutral",  bg: "bg-slate-100", text: "text-slate-600" },
};

export default function SentimentBadge({ label }: { label: string | null }) {
  if (!label) return <span className="text-xs text-slate-400">Analyzing...</span>;
  const c = CONFIG[label as keyof typeof CONFIG] ?? CONFIG.NEUTRAL;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
