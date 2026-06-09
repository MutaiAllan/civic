import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import Sidebar from "@/components/ui/Sidebar";
import Chatbot from "@/components/citizen/Chatbot";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="citizen" />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <Chatbot />
    </div>
  );
}

