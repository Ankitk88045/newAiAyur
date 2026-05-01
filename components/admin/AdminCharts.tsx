// components/admin/AdminCharts.tsx
"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { motion } from "framer-motion";

interface AdminChartsProps {
  dailyData: { date: string; queries: number }[];
  planMap: Record<string, number>;
}

const PIE_COLORS = ["#94a3b8", "#d97706", "#10b981"];

export function AdminCharts({ dailyData, planMap }: AdminChartsProps) {
  const pieData = [
    { name: "FREE", value: planMap["FREE"] || 0 },
    { name: "LITE", value: planMap["LITE"] || 0 },
    { name: "PRO", value: planMap["PRO"] || 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Daily queries line chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-serif text-base font-semibold text-foreground mb-4">
          Queries — Last 7 Days
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(28,65%,32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(28,65%,32%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(35,25%,88%)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(38,40%,95%)",
                border: "1px solid hsl(35,25%,82%)",
                borderRadius: "12px",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="queries"
              stroke="hsl(28,65%,32%)"
              strokeWidth={2}
              fill="url(#queriesGrad)"
              name="Queries"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Plan distribution pie */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h3 className="font-serif text-base font-semibold text-foreground mb-4">
          Plan Distribution
        </h3>
        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(38,40%,95%)",
                    border: "1px solid hsl(35,25%,82%)",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            No data yet
          </div>
        )}
      </motion.div>
    </div>
  );
}
