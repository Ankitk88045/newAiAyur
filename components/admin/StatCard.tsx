// components/admin/StatCard.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, color = "text-primary", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground font-serif">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
}
