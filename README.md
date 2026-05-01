# 🌿 AyurAi — AI-Powered Ayurveda Knowledge Platform

> Ancient Wisdom, Modern Intelligence

AyurAi is a production-ready, full-stack Next.js 15 application. Chat with **Vaidya**, an AI trained on classical Ayurvedic texts — get authentic Sanskrit shlokas, Samhita references, and expert guidance in 6 Indian languages.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom Ayurvedic Theme |
| Auth | NextAuth.js v4 (Google OAuth) |
| Database | Supabase PostgreSQL + pgvector |
| ORM | Prisma 6 |
| Cache / Rate-limit | Upstash Redis |
| AI | Vercel AI SDK (Gemini Flash/Pro, GPT-4o, DeepSeek) |
| Payments | Razorpay |
| Ads | Google AdSense |
| i18n | next-intl (EN, HI, UR, MR, KN, TE) |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | Vercel |

---

## 📦 Project Structure

```
ayurai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Ayurvedic earthy theme
│   ├── auth/login/                 # Google OAuth login
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell + sidebar
│   │   ├── chat/                   # Main Vaidya chat
│   │   ├── history/                # Chat history
│   │   ├── pricing/                # Razorpay subscription
│   │   └── settings/               # Language + preferences
│   ├── admin/
│   │   ├── page.tsx                # Stats dashboard + charts
│   │   ├── users/                  # User management
│   │   ├── subscriptions/          # Paid plans
│   │   ├── ai-keys/                # API key rotation
│   │   ├── query-logs/             # Query + cost logs
│   │   └── adsense/                # Ad slot control
│   └── api/
│       ├── auth/nextauth/          # NextAuth handler
│       ├── chat/                   # Streaming AI endpoint
│       ├── subscription/{create,webhook}/
│       └── admin/{stats,users,ai-keys,query-logs}/
├── components/
│   ├── layout/                     # Sidebar, Language switcher, Avatar
│   ├── chat/                       # ChatInterface, ChatMessage, ShlokaCard, ChatInput
│   ├── admin/                      # AdminSidebar, AdminCharts, StatCard
│   └── ui/                         # Toaster (shadcn base)
├── lib/
│   ├── prisma.ts                   # Prisma singleton
│   ├── auth.ts                     # NextAuth config
│   ├── ai-router.ts                # Smart model selection
│   ├── rag.ts                      # pgvector RAG + query logging
│   ├── rate-limit.ts               # Upstash burst + daily quota
│   ├── razorpay.ts                 # Razorpay orders + verification
│   ├── utils.ts                    # cn, formatDate, extractShloka
│   └── i18n/                       # next-intl config
├── hooks/
│   └── useChatStore.ts             # Zustand chat state
├── types/
│   └── index.ts                    # Global types + plan config
├── messages/                       # i18n JSON (en, hi, ur, mr, kn, te)
└── prisma/
    ├── schema.prisma               # Full schema with pgvector
    └── seed.ts                     # Seed 5 Ayurveda knowledge chunks
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourname/ayurai.git
cd ayurai
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
# Fill in all values — see .env.example for details
```

**Required variables:**
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `DATABASE_URL` + `DIRECT_URL` — from Supabase
- `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — from Upstash
- `GOOGLE_GENERATIVE_AI_API_KEY` — from Google AI Studio (primary AI)
- `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — from Razorpay Dashboard
- `ADMIN_EMAIL` — your Google email for admin access

### 3. Supabase Setup
In Supabase SQL editor, enable pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Database Migration + Seed
```bash
npm run db:push      # Push schema to Supabase
npm run db:seed      # Seed 5 initial knowledge chunks
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🔐 Admin Access

1. Set `ADMIN_EMAIL=your@gmail.com` in `.env.local`
2. Sign in via Google with that email
3. Navigate to `/admin`

---

## 💳 Subscription Plans

| Plan | Price | Queries/day | Ads |
|---|---|---|---|
| FREE | ₹0 | 10 | Heavy |
| LITE | ₹49/mo • ₹249/3mo • ₹399/yr | 50 | Light |
| PRO | ₹99/mo • ₹499/6mo • ₹999/yr | Unlimited | None |

---

## 🤖 AI Router Logic

| Query Type | FREE/LITE | PRO |
|---|---|---|
| Simple | Gemini 2.0 Flash | Gemini 2.0 Flash |
| Moderate | Gemini 1.5 Pro | Gemini 1.5 Pro |
| Complex (shlokas) | Gemini Flash | GPT-4o |

Complex queries are detected by keywords: `shloka`, `samhita`, `charaka`, `reference`, `iast`, etc.

---

## 🌐 Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Add all env vars in Vercel dashboard. Set:
- Build command: `prisma generate && next build`
- Framework: Next.js

### Razorpay Webhook
Set webhook URL in Razorpay Dashboard:
```
https://yourdomain.com/api/subscription/webhook
```

---

## 📖 RAG Knowledge Base

Every user query + AI response is:
1. Stored in `QueryLog` table
2. Embedded using `text-embedding-004` (Gemini)
3. Stored in `KnowledgeChunk` with pgvector embedding
4. Retrieved via cosine similarity for future similar queries

This means the system **learns and improves** over time automatically.

---

## 🌿 Ayurvedic Response Format

Every Vaidya response includes:
```
## Answer        → Clear explanation
## Sanskrit Shloka    → Devanagari text
## IAST Transliteration → Romanized Sanskrit
## Translation   → English meaning
## Samhita Reference  → Exact citation
## Modern Correlation → (PRO only)
## Disclaimer    → Always present
```

---

## ⚠️ Disclaimer

This platform is for **educational purposes only**. It does not constitute medical advice. Always consult a qualified Ayurvedic physician (Vaidya) for treatment.

---

*Built with 🌿 by AyurAi Team*
