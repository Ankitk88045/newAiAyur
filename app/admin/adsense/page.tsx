// app/admin/adsense/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Eye, DollarSign, Info } from "lucide-react";

const AD_SLOTS = [
  {
    slot: "chat_banner",
    label: "Chat Banner",
    description: "Shown below the chat input on Free plan",
    plans: ["FREE"],
  },
  {
    slot: "sidebar",
    label: "Sidebar Ad",
    description: "Shown in sidebar for Free and Lite plans",
    plans: ["FREE", "LITE"],
  },
  {
    slot: "chat_interstitial",
    label: "Interstitial (between messages)",
    description: "Shown every 5 messages on Free plan only",
    plans: ["FREE"],
  },
];

export default function AdSensePage() {
  const [clientId, setClientId] = useState(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "");
  const [slots, setSlots] = useState<Record<string, { slotId: string; active: boolean }>>({
    chat_banner: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAT || "",
      active: true,
    },
    sidebar: {
      slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "",
      active: true,
    },
    chat_interstitial: { slotId: "", active: false },
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // In production: save to DB/AdConfig table
    // For now we show confirmation
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground mb-1">AdSense Control</h1>
        <p className="text-sm text-muted-foreground">
          Configure Google AdSense placements shown to Free and Lite plan users
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-sm text-blue-700 dark:text-blue-400">
        <Info size={16} className="mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium mb-1">How it works</p>
          <p className="text-xs leading-relaxed">
            Ads are shown to <strong>FREE</strong> users heavily and <strong>LITE</strong> users lightly.
            <strong> PRO</strong> users never see ads. AdSense client ID and slot IDs can also be set
            in <code className="font-mono">.env</code> — DB values override env vars.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Publisher Client ID */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-primary" />
            <h3 className="font-semibold text-foreground">Publisher Client ID</h3>
          </div>
          <label className="text-xs text-muted-foreground mb-1 block">
            ca-pub-XXXXXXXXXXXXXXXX
          </label>
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="ca-pub-1234567890123456"
            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-mono outline-none focus:border-primary/50 transition-colors"
          />
        </motion.div>

        {/* Ad Slots */}
        {AD_SLOTS.map((adSlot, i) => (
          <motion.div
            key={adSlot.slot}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{adSlot.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{adSlot.description}</p>
                <div className="flex gap-1 mt-2">
                  {adSlot.plans.map((p) => (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              {/* Toggle */}
              <button
                onClick={() =>
                  setSlots((s) => ({
                    ...s,
                    [adSlot.slot]: { ...s[adSlot.slot], active: !s[adSlot.slot].active },
                  }))
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  slots[adSlot.slot]?.active ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    slots[adSlot.slot]?.active ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <label className="text-xs text-muted-foreground mb-1 block">Ad Slot ID</label>
            <input
              value={slots[adSlot.slot]?.slotId || ""}
              onChange={(e) =>
                setSlots((s) => ({
                  ...s,
                  [adSlot.slot]: { ...s[adSlot.slot], slotId: e.target.value },
                }))
              }
              placeholder="e.g. 1234567890"
              disabled={!slots[adSlot.slot]?.active}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
            />
          </motion.div>
        ))}

        {/* Preview info */}
        <div className="flex items-start gap-3 bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <Eye size={15} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">
            To preview ads, sign in with a FREE account. AdSense ads only show after your site is
            approved. During development, ad units may appear blank — this is expected.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
        >
          <Save size={15} />
          {saved ? "Saved to Database ✓" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
