// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function truncate(str: string, length = 100): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function extractShloka(text: string): {
  devanagari?: string;
  iast?: string;
  translation?: string;
  reference?: string;
} | null {
  // Parse structured AI response for shloka metadata
  const shlokaMatch = text.match(/## Sanskrit Shloka\n([\s\S]*?)(?=##|$)/);
  const iastMatch = text.match(/## IAST Transliteration\n([\s\S]*?)(?=##|$)/);
  const translationMatch = text.match(/## Translation\n([\s\S]*?)(?=##|$)/);
  const referenceMatch = text.match(/## Samhita Reference\n([\s\S]*?)(?=##|$)/);

  if (!shlokaMatch) return null;

  return {
    devanagari: shlokaMatch[1]?.trim(),
    iast: iastMatch?.[1]?.trim(),
    translation: translationMatch?.[1]?.trim(),
    reference: referenceMatch?.[1]?.trim(),
  };
}

export function getPlanColor(plan: string) {
  return {
    FREE: "text-slate-500 bg-slate-100",
    LITE: "text-amber-700 bg-amber-100",
    PRO: "text-emerald-700 bg-emerald-100",
  }[plan] || "text-slate-500 bg-slate-100";
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
