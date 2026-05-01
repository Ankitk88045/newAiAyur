// app/api/subscription/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignature, getCycleDuration } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { Plan, BillingCycle } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body;

    // Verify signature
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Get order notes (userId, plan, cycle)
    const Razorpay = require("razorpay");
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.fetch(razorpay_order_id);
    const { userId, plan, cycle } = order.notes as {
      userId: string;
      plan: Plan;
      cycle: BillingCycle;
    };

    const durationDays = getCycleDuration(cycle);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Update or create subscription
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        status: "ACTIVE",
        billingCycle: cycle,
        razorpayOrderId: razorpay_order_id,
        razorpayPayId: razorpay_payment_id,
        startsAt: new Date(),
        expiresAt,
      },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        billingCycle: cycle,
        razorpayOrderId: razorpay_order_id,
        razorpayPayId: razorpay_payment_id,
        expiresAt,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
