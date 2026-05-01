// lib/rag.ts
import prisma from "@/lib/prisma";

// Simple embedding using Gemini (can swap to OpenAI)
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: text.slice(0, 2000) }] },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.embedding?.values || null;
  } catch {
    return null;
  }
}

// Search similar knowledge chunks
export async function searchKnowledge(
  query: string,
  limit = 3
): Promise<string> {
  try {
    const embedding = await generateEmbedding(query);
    if (!embedding) return "";

    // pgvector cosine similarity search
    const results = await prisma.$queryRaw<
      { content: string; title: string; reference: string | null }[]
    >`
      SELECT content, title, reference
      FROM "KnowledgeChunk"
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(embedding)}::vector
      LIMIT ${limit}
    `;

    if (!results.length) return "";

    return (
      "\n\nRELEVANT KNOWLEDGE BASE:\n" +
      results
        .map(
          (r, i) =>
            `[${i + 1}] ${r.title}${r.reference ? ` (${r.reference})` : ""}: ${r.content.slice(0, 300)}`
        )
        .join("\n")
    );
  } catch {
    return "";
  }
}

// Store query+response in knowledge base
export async function storeKnowledge(
  queryLogId: string,
  query: string,
  response: string,
  shloka?: string,
  reference?: string
) {
  try {
    const embedding = await generateEmbedding(query + " " + response.slice(0, 500));

    await prisma.knowledgeChunk.create({
      data: {
        queryLogId,
        source: "user_query",
        title: query.slice(0, 100),
        content: response.slice(0, 1000),
        shloka: shloka || null,
        reference: reference || null,
        ...(embedding
          ? {
              embedding: `[${embedding.join(",")}]` as any,
            }
          : {}),
      },
    });
  } catch (err) {
    console.error("RAG store error:", err);
  }
}

// Log query to DB
export async function logQuery(params: {
  userId: string;
  query: string;
  response: string;
  language: string;
  complexity: "SIMPLE" | "MODERATE" | "COMPLEX";
  provider: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
}) {
  return prisma.queryLog.create({
    data: {
      userId: params.userId,
      query: params.query,
      response: params.response,
      language: params.language,
      complexity: params.complexity as any,
      provider: params.provider as any,
      model: params.model,
      tokensIn: params.tokensIn,
      tokensOut: params.tokensOut,
      costUsd: params.costUsd,
      latencyMs: params.latencyMs,
    },
  });
}
