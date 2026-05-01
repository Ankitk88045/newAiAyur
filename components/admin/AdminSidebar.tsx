// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, Key,
  ScrollText, Megaphone, ArrowLeft, Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/ai-keys", icon: Key, label: "AI Keys" },
  { href: "/admin/query-logs", icon: ScrollText, label: "Query Logs" },
  { href: "/admin/adsense", icon: Megaphone, label: "AdSense" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Leaf size={18} className="text-primary" />
          <span className="font-serif text-lg font-semibold text-foreground">AyurAi</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          href="/dashboard/chat"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft size={14} />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
