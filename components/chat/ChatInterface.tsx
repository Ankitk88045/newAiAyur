// components/chat/ChatInterface.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/hooks/useChatStore";
import { ChatMessage as ChatMessageType } from "@/types";
import { AlertCircle, Leaf, Zap } from "lucide-react";
import Link from "next/link";

const EXAMPLE_QUERIES = [
  "What is Triphala and its Ayurvedic benefits?",
  "Explain Vata Dosha according to Charaka Samhita",
  "Shloka for Ashwagandha from Ashtanga Hridayam",
  "Ayurvedic treatment for insomnia (Anidra)",
  "What is Panchakarma and its five therapies?",
  "त्रिदोष सिद्धान्त क्या है?",
];

export function ChatInterface() {
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan || "FREE";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { remainingQueries, setRemainingQueries } = useChatStore();
  const [limitError, setLimitError] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
    error,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      const remaining = response.headers.get("X-Remaining-Queries");
      if (remaining) setRemainingQueries(parseInt(remaining));
      setLimitError(null);
    },
    onError: (err) => {
      if (err.message?.includes("limit")) {
        setLimitError(err.message);
      }
    },
  });

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (message: string) => {
    setInput(message);
    // Trigger submit on next tick
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as any;
      handleSubmit(fakeEvent, { body: { chatId: null } });
    }, 0);
  };

  // Direct send via example
  const sendExample = (query: string) => {
    setInput(query);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as any;
      handleSubmit(fakeEvent);
    }, 10);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Leaf size={16} className="text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-semibold text-foreground">Vaidya</h1>
            <p className="text-xs text-muted-foreground">Ayurveda AI Assistant</p>
          </div>
        </div>

        {/* Remaining queries */}
        <div className="flex items-center gap-2">
          {remainingQueries !== null && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              remainingQueries <= 2 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
            }`}>
              <Zap size={11} />
              {remainingQueries} left
            </div>
          )}
          {plan === "FREE" && (
            <Link
              href="/dashboard/pricing"
              className="text-xs bg-accent/10 text-accent-foreground hover:bg-accent/20 px-2 py-1 rounded-full transition-colors border border-accent/30"
            >
              Upgrade ↑
            </Link>
          )}
        </div>
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 overflow-y-auto custom-scroll px-4 py-6">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-10"
            >
              {/* Om symbol */}
              <div className="text-7xl mb-4 opacity-20 font-serif devanagari select-none">
                ॐ
              </div>
              <h2 className="font-serif text-2xl font-light text-foreground mb-2">
                Namaste! I am Vaidya
              </h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                Ask me anything about Ayurveda — herbs, doshas, shlokas,
                treatments, or Samhita references. I respond with authentic
                classical knowledge.
              </p>

              {/* Example queries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendExample(q)}
                    className="text-left text-xs bg-card border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={{
                    id: msg.id,
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                    createdAt: new Date(),
                  }}
                />
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Leaf size={14} className="text-primary" />
                  </div>
                  <div className="chat-bubble-ai flex items-center gap-1 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      Vaidya is contemplating...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Limit error */}
        <AnimatePresence>
          {limitError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3 mt-4 text-sm text-destructive"
            >
              <AlertCircle size={16} />
              <span>{limitError}</span>
              <Link href="/dashboard/pricing" className="ml-auto underline font-medium">
                Upgrade
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Google AdSense (Free plan) */}
      {plan === "FREE" && process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <div className="px-4 py-2 border-t border-border">
          <ins
            className="adsbygoogle block"
            style={{ display: "block", textAlign: "center" }}
            data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
            data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CHAT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e, { body: { chatId: null } });
          }}
        >
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            disabled={!!limitError}
            placeholder="Ask about herbs, doshas, treatments, shlokas..."
          />
        </form>
      </div>
    </div>
  );
}
