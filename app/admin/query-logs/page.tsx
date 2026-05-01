// app/admin/query-logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface QueryLog {
  id: string;
  query: string;
  response: string;
  language: string;
  complexity: string;
  provider: string | null;
  model: string | null;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  createdAt: string;
  user: { name: string | null; email: string };
}

const COMPLEXITY_COLORS: Record<string, string> = {
  SIMPLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  MODERATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLEX: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function QueryLogsPage() {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const limit = 50;

  const fetchLogs = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/query-logs?page=${page}&limit=${limit}`);
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground mb-1">Query Logs</h1>
        <p className="text-sm text-muted-foreground">{total.toLocaleString()} total queries logged</p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[30%]">Query</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Complexity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Model</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tokens</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cost</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Latency</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3.5 rounded shimmer w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.map((log) => (
                    <>
                      <tr
                        key={log.id}
                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-foreground line-clamp-1 max-w-xs">{log.query}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground text-xs">{log.user.name || log.user.email.split("@")[0]}</p>
                          <p className="text-muted-foreground text-xs">{log.language.toUpperCase()}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COMPLEXITY_COLORS[log.complexity] || "bg-muted text-muted-foreground"}`}>
                            {log.complexity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {log.model ? log.model.split("-").slice(0, 2).join("-") : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {(log.tokensIn + log.tokensOut).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          ${log.costUsd.toFixed(5)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {log.latencyMs > 0 ? `${(log.latencyMs / 1000).toFixed(1)}s` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expanded === log.id && (
                        <tr key={`${log.id}-expanded`} className="bg-muted/20 border-b border-border">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="font-semibold text-foreground mb-1">Query</p>
                                <p className="text-muted-foreground leading-relaxed bg-background rounded-lg p-3 border border-border">
                                  {log.query}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold text-foreground mb-1">Response (truncated)</p>
                                <p className="text-muted-foreground leading-relaxed bg-background rounded-lg p-3 border border-border line-clamp-5">
                                  {log.response}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                              <span>Provider: <strong className="text-foreground">{log.provider || "—"}</strong></span>
                              <span>Model: <strong className="text-foreground font-mono">{log.model || "—"}</strong></span>
                              <span>In: <strong className="text-foreground">{log.tokensIn}</strong></span>
                              <span>Out: <strong className="text-foreground">{log.tokensOut}</strong></span>
                              <span>Cost: <strong className="text-foreground">${log.costUsd.toFixed(6)}</strong></span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total.toLocaleString()} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground px-2">{page}</span>
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
      <p className="text-xs text-muted-foreground mt-3">
        💡 Click any row to expand the full query and response. Data used to improve RAG knowledge base.
      </p>
    </div>
  );
}
