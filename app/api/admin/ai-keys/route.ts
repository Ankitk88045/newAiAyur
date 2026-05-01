// app/api/admin/ai-keys/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AIProvider } from "@prisma/client";

export async function GET() {
  try {
    await requireAdmin();
    const keys = await prisma.aIKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, provider: true, keyName: true, isActive: true,
        usageCount: true, createdAt: true,
        keyValue: false, // never expose
      },
    });
    // Mask key values
    const masked = await prisma.aIKey.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      masked.map((k) => ({
        ...k,
        keyValue: k.keyValue.slice(0, 8) + "••••••••",
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { provider, keyName, keyValue } = await req.json();

    const key = await prisma.aIKey.upsert({
      where: { provider_keyName: { provider, keyName } },
      update: { keyValue, isActive: true },
      create: { provider, keyName, keyValue },
    });

    return NextResponse.json({ success: true, id: key.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, isActive } = await req.json();
    await prisma.aIKey.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { id } = await req.json();
    await prisma.aIKey.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
