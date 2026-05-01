// app/api/admin/query-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [logs, total] = await Promise.all([
      prisma.queryLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.queryLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
