import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase";
import { assignDepartment } from "@/lib/department-map";

// GET /api/complaints  — list complaints (scoped by role)
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status    = searchParams.get("status") ?? undefined;
  const category  = searchParams.get("category") ?? undefined;
  const search    = searchParams.get("search") ?? undefined;

  const where = {
    ...(dbUser.role === "CITIZEN" ? { userId: user.id } : {}),
    ...(status   ? { status:   status   as any } : {}),
    ...(category ? { category              } : {}),
    ...(search   ? { rawText: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, role: true } } },
  });

  return NextResponse.json(complaints);
}

// POST /api/complaints  — create a new complaint
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { rawText, category } = body;
  if (!rawText || typeof rawText !== "string" || rawText.trim().length < 10) {
    return NextResponse.json({ error: "rawText must be at least 10 characters" }, { status: 400 });
  }

  // Ensure user row exists (created on first sign-in via callback)
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email!, role: "CITIZEN" },
    update: {},
  });

  const department = assignDepartment(category ?? "Other");

  const complaint = await prisma.complaint.create({
    data: {
      userId: user.id,
      rawText: rawText.trim(),
      category: category ?? "Other",
      department,
      status: "PENDING",
    },
  });

  return NextResponse.json(complaint, { status: 201 });
}
