// app/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SUBSCRIPTION_PLANS } from "@/types";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard/chat");

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-serif text-xl font-semibold text-primary">AyurAi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground border border-accent/30 px-4 py-1.5 rounded-full text-sm mb-8">
          <span>✨</span>
          <span>AI-Powered Ayurveda Knowledge</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-light text-foreground mb-6 leading-tight">
          Ancient Wisdom,{" "}
          <em className="text-primary not-italic">Modern Intelligence</em>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Chat with Vaidya — our AI that speaks fluent Ayurveda. Get authentic
          Sanskrit shlokas, Samhita references, and expert guidance in Hindi,
          English, Urdu, Marathi, Kannada & Telugu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/auth/login"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Start for Free →
          </Link>
          <Link
            href="#features"
            className="border border-border px-8 py-4 rounded-xl text-base text-foreground hover:bg-muted transition-all"
          >
            Learn More
          </Link>
        </div>

        {/* Sample Shloka */}
        <div className="shloka-card max-w-2xl mx-auto text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sample Response
            </span>
            <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
              Charaka Samhita
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Q: What are the properties of Ashwagandha?
          </p>
          <p className="devanagari text-foreground mb-2">
            बल्यं च मेध्यं रसायनं च वातव्याधिहरं पुनः।
          </p>
          <p className="text-sm text-muted-foreground italic mb-1">
            balyaṃ ca medhyaṃ rasāyanaṃ ca vātavyādhiharaṃ punaḥ
          </p>
          <p className="text-sm text-foreground">
            "It is strength-promoting, intellect-enhancing, rejuvenating, and
            destroys diseases caused by Vata dosha."
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            — Charaka Samhita, Chikitsa Sthana 1.3.18
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-center mb-16 text-foreground">
          What makes Vaidya different?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📖",
              title: "Authentic Samhita References",
              desc: "Every answer backed by Charaka Samhita, Sushruta Samhita, Ashtanga Hridayam with exact chapter & shloka numbers.",
            },
            {
              icon: "🕉️",
              title: "Sanskrit Shlokas",
              desc: "Original Devanagari text with IAST transliteration and accurate translations for every relevant shloka.",
            },
            {
              icon: "🌍",
              title: "6 Indian Languages",
              desc: "Get answers in Hindi, English, Urdu, Marathi, Kannada, and Telugu — in your mother tongue.",
            },
            {
              icon: "🔬",
              title: "Modern Correlations",
              desc: "Pro users get biomedical correlations linking Ayurvedic concepts to modern pharmacology and medicine.",
            },
            {
              icon: "🧠",
              title: "Smart AI Router",
              desc: "Simple queries use fast models. Complex shloka lookup uses powerful models. Always optimal.",
            },
            {
              icon: "🔒",
              title: "Private & Secure",
              desc: "No data sold. Internal use only. Your health queries stay private.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl text-center mb-4 text-foreground">
          Simple, honest pricing
        </h2>
        <p className="text-center text-muted-foreground mb-16">
          All plans include authentic Ayurveda knowledge
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-8 ${
                plan.name === "PRO"
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.name === "PRO" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-1">
                {plan.name === "FREE" ? "Free" : plan.name === "LITE" ? "Lite" : "Pro"}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price.monthly === 0 ? "₹0" : `₹${plan.price.monthly}`}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-secondary mt-0.5">✓</span>
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                className={`block text-center py-3 rounded-xl text-sm font-medium transition-all ${
                  plan.name === "PRO"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.price.monthly === 0 ? "Start Free" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌿</span>
            <span className="font-serif text-foreground">AyurAi</span>
            <span className="text-muted-foreground text-sm">— Ancient Wisdom, Modern Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For educational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
