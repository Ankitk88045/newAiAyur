// app/api/subscription/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/razorpay";
import { Plan, BillingCycle } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["LITE", "PRO"]),
  cycle: z.enum(["MONTHLY", "QUARTERLY", "HALFYEARLY", "YEARLY"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, cycle } = schema.parse(body);

    const order = await createOrder(
      plan as Plan,
      cycle as BillingCycle,
      session.user.id
    );

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
