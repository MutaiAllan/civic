import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import CitizenDashboard from "@/components/citizen/CitizenDashboard";

export default async function CitizenPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const complaints = await prisma.complaint.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  });

  return <CitizenDashboard initialComplaints={complaints} userEmail={user!.email!} />;
}
