// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: {
    default: "AyurAi — Ancient Wisdom, Modern Intelligence",
    template: "%s | AyurAi",
  },
  description:
    "AI-powered Ayurveda knowledge platform with authentic Sanskrit shlokas, Samhita references, and expert guidance in 6 Indian languages.",
  keywords: ["Ayurveda", "Sanskrit", "Charaka", "Sushruta", "Herbal", "AI", "Vaidya"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "AyurAi",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="grain">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
