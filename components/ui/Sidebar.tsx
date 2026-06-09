"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

const citizenNav = [
  { href: "/citizen",            label: "Dashboard",       icon: "⊞" },
  { href: "/citizen/new",        label: "New Complaint",   icon: "+" },
  { href: "/citizen/complaints", label: "My Complaints",   icon: "≡" },
];

const adminNav = [
  { href: "/admin",            label: "Overview",      icon: "⊞" },
  { href: "/admin/complaints", label: "All Complaints", icon: "≡" },
  { href: "/admin/analytics",  label: "Analytics",     icon: "◈" },
];

export default function Sidebar({ role }: { role: "citizen" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "citizen" ? citizenNav : adminNav;
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-slate-200 flex flex-col py-6 flex-shrink-0">
      <div className="px-5 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-slate-800 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="font-semibold text-sm text-slate-900 tracking-tight">CAES</span>
        </div>
        <p className="text-xs text-slate-400">Civic Engagement System</p>
      </div>

      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold px-2 mb-2">
          {role}
        </p>
        {nav.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}>
              <span className="w-4 text-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 pt-4 border-t border-slate-200">
        <button onClick={handleSignOut} className="w-full text-xs text-slate-400 hover:text-slate-600 text-left transition-colors">
          Sign out
        </button>
      </div>
    </aside>
  );
}
