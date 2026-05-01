// app/dashboard/pricing/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Zap, Star, Crown, Loader2 } from "lucide-react";
import { PRICING } from "@/lib/razorpay";
import { Plan, BillingCycle } from "@prisma/client";
import { getPlanColor } from "@/lib/utils";

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_DATA = {
  FREE: {
    icon: Zap,
    color: "text-slate-500",
    bg: "bg-slate-50 dark:bg-slate-900/20",
    border: "border-border",
    features: ["10 queries/day", "Basic answers", "Hindi + English", "Ad-supported"],
    cycles: [],
  },
  LITE: {
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    border: "border-amber-200 dark:border-amber-800",
    features: ["50 queries/day", "Sanskrit shlokas + refs", "All 6 languages", "Reduced ads", "Chat history"],
    cycles: [
      { cycle: "MONTHLY" as BillingCycle, label: "₹49", sublabel: "/month" },
      { cycle: "QUARTERLY" as BillingCycle, label: "₹249", sublabel: "/3 months", badge: "Save ₹98" },
      { cycle: "YEARLY" as BillingCycle, label: "₹399", sublabel: "/year", badge: "Save ₹189" },
    ],
  },
  PRO: {
    icon: Crown,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    border: "border-emerald-200 dark:border-emerald-800",
    features: ["Unlimited queries", "Full Samhita refs", "Modern medicine correlation", "No ads", "GPT-4 / Gemini Pro", "Export history"],
    cycles: [
      { cycle: "MONTHLY" as BillingCycle, label: "₹99", sublabel: "/month" },
      { cycle: "HALFYEARLY" as BillingCycle, label: "₹499", sublabel: "/6 months", badge: "Save ₹95" },
      { cycle: "YEARLY" as BillingCycle, label: "₹999", sublabel: "/year", badge: "Best Value" },
    ],
  },
};

export default function PricingPage() {
  const { data: session } = useSession();
  const currentPlan = (session?.user as any)?.plan as Plan || "FREE";
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleUpgrade = async (plan: "LITE" | "PRO", cycle: BillingCycle) => {
    const key = `${plan}_${cycle}`;
    setLoadingKey(key);
    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Load Razorpay
      if (!window.Razorpay) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "AyurAi",
        description: `${plan} Plan — ${cycle}`,
        image: "/icons/logo.png",
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#7c3c1e" },
        handler: async (response: any) => {
          await fetch("/api/subscription/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          window.location.reload();
        },
      });
      rzp.open();
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-serif text-4xl font-light text-foreground mb-3">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground">
              Current plan:{" "}
              <span className={`font-semibold px-2 py-0.5 rounded text-sm ${getPlanColor(currentPlan)}`}>
                {currentPlan}
              </span>
            </p>
          </motion.div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {(["FREE", "LITE", "PRO"] as Plan[]).map((plan, i) => {
            const data = PLAN_DATA[plan];
            const Icon = data.icon;
            const isCurrent = currentPlan === plan;

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border-2 p-6 ${data.bg} ${
                  plan === "PRO" ? "border-emerald-400 shadow-lg" : data.border
                }`}
              >
                {plan === "PRO" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                    Current
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-9 h-9 rounded-xl ${data.bg} border ${data.border} flex items-center justify-center`}>
                    <Icon size={18} className={data.color} />
                  </div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">{plan}</h2>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {data.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={14} className={`${data.color} mt-0.5 flex-shrink-0`} />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Cycles */}
                {plan === "FREE" ? (
                  <div className="text-center py-3 text-2xl font-bold text-foreground">Free</div>
                ) : (
                  <div className="space-y-2">
                    {data.cycles.map(({ cycle, label, sublabel, badge }) => {
                      const key = `${plan}_${cycle}`;
                      const isLoading = loadingKey === key;
                      return (
                        <button
                          key={cycle}
                          onClick={() => handleUpgrade(plan as "LITE" | "PRO", cycle)}
                          disabled={isCurrent || !!loadingKey}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm ${
                            isCurrent
                              ? "border-border opacity-50 cursor-not-allowed bg-muted"
                              : "border-border hover:border-primary/50 hover:shadow-sm bg-card cursor-pointer hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isLoading ? (
                              <Loader2 size={14} className="animate-spin text-primary" />
                            ) : null}
                            <span className="font-bold text-foreground">{label}</span>
                            <span className="text-muted-foreground">{sublabel}</span>
                          </div>
                          {badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              plan === "LITE" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-10">
          Payments processed securely by Razorpay. Cancel anytime. No auto-renewal.
          <br />
          GST may apply. Prices in INR.
        </p>
      </div>
    </div>
  );
}
