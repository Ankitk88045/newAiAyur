// app/admin/ai-keys/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Key } from "lucide-react";

const PROVIDERS = ["GEMINI", "OPENAI", "DEEPSEEK", "ANTHROPIC"] as const;

interface AIKey {
  id: string;
  provider: string;
  keyName: string;
  keyValue: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export default function AIKeysPage() {
  const [keys, setKeys] = useState<AIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: "GEMINI", keyName: "", keyValue: "" });
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const fetchKeys = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ai-keys");
    setKeys(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleAdd = async () => {
    if (!form.keyName || !form.keyValue) return;
    setSaving(true);
    await fetch("/api/admin/ai-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await fetchKeys();
    setForm({ provider: "GEMINI", keyName: "", keyValue: "" });
    setShowForm(false);
    setSaving(false);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/ai-keys", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    await fetchKeys();
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Delete this API key?")) return;
    await fetch("/api/admin/ai-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchKeys();
  };

  const providerColors: Record<string, string> = {
    GEMINI: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    OPENAI: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    DEEPSEEK: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    ANTHROPIC: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">AI Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage API keys for AI providers. Keys with lowest usage are preferred.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          Add Key
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <h3 className="font-semibold text-foreground mb-4">Add New API Key</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Key Name</label>
              <input
                value={form.keyName}
                onChange={(e) => setForm({ ...form, keyName: e.target.value })}
                placeholder="e.g. primary, backup-1"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">API Key Value</label>
              <input
                type="password"
                value={form.keyValue}
                onChange={(e) => setForm({ ...form, keyValue: e.target.value })}
                placeholder="sk-... or AIza..."
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !form.keyName || !form.keyValue}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Save Key
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Keys List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key size={32} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No API keys added yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Add keys to enable AI features. Falls back to environment variables if empty.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Provider</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Key</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${providerColors[key.provider] || "bg-muted text-foreground"}`}>
                      {key.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{key.keyName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{showValues[key.id] ? key.keyValue : key.keyValue.slice(0, 12) + "••••"}</span>
                      <button
                        onClick={() => setShowValues((s) => ({ ...s, [key.id]: !s[key.id] }))}
                        className="text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        {showValues[key.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{key.usageCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(key.id, key.isActive)}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                        key.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {key.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {key.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        💡 Keys with lowest usage are automatically selected. Add multiple keys per provider for load balancing.
        Keys stored encrypted in database. Falls back to <code className="font-mono">.env</code> variables if no DB keys exist.
      </p>
    </div>
  );
}
