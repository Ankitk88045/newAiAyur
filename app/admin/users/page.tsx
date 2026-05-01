// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Shield, User } from "lucide-react";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { getPlanColor, formatDate } from "@/lib/utils";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string; expiresAt: string | null } | null;
  _count: { queries: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const updateUser = async (userId: string, updates: { role?: string; plan?: string }) => {
    setUpdating(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...updates }),
    });
    await fetchUsers();
    setUpdating(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total users</p>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-xl outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Queries</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded shimmer" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={user.image} name={user.name} size="sm" />
                        <div>
                          <p className="font-medium text-foreground">{user.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.subscription?.plan || "FREE"}
                        onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                        disabled={updating === user.id}
                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${getPlanColor(user.subscription?.plan || "FREE")}`}
                      >
                        <option value="FREE">FREE</option>
                        <option value="LITE">LITE</option>
                        <option value="PRO">PRO</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          updateUser(user.id, { role: user.role === "ADMIN" ? "USER" : "ADMIN" })
                        }
                        disabled={updating === user.id}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                          user.role === "ADMIN"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {user.role === "ADMIN" ? <Shield size={11} /> : <User size={11} />}
                        {user.role}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground">{user._count.queries}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {updating === user.id && (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
