import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/citizen";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (session?.user) {
      await prisma.user.upsert({
        where: { id: session.user.id },
        create: { id: session.user.id, email: session.user.email!, role: "CITIZEN" },
        update: {},
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
