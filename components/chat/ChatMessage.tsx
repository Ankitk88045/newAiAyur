// components/chat/ChatMessage.tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType } from "@/types";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { ShlokaCard } from "./ShlokaCard";
import { extractShloka } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Leaf } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { data: session } = useSession();
  const isUser = message.role === "user";
  const shloka = !isUser ? extractShloka(message.content) : null;

  // Remove shloka sections from main content for AI messages
  const cleanContent = isUser
    ? message.content
    : message.content
        .replace(/## Sanskrit Shloka[\s\S]*?(?=##|$)/, "")
        .replace(/## IAST Transliteration[\s\S]*?(?=##|$)/, "")
        .replace(/## Translation\n[\s\S]*?(?=##|$)/, "")
        .replace(/## Samhita Reference[\s\S]*?(?=##|$)/, "")
        .replace(/## Modern Correlation[\s\S]*?(?=##|$)/, "")
        .trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {isUser ? (
        <UserAvatar
          src={session?.user?.image}
          name={session?.user?.name}
          size="sm"
          className="flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Leaf size={14} className="text-primary" />
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {isUser ? (
          <div className="chat-bubble-user">
            {message.content}
          </div>
        ) : (
          <div className="chat-bubble-ai w-full">
            <div className="ai-prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold text-primary mt-3 mb-1 border-b border-border/50 pb-1 font-serif">
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-foreground leading-relaxed mb-2">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-sm text-foreground ml-4 list-disc mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  em: ({ children }) => (
                    <em className="italic text-muted-foreground">{children}</em>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent pl-3 text-muted-foreground italic my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {cleanContent}
              </ReactMarkdown>
            </div>

            {/* Shloka Card */}
            {shloka && (
              <ShlokaCard
                devanagari={shloka.devanagari}
                iast={shloka.iast}
                translation={shloka.translation}
                reference={shloka.reference}
              />
            )}

            {/* Disclaimer */}
            {message.content.includes("educational purposes") && (
              <p className="text-xs text-muted-foreground/70 mt-3 pt-2 border-t border-border/30 italic">
                ⚠️ For educational purposes only. Consult a qualified Vaidya for treatment.
              </p>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground/50 mt-1 px-1">
          {new Date(message.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
