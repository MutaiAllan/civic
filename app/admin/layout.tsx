import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/ui/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") redirect("/citizen");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
