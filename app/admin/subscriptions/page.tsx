// app/admin/subscriptions/page.tsx
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate, getPlanColor } from "@/lib/utils";

export const metadata = { title: "Subscriptions | Admin" };

export default async function SubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await prisma.subscription.findMany({
    where: { plan: { not: "FREE" } },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    lite: subscriptions.filter((s) => s.plan === "LITE").length,
    pro: subscriptions.filter((s) => s.plan === "PRO").length,
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground mb-1">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Paid plan subscribers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Paid", value: stats.total, color: "text-primary" },
          { label: "Active", value: stats.active, color: "text-emerald-600" },
          { label: "LITE", value: stats.lite, color: "text-amber-600" },
          { label: "PRO", value: stats.pro, color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-bold font-serif ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cycle</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Started</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No paid subscriptions yet
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{sub.user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPlanColor(sub.plan)}`}>
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{sub.billingCycle || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : sub.status === "EXPIRED"
                        ? "bg-red-100 text-red-600"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(sub.startsAt)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {sub.expiresAt ? formatDate(sub.expiresAt) : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                    {sub.razorpayOrderId || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
