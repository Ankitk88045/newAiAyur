// app/dashboard/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config";
import { getPlanColor } from "@/lib/utils";
import { Save, Check } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [language, setLanguage] = useState(
    (session?.user as any)?.language || "en"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    await update({ language });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const plan = (session?.user as any)?.plan || "FREE";

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your account preferences</p>
        </motion.div>

        {/* Profile */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Profile</h2>
          <div className="flex items-center gap-4">
            <UserAvatar
              src={session?.user?.image}
              name={session?.user?.name}
              size="lg"
            />
            <div>
              <p className="font-semibold text-foreground">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block ${getPlanColor(plan)}`}>
                {plan} Plan
              </span>
            </div>
          </div>
        </section>

        {/* Language */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
            Language Preference
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vaidya will respond in your selected language.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => setLanguage(loc)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  language === loc
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border text-foreground hover:border-primary/40 hover:bg-muted"
                }`}
              >
                <span>{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Subscription info */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
            Subscription
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{plan} Plan</p>
              <p className="text-sm text-muted-foreground">
                {plan === "FREE"
                  ? "10 queries/day · Ad-supported"
                  : plan === "LITE"
                  ? "50 queries/day · Reduced ads"
                  : "Unlimited queries · No ads"}
              </p>
            </div>
            {plan !== "PRO" && (
              <a
                href="/dashboard/pricing"
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upgrade
              </a>
            )}
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
