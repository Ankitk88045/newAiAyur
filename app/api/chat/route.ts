// app/api/chat/route.ts
import { streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkBurstLimit,
  checkDailyLimit,
  incrementDailyUsage,
} from "@/lib/rate-limit";
import { detectComplexity, getAIModel, buildSystemPrompt } from "@/lib/ai-router";
import { searchKnowledge, logQuery, storeKnowledge } from "@/lib/rag";
import { Plan } from "@prisma/client";
import prisma from "@/lib/prisma";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // ── Auth Check ──────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const plan = (session.user as any).plan as Plan;
    const language = (session.user as any).language || "en";

    // ── Burst Rate Limit ────────────────────────────────────
    const burst = await checkBurstLimit(userId);
    if (!burst.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    // ── Daily Limit Check ───────────────────────────────────
    const daily = await checkDailyLimit(userId, plan);
    if (!daily.allowed) {
      return NextResponse.json(
        {
          error: "Daily query limit reached. Upgrade your plan.",
          remaining: 0,
          limit: daily.limit,
        },
        { status: 429 }
      );
    }

    // ── Parse Request ───────────────────────────────────────
    const body = await req.json();
    const { messages, chatId } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content as string;

    // ── Complexity Detection & Model Selection ──────────────
    const complexity = detectComplexity(userQuery);
    const { model, config } = await getAIModel(complexity, plan);

    // ── RAG Context ─────────────────────────────────────────
    const ragContext = await searchKnowledge(userQuery);
    const systemPrompt = buildSystemPrompt(language, plan) + ragContext;

    // ── Stream Response ─────────────────────────────────────
    let fullResponse = "";
    let tokensIn = 0;
    let tokensOut = 0;

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: messages.slice(-10), // last 10 messages for context
      maxTokens: 1500,
      temperature: 0.4,
      onFinish: async ({ text, usage }) => {
        fullResponse = text;
        tokensIn = usage?.promptTokens || 0;
        tokensOut = usage?.completionTokens || 0;

        const latencyMs = Date.now() - startTime;
        const costUsd =
          ((tokensIn + tokensOut) / 1000) * config.costPer1kTokens;

        // Increment daily usage
        await incrementDailyUsage(userId);

        // Log to DB
        const queryLog = await logQuery({
          userId,
          query: userQuery,
          response: fullResponse,
          language,
          complexity,
          provider: config.provider,
          model: config.modelId,
          tokensIn,
          tokensOut,
          costUsd,
          latencyMs,
        });

        // Save chat message if chatId provided
        if (chatId) {
          await prisma.message.createMany({
            data: [
              {
                chatId,
                role: "user",
                content: userQuery,
              },
              {
                chatId,
                role: "assistant",
                content: fullResponse,
              },
            ],
          });
        }

        // Store in RAG knowledge base (async, don't await)
        storeKnowledge(queryLog.id, userQuery, fullResponse).catch(
          console.error
        );
      },
    });

    // Return streaming response with headers
    return result.toDataStreamResponse({
      headers: {
        "X-Remaining-Queries": String(daily.remaining - 1),
        "X-Daily-Limit": String(daily.limit),
        "X-Complexity": complexity,
        "X-Model": config.modelId,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
