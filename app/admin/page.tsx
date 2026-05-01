// app/admin/page.tsx
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import {
  Users, CreditCard, MessageSquare,
  IndianRupee, Cpu, TrendingUp
} from "lucide-react";
import { AdminCharts } from "@/components/admin/AdminCharts";

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersMonth,
    activeSubscriptions,
    totalQueries,
    monthlyQueries,
    aiCostData,
    planDistribution,
    dailyQueries,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.subscription.count({ where: { status: "ACTIVE", plan: { not: "FREE" } } }),
    prisma.queryLog.count(),
    prisma.queryLog.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.queryLog.aggregate({
      where: { createdAt: { gte: monthStart } },
      _sum: { costUsd: true },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
    // Last 7 days query counts
    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "QueryLog"
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
  ]);

  const aiCostINR = ((aiCostData._sum.costUsd || 0) * 83).toFixed(0);
  const planMap = planDistribution.reduce((acc, p) => {
    acc[p.plan] = p._count.plan;
    return acc;
  }, {} as Record<string, number>);

  const dailyData = dailyQueries.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    queries: Number(d.count),
  }));

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          subtitle={`+${newUsersMonth} this month`}
          icon={Users}
          color="text-blue-600"
          delay={0}
        />
        <StatCard
          title="Paid Subscribers"
          value={activeSubscriptions}
          subtitle="Active plans"
          icon={CreditCard}
          color="text-emerald-600"
          delay={0.05}
        />
        <StatCard
          title="Total Queries"
          value={totalQueries.toLocaleString()}
          subtitle={`${monthlyQueries} this month`}
          icon={MessageSquare}
          color="text-violet-600"
          delay={0.1}
        />
        <StatCard
          title="AI Cost (Month)"
          value={`₹${aiCostINR}`}
          subtitle="Estimated in INR"
          icon={Cpu}
          color="text-orange-600"
          delay={0.15}
        />
        <StatCard
          title="FREE Users"
          value={planMap["FREE"] || 0}
          icon={Users}
          color="text-slate-500"
          delay={0.2}
        />
        <StatCard
          title="PRO Users"
          value={planMap["PRO"] || 0}
          subtitle={`LITE: ${planMap["LITE"] || 0}`}
          icon={TrendingUp}
          color="text-primary"
          delay={0.25}
        />
      </div>

      {/* Charts */}
      <AdminCharts dailyData={dailyData} planMap={planMap} />
    </div>
  );
}
