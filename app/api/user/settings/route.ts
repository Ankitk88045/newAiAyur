// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { language } = await req.json();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { language },
  });
  return NextResponse.json({ success: true });
}
