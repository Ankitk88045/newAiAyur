// lib/ai-router.ts
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenAI } from "@ai-sdk/openai";
import { AIProvider, Plan, QueryComplexity } from "@prisma/client";
import prisma from "@/lib/prisma";

// ─── Complexity Detection ──────────────────────────────────
const COMPLEX_KEYWORDS = [
  "shloka", "श्लोक", "samhita", "संहिता", "charaka", "sushruta",
  "ashtanga", "classical", "reference", "verse", "adhyaya", "sthana",
  "nidana", "chikitsa", "modern medicine", "correlation", "pharmacology",
  "pathogenesis", "differential", "compare",
];

const SIMPLE_KEYWORDS = [
  "what is", "क्या है", "benefits", "फायदे", "how to", "कैसे",
  "symptoms", "recipe", "diet", "food", "herb",
];

export function detectComplexity(query: string): QueryComplexity {
  const lower = query.toLowerCase();
  const complexScore = COMPLEX_KEYWORDS.filter((k) =>
    lower.includes(k)
  ).length;
  const simpleScore = SIMPLE_KEYWORDS.filter((k) =>
    lower.includes(k)
  ).length;

  if (complexScore >= 2 || (complexScore >= 1 && query.length > 150)) {
    return "COMPLEX";
  }
  if (complexScore === 1 || query.length > 80) return "MODERATE";
  return "SIMPLE";
}

// ─── Model Selection ──────────────────────────────────────
interface ModelConfig {
  provider: AIProvider;
  modelId: string;
  costPer1kTokens: number; // USD
}

const MODEL_CONFIGS: Record<QueryComplexity, Record<Plan, ModelConfig>> = {
  SIMPLE: {
    FREE: {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash",
      costPer1kTokens: 0.000075,
    },
    LITE: {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash",
      costPer1kTokens: 0.000075,
    },
    PRO: {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash",
      costPer1kTokens: 0.000075,
    },
  },
  MODERATE: {
    FREE: {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash",
      costPer1kTokens: 0.000075,
    },
    LITE: {
      provider: "GEMINI",
      modelId: "gemini-1.5-pro",
      costPer1kTokens: 0.00125,
    },
    PRO: {
      provider: "GEMINI",
      modelId: "gemini-1.5-pro",
      costPer1kTokens: 0.00125,
    },
  },
  COMPLEX: {
    FREE: {
      provider: "GEMINI",
      modelId: "gemini-2.0-flash",
      costPer1kTokens: 0.000075,
    },
    LITE: {
      provider: "GEMINI",
      modelId: "gemini-1.5-pro",
      costPer1kTokens: 0.00125,
    },
    PRO: {
      provider: "OPENAI",
      modelId: "gpt-4o",
      costPer1kTokens: 0.005,
    },
  },
};

// ─── Get Active API Key ───────────────────────────────────
async function getApiKey(provider: AIProvider): Promise<string | null> {
  try {
    const key = await prisma.aIKey.findFirst({
      where: { provider, isActive: true },
      orderBy: { usageCount: "asc" },
    });
    if (key) {
      await prisma.aIKey.update({
        where: { id: key.id },
        data: { usageCount: { increment: 1 } },
      });
      return key.keyValue;
    }
  } catch {}

  // Fallback to env
  const envKeys: Record<AIProvider, string | undefined> = {
    GEMINI: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    OPENAI: process.env.OPENAI_API_KEY,
    DEEPSEEK: process.env.DEEPSEEK_API_KEY,
    ANTHROPIC: process.env.ANTHROPIC_API_KEY,
  };
  return envKeys[provider] || null;
}

// ─── Build AI Model Instance ──────────────────────────────
export async function getAIModel(complexity: QueryComplexity, plan: Plan) {
  const config = MODEL_CONFIGS[complexity][plan];

  switch (config.provider) {
    case "GEMINI": {
      const apiKey = await getApiKey("GEMINI");
      if (apiKey) process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
      return {
        model: google(config.modelId),
        config,
      };
    }
    case "OPENAI": {
      const apiKey = await getApiKey("OPENAI");
      if (apiKey) process.env.OPENAI_API_KEY = apiKey;
      return { model: openai(config.modelId), config };
    }
    case "DEEPSEEK": {
      const apiKey = await getApiKey("DEEPSEEK");
      const deepseek = createOpenAI({
        baseURL: "https://api.deepseek.com/v1",
        apiKey: apiKey || process.env.DEEPSEEK_API_KEY || "",
      });
      return {
        model: deepseek(config.modelId || "deepseek-chat"),
        config,
      };
    }
    default: {
      const apiKey = await getApiKey("GEMINI");
      if (apiKey) process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
      return {
        model: google("gemini-2.0-flash"),
        config: MODEL_CONFIGS.SIMPLE.FREE,
      };
    }
  }
}

// ─── System Prompt Builder ────────────────────────────────
export function buildSystemPrompt(language: string, plan: Plan): string {
  const langInstruction: Record<string, string> = {
    en: "Respond in English.",
    hi: "हिंदी में उत्तर दें।",
    ur: "اردو میں جواب دیں۔",
    mr: "मराठीत उत्तर द्या.",
    kn: "ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.",
    te: "తెలుగులో సమాధానం ఇవ్వండి.",
  };

  const includeModern = plan === "PRO" || plan === "LITE";

  return `You are Vaidya, an expert AI assistant specializing in Ayurveda with deep knowledge of classical Sanskrit texts.

${langInstruction[language] || langInstruction.en}

RESPONSE FORMAT (strictly follow this structure):

## Answer
[Clear, accurate answer in the user's language]

## Sanskrit Shloka
[Relevant Sanskrit shloka in Devanagari script if applicable]

## IAST Transliteration
[IAST transliteration of the shloka]

## Translation
[Accurate English/language translation of the shloka]

## Samhita Reference
[Exact reference: Book Name, Sthana, Adhyaya, Shloka number]
Example: Charaka Samhita, Sutra Sthana, Adhyaya 1, Shloka 15

${includeModern ? `## Modern Correlation
[Modern biomedical/pharmacological correlation if relevant]` : ""}

## Disclaimer
*This information is for educational purposes only. Consult a qualified Ayurvedic physician (Vaidya) before starting any treatment.*

RULES:
- Always cite from authentic Samhitas: Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam, Ashtanga Sangraha, Madhava Nidana, Sharangadhara Samhita
- If no direct shloka exists, mention that and explain from Ayurvedic principles
- Never make up shlokas or fake references
- Be compassionate, clear, and educational
- Mention both Sanskrit terms and their meanings`;
}
