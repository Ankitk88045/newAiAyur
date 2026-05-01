// lib/i18n/config.ts
export const locales = ["en", "hi", "ur", "mr", "kn", "te"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  ur: "اردو",
  mr: "मराठी",
  kn: "ಕನ್ನಡ",
  te: "తెలుగు",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  hi: "🇮🇳",
  ur: "🇵🇰",
  mr: "🇮🇳",
  kn: "🇮🇳",
  te: "🇮🇳",
};
