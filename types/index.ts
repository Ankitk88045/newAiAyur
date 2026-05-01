// types/index.ts
import { Plan, Role, AIProvider, QueryComplexity } from "@prisma/client";

export type { Plan, Role, AIProvider, QueryComplexity };

export interface UserSession {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  plan: Plan;
  language: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: AyurvedaMetadata;
  createdAt: Date;
}

export interface AyurvedaMetadata {
  shloka?: {
    devanagari: string;
    iast: string;
    translation: string;
    reference: string; // "Charaka Samhita, Sutra Sthana 1.15"
    samhita: string;
  };
  modernCorrelation?: string;
  disclaimer?: string;
  language?: string;
}

export interface SubscriptionPlan {
  name: Plan;
  price: {
    monthly: number;
    quarterly?: number;
    halfyearly?: number;
    yearly: number;
  };
  features: string[];
  queryLimit: number;
  hasAds: boolean;
  adFrequency?: "heavy" | "light" | "none";
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalQueries: number;
  revenueMonth: number;
  aiCostMonth: number;
  topQueries: { query: string; count: number }[];
}

export interface AIRouterDecision {
  provider: AIProvider;
  model: string;
  complexity: QueryComplexity;
  estimatedCost: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: parseInt(process.env.FREE_DAILY_LIMIT || "10"),
  LITE: parseInt(process.env.LITE_DAILY_LIMIT || "50"),
  PRO: parseInt(process.env.PRO_DAILY_LIMIT || "999"),
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: "FREE",
    price: { monthly: 0, yearly: 0 },
    features: [
      "10 queries/day",
      "Basic Ayurveda answers",
      "Hindi & English support",
      "Ad-supported",
    ],
    queryLimit: 10,
    hasAds: true,
    adFrequency: "heavy",
  },
  {
    name: "LITE",
    price: { monthly: 49, quarterly: 249, yearly: 399 },
    features: [
      "50 queries/day",
      "Sanskrit Shlokas + References",
      "All 6 languages",
      "Reduced ads",
      "Chat history",
    ],
    queryLimit: 50,
    hasAds: true,
    adFrequency: "light",
  },
  {
    name: "PRO",
    price: { monthly: 99, halfyearly: 499, yearly: 999 },
    features: [
      "Unlimited queries",
      "Full Samhita references",
      "Modern medicine correlation",
      "No ads",
      "Priority AI (GPT-4 / Gemini Pro)",
      "Export chat history",
    ],
    queryLimit: 999,
    hasAds: false,
    adFrequency: "none",
  },
];
