import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export default async function RootPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role === "ADMIN") redirect("/admin");
  redirect("/citizen");
}
