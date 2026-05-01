// components/layout/LanguageSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/lib/i18n/config";
import { Globe } from "lucide-react";
import { useState } from "react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleChange = (newLocale: Locale) => {
    setOpen(false);
    const segments = pathname.split("/");
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/") || "/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
      >
        <Globe size={13} />
        <span>{localeFlags[locale]} {localeNames[locale]}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                loc === locale
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span>{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
