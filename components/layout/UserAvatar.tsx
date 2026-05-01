// components/layout/UserAvatar.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const sizes = { sm: 32, md: 40, lg: 56 };
  const px = sizes[size];
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const sizeClass = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

  if (src) {
    return (
      <Image
        src={src}
        alt={name || "User"}
        width={px}
        height={px}
        className={cn("rounded-full object-cover ring-2 ring-border", sizeClass[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary/20 flex items-center justify-center font-medium text-primary ring-2 ring-border",
        sizeClass[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
