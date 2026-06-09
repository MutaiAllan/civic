import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [total, byStatus, bySentiment, byCategory] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.complaint.groupBy({ by: ["sentimentLabel"], _count: { id: true } }),
    prisma.complaint.groupBy({ by: ["category"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
  ]);

  return NextResponse.json({ total, byStatus, bySentiment, byCategory });
}
