// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, History, CreditCard, Settings,
  LogOut, Shield, Plus, ChevronRight, Leaf
} from "lucide-react";
import { cn, getPlanColor } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserAvatar } from "./UserAvatar";
import { useChatStore } from "@/hooks/useChatStore";

const navItems = [
  { href: "/dashboard/chat", icon: MessageSquare, label: "Vaidya Chat" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/pricing", icon: CreditCard, label: "Upgrade" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan || "FREE";
  const { createNewChat } = useChatStore();

  return (
    <aside
      className="w-64 flex-shrink-0 h-screen flex flex-col sticky top-0"
      style={{ background: "hsl(var(--sidebar-bg))" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-white/5">
        <Link href="/dashboard/chat" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-accent" />
          </div>
          <span
            className="font-serif text-lg font-semibold"
            style={{ color: "hsl(var(--sidebar-fg))" }}
          >
            AyurAi
          </span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-4">
        <button
          onClick={createNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border border-white/10 hover:border-white/20 transition-all text-white/70 hover:text-white"
        >
          <Plus size={15} />
          New Chat
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scroll">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-nav-item", isActive && "active")}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          );
        })}

        {(session?.user as any)?.role === "ADMIN" && (
          <Link
            href="/admin"
            className={cn("sidebar-nav-item mt-4", pathname.startsWith("/admin") && "active")}
          >
            <Shield size={16} />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Language Switcher */}
      <div className="px-4 py-3 border-t border-white/5">
        <LanguageSwitcher />
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <UserAvatar
            src={session?.user?.image}
            name={session?.user?.name}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "hsl(var(--sidebar-fg))" }}>
              {session?.user?.name || "User"}
            </p>
            <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", getPlanColor(plan))}>
              {plan}
            </span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
