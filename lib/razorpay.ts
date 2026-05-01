// lib/razorpay.ts
import Razorpay from "razorpay";
import { Plan, BillingCycle } from "@prisma/client";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export interface PricingOption {
  plan: Plan;
  cycle: BillingCycle;
  amount: number; // in paise (₹ * 100)
  label: string;
  savings?: string;
}

export const PRICING: PricingOption[] = [
  // LITE
  { plan: "LITE", cycle: "MONTHLY", amount: 4900, label: "₹49/month" },
  {
    plan: "LITE",
    cycle: "QUARTERLY",
    amount: 24900,
    label: "₹249/3 months",
    savings: "Save ₹98",
  },
  {
    plan: "LITE",
    cycle: "YEARLY",
    amount: 39900,
    label: "₹399/year",
    savings: "Save ₹189",
  },
  // PRO
  { plan: "PRO", cycle: "MONTHLY", amount: 9900, label: "₹99/month" },
  {
    plan: "PRO",
    cycle: "HALFYEARLY",
    amount: 49900,
    label: "₹499/6 months",
    savings: "Save ₹95",
  },
  {
    plan: "PRO",
    cycle: "YEARLY",
    amount: 99900,
    label: "₹999/year",
    savings: "Save ₹189",
  },
];

export function getCycleDuration(cycle: BillingCycle): number {
  const days: Record<BillingCycle, number> = {
    MONTHLY: 30,
    QUARTERLY: 90,
    HALFYEARLY: 180,
    YEARLY: 365,
  };
  return days[cycle];
}

export function getPricing(plan: Plan, cycle: BillingCycle) {
  return PRICING.find((p) => p.plan === plan && p.cycle === cycle);
}

export async function createOrder(
  plan: Plan,
  cycle: BillingCycle,
  userId: string
) {
  const pricing = getPricing(plan, cycle);
  if (!pricing) throw new Error("Invalid plan/cycle");

  const order = await razorpay.orders.create({
    amount: pricing.amount,
    currency: "INR",
    receipt: `ayurai_${userId}_${Date.now()}`,
    notes: { userId, plan, cycle },
  });

  return order;
}

export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require("crypto");
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
}
