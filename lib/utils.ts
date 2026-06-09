import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day:   "numeric",
    month: "short",
  });
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function truncate(s: string, n = 80) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
