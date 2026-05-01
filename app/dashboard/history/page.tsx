// app/dashboard/history/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate, truncate } from "@/lib/utils";
import { MessageSquare, ChevronRight, Clock } from "lucide-react";

export const metadata = { title: "Chat History" };

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: "asc" },
        where: { role: "user" },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scroll">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-foreground mb-1">Chat History</h1>
          <p className="text-sm text-muted-foreground">
            {chats.length} conversation{chats.length !== 1 ? "s" : ""}
          </p>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20 devanagari">ॐ</div>
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Link
              href="/dashboard/chat"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start a Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/chat?id=${chat.id}`}
                className="flex items-center gap-4 bg-card hover:bg-muted border border-border rounded-xl px-4 py-4 transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {chat.title !== "New Chat"
                      ? chat.title
                      : chat.messages[0]?.content
                      ? truncate(chat.messages[0].content, 60)
                      : "New Chat"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={11} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(chat.updatedAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {chat._count.messages} messages
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
