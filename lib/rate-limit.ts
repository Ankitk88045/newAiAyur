// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Plan } from "@prisma/client";
import prisma from "@/lib/prisma";

let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

function getRatelimit() {
  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 req/min burst protection
      analytics: true,
    });
  }
  return ratelimit;
}

// Burst protection (per minute)
export async function checkBurstLimit(userId: string) {
  try {
    const { success, remaining, reset } = await getRatelimit().limit(
      `burst:${userId}`
    );
    return { allowed: success, remaining, reset };
  } catch {
    return { allowed: true, remaining: 60, reset: Date.now() + 60000 };
  }
}

// Daily quota check (in DB)
export async function checkDailyLimit(userId: string, plan: Plan) {
  const limits: Record<Plan, number> = {
    FREE: parseInt(process.env.FREE_DAILY_LIMIT || "10"),
    LITE: parseInt(process.env.LITE_DAILY_LIMIT || "50"),
    PRO: 9999,
  };

  const limit = limits[plan];
  const today = new Date().toISOString().split("T")[0];

  const usage = await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},
    create: { userId, date: today, count: 0 },
  });

  return {
    allowed: usage.count < limit,
    remaining: Math.max(0, limit - usage.count),
    limit,
    used: usage.count,
  };
}

// Increment daily usage
export async function incrementDailyUsage(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  await prisma.dailyUsage.upsert({
    where: { userId_date: { userId, date: today } },
    update: { count: { increment: 1 } },
    create: { userId, date: today, count: 1 },
  });
}

// Cache helper
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    return await getRedis().get<T>(key);
  } catch {
    return null;
  }
}

export async function setCached(
  key: string,
  value: unknown,
  ttlSeconds = 300
) {
  try {
    await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
  } catch {}
}
