// components/chat/ShlokaCard.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShlokaCardProps {
  devanagari?: string;
  iast?: string;
  translation?: string;
  reference?: string;
  modernCorrelation?: string;
}

export function ShlokaCard({
  devanagari,
  iast,
  translation,
  reference,
  modernCorrelation,
}: ShlokaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = [devanagari, iast, translation, reference]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!devanagari && !iast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="shloka-card my-3"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-accent mt-0.5" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sanskrit Shloka
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-black/5 transition-colors"
        >
          {copied ? (
            <Check size={13} className="text-secondary" />
          ) : (
            <Copy size={13} className="text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Devanagari */}
      {devanagari && (
        <p className="devanagari text-foreground text-base leading-relaxed mb-2 border-b border-border pb-2">
          {devanagari}
        </p>
      )}

      {/* IAST */}
      {iast && (
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-0.5">
            Transliteration
          </span>
          <p className="text-sm italic text-muted-foreground">{iast}</p>
        </div>
      )}

      {/* Translation */}
      {translation && (
        <div className="mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide block mb-0.5">
            Translation
          </span>
          <p className="text-sm text-foreground">{translation}</p>
        </div>
      )}

      {/* Reference */}
      {reference && (
        <div className="mt-3 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <BookOpen size={11} />
            {reference}
          </span>
        </div>
      )}

      {/* Modern Correlation */}
      {modernCorrelation && (
        <div className="mt-3 pt-2 border-t border-border/50 bg-secondary/5 rounded-lg p-2">
          <span className="text-xs font-medium text-secondary uppercase tracking-wide block mb-1">
            🔬 Modern Correlation
          </span>
          <p className="text-xs text-muted-foreground">{modernCorrelation}</p>
        </div>
      )}
    </motion.div>
  );
}
