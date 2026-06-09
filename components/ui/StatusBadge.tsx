const CONFIG = {
  PENDING:     { label: "Pending",     dot: "bg-amber-400",  text: "text-amber-800",  bg: "bg-amber-50"  },
  IN_PROGRESS: { label: "In Progress", dot: "bg-blue-500",   text: "text-blue-800",   bg: "bg-blue-50"   },
  RESOLVED:    { label: "Resolved",    dot: "bg-green-500",  text: "text-green-800",  bg: "bg-green-50"  },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = CONFIG[status as keyof typeof CONFIG] ?? CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
