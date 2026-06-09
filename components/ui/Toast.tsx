"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?:   "success" | "error" | "info";
  onDone?: () => void;
}

export default function Toast({ message, type = "info", onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg = { success: "bg-green-50 border-green-200 text-green-800",
               error:   "bg-red-50   border-red-200   text-red-800",
               info:    "bg-slate-50 border-slate-200 text-slate-700" }[type];

  return (
    <div
      className={`fixed top-5 right-5 z-50 px-4 py-3 border rounded-lg text-xs font-medium shadow-sm transition-all duration-300 ${bg} ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
    >
      {message}
    </div>
  );
}

// Hook for easy usage
import { useState as useStateHook, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const show = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  }, []);

  const clear = useCallback(() => setToast(null), []);

  const ToastComponent = toast
    ? <Toast message={toast.message} type={toast.type} onDone={clear} />
    : null;

  return { show, ToastComponent };
}
