// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeSubscriptions,
      totalQueries,
      monthlyQueries,
      revenueData,
      aiCostData,
      topQueriesRaw,
      planDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE", plan: { not: "FREE" } } }),
      prisma.queryLog.count(),
      prisma.queryLog.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.subscription.findMany({
        where: { createdAt: { gte: monthStart }, status: "ACTIVE" },
        select: { plan: true, billingCycle: true },
      }),
      prisma.queryLog.aggregate({
        where: { createdAt: { gte: monthStart } },
        _sum: { costUsd: true },
      }),
      prisma.queryLog.groupBy({
        by: ["query"],
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 5,
      }),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
    ]);

    // Calculate revenue (rough estimate)
    const planPrices: Record<string, number> = {
      LITE_MONTHLY: 49, LITE_QUARTERLY: 83, LITE_YEARLY: 33,
      PRO_MONTHLY: 99, PRO_HALFYEARLY: 83, PRO_YEARLY: 83,
    };

    const revenueMonth = revenueData.reduce((sum, sub) => {
      const key = `${sub.plan}_${sub.billingCycle || "MONTHLY"}`;
      return sum + (planPrices[key] || 0);
    }, 0);

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalQueries,
      monthlyQueries,
      revenueMonth,
      aiCostMonth: (aiCostData._sum.costUsd || 0) * 83, // USD to INR
      topQueries: topQueriesRaw.map((q) => ({
        query: q.query.slice(0, 80),
        count: q._count.query,
      })),
      planDistribution: planDistribution.reduce((acc, p) => {
        acc[p.plan] = p._count.plan;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
